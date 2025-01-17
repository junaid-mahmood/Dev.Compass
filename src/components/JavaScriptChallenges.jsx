'use client'

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaArrowLeft, FaJs, FaStar, FaLightbulb, FaGraduationCap, FaTrophy } from 'react-icons/fa'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'
import { auth, db } from '../firebaseConfig'
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'

const modules = [
  {
    id: "variables",
    title: "Modern Variables",
    description: "Learn about let, const, and modern variable declarations.",
    challenge: {
      question: "Create a constant 'name' with your name and log it to the console",
      startingCode: "",
      solution: "const name = 'Your Name';\nconsole.log(name);"
    }
  },
  {
    id: "arrow_functions",
    title: "Arrow Functions",
    description: "Master ES6 arrow function syntax and usage.",
    challenge: {
      question: "Convert this function to an arrow function: function add(a, b) { return a + b; }",
      startingCode: "",
      solution: "const add = (a, b) => a + b;\nconsole.log(add(5, 3));"
    }
  },
  {
    id: "array_methods",
    title: "Array Methods",
    description: "Learn modern array methods like map, filter, and reduce.",
    challenge: {
      question: "Use map to double each number in the array [1, 2, 3, 4, 5]",
      startingCode: "const numbers = [1, 2, 3, 4, 5];\n",
      solution: "const numbers = [1, 2, 3, 4, 5];\nconst doubled = numbers.map(num => num * 2);\nconsole.log(doubled);"
    }
  },
  {
    id: "destructuring",
    title: "Destructuring",
    description: "Master object and array destructuring patterns.",
    challenge: {
      question: "Destructure name and age from this object: { name: 'John', age: 30, city: 'NY' }",
      startingCode: "const person = { name: 'John', age: 30, city: 'NY' };\n",
      solution: "const person = { name: 'John', age: 30, city: 'NY' };\nconst { name, age } = person;\nconsole.log(name, age);"
    }
  },
  {
    id: "promises",
    title: "Promises",
    description: "Learn to work with Promises for async operations.",
    challenge: {
      question: "Create a Promise that resolves with 'Success!' after 1 second",
      startingCode: "",
      solution: "const myPromise = new Promise(resolve => {\n  setTimeout(() => {\n    resolve('Success!');\n  }, 1000);\n});\n\nmyPromise.then(result => console.log(result));"
    }
  },
  {
    id: "async_await",
    title: "Async/Await",
    description: "Master modern async/await syntax.",
    challenge: {
      question: "Create an async function that waits 1 second then returns 'Done!'",
      startingCode: "",
      solution: "async function wait() {\n  await new Promise(resolve => setTimeout(resolve, 1000));\n  return 'Done!';\n}\n\nwait().then(result => console.log(result));"
    }
  },
  {
    id: "classes",
    title: "Classes",
    description: "Learn ES6 class syntax and object-oriented programming.",
    challenge: {
      question: "Create a class 'Person' with name property and a greet method",
      startingCode: "",
      solution: "class Person {\n  constructor(name) {\n    this.name = name;\n  }\n  greet() {\n    console.log(`Hello, I'm ${this.name}`);\n  }\n}\n\nconst person = new Person('John');\nperson.greet();"
    }
  },
  {
    id: "modules",
    title: "ES Modules",
    description: "Understand modern JavaScript modules and imports.",
    challenge: {
      question: "Create and export a function called 'sum' that adds two numbers",
      startingCode: "",
      solution: "function sum(a, b) {\n  return a + b;\n}\nconsole.log(sum(5, 3));"
    }
  },
  {
    id: "template_literals",
    title: "Template Literals",
    description: "Master template strings and expressions.",
    challenge: {
      question: "Use template literals to create a greeting with name and age variables",
      startingCode: "const name = 'John';\nconst age = 25;\n",
      solution: "const name = 'John';\nconst age = 25;\nconsole.log(`Hello, my name is ${name} and I am ${age} years old`);"
    }
  },
  {
    id: "spread_operator",
    title: "Spread Operator",
    description: "Learn to use the spread operator with arrays and objects.",
    challenge: {
      question: "Combine two arrays using the spread operator",
      startingCode: "const arr1 = [1, 2, 3];\nconst arr2 = [4, 5, 6];\n",
      solution: "const arr1 = [1, 2, 3];\nconst arr2 = [4, 5, 6];\nconst combined = [...arr1, ...arr2];\nconsole.log(combined);"
    }
  },
  {
    id: "array_reduce",
    title: "Array Reduce",
    description: "Master the reduce method for arrays.",
    challenge: {
      question: "Use reduce to sum all numbers in an array",
      startingCode: "const numbers = [1, 2, 3, 4, 5];\n",
      solution: "const numbers = [1, 2, 3, 4, 5];\nconst sum = numbers.reduce((acc, curr) => acc + curr, 0);\nconsole.log(sum);"
    }
  },
  {
    id: "error_handling",
    title: "Error Handling",
    description: "Learn to handle errors with try-catch blocks.",
    challenge: {
      question: "Create a try-catch block that handles a TypeError",
      startingCode: "",
      solution: "try {\n  const obj = null;\n  console.log(obj.property);\n} catch (error) {\n  if (error instanceof TypeError) {\n    console.log('Caught TypeError');\n  }\n}"
    }
  },
  {
    id: "callbacks",
    title: "Callbacks",
    description: "Understand callback functions in JavaScript.",
    challenge: {
      question: "Create a function that takes a callback and executes it after 1 second",
      startingCode: "",
      solution: "function delayedGreeting(callback) {\n  setTimeout(() => {\n    callback('Hello!');\n  }, 1000);\n}\n\ndelayedGreeting(message => console.log(message));"
    }
  },
  {
    id: "promise_chaining",
    title: "Promise Chaining",
    description: "Learn to chain multiple promises together.",
    challenge: {
      question: "Create two promises and chain them together",
      startingCode: "",
      solution: "new Promise(resolve => {\n  resolve(5);\n})\n.then(num => num * 2)\n.then(result => console.log(result));"
    }
  },
  {
    id: "object_methods",
    title: "Object Methods",
    description: "Master Object.keys, values, and entries.",
    challenge: {
      question: "Use Object.entries to log key-value pairs",
      startingCode: "const person = { name: 'John', age: 30 };\n",
      solution: "const person = { name: 'John', age: 30 };\nObject.entries(person).forEach(([key, value]) => {\n  console.log(`${key}: ${value}`);\n});"
    }
  },
  {
    id: "array_filter",
    title: "Array Filter",
    description: "Learn to filter arrays based on conditions.",
    challenge: {
      question: "Filter an array to get only even numbers",
      startingCode: "const numbers = [1, 2, 3, 4, 5, 6];\n",
      solution: "const numbers = [1, 2, 3, 4, 5, 6];\nconst evens = numbers.filter(num => num % 2 === 0);\nconsole.log(evens);"
    }
  },
  {
    id: "closure",
    title: "Closures",
    description: "Understand JavaScript closures and scope.",
    challenge: {
      question: "Create a counter function using closure",
      startingCode: "",
      solution: "function createCounter() {\n  let count = 0;\n  return () => {\n    count++;\n    console.log(count);\n  };\n}\n\nconst counter = createCounter();\ncounter();"
    }
  },
  {
    id: "this_keyword",
    title: "This Keyword",
    description: "Master the 'this' context in JavaScript.",
    challenge: {
      question: "Create an object with a method that uses 'this'",
      startingCode: "",
      solution: "const person = {\n  name: 'John',\n  greet() {\n    console.log(`Hello, my name is ${this.name}`);\n  }\n};\n\nperson.greet();"
    }
  }
];

