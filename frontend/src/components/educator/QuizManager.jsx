import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { AppContext } from '../../context/AppContext';
import { FiPlus, FiEdit, FiTrash2, FiChevronRight, FiEye, FiBarChart2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const QuizManager = ({ courseId }) => {
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
        `${backendUrl}/api/quiz/course/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setQuizzes(data.quizzes);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to fetch quizzes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = () => {
    navigate(`/educator/courses/${courseId}/quizzes/create`);
  };

  const handleEditQuiz = (quizId) => {
    navigate(`/educator/courses/${courseId}/quizzes/${quizId}/edit`);
  };

  const handleViewStatistics = (quizId) => {
    navigate(`/educator/courses/${courseId}/quizzes/${quizId}/statistics`);
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) {
      return;
    }

    try {
      const token = await getToken();
      const { data } = await axios.delete(
        `${backendUrl}/api/quiz/${quizId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success('Quiz deleted successfully');
        fetchQuizzes();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to delete quiz');
      console.error(error);
    }
  };

  const togglePublish = async (quiz) => {
    try {
      console.log(`Toggling publish status for quiz ${quiz._id} - Current status: ${quiz.isPublished ? 'Published' : 'Unpublished'}`);
      const token = await getToken();
      const { data } = await axios.put(
        `${backendUrl}/api/quiz/${quiz._id}`,
        { isPublished: !quiz.isPublished },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (data.success) {
        console.log(`Quiz ${quiz._id} publish status updated to: ${!quiz.isPublished ? 'Published' : 'Unpublished'}`);
        toast.success(`Quiz ${quiz.isPublished ? 'unpublished' : 'published'} successfully`);
        fetchQuizzes(); // Refresh data to ensure we have the latest status
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to update quiz status');
      console.error('Error updating quiz publish status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Course Quizzes</h2>
        <button
          onClick={handleCreateQuiz}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <FiPlus /> Create Quiz
        </button>
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">No quizzes created for this course yet</p>
          <button
            onClick={handleCreateQuiz}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md mx-auto hover:bg-blue-700 transition-colors"
          >
            <FiPlus /> Create Your First Quiz
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quiz
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Questions
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attempts
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pass Rate
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {quizzes.map((quiz) => (
                <tr key={quiz._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{quiz.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{quiz.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{quiz.questionCount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{quiz.attempts}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {quiz.attempts > 0 ? (
                        <div className="flex items-center">
                          <span className="mr-2">{quiz.passRate.toFixed(1)}%</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: `${quiz.passRate}%` }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        'No attempts'
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        quiz.isPublished 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {quiz.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleViewStatistics(quiz._id)}
                        className="text-gray-600 hover:text-blue-700"
                        title="View Statistics"
                      >
                        <FiBarChart2 />
                      </button>
                      <button
                        onClick={() => handleEditQuiz(quiz._id)}
                        className="text-gray-600 hover:text-blue-700"
                        title="Edit Quiz"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => togglePublish(quiz)}
                        className={`${
                          quiz.isPublished ? 'text-green-600 hover:text-green-800' : 'text-yellow-600 hover:text-yellow-800'
                        }`}
                        title={quiz.isPublished ? 'Unpublish' : 'Publish'}
                      >
                        <FiEye />
                      </button>
                      <button
                        onClick={() => handleDeleteQuiz(quiz._id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete Quiz"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default QuizManager; 