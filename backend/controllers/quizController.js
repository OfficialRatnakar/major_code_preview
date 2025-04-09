import Quiz from '../models/Quiz.js';
import Course from '../models/Course.js';
import { v4 as uuidv4 } from 'uuid';

// Create a new quiz
export const createQuiz = async (req, res) => {
  try {
    const { title, description, courseId, chapterId, timeLimit, passingScore, questions } = req.body;
    const educatorId = req.userId;

    // Verify the educator owns the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.educator !== educatorId) {
      return res.status(403).json({ success: false, message: 'You do not have permission to add quizzes to this course' });
    }

    // Process questions and add unique IDs
    const formattedQuestions = questions.map((question, index) => {
      const options = question.options.map(option => ({
        optionId: uuidv4(),
        optionText: option.text
      }));

      return {
        questionId: uuidv4(),
        questionText: question.text,
        questionType: question.type || 'multiple-choice',
        options: options,
        correctAnswer: question.correctAnswerIndex !== undefined 
          ? options[question.correctAnswerIndex].optionId 
          : null,
        points: question.points || 1,
        order: index + 1
      };
    });

    const quiz = new Quiz({
      title,
      description,
      courseId,
      chapterId,
      educatorId,
      timeLimit: timeLimit || null,
      passingScore: passingScore || 70,
      questions: formattedQuestions,
      attempts: []
    });

    await quiz.save();

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        questions: quiz.questions.length
      }
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ success: false, message: 'Failed to create quiz', error: error.message });
  }
};

// Update an existing quiz
export const updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { title, description, timeLimit, passingScore, questions, isPublished } = req.body;
    const educatorId = req.userId;

    console.log(`Updating quiz ${quizId}. Request body:`, { 
      title, description, timeLimit, passingScore, 
      hasQuestions: !!questions, isPublished,
      educatorId
    });

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (quiz.educatorId !== educatorId) {
      return res.status(403).json({ success: false, message: 'You do not have permission to update this quiz' });
    }

    // Only update questions if provided
    if (questions) {
      // Process questions and add unique IDs
      const formattedQuestions = questions.map((question, index) => {
        const options = question.options.map(option => ({
          optionId: option.optionId || uuidv4(),
          optionText: option.text
        }));

        return {
          questionId: question.questionId || uuidv4(),
          questionText: question.text,
          questionType: question.type || 'multiple-choice',
          options: options,
          correctAnswer: question.correctAnswerIndex !== undefined 
            ? options[question.correctAnswerIndex].optionId 
            : question.correctAnswer,
          points: question.points || 1,
          order: index + 1
        };
      });

      quiz.questions = formattedQuestions;
    }

    // Update other fields if provided
    if (title) quiz.title = title;
    if (description !== undefined) quiz.description = description;
    if (timeLimit !== undefined) quiz.timeLimit = timeLimit;
    if (passingScore !== undefined) quiz.passingScore = passingScore;
    if (isPublished !== undefined) {
      console.log(`Changing isPublished from ${quiz.isPublished} to ${isPublished}`);
      quiz.isPublished = isPublished;
    }

    await quiz.save();
    console.log(`Quiz ${quizId} updated successfully. isPublished=${quiz.isPublished}`);

    res.status(200).json({
      success: true,
      message: 'Quiz updated successfully',
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        questions: quiz.questions.length,
        isPublished: quiz.isPublished
      }
    });
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({ success: false, message: 'Failed to update quiz', error: error.message });
  }
};

