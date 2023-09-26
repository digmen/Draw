// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyCMPjPyA1Gk1g_JNciUmV_86zMNnCvsg2w',
  authDomain: 'paintcontainer-ed608.firebaseapp.com',
  databaseURL:
    'https://paintcontainer-ed608-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'paintcontainer-ed608',
  storageBucket: 'paintcontainer-ed608.appspot.com',
  messagingSenderId: '78164492038',
  appId: '1:78164492038:web:703aec225890758e42a887',
  measurementId: 'G-KNM7KR1Z44',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
