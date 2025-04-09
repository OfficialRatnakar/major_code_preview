import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import YouTube from 'react-youtube';
import { assets } from '../../assets/assets';
import { useParams } from 'react-router-dom';
import humanizeDuration from 'humanize-duration';
import axios from 'axios';
import { toast } from 'react-toastify';
import Rating from '../../components/student/Rating';
import Footer from '../../components/student/Footer';

const Player = () => {
  const { enrolledCourses, backendUrl, getToken, calculateChapterTime, userData, fetchUserEnrolledCourses } = useContext(AppContext)

  const { courseId } = useParams()
  const [courseData, setCourseData] = useState(null)
  const [progressData, setProgressData] = useState(null)
  const [openSections, setOpenSections] = useState({});
  const [playerData, setPlayerData] = useState(null);
  const [initialRating, setInitialRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch course data directly from the server if not in enrolled courses
  const fetchCourseData = async () => {
    try {
      console.log("Fetching course data from server for ID:", courseId);
      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/api/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (data.success) {
        console.log("Course data fetched successfully:", data.courseData.courseTitle);
        setCourseData(data.courseData);
        setLoading(false);
      } else {
        console.error("Failed to fetch course data:", data.message);
        setError("Failed to load course data");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching course data:", error);
      setError("Error loading course data");
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Player component mounted with courseId:", courseId);
    
    if (!courseId) {
      console.error("No course ID provided");
      setError("No course ID provided");
      setLoading(false);
      return;
    }
    
    // First try to find the course in enrolled courses
    if (enrolledCourses && enrolledCourses.length > 0) {
      const foundCourse = enrolledCourses.find(course => course._id === courseId);
      if (foundCourse) {
        console.log("Course found in enrolled courses:", foundCourse.courseTitle);
        setCourseData(foundCourse);
        foundCourse.courseRatings.forEach((item) => {
          if (item.userId === userData?._id) {
            setInitialRating(item.rating);
          }
        });
        setLoading(false);
      } else {
        // If not found in enrolled courses, fetch from server
        console.log("Course not found in enrolled courses, fetching from server");
        fetchCourseData();
      }
    } else {
      // If no enrolled courses, fetch from server
      console.log("No enrolled courses, fetching from server");
      fetchCourseData();
    }
  }, [courseId]);

  // Fetch course progress
  useEffect(() => {
    const getCourseProgress = async () => {
      if (!courseId) return;
      
      try {
        const token = await getToken();
        const { data } = await axios.post(
          `${backendUrl}/api/user/get-course-progress`,
          { courseId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (data.success) {
          console.log("Course progress fetched successfully");
          setProgressData(data.progressData);
        } else {
          console.error("Failed to fetch course progress:", data.message);
        }
      } catch (error) {
        console.error("Error fetching course progress:", error);
      }
    };

    if (courseId) {
      getCourseProgress();
    }
  }, [courseId]);

  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const markLectureAsCompleted = async (lectureId) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/user/update-course-progress`,
        { courseId, lectureId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (data.success) {
        toast.success(data.message);
        // Refresh progress data
        const progressResponse = await axios.post(
          `${backendUrl}/api/user/get-course-progress`,
          { courseId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (progressResponse.data.success) {
          setProgressData(progressResponse.data.progressData);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleRate = async (rating) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/user/add-rating`,
        { courseId, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (data.success) {
        toast.success(data.message);
        // Refresh course data to update ratings
        fetchCourseData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const extractYoutubeId = (url) => {
    if (!url) return '';
    
    // Handle different YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11)
      ? match[2]
      : url.split('/').pop(); // Fallback to the original logic
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mb-2"></div>
          <p className="text-gray-500">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p>{error}</p>
          </div>
          <button 
            onClick={() => window.location.href = '/user-dashboard'}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p>Course not found or not enrolled</p>
          </div>
          <button 
            onClick={() => window.location.href = '/user-dashboard'}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className='p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10 md:px-36'>
        <div className="text-gray-800">
          <h2 className="text-xl font-semibold">Course Structure</h2>
          <div className="pt-5">
            {courseData && courseData.courseContent && courseData.courseContent.map((chapter, index) => (
              <div key={index} className="border border-gray-300 bg-white mb-2 rounded">
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                  onClick={() => toggleSection(index)}
                >
                  <div className="flex items-center gap-2">
                    <img src={assets.down_arrow_icon} alt="arrow icon" className={`transform transition-transform ${openSections[index] ? "rotate-180" : ""}`} />
                    <p className="font-medium md:text-base text-sm">{chapter.chapterTitle}</p>
                  </div>
                  <p className="text-sm md:text-default">{chapter.chapterContent.length} lectures - {calculateChapterTime(chapter)}</p>
                </div>

                <div className={`overflow-hidden transition-all duration-300 ${openSections[index] ? "max-h-96" : "max-h-0"}`}>
                  <ul className="list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300">
                    {chapter.chapterContent.map((lecture, i) => (
                      <li key={i} className="flex items-start gap-2 py-1">
                        <img src={progressData && progressData.lectureCompleted && progressData.lectureCompleted.includes(lecture.lectureId) ? assets.blue_tick_icon : assets.play_icon} alt="bullet icon" className="w-4 h-4 mt-1" />
                        <div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-default">
                          <p>{lecture.lectureTitle}</p>
                          <div className='flex gap-2'>
                            {lecture.lectureUrl && <p onClick={() => setPlayerData({ ...lecture, chapter: index + 1, lecture: i + 1 })} className='text-blue-500 cursor-pointer'>Watch</p>}
                            <p>{humanizeDuration(lecture.lectureDuration * 60 * 1000, { units: ['h', 'm'] })}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 py-3 mt-10">
            <h1 className="text-xl font-bold">Rate this Course:</h1>
            <Rating initialRating={initialRating} onRate={handleRate} />
          </div>
        </div>

        <div className='md:mt-10'>
          {playerData ? (
            <div>
              <YouTube 
                iframeClassName='w-full aspect-video' 
                videoId={extractYoutubeId(playerData.lectureUrl)}
                opts={{
                  width: '100%',
                  playerVars: {
                    autoplay: 1,
                  },
                }} 
              />
              <div className='flex justify-between items-center mt-1'>
                <p className='text-xl'>{playerData.chapter}.{playerData.lecture} {playerData.lectureTitle}</p>
                <button 
                  onClick={() => markLectureAsCompleted(playerData.lectureId)} 
                  className='text-blue-600'
                >
                  {progressData && progressData.lectureCompleted && progressData.lectureCompleted.includes(playerData.lectureId) ? 'Completed' : 'Mark Complete'}
                </button>
              </div>
            </div>
          ) : (
            <img src={courseData ? courseData.courseThumbnail : ''} alt="" />
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Player