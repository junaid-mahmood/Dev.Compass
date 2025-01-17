import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCode, FaLightbulb, FaRocket, FaGraduationCap, FaSpinner, FaSignOutAlt, FaUser, FaYoutube, FaCheckCircle, FaClock, FaBook, FaCalendarCheck, FaCalendarAlt, FaLock } from 'react-icons/fa';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useNavigate, Navigate } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import viteLogo from '../assets/vite.svg';

let genAI;
try {
  genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
} catch (error) {
  console.error('Error initializing Gemini AI:', error);
}

const LearningPath = () => {
  const navigate = useNavigate();
  const [currentSkillLevel, setCurrentSkillLevel] = useState('');
  const [learningGoal, setLearningGoal] = useState('');
  const [timeCommitment, setTimeCommitment] = useState('');
  const [recommendation, setRecommendation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isGuest, setIsGuest] = useState(true);
  const [completedDays, setCompletedDays] = useState(() => {
    const saved = localStorage.getItem('learningPathProgress');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentMilestoneIndex, setCurrentMilestoneIndex] = useState(0);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsGuest(!user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const generateLearningPath = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const prompt = `Create a learning path for a ${currentSkillLevel} developer learning ${learningGoal} with ${timeCommitment} time commitment.

Format the response EXACTLY as follows with AT LEAST 4 MILESTONES:

OVERVIEW:
Brief introduction to the learning path.

DURATION:
Estimated time to complete.

MILESTONES:
1. Getting Started
Description: Introduction to basic concepts
Key Concepts: concept1, concept2, concept3
Resources: https://youtube.com/watch?v=example1
Practice Project: Simple starter project

2. Core Fundamentals
Description: Building foundational knowledge
Key Concepts: concept4, concept5, concept6
Resources: https://youtube.com/watch?v=example2
Practice Project: Intermediate project

3. Advanced Concepts
Description: Diving deeper into advanced topics
Key Concepts: concept7, concept8, concept9
Resources: https://youtube.com/watch?v=example3
Practice Project: Advanced implementation

4. Final Project
Description: Putting it all together
Key Concepts: concept10, concept11, concept12
Resources: https://youtube.com/watch?v=example4
Practice Project: Comprehensive final project

TIPS:
- Tip 1
- Tip 2
- Tip 3`;

      console.log('Sending prompt to AI:', prompt);
      
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      console.log('Raw AI Response:', text);
      
      const sections = {
        overview: '',
        duration: '',
        milestones: [],
        tips: []
      };
      
      let currentSection = '';
      let currentMilestone = null;
      
      const lines = text.split('\n').map(line => line.trim()).filter(line => line);
      console.log('Processed lines:', lines);
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        console.log('Processing line:', line);
        
        if (line.startsWith('OVERVIEW:')) {
          currentSection = 'overview';
          continue;
        } else if (line.startsWith('DURATION:')) {
          currentSection = 'duration';
          continue;
        } else if (line.startsWith('MILESTONES:')) {
          currentSection = 'milestones';
          continue;
        } else if (line.startsWith('TIPS:')) {
          currentSection = 'tips';
          if (currentMilestone) {
            console.log('Adding final milestone before tips:', currentMilestone);
            sections.milestones.push({...currentMilestone});
            currentMilestone = null;
          }
          continue;
        }
        
        if (currentSection === 'overview') {
          sections.overview += line + ' ';
        } else if (currentSection === 'duration') {
          sections.duration += line + ' ';
        } else if (currentSection === 'milestones') {
          const milestoneMatch = line.match(/^(\d+)[\.)]/);
          if (milestoneMatch) {
            console.log('Found new milestone:', line);
            if (currentMilestone) {
              console.log('Adding previous milestone:', currentMilestone);
              sections.milestones.push({...currentMilestone});
            }
            currentMilestone = {
              title: line.replace(/^\d+[\.)]\s*/, '').trim(),
              description: '',
              keyConcepts: [],
              resources: [],
              practiceProject: ''
            };
          } else if (currentMilestone) {
            if (line.toLowerCase().startsWith('description:')) {
              currentMilestone.description = line.split(':')[1].trim();
            } else if (line.toLowerCase().startsWith('key concepts:')) {
              const concepts = line.split(':')[1].trim();
              currentMilestone.keyConcepts = concepts.split(',').map(c => c.trim()).filter(c => c);
            } else if (line.toLowerCase().startsWith('resources:')) {
              const resources = line.split(':')[1].trim();
              const urlMatch = resources.match(/https?:\/\/(?:www\.)?youtube\.com\/watch\?v=[a-zA-Z0-9_-]+/g);
              if (urlMatch) {
                currentMilestone.resources = urlMatch;
              } else {
                const searchTerms = [
                  `${learningGoal} ${currentMilestone.title} tutorial`,
                  `${learningGoal} ${currentMilestone.title} beginner guide`,
                  `${learningGoal} ${currentMilestone.title} examples`
                ];
                currentMilestone.resources = searchTerms.map(term => 
                  `https://www.youtube.com/results?search_query=${encodeURIComponent(term)}`
                );
              }
            } else if (line.toLowerCase().startsWith('practice project:')) {
              currentMilestone.practiceProject = line.split(':')[1].trim();
            } else if (!line.startsWith('-')) {
            }
          }
        } else if (currentSection === 'tips') {
          if (line.startsWith('-')) {
            sections.tips.push(line.replace(/^-\s*/, '').trim());
          }
        }
      }
      
      if (currentMilestone) {
        console.log('Adding final milestone at end:', currentMilestone);
        sections.milestones.push({...currentMilestone});
      }
      
      console.log('Final parsed sections:', sections);
      console.log('Number of milestones:', sections.milestones.length);
      
      if (sections.milestones.length < 2) {
        throw new Error('Not enough milestones were generated. Please try again.');
      }
      
      if (!sections.overview.trim()) {
        sections.overview = `Welcome to your personalized ${learningGoal} learning journey! This path is designed for ${currentSkillLevel} developers with ${timeCommitment} time commitment.`;
      }
      
      if (!sections.duration.trim()) {
        sections.duration = `Estimated ${timeCommitment === 'intensive' ? '4-6' : timeCommitment === 'dedicated' ? '8-10' : '12-16'} weeks`;
      }
      
      setRecommendation(sections);
    } catch (error) {
      console.error('Error generating learning path:', error);
      setError(error.message || 'Failed to generate learning path. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDayCompletion = (weekIndex, dayIndex) => {
    const dayId = `week${weekIndex + 1}_day${dayIndex}`;
    setCompletedDays(prev => {
      const newCompletedDays = prev.includes(dayId)
        ? prev.filter(d => d !== dayId)
        : [...prev, dayId];
      localStorage.setItem('learningPathProgress', JSON.stringify(newCompletedDays));
      return newCompletedDays;
    });
  };

  if (isGuest) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-[#1a1f2e] to-gray-900 text-gray-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md p-8 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 text-center"
        >
          <FaLock className="text-4xl text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Sign In Required
          </h2>
          <p className="text-gray-300 mb-6">
            Please sign in to access your personalized learning path and track your progress.
          </p>
          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/login')}
              className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-lg font-semibold transition-all duration-300"
            >
              Sign In
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/signup')}
              className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 rounded-lg font-semibold transition-all duration-300"
            >
              Create Account
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-[#1a1f2e] to-gray-900 text-gray-100">
      {!recommendation ? (
        <div className="flex">
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-80 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700/50 p-8 flex flex-col fixed h-full"
          >
            <div className="flex flex-col items-center mb-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/')}
                className="text-3xl font-bold mb-4 text-left bg-gradient-to-r from-blue-500 to-blue-400 bg-clip-text text-transparent"
              >
                DevCompass
              </motion.button>
              <motion.img 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                src={viteLogo}
                alt="Logo" 
                className="w-16 h-16 mb-6"
              />
            </div>

            <nav className="space-y-4 mb-8">
              <motion.button
                whileHover={{ scale: 1.02 }}
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-600/80 to-blue-700/80 hover:from-blue-500/80 hover:to-blue-600/80 rounded-lg text-lg font-semibold transition-all duration-300 shadow-lg backdrop-blur-sm"
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-600/80 to-blue-700/80 hover:from-blue-500/80 hover:to-blue-600/80 rounded-lg text-lg font-semibold transition-all duration-300 shadow-lg backdrop-blur-sm"
                onClick={() => navigate('/learning-path')}
              >
                Learning Path
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-600/80 to-blue-700/80 hover:from-blue-500/80 hover:to-blue-600/80 rounded-lg text-lg font-semibold transition-all duration-300 shadow-lg backdrop-blur-sm"
                onClick={() => navigate('/community')}
              >
                Community
              </motion.button>
            </nav>

            <div className="mt-auto pt-4 flex justify-between items-center">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="group relative p-2 bg-gradient-to-r from-red-600/80 to-red-700/80 hover:from-red-500/80 hover:to-red-600/80 rounded-lg transition-all duration-300 shadow-lg backdrop-blur-sm"
              >
                <FaSignOutAlt className="text-xl" />
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800/90 backdrop-blur-sm text-white text-sm py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap border border-gray-700/50">
                  Logout
                </span>
              </motion.button>
            </div>
          </motion.aside>

          <main className="flex-1 p-10 ml-80">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-12">
                <motion.h1
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent"
                >
                  Your Personalized Learning Journey
                </motion.h1>
                <p className="text-gray-400 text-lg">
                  Let's create a customized learning path tailored to your goals
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 mb-8 border border-gray-700/50"
              >
                <div className="space-y-6">
                  <div>
                    <label className="block text-lg font-semibold mb-2">
                      <FaCode className="inline mr-2" />
                      Current Skill Level
                    </label>
                    <select
                      value={currentSkillLevel}
                      onChange={(e) => setCurrentSkillLevel(e.target.value)}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-gray-100 focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value="">Select your level</option>
                      <option value="beginner">Beginner (New to coding)</option>
                      <option value="intermediate">Intermediate (Some experience)</option>
                      <option value="advanced">Advanced (Experienced developer)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-lg font-semibold mb-2">
                      <FaLightbulb className="inline mr-2" />
                      Learning Goal
                    </label>
                    <select
                      value={learningGoal}
                      onChange={(e) => setLearningGoal(e.target.value)}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-gray-100 focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value="">Select your goal</option>
                      <option value="web">Web Development</option>
                      <option value="python">Python Programming</option>
                      <option value="javascript">JavaScript Mastery</option>
                      <option value="fullstack">Full Stack Development</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-lg font-semibold mb-2">
                      <FaRocket className="inline mr-2" />
                      Time Commitment
                    </label>
                    <select
                      value={timeCommitment}
                      onChange={(e) => setTimeCommitment(e.target.value)}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-gray-100 focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value="">Select time commitment</option>
                      <option value="casual">Casual (2-4 hours/week)</option>
                      <option value="dedicated">Dedicated (5-10 hours/week)</option>
                      <option value="intensive">Intensive (10+ hours/week)</option>
                    </select>
                  </div>

                  {error && (
                    <div className="text-red-400 bg-red-900/20 border border-red-700/30 rounded-lg p-4">
                      {error}
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={generateLearningPath}
                    disabled={!currentSkillLevel || !learningGoal || !timeCommitment || isLoading}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg text-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Generating Your Path...
                      </>
                    ) : (
                      <>
                        <FaGraduationCap className="mr-2" />
                        Generate Learning Path
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </main>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen p-6 md:p-10"
        >
          {/* Back button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setRecommendation(null)}
            className="fixed top-6 left-6 z-10 flex items-center space-x-2 px-4 py-2 bg-gray-800/90 hover:bg-gray-700/90 rounded-lg backdrop-blur-sm border border-gray-700/50 shadow-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back</span>
          </motion.button>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12 pt-8"
          >
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Your Learning Path
            </h1>
            <p className="text-xl text-gray-400">
              {currentSkillLevel.charAt(0).toUpperCase() + currentSkillLevel.slice(1)} • {learningGoal} • {timeCommitment} pace
            </p>
          </motion.div>

          {/* Overview Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto mb-12 bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50"
          >
            <div className="flex items-start gap-6">
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                  Overview
                </h2>
                <p className="text-gray-300 text-lg leading-relaxed">{recommendation.overview}</p>
              </div>
              <div className="flex items-center text-gray-400 bg-gray-700/30 rounded-xl p-4">
                <FaClock className="text-2xl mr-3" />
                <span className="text-xl font-semibold">{recommendation.duration}</span>
              </div>
            </div>
          </motion.div>

          {/* Content Layout */}
          <div className="max-w-7xl mx-auto">
            {/* Navigation Progress */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-2">
                {recommendation.milestones.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setCurrentMilestoneIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentMilestoneIndex 
                        ? 'bg-blue-500 scale-125' 
                        : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                  />
                ))}
              </div>
              <div className="text-gray-400">
                {currentMilestoneIndex + 1} / {recommendation.milestones.length}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-12 gap-6">
              {/* Left Column - Current Milestone */}
              <div className="col-span-8">
                <motion.div
                  key={currentMilestoneIndex}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50"
                >
                  <h3 className="text-2xl font-semibold text-white mb-6 flex items-center">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 mr-4 text-xl">
                      {currentMilestoneIndex + 1}
                    </span>
                    {recommendation.milestones[currentMilestoneIndex].title}
                  </h3>
                  <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                    {recommendation.milestones[currentMilestoneIndex].description}
                  </p>
                  
                  {/* Key Concepts */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-400 mb-3">Key Concepts</h4>
                    <div className="flex flex-wrap gap-2">
                      {recommendation.milestones[currentMilestoneIndex].keyConcepts.map((concept, i) => (
                        <span
                          key={i}
                          className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg text-base"
                        >
                          {concept}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Practice Project */}
                  {recommendation.milestones[currentMilestoneIndex].practiceProject && (
                    <div className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
                      <h4 className="text-lg font-semibold text-blue-400 mb-3 flex items-center">
                        <FaCode className="mr-2" />
                        Practice Project
                      </h4>
                      <p className="text-gray-300 text-lg">
                        {recommendation.milestones[currentMilestoneIndex].practiceProject}
                      </p>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-700/50">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentMilestoneIndex(prev => Math.max(0, prev - 1))}
                      disabled={currentMilestoneIndex === 0}
                      className="flex items-center px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentMilestoneIndex(prev => Math.min(recommendation.milestones.length - 1, prev + 1))}
                      disabled={currentMilestoneIndex === recommendation.milestones.length - 1}
                      className="flex items-center px-6 py-3 bg-blue-600/80 hover:bg-blue-500/80 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.button>
                  </div>
                </motion.div>
              </div>

              {/* Right Column - Resources and Tips */}
              <div className="col-span-4 space-y-6">
                {/* Video Resources Section */}
                <div className="sticky top-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent mb-6 flex items-center">
                    <FaYoutube className="mr-3 text-red-500" />
                    Video Tutorials
                  </h2>
                  <div className="space-y-4">
                    {recommendation.milestones[currentMilestoneIndex].resources.map((url, i) => (
                      <motion.a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.02 }}
                        className="block p-4 bg-gradient-to-r from-red-500/10 to-red-600/10 hover:from-red-500/20 hover:to-red-600/20 rounded-xl border border-red-500/20 transition-all duration-300"
                      >
                        <div className="flex items-center mb-3">
                          <FaYoutube className="text-3xl text-red-500 mr-3" />
                          <span className="text-lg font-semibold text-gray-200">
                            {`${recommendation.milestones[currentMilestoneIndex].title} - Part ${i + 1}`}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400">
                          Watch tutorial for milestone {currentMilestoneIndex + 1}
                        </div>
                      </motion.a>
                    ))}
                  </div>

                  {/* Tips Section */}
                  {recommendation.tips.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
                    >
                      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent flex items-center">
                        <FaLightbulb className="mr-3 text-yellow-400" />
                        Tips for Success
                      </h2>
                      <ul className="space-y-4">
                        {recommendation.tips.map((tip, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start bg-gray-700/20 rounded-lg p-4"
                          >
                            <FaCheckCircle className="text-green-500 text-xl mt-1 mr-3 flex-shrink-0" />
                            <span className="text-gray-300">{tip}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LearningPath; 