import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loading from '../../components/student/Loading';
import { FiArrowLeft } from 'react-icons/fi';

const QuizStatistics = () => {
  const { quizId } = useParams();
  const { backendUrl, getToken } = useContext(AppContext);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [quiz, setQuiz] = useState(null);
  
  useEffect(() => {
    fetchQuizStatistics();
  }, [quizId]);
  
  const fetchQuizStatistics = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      // First get the quiz details
      const quizResponse = await axios.get(
        `${backendUrl}/api/quiz/edit/${quizId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (quizResponse.data.success) {
        setQuiz(quizResponse.data.quiz);
      } else {
        throw new Error(quizResponse.data.message || 'Failed to fetch quiz details');
      }
      
      // Then get the statistics
      const statsResponse = await axios.get(
        `${backendUrl}/api/quiz/statistics/${quizId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (statsResponse.data.success) {
        setStatistics(statsResponse.data.statistics);
      } else {
        throw new Error(statsResponse.data.message || 'Failed to fetch quiz statistics');
      }
    } catch (error) {
      console.error('Error fetching quiz statistics:', error);
      setError(error.message);
      toast.error('Failed to fetch quiz statistics');
    } finally {
      setLoading(false);
    }
  };
  
  const handleBack = () => {
    navigate('/educator/quizzes');
  };
  
  if (loading) {
    return <Loading />;
  }
  
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
        <button
          onClick={handleBack}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Back to Quizzes
        </button>
      </div>
    );
  }
  
  if (!statistics || !quiz) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-4">
          <p>No statistics available for this quiz.</p>
        </div>
        <button
          onClick={handleBack}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Back to Quizzes
        </button>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={handleBack}
          className="mr-4 text-blue-600 hover:text-blue-800"
        >
          <FiArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">Quiz Statistics: {quiz.title}</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Attempts</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{statistics.totalAttempts}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Pass Rate</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{statistics.passRate.toFixed(1)}%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Average Score</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">{statistics.averageScore.toFixed(1)}%</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Question Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Question
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Correct %
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Answer Distribution
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {statistics.questionStats.map((question, index) => (
                <tr key={question.questionId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {index + 1}. {question.text}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="mr-2">{question.correctPercentage.toFixed(1)}%</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            question.correctPercentage >= 70 ? 'bg-green-600' : 
                            question.correctPercentage >= 40 ? 'bg-yellow-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${question.correctPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      {question.optionDistribution.map(option => (
                        <div key={option.optionId} className="flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                            <div 
                              className={`h-2.5 rounded-full ${
                                option.isCorrect ? 'bg-green-600' : 'bg-gray-400'
                              }`}
                              style={{ width: `${option.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {option.text} ({option.percentage.toFixed(1)}%)
                            {option.isCorrect && <span className="text-green-600 ml-1">✓</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Recent Attempts</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {statistics.recentAttempts.map((attempt, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {attempt.userAvatar ? (
                        <img 
                          src={attempt.userAvatar} 
                          alt={attempt.userName} 
                          className="h-8 w-8 rounded-full mr-3"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-300 mr-3 flex items-center justify-center">
                          <span className="text-gray-600 text-xs">
                            {attempt.userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="text-sm font-medium text-gray-900">{attempt.userName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {attempt.score}/{attempt.maxScore} ({attempt.percentage.toFixed(1)}%)
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        attempt.passed 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {attempt.passed ? 'Passed' : 'Failed'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(attempt.completedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuizStatistics; 