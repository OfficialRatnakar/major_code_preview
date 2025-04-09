import { Link } from 'react-router-dom';
import logo from './logo.svg'

const Footer = () => {
  return (
    <footer className="bg-gray-900 md:px-36 text-left w-full mt-10">
      <div className="flex flex-col md:flex-row items-start px-8 md:px-0 justify-center gap-10 md:gap-32 py-10 border-b border-white/30">

        <div className="flex flex-col md:items-start items-center w-full">
          <Link to="/" className='flex items-center gap-2'>
            <img src={logo} alt="Logo" className="w-8 lg:w-10" />
            <p className='text-2xl font-bold text-gray-50'>NextLearn</p>
          </Link>
          <p className="mt-6 text-center md:text-left text-sm text-white/80">
            Empowering learners worldwide with quality education. Join our community of lifelong learners and unlock your potential.
          </p>
        </div>

        <div className="flex flex-col md:items-start items-center w-full">
          <h2 className="font-semibold text-white mb-5">Quick Links</h2>
          <ul className="flex md:flex-col w-full justify-between text-sm text-white/80 md:space-y-2">
            <li><Link to="/course-list">Browse Courses</Link></li>
            <li><Link to="/my-learning">My Learning</Link></li>
            <li><Link to="/certificates">Certificates</Link></li>
            <li><Link to="/help-center">Help Center</Link></li>
          </ul>
        </div>

        <div className="flex flex-col md:items-start items-center w-full">
          <h2 className="font-semibold text-white mb-5">Resources</h2>
          <ul className="flex md:flex-col w-full justify-between text-sm text-white/80 md:space-y-2">
            <li><Link to="/learning-blog">Learning Blog</Link></li>
            <li><Link to="/study-materials">Study Materials</Link></li>
            <li><Link to="/student-community">Student Community</Link></li>
            <li><Link to="/career-services">Career Services</Link></li>
          </ul>
        </div>

        <div className="hidden md:flex flex-col items-start w-full">
          <h2 className="font-semibold text-white mb-5">Subscribe to our newsletter</h2>
          <p className="text-sm text-white/80">
            The latest news, articles, and resources, sent to your inbox weekly.
          </p>
          <div className="flex items-center gap-2 pt-4">
            <input className="border border-gray-500/30 bg-gray-800 text-gray-500 placeholder-gray-500 outline-none w-64 h-9 rounded px-2 text-sm" type="email" placeholder="Enter your email" />
            <button className="bg-blue-600 w-24 h-9 text-white rounded">Subscribe</button>
          </div>
        </div>

      </div>
      <p className="py-4 text-center text-xs md:text-sm text-white/60">
        Copyright 2025 © NextLearn. All Right Reserved.
      </p>
    </footer>
  );
};

export default Footer;
