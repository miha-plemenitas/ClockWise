const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const tf = require("@tensorflow/tfjs");
const axios = require("axios");
const fs = require("fs");
const csv = require("csv-parser");
const { exec } = require("child_process");
const translatte = require("translatte");
const googleTTS = require("google-tts-api");
const { initializeApp } = require("firebase/app");
const {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} = require("firebase/auth");
const {
  getFirestore,
  collection,
  getDocs,
} = require("firebase/firestore/lite");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

var admin = require("firebase-admin");

var serviceAccount = require("./adminsdk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const firebaseConfig = {
  apiKey: "AIzaSyCv4XGuQtoGgUs4DSpIrhFKDRSyLRuvXUs",
  authDomain: "pameten-urnik.firebaseapp.com",
  projectId: "pameten-urnik",
  storageBucket: "pameten-urnik.appspot.com",
  messagingSenderId: "985838922008",
  appId: "1:985838922008:web:5d36305a8f0bb94632566d",
};

const appFire = initializeApp(firebaseConfig);
const auth = getAuth(appFire);
const dbFire = admin.firestore();
