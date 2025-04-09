import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loading from '../../components/student/Loading';
import { useNavigate, useLocation } from 'react-router-dom';
import QuizManager from '../../components/educator/QuizManager';

const MyCourses = () => {

  const { backendUrl, isEducator, currency, getToken } = useContext(AppContext)

  const [courses, setCourses] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Parse the redirected URL to check if we're coming from a course page
  useEffect(() => {
    if (courses && location.state && location.state.fromCourseId) {
      const course = courses.find(c => c._id === location.state.fromCourseId);
      if (course) {
        setSelectedCourse(course);
      }
    }
  }, [courses, location.state]);

  const fetchEducatorCourses = async () => {
    try {
      const token = await getToken()
      const { data } = await axios.get(backendUrl + '/api/educator/courses', { headers: { Authorization: `Bearer ${token}` } })
      
      if (data.success) {
        setCourses(data.courses);
        // Select the first course by default if there are courses
        if (data.courses.length > 0 && !selectedCourse) {
          setSelectedCourse(data.courses[0]);
        }
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (isEducator) {
      fetchEducatorCourses()
    }
  }, [isEducator])

  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
  };

  const handleCreateQuiz = (courseId) => {
    navigate(`/educator/courses/${courseId}/quizzes/create`);
  };

  return courses ? (
    <div className="h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0 overflow-y-auto">
      <div className='w-full'>
        <h2 className="pb-4 text-lg font-medium">My Courses</h2>
        <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
          <table className="md:table-auto table-fixed w-full overflow-hidden">
            <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left">
              <tr>
                <th className="px-4 py-3 font-semibold truncate">All Courses</th>
                <th className="px-4 py-3 font-semibold truncate">Earnings</th>
                <th className="px-4 py-3 font-semibold truncate">Students</th>
                <th className="px-4 py-3 font-semibold truncate">Published On</th>
                <th className="px-4 py-3 font-semibold truncate">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-500">
              {courses.map((course) => (
                <tr 
                  key={course._id} 
                  className={`border-b border-gray-500/20 ${selectedCourse && selectedCourse._id === course._id ? 'bg-blue-50' : ''}`}
                  onClick={() => handleSelectCourse(course)}
                  style={{ cursor: 'pointer' }}
                >
                  <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                    <img src={course.courseThumbnail} alt="Course Image" className="w-16 h-12 object-cover rounded" />
                    <span className="truncate hidden md:block">{course.courseTitle}</span>
                  </td>
                  <td className="px-4 py-3">{currency} {Math.floor(course.enrolledStudents.length * (course.coursePrice - course.discount * course.coursePrice / 100))}</td>
                  <td className="px-4 py-3">{course.enrolledStudents.length}</td>
                  <td className="px-4 py-3">
                    {new Date(course.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreateQuiz(course._id);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700"
                    >
                      Add Quiz
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Course Content section */}
      {selectedCourse && (
        <div className="mt-8 w-full max-w-4xl">
          <h2 className="text-xl font-bold mb-6 text-gray-800">
            Quizzes for: {selectedCourse.courseTitle}
          </h2>
          
          {/* Quiz Management Section */}
          <QuizManager courseId={selectedCourse._id} />
        </div>
      )}
    </div>
  ) : <Loading />
};

export default MyCourses;