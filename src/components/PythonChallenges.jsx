'use client'

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaArrowLeft, FaPython, FaStar, FaLightbulb, FaGraduationCap, FaTrophy } from 'react-icons/fa'
import CodeMirror from '@uiw/react-codemirror'
import { python } from '@codemirror/lang-python'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'
import { auth, db } from '../firebaseConfig'
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'
import { getLocalUserData, updateLocalUserProgress } from '../utils/localStorageManager'

const modules = [
  {
    id: "variables",
    title: "Variables and Data Types",
    description: "Learn about Python's basic data types and how to use variables.",
    challenge: {
      question: "Create a variable 'name' with your name and print it",
      startingCode: "",
      solution: "name = 'Your Name'\nprint(name)"
    }
  },
  {
    id: "conditionals",
    title: "Conditional Statements",
    description: "Learn how to use if, elif, and else statements in Python.",
    challenge: {
      question: "Write an if statement to check if a number is positive or negative",
      startingCode: "number = 5\n",
      solution: "number = 5\nif number > 0:\n    print('Positive')\nelse:\n    print('Negative')"
    }
  },
  {
    id: "loops",
    title: "Loops",
    description: "Explore for and while loops in Python.",
    challenge: {
      question: "Create a for loop that prints numbers from 1 to 5",
      startingCode: "",
      solution: "for i in range(1, 6):\n    print(i)"
    }
  },
  {
    id: "functions",
    title: "Functions",
    description: "Learn how to define and use functions in Python.",
    challenge: {
      question: "Define a function that adds two numbers",
      startingCode: "",
      solution: "def add_numbers(a, b):\n    return a + b\n\nprint(add_numbers(5, 3))"
    }
  },
  {
    id: "lists",
    title: "Lists",
    description: "Explore Python lists and list comprehensions.",
    challenge: {
      question: "Create a list of even numbers from 2 to 10",
      startingCode: "",
      solution: "even_numbers = [i for i in range(2, 11, 2)]\nprint(even_numbers)"
    }
  },
  {
    id: "dictionaries",
    title: "Dictionaries",
    description: "Learn about Python dictionaries and their operations.",
    challenge: {
      question: "Create a dictionary with three key-value pairs",
      startingCode: "",
      solution: "my_dict = {'name': 'John', 'age': 30, 'city': 'New York'}\nprint(my_dict)"
    }
  },
  {
    id: "strings",
    title: "String Manipulation",
    description: "Explore various string manipulation techniques in Python.",
    challenge: {
      question: "Reverse a string using slicing",
      startingCode: "text = 'Hello World'\n",
      solution: "text = 'Hello World'\nreversed_text = text[::-1]\nprint(reversed_text)"
    }
  },
  {
    id: "fileio",
    title: "File I/O",
    description: "Learn how to read from and write to files in Python.",
    challenge: {
      question: "Write exactly this code to create and write to a text file:\nwith open('example.txt', 'w') as f:\n    f.write('Hello, World!')",
      startingCode: "",
      solution: "with open('example.txt', 'w') as f:\n    f.write('Hello, World!')"
    }
  },
  {
    id: "exceptions",
    title: "Exception Handling",
    description: "Learn to handle errors with try/except blocks.",
    challenge: {
      question: "Write a try/except block that handles division by zero",
      startingCode: "x = 10\ny = 0\n",
      solution: "x = 10\ny = 0\ntry:\n    result = x / y\n    print(result)\nexcept ZeroDivisionError:\n    print('Cannot divide by zero')"
    }
  },
  {
    id: "sets",
    title: "Sets",
    description: "Master Python sets and their operations.",
    challenge: {
      question: "Create two sets and print their intersection",
      startingCode: "",
      solution: "set1 = {1, 2, 3, 4}\nset2 = {3, 4, 5, 6}\nprint(set1.intersection(set2))"
    }
  },
  {
    id: "list_comprehension",
    title: "List Comprehension",
    description: "Learn advanced list comprehension techniques.",
    challenge: {
      question: "Create a list of squares for even numbers from 1 to 10",
      startingCode: "",
      solution: "squares = [x**2 for x in range(1, 11) if x % 2 == 0]\nprint(squares)"
    }
  },
  {
    id: "lambda",
    title: "Lambda Functions",
    description: "Explore anonymous lambda functions.",
    challenge: {
      question: "Create a lambda function that returns the square of a number and test it with 5",
      startingCode: "",
      solution: "square = lambda x: x**2\nprint(square(5))"
    }
  },
  {
    id: "recursion",
    title: "Recursion",
    description: "Master recursive function calls.",
    challenge: {
      question: "Write a recursive function to calculate factorial of 5",
      startingCode: "",
      solution: "def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n-1)\n\nprint(factorial(5))"
    }
  },
  {
    id: "decorators",
    title: "Decorators",
    description: "Learn about function decorators.",
    challenge: {
      question: "Create a decorator that prints function execution time",
      startingCode: "",
      solution: "def timer(func):\n    def wrapper():\n        print('Starting...')\n        func()\n        print('Finished!')\n    return wrapper\n\n@timer\ndef hello():\n    print('Hello World')\n\nhello()"
    }
  },
  {
    id: "generators",
    title: "Generators",
    description: "Understand Python generators and yield.",
    challenge: {
      question: "Create a generator that yields the first 5 even numbers",
      startingCode: "",
      solution: "def even_numbers():\n    n = 0\n    for i in range(5):\n        n += 2\n        yield n\n\nfor num in even_numbers():\n    print(num)"
    }
  },
  {
    id: "classes_inheritance",
    title: "Class Inheritance",
    description: "Master object-oriented inheritance.",
    challenge: {
      question: "Create a Child class that inherits from Parent class and overrides a method",
      startingCode: "",
      solution: "class Parent:\n    def greet(self):\n        return 'Hello'\n\nclass Child(Parent):\n    def greet(self):\n        return 'Hi there'\n\nchild = Child()\nprint(child.greet())"
    }
  },
  {
    id: "context_managers",
    title: "Context Managers",
    description: "Learn about context managers and the with statement.",
    challenge: {
      question: "Create a context manager that measures execution time",
      startingCode: "",
      solution: "from time import time\n\nclass Timer:\n    def __enter__(self):\n        print('Starting timer')\n        return self\n    \n    def __exit__(self, *args):\n        print('Ending timer')\n\nwith Timer():\n    print('Inside context manager')"
    }
  },
  {
    id: "regex",
    title: "Regular Expressions",
    description: "Master pattern matching with regex.",
    challenge: {
      question: "Write a regex pattern to find all email addresses in a string",
      startingCode: "import re\ntext = 'Contact us: test@email.com or support@test.com'\n",
      solution: "import re\ntext = 'Contact us: test@email.com or support@test.com'\npattern = r'\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b'\nemails = re.findall(pattern, text)\nprint(emails)"
    }
  }
]

