import express from 'express'
import { addCourse, educatorDashboardData, getCourseById, getEducatorCourses, getEnrolledStudentsData, updateRoleToEducator } from '../controllers/educatorController.js';
import upload from '../configs/multer.js';
import { protectEducator } from '../middlewares/authMiddleware.js';


const educatorRouter = express.Router()

// Add Educator Role 
educatorRouter.get('/update-role', updateRoleToEducator)

// Add Courses 
educatorRouter.post('/add-course', upload.single('image'), protectEducator, addCourse)

// Get Educator Courses 
educatorRouter.get('/courses', protectEducator, getEducatorCourses)

// Get a single course by ID
educatorRouter.get('/course/:courseId', protectEducator, getCourseById)

// Get Educator Students Data
educatorRouter.get('/enrolled-students', protectEducator, getEnrolledStudentsData)

// Get Educator dashboard data
educatorRouter.get('/dashboard-data', protectEducator, educatorDashboardData)


export default educatorRouter;