// Get all quizzes for a course (educator view)
export const getCourseQuizzes = async (req, res) => {
  try {
    const { courseId } = req.params;
    const educatorId = req.userId;
    
    console.log(`Debug getCourseQuizzes: courseId=${courseId}, educatorId=${educatorId}`);

    // Verify the educator owns the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    console.log(`Debug course found:`, {
      courseId: course._id,
      title: course.courseTitle,
      educator: course.educator,
      educatorType: typeof course.educator,
      userIdType: typeof educatorId,
    });

    // Check if the educator ID matches the course educator
    // Convert to string for comparison if needed
    if (course.educator.toString() !== educatorId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to view quizzes for this course',
        details: {
          courseEducator: course.educator.toString(),
          requestUser: educatorId.toString()
        } 
      });
    }

    const quizzes = await Quiz.find({ courseId }).select('title description isPublished questions attempts createdAt updatedAt');
    console.log(`Found ${quizzes.length} quizzes for course ${courseId}`);

    // Add statistics for each quiz
    const quizzesWithStats = quizzes.map(quiz => {
      const totalAttempts = quiz.attempts.length;
      const passedAttempts = quiz.attempts.filter(attempt => 
        (attempt.score / attempt.maxScore) * 100 >= quiz.passingScore
      ).length;
      
      return {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        isPublished: quiz.isPublished,
        questionCount: quiz.questions.length,
        attempts: totalAttempts,
        passRate: totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0,
        createdAt: quiz.createdAt,
        updatedAt: quiz.updatedAt
      };
    });

    res.status(200).json({
      success: true,
      quizzes: quizzesWithStats
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch quizzes', error: error.message });
  }
};

// Get a quiz for an educator to edit
export const getQuizForEdit = async (req, res) => {
  try {
    const { quizId } = req.params;
    const educatorId = req.userId;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (quiz.educatorId !== educatorId) {
      return res.status(403).json({ success: false, message: 'You do not have permission to edit this quiz' });
    }

    // Format the quiz for the editor
    const formattedQuiz = {
      _id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      courseId: quiz.courseId,
      chapterId: quiz.chapterId,
      timeLimit: quiz.timeLimit,
      passingScore: quiz.passingScore,
      isPublished: quiz.isPublished,
      questions: quiz.questions.map(q => ({
        questionId: q.questionId,
        text: q.questionText,
        type: q.questionType,
        options: q.options.map(opt => ({
          optionId: opt.optionId,
          text: opt.optionText
        })),
        correctAnswer: q.correctAnswer,
        points: q.points,
        order: q.order
      }))
    };

    res.status(200).json({
      success: true,
      quiz: formattedQuiz
    });
  } catch (error) {
    console.error('Error fetching quiz for edit:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch quiz', error: error.message });
  }
};

// Get a quiz for a student to take
export const getQuizForStudent = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.userId;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (!quiz.isPublished) {
      return res.status(403).json({ success: false, message: 'This quiz is not available yet' });
    }

    // Check if the student is enrolled in the course
    const course = await Course.findById(quiz.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (!course.enrolledStudents.includes(userId)) {
      return res.status(403).json({ success: false, message: 'You are not enrolled in this course' });
    }

    // Check if the student has already taken the quiz
    const existingAttempt = quiz.attempts.find(attempt => attempt.userId === userId);
    if (existingAttempt) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already taken this quiz',
        attemptDetails: {
          score: existingAttempt.score,
          maxScore: existingAttempt.maxScore,
          percentage: (existingAttempt.score / existingAttempt.maxScore) * 100,
          completedAt: existingAttempt.completedAt,
          passed: (existingAttempt.score / existingAttempt.maxScore) * 100 >= quiz.passingScore
        }
      });
    }

    // Format the quiz for the student (without correct answers)
    const formattedQuiz = {
      _id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      timeLimit: quiz.timeLimit,
      passingScore: quiz.passingScore,
      questions: quiz.questions.map(q => ({
        questionId: q.questionId,
        text: q.questionText,
        type: q.questionType,
        options: q.options.map(opt => ({
          optionId: opt.optionId,
          text: opt.optionText
        })),
        points: q.points
      })),
      totalQuestions: quiz.questions.length,
      totalPoints: quiz.questions.reduce((sum, q) => sum + q.points, 0)
    };

    res.status(200).json({
      success: true,
      quiz: formattedQuiz
    });
  } catch (error) {
    console.error('Error fetching quiz for student:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch quiz', error: error.message });
  }
};

// Submit a quiz attempt
export const submitQuizAttempt = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body;
    const userId = req.userId;
    const userName = req.userName;
    const userAvatar = req.userAvatar;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (!quiz.isPublished) {
      return res.status(403).json({ success: false, message: 'This quiz is not available yet' });
    }

    // Check if the student has already taken the quiz
    const existingAttempt = quiz.attempts.find(attempt => attempt.userId === userId);
    if (existingAttempt) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already taken this quiz',
        attemptDetails: {
          score: existingAttempt.score,
          maxScore: existingAttempt.maxScore,
          percentage: (existingAttempt.score / existingAttempt.maxScore) * 100,
          completedAt: existingAttempt.completedAt,
          passed: (existingAttempt.score / existingAttempt.maxScore) * 100 >= quiz.passingScore
        }
      });
    }

    // Grade the quiz
    let score = 0;
    const maxScore = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    
    const gradedAnswers = answers.map(answer => {
      const question = quiz.questions.find(q => q.questionId === answer.questionId);
      
      if (!question) {
        return {
          questionId: answer.questionId,
          selectedOption: answer.selectedOption,
          isCorrect: false
        };
      }

      const isCorrect = question.correctAnswer === answer.selectedOption;
      
      if (isCorrect) {
        score += question.points;
      }

      return {
        questionId: answer.questionId,
        selectedOption: answer.selectedOption,
        isCorrect
      };
    });

    // Create the attempt
    const newAttempt = {
      userId,
      userName,
      userAvatar,
      score,
      maxScore,
      completedAt: new Date(),
      answers: gradedAnswers
    };

    quiz.attempts.push(newAttempt);
    await quiz.save();

    const percentage = (score / maxScore) * 100;
    const passed = percentage >= quiz.passingScore;

    res.status(200).json({
      success: true,
      message: 'Quiz submitted successfully',
      result: {
        score,
        maxScore,
        percentage,
        passed,
        answers: gradedAnswers.map(answer => {
          const question = quiz.questions.find(q => q.questionId === answer.questionId);
          return {
            questionId: answer.questionId,
            questionText: question ? question.questionText : 'Unknown question',
            selectedOption: answer.selectedOption,
            correctOption: question ? question.correctAnswer : null,
            isCorrect: answer.isCorrect
          };
        })
      }
    });
  } catch (error) {
    console.error('Error submitting quiz attempt:', error);
    res.status(500).json({ success: false, message: 'Failed to submit quiz', error: error.message });
  }
};

// Get quiz results for a student
export const getQuizResults = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.userId;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const attempt = quiz.attempts.find(attempt => attempt.userId === userId);
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'You have not taken this quiz yet' });
    }

    const percentage = (attempt.score / attempt.maxScore) * 100;
    const passed = percentage >= quiz.passingScore;

    // Get detailed results
    const detailedResults = attempt.answers.map(answer => {
      const question = quiz.questions.find(q => q.questionId === answer.questionId);
      const selectedOption = question?.options.find(opt => opt.optionId === answer.selectedOption);
      const correctOption = question?.options.find(opt => opt.optionId === question.correctAnswer);
      
      return {
        questionId: answer.questionId,
        questionText: question?.questionText || 'Unknown question',
        selectedOption: selectedOption?.optionText || 'No answer',
        correctOption: correctOption?.optionText || 'Unknown',
        isCorrect: answer.isCorrect,
        points: answer.isCorrect ? question?.points || 0 : 0,
        maxPoints: question?.points || 0
      };
    });

    res.status(200).json({
      success: true,
      results: {
        quizTitle: quiz.title,
        score: attempt.score,
        maxScore: attempt.maxScore,
        percentage,
        passed,
        completedAt: attempt.completedAt,
        questions: detailedResults
      }
    });
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch quiz results', error: error.message });
  }
};

// Get quiz with results for the results page
export const getQuizWithResults = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.userId;
    
    console.log(`Fetching quiz with results for quiz ${quizId} and user ${userId}`);

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Check if user is enrolled in the course
    const course = await Course.findById(quiz.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (!course.enrolledStudents.includes(userId)) {
      return res.status(403).json({ success: false, message: 'You are not enrolled in this course' });
    }

    // Get user attempt
    const attempt = quiz.attempts.find(attempt => attempt.userId === userId);
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'You have not taken this quiz yet' });
    }

    // Format the quiz data for the frontend
    const formattedQuiz = {
      _id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      courseId: quiz.courseId,
      timeLimit: quiz.timeLimit,
      passingScore: quiz.passingScore,
      questions: quiz.questions.map(q => ({
        _id: q._id,
        questionId: q.questionId,
        questionText: q.questionText,
        text: q.questionText, // Include both formats for compatibility
        options: q.options.map(opt => ({
          optionId: opt.optionId,
          optionText: opt.optionText,
          text: opt.optionText // Include both formats for compatibility
        })),
        correctAnswer: q.correctAnswer,
        points: q.points
      }))
    };

    // Calculate score and format result
    const percentage = (attempt.score / attempt.maxScore) * 100;
    const passed = percentage >= quiz.passingScore;

    // Format answers with human-readable information
    const formattedAnswers = attempt.answers.map(answer => {
      const question = quiz.questions.find(q => q.questionId === answer.questionId);
      
      return {
        questionId: answer.questionId,
        isCorrect: answer.isCorrect,
        selectedOption: answer.selectedOption
      };
    });

    const result = {
      score: attempt.score,
      maxScore: attempt.maxScore,
      percentage,
      passed,
      completedAt: attempt.completedAt,
      answers: formattedAnswers
    };

    res.status(200).json({
      success: true,
      quiz: formattedQuiz,
      result
    });
  } catch (error) {
    console.error('Error fetching quiz with results:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch quiz with results', error: error.message });
  }
};

// Get quiz statistics for an educator
export const getQuizStatistics = async (req, res) => {
  try {
    const { quizId } = req.params;
    const educatorId = req.userId;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (quiz.educatorId !== educatorId) {
      return res.status(403).json({ success: false, message: 'You do not have permission to view this quiz' });
    }

    const totalAttempts = quiz.attempts.length;
    const passedAttempts = quiz.attempts.filter(attempt => 
      (attempt.score / attempt.maxScore) * 100 >= quiz.passingScore
    ).length;

    // Calculate average score
    const averageScore = totalAttempts > 0 
      ? quiz.attempts.reduce((sum, attempt) => sum + (attempt.score / attempt.maxScore) * 100, 0) / totalAttempts 
      : 0;

    // Question statistics
    const questionStats = quiz.questions.map(question => {
      const totalAnswers = quiz.attempts.filter(attempt => 
        attempt.answers.some(ans => ans.questionId === question.questionId)
      ).length;
      
      const correctAnswers = quiz.attempts.filter(attempt => 
        attempt.answers.some(ans => ans.questionId === question.questionId && ans.isCorrect)
      ).length;

      const correctPercentage = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;

      // Get distribution of answers
      const optionDistribution = question.options.map(option => {
        const count = quiz.attempts.filter(attempt => 
          attempt.answers.some(ans => 
            ans.questionId === question.questionId && ans.selectedOption === option.optionId
          )
        ).length;

        return {
          optionId: option.optionId,
          text: option.optionText,
          count,
          percentage: totalAnswers > 0 ? (count / totalAnswers) * 100 : 0,
          isCorrect: option.optionId === question.correctAnswer
        };
      });

      return {
        questionId: question.questionId,
        text: question.questionText,
        correctPercentage,
        optionDistribution
      };
    });

    // Recent attempts
    const recentAttempts = quiz.attempts
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, 10)
      .map(attempt => ({
        userId: attempt.userId,
        userName: attempt.userName || 'Anonymous',
        userAvatar: attempt.userAvatar,
        score: attempt.score,
        maxScore: attempt.maxScore,
        percentage: (attempt.score / attempt.maxScore) * 100,
        passed: (attempt.score / attempt.maxScore) * 100 >= quiz.passingScore,
        completedAt: attempt.completedAt
      }));

    res.status(200).json({
      success: true,
      statistics: {
        totalAttempts,
        passedAttempts,
        failedAttempts: totalAttempts - passedAttempts,
        passRate: totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0,
        averageScore,
        questionStats,
        recentAttempts
      }
    });
  } catch (error) {
    console.error('Error fetching quiz statistics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch quiz statistics', error: error.message });
  }
};

// Delete a quiz
export const deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const educatorId = req.userId;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (quiz.educatorId !== educatorId) {
      return res.status(403).json({ success: false, message: 'You do not have permission to delete this quiz' });
    }

    await Quiz.findByIdAndDelete(quizId);

    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ success: false, message: 'Failed to delete quiz', error: error.message });
  }
}; 