import firebase from "firebase";

const firebaseConfig = {
  apiKey: "AIzaSyD9moyKVymAxCI2buLF7axFrEW_MwnySqc",
  authDomain: "facebook-hs.firebaseapp.com",
  projectId: "facebook-hs",
  storageBucket: "facebook-hs.appspot.com",
  messagingSenderId: "539836950081",
  appId: "1:539836950081:web:9f9891071ac66345c5c8c0",
};

const firebaseApp = firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();
const db = firebase.firestore();

export { auth, provider };
export default db;
