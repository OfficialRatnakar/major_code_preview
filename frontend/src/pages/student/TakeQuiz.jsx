import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const TakeQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { backendUrl, getToken } = useContext(AppContext);
  
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStatus, setQuizStatus] = useState('loading'); // loading, ready, submitting, completed, error
  const [quizResult, setQuizResult] = useState(null);
  const [courseName, setCourseName] = useState('');
  const [error, setError] = useState(null);
  
  const timerRef = useRef(null);
  
  const startTimer = (seconds) => {
    setTimeLeft(seconds);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  useEffect(() => {
    const fetchQuizData = async () => {
      setQuizStatus('loading');
      try {
        // Check if we're on the results page
        const isResultsPage = window.location.pathname.includes('/results');
        const token = await getToken();
        
        // Fetch the quiz data
        const { data } = await axios.get(
          `${backendUrl}/api/quiz/${quizId}${isResultsPage ? '/result' : ''}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (data.success) {
          console.log("Quiz data received:", isResultsPage ? "results page" : "quiz page");
          
          if (isResultsPage) {
            // If we're on results page, set quiz and results
            setQuiz(data.quiz);
            setQuizResult(data.result);
            setQuizStatus('completed');
            
            // Fetch course name
            if (data.quiz.courseId) {
              fetchCourseName(data.quiz.courseId);
            }
          } else {
            // Regular quiz taking flow
            setQuiz(data.quiz);
            setTimeLeft(data.quiz.timeLimit * 60); // Convert minutes to seconds
            
            // Initialize answers object with question IDs
            const initialAnswers = {};
            data.quiz.questions.forEach(question => {
              initialAnswers[question.questionId] = null;
            });
            setAnswers(initialAnswers);
            
            setQuizStatus('ready');
            
            // Start timer if quiz has time limit
            if (data.quiz.timeLimit > 0) {
              startTimer(data.quiz.timeLimit * 60);
            }
            
            // Fetch course name
            if (data.quiz.courseId) {
              fetchCourseName(data.quiz.courseId);
            }
          }
        } else {
          setQuizStatus('error');
          setError(data.message || 'Failed to load quiz');
        }
      } catch (error) {
        console.error("Error fetching quiz data:", error);
        setQuizStatus('error');
        setError(error.response?.data?.message || 'Failed to load quiz');
      }
    };

    fetchQuizData();
    
    // Cleanup function to clear interval if component unmounts
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [quizId]);
  
  const fetchCourseName = async (courseId) => {
    try {
      const token = await getToken();
      const { data } = await axios.get(
        `${backendUrl}/api/course/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (data.success) {
        setCourseName(data.course.courseTitle);
      }
    } catch (error) {
      console.error('Failed to fetch course name:', error);
    }
  };
  
  const handleAnswerSelect = (questionId, optionId) => {
    setAnswers({
      ...answers,
      [questionId]: optionId
    });
  };
  
  const handlePrevQuestion = () => {
    setCurrentQuestionIndex(Math.max(currentQuestionIndex - 1, 0));
  };
  
  const handleNextQuestion = () => {
    setCurrentQuestionIndex(Math.min(currentQuestionIndex + 1, quiz.questions.length - 1));
  };
  
  const isQuizComplete = () => {
    return Object.values(answers).every(answer => answer !== null);
  };
  
  const handleSubmit = async () => {
    // Clear timer if exists
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (!window.confirm('Are you sure you want to submit your quiz?')) {
      return;
    }
    
    setQuizStatus('submitting');
    
    try {
      const token = await getToken();
      
      // Format answers for submission
      const formattedAnswers = Object.keys(answers).map(questionId => ({
        questionId,
        selectedOption: answers[questionId]
      }));
      
      const { data } = await axios.post(
        `${backendUrl}/api/quiz/${quizId}/submit`,
        { answers: formattedAnswers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (data.success) {
        setQuizResult(data.result);
        setQuizStatus('completed');
        toast.success('Quiz submitted successfully');
        
        // Update URL to results without reloading the page
        window.history.pushState({}, '', `/quiz/${quizId}/results`);
      } else {
        setQuizStatus('ready');
        toast.error(data.message);
      }
    } catch (error) {
      setQuizStatus('ready');
      toast.error('Failed to submit quiz');
      console.error(error);
    }
  };
  
  // Format time from seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const renderQuizCompletion = () => {
    if (!quizResult) return null;
    
    const percentage = quizResult.percentage.toFixed(1);
    const isPassed = quizResult.passed;
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
            isPassed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
          }`}>
            {isPassed ? (
              <FiCheckCircle size={40} />
            ) : (
              <FiAlertCircle size={40} />
            )}
          </div>
          <h2 className="text-2xl font-bold">{isPassed ? 'Quiz Passed!' : 'Quiz Failed'}</h2>
          <p className="text-gray-600 mt-1">
            You scored {quizResult.score} out of {quizResult.maxScore} points ({percentage}%)
          </p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm font-medium text-gray-500">Your Score</div>
            <div className="font-bold">{percentage}%</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${isPassed ? 'bg-green-600' : 'bg-red-600'}`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
        
        <div className="space-y-6">
          <h3 className="text-lg font-semibold border-b pb-2">Quiz Results</h3>
          
          {quiz && quiz.questions && quizResult.answers && quizResult.answers.map((answer, index) => {
            // Find the corresponding question from the quiz
            const question = quiz.questions.find(q => q.questionId === answer.questionId);
            if (!question) return null;
            
            // Find the option text for the selected answer and correct answer
            const selectedOption = question.options.find(opt => opt.optionId === answer.selectedOption);
            const correctOption = question.options.find(opt => opt.optionId === question.correctAnswer);
            
            return (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <h4 className="font-medium">Question {index + 1}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    answer.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {answer.isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
                <p className="mb-3">{question.questionText || question.text}</p>
                
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">Your answer:</div>
                  <div className={`p-2 rounded ${
                    answer.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    {selectedOption ? selectedOption.optionText : 'No answer selected'}
                  </div>
                  
                  {!answer.isCorrect && (
                    <>
                      <div className="text-sm text-gray-600 mt-2">Correct answer:</div>
                      <div className="p-2 rounded bg-green-50 border border-green-200">
                        {correctOption ? correctOption.optionText : 'Unknown'}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={() => navigate('/student/quizzes')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Quizzes
          </button>
          <button
            onClick={() => navigate('/user-dashboard')}
            className="border border-blue-600 text-blue-600 px-6 py-2 rounded-md hover:bg-blue-50 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  };
  
  const renderQuizContent = () => {
    if (!quiz) return null;
    
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
    
    return (
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-lg">{quiz.title}</h2>
            {quiz.timeLimit && (
              <div className="flex items-center text-sm mt-1">
                <FiClock className="mr-1 text-gray-500" />
                <span className={`${
                  timeLeft && timeLeft < 60 ? 'text-red-600 font-bold' : 'text-gray-600'
                }`}>
                  Time remaining: {formatTime(timeLeft)}
                </span>
              </div>
            )}
          </div>
          <div className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">{currentQuestion.text}</h3>
            
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <div 
                  key={option.optionId}
                  onClick={() => handleAnswerSelect(currentQuestion.questionId, option.optionId)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    answers[currentQuestion.questionId] === option.optionId
                      ? 'border-blue-600 bg-blue-50 text-blue-800'
                      : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 mr-3 rounded-full border flex items-center justify-center ${
                      answers[currentQuestion.questionId] === option.optionId
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-gray-400'
                    }`}>
                      {answers[currentQuestion.questionId] === option.optionId && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    {option.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              className={`px-4 py-2 border border-gray-300 rounded-md ${
                currentQuestionIndex === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            
            {isLastQuestion ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!isQuizComplete()}
                className={`px-4 py-2 rounded-md ${
                  isQuizComplete()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                }`}
              >
                Submit Quiz
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextQuestion}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Next
              </button>
            )}
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 border-t flex flex-wrap gap-2">
          {quiz.questions.map((q, index) => (
            <button
              key={q.questionId}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                answers[q.questionId]
                  ? 'bg-green-500 text-white'
                  : currentQuestionIndex === index
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  const renderContent = () => {
    switch (quizStatus) {
      case 'loading':
        return (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        );
      case 'ready':
      case 'submitting':
        return renderQuizContent();
      case 'completed':
        return renderQuizCompletion();
      case 'error':
        return (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-red-600 mb-4">{error || 'Failed to load quiz'}</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <FiArrowLeft className="mr-1" size={16} />
            <span>Back to Course</span>
          </button>
        </div>
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {quiz ? quiz.title : 'Loading Quiz...'}
          </h1>
          {courseName && (
            <div className="mt-1 text-gray-600">
              Course: <span className="font-medium">{courseName}</span>
            </div>
          )}
        </div>
        
        {renderContent()}
      </div>
    </div>
  );
};

export default TakeQuiz; 