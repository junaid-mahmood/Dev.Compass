import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPython, FaJs, FaFire, FaSignOutAlt, FaUser, FaInfoCircle, FaCode, FaBook, FaTrophy } from 'react-icons/fa';
import { auth, db } from '../firebaseConfig';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';
import viteLogo from '../assets/vite.svg';
import { getLocalUserData, initializeLocalUser, updateLocalUserProgress } from '../utils/localStorageManager';

const StreakCard = ({ streak }) => (
  <motion.div 
    className="relative bg-[#2a3142] rounded-lg p-8 h-full overflow-hidden"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="relative bg-[#2a3142] rounded-lg h-full flex flex-col justify-center items-center z-10">
      <h2 className="text-lg font-semibold mb-4 text-center">Coding Streak</h2>
      <div className="text-center">
        <motion.div
          className="flex items-center justify-center space-x-4"
          whileHover={{ scale: 1.05 }}
        >
          <motion.div
            animate={{
              rotate: [0, 15, -15, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="relative"
          >
            <FaFire className="text-4xl" style={{ 
              color: '#f59e0b',
              filter: 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.5))'
            }} />
          </motion.div>
          <div className="flex items-baseline">
            <motion.span 
              className="text-5xl font-bold"
              style={{ 
                background: 'linear-gradient(90deg, #60a5fa, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 2px rgba(59, 130, 246, 0.5))'
              }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              {streak}
            </motion.span>
            <span className="text-2xl font-bold ml-2 text-blue-400">days</span>
          </div>
        </motion.div>
      </div>
    </div>

    <motion.div
      className="absolute top-0 left-0 w-12 h-[1px] bg-yellow-400"
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    <motion.div
      className="absolute top-0 left-0 w-[1px] h-12 bg-yellow-400"
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 2, repeat: Infinity }}
    />

    <motion.div
      className="absolute top-0 right-0 w-12 h-[1px] bg-yellow-400"
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    <motion.div
      className="absolute top-0 right-0 w-[1px] h-12 bg-yellow-400"
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 2, repeat: Infinity }}
    />

    <motion.div
      className="absolute bottom-0 left-0 w-12 h-[1px] bg-yellow-400"
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    <motion.div
      className="absolute bottom-0 left-0 w-[1px] h-12 bg-yellow-400"
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 2, repeat: Infinity }}
    />

    <motion.div
      className="absolute bottom-0 right-0 w-12 h-[1px] bg-yellow-400"
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    <motion.div
      className="absolute bottom-0 right-0 w-[1px] h-12 bg-yellow-400"
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 2, repeat: Infinity }}
    />

    <motion.div
      className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-[1px] bg-yellow-400"
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    <motion.div
      className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-[1px] bg-yellow-400"
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    <motion.div
      className="absolute left-0 top-1/2 transform -translate-y-1/2 w-[1px] h-12 bg-yellow-400"
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    <motion.div
      className="absolute right-0 top-1/2 transform -translate-y-1/2 w-[1px] h-12 bg-yellow-400"
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
  </motion.div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [user, setUser] = useState({ 
    name: 'Anonymous', 
    streak: 0, 
    profilePicture: null,
    pythonProgress: 0,
    javascriptProgress: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [showLocalStoragePopup, setShowLocalStoragePopup] = useState(false);
  const [isLocalUser, setIsLocalUser] = useState(true);
  const [isGuest, setIsGuest] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoading(true);
      
      if (user) {
        setIsGuest(false);
        setIsLocalUser(false);
      } else {
        setIsGuest(true);
        setIsLocalUser(true);
        const localData = getLocalUserData();
        if (!localData) {
          const initialData = initializeLocalUser();
          setUser({
            name: 'Anonymous',
            streak: 0,
            pythonProgress: 0,
            javascriptProgress: 0
          });
          setRecentActivity([]);
        } else {
          setUser({
            name: 'Anonymous',
            streak: localData.streak || 0,
            pythonProgress: localData.pythonProgress || 0,
            javascriptProgress: localData.javascriptProgress || 0
          });
          setRecentActivity(localData.recentActivities || []);
        }
        setIsLoading(false);
      }
      
      if (user) {
        checkAuthAndInitialize(user);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const checkLocalStorage = () => {
      if (isLocalUser) {
        const localData = getLocalUserData();
        if (localData) {
          setUser(prev => ({
            ...prev,
            name: 'Anonymous',
            streak: localData.streak || 0,
            pythonProgress: localData.pythonProgress || 0,
            javascriptProgress: localData.javascriptProgress || 0
          }));
          setRecentActivity(localData.recentActivities || []);
        }
      }
    };

    checkLocalStorage();

    const handleStorageChange = (e) => {
      if (e.key === 'devcompass_user_data') {
        checkLocalStorage();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isLocalUser]);

  useEffect(() => {
    if (!isLoading) {
      checkAuthAndInitialize(currentUser);
    }
  }, [location.pathname]);

  const checkAuthAndInitialize = async (user) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setUser({
          name: userData.name || user.email.split('@')[0],
          streak: userData.streak || 0,
          profilePicture: userData.profilePicture,
          pythonProgress: userData.pythonProgress || 0,
          javascriptProgress: userData.javascriptProgress || 0
        });
        setRecentActivity(userData.recentActivities || []);
      } else {
        setUser({
          name: user.email.split('@')[0],
          streak: 0,
          pythonProgress: 0,
          javascriptProgress: 0
        });
        setRecentActivity([]);
      }
    } catch (error) {
      console.error("Error initializing user data:", error);
      setUser({
        name: user.email.split('@')[0],
        streak: 0,
        pythonProgress: 0,
        javascriptProgress: 0
      });
      setRecentActivity([]);
    } finally {
      setIsLoading(false);
    }
  };

  const ProgressCircle = ({ percentage, color }) => (
    <div className="relative w-32 h-32 mx-auto mt-4">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          className="text-gray-700"
          strokeWidth="8"
          stroke="currentColor"
          fill="transparent"
          r="40"
          cx="50"
          cy="50"
        />
        <circle
          className={color}
          strokeWidth="8"
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="40"
          cx="50"
          cy="50"
          strokeDasharray={`${percentage * 2.51} 251.2`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold">{percentage}%</span>
      </div>
    </div>
  );

  const updateChallengeProgress = async (userId, challengeType, challengeId) => {
    try {
      if (currentUser) {
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const completedChallenges = userData.completedChallenges || { python: [], javascript: [] };
          
          if (!completedChallenges[challengeType].includes(challengeId)) {
            completedChallenges[challengeType].push(challengeId);
            
            await updateDoc(userRef, {
              completedChallenges,
              recentActivities: [
                {
                  type: 'challenge_completion',
                  challengeType,
                  challengeId,
                  timestamp: new Date().toISOString(),
                  description: `Completed ${challengeType} challenge ${challengeId}`
                },
                ...(userData.recentActivities || []).slice(0, 4)
              ]
            });

            const total = challengeType === 'javascript' ? 12 : 10;
            const completed = completedChallenges[challengeType].length;
            const progress = Math.round((completed / total) * 100);

            setUser(prev => ({
              ...prev,
              [`${challengeType}Progress`]: progress
            }));
          }
        }
      } else {
        const updatedData = updateLocalUserProgress(challengeType, challengeId);
        if (updatedData) {
          if (challengeType === 'javascript') {
            setUser(prev => ({
              ...prev,
              javascriptProgress: updatedData.javascriptProgress || 0
            }));
          } else {
            setUser(prev => ({
              ...prev,
              pythonProgress: updatedData.pythonProgress || 0
            }));
          }
          setRecentActivity(updatedData.recentActivities || []);
        }
      }
    } catch (error) {
      console.error("Error updating challenge progress:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-[#1a1f2e] to-gray-900 text-gray-100 flex">
      {isLoading ? (
        <div className="w-full h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <AnimatePresence>
            {showLocalStoragePopup && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              >
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.95 }}
                  className="bg-gray-800 rounded-xl p-8 max-w-md relative"
                >
                  <FaInfoCircle className="text-4xl text-blue-400 mb-4" />
                  <h2 className="text-2xl font-bold mb-4">Welcome to DevCompass!</h2>
                  <p className="text-gray-300 mb-6">
                    You're currently using DevCompass in guest mode. Your progress and achievements will be saved locally in your browser. 
                    This means your data will only be available on this device and browser.
                  </p>
                  <div className="text-gray-300 mb-6">
                    <p className="mb-2">To access additional features like:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Cloud sync across devices</li>
                      <li>Community participation</li>
                      <li>Progress tracking</li>
                      <li>Achievement sharing</li>
                    </ul>
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => navigate('/signup')}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg"
                    >
                      Sign Up
                    </button>
                    <button
                      onClick={() => setShowLocalStoragePopup(false)}
                      className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      Continue as Guest
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

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
                whileHover={isGuest ? {} : { scale: 1.02 }}
                className={`w-full py-3 px-6 rounded-lg text-lg font-semibold transition-all duration-300 shadow-lg backdrop-blur-sm relative ${
                  isGuest 
                    ? 'bg-gray-800/50 opacity-50 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-purple-600/80 to-purple-700/80 hover:from-purple-500/80 hover:to-purple-600/80'
                }`}
                onClick={() => {
                  if (isGuest) {
                    navigate('/login');
                  } else {
                    navigate('/learning-path');
                  }
                }}
              >
                Learning Path
                {isGuest && (
                  <div className="absolute -top-4 -right-4 bg-yellow-400/50 text-[#000] text-[8px] px-2 py-[1px] rounded transform rotate-45 shadow-md font-extrabold whitespace-nowrap">
                    sign in required
                  </div>
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-600/80 to-blue-700/80 hover:from-blue-500/80 hover:to-blue-600/80 rounded-lg text-lg font-semibold transition-all duration-300 shadow-lg backdrop-blur-sm"
                onClick={() => navigate('/community')}
              >
                Community
              </motion.button>
            </nav>

            <div className="w-48 h-48 mx-auto">
              <StreakCard streak={user.streak} />
            </div>
            
            <div className="mt-auto pt-4 flex justify-between items-center">
              {isGuest ? (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/login')}
                  className="group relative p-2 bg-gradient-to-r from-blue-600/80 to-blue-700/80 hover:from-blue-500/80 hover:to-blue-600/80 rounded-lg transition-all duration-300 shadow-lg backdrop-blur-sm"
                >
                  <FaUser className="text-xl" />
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800/90 backdrop-blur-sm text-white text-sm py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap border border-gray-700/50">
                    Sign In
                  </span>
                </motion.button>
              ) : (
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
              )}
            </div>
          </motion.aside>

          <main className="flex-1 p-10 ml-80">
            <div className="max-w-5xl mx-auto">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-500 to-blue-400 bg-clip-text text-transparent"
              >
                Welcome, {isGuest ? "Anonymous" : user.name}!
              </motion.h1>

              {isGuest && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8 text-center"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/login')}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg transition-all duration-300 shadow-lg text-lg font-semibold"
                  >
                    Sign In to Save Your Progress
                  </motion.button>
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate('/python-challenges')}
                  className="bg-gradient-to-r from-blue-500/80 to-blue-600/80 hover:from-blue-400/80 hover:to-blue-500/80 rounded-xl p-6 text-left transition-all duration-300 shadow-lg backdrop-blur-sm"
                >
                  <div className="flex items-center">
                    <FaPython className="text-4xl mr-4" />
                    <h2 className="text-2xl font-bold">Python Challenges</h2>
                  </div>
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate('/javascript-challenges')}
                  className="bg-gradient-to-r from-yellow-500/80 to-yellow-600/80 hover:from-yellow-400/80 hover:to-yellow-500/80 rounded-xl p-6 text-left transition-all duration-300 shadow-lg backdrop-blur-sm"
                >
                  <div className="flex items-center">
                    <FaJs className="text-4xl mr-4" />
                    <h2 className="text-2xl font-bold">JavaScript Challenges</h2>
                  </div>
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
                >
                  <div className="flex items-center mb-4">
                    <FaPython className="text-4xl text-blue-400 mr-4" />
                    <h2 className="text-2xl font-bold">Python Progress</h2>
                  </div>
                  <ProgressCircle percentage={user.pythonProgress} color="text-blue-400" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
                >
                  <div className="flex items-center mb-4">
                    <FaJs className="text-4xl text-yellow-400 mr-4" />
                    <h2 className="text-2xl font-bold">JavaScript Progress</h2>
                  </div>
                  <ProgressCircle percentage={user.javascriptProgress} color="text-yellow-400" />
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-8"
              >
                <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="bg-gray-700/50 rounded-lg p-4 flex items-center"
                      >
                        <FaFire className="text-orange-400 mr-4" />
                        <div>
                          <p className="text-gray-300">
                            {typeof activity === 'string' 
                              ? activity 
                              : activity.type === 'lesson_completion'
                              ? `Completed lesson: ${activity.lessonTitle}`
                              : `${activity.description || 'Activity completed'}`}
                          </p>
                          <p className="text-sm text-gray-500">
                            {typeof activity === 'string' 
                              ? 'Today'
                              : new Date(activity.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No recent activity</p>
                )}
              </motion.div>
            </div>
          </main>
        </>
      )}
    </div>
  );
};

export default Dashboard;

