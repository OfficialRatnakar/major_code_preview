import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MyLearning = () => {
  const [activeTab, setActiveTab] = useState('in-progress');
  const navigate = useNavigate();

  const enrolledCourses = [
    {
      id: 1,
      title: 'Introduction to Web Development',
      instructor: 'John Doe',
      progress: 65,
      lastAccessed: '2024-03-15',
      image: 'https://via.placeholder.com/300x200',
      nextLesson: 'CSS Flexbox and Grid'
    },
    {
      id: 2,
      title: 'Advanced JavaScript',
      instructor: 'Jane Smith',
      progress: 30,
      lastAccessed: '2024-03-14',
      image: 'https://via.placeholder.com/300x200',
      nextLesson: 'Async/Await'
    }
  ];

  const completedCourses = [
    {
      id: 3,
      title: 'HTML Fundamentals',
      instructor: 'Mike Johnson',
      completedDate: '2024-02-28',
      grade: 'A',
      image: 'https://via.placeholder.com/300x200'
    }
  ];

  const learningStats = {
    totalCourses: 3,
    completedCourses: 1,
    inProgressCourses: 2,
    totalHoursLearned: 45,
    certificatesEarned: 1
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Learning</h1>

      {/* Learning Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-600">Total Courses</h3>
          <p className="text-2xl font-bold">{learningStats.totalCourses}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-600">Completed</h3>
          <p className="text-2xl font-bold">{learningStats.completedCourses}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-600">In Progress</h3>
          <p className="text-2xl font-bold">{learningStats.inProgressCourses}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-600">Hours Learned</h3>
          <p className="text-2xl font-bold">{learningStats.totalHoursLearned}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-600">Certificates</h3>
          <p className="text-2xl font-bold">{learningStats.certificatesEarned}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b">
          <nav className="-mb-px flex">
            <button
              className={`py-2 px-4 border-b-2 ${
                activeTab === 'in-progress'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500'
              }`}
              onClick={() => setActiveTab('in-progress')}
            >
              In Progress
            </button>
            <button
              className={`py-2 px-4 border-b-2 ${
                activeTab === 'completed'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500'
              }`}
              onClick={() => setActiveTab('completed')}
            >
              Completed
            </button>
          </nav>
        </div>
      </div>

      {/* Course List */}
      <div className="space-y-4">
        {activeTab === 'in-progress' ? (
          enrolledCourses.map(course => (
            <div key={course.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <img src={course.image} alt={course.title} className="w-full md:w-48 h-32 object-cover rounded" />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-2">Instructor: {course.instructor}</p>
                  <div className="mb-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{course.progress}% Complete</p>
                  </div>
                  <p className="text-sm text-gray-600">Next Lesson: {course.nextLesson}</p>
                  <button
                    onClick={() => navigate(`/course/${course.id}`)}
                    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Continue Learning
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          completedCourses.map(course => (
            <div key={course.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <img src={course.image} alt={course.title} className="w-full md:w-48 h-32 object-cover rounded" />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-2">Instructor: {course.instructor}</p>
                  <p className="text-gray-600 mb-2">Completed: {course.completedDate}</p>
                  <p className="text-gray-600 mb-2">Grade: {course.grade}</p>
                  <button
                    onClick={() => navigate(`/certificates/${course.id}`)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    View Certificate
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyLearning; 