import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaUser, FaUsers, FaCode, FaTrophy, FaGithub, FaTwitter, FaLinkedin, FaDiscord, FaImage, FaLink, FaReply, FaChevronDown, FaChevronUp, FaLock } from 'react-icons/fa';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, collection, getDocs, query, orderBy, limit, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { initializeUser } from '../utils/initializeUser';

export default function Community() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isGuest, setIsGuest] = useState(true);
  const [topUsers, setTopUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({
    title: '',
    body: '',
    type: 'message',
    difficulty: 'beginner',
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [communityStats, setCommunityStats] = useState({
    totalUsers: 0,
    totalChallenges: 0,
    totalCompletions: 0
  });
  const [expandedComments, setExpandedComments] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommunityData();
    
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setIsGuest(!user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadCommunityData = async () => {
    try {
      console.log('Loading community data...');
      const postsRef = collection(db, 'posts');
      const postsQuery = query(postsRef, orderBy('createdAt', 'desc'), limit(20));
      const postsSnap = await getDocs(postsQuery);
      console.log('Posts snapshot:', postsSnap.size);
      
      const postsData = [];
      
      for (const postDoc of postsSnap.docs) {
        const postData = postDoc.data();
        console.log('Post data:', postData);
        
        const post = {
          id: postDoc.id,
          title: postData.title || '',
          body: postData.body || '',
          type: postData.type || 'message',
          difficulty: postData.difficulty || 'beginner',
          createdAt: postData.createdAt,
          userName: 'Anonymous',
          commentCount: postData.commentCount || 0
        };
        
        if (postData.userId) {
          try {
            const userRef = doc(db, 'users', postData.userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const userData = userSnap.data();
              post.userName = userData.name || 'Anonymous';
              post.userProfilePicture = userData.profilePicture;
            }
          } catch (error) {
            console.error('Error fetching user data for post:', error);
          }
        }
        
        postsData.push(post);
      }
      
      console.log('Setting posts:', postsData);
      setPosts(postsData);

      const usersRef = collection(db, 'users');
      const usersSnap = await getDocs(usersRef);
      const users = [];
      usersSnap.forEach(doc => {
        const userData = doc.data();
        users.push({
          id: doc.id,
          name: userData.name || 'Anonymous',
          completions: (userData.completedPythonChallenges?.length || 0) + 
                      (userData.completedJavaScriptChallenges?.length || 0)
        });
      });

      setCommunityStats({
        totalUsers: users.length,
        totalChallenges: postsData.filter(p => p.type !== 'message').length,
        totalCompletions: users.reduce((acc, user) => acc + user.completions, 0)
      });
    } catch (error) {
      console.error("Error loading community data:", error);
      setPosts([]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-[#1a1f2e] to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleCreatePost = async (e) => {
    e.preventDefault();
    console.log('Creating post:', newPost);
    
    if (!auth.currentUser) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login');
      return;
    }

    if (!newPost.title.trim() || !newPost.body.trim()) {
      console.log('Title or body is empty');
      return;
    }

    try {
      const userData = await initializeUser();
      if (!userData) {
        console.error('Failed to initialize user');
        return;
      }

      const postsRef = collection(db, 'posts');
      console.log('Adding post to Firestore...');
      
      const postData = {
        title: newPost.title.trim(),
        body: newPost.body.trim(),
        type: newPost.type,
        difficulty: newPost.type === 'message' ? 'beginner' : newPost.difficulty,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        likes: 0,
        commentCount: 0
      };

      console.log('Post data to be sent:', postData);
      
      const postDoc = await addDoc(postsRef, postData);
      console.log('Post created with ID:', postDoc.id);

      const newPostWithMetadata = {
        id: postDoc.id,
        ...postData,
        createdAt: new Date().toISOString(),
        userName: userData.name,
        userProfilePicture: userData.profilePicture,
        comments: []
      };
      
      setPosts(prevPosts => [newPostWithMetadata, ...prevPosts]);
      console.log('Post added to state');

      setNewPost({
        title: '',
        body: '',
        type: 'message',
        difficulty: 'beginner'
      });
      
      console.log('Form reset complete');
    } catch (error) {
      console.error('Error creating post:', error);
      if (error.code) {
        console.error('Error code:', error.code);
      }
      if (error.message) {
        console.error('Error message:', error.message);
      }
    }
  };

  const handleCreateReply = async (postId) => {
    if (!auth.currentUser || !replyContent.trim()) return;

    try {
      const commentsRef = collection(doc(collection(db, 'posts'), postId), 'comments');
      const commentDoc = await addDoc(commentsRef, {
        content: replyContent,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp()
      });

      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      const postRef = doc(collection(db, 'posts'), postId);
      await updateDoc(postRef, {
        commentCount: (posts.find(p => p.id === postId)?.comments?.length || 0) + 1
      });

      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [{
              id: commentDoc.id,
              content: replyContent,
              userId: auth.currentUser.uid,
              createdAt: new Date(),
              userName: userData.name,
              userProfilePicture: userData.profilePicture
            }, ...(post.comments || [])]
          };
        }
        return post;
      }));

      setReplyContent('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error creating reply:', error);
    }
  };

  const toggleComments = (postId) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const renderPostForm = () => {
    if (isGuest) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 mb-8"
        >
          <div className="text-center">
            <FaLock className="text-3xl text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Sign in to Join the Discussion</h3>
            <p className="text-gray-400 mb-4">Create an account to share your thoughts and connect with other developers.</p>
            <div className="flex justify-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/login')}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-lg font-semibold transition-all duration-300"
              >
                Sign In
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/signup')}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 rounded-lg font-semibold transition-all duration-300"
              >
                Create Account
              </motion.button>
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 sticky top-6">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          Create Post
        </h2>
        
        <form onSubmit={handleCreatePost} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Post Type
            </label>
            <select
              value={newPost.type}
              onChange={(e) => setNewPost({ ...newPost, type: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="message">General Message</option>
              <option value="python_challenge">Python Challenge</option>
              <option value="js_challenge">JavaScript Challenge</option>
            </select>
          </div>

          {(newPost.type === 'python_challenge' || newPost.type === 'js_challenge') && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Difficulty Level
              </label>
              <select
                value={newPost.difficulty}
                onChange={(e) => setNewPost({ ...newPost, difficulty: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Title
            </label>
            <input
              type="text"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              placeholder={newPost.type === 'message' ? "What's on your mind?" : "Challenge title"}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              {newPost.type === 'message' ? 'Message' : 'Challenge Description'}
            </label>
            <textarea
              value={newPost.body}
              onChange={(e) => setNewPost({ ...newPost, body: e.target.value })}
              placeholder={
                newPost.type === 'message' 
                  ? "Share your thoughts with the community..."
                  : "Describe your challenge, include any necessary context, and specify what needs to be accomplished..."
              }
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={6}
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="flex space-x-2">
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <FaImage className="text-xl" />
              </button>
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <FaLink className="text-xl" />
              </button>
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!newPost.title.trim() || !newPost.body.trim()}
            >
              Post
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-[#1a1f2e] to-gray-900 text-gray-100 flex">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-12">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 bg-gray-800/50 hover:bg-gray-700/50 text-white px-4 py-2 rounded-lg transition-colors backdrop-blur-sm border border-gray-700/50"
          >
            <FaArrowLeft />
            <span>Dashboard</span>
          </motion.button>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Developer Community
          </h1>
          
          <div className="w-[104px]" /> {/* Spacer to match button width */}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 flex items-center">
            <FaUsers className="text-4xl text-blue-400 mr-4" />
            <div>
              <h3 className="text-lg text-gray-400">Active Members</h3>
              <p className="text-2xl font-bold">{communityStats.totalUsers}</p>
            </div>
          </div>
          <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 flex items-center">
            <FaCode className="text-4xl text-purple-400 mr-4" />
            <div>
              <h3 className="text-lg text-gray-400">Total Challenges</h3>
              <p className="text-2xl font-bold">{communityStats.totalChallenges}</p>
            </div>
          </div>
          <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 flex items-center">
            <FaTrophy className="text-4xl text-yellow-400 mr-4" />
            <div>
              <h3 className="text-lg text-gray-400">Challenges Completed</h3>
              <p className="text-2xl font-bold">{communityStats.totalCompletions}</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1"
          >
            {renderPostForm()}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                Community Posts
              </h2>

              <div className="space-y-4">
                {posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-800/40 p-6 rounded-lg border border-gray-700/30"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        {post.userProfilePicture ? (
                          <img 
                            src={post.userProfilePicture} 
                            alt={post.userName} 
                            className="w-10 h-10 rounded-full mr-4"
                          />
                        ) : (
                          <FaUser className="w-10 h-10 p-2 rounded-full bg-gray-700 text-gray-300 mr-4" />
                        )}
                        <div>
                          <p className="font-semibold text-blue-400">{post.userName}</p>
                          <p className="text-sm text-gray-400">
                            {typeof post.createdAt === 'string' 
                              ? new Date(post.createdAt).toLocaleDateString()
                              : post.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown date'}
                          </p>
                        </div>
                      </div>
                      {post.type !== 'message' && (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          post.difficulty === 'beginner' ? 'bg-green-500/20 text-green-300' :
                          post.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {post.difficulty}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                    <p className="text-gray-300 mb-4">{post.body}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => toggleComments(post.id)}
                          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                        >
                          <FaReply className="text-lg" />
                          <span>{post.commentCount || 0} replies</span>
                          {expandedComments[post.id] ? <FaChevronUp /> : <FaChevronDown />}
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedComments[post.id] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 space-y-4"
                        >
                          {!isGuest && (
                            <div className="flex items-start space-x-4">
                              <FaUser className="w-8 h-8 p-1.5 rounded-full bg-gray-700 text-gray-300" />
                              <div className="flex-1">
                                <textarea
                                  value={replyContent}
                                  onChange={(e) => setReplyContent(e.target.value)}
                                  placeholder="Write a reply..."
                                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                  rows={3}
                                />
                                <div className="flex justify-end mt-2">
                                  <button
                                    onClick={() => handleCreateReply(post.id)}
                                    disabled={!replyContent.trim()}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Reply
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {post.comments?.map((comment, index) => (
                            <motion.div
                              key={comment.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-start space-x-4 pl-8"
                            >
                              {comment.userProfilePicture ? (
                                <img 
                                  src={comment.userProfilePicture} 
                                  alt={comment.userName} 
                                  className="w-8 h-8 rounded-full"
                                />
                              ) : (
                                <FaUser className="w-8 h-8 p-1.5 rounded-full bg-gray-700 text-gray-300" />
                              )}
                              <div className="flex-1 bg-gray-800/40 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="font-semibold text-blue-400">{comment.userName}</p>
                                  <p className="text-sm text-gray-400">
                                    {typeof comment.createdAt === 'string'
                                      ? new Date(comment.createdAt).toLocaleDateString()
                                      : comment.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown date'}
                                  </p>
                                </div>
                                <p className="text-gray-300">{comment.content}</p>
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 