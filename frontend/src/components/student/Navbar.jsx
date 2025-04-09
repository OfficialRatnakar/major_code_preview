import { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { useClerk, UserButton, useUser } from '@clerk/clerk-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import logo from './logo.svg';

const Navbar = () => {
  const location = useLocation();
  const { backendUrl, isEducator, setIsEducator, navigate, getToken } = useContext(AppContext);
  const { openSignIn } = useClerk();
  const { user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const becomeEducator = async () => {
    try {
      if (isEducator) {
        navigate('/educator');
        return;
      }

      const token = await getToken();
      const { data } = await axios.get(backendUrl + '/api/educator/update-role', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      if (data.success) {
        toast.success(data.message);
        setIsEducator(true);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className={`bg-white shadow-md ${scrolled ? 'fixed top-0 left-0 right-0 z-50' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img src={logo} alt="Logo" className="w-8 lg:w-10" />
              <span className="ml-2 text-xl font-bold text-gray-800">NextLearn</span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link to="/" className={`text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 ${location.pathname === '/' ? 'border-blue-500' : 'border-transparent hover:border-gray-300'}`}>
                Home
              </Link>
              <Link to="/course-list" className={`text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 ${location.pathname.includes('/course-list') ? 'border-blue-500' : 'border-transparent hover:border-gray-300'}`}>
                Courses
              </Link>
              <Link to="/help-center" className={`text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 ${location.pathname === '/help-center' ? 'border-blue-500' : 'border-transparent hover:border-gray-300'}`}>
                Help Center
              </Link>
              <Link to="/certificates" className={`text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 ${location.pathname === '/certificates' ? 'border-blue-500' : 'border-transparent hover:border-gray-300'}`}>
                Certificates
              </Link>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="hidden md:flex items-center">
            <Link to="/user-dashboard" className="text-gray-900 inline-flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100">
              Dashboard
            </Link>
            {user ? (
              <>
                {!isEducator && (
                  <button 
                    onClick={becomeEducator} 
                    className="text-gray-900 inline-flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
                  >
                    Become Educator
                  </button>
                )}
                {isEducator && (
                  <Link 
                    to="/educator" 
                    className="text-gray-900 inline-flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
                  >
                    Educator Dashboard
                  </Link>
                )}
                <div className="ml-3">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </>
            ) : (
              <button 
                onClick={() => openSignIn()} 
                className="ml-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link
            to="/"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              location.pathname === '/'
                ? 'border-blue-500 text-blue-700 bg-blue-50'
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/course-list"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              location.pathname.includes('/course-list')
                ? 'border-blue-500 text-blue-700 bg-blue-50'
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Courses
          </Link>
          <Link
            to="/help-center"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              location.pathname === '/help-center'
                ? 'border-blue-500 text-blue-700 bg-blue-50'
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Help Center
          </Link>
          
          <Link
            to="/user-dashboard"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              location.pathname === '/user-dashboard'
                ? 'border-blue-500 text-blue-700 bg-blue-50'
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Dashboard
          </Link>
          
          <Link
            to="/certificates"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              location.pathname === '/certificates'
                ? 'border-blue-500 text-blue-700 bg-blue-50'
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Certificates
          </Link>
          
          {user ? (
            <>
              {!isEducator && (
                <button
                  onClick={() => {
                    becomeEducator();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                >
                  Become Educator
                </button>
              )}
              {isEducator && (
                <Link
                  to="/educator"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Educator Dashboard
                </Link>
              )}
              <div className="pl-3 pr-4 py-2">
                <UserButton afterSignOutUrl="/" />
              </div>
            </>
          ) : (
            <button
              onClick={() => {
                openSignIn();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-blue-600 hover:bg-gray-50 hover:border-blue-300"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;