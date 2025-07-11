// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBdhGw_GObreEhja9WJOw-eES4XiqCxKKI",
    authDomain: "ithyaraa-a0679.firebaseapp.com",
    projectId: "ithyaraa-a0679",
    storageBucket: "ithyaraa-a0679.firebasestorage.app",
    messagingSenderId: "847750740191",
    appId: "1:847750740191:web:81f59c7605d0ad05af516a",
    measurementId: "G-BZ8YM8XFFG"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
