const STORAGE_KEY = 'devcompass_user_data';

export const getLocalUserData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
};

export const initializeLocalUser = () => {
  const initialData = {
    name: 'Anonymous',
    streak: 0,
    pythonProgress: 0,
    javascriptProgress: 0,
    completedChallenges: {
      python: [],
      javascript: []
    },
    recentActivities: [],
    lastUpdated: new Date().toISOString()
  };
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    return initialData;
  } catch (error) {
    console.error('Error initializing localStorage:', error);
    return initialData;
  }
};

export const updateLocalUserData = (data) => {
  try {
    const currentData = getLocalUserData() || initializeLocalUser();
    const updatedData = {
      ...currentData,
      ...data,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    return updatedData;
  } catch (error) {
    console.error('Error updating localStorage:', error);
    return data;
  }
};

export const updateLocalUserProgress = (challengeType, challengeId) => {
  try {
    const userData = getLocalUserData() || initializeLocalUser();
    const completedChallenges = userData.completedChallenges || { python: [], javascript: [] };
    
    if (!completedChallenges.python) completedChallenges.python = [];
    if (!completedChallenges.javascript) completedChallenges.javascript = [];
    
    if (!completedChallenges[challengeType].includes(challengeId)) {
      completedChallenges[challengeType].push(challengeId);
      
      const total = challengeType === 'javascript' ? 12 : 10;
      const completed = completedChallenges[challengeType].length;
      const progress = Math.round((completed / total) * 100);
      
      const updatedActivities = [
        {
          type: 'challenge_completion',
          challengeType,
          challengeId,
          timestamp: new Date().toISOString(),
          description: `Completed ${challengeType} challenge ${challengeId}`
        },
        ...(userData.recentActivities || []).slice(0, 4)
      ];

      const updatedData = {
        ...userData,
        completedChallenges,
        recentActivities: updatedActivities,
        [`${challengeType}Progress`]: progress
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      
      return updatedData;
    }
    return userData;
  } catch (error) {
    console.error('Error updating user progress:', error);
    return null;
  }
};

export const clearLocalUserData = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}; 