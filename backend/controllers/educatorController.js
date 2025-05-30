import { v2 as cloudinary } from 'cloudinary'
import Course from '../models/Course.js';
import { Purchase } from '../models/Purchase.js';
import User from '../models/User.js';
import { clerkClient } from '@clerk/express'

// update role to educator
export const updateRoleToEducator = async (req, res) => {

    try {

        const userId = req.auth.userId

        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                role: 'educator',
            },
        })

        res.json({ success: true, message: 'You can publish a course now' })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

// Add New Course
export const addCourse = async (req, res) => {

    try {

        const { courseData } = req.body

        const imageFile = req.file

        const educatorId = req.auth.userId

        if (!imageFile) {
            return res.json({ success: false, message: 'Thumbnail Not Attached' })
        }

        const parsedCourseData = await JSON.parse(courseData)

        parsedCourseData.educator = educatorId

        const newCourse = await Course.create(parsedCourseData)

        const imageUpload = await cloudinary.uploader.upload(imageFile.path)

        newCourse.courseThumbnail = imageUpload.secure_url

        await newCourse.save()

        res.json({ success: true, message: 'Course Added' })

    } catch (error) {

        res.json({ success: false, message: error.message })

    }
}

// Get Educator Courses
export const getEducatorCourses = async (req, res) => {
    try {

        const educator = req.auth.userId

        const courses = await Course.find({ educator })

        res.json({ success: true, courses })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get a single course by ID for an educator
export const getCourseById = async (req, res) => {
    try {
        const { courseId } = req.params;
        const educator = req.auth.userId;

        // Find the course and verify ownership
        const course = await Course.findById(courseId);
        
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }
        
        if (course.educator !== educator) {
            return res.status(403).json({ success: false, message: 'You do not have permission to access this course' });
        }
        
        res.json({ success: true, course });
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// Get Educator Dashboard Data ( Total Earning, Enrolled Students, No. of Courses)
export const educatorDashboardData = async (req, res) => {
    try {
        const educator = req.auth.userId;
        console.log('Educator ID:', educator);

        const courses = await Course.find({ educator });
        console.log('Found courses:', courses.length);

        const totalCourses = courses.length;

        const courseIds = courses.map(course => course._id);

        // Calculate total earnings from purchases
        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        });

        const totalEarnings = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);

        // Collect unique enrolled student IDs with their course titles
        const enrolledStudentsData = [];
        const uniqueStudentIds = new Set();
        
        for (const course of courses) {
            if (!course.enrolledStudents || !Array.isArray(course.enrolledStudents)) {
                console.log(`Course ${course._id} has no enrolledStudents or it's not an array`);
                continue;
            }
            
            const students = await User.find({
                _id: { $in: course.enrolledStudents }
            }, 'name imageUrl');

            students.forEach(student => {
                uniqueStudentIds.add(student._id.toString());
                enrolledStudentsData.push({
                    courseTitle: course.courseTitle,
                    student
                });
            });
        }

        const totalEnrolledStudents = uniqueStudentIds.size;
        console.log('Total unique students:', totalEnrolledStudents);

        res.json({
            success: true,
            dashboardData: {
                totalEarnings,
                enrolledStudentsData,
                totalCourses,
                totalEnrolledStudents
            }
        });
    } catch (error) {
        console.error('Error in educatorDashboardData:', error);
        res.json({ success: false, message: error.message });
    }
};

// Get Enrolled Students Data with Purchase Data
export const getEnrolledStudentsData = async (req, res) => {
    try {
        const educator = req.auth.userId;

        // Fetch all courses created by the educator
        const courses = await Course.find({ educator });

        // Get the list of course IDs
        const courseIds = courses.map(course => course._id);

        // Fetch purchases with user and course data
        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        }).populate('userId', 'name imageUrl').populate('courseId', 'courseTitle');

        // enrolled students data
        const enrolledStudents = purchases.map(purchase => ({
            student: purchase.userId,
            courseTitle: purchase.courseId.courseTitle,
            purchaseDate: purchase.createdAt
        }));

        res.json({
            success: true,
            enrolledStudents
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
};
