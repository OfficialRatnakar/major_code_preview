import express from 'express';
import {
  createQuiz,
  updateQuiz,
  getCourseQuizzes,
  getQuizForEdit,
  getQuizForStudent,
  submitQuizAttempt,
  getQuizResults,
  getQuizStatistics,
  deleteQuiz,
  getQuizWithResults
} from '../controllers/quizController.js';

const quizRouter = express.Router();

// Debug middleware for auth
const debugAuth = (req, res, next) => {
  console.log('Quiz Debug Auth:', {
    userId: req.userId,
    method: req.method,
    url: req.url,
    headers: {
      authorization: req.headers.authorization ? 'Present (hidden for security)' : 'Missing'
    }
  });
  next();
};

// Educator routes
quizRouter.post('/create', createQuiz);
quizRouter.put('/:quizId', updateQuiz);
quizRouter.get('/course/:courseId', debugAuth, getCourseQuizzes);
quizRouter.get('/edit/:quizId', getQuizForEdit);
quizRouter.get('/statistics/:quizId', getQuizStatistics);
quizRouter.delete('/:quizId', deleteQuiz);

// Student routes
quizRouter.get('/:quizId', getQuizForStudent);
quizRouter.post('/:quizId/submit', submitQuizAttempt);
quizRouter.get('/:quizId/results', getQuizResults);
quizRouter.get('/:quizId/result', getQuizWithResults);

export default quizRouter; 