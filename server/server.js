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
const db = admin.firestore();

app.post('/signin', async (req, res) => {
  const { uid } = req.body;

  if (!uid) {
    return res.status(400).send({ error: 'UID is required' });
  }

  try {
    const userRef = db.collection('users').doc(uid);
    const doc = await userRef.get();

    if (doc.exists) {
      return res.status(200).send({ message: 'User already exists' });
    } else {
      await userRef.set({ uid });
      return res.status(201).send({ message: 'User added successfully' });
    }
  } catch (error) {
    console.error('Error checking or saving user: ', error);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
});

app.post('/add', async (req, res) => {
  const event = req.body;

  try {
    const userRef = db.collection('users').doc(event.uid);
    const eventRef = await userRef.collection('events').add({
      title: event.title,
      start: event.startTime,
      end: event.endTime,
      extendedProps: {
        date: event.extendedProps.date,
        type: event.extendedProps.type,
        groups: event.extendedProps.groups,
        teacher: event.extendedProps.teacher,
        location: event.extendedProps.location,
        editable: event.extendedProps.editable
      }
    });
    res.status(201).send({ id: eventRef.id });
  } catch (error) {
    console.error('Error adding event:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }

});

app.post('/update', async (req, res) => {
  const event = req.body;
  try {
    const userRef = db.collection('users').doc(event.uid);
    const eventRef = userRef.collection('events').doc(event.id);

    const doc = await eventRef.get();
    if (!doc.exists) {
      return res.status(404).send({ message: 'Event not found' });
    }

    await eventRef.update({
      title: event.title,
      start: event.startTime,
      end: event.endTime,
      extendedProps: {
        date: event.extendedProps.date,
        type: event.extendedProps.type,
        groups: event.extendedProps.groups,
        teacher: event.extendedProps.teacher,
        location: event.extendedProps.location,
        editable: event.extendedProps.editable
      }
    });

    res.status(200).send({ message: 'Event updated successfully' });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});


app.listen(4000, () => {
  console.log("Listening on port 4000");
});
