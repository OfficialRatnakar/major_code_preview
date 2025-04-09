import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiEdit, FiBarChart2, FiEye, FiTrash2 } from 'react-icons/fi';
import Loading from '../../components/student/Loading';

const QuizzesDashboard = () => {
  const { backendUrl, getToken } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [quizzesByCourse, setQuizzesByCourse] = useState({});
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchCourses();
  }, []);
  
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const { data } = await axios.get(
        `${backendUrl}/api/educator/courses`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (data.success) {
        setCourses(data.courses);
        
        // Fetch quizzes for each course
        const quizzesData = {};
        for (const course of data.courses) {
          const quizzes = await fetchQuizzesForCourse(course._id, token);
          quizzesData[course._id] = quizzes;
        }
        
        setQuizzesByCourse(quizzesData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to fetch courses');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchQuizzesForCourse = async (courseId, token) => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/quiz/course/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (data.success) {
        return data.quizzes;
      } else {
        toast.error(data.message);
        return [];
      }
    } catch (error) {
      console.error(`Error fetching quizzes for course ${courseId}:`, error);
      return [];
    }
  };
  
  const handleEdit = (courseId, quizId) => {
    navigate(`/educator/courses/${courseId}/quizzes/${quizId}/edit`);
  };
  
  const handleCreateQuiz = (courseId) => {
    navigate(`/educator/courses/${courseId}/quizzes/create`);
  };
  
  const handleViewStatistics = (courseId, quizId) => {
    navigate(`/educator/courses/${courseId}/quizzes/${quizId}/statistics`);
  };
  
  const handleDeleteQuiz = async (quizId, courseName, quizTitle) => {
    if (!window.confirm(`Are you sure you want to delete the quiz "${quizTitle}" from "${courseName}"?`)) {
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
        fetchCourses(); // Refresh data
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to delete quiz');
      console.error(error);
    }
  };
  
  const togglePublish = async (quiz, courseId) => {
    try {
      const token = await getToken();
      const { data } = await axios.put(
        `${backendUrl}/api/quiz/${quiz._id}`,
        { isPublished: !quiz.isPublished },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (data.success) {
        toast.success(`Quiz ${quiz.isPublished ? 'unpublished' : 'published'} successfully`);
        
        // Update state locally to avoid full refetch
        setQuizzesByCourse(prev => {
          const updated = { ...prev };
          updated[courseId] = prev[courseId].map(q => 
            q._id === quiz._id ? { ...q, isPublished: !q.isPublished } : q
          );
          return updated;
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to update quiz status');
      console.error(error);
    }
  };
  
  if (loading) {
    return <Loading />;
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Quiz Management</h1>
      
      {courses.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">You haven't created any courses yet</p>
          <button
            onClick={() => navigate('/educator/add-course')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Your First Course
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {courses.map((course) => {
            const courseQuizzes = quizzesByCourse[course._id] || [];
            
            return (
              <div key={course._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">{course.courseTitle}</h2>
                    <button
                      onClick={() => handleCreateQuiz(course._id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Create Quiz
                    </button>
                  </div>
                </div>
                
                {courseQuizzes.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-500 mb-4">No quizzes created for this course yet</p>
                    <button
                      onClick={() => handleCreateQuiz(course._id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Create Your First Quiz
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
                        {courseQuizzes.map((quiz) => (
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
                                  onClick={() => handleViewStatistics(course._id, quiz._id)}
                                  className="text-gray-600 hover:text-blue-700"
                                  title="View Statistics"
                                >
                                  <FiBarChart2 />
                                </button>
                                <button
                                  onClick={() => handleEdit(course._id, quiz._id)}
                                  className="text-gray-600 hover:text-blue-700"
                                  title="Edit Quiz"
                                >
                                  <FiEdit />
                                </button>
                                <button
                                  onClick={() => togglePublish(quiz, course._id)}
                                  className={`${
                                    quiz.isPublished ? 'text-green-600 hover:text-green-800' : 'text-yellow-600 hover:text-yellow-800'
                                  }`}
                                  title={quiz.isPublished ? 'Unpublish' : 'Publish'}
                                >
                                  <FiEye />
                                </button>
                                <button
                                  onClick={() => handleDeleteQuiz(quiz._id, course.courseTitle, quiz.title)}
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
          })}
        </div>
      )}
    </div>
  );
};

export default QuizzesDashboard; 