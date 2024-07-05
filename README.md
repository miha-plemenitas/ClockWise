# ClockWise

![ClockWise Banner](clockwise_banner.png)

ClockWise is a smart scheduling application designed to help users efficiently manage their time with advanced planning tools and intuitive interfaces. Our platform categorizes users into four distinct roles: Student, Tutor, Referat, and Admin, each with tailored functionalities to enhance their scheduling experience.

Currenty available [here](https://clockwise.si/). 

## Features

- **Student Role**:

  - View specific timetables for their faculty, customized according to program year and branch.
  - Filter timetables based on course, tutor, room, and group.
  - Create custom events and access detailed lecture information.
  - Save timetables to a personalized dashboard.

- **Tutor Role**:

  - Includes all student functionalities.
  - Dedicated timetable for their sessions.
  - Find available rooms and add new lectures for tests and other purposes.

- **Referat Role**:

  - Includes all tutor functionalities.
  - Create time slots for holidays and other non-educational periods.
  - Generate and visualize heatmaps based on lecture counts and frequency.
  - Create and display new timetables.

- **Admin Role**:
  - Focus on administrative tasks including authenticating and managing the Referat and Tutor roles.
  - Ensure smooth operation and security of the platform.

## Benefits

ClockWise simplifies timetable management and enhances the overall efficiency of scheduling tasks for both students and teachers. Students can easily navigate and customize their academic schedules, ensuring they stay organized and up-to-date with their coursework. Tutors and Referat users can manage their teaching responsibilities more effectively, optimize room usage, and adapt quickly to schedule changes. Admins ensure a secure and well-regulated environment for all users. With ClockWise, the academic community can experience a more streamlined, user-friendly approach to time management.

## Technology Stack

- **Frontend**: React.js, Material-UI, Tailwind CSS
- **Backend**: Node.js, Firebase Functions
- **Database**: Firestore
- **Authentication**: Firebase Authentication
- **Programming Languages**: JavaScript, TypeScript
- **Data Visualization**: Plotly
- **Code Quality**: SonarCloud
- **Version Control**: GitHub

## SonarCloud Code Review

ClockWise integrates with SonarCloud to ensure code quality and maintainability. SonarCloud provides continuous inspection of our codebase, highlighting issues in code quality, security vulnerabilities, and potential bugs. This integration helps us maintain high standards of code health and reliability throughout the development process.

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

## Contribution

We welcome contributions to ClockWise. If you are interested in contributing, please follow these steps:

1. Fork the repository: [ClockWise GitHub Repository](https://github.com/miha-plemenitas/ClockWise).
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Commit your changes (`git commit -am 'Add some feature'`).
4. Push to the branch (`git push origin feature/your-feature-name`).
5. Create a new Pull Request.

## Authors

For any questions or inquiries, please contact us at:

- Tjaša Gumilar
- Miha Plemenitaš
- Vito Zupanič

Thank you for using ClockWise!
