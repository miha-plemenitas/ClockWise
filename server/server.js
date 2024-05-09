const express = require("express");
const cors = require("cors");
const { initializeApp } = require("firebase-admin/app");
const { signInWithEmailAndPassword } = require('firebase/auth');
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

var admin = require("firebase-admin");

var serviceAccount = require("./adminsdk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

//prijava
app.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  await signInWithEmailAndPassword(admin.auth(), email, password)
    .then(result => {
      res.sendStatus(200);
    })
    .catch(error => {
      res.status(500).json({ error: "Napaka" });
    });

});

app.get('/test', (req, res) => {
  res.send('Dela!');
});

app.listen(4000, () => { console.log("Listening on port 4000") })


/*
const express = require("express");
const cors = require("cors");
const { initializeApp } = require("firebase-admin/app");
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
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


//prijava
app.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  console.log('Dela?')
  
    await signInWithEmailAndPassword(auth, email, password)
    .then(result => {
      res.sendStatus(200);
    })
    .catch(error => {
      res.status(500).json({ error: "Napaka" });
    });
    
});

app.listen(4000, () => { console.log("Listening on port 4000") })
*/