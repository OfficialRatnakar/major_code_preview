import Course from "../models/Course.js"
import { CourseProgress } from "../models/CourseProgress.js"
import { Purchase } from "../models/Purchase.js"
import User from "../models/User.js"
import stripe from "stripe"
import { clerkClient } from "@clerk/express"



// Get User Data
export const getUserData = async (req, res) => {
    try {
        const userId = req.auth.userId
        console.log("Getting user data for ID:", userId);

        // Try to find the user in our database
        let user = await User.findById(userId)

        // If user doesn't exist in our database but exists in Clerk, create them
        if (!user) {
            console.log("User not found in DB, checking Clerk...");
            try {
                // Get user data from Clerk
                const clerkUser = await clerkClient.users.getUser(userId);
                console.log("Found user in Clerk:", clerkUser.id);
                
                // Create user in our database
                const userData = {
                    _id: clerkUser.id,
                    email: clerkUser.emailAddresses[0].emailAddress,
                    name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
                    imageUrl: clerkUser.imageUrl,
                    resume: ''
                };
                
                console.log("Creating user in database:", userData);
                user = await User.create(userData);
                console.log("User created successfully");
            } catch (clerkError) {
                console.error("Error fetching/creating user from Clerk:", clerkError);
                return res.status(404).json({ success: false, message: 'User not found in Clerk or database' });
            }
        }

        res.json({ success: true, user })

    } catch (error) {
        console.error("Error in getUserData:", error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// Purchase Course 
export const purchaseCourse = async (req, res) => {

    try {

        const { courseId } = req.body
        const { origin } = req.headers


        const userId = req.auth.userId

        const courseData = await Course.findById(courseId)
        const userData = await User.findById(userId)

        if (!userData || !courseData) {
            return res.json({ success: false, message: 'Data Not Found' })
        }

        const purchaseData = {
            courseId: courseData._id,
            userId,
            amount: (courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2),
        }

        const newPurchase = await Purchase.create(purchaseData)

        // Stripe Gateway Initialize
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)

        const currency = process.env.CURRENCY.toLocaleLowerCase()

        // Creating line items to for Stripe
        const line_items = [{
            price_data: {
                currency,
                product_data: {
                    name: courseData.courseTitle
                },
                unit_amount: Math.floor(newPurchase.amount) * 100
            },
            quantity: 1
        }]

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-enrollments`,
            cancel_url: `${origin}/`,
            line_items: line_items,
            mode: 'payment',
            metadata: {
                purchaseId: newPurchase._id.toString()
            }
        })

        res.json({ success: true, session_url: session.url });


    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Users Enrolled Courses With Lecture Links
export const userEnrolledCourses = async (req, res) => {
    try {
        const userId = req.auth.userId;
        console.log(`Fetching enrolled courses for user: ${userId}`);

        const userData = await User.findById(userId);
        
        if (!userData) {
            console.error(`User not found with ID: ${userId}`);
            return res.status(404).json({ 
                success: false, 
                message: 'User not found',
                courses: [] 
            });
        }
        
        // Make sure enrolledCourses exists
        if (!userData.enrolledCourses) {
            console.log(`User ${userId} has no enrolledCourses property`);
            return res.json({ 
                success: true, 
                message: 'No enrolled courses found',
                courses: [] 
            });
        }
        
        // Populate enrolled courses
        await userData.populate('enrolledCourses');
        
        const courses = userData.enrolledCourses || [];
        console.log(`Found ${courses.length} enrolled courses for user ${userId}`);
        
        res.json({ 
            success: true, 
            courses: courses,
            count: courses.length
        });
    } catch (error) {
        console.error('Error in userEnrolledCourses:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message,
            courses: [] 
        });
    }
}

// Update User Course Progress
export const updateUserCourseProgress = async (req, res) => {

    try {

        const userId = req.auth.userId

        const { courseId, lectureId } = req.body

        const progressData = await CourseProgress.findOne({ userId, courseId })

        if (progressData) {

            if (progressData.lectureCompleted.includes(lectureId)) {
                return res.json({ success: true, message: 'Lecture Already Completed' })
            }

            progressData.lectureCompleted.push(lectureId)
            await progressData.save()

        } else {

            await CourseProgress.create({
                userId,
                courseId,
                lectureCompleted: [lectureId]
            })

        }

        res.json({ success: true, message: 'Progress Updated' })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

// get User Course Progress
export const getUserCourseProgress = async (req, res) => {

    try {

        const userId = req.auth.userId

        const { courseId } = req.body

        const progressData = await CourseProgress.findOne({ userId, courseId })

        res.json({ success: true, progressData })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

// Get User Quiz Results
export const getUserQuizResults = async (req, res) => {
    try {
        const userId = req.auth.userId;
        console.log(`Fetching quiz results for user: ${userId}`);

        // Import the Quiz model
        const Quiz = await import("../models/Quiz.js").then(module => module.default);
        
        // Find all quizzes that have attempts by this user
        const quizzes = await Quiz.find({
            "attempts.userId": userId
        }).populate('courseId', 'courseTitle');
        
        if (!quizzes || quizzes.length === 0) {
            console.log(`No quiz attempts found for user ${userId}`);
            return res.json({
                success: true,
                quizResults: []
            });
        }
        
        // Extract this user's attempts from each quiz
        const quizResults = quizzes.map(quiz => {
            const userAttempt = quiz.attempts.find(attempt => attempt.userId === userId);
            if (!userAttempt) return null;
            
            const percentage = (userAttempt.score / userAttempt.maxScore) * 100;
            const passed = percentage >= quiz.passingScore;
            
            return {
                quizId: quiz._id,
                quizTitle: quiz.title,
                courseName: quiz.courseId ? quiz.courseId.courseTitle : 'Unknown Course',
                courseId: quiz.courseId ? quiz.courseId._id : null,
                score: userAttempt.score,
                maxScore: userAttempt.maxScore,
                percentage: percentage,
                passed: passed,
                completedAt: userAttempt.completedAt
            };
        }).filter(Boolean);
        
        console.log(`Found ${quizResults.length} quiz results for user ${userId}`);
        
        // Sort by completion date (newest first)
        quizResults.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
        
        res.json({
            success: true,
            quizResults
        });
    } catch (error) {
        console.error("Error fetching quiz results:", error);
        res.status(500).json({
            success: false,
            message: error.message,
            quizResults: []
        });
    }
}

// Add User Ratings to Course
export const addUserRating = async (req, res) => {

    const userId = req.auth.userId;
    const { courseId, rating } = req.body;

    // Validate inputs
    if (!courseId || !userId || !rating || rating < 1 || rating > 5) {
        return res.json({ success: false, message: 'InValid Details' });
    }

    try {
        // Find the course by ID
        const course = await Course.findById(courseId);

        if (!course) {
            return res.json({ success: false, message: 'Course not found.' });
        }

        const user = await User.findById(userId);

        if (!user || !user.enrolledCourses.includes(courseId)) {
            return res.json({ success: false, message: 'User has not purchased this course.' });
        }

        // Check is user already rated
        const existingRatingIndex = course.courseRatings.findIndex(r => r.userId === userId);

        if (existingRatingIndex > -1) {
            // Update the existing rating
            course.courseRatings[existingRatingIndex].rating = rating;
        } else {
            // Add a new rating
            course.courseRatings.push({ userId, rating });
        }

        await course.save();

        return res.json({ success: true, message: 'Rating added' });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Get User Dashboard Data
export const getUserDashboardData = async (req, res) => {
    try {
        console.log("Starting getUserDashboardData...");
        const userId = req.auth.userId;
        console.log("User ID:", userId);

        // Get user data
        const userData = await User.findById(userId);
        if (!userData) {
            console.error("User not found for ID:", userId);
            return res.json({ success: false, message: 'User not found' });
        }
        
        console.log("User found:", userData.name);
        console.log("Enrolled courses count:", userData.enrolledCourses?.length || 0);

        // Get detailed course information for all enrolled courses
        const enrolledCourses = [];
        let totalProgress = 0;
        let completedCourses = 0;
        const recentActivity = [];

        // Check if user has any enrolled courses
        if (!userData.enrolledCourses || userData.enrolledCourses.length === 0) {
            console.log("No enrolled courses found for user");
            return res.json({ 
                success: true, 
                dashboardData: {
                    enrolledCourses: [],
                    completedCourses: 0,
                    totalProgress: 0,
                    recentActivity: []
                } 
            });
        }

        // Get complete course details for each enrolled course
        for (const courseId of userData.enrolledCourses) {
            try {
                console.log("Processing course ID:", courseId);
                // Fetch the full course data
                const courseData = await Course.findById(courseId).lean();
                
                if (!courseData) {
                    console.log(`Course not found for ID: ${courseId}`);
                    continue;
                }
                
                console.log(`Found course: ${courseData.courseTitle}`);
                
                // Get progress for this course
                const progressData = await CourseProgress.findOne({ 
                    userId, 
                    courseId: courseId.toString() 
                });
                
                // Calculate progress percentage
                let progress = 0;
                let totalLectures = 0;
                
                // Check if courseContent exists
                if (courseData.courseContent && Array.isArray(courseData.courseContent)) {
                    courseData.courseContent.forEach(chapter => {
                        if (chapter && chapter.chapterContent && Array.isArray(chapter.chapterContent)) {
                            totalLectures += chapter.chapterContent.length;
                        }
                    });
                }
                
                const completedLectures = progressData && progressData.lectureCompleted 
                    ? progressData.lectureCompleted.length 
                    : 0;
                
                if (totalLectures > 0) {
                    progress = Math.round((completedLectures / totalLectures) * 100);
                }
                
                console.log(`Course progress: ${progress}%, Completed lectures: ${completedLectures}/${totalLectures}`);
                
                // Add to enrolled courses with progress
                enrolledCourses.push({
                    _id: courseData._id,
                    courseTitle: courseData.courseTitle,
                    courseDescription: courseData.courseDescription,
                    courseThumbnail: courseData.courseThumbnail,
                    coursePrice: courseData.coursePrice,
                    discount: courseData.discount,
                    progress,
                    educator: courseData.educator,
                    chapterCount: courseData.courseContent?.length || 0,
                    lectureCount: totalLectures,
                    courseContent: courseData.courseContent || [], // Include full course content for preview functionality
                    courseRatings: courseData.courseRatings || [],
                    updatedAt: courseData.updatedAt,
                    createdAt: courseData.createdAt
                });
                
                // Sum up progress for overall calculation
                totalProgress += progress;
                
                // Check if course is completed
                if (progress === 100) {
                    completedCourses++;
                }
                
                // Add latest activity if available
                if (progressData && progressData.lectureCompleted && progressData.lectureCompleted.length > 0 && progressData.updatedAt) {
                    try {
                        // Find the last completed lecture
                        const lastLectureId = progressData.lectureCompleted[progressData.lectureCompleted.length - 1];
                        
                        // Find lecture details
                        let lectureTitleFound = false;
                        let lectureTitle = 'Unknown lecture';
                        let chapterTitle = 'Unknown chapter';
                        
                        if (courseData.courseContent && Array.isArray(courseData.courseContent)) {
                            for (const chapter of courseData.courseContent) {
                                if (chapter && chapter.chapterContent && Array.isArray(chapter.chapterContent)) {
                                    for (const lecture of chapter.chapterContent) {
                                        if (lecture && lecture.lectureId === lastLectureId) {
                                            lectureTitle = lecture.lectureTitle || 'Untitled lecture';
                                            chapterTitle = chapter.chapterTitle || 'Untitled chapter';
                                            lectureTitleFound = true;
                                            break;
                                        }
                                    }
                                }
                                if (lectureTitleFound) break;
                            }
                        }
                        
                        recentActivity.push({
                            courseId: courseData._id,
                            courseTitle: courseData.courseTitle,
                            title: `Completed lecture: ${lectureTitle}`,
                            subtitle: `Chapter: ${chapterTitle}`,
                            date: progressData.updatedAt.toLocaleDateString(),
                            timestamp: progressData.updatedAt,
                        });
                    } catch (activityError) {
                        console.error(`Error processing activity for course ${courseId}:`, activityError);
                        // Add basic activity entry if details can't be found
                        recentActivity.push({
                            courseId: courseData._id,
                            courseTitle: courseData.courseTitle,
                            title: `Made progress in course`,
                            date: progressData.updatedAt.toLocaleDateString(),
                            timestamp: progressData.updatedAt,
                        });
                    }
                }
            } catch (err) {
                console.error(`Error processing course ${courseId}:`, err);
                // Continue with other courses even if one fails
            }
        }
        
        // Calculate overall progress average
        const overallProgress = userData.enrolledCourses.length > 0 
            ? Math.round(totalProgress / userData.enrolledCourses.length) 
            : 0;
        
        // Sort activities by date (newest first) and handle cases where timestamp might be missing
        recentActivity.sort((a, b) => {
            if (!a.timestamp) return 1;
            if (!b.timestamp) return -1;
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        // Limit to 5 most recent activities
        const limitedActivity = recentActivity.slice(0, 5);
        
        console.log("Dashboard data prepared successfully");
        console.log(`Enrolled courses: ${enrolledCourses.length}, Completed: ${completedCourses}, Progress: ${overallProgress}%`);
        
        res.json({ 
            success: true, 
            dashboardData: {
                enrolledCourses,
                completedCourses,
                totalProgress: overallProgress,
                recentActivity: limitedActivity
            } 
        });
        
    } catch (error) {
        console.error("Error in getUserDashboardData:", error);
        res.json({ success: false, message: error.message });
    }
};

// Get User Courses Progress
export const getUserCoursesProgress = async (req, res) => {
    try {
        console.log("Starting getUserCoursesProgress...");
        const userId = req.auth.userId;
        console.log("User ID:", userId);

        // Get user data with enrolled courses
        const userData = await User.findById(userId);

        if (!userData) {
            console.error("User not found for ID:", userId);
            return res.json({ success: false, message: 'User not found' });
        }
        
        console.log("User found, enrolled courses count:", userData.enrolledCourses?.length || 0);
        
        if (!userData.enrolledCourses || userData.enrolledCourses.length === 0) {
            console.log("No enrolled courses found for user");
            return res.json({ 
                success: true, 
                coursesProgress: [] 
            });
        }

        const coursesProgress = [];

        // Process each enrolled course
        for (const courseId of userData.enrolledCourses) {
            try {
                console.log("Processing course ID:", courseId);
                const courseData = await Course.findById(courseId);
                
                if (!courseData) {
                    console.log(`Course not found for ID: ${courseId}`);
                    continue;
                }
                
                console.log(`Found course: ${courseData.courseTitle}`);
                
                // Get progress for this course
                const progressData = await CourseProgress.findOne({ 
                    userId, 
                    courseId: courseId.toString() 
                });
                
                const completedLectures = progressData && progressData.lectureCompleted 
                    ? progressData.lectureCompleted 
                    : [];
                
                // Calculate overall progress
                let totalLectures = 0;
                
                // Check if courseContent exists and is valid
                if (!courseData.courseContent || !Array.isArray(courseData.courseContent)) {
                    console.log(`Course ${courseId} has no valid content structure`);
                    continue;
                }
                
                courseData.courseContent.forEach(chapter => {
                    if (chapter && chapter.chapterContent && Array.isArray(chapter.chapterContent)) {
                        totalLectures += chapter.chapterContent.length;
                    }
                });
                
                const overallProgress = totalLectures > 0 
                    ? Math.round((completedLectures.length / totalLectures) * 100) 
                    : 0;
                
                // Process chapters progress
                const chaptersProgress = courseData.courseContent.map(chapter => {
                    // Check if chapter has valid content
                    if (!chapter || !chapter.chapterContent || !Array.isArray(chapter.chapterContent)) {
                        return {
                            chapterId: chapter?.chapterId || 'unknown',
                            chapterTitle: chapter?.chapterTitle || 'Unknown Chapter',
                            chapterOrder: chapter?.chapterOrder || 0,
                            progress: 0,
                            lectures: [],
                            totalLectures: 0,
                            completedLectures: 0
                        };
                    }
                    
                    const lectures = chapter.chapterContent.map(lecture => {
                        // Validate lecture object
                        if (!lecture) return null;
                        
                        return {
                            lectureId: lecture.lectureId || 'unknown',
                            lectureTitle: lecture.lectureTitle || 'Untitled Lecture',
                            completed: lecture.lectureId && completedLectures.includes(lecture.lectureId),
                            lectureDuration: lecture.lectureDuration || 0,
                            lectureOrder: lecture.lectureOrder || 0
                        };
                    }).filter(Boolean); // Remove null values
                    
                    // Calculate chapter progress
                    const totalChapterLectures = lectures.length;
                    const completedChapterLectures = lectures.filter(l => l.completed).length;
                    const chapterProgress = totalChapterLectures > 0 
                        ? Math.round((completedChapterLectures / totalChapterLectures) * 100) 
                        : 0;
                    
                    return {
                        chapterId: chapter.chapterId || 'unknown',
                        chapterTitle: chapter.chapterTitle || 'Untitled Chapter',
                        chapterOrder: chapter.chapterOrder || 0,
                        progress: chapterProgress,
                        lectures,
                        totalLectures: totalChapterLectures,
                        completedLectures: completedChapterLectures
                    };
                }).filter(chapter => chapter.chapterId !== 'unknown'); // Filter out invalid chapters
                
                // Sort chapters by order
                chaptersProgress.sort((a, b) => a.chapterOrder - b.chapterOrder);
                
                // Sort lectures within each chapter by order
                chaptersProgress.forEach(chapter => {
                    if (chapter.lectures && Array.isArray(chapter.lectures)) {
                        chapter.lectures.sort((a, b) => a.lectureOrder - b.lectureOrder);
                    }
                });
                
                coursesProgress.push({
                    courseId: courseData._id,
                    courseTitle: courseData.courseTitle || 'Untitled Course',
                    courseThumbnail: courseData.courseThumbnail || '',
                    overallProgress,
                    chaptersProgress,
                    totalLectures,
                    completedLecturesCount: completedLectures.length,
                    chaptersCount: courseData.courseContent.length,
                    lastUpdated: progressData ? progressData.updatedAt : null,
                    lectureCount: totalLectures
                });
                
                console.log(`Processed course ${courseData.courseTitle}: ${overallProgress}% complete`);
            } catch (err) {
                console.error(`Error processing course ${courseId}:`, err);
                // Continue with other courses even if one fails
            }
        }
        
        // Sort courses - completed last, then by progress
        coursesProgress.sort((a, b) => {
            if (a.overallProgress === 100 && b.overallProgress !== 100) return 1;
            if (a.overallProgress !== 100 && b.overallProgress === 100) return -1;
            return b.overallProgress - a.overallProgress; // Higher progress first
        });
        
        console.log(`Returning progress for ${coursesProgress.length} courses`);
        
        res.json({ 
            success: true, 
            coursesProgress 
        });
        
    } catch (error) {
        console.error("Error in getUserCoursesProgress:", error);
        res.json({ success: false, message: error.message });
    }
};