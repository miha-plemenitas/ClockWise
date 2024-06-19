# Pameten-Urnik

Pameten-Urnik is a smart scheduling application designed to help users efficiently manage their time with advanced planning tools and intuitive interfaces.

### Local project
You require [Node.js](https://nodejs.org/en/download).

1. Download or clone the project in the wanted directory and start a terminal session
2. Go to directory `.\server`
3. Download Firebase: ```$ npm install -g firebase-tools```
4. Log into Firebase: ```$ firebase login```
5. Start: ```$ firebase init``` and select only Firebase Functions and Firestore
6. You will also need to create enviromental variables with: `$ firebase functions:config:set auth.username="USERNAME" auth.password="PASSWORD"`.
7. Push your Firebase functions to cloud with: ```$ firebase deploy --only functions```
8. Use ```$ cd .\client\``` and run ```$ firebase init```, this time selecting Firebase Firestore and Authentication
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
REACT_APP_PASSWORD=PASSWORD
REACT_APP_USERNAME=USERNAME
```
1. Download the required node data with `$ npm install` in:
  - `.\client`
  - `.\server\functions`
2. Start the React project with `$ npm start` in directory `.\client`.


## Authors
Tjaša Gumilar, Miha Plemenitaš, Vito Zupanič
