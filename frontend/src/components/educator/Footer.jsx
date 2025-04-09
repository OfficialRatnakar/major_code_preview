import { assets } from '../../assets/assets';
import logo from './logo.svg'

const Footer = () => {
  return (
    <footer className="flex md:flex-row flex-col-reverse items-center justify-between text-left w-full px-8 border-t">
      <div className='flex items-center gap-4'>
        <div className='flex items-center gap-2'>
          <img src={logo} alt="Logo" className="w-8 lg:w-10" />
          <p className='text-2xl font-bold text-gray-50'>NextLearn</p>
        </div>
        <div className='hidden md:block h-7 w-px bg-gray-500/60'></div>
        <div className="flex gap-4 text-sm text-gray-500">
          <a href="/educator/dashboard">Dashboard</a>
          <a href="/educator/courses">My Courses</a>
          <a href="/educator/analytics">Analytics</a>
          <a href="/educator/settings">Settings</a>
        </div>
        <div className='hidden md:block h-7 w-px bg-gray-500/60'></div>
        <p className="py-4 text-center text-xs md:text-sm text-gray-500">
          Copyright 2025 © NextLearn. All Right Reserved.
        </p>
      </div>
      <div className='flex items-center gap-3 max-md:mt-4'>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
          <img src={assets.facebook_icon} alt="facebook_icon" />
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
          <img src={assets.twitter_icon} alt="twitter_icon" />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
          <img src={assets.instagram_icon} alt="instagram_icon" />
        </a>
      </div>
    </footer>
  );
};

export default Footer;