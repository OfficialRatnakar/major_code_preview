import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { assets } from '../../assets/assets';
import UserSidebar from '../../components/student/UserSidebar';
import { toast } from 'react-toastify';
import { AppContext } from '../../context/AppContext';
import { Link } from 'react-router-dom';
import YouTube from 'react-youtube';
import humanizeDuration from 'humanize-duration';

const UserDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    enrolledCourses: [],
    completedCourses: 0,
    totalProgress: 0,
    recentActivity: []
  });
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [previewActive, setPreviewActive] = useState(false);
  const [freeLectures, setFreeLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { backendUrl, getToken } = useContext(AppContext);

  useEffect(() => {
    const fetchUserDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = await getToken();
        console.log("Token obtained, making API request...");
        console.log("Backend URL:", backendUrl);
        
        // First attempt to use the api/user/dashboard-data endpoint directly
        try {
          const response = await axios.get(`${backendUrl}/api/user/dashboard-data`, {
            headers: { 
              Authorization: `Bearer ${token}` 
            }
          });
          
          console.log("API response received:", response.status);
          
          if (response.data.success) {
            console.log("Dashboard data:", response.data.dashboardData);
            setDashboardData(response.data.dashboardData);
            
            // If we have enrolled courses, fetch free lectures for the first one
            if (response.data.dashboardData.enrolledCourses && 
                response.data.dashboardData.enrolledCourses.length > 0) {
              console.log("Setting selected course from data");
              setSelectedCourse(response.data.dashboardData.enrolledCourses[0]);
            } else {
              console.log("No enrolled courses found in data");
            }
            return; // Exit if successful
          }
        } catch (error) {
          console.error("First API attempt failed:", error.message);
          // Don't throw yet, try the fallback method
        }
        
        // If the first attempt fails, try using the user enrolled courses endpoint as a fallback
        console.log("Trying fallback method...");
        const enrolledResponse = await axios.get(`${backendUrl}/api/user/enrolled-courses`, {
          headers: { 
            Authorization: `Bearer ${token}` 
          }
        });
        
        if (enrolledResponse.data.success) {
          console.log("Retrieved enrolled courses:", enrolledResponse.data.enrolledCourses);
          
          const enrolledCourses = enrolledResponse.data.enrolledCourses || [];
          let completedCount = 0;
          let totalProgressSum = 0;
          
          // Process enrolled courses to extract progress
          for (const course of enrolledCourses) {
            // Request progress for each course
            const progressResponse = await axios.post(`${backendUrl}/api/user/get-course-progress`, 
              { courseId: course._id },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (progressResponse.data.success && progressResponse.data.progressData) {
              const progress = calculateCourseProgress(course, progressResponse.data.progressData);
              course.progress = progress;
              totalProgressSum += progress;
              
              if (progress === 100) {
                completedCount++;
              }
            }
          }
          
          // Calculate average progress
          const totalProgress = enrolledCourses.length > 0 
            ? Math.round(totalProgressSum / enrolledCourses.length) 
            : 0;
          
          // Set dashboard data using enrolled courses data
          setDashboardData({
            enrolledCourses,
            completedCourses: completedCount,
            totalProgress,
            recentActivity: [] // No activity data in this fallback
          });
          
          // Set selected course
          if (enrolledCourses.length > 0) {
            setSelectedCourse(enrolledCourses[0]);
          }
        } else {
          console.error("Fallback method also failed");
          throw new Error(enrolledResponse.data.message || 'Failed to retrieve enrolled courses');
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError('Network or server error while fetching dashboard data');
        toast.error('Something went wrong while fetching dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDashboardData();
  }, [backendUrl, getToken]);

  // Load free lectures when a course is selected
  useEffect(() => {
    if (selectedCourse && selectedCourse.courseContent) {
      console.log("Loading free lectures for selected course");
      try {
        const lectures = [];
        selectedCourse.courseContent.forEach(chapter => {
          if (chapter && chapter.chapterContent) {
            chapter.chapterContent.forEach(lecture => {
              if (lecture && lecture.isPreviewFree) {
                lectures.push({
                  ...lecture,
                  chapterTitle: chapter.chapterTitle
                });
              }
            });
          }
        });
        console.log(`Found ${lectures.length} free lectures`);
        setFreeLectures(lectures);
      } catch (err) {
        console.error("Error processing free lectures:", err);
      }
    }
  }, [selectedCourse]);

  const handleCourseSelect = (course) => {
    console.log("Course selected:", course.courseTitle);
    setSelectedCourse(course);
    setPreviewActive(false);
  };

  const continueLearning = (courseId) => {
    console.log("Continuing to course player:", courseId);
    
    // Check if the course exists in enrolled courses
    const course = dashboardData.enrolledCourses.find(c => c._id === courseId);
    if (!course) {
      console.error("Course not found in enrolled courses");
      toast.error("Course not found. Please try again.");
      return;
    }
    
    console.log("Course found, navigating to player");
    // Use window.location for a full page reload to ensure clean state
    window.location.href = `/player/${courseId}`;
  };

  const getFreeLecturePreview = () => {
    if (freeLectures.length > 0) {
      console.log("Activating preview for lecture:", freeLectures[0].lectureTitle);
      setPreviewActive(true);
    } else {
      toast.info('No free preview available for this course');
    }
  };

  const extractYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const closePreview = () => {
    setPreviewActive(false);
  };

  const getCourseDetails = (course) => {
    // Get correct total duration for all lectures
    let totalDuration = 0;
    if (course.courseContent) {
      course.courseContent.forEach(chapter => {
        if (chapter && chapter.chapterContent) {
          chapter.chapterContent.forEach(lecture => {
            if (lecture && lecture.lectureDuration) {
              totalDuration += lecture.lectureDuration;
            }
          });
        }
      });
    }
    
    return {
      totalLectures: course.lectureCount || 0,
      totalChapters: course.chapterCount || 0,
      totalDuration
    };
  };

  const renderCourseStatistics = () => {
    if (!selectedCourse) return null;
    
    const { totalLectures, totalChapters, totalDuration } = getCourseDetails(selectedCourse);
    
    const statistics = [
      { icon: assets.time_clock_icon, label: "Duration", value: humanizeDuration(totalDuration * 1000, { largest: 1 }) },
      { icon: assets.lesson_icon, label: "Lectures", value: totalLectures },
      { icon: assets.my_course_icon, label: "Chapters", value: totalChapters },
    ];
    
    return (
      <div className="grid grid-cols-3 gap-3 mb-4">
        {statistics.map((stat, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-2 flex items-center">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-2">
              <img src={stat.icon} alt={stat.label} className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-gray-500 leading-none">{stat.label}</p>
              <p className="font-medium text-sm">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderMyCoursesSection = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mb-2"></div>
            <p className="text-gray-500">Loading your courses...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-10">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p>{error}</p>
          </div>
          <Link to="/course-list" className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg">
            Browse Courses
          </Link>
        </div>
      );
    }

    if (!dashboardData.enrolledCourses || dashboardData.enrolledCourses.length === 0) {
      return (
        <div className="text-center py-10">
          <img src={assets.my_course_icon} alt="No courses" className="w-16 h-16 mx-auto opacity-50 mb-4" />
          <p className="text-gray-500 mb-4">You haven&apos;t enrolled in any courses yet.</p>
          <Link to="/course-list" className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg">
            Browse Courses
          </Link>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Course list column */}
        <div className="lg:col-span-2 space-y-3 overflow-y-auto max-h-[600px] pr-2">
          {dashboardData.enrolledCourses.map((course, index) => (
            <div 
              key={index} 
              className={`border rounded-lg p-3 cursor-pointer transition-all duration-200 ${selectedCourse && selectedCourse._id === course._id ? 'bg-indigo-50 border-indigo-300' : 'hover:border-indigo-300'}`}
              onClick={() => handleCourseSelect(course)}
            >
              <div className="flex items-center">
                <img 
                  src={course.courseThumbnail || assets.course_1_thumbnail} 
                  alt={course.courseTitle} 
                  className="w-14 h-14 object-cover rounded-lg mr-3"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{course.courseTitle}</h3>
                  <div className="flex items-center mt-1">
                    <div className="w-20 h-1.5 bg-gray-200 rounded-full mr-2">
                      <div 
                        className="h-1.5 bg-indigo-600 rounded-full"
                        style={{ width: `${course.progress || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">{course.progress || 0}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Course details column */}
        <div className="lg:col-span-3 border rounded-lg p-5">
          {selectedCourse ? (
            <>
              <div className="flex items-start mb-4">
                <img 
                  src={selectedCourse.courseThumbnail || assets.course_1_thumbnail} 
                  alt={selectedCourse.courseTitle} 
                  className="w-16 h-16 object-cover rounded-lg mr-4 hidden sm:block"
                />
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold truncate">{selectedCourse.courseTitle}</h2>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {selectedCourse.courseDescription 
                      ? selectedCourse.courseDescription.replace(/<[^>]*>/g, '') 
                      : 'No description available'}
                  </p>
                </div>
              </div>

              {renderCourseStatistics()}

              {/* Preview and Continue buttons */}
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => {
                    console.log("Continue Learning clicked for course:", selectedCourse._id);
                    continueLearning(selectedCourse._id);
                  }}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex-1 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Continue Learning
                </button>
                <button 
                  onClick={getFreeLecturePreview}
                  className="border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg flex-1 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Preview Course
                </button>
              </div>

              {/* Course progress */}
              <div className="mt-5">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-sm">Course Progress</h3>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-indigo-600 mr-1"></div>
                    <span className="text-xs text-gray-500">{selectedCourse.progress || 0}% completed</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full">
                  <div 
                    className="h-1.5 bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${selectedCourse.progress || 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Last activity */}
              {dashboardData.recentActivity && dashboardData.recentActivity.length > 0 && (
                <div className="mt-5 border-t pt-4">
                  <h3 className="font-medium mb-2 text-sm">Last Activity</h3>
                  <div className="bg-gray-50 rounded-lg p-3 flex items-start">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <img src={assets.activity_icon} alt="Activity" className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium line-clamp-1">{dashboardData.recentActivity[0].title}</p>
                      <p className="text-xs text-gray-500">{dashboardData.recentActivity[0].date}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <img src={assets.my_course_icon} alt="Select a course" className="w-16 h-16 opacity-50 mb-4" />
              <p className="text-gray-500">Select a course to view details</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Dashboard shortcuts section
  const renderDashboardShortcuts = () => {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/my-learning" className="bg-white rounded-lg shadow p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-medium">My Learning</span>
            <span className="text-sm text-gray-500">View your courses</span>
          </Link>
          
          <Link to="/chats" className="bg-white rounded-lg shadow p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <span className="font-medium">Messages</span>
            <span className="text-sm text-gray-500">Chat with instructors</span>
          </Link>
          
          <Link to="/certificates" className="bg-white rounded-lg shadow p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="font-medium">Certificates</span>
            <span className="text-sm text-gray-500">View achievements</span>
          </Link>
          
          <Link to="/student/quizzes" className="bg-white rounded-lg shadow p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="font-medium">Quizzes</span>
            <span className="text-sm text-gray-500">Test your knowledge</span>
          </Link>
        </div>
      </div>
    );
  };

  // Function to complete the final missing part of the component
  const completeUserDashboard = () => {
    return (
      <div className="bg-white min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <UserSidebar />
            </div>
            <div className="md:col-span-3">
              <div className="mb-6">
                <h1 className="text-2xl font-bold mb-3">Dashboard</h1>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                  <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-500">Enrolled Courses</p>
                        <p className="text-lg font-bold">{dashboardData.enrolledCourses ? dashboardData.enrolledCourses.length : 0}</p>
                      </div>
                      <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center">
                        <img src={assets.my_course_icon} alt="Courses" className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-500">Completed Courses</p>
                        <p className="text-lg font-bold">{dashboardData.completedCourses || 0}</p>
                      </div>
                      <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center">
                        <img src={assets.certificate_icon} alt="Completed" className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-500">Overall Progress</p>
                        <p className="text-lg font-bold">{dashboardData.totalProgress || 0}%</p>
                      </div>
                      <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center">
                        <img src={assets.progress_icon} alt="Progress" className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* My Courses Section */}
                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-3">My Courses</h2>
                  {renderMyCoursesSection()}
                </div>
                
                {/* Recent Activity Section */}
                {dashboardData.recentActivity && dashboardData.recentActivity.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold mb-3">Recent Activity</h2>
                    <div className="border rounded-lg divide-y">
                      {dashboardData.recentActivity.map((activity, index) => (
                        <div 
                          key={index} 
                          className="p-3 flex items-start"
                        >
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                            <img src={assets.activity_icon} alt="Activity" className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm line-clamp-1">{activity.title}</p>
                            <p className="text-xs text-gray-500">{activity.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* YouTube Preview Modal */}
        {previewActive && freeLectures.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-3xl overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-bold">{freeLectures[0].lectureTitle}</h3>
                <button 
                  onClick={closePreview}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="aspect-w-16 aspect-h-9">
                {freeLectures[0].lectureVideo && (
                  <YouTube
                    videoId={extractYouTubeId(freeLectures[0].lectureVideo)}
                    opts={{
                      width: '100%',
                      height: '450',
                      playerVars: {
                        autoplay: 1,
                      },
                    }}
                  />
                )}
              </div>
              <div className="p-4 bg-gray-50">
                <h4 className="font-medium mb-2">From Chapter: {freeLectures[0].chapterTitle}</h4>
                <p className="text-sm text-gray-700">{freeLectures[0].lectureDescription}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Helper function to calculate course progress
  const calculateCourseProgress = (course, progressData) => {
    if (!course || !course.courseContent || !progressData) return 0;
    
    // Count total lectures
    let totalLectures = 0;
    course.courseContent.forEach(chapter => {
      if (chapter && chapter.chapterContent) {
        totalLectures += chapter.chapterContent.length;
      }
    });
    
    // Calculate progress
    const completedLectures = progressData.lectureCompleted?.length || 0;
    return totalLectures > 0 
      ? Math.round((completedLectures / totalLectures) * 100)
      : 0;
  };

  return completeUserDashboard();
};

export default UserDashboard; 