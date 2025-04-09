import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { assets } from '../../assets/assets';
import UserSidebar from '../../components/student/UserSidebar';
import { Line } from 'rc-progress';
import { toast } from 'react-toastify';
import { AppContext } from '../../context/AppContext';
import { Link } from 'react-router-dom';
import { FiChevronDown, FiChevronUp, FiCheckCircle, FiCircle, FiBookOpen, FiAward } from 'react-icons/fi';

const UserProgress = () => {
  const [coursesProgress, setCoursesProgress] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState({});
  const [expandedCourses, setExpandedCourses] = useState({});
  const [totalStats, setTotalStats] = useState({
    completedLectures: 0,
    totalLectures: 0,
    completedCourses: 0,
    enrolledCourses: 0,
    quizzesTaken: 0,
    quizzesPassed: 0
  });
  const { backendUrl, getToken } = useContext(AppContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        
        // Fetch courses progress
        const coursesResponse = await axios.get(`${backendUrl}/api/user/courses-progress`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch quiz results
        const quizResponse = await axios.get(`${backendUrl}/api/user/quiz-results`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (coursesResponse.data.success) {
          console.log("Courses progress data:", coursesResponse.data.coursesProgress);
          const courses = coursesResponse.data.coursesProgress;
          
          // Initialize expanded state for courses
          const initialExpandedCourses = {};
          courses.forEach((course, index) => {
            initialExpandedCourses[index] = index === 0; // Only expand first course by default
          });
          setExpandedCourses(initialExpandedCourses);
          
          setCoursesProgress(courses);
          
          // Calculate overall statistics
          let completedLectures = 0;
          let totalLectures = 0;
          let completedCourses = 0;
          
          courses.forEach(course => {
            totalLectures += course.lectureCount || 0;
            
            // Count completed lectures
            if (course.chaptersProgress) {
              course.chaptersProgress.forEach(chapter => {
                if (chapter.lectures) {
                  completedLectures += chapter.lectures.filter(lecture => lecture.completed).length;
                }
              });
            }
            
            // Count completed courses (100% progress)
            if (course.overallProgress === 100) {
              completedCourses++;
            }
          });
          
          // Quiz statistics
          let quizzesTaken = 0;
          let quizzesPassed = 0;
          
          if (quizResponse.data.success) {
            console.log("Quiz results:", quizResponse.data.quizResults);
            const quizzes = quizResponse.data.quizResults || [];
            setQuizResults(quizzes);
            
            quizzesTaken = quizzes.length;
            quizzesPassed = quizzes.filter(quiz => quiz.passed).length;
          }
          
          setTotalStats({
            completedLectures,
            totalLectures,
            completedCourses,
            enrolledCourses: courses.length,
            quizzesTaken,
            quizzesPassed
          });
          
        } else {
          toast.error(coursesResponse.data.message || 'Failed to fetch progress data');
        }
      } catch (error) {
        console.error("Error fetching progress data:", error);
        toast.error('Something went wrong while fetching progress data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [backendUrl, getToken]);

  const toggleChapter = (courseIndex, chapterIndex) => {
    const key = `${courseIndex}-${chapterIndex}`;
    setExpandedChapters(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleCourse = (courseIndex) => {
    setExpandedCourses(prev => ({
      ...prev,
      [courseIndex]: !prev[courseIndex]
    }));
  };

  return (
    <div className="flex">
      <UserSidebar />
      <div className="flex-1 p-4 overflow-y-auto max-h-screen bg-gray-50">
        <h1 className="text-xl font-bold mb-4">My Learning Progress</h1>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            {/* Overall Progress Statistics */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Overall Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-indigo-50 rounded p-3 flex items-center">
                  <div className="bg-indigo-100 p-2 rounded-full mr-3">
                    <FiBookOpen className="text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-indigo-600">
                      {totalStats.completedLectures}/{totalStats.totalLectures}
                    </div>
                    <div className="text-xs text-gray-500">Lectures</div>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded p-3 flex items-center">
                  <div className="bg-green-100 p-2 rounded-full mr-3">
                    <FiCheckCircle className="text-green-600" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-green-600">
                      {totalStats.completedCourses}/{totalStats.enrolledCourses}
                    </div>
                    <div className="text-xs text-gray-500">Courses</div>
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded p-3 flex items-center">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-100 mr-3">
                    <span className="text-sm font-bold text-purple-600">%</span>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-purple-600">
                      {totalStats.totalLectures > 0 
                        ? Math.round((totalStats.completedLectures / totalStats.totalLectures) * 100)
                        : 0}%
                    </div>
                    <div className="text-xs text-gray-500">Completion</div>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded p-3 flex items-center">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 mr-3">
                    <span className="text-sm font-bold text-blue-600">{totalStats.enrolledCourses}</span>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-blue-600">
                      Enrolled
                    </div>
                    <div className="text-xs text-gray-500">Courses</div>
                  </div>
                </div>
                
                <div className="bg-amber-50 rounded p-3 flex items-center">
                  <div className="bg-amber-100 p-2 rounded-full mr-3">
                    <FiAward className="text-amber-600" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-amber-600">
                      {totalStats.quizzesPassed}/{totalStats.quizzesTaken}
                    </div>
                    <div className="text-xs text-gray-500">Quizzes</div>
                  </div>
                </div>
                
                <div className="bg-pink-50 rounded p-3 flex items-center">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-pink-100 mr-3">
                    <span className="text-sm font-bold text-pink-600">
                      {totalStats.quizzesTaken > 0 
                        ? Math.round((totalStats.quizzesPassed / totalStats.quizzesTaken) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-pink-600">
                      Pass Rate
                    </div>
                    <div className="text-xs text-gray-500">Quizzes</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
              {/* Course Progress Cards */}
              <div className="lg:col-span-2">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Course Progress</h3>
                <div className="space-y-3">
                  {coursesProgress && coursesProgress.length > 0 ? (
                    coursesProgress.map((course, courseIndex) => (
                      <div key={courseIndex} className="bg-white rounded-lg shadow-sm overflow-hidden">
                        {/* Course Header - Always visible */}
                        <div 
                          className="p-3 flex items-center cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => toggleCourse(courseIndex)}
                        >
                          <img 
                            src={course.courseThumbnail || assets.course_1_thumbnail} 
                            alt={course.courseTitle} 
                            className="w-10 h-10 object-cover rounded mr-3"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h2 className="text-sm font-semibold truncate">{course.courseTitle}</h2>
                              <div className="flex items-center">
                                <span className="text-xs font-medium text-gray-500 mr-2">{course.overallProgress}%</span>
                                {expandedCourses[courseIndex] ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                              </div>
                            </div>
                            <div className="mt-1">
                              <Line 
                                percent={course.overallProgress} 
                                strokeWidth={3} 
                                strokeColor={course.overallProgress === 100 ? "#10B981" : "#6366F1"} 
                                trailWidth={3}
                                trailColor="#E5E7EB"
                              />
                            </div>
                          </div>
                        </div>
                        
                        {/* Course Details - Collapsible */}
                        {expandedCourses[courseIndex] && (
                          <div className="px-3 pb-3">
                            <div className="flex justify-between mb-2 px-1">
                              <span className="text-xs text-gray-500">
                                {course.chaptersProgress?.length || 0} chapters · {course.lectureCount || 0} lectures
                              </span>
                              <Link 
                                to={`/player/${course.courseId}`} 
                                className="text-indigo-600 text-xs font-medium hover:underline"
                              >
                                Continue Learning
                              </Link>
                            </div>
                            
                            {/* Chapters */}
                            <div className="space-y-2 mt-2">
                              {course.chaptersProgress && course.chaptersProgress.map((chapter, chapterIndex) => {
                                const isExpanded = expandedChapters[`${courseIndex}-${chapterIndex}`];
                                return (
                                  <div key={chapterIndex} className="border border-gray-100 rounded">
                                    <div 
                                      className="flex justify-between items-center p-2 cursor-pointer hover:bg-gray-50 transition-colors"
                                      onClick={() => toggleChapter(courseIndex, chapterIndex)}
                                    >
                                      <div className="flex items-center flex-1">
                                        <span className="w-5 h-5 flex items-center justify-center bg-gray-100 rounded-full text-xs mr-2">
                                          {chapterIndex + 1}
                                        </span>
                                        <h4 className="text-xs font-medium truncate">{chapter.chapterTitle}</h4>
                                      </div>
                                      <div className="flex items-center">
                                        <span className="text-xs text-gray-500 mr-2">{chapter.progress}%</span>
                                        {isExpanded ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
                                      </div>
                                    </div>
                                    
                                    {isExpanded && (
                                      <div className="p-2 bg-gray-50 rounded-b border-t">
                                        <Line 
                                          percent={chapter.progress} 
                                          strokeWidth={2} 
                                          strokeColor="#6366F1" 
                                          className="mb-2"
                                        />
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-2">
                                          {chapter.lectures && chapter.lectures.map((lecture, lectureIndex) => (
                                            <div key={lectureIndex} className="flex items-center py-1 px-2">
                                              {lecture.completed ? (
                                                <FiCheckCircle className="w-3 h-3 text-green-600 mr-2 flex-shrink-0" />
                                              ) : (
                                                <FiCircle className="w-3 h-3 text-gray-300 mr-2 flex-shrink-0" />
                                              )}
                                              <span className={`text-xs truncate ${lecture.completed ? "text-gray-700" : "text-gray-500"}`}>
                                                {lecture.lectureTitle}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                      <FiBookOpen className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                      <h2 className="text-base font-medium mb-2">No course progress yet</h2>
                      <p className="text-xs text-gray-500 mb-3">You have not started any courses yet.</p>
                      <Link to="/course-list" className="inline-block bg-indigo-600 text-white px-3 py-1 text-xs rounded">
                        Browse Courses
                      </Link>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Quiz Results */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Quiz Results</h3>
                <div className="bg-white rounded-lg shadow-sm p-4">
                  {quizResults && quizResults.length > 0 ? (
                    <div className="space-y-3">
                      {quizResults.map((quiz, index) => (
                        <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-sm font-medium">{quiz.quizTitle}</h4>
                            <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                              quiz.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {quiz.passed ? 'Passed' : 'Failed'}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">{quiz.courseName}</p>
                          <div className="flex justify-between text-xs">
                            <span>Score: {quiz.score}/{quiz.maxScore} ({quiz.percentage.toFixed(1)}%)</span>
                            <span className="text-gray-500">{new Date(quiz.completedAt).toLocaleDateString()}</span>
                          </div>
                          <Line 
                            percent={quiz.percentage} 
                            strokeWidth={3} 
                            strokeColor={quiz.passed ? "#10B981" : "#EF4444"} 
                            trailWidth={3}
                            trailColor="#E5E7EB"
                            className="mt-2"
                          />
                        </div>
                      ))}
                      <Link 
                        to="/student/quizzes" 
                        className="block text-center text-xs text-indigo-600 font-medium hover:underline mt-2"
                      >
                        View All Quizzes
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <FiAward className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                      <h2 className="text-base font-medium mb-1">No quiz attempts yet</h2>
                      <p className="text-xs text-gray-500 mb-3">Complete quizzes to see your results here.</p>
                      <Link to="/student/quizzes" className="inline-block bg-indigo-600 text-white px-3 py-1 text-xs rounded">
                        View Available Quizzes
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserProgress; 