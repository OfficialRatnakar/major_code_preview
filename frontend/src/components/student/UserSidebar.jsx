import { NavLink, Link } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { useUser } from '@clerk/clerk-react';
import { useState } from 'react';

const UserSidebar = () => {
  // Use Clerk's useUser hook to get the currently logged in user
  const { user } = useUser();
  const [resourcesOpen, setResourcesOpen] = useState(false);

  // Custom community icon SVG
  const communityIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );

  // Career services icon SVG
  const careerIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );

  // Certificate icon SVG
  const certificateIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );

  const menuItems = [
    { name: 'Dashboard', path: '/user-dashboard', icon: assets.home_icon },
    { name: 'My Progress', path: '/user-progress', icon: assets.time_clock_icon },
    { name: 'Quizzes', path: '/student/quizzes', icon: assets.my_course_icon },
    { name: 'Messages', path: '/chats', icon: assets.message_icon },
    { name: 'Certificates', path: '/certificates', customIcon: certificateIcon },
    { name: 'Community', path: '/student-community', customIcon: communityIcon },
    { name: 'Career Services', path: '/career-services', customIcon: careerIcon },
  ];

  const resourceItems = [
    { name: 'Learning Blog', path: '/learning-blog' },
    { name: 'Study Materials', path: '/study-materials' },
  ];

  const toggleResources = () => {
    setResourcesOpen(!resourcesOpen);
  };

  return (
    <div className='md:w-64 w-16 border-r min-h-screen text-base border-gray-500 py-2 flex flex-col'>
      {/* User profile section */}
      <div className="flex flex-col items-center mb-8 mt-4 px-2">
        {user && (
          <>
            <div className="w-16 h-16 rounded-full overflow-hidden mb-2">
              <img 
                src={user.imageUrl || assets.user_icon} 
                alt={user.fullName} 
                className="w-full h-full object-cover"
              />
            </div>
            <p className='md:block hidden text-center font-medium'>{user.fullName}</p>
            <p className='md:block hidden text-center text-xs text-gray-500'>{user.primaryEmailAddress?.emailAddress}</p>
          </>
        )}
      </div>

      {/* Navigation links */}
      {menuItems.map((item) => (
        <NavLink
          to={item.path}
          key={item.name}
          end={item.path === '/user-dashboard'} 
          className={({ isActive }) =>
            `flex items-center md:flex-row flex-col md:justify-start justify-center py-3.5 md:px-10 gap-3 ${isActive
              ? 'bg-indigo-50 border-r-[6px] border-indigo-500/90'
              : 'hover:bg-gray-100/90 border-r-[6px] border-white hover:border-gray-100/90'
            }`
          }
        >
          {item.customIcon ? (
            <div className="text-gray-700">{item.customIcon}</div>
          ) : (
            <img src={item.icon} alt="" className="w-6 h-6" />
          )}
          <p className='md:block hidden text-center'>{item.name}</p>
        </NavLink>
      ))}

      {/* Resources dropdown */}
      <div className="relative">
        <button
          onClick={toggleResources}
          className={`w-full flex items-center md:flex-row flex-col md:justify-start justify-center py-3.5 md:px-10 gap-3 hover:bg-gray-100/90 border-r-[6px] border-white ${
            resourcesOpen ? 'bg-indigo-50 border-indigo-500/90' : 'hover:border-gray-100/90'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className='md:block hidden text-center'>Resources</p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`hidden md:block w-4 h-4 ml-auto transition-transform ${resourcesOpen ? 'transform rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {resourcesOpen && (
          <div className="md:pl-16 pl-0">
            {resourceItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center md:justify-start justify-center py-2 md:px-4 md:ml-4 hover:bg-gray-100/90 ${
                    isActive ? 'text-indigo-600 font-medium' : 'text-gray-700'
                  }`
                }
              >
                <span className="md:block hidden text-sm">{item.name}</span>
                <span className="md:hidden block text-xs">{item.name.charAt(0)}</span>
              </NavLink>
            ))}
          </div>
        )}
      </div>

      {/* Browse courses link */}
      <NavLink
        to="/course-list"
        className={({ isActive }) =>
          `flex items-center md:flex-row flex-col md:justify-start justify-center py-3.5 md:px-10 gap-3 ${isActive
            ? 'bg-indigo-50 border-r-[6px] border-indigo-500/90'
            : 'hover:bg-gray-100/90 border-r-[6px] border-white hover:border-gray-100/90'
          }`
        }
      >
        <img src={assets.lesson_icon} alt="" className="w-6 h-6" />
        <p className='md:block hidden text-center'>Browse Courses</p>
      </NavLink>

      {/* Back to home button */}
      <div className="mt-auto mb-6">
        <Link
          to="/"
          className="flex items-center md:flex-row flex-col md:justify-start justify-center py-3.5 md:px-10 gap-3 hover:bg-gray-100/90"
        >
          <img src={assets.arrow_icon} alt="" className="w-6 h-6 transform rotate-180" />
          <p className='md:block hidden text-center'>Back to Home</p>
        </Link>
      </div>
    </div>
  );
};

export default UserSidebar; 