import React, { useState, useEffect } from 'react';
import mainImage from '../assets/main.jpg';
import viteLogo from '../assets/vite.svg';
import { Link } from 'react-router-dom';

const Icons = {
  Code: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-10 h-10">
      <path d="M16 18L22 12L16 6M8 6L2 12L8 18" />
    </svg>
  ),
  Users: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-10 h-10">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
    </svg>
  ),
  TrendingUp: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-10 h-10">
      <path d="M23 6l-9.5 9.5-5-5L1 18" />
    </svg>
  ),
  Globe: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-10 h-10">
      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M3.6 9h16.8 M3.6 15h16.8 M12 3a15 15 0 0 1 0 18" />
    </svg>
  ),
  Flame: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-10 h-10">
      <path d="M12 2c1 7-3 9-3 13a3 3 0 1 0 6 0c0-4-4-6-3-13Z" />
    </svg>
  )
};

const languages = [
  { 
    name: 'Python',
    icon: (
      <svg viewBox="0 0 256 255" className="w-10 h-10">
        <defs>
          <linearGradient x1="12.959%" y1="12.039%" x2="79.639%" y2="78.201%" id="python-logo">
            <stop stopColor="#387EB8" offset="0%" />
            <stop stopColor="#366994" offset="100%" />
          </linearGradient>
          <linearGradient x1="19.128%" y1="20.579%" x2="90.742%" y2="88.429%" id="python-logo-2">
            <stop stopColor="#FFE052" offset="0%" />
            <stop stopColor="#FFC331" offset="100%" />
          </linearGradient>
        </defs>
        <path d="M126.916.072c-64.832 0-60.784 28.115-60.784 28.115l.072 29.128h61.868v8.745H41.631S.145 61.355.145 126.77c0 65.417 36.21 63.097 36.21 63.097h21.61v-30.356s-1.165-36.21 35.632-36.21h61.362s34.475.557 34.475-33.319V33.97S194.67.072 126.916.072zM92.802 19.66a11.12 11.12 0 0 1 11.13 11.13 11.12 11.12 0 0 1-11.13 11.13 11.12 11.12 0 0 1-11.13-11.13 11.12 11.12 0 0 1 11.13-11.13z" fill="url(#python-logo)" />
        <path d="M128.757 254.126c64.832 0 60.784-28.115 60.784-28.115l-.072-29.127H127.6v-8.745h86.441s41.486 4.705 41.486-60.712c0-65.416-36.21-63.096-36.21-63.096h-21.61v30.355s1.165 36.21-35.632 36.21h-61.362s-34.475-.557-34.475 33.32v56.013s-5.235 33.897 62.518 33.897zm34.114-19.586a11.12 11.12 0 0 1-11.13-11.13 11.12 11.12 0 0 1 11.13-11.131 11.12 11.12 0 0 1 11.13 11.13 11.12 11.12 0 0 1-11.13 11.13z" fill="url(#python-logo-2)" />
      </svg>
    )
  },
  { 
    name: 'JavaScript',
    icon: (
      <svg viewBox="0 0 256 256" className="w-10 h-10">
        <path fill="#F7DF1E" d="M0 0h256v256H0V0z"/>
        <path d="M67.312 213.932l19.59-11.856c3.78 6.701 7.218 12.371 15.465 12.371 7.905 0 12.89-3.092 12.89-15.12v-81.798h24.057v82.138c0 24.917-14.606 36.259-35.916 36.259-19.245 0-30.416-9.967-36.087-21.996M152.381 211.354l19.588-11.341c5.157 8.421 11.859 14.607 23.715 14.607 9.969 0 16.325-4.984 16.325-11.858 0-8.248-6.53-11.17-17.528-15.98l-6.013-2.58c-17.357-7.387-28.87-16.667-28.87-36.257 0-18.044 13.747-31.792 35.228-31.792 15.294 0 26.292 5.328 34.196 19.247L210.29 147.43c-4.125-7.389-8.591-10.31-15.465-10.31-7.046 0-11.514 4.468-11.514 10.31 0 7.217 4.468 10.14 14.778 14.608l6.014 2.577c20.45 8.765 31.963 17.7 31.963 37.804 0 21.654-17.012 33.51-39.867 33.51-22.339 0-36.774-10.654-43.819-24.574"/>
      </svg>
    )
  },
  { 
    name: 'Java',
    icon: (
      <svg viewBox="0 0 256 346" className="w-10 h-10">
        <path d="M82.554 267.473s-13.198 7.675 9.393 10.272c27.369 3.122 41.356 2.675 71.517-3.034 0 0 7.93 4.972 19.003 9.279-67.611 28.977-153.019-1.679-99.913-16.517M74.292 229.659s-14.803 10.958 7.805 13.296c29.236 3.016 52.324 3.263 92.276-4.43 0 0 5.526 5.602 14.215 8.666-81.747 23.904-172.798 1.885-114.296-17.532" fill="#5382A1"/>
        <path d="M143.942 165.515c16.66 19.18-4.377 36.44-4.377 36.44s42.301-21.837 22.874-49.183c-18.144-25.5-32.059-38.172 43.268-81.858 0 0-118.238 29.53-61.765 94.6" fill="#E76F00"/>
      </svg>
    ),
    comingSoon: true
  },
  { 
    name: 'C++',
    icon: (
      <svg viewBox="0 0 256 288" className="w-10 h-10">
        <path fill="#00599C" d="M255.569 84.72c-.002-4.83-1.035-9.098-3.124-12.761-2.052-3.602-5.125-6.621-9.247-9.008-34.025-19.619-68.083-39.178-102.097-58.817-9.17-5.294-18.061-5.101-27.163.269C100.395 12.39 32.59 51.237 12.385 62.94 4.064 67.757.015 75.129.013 84.711 0 124.166.013 163.62 0 203.076c.002 4.724.991 8.909 2.988 12.517 2.053 3.711 5.169 6.813 9.386 9.254 20.206 11.703 88.02 50.547 101.56 58.536 9.106 5.373 17.997 5.565 27.17.269 34.015-19.64 68.075-39.198 102.105-58.817 4.217-2.44 7.333-5.544 9.386-9.252 1.994-3.608 2.985-7.793 2.987-12.518 0 0 0-78.889-.013-118.345"/>
        <path fill="#fff" d="M128.182 143.509L2.988 215.593c2.053 3.711 5.169 6.813 9.386 9.254 20.206 11.703 88.02 50.547 101.56 58.536 9.106 5.373 17.997 5.565 27.17.269 34.015-19.64 68.075-39.198 102.105-58.817 4.217-2.44 7.333-5.544 9.386-9.252l-124.413-72.074"/>
        <path fill="#00599C" d="M91.101 164.861c7.285 12.718 20.98 21.296 36.69 21.296 15.807 0 29.58-8.687 36.828-21.541l-36.437-21.107-37.081 21.352"/>
        <path fill="#fff" d="M255.569 84.72c-.002-4.83-1.035-9.098-3.124-12.761l-124.263 71.55 124.413 72.074c1.994-3.608 2.985-7.793 2.987-12.518 0 0 0-78.889-.013-118.345"/>
        <path fill="#fff" d="M248.728 148.661h-9.722v9.724h-9.724v-9.724h-9.721v-9.721h9.721v-9.722h9.724v9.722h9.722v9.721M213.253 148.661h-9.721v9.724h-9.722v-9.724h-9.722v-9.721h9.722v-9.722h9.722v9.722h9.721v9.721"/>
      </svg>
    ),
    comingSoon: true
  },
];

const features = [
  { title: 'Community Support', description: 'Connect with fellow learners and get help when you need it.', icon: 'Users' },
  { title: 'Progress Tracking', description: 'Monitor your growth with detailed progress reports and analytics.', icon: 'TrendingUp' },
  { title: 'Coding Streaks', description: 'Stay motivated with daily coding streaks and achievements.', icon: 'Code' },
  { title: 'Multi-language Support', description: 'Learn multiple programming languages on a single platform.', icon: 'Globe' },
];

const buttons = [
  { text: 'Sign Up', path: '/signup', variant: 'ghost', position: 'nav' },
];

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = 'px-4 py-2 rounded-md font-medium transition-colors';
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    ghost: 'text-gray-300 hover:text-white hover:bg-gray-700',
    outline: 'border border-blue-400 text-blue-400 hover:bg-blue-900'
  };
  
  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Card = ({ children, className = '' }) => (
  <div className={`bg-gray-700 rounded-lg p-6 ${className}`}>
    {children}
  </div>
);

export default function Home() {
  const [typedText, setTypedText] = useState('Learn Python');
  const [activeTab, setActiveTab] = useState('python');
  const [progress, setProgress] = useState(0);
  const texts = ['Learn Python', 'Master JavaScript', 'Build Real Projects', 'Advance Your Career'];

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % texts.length;
      setTypedText(texts[currentIndex]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-800/95">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-400">
            DevCompass
          </div>
          <div className="flex space-x-4">
            {buttons.filter(button => button.position === 'nav').map((button) => (
              <Link to={button.path} key={button.text}>
                <Button variant={button.variant}>{button.text}</Button>
              </Link>
            ))}
          </div>
        </div>
      </header>

      <main className="pt-20">
        <section className="container mx-auto px-4 py-20 flex flex-col md:flex-row items-center justify-between relative">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-5xl font-bold mb-6 leading-tight relative z-10">
              Welcome to <span className="text-blue-400">DevCompass</span>
            </h1>
            <img 
              src={viteLogo} 
              alt="Vite Logo" 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 z-0"
            />
            <p className="text-xl mb-8 text-gray-300">
            </p>
            <div className="text-3xl font-bold text-blue-400 mb-8">
              {typedText}
            </div>
            <div className="flex flex-col items-center gap-4">
              <Link to="/dashboard">
                <Button variant="primary" className="text-lg px-8 py-3">
                  Get Started
                </Button>
              </Link>
              <p className="text-gray-400 text-sm">No sign in required</p>
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="bg-gray-800 rounded-lg p-4 aspect-video">
              <img src={mainImage} alt="Coding Illustration" className="w-full h-full object-cover rounded" />
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-800">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12">Why Choose DevCompass?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card key={index}>
                  <div className="text-blue-400 mb-4">
                    {Icons[feature.icon]()}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-900">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12">Languages You'll Master</h2>
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="grid grid-cols-4 gap-2 mb-6">
                {languages.map((lang) => (
                  <button
                    key={lang.name}
                    onClick={() => !lang.comingSoon && setActiveTab(lang.name.toLowerCase())}
                    className={`p-4 rounded ${
                      activeTab === lang.name.toLowerCase()
                        ? 'bg-blue-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    } ${lang.comingSoon ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {lang.name}
                    {lang.comingSoon && (
                      <span className="ml-2 text-xs bg-gray-700 px-2 py-1 rounded">Soon</span>
                    )}
                  </button>
                ))}
              </div>
              {languages.map((lang) => (
                activeTab === lang.name.toLowerCase() && (
                  <Card key={lang.name}>
                    <div className="flex items-center mb-4">
                      <span className="text-3xl mr-4">{lang.icon}</span>
                      <h3 className="text-xl font-bold">{lang.name}</h3>
                    </div>
                    <p className="text-gray-300 mb-4">
                      Master {lang.name} with our comprehensive curriculum and hands-on projects.
                    </p>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </Card>
                )
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-800">
          <div className="container mx-auto px-4">
            <Card className="overflow-hidden">
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <Icons.Flame />
                  <h2 className="text-3xl font-bold ml-2">Coding Streaks</h2>
                </div>
                <p className="text-lg mb-4 text-gray-300">
                  Build a habit of coding daily with our streak system. Complete at least one challenge every day to maintain your streak. The longer your streak, the more rewards you'll unlock!
                </p>
                <div className="flex justify-center items-center">
                  <div className="relative w-48 h-48">
                    <div className="w-full h-full rounded-full bg-gray-800 absolute" />
                    <svg className="w-48 h-48 transform -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="12"
                        className="text-gray-600"
                      />
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="12"
                        strokeDasharray={553}
                        strokeDashoffset={553 * (1 - 30/100)}
                        className="text-yellow-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-5xl font-bold text-white">30</span>
                      <span className="text-lg text-gray-300">days</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 py-6 text-center">
        <p className="text-gray-400">&copy; 2025 DevCompass. All rights reserved.</p>
      </footer>
    </div>
  );
}