const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const { initializeApp } = require("firebase/app");
const { getAuth, signInWithEmailAndPassword, signOut } = require("firebase/auth");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const serviceAccount = require("./adminsdk.json");

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

const clientApp = initializeApp(firebaseConfig);
const auth = getAuth(clientApp);


app.listen(4000, () => {
  console.log("Listening on port 4000");
});
