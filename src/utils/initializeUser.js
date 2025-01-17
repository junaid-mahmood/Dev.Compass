import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

export const initializeUser = async () => {
  if (!auth.currentUser) return null;

  const userRef = doc(db, 'users', auth.currentUser.uid);
  
  try {
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      const userData = {
        name: auth.currentUser.displayName || 'Anonymous User',
        email: auth.currentUser.email,
        profilePicture: auth.currentUser.photoURL || null,
        createdAt: new Date(),
        streak: 0,
        completedPythonChallenges: [],
        completedJavaScriptChallenges: [],
        lastActive: new Date()
      };
      
      await setDoc(userRef, userData);
      console.log('Created new user document');
      return userData;
    }
    
    return userSnap.data();
  } catch (error) {
    console.error('Error initializing user:', error);
    return null;
  }
}; 