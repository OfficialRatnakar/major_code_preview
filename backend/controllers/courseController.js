import Course from "../models/Course.js"
import Quiz from "../models/Quiz.js"


// Get All Courses
export const getAllCourse = async (req, res) => {
    try {

        const courses = await Course.find({ isPublished: true })
            .select(['-courseContent', '-enrolledStudents'])
            .populate({ path: 'educator', select: '-password' })

        res.json({ success: true, courses })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

// Get Course by Id
export const getCourseId = async (req, res) => {

    const { id } = req.params

    try {

        const courseData = await Course.findById(id)
            .populate({ path: 'educator'})

        // Remove lectureUrl if isPreviewFree is false
        courseData.courseContent.forEach(chapter => {
            chapter.chapterContent.forEach(lecture => {
                if (!lecture.isPreviewFree) {
                    lecture.lectureUrl = "";
                }
            });
        });

        res.json({ success: true, courseData })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

// Get Quizzes for a Course
export const getCourseQuizzes = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.userId;

        console.log(`Student getCourseQuizzes: courseId=${courseId}, userId=${userId}`);

        // Find all quizzes for this course that are published
        const quizzes = await Quiz.find({ 
            courseId, 
            isPublished: true 
        }).select('title description timeLimit passingScore questions attempts');

        console.log(`Found ${quizzes.length} published quizzes for course ${courseId}`);
        
        // Debug: Log details about found quizzes
        if (quizzes.length > 0) {
            quizzes.forEach(quiz => {
                console.log(`Quiz details - ID: ${quiz._id}, Title: ${quiz.title}, Published: ${quiz.isPublished}`);
            });
        } else {
            // If no quizzes found, check if there are unpublished quizzes
            const allQuizzes = await Quiz.find({ courseId }).select('_id title isPublished');
            console.log(`Found ${allQuizzes.length} total quizzes (including unpublished) for course ${courseId}`);
            allQuizzes.forEach(quiz => {
                console.log(`All quiz - ID: ${quiz._id}, Title: ${quiz.title}, Published: ${quiz.isPublished}`);
            });
        }

        // Format quizzes for the student view
        const formattedQuizzes = quizzes.map(quiz => {
            // Find if the user has attempted this quiz
            const userAttempt = quiz.attempts.find(attempt => attempt.userId === userId);
            const totalQuestions = quiz.questions.length;
            const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
            
            return {
                _id: quiz._id,
                title: quiz.title,
                description: quiz.description,
                timeLimit: quiz.timeLimit,
                passingScore: quiz.passingScore,
                totalQuestions,
                totalPoints,
                attempt: userAttempt ? {
                    score: userAttempt.score,
                    maxScore: userAttempt.maxScore,
                    percentage: (userAttempt.score / userAttempt.maxScore) * 100,
                    completedAt: userAttempt.completedAt,
                    passed: (userAttempt.score / userAttempt.maxScore) * 100 >= quiz.passingScore
                } : null
            };
        });

        res.status(200).json({
            success: true,
            quizzes: formattedQuizzes
        });
    } catch (error) {
        console.error('Error fetching course quizzes:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch quizzes', error: error.message });
    }
}; 