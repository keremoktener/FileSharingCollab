import React, { useEffect, useState, useRef } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Link as ScrollLink, Element } from 'react-scroll';
import { motion } from 'framer-motion';
import { useKeenSlider, KeenSliderInstance } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

// Icons
import { 
  UserPlusIcon, 
  ArrowUpTrayIcon, 
  ShieldCheckIcon, 
  DevicePhoneMobileIcon,
  RocketLaunchIcon,
  LockClosedIcon,
  FolderIcon,
  LinkIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2
    }
  }
};

// Feature card animation
const featureCard = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  },
  rest: { 
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
  hover: { 
    scale: 1.03,
    y: -5,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Keen Slider for testimonials
  const [sliderRef, instanceRef] = useKeenSlider({
    loop: true,
    slides: {
      perView: 1,
      spacing: 16,
    },
    slideChanged(slider) {
      setCurrentTestimonial(slider.track.details.rel);
    },
  });

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const testimonials = [
    {
      quote: "This file sharing platform has transformed how our team collaborates. The combination of top-notch security and user-friendly interface makes sharing sensitive documents completely effortless.",
      name: "Sarah Johnson",
      title: "Product Manager at TechCorp",
      avatar: "https://randomuser.me/api/portraits/women/42.jpg"
    },
    {
      quote: "I've tried many file sharing solutions, but this one stands out for its speed and reliability. I can access my files from anywhere, and the security features give me peace of mind.",
      name: "David Chen",
      title: "Freelance Designer",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      quote: "The interface is intuitive and the upload speeds are impressive. This platform has become an essential part of our remote workflow.",
      name: "Emily Rodriguez",
      title: "Project Lead at CreativeStudio",
      avatar: "https://randomuser.me/api/portraits/women/28.jpg"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 dark:text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">File Sharing Platform</h1>
            </div>
            
            <div className="flex items-center space-x-6">
              <nav className="hidden md:flex space-x-6">
                <ScrollLink 
                  to="how-it-works" 
                  smooth={true} 
                  duration={500} 
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                >
                  How It Works
                </ScrollLink>
                <ScrollLink 
                  to="features" 
                  smooth={true} 
                  duration={500}
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                >
                  Features
                </ScrollLink>
                <ScrollLink 
                  to="pricing" 
                  smooth={true} 
                  duration={500}
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                >
                  Pricing
                </ScrollLink>
              </nav>
              <ThemeToggle />
              <RouterLink to="/login" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">Login</RouterLink>
              <RouterLink to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">Sign Up</RouterLink>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="py-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            {/* Background elements */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-30 transform translate-x-1/3 -translate-y-1/4"></div>
              <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-indigo-100 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-30 transform -translate-x-1/3 translate-y-1/4"></div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
              <motion.div 
                className="text-center md:text-left"
                initial="hidden"
                animate="visible"
                variants={staggerChildren}
              >
                <motion.h1 
                  className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white"
                  variants={fadeIn}
                >
                  <span className="block">Secure File Sharing,</span>
                  <span className="block text-blue-600 dark:text-blue-500">Simplified.</span>
                </motion.h1>
                <motion.p 
                  className="mt-6 text-xl text-gray-600 dark:text-gray-300 max-w-xl mx-auto md:mx-0"
                  variants={fadeIn}
                >
                  Upload, manage, and share your files effortlessly — all in one place.
                </motion.p>
                <motion.div 
                  className="mt-10 flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
                  variants={fadeIn}
                >
                  <RouterLink
                    to="/register"
                    className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                  >
                    Get Started
                    <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </RouterLink>
                  <RouterLink
                    to="/login"
                    className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-md hover:shadow-lg"
                  >
                    Login
                  </RouterLink>
                </motion.div>
              </motion.div>
              
              <motion.div 
                className="flex justify-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              >
                <div className="relative w-full max-w-lg">
                  {/* File illustration */}
                  <div className="relative z-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transform transition-all hover:scale-105 duration-300">
                    <div className="p-1 bg-gradient-to-r from-blue-600 to-indigo-600">
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-8">
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex space-x-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">File Sharing</div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center px-4">
                            <div className="w-5 h-5 rounded-full bg-blue-500 mr-3"></div>
                            <div className="h-3 w-3/4 bg-blue-200 dark:bg-blue-700 rounded-full"></div>
                          </div>
                          <div className="h-10 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center px-4">
                            <div className="w-5 h-5 rounded-full bg-gray-400 dark:bg-gray-600 mr-3"></div>
                            <div className="h-3 w-2/4 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                          </div>
                          <div className="h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center px-4">
                            <div className="w-5 h-5 rounded-full bg-indigo-500 mr-3"></div>
                            <div className="h-3 w-3/5 bg-indigo-200 dark:bg-indigo-700 rounded-full"></div>
                          </div>
                          <div className="h-10 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center px-4">
                            <div className="w-5 h-5 rounded-full bg-gray-400 dark:bg-gray-600 mr-3"></div>
                            <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                          </div>
                          <div className="h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center px-4">
                            <div className="w-5 h-5 rounded-full bg-purple-500 mr-3"></div>
                            <div className="h-3 w-2/3 bg-purple-200 dark:bg-purple-700 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute top-10 -left-16 w-40 h-40 bg-purple-300 dark:bg-purple-800 rounded-full mix-blend-multiply dark:mix-blend-hard-light filter blur-xl opacity-70 animate-blob"></div>
                  <div className="absolute -bottom-8 left-20 w-36 h-36 bg-yellow-300 dark:bg-yellow-800 rounded-full mix-blend-multiply dark:mix-blend-hard-light filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                  <div className="absolute -right-4 -bottom-10 w-32 h-32 bg-pink-300 dark:bg-pink-800 rounded-full mix-blend-multiply dark:mix-blend-hard-light filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <Element name="how-it-works">
          <section className="py-16 bg-white dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div 
                className="text-center"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8 }}
                variants={staggerChildren}
              >
                <motion.h2 
                  className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl"
                  variants={fadeIn}
                >
                  How It Works
                </motion.h2>
                <motion.p 
                  className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
                  variants={fadeIn}
                >
                  Get started in minutes with our simple four-step process.
                </motion.p>
              </motion.div>
              
              <motion.div 
                className="mt-16"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={staggerChildren}
              >
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {/* Step 1 */}
                  <motion.div 
                    className="relative"
                    variants={fadeIn}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-full w-0.5 bg-blue-100 dark:bg-blue-900 hidden md:block"></div>
                    </div>
                    <div className="relative flex flex-col items-center">
                      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mb-4 shadow-lg">
                        <UserPlusIcon className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Sign Up</h3>
                      <p className="mt-2 text-base text-gray-500 dark:text-gray-400 text-center">
                        Create your free account in seconds. No credit card required.
                      </p>
                      <div className="mt-4 md:hidden flex justify-center">
                        <svg className="h-8 w-8 text-blue-400 dark:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Step 2 */}
                  <motion.div 
                    className="relative"
                    variants={fadeIn}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-full w-0.5 bg-blue-100 dark:bg-blue-900 hidden md:block"></div>
                    </div>
                    <div className="relative flex flex-col items-center">
                      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mb-4 shadow-lg">
                        <ArrowUpTrayIcon className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Upload Files</h3>
                      <p className="mt-2 text-base text-gray-500 dark:text-gray-400 text-center">
                        Drag and drop or browse to upload your files securely.
                      </p>
                      <div className="mt-4 md:hidden flex justify-center">
                        <svg className="h-8 w-8 text-blue-400 dark:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Step 3 */}
                  <motion.div 
                    className="relative"
                    variants={fadeIn}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-full w-0.5 bg-blue-100 dark:bg-blue-900 hidden md:block"></div>
                    </div>
                    <div className="relative flex flex-col items-center">
                      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mb-4 shadow-lg">
                        <ShieldCheckIcon className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Share Securely</h3>
                      <p className="mt-2 text-base text-gray-500 dark:text-gray-400 text-center">
                        Generate secure links to share with trusted recipients.
                      </p>
                      <div className="mt-4 md:hidden flex justify-center">
                        <svg className="h-8 w-8 text-blue-400 dark:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Step 4 */}
                  <motion.div 
                    className="relative"
                    variants={fadeIn}
                  >
                    <div className="relative flex flex-col items-center">
                      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mb-4 shadow-lg">
                        <DevicePhoneMobileIcon className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Access Anytime</h3>
                      <p className="mt-2 text-base text-gray-500 dark:text-gray-400 text-center">
                        Access your files from any device, anywhere in the world.
                      </p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
              
              <div className="mt-16 flex justify-center">
                <RouterLink
                  to="/register"
                  className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  Get Started Now
                </RouterLink>
              </div>
            </div>
          </section>
        </Element>
        
        {/* Feature Highlights */}
        <Element name="features">
          <section className="py-16 bg-blue-50 dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                  Feature Highlights
                </h2>
                <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  Discover what makes our platform stand out from the rest.
                </p>
              </motion.div>
              
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                variants={staggerChildren}
                className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3"
              >
                {/* Feature 1 */}
                <motion.div 
                  className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden transition-all duration-500"
                  variants={featureCard}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                >
                  <div className="p-6">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                      <RocketLaunchIcon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Fast Uploads</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                      Optimized upload speeds, even for large files. No more waiting around.
                    </p>
                  </div>
                </motion.div>
                
                {/* Feature 2 */}
                <motion.div 
                  className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden transition-all duration-500"
                  variants={featureCard}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                >
                  <div className="p-6">
                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                      <LockClosedIcon className="h-7 w-7 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Secure Storage</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                      AES encryption, private access controls, and secure data centers.
                    </p>
                  </div>
                </motion.div>
                
                {/* Feature 3 */}
                <motion.div 
                  className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden transition-all duration-500"
                  variants={featureCard}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                >
                  <div className="p-6">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-4">
                      <FolderIcon className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Organized Folders</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                      Keep your files organized with our intuitive folder system.
                    </p>
                  </div>
                </motion.div>
                
                {/* Feature 4 */}
                <motion.div 
                  className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden transition-all duration-500"
                  variants={featureCard}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                >
                  <div className="p-6">
                    <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4">
                      <LinkIcon className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Easy Sharing</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                      Generate secure links with permission controls for safe sharing.
                    </p>
                  </div>
                </motion.div>
                
                {/* Feature 5 */}
                <motion.div 
                  className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden transition-all duration-500"
                  variants={featureCard}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                >
                  <div className="p-6">
                    <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center mb-4">
                      <ChartBarIcon className="h-7 w-7 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Usage Dashboard</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                      Monitor your storage usage and file activity with our intuitive dashboard.
                    </p>
                  </div>
                </motion.div>
                
                {/* Feature 6 */}
                <motion.div 
                  className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden transition-all duration-500"
                  variants={featureCard}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                >
                  <div className="p-6">
                    <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-600 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Privacy First</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                      Your data belongs to you. We never analyze, sell, or share your information.
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </section>
        </Element>
        
        {/* Testimonial Section */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                What Our Users Say
              </h2>
              <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Trusted by professionals and teams worldwide.
              </p>
            </motion.div>
            
            <div className="relative">
              {/* Testimonials carousel */}
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2 }}
                className="overflow-hidden"
              >
                <div ref={sliderRef} className="keen-slider">
                  {testimonials.map((testimonial, index) => (
                    <div key={index} className="keen-slider__slide">
                      <div className="bg-white dark:bg-gray-900 rounded-xl p-8 max-w-3xl mx-auto">
                        {/* Decorative quotation marks */}
                        <svg className="absolute top-0 left-0 transform -translate-x-6 -translate-y-6 h-16 w-16 text-blue-100 dark:text-blue-900" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
                          <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                        </svg>
                        
                        <div className="relative">
                          <blockquote className="mt-10">
                            <div className="max-w-2xl mx-auto text-xl md:text-2xl font-medium text-gray-700 dark:text-gray-300">
                              <p>{testimonial.quote}</p>
                            </div>
                            <footer className="mt-8">
                              <div className="flex items-center justify-center">
                                <div className="flex-shrink-0">
                                  <img
                                    className="h-12 w-12 rounded-full object-cover"
                                    src={testimonial.avatar}
                                    alt={`${testimonial.name} testimonial avatar`}
                                  />
                                </div>
                                <div className="ml-4 text-left">
                                  <div className="text-base font-medium text-gray-900 dark:text-white">{testimonial.name}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">{testimonial.title}</div>
                                </div>
                              </div>
                            </footer>
                          </blockquote>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
              
              {/* Carousel controls */}
              <div className="flex justify-center mt-8 space-x-2">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      instanceRef.current?.moveToIdx(idx);
                    }}
                    className={`w-3 h-3 rounded-full ${currentTestimonial === idx ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
        
        {/* Pricing Section */}
        <Element name="pricing">
          <section className="py-16 bg-blue-50 dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                  Simple, Transparent Pricing
                </h2>
                <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  Start for free, no credit card required. Upgrade when you need more.
                </p>
              </div>
              
              <div className="mt-16 grid gap-8 lg:grid-cols-2 lg:max-w-4xl lg:mx-auto">
                {/* Free Tier */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl border-2 border-blue-500 dark:border-blue-600">
                  <div className="px-6 py-8 sm:p-10 sm:pb-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="inline-flex rounded-full bg-blue-100 dark:bg-blue-900 px-4 py-1 text-sm font-semibold text-blue-600 dark:text-blue-300">
                          Free Forever
                        </h3>
                      </div>
                      <div className="ml-4 bg-blue-600 dark:bg-blue-700 text-white px-3 py-1 rounded-full text-xs font-medium uppercase">
                        Popular
                      </div>
                    </div>
                    <div className="mt-4 flex items-baseline">
                      <span className="text-5xl font-extrabold text-gray-900 dark:text-white">$0</span>
                      <span className="ml-1 text-xl font-medium text-gray-500 dark:text-gray-400">/month</span>
                    </div>
                    <p className="mt-5 text-lg text-gray-500 dark:text-gray-400">
                      Perfect for personal use and small projects.
                    </p>
                  </div>
                  <div className="px-6 pt-6 pb-8 sm:px-10">
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="ml-3 text-base text-gray-700 dark:text-gray-300">10GB storage space</p>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="ml-3 text-base text-gray-700 dark:text-gray-300">Unlimited file uploads</p>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="ml-3 text-base text-gray-700 dark:text-gray-300">Basic file sharing</p>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="ml-3 text-base text-gray-700 dark:text-gray-300">Email support</p>
                      </li>
                    </ul>
                    <div className="mt-8">
                      <RouterLink
                        to="/register"
                        className="inline-flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                      >
                        Get Started
                      </RouterLink>
                    </div>
                  </div>
                </div>
                
                {/* Pro Tier (Coming Soon) */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden opacity-75 transform transition-all">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-gray-900 dark:bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-bold transform rotate-12">
                      Coming Soon
                    </div>
                  </div>
                  <div className="relative backdrop-blur-sm px-6 py-8 sm:p-10 sm:pb-6">
                    <div>
                      <h3 className="inline-flex rounded-full bg-gray-100 dark:bg-gray-800 px-4 py-1 text-sm font-semibold text-gray-600 dark:text-gray-400">
                        Pro
                      </h3>
                    </div>
                    <div className="mt-4 flex items-baseline">
                      <span className="text-5xl font-extrabold text-gray-900 dark:text-white">$9</span>
                      <span className="ml-1 text-xl font-medium text-gray-500 dark:text-gray-400">/month</span>
                    </div>
                    <p className="mt-5 text-lg text-gray-500 dark:text-gray-400">
                      For professionals and teams who need more.
                    </p>
                  </div>
                  <div className="relative backdrop-blur-sm px-6 pt-6 pb-8 sm:px-10">
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="ml-3 text-base text-gray-700 dark:text-gray-300">100GB storage space</p>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="ml-3 text-base text-gray-700 dark:text-gray-300">Advanced file sharing with permissions</p>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="ml-3 text-base text-gray-700 dark:text-gray-300">File activity tracking</p>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="ml-3 text-base text-gray-700 dark:text-gray-300">Priority support</p>
                      </li>
                    </ul>
                    <div className="mt-8">
                      <button
                        disabled
                        className="inline-flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-400 dark:bg-gray-700 cursor-not-allowed"
                      >
                        Coming Soon
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </Element>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-xl font-bold text-white">File Sharing Platform</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Secure, fast, and simple file sharing for individuals and teams.
                Upload, manage, and share your files with confidence.
              </p>
              <div className="flex space-x-4 mt-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase mb-4">
                Company
              </h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase mb-4">
                Legal
              </h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    GDPR
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} File Sharing Platform. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
