import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import LearningPath from './components/LearningPath';
import PythonChallenges from './components/PythonChallenges';
import JavaScriptChallenges from './components/JavaScriptChallenges';
import Community from './components/Community';
import Login from './components/Login';
import Signup from './components/Signup';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/learning-path" element={<LearningPath />} />
      <Route path="/python-challenges" element={<PythonChallenges />} />
      <Route path="/javascript-challenges" element={<JavaScriptChallenges />} />
      <Route path="/community" element={<Community />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
}

export default App;