export default function JavaScriptChallenges() {
  const navigate = useNavigate();
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [totalCompleted, setTotalCompleted] = useState(0);

  useEffect(() => {
    const loadUserProgress = async () => {
      if (!auth.currentUser) return;
      
      try {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const docSnap = await getDoc(userRef);
        
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setCompletedChallenges(userData.completedJavaScriptChallenges || []);
          setTotalCompleted(userData.totalJavaScriptCompleted || 0);
        } else {
          await setDoc(userRef, {
            completedJavaScriptChallenges: [],
            totalJavaScriptCompleted: 0,
            javascriptProgress: 0
          });
        }
      } catch (error) {
        console.error("Error loading user progress:", error);
      }
    };

    loadUserProgress();
  }, []);

  const updateProgress = async (challengeId) => {
    if (!auth.currentUser) return;
    
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const completedChallenges = userData.completedJavaScriptChallenges || [];
        
        if (!completedChallenges.includes(challengeId)) {
          const newCompletedChallenges = [...completedChallenges, challengeId];
          const newTotalCompleted = (userData.totalJavaScriptCompleted || 0) + 1;
          const progress = Math.round((newCompletedChallenges.length / modules.length) * 100);
          
          const challenge = modules.find(m => m.id === challengeId);
          const newActivity = {
            type: 'javascript_challenge',
            description: `Completed JavaScript Challenge: ${challenge.title}`,
            timestamp: new Date().toISOString()
          };

          const activities = userData.recentActivities || [];
          
          const updatedActivities = [newActivity, ...activities].slice(0, 10);
          
          await updateDoc(userRef, {
            completedJavaScriptChallenges: newCompletedChallenges,
            totalJavaScriptCompleted: newTotalCompleted,
            javascriptProgress: progress,
            recentActivities: updatedActivities
          });
          
          setCompletedChallenges(newCompletedChallenges);
          setTotalCompleted(newTotalCompleted);
        }
      }
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const runCode = async () => {
    setIsLoading(true);
    setOutput("");
    
    try {
      const submitResponse = await fetch('https://judge0-ce.p.rapidapi.com/submissions', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': '0c8373ea43msh72dbf2afde4dbd9p1483a9jsn0e405e49c72c',
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        },
        body: JSON.stringify({
          source_code: code,
          stdin: ''
        })
      });

      const submitData = await submitResponse.json();
      const token = submitData.token;

      let attempts = 0;
      const maxAttempts = 10;
      const getResult = async () => {
        const resultResponse = await fetch(`https://judge0-ce.p.rapidapi.com/submissions/${token}`, {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': '0c8373ea43msh72dbf2afde4dbd9p1483a9jsn0e405e49c72c',
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
          }
        });
        
        const resultData = await resultResponse.json();
        
        if (resultData.status?.id <= 2 && attempts < maxAttempts) {
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 1000));
          return getResult();
        }
        
        return resultData;
      };

      const result = await getResult();
      
      if (result.status?.id === 3) {
        const output = result.stdout || '';
        setOutput(output);
        
        if (selectedChallenge && checkSolution(output, selectedChallenge)) {
          console.log('Challenge completed!');
          await updateProgress(selectedChallenge.id);
          setShowSuccessModal(true);
          
          setCompletedChallenges(prev => {
            if (!prev.includes(selectedChallenge.id)) {
              return [...prev, selectedChallenge.id];
            }
            return prev;
          });
        } else {
          setShowErrorModal(true);
        }
      } else {
        const error = result.stderr || result.compile_output || 'An error occurred';
        setOutput(`Error: ${error}`);
      }
    } catch (error) {
      setOutput('Error executing code: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const checkSolution = (output, challenge) => {
    const cleanUserOutput = output.trim();
    
    if (challenge.id === "variables") {
      return cleanUserOutput.length > 0 && cleanUserOutput !== 'undefined';
    }
    
    try {
      let expectedOutput = '';
      const mockConsole = {
        log: (...args) => {
          expectedOutput += args.join(' ') + '\n';
        }
      };
      
      const solutionFunc = new Function('console', challenge.solution);
      solutionFunc(mockConsole);
      
      expectedOutput = expectedOutput.trim();
    
      return cleanUserOutput === expectedOutput;
    } catch (error) {
      console.error('Error in solution checking:', error);
      return false;
    }
  };

  const groupedModules = {
    intermediate: modules.slice(6, 12),
    advanced: modules.slice(12)
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-[#1a1f2e] to-gray-900 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
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
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-300 bg-clip-text text-transparent">
            JavaScript Challenges
          </h1>
          
          <div className="bg-gray-800/50 px-6 py-3 rounded-lg backdrop-blur-sm border border-gray-700/50">
            <span className="text-yellow-400 font-bold text-xl">{totalCompleted}</span>
            <span className="text-gray-400 text-lg"> / {modules.length}</span>
          </div>
        </div>

        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 mb-12"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-yellow-500 to-yellow-300 bg-clip-text text-transparent">
                Welcome to JavaScript Learning Journey
              </h2>
              <p className="text-gray-300 mb-6 max-w-2xl">
                Master JavaScript programming through our carefully crafted challenges. From basic concepts to advanced techniques, 
                each challenge is designed to build your skills progressively. * NOTE DO NOT USE CONSOLE.LOG FOR ANY CHALLENGE *
              </p>
              <div className="flex gap-8">
                <div className="flex items-center gap-2">
                  <FaLightbulb className="text-yellow-400" />
                  <span className="text-gray-300">Learn by Doing</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaGraduationCap className="text-yellow-400" />
                  <span className="text-gray-300">Progressive Difficulty</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaTrophy className="text-yellow-500" />
                  <span className="text-gray-300">Track Progress</span>
                </div>
              </div>
            </div>
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="hidden lg:block"
            >
              <FaJs className="text-9xl text-yellow-400/50" />
            </motion.div>
          </div>
        </motion.div>

        {/* Learning Path */}
        {Object.entries(groupedModules).map(([level, modules], index) => (
          <div key={level} className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold capitalize bg-gradient-to-r from-yellow-500 to-yellow-300 bg-clip-text text-transparent">
                {level} Challenges
              </h2>
              <div className="flex">
                {[...Array(index + 1)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400 text-sm" />
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((module) => (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={completedChallenges.includes(module.id) ? {} : { scale: 1.02 }}
                  className={`relative overflow-hidden bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 p-6 rounded-xl ${
                    completedChallenges.includes(module.id) 
                      ? 'opacity-75' 
                      : 'cursor-pointer hover:bg-gray-800/60 hover:border-yellow-500/50'
                  }`}
                >
                  <div className="absolute top-0 left-0 w-20 h-20">
                    <div className="absolute transform rotate-45 translate-x-[-50%] translate-y-[-50%] w-16 h-2 bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent" />
                  </div>

                  {completedChallenges.includes(module.id) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 bg-green-500/10 backdrop-blur-sm flex items-center justify-center"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 10 }}
                        className="bg-green-500/20 p-3 rounded-full"
                      >
                        <span className="text-green-500 text-4xl">✓</span>
                      </motion.div>
                    </motion.div>
                  )}

                  <h3 className="text-xl font-bold mb-3 text-yellow-300">{module.title}</h3>
                  <p className="text-gray-400 mb-4 text-sm">{module.description}</p>
                  
                  <div className="flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-600/80 to-yellow-700/80 hover:from-yellow-500/80 hover:to-yellow-600/80 backdrop-blur-sm text-sm font-medium transition-all duration-200"
                      onClick={() => window.open('https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide', '_blank')}
                    >
                      Tutorial
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        completedChallenges.includes(module.id)
                          ? 'bg-green-800/50 cursor-default'
                          : 'bg-gradient-to-r from-green-600/80 to-green-700/80 hover:from-green-500/80 hover:to-green-600/80'
                      }`}
                      onClick={() => {
                        if (!completedChallenges.includes(module.id)) {
                          setSelectedChallenge(module);
                          setCode(module.challenge.startingCode);
                          setOutput("");
                        }
                      }}
                    >
                      {completedChallenges.includes(module.id) ? 'Completed' : 'Challenge'}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        {/* Challenge Modal */}
        {selectedChallenge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="bg-gray-800/90 backdrop-blur-md border border-gray-700/50 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-yellow-400">
                  {selectedChallenge.title}
                </h2>
                <button
                  onClick={() => setSelectedChallenge(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="bg-gray-900/50 border border-gray-700/50 p-4 rounded-lg mb-6">
                <h3 className="font-bold mb-2 text-yellow-300">Challenge:</h3>
                <p className="text-gray-300">{selectedChallenge.challenge.question}</p>
              </div>

              <div className="space-y-4">
                <CodeMirror
                  value={code}
                  height="200px"
                  theme={vscodeDark}
                  extensions={[javascript()]}
                  onChange={(value) => setCode(value)}
                  className="rounded-lg overflow-hidden border border-gray-700/50"
                />

                <div className="flex justify-end gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-6 py-2 rounded-lg transition-all duration-200 ${
                      isLoading 
                        ? 'bg-gray-700 cursor-wait'
                        : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600'
                    }`}
                    onClick={runCode}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Running...' : 'Run Code'}
                  </motion.button>
                </div>

                {output && (
                  <div className="bg-gray-900/50 border border-gray-700/50 p-4 rounded-lg">
                    <h3 className="font-bold mb-2 text-yellow-300">Output:</h3>
                    <pre className="font-mono text-sm text-gray-300 whitespace-pre-wrap">{output}</pre>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-gray-800/90 backdrop-blur-md border border-gray-700/50 rounded-xl p-8 text-center max-w-md"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                className="text-6xl mb-4"
              >
                🎉
              </motion.div>
              <h2 className="text-2xl font-bold mb-4 text-yellow-300">Good Job!</h2>
              <p className="text-gray-300 mb-6">You've successfully completed this challenge!</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowSuccessModal(false);
                  setSelectedChallenge(null);
                }}
                className="bg-gradient-to-r from-green-600/80 to-green-700/80 hover:from-green-500/80 hover:to-green-600/80 px-6 py-2 rounded-lg transition-all duration-200"
              >
                Continue
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {/* Error Modal */}
        {showErrorModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-gray-800/90 backdrop-blur-md border border-gray-700/50 rounded-xl p-8 text-center max-w-md"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                className="text-6xl mb-4"
              >
                ❌
              </motion.div>
              <h2 className="text-2xl font-bold mb-4 text-yellow-300">Not Quite Right</h2>
              <p className="text-gray-300 mb-6">Your solution doesn't match the expected output. Try again!</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowErrorModal(false)}
                className="bg-gradient-to-r from-yellow-600/80 to-yellow-700/80 hover:from-yellow-500/80 hover:to-yellow-600/80 px-6 py-2 rounded-lg transition-all duration-200"
              >
                Try Again
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 