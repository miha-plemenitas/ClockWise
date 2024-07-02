# ClockWise

ClockWise is a smart scheduling application designed to help users efficiently manage their time with advanced planning tools and intuitive interfaces. Our platform categorizes users into four distinct roles: Student, Tutor, Referat, and Admin, each with tailored functionalities to enhance their scheduling experience.

For Students, ClockWise offers the ability to view specific timetables for their faculty, customized according to their program year and branch. They can filter timetables based on course, tutor, room, and group, create custom events, access detailed lecture information, and save their timetable to a personalized dashboard.

Tutors have all the capabilities of Students, with the addition of a dedicated timetable for their sessions. They can also find available rooms, add new lectures for tests and other purposes, and manage their teaching schedule more effectively.

The Referat role encompasses all the functionalities of the Tutor role and extends further. Referat users can create time slots to mark periods when no education activities occur, such as holidays. They can generate and visualize a heatmap based on lecture counts and frequency, create new timetables, and display them for users.

The Admin role is focused on administrative tasks, including authenticating and managing the Referat and Tutor roles, ensuring the smooth operation and security of the platform.

ClockWise brings significant benefits to both students and teachers by simplifying the process of timetable management and enhancing the overall efficiency of scheduling tasks. Students can easily navigate and customize their academic schedules, ensuring they stay organized and up-to-date with their coursework. Tutors and Referat users can manage their teaching responsibilities more effectively, optimize room usage, and adapt quickly to schedule changes. Admins ensure a secure and well-regulated environment for all users. With ClockWise, the academic community can experience a more streamlined, user-friendly approach to time management.

## SonarCloud Code Review

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=miha-plemenitas_ClockWise&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=miha-plemenitas_ClockWise)

## Initialization

### Firebase project

1. Create a new Firebase project: [Firebase console](https://console.firebase.google.com/u/0/)
2. Change the plan from Spark to Blaze (Pay as you go)
3. Enable Firebase functionalities:

- Authentication: Build -> Authentication -> Get started -> Native providers: Email/Password and Additional providers: Google
- Firestore: Build -> Firestore Database -> Create database -> Start in **test mode**
- Functions: Build -> Functions -> Get started

4. Registration of the web app:

- Project Overview -> Add app -> Web app -> copy the body of the firebaseConfig for the 9th point

### Local project

You require [Node.js](https://nodejs.org/en/download).

1. Download or clone the project in the wanted directory and start a terminal session
2. Go to directory `.\server`
3. Download Firebase: `$ npm install -g firebase-tools`
4. Log into Firebase: `$ firebase login`
5. Start: `$ firebase init` and select only Firebase Functions and Firestore
6. You will also need to create enviromental variables with: `$ firebase functions:config:set auth.username="USERNAME" auth.password="PASSWORD"`.
7. Push your Firebase functions to cloud with: `$ firebase deploy --only functions`
8. Use `$ cd .\client\` and run `$ firebase init`, this time selecting Firebase Firestore and Authentication
9. In directory `.\client\src\` create a new file named `config.tsx` and copy the data gotten when registering the web app.

```javascript
const config = {
  firebase: {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
  },
};

export default config;
```

10. In `.\client` create a file `.env` with the following contents, which should match the Firebase Functions enviromental variables.

```javascript
REACT_APP_PASSWORD = PASSWORD;
REACT_APP_USERNAME = USERNAME;
```

1. Download the required node data with `$ npm install` in:

- `.\client`
- `.\server\functions`

2. Start the React project with `$ npm start` in directory `.\client`.

## Authors

Tjaša Gumilar, Miha Plemenitaš, Vito Zupanič