export default function PythonChallenges() {
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
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(userRef);
          
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setCompletedChallenges(userData.completedPythonChallenges || []);
            setTotalCompleted(userData.totalPythonCompleted || 0);
          } else {
            await setDoc(userRef, {
              completedPythonChallenges: [],
              totalPythonCompleted: 0,
              pythonProgress: 0
            });
          }
        } catch (error) {
          console.error("Error loading user progress:", error);
        }
      } else {
        const localData = getLocalUserData();
        if (localData) {
          setCompletedChallenges(localData.completedPythonChallenges || []);
          setTotalCompleted(localData.totalPythonCompleted || 0);
        }
      }
    };

    loadUserProgress();
  }, []);

  const updateProgress = async (challengeId) => {
    const currentUser = auth.currentUser;
    
    if (currentUser) {
      try {
        const userRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userRef);
        
        if (docSnap.exists()) {
          const userData = docSnap.data();
          const completedChallenges = userData.completedPythonChallenges || [];
          
          if (!completedChallenges.includes(challengeId)) {
            const newCompletedChallenges = [...completedChallenges, challengeId];
            const newTotalCompleted = (userData.totalPythonCompleted || 0) + 1;
            const progress = Math.round((newCompletedChallenges.length / modules.length) * 100);
            
            const challenge = modules.find(m => m.id === challengeId);
            const newActivity = {
              type: 'python_challenge',
              description: `Completed Python Challenge: ${challenge.title}`,
              timestamp: new Date().toISOString()
            };

            const activities = userData.recentActivities || [];
            
            const updatedActivities = [newActivity, ...activities].slice(0, 10);
            
            await updateDoc(userRef, {
              completedPythonChallenges: newCompletedChallenges,
              totalPythonCompleted: newTotalCompleted,
              pythonProgress: progress,
              recentActivities: updatedActivities
            });
            
            setCompletedChallenges(newCompletedChallenges);
            setTotalCompleted(newTotalCompleted);
          }
        }
      } catch (error) {
        console.error("Error updating progress:", error);
      }
    } else {
      const challenge = modules.find(m => m.id === challengeId);
      const success = updateLocalUserProgress('Python', challengeId, challenge.title);
      
      if (success) {
        const localData = getLocalUserData();
        setCompletedChallenges(localData.completedPythonChallenges);
        setTotalCompleted(localData.totalPythonCompleted);
      }
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
          language_id: 71,
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
    
    switch (challenge.id) {
      case "variables":
        const cleanedVarOutput = cleanUserOutput.replace(/['"]/g, '');
        return cleanedVarOutput.length > 0 && cleanedVarOutput !== 'undefined';
        
      case "conditionals":
        return cleanUserOutput === "positive";
        
      case "loops":
        const expectedLoopOutput = "1\n2\n3\n4\n5".toLowerCase();
        const normalizedOutput = cleanUserOutput.replace(/\r\n/g, '\n');
        return normalizedOutput === expectedLoopOutput;
        
      case "functions":
        return cleanUserOutput === "8";
        
      case "lists":
        const cleanedListOutput = cleanUserOutput.replace(/[\[\]\s]/g, '');
        const expectedListOutput = "2,4,6,8,10";
        return cleanedListOutput === expectedListOutput;
        
      case "dictionaries":
        try {
          const dictString = cleanUserOutput
            .replace(/'/g, '"')  
            .replace(/None/g, 'null'); 
          
          const userDict = JSON.parse(dictString);
          
          if (Object.keys(userDict).length !== 3) return false;
          
          return userDict.hasOwnProperty('name') && 
                 userDict.hasOwnProperty('age') && 
                 userDict.hasOwnProperty('city');
        } catch {
          return false;
        }
        
      case "strings":
        return cleanUserOutput === "dlrow olleh";
        
      case "fileio":
        return cleanUserOutput === '' || cleanUserOutput === 'hello, world!';
        
      default:
        return false;
    }
  };

  const groupedModules = {
    beginner: modules.slice(0, 6),
    intermediate: modules.slice(6, 12),
    advanced: modules.slice(12)
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-[#1a1f2e] to-gray-900 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
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
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
            Python Challenges
          </h1>
          
          <div className="bg-gray-800/50 px-6 py-3 rounded-lg backdrop-blur-sm border border-gray-700/50">
            <span className="text-blue-400 font-bold text-xl">{totalCompleted}</span>
            <span className="text-gray-400 text-lg"> / {modules.length}</span>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 mb-12"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                Welcome to Python Learning Journey
              </h2>
              <p className="text-gray-300 mb-6 max-w-2xl">
                Master Python programming through our carefully crafted challenges. From basic concepts to advanced techniques, 
                each challenge is designed to build your skills progressively.
              </p>
              <div className="flex gap-8">
                <div className="flex items-center gap-2">
                  <FaLightbulb className="text-yellow-400" />
                  <span className="text-gray-300">Learn by Doing</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaGraduationCap className="text-blue-400" />
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
              <FaPython className="text-9xl text-blue-400/50" />
            </motion.div>
          </div>
        </motion.div>

        {Object.entries(groupedModules).map(([level, modules], index) => (
          <div key={level} className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold capitalize bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
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
                      : 'cursor-pointer hover:bg-gray-800/60 hover:border-blue-500/50'
                  }`}
                >
                  <div className="absolute top-0 left-0 w-20 h-20">
                    <div className="absolute transform rotate-45 translate-x-[-50%] translate-y-[-50%] w-16 h-2 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
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

                  <h3 className="text-xl font-bold mb-3 text-blue-300">{module.title}</h3>
                  <p className="text-gray-400 mb-4 text-sm">{module.description}</p>
                  
                  <div className="flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600/80 to-blue-700/80 hover:from-blue-500/80 hover:to-blue-600/80 backdrop-blur-sm text-sm font-medium transition-all duration-200"
                      onClick={() => window.open('https://docs.python.org/3/tutorial/', '_blank')}
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
                <h2 className="text-2xl font-bold text-blue-400">
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
                <h3 className="font-bold mb-2 text-blue-300">Challenge:</h3>
                <p className="text-gray-300">{selectedChallenge.challenge.question}</p>
              </div>

              <div className="space-y-4">
                <CodeMirror
                  value={code}
                  height="200px"
                  theme={vscodeDark}
                  extensions={[python()]}
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
                    <h3 className="font-bold mb-2 text-blue-300">Output:</h3>
                    <pre className="font-mono text-sm text-gray-300 whitespace-pre-wrap">{output}</pre>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <div className="bg-gray-800 rounded-lg p-6 text-center max-w-md">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mb-4 text-6xl">
                🎉
              </motion.div>
              <h2 className="text-2xl font-bold mb-4">Good Job!</h2>
              <p className="text-gray-300 mb-6">You've successfully completed this challenge!</p>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setSelectedChallenge(null);
                }}
                className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-md transition-colors"
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {showErrorModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <div className="bg-gray-800 rounded-lg p-6 text-center max-w-md">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mb-4 text-6xl">
                ❌
              </motion.div>
              <h2 className="text-2xl font-bold mb-4">Not Quite Right</h2>
              <p className="text-gray-300 mb-6">Your solution doesn't match the expected output. Try again!</p>
              <button
                onClick={() => setShowErrorModal(false)}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-md transition-colors"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

