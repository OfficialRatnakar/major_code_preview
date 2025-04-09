import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import UserSidebar from '../../components/student/UserSidebar';
import { FiBookOpen, FiClock, FiCheckCircle, FiActivity, FiRefreshCw } from 'react-icons/fi';
import Loading from '../../components/student/Loading';

const StudentQuizzes = () => {
  const { backendUrl, getToken, userData } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [quizzesByCourse, setQuizzesByCourse] = useState({});
  const navigate = useNavigate();
  
  useEffect(() => {
    if (userData) {
      fetchEnrolledCourses();
    }
  }, [userData]);
  
  const handleRefresh = () => {
    setRefreshing(true);
    fetchEnrolledCourses().finally(() => setRefreshing(false));
  };
  
  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const { data } = await axios.get(
        `${backendUrl}/api/user/enrolled-courses`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (data.success) {
        const courses = Array.isArray(data.courses) ? data.courses : [];
        console.log('Enrolled courses data:', { courseCount: courses.length, data });
        setEnrolledCourses(courses);
        
        // Fetch quizzes for each course
        const quizzesData = {};
        for (const course of courses) {
          if (!course || !course._id) {
            console.warn('Invalid course data:', course);
            continue;
          }
          
          try {
            console.log(`Fetching quizzes for course: ${course._id}`);
            const quizzesResponse = await axios.get(
              `${backendUrl}/api/course/${course._id}/quizzes`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (quizzesResponse.data.success) {
              console.log(`Received ${quizzesResponse.data.quizzes.length} quizzes for course ${course._id}`);
              if (quizzesResponse.data.quizzes.length > 0) {
                quizzesResponse.data.quizzes.forEach(quiz => {
                  console.log(`Received quiz: ${quiz.title}, ID: ${quiz._id}`);
                });
              }
              quizzesData[course._id] = quizzesResponse.data.quizzes || [];
            }
          } catch (error) {
            console.error(`Error fetching quizzes for course ${course._id}:`, error);
            quizzesData[course._id] = [];
          }
        }
        
        setQuizzesByCourse(quizzesData);
      } else {
        toast.error(data.message || 'Failed to fetch enrolled courses');
        console.error('API returned success:false', data);
      }
    } catch (error) {
      toast.error('Failed to fetch enrolled courses');
      console.error('Error in fetchEnrolledCourses:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleTakeQuiz = (quizId) => {
    navigate(`/quiz/${quizId}`);
  };
  
  const handleViewResults = (quizId) => {
    navigate(`/quiz/${quizId}/results`);
  };
  
  // Count total quizzes and completed quizzes
  const getTotalQuizCounts = () => {
    let total = 0;
    let completed = 0;
    
    Object.values(quizzesByCourse).forEach(quizzes => {
      total += quizzes.length;
      completed += quizzes.filter(quiz => quiz.attempt !== null).length;
    });
    
    return { total, completed };
  };
  
  const { total: totalQuizzes, completed: completedQuizzes } = getTotalQuizCounts();
  
  if (loading) {
    return <Loading />;
  }
  
  return (
    <div className="grid grid-cols-[250px_1fr]">
      <UserSidebar />
      
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">My Quizzes</h1>
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
            >
              <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <div className="flex items-start">
                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                  <FiBookOpen className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Quizzes</p>
                  <h3 className="text-2xl font-bold">{totalQuizzes}</h3>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <div className="flex items-start">
                <div className="bg-green-100 p-3 rounded-lg mr-4">
                  <FiCheckCircle className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Completed</p>
                  <h3 className="text-2xl font-bold">{completedQuizzes}</h3>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <div className="flex items-start">
                <div className="bg-purple-100 p-3 rounded-lg mr-4">
                  <FiActivity className="text-purple-600" size={20} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Completion Rate</p>
                  <h3 className="text-2xl font-bold">
                    {totalQuizzes > 0 ? `${Math.round((completedQuizzes / totalQuizzes) * 100)}%` : '0%'}
                  </h3>
                </div>
              </div>
            </div>
          </div>
          
          {enrolledCourses.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet</p>
              <button
                onClick={() => navigate('/course-list')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Browse Courses
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {enrolledCourses.map((course) => {
                const courseQuizzes = quizzesByCourse[course._id] || [];
                
                if (courseQuizzes.length === 0) return null;
                
                return (
                  <div key={course._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-4 border-b flex justify-between items-center">
                      <div className="flex items-center">
                        <img 
                          src={course.courseThumbnail} 
                          alt={course.courseTitle} 
                          className="w-12 h-12 object-cover rounded-lg mr-4"
                        />
                        <h2 className="font-semibold text-lg">{course.courseTitle}</h2>
                      </div>
                      <div className="text-sm text-gray-500">
                        {courseQuizzes.length} {courseQuizzes.length === 1 ? 'quiz' : 'quizzes'}
                      </div>
                    </div>
                    
                    <div className="divide-y">
                      {courseQuizzes.map((quiz) => {
                        const hasTaken = quiz.attempt !== null;
                        const hasPassed = hasTaken && quiz.attempt.passed;
                        
                        return (
                          <div key={quiz._id} className="p-4 hover:bg-gray-50">
                            <div className="flex justify-between items-center">
                              <div className="flex-1">
                                <h3 className="font-medium">{quiz.title}</h3>
                                {quiz.description && (
                                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">{quiz.description}</p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                  <div className="flex items-center">
                                    <FiBookOpen className="mr-1" />
                                    <span>{quiz.totalQuestions} Questions</span>
                                  </div>
                                  
                                  {quiz.timeLimit && (
                                    <div className="flex items-center">
                                      <FiClock className="mr-1" />
                                      <span>{quiz.timeLimit} minutes</span>
                                    </div>
                                  )}
                                  
                                  {hasTaken && (
                                    <div className="flex items-center">
                                      <span>Score: {quiz.attempt.percentage.toFixed(1)}%</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="ml-4 flex items-center">
                                {hasTaken ? (
                                  <>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-3 ${
                                      hasPassed 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {hasPassed ? 'Passed' : 'Failed'}
                                    </span>
                                    <button
                                      onClick={() => handleViewResults(quiz._id)}
                                      className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md text-sm hover:bg-gray-200"
                                    >
                                      View Results
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => handleTakeQuiz(quiz._id)}
                                    className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                                  >
                                    Take Quiz
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* If there are enrolled courses but no quizzes */}
          {enrolledCourses.length > 0 && Object.values(quizzesByCourse).flat().length === 0 && (
            <div className="text-center py-10 bg-white rounded-lg shadow-sm mt-8">
              <p className="text-gray-500">No quizzes available for your courses yet</p>
              <p className="text-sm text-gray-400 mt-2">Check back later as educators may add quizzes to your courses</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentQuizzes; 