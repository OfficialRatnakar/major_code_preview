import express from 'express'
import { addUserRating, getUserCourseProgress, getUserCoursesProgress, getUserDashboardData, getUserData, getUserQuizResults, purchaseCourse, updateUserCourseProgress, userEnrolledCourses } from '../controllers/userController.js';


const userRouter = express.Router()

// Get user Data
userRouter.get('/data', getUserData)
userRouter.post('/purchase', purchaseCourse)
userRouter.get('/enrolled-courses', userEnrolledCourses)
userRouter.post('/update-course-progress', updateUserCourseProgress)
userRouter.post('/get-course-progress', getUserCourseProgress)
userRouter.post('/add-rating', addUserRating)

// New routes for user dashboard and progress
userRouter.get('/dashboard-data', getUserDashboardData)
userRouter.get('/courses-progress', getUserCoursesProgress)
userRouter.get('/quiz-results', getUserQuizResults)

export default userRouter;