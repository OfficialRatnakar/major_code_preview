import { Routes, Route, useMatch, Navigate } from 'react-router-dom'
import Navbar from './components/student/Navbar'
import Home from './pages/student/Home'
import CourseDetails from './pages/student/CourseDetails'
import CoursesList from './pages/student/CoursesList'
import Dashboard from './pages/educator/Dashboard'
import AddCourse from './pages/educator/AddCourse'
import MyCourses from './pages/educator/MyCourses'
import StudentsEnrolled from './pages/educator/StudentsEnrolled'
import Educator from './pages/educator/Educator'
import 'quill/dist/quill.snow.css'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
import Player from './pages/student/Player'
import Loading from './components/student/Loading'
import UserDashboard from './pages/student/UserDashboard'
import UserProgress from './pages/student/UserProgress'
import CreateQuiz from './pages/educator/CreateQuiz'
import TakeQuiz from './pages/student/TakeQuiz'
import QuizzesDashboard from './pages/educator/QuizzesDashboard'
import StudentQuizzes from './pages/student/StudentQuizzes'
import QuizStatistics from './pages/educator/QuizStatistics'
import Chat from './pages/student/Chat'
import ChatList from './pages/student/ChatList'
// Import new pages
import MyLearning from './pages/student/MyLearning'
import Certificates from './pages/student/Certificates'
import HelpCenter from './pages/student/HelpCenter'
import LearningBlog from './pages/student/resources/LearningBlog'
import StudyMaterials from './pages/student/resources/StudyMaterials'
import StudentCommunity from './pages/student/resources/StudentCommunity'
import CareerServices from './pages/student/resources/CareerServices'

const App = () => {
  // Check if current route is educator route
  const isEducatorRoute = useMatch('/educator/*');
  // Check if current route is user dashboard route
  const isUserDashboardMatch = useMatch('/user-dashboard');
  const isUserProgressMatch = useMatch('/user-progress');
  const isTakeQuizMatch = useMatch('/quiz/:quizId');
  const isStudentQuizzesMatch = useMatch('/student/quizzes');
  // Combine multiple matches for readability
  const isUserDashboardRoute = Boolean(isUserDashboardMatch || isUserProgressMatch || isTakeQuizMatch || isStudentQuizzesMatch);

  // Custom redirect component that preserves the course ID
  const CourseRedirect = () => {
    const match = useMatch('/educator/courses/:courseId');
    const courseId = match ? match.params.courseId : null;
    
    return (
      <Navigate 
        to="/educator/my-courses" 
        replace 
        state={{ fromCourseId: courseId }}
      />
    );
  };

  return (
    <div className="text-default min-h-screen bg-white">
      <ToastContainer />
      {/* Only show navbar on non-dashboard pages */}
      {!isEducatorRoute && !isUserDashboardRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/course/:id" element={<CourseDetails />} />
        <Route path="/course-list" element={<CoursesList />} />
        <Route path="/course-list/:input" element={<CoursesList />} />
        {/* Redirect my-enrollments to the new dashboard */}
        <Route path="/my-enrollments" element={<Navigate to="/user-dashboard" replace />} />
        <Route path="/player/:courseId" element={<Player />} />
        <Route path="/loading/:path" element={<Loading />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/user-progress" element={<UserProgress />} />
        <Route path="/quiz/:quizId" element={<TakeQuiz />} />
        <Route path="/quiz/:quizId/results" element={<TakeQuiz />} />
        <Route path="/student/quizzes" element={<StudentQuizzes />} />
        <Route path="/chats" element={<ChatList />} />
        <Route path="/chat/:chatId" element={<Chat />} />
        
        {/* New routes for student resources */}
        <Route path="/my-learning" element={<MyLearning />} />
        <Route path="/certificates" element={<Certificates />} />
        <Route path="/help-center" element={<HelpCenter />} />
        <Route path="/learning-blog" element={<LearningBlog />} />
        <Route path="/study-materials" element={<StudyMaterials />} />
        <Route path="/student-community" element={<StudentCommunity />} />
        <Route path="/career-services" element={<CareerServices />} />

        <Route path='/educator' element={<Educator />}>
          <Route path='/educator' element={<Dashboard />} />
          <Route path='add-course' element={<AddCourse />} />
          <Route path='my-courses' element={<MyCourses />} />
          <Route path='student-enrolled' element={<StudentsEnrolled />} />
          <Route path='quizzes' element={<QuizzesDashboard />} />
          <Route path='courses/:courseId/quizzes/create' element={<CreateQuiz />} />
          <Route path='courses/:courseId/quizzes/:quizId/edit' element={<CreateQuiz />} />
          <Route path='courses/:courseId/quizzes/:quizId/statistics' element={<QuizStatistics />} />
          <Route path='courses/:courseId' element={<CourseRedirect />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App