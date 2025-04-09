import express from 'express'
import { getAllCourse, getCourseId, getCourseQuizzes } from '../controllers/courseController.js';


const courseRouter = express.Router()

// Get All Course
courseRouter.get('/all', getAllCourse)

// Get Course Data By Id
courseRouter.get('/:id', getCourseId)

// Get quizzes for a course
courseRouter.get('/:courseId/quizzes', getCourseQuizzes)


export default courseRouter;