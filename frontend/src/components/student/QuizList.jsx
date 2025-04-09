import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiClipboard, FiClock, FiCheckCircle, FiX } from 'react-icons/fi';

const QuizList = ({ courseId }) => {
  const { backendUrl, getToken } = useContext(AppContext);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchQuizzes();
  }, [courseId]);
  
  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const { data } = await axios.get(
        `${backendUrl}/api/course/${courseId}/quizzes`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (data.success) {
        setQuizzes(data.quizzes || []);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      // Don't show error toast for empty quizzes
    } finally {
      setLoading(false);
    }
  };
  
  const handleTakeQuiz = (quizId) => {
    navigate(`/quiz/${quizId}`);
  };
  
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-16 bg-gray-200 rounded mb-3"></div>
        <div className="h-16 bg-gray-200 rounded mb-3"></div>
      </div>
    );
  }
  
  if (quizzes.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <FiClipboard className="mx-auto text-gray-400 mb-2" size={24} />
        <p className="text-gray-500">No quizzes available for this course yet</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {quizzes.map((quiz) => {
        const hasTaken = quiz.attempt !== null;
        const hasPassed = hasTaken && quiz.attempt.passed;
        
        return (
          <div key={quiz._id} className="border rounded-lg overflow-hidden bg-white">
            <div className="flex justify-between items-center p-4 border-b">
              <div>
                <h4 className="font-medium text-gray-800">{quiz.title}</h4>
                {quiz.description && (
                  <p className="text-sm text-gray-500 mt-1">{quiz.description}</p>
                )}
              </div>
              {hasTaken && (
                <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  hasPassed 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {hasPassed ? (
                    <>
                      <FiCheckCircle className="mr-1" />
                      Passed
                    </>
                  ) : (
                    <>
                      <FiX className="mr-1" />
                      Failed
                    </>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-4 bg-gray-50 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center">
                <FiClipboard className="mr-1 text-gray-500" />
                <span>{quiz.totalQuestions} Questions</span>
              </div>
              
              {quiz.timeLimit && (
                <div className="flex items-center">
                  <FiClock className="mr-1 text-gray-500" />
                  <span>{quiz.timeLimit} minutes</span>
                </div>
              )}
              
              <div className="flex items-center">
                <span className="text-gray-500">Passing Score: {quiz.passingScore}%</span>
              </div>
              
              {hasTaken && (
                <div className="flex items-center">
                  <span className="text-gray-500">Your Score: {quiz.attempt.percentage.toFixed(1)}%</span>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t flex justify-end">
              {hasTaken ? (
                <button
                  onClick={() => navigate(`/quiz/${quiz._id}/results`)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  View Results
                </button>
              ) : (
                <button
                  onClick={() => handleTakeQuiz(quiz._id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Start Quiz
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default QuizList; 