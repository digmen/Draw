import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

const firebaseConfig = {
    apiKey: "AIzaSyCMPjPyA1Gk1g_JNciUmV_86zMNnCvsg2w",
    authDomain: "paintcontainer-ed608.firebaseapp.com",
    databaseURL: "https://paintcontainer-ed608-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "paintcontainer-ed608",
    storageBucket: "paintcontainer-ed608.appspot.com"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.database();
export { db };
