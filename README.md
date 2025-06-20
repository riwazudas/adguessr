# AdGuessr
AdGuessr is a fun and engaging web-based game where players test their knowledge of famous advertisements and brands. Watch a short clip of an ad, and then choose the correct brand from a set of options! Challenge your friends and climb the global leaderboard!

## Table of Contents
Features
How to Play
Leaderboard
Technology Stack
Setup and Installation (For Developers)
Adding New Videos and Options (Content Management)
Firebase Security Rules
Known Issues / Troubleshooting
Contributing
License

## 1. Features
Interactive Gameplay: Watch short ad clips and guess the brand.
Multiple Choice Questions: Select from a set of diverse options.
Scoring System: Earn points for correct guesses.
Global Leaderboard: Compete with other players worldwide.
Responsive Design: Play seamlessly on various devices and screen sizes.
Firebase Integration: Real-time data storage for videos and leaderboard.
## 2. How to Play
Start the Game: Navigate to the game's homepage and click the "Play Game" button.
Watch the Ad Clip: A short video clip of an advertisement will begin playing.
Make Your Guess: Below the video, you will see a question and a set of multiple-choice options. Select the brand you believe is associated with the ad.
Submit Your Answer: Click the "Submit Answer" button.
Score & Next Round:
If your answer is correct, you'll earn points!
If incorrect, you won't score for that round.
A new ad clip will load automatically for the next round.
Game Over: The game continues for a set number of rounds or a time limit (depending on implementation). Once the game ends, your final score will be displayed.
Submit to Leaderboard: You'll be prompted to enter your name to submit your score to the leaderboard.
Play Again: You can choose to play another round or return to the home screen.
## 3. Leaderboard
The leaderboard showcases the top 10 highest scores achieved by players.

Rank: Your position on the leaderboard.
Name: The name you submitted with your score.
Score: Your final score from the game.
Date: The date your score was submitted.
Scores are ordered primarily by score (highest first) and then by timestamp (earliest first) for tie-breaking. This requires a specific composite index in Firestore for efficient querying.

## 4. Technology Stack
#### Frontend:
React: A JavaScript library for building user interfaces.
Tailwind CSS: A utility-first CSS framework for rapid styling.
SweetAlert2: A beautiful, responsive, customizable, accessible replacement for JavaScript's popup boxes (used for game over/score submission).
React Router DOM: For declarative routing in the application.
#### Backend/Database:
Firebase Firestore: A NoSQL cloud database for storing game data (videos, leaderboard scores).
Firebase Authentication: (Optional, if implemented for admin access) For managing user accounts.
5. Setup and Installation (For Developers)
To get AdGuessr up and running on your local machine:

### Prerequisites:

Node.js (LTS version recommended)
npm or yarn
Steps:

1. Clone the repository:
```bash

git clone <your-repository-url>
cd AdGuessr
```
2. Install dependencies:
```bash
npm install
# or
yarn install
```
3. Set up Firebase:
- Go to the Firebase Console.
- Create a new Firebase project.
- In your project, create a Firestore Database (start in production mode, then adjust rules).
- Add a web app to your Firebase project and copy your Firebase configuration.
- Create a file named .env in the root of your project (same level as package.json).
- Add your Firebase configuration to .env like this:

```Code snippet

VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
VITE_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID
```
(Note: VITE_ prefix is essential for Vite to expose environment variables to the client-side code).

- Create src/firebase-config.js and initialize Firebase:
```JavaScript

// src/firebase-config.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
```

4. Update Firebase Security Rules:
- Go to Firestore Database -> Rules tab in the Firebase Console.
- Implement the rules detailed in the Firebase Security Rules section to allow your app to read/write data.

5. Create Firestore Indexes:
- For the leaderboard to function correctly, you must create a composite index in Firestore. When you run the app and try to view the leaderboard for the first time, your browser's console will provide a direct link to create this index. Click that link and confirm the creation.
- The index will typically be on the leaderboard collection with fields score (Descending) and timestamp (Ascending).

6. Add Initial Video Data:
Before playing, you'll need to add some video data to your Firestore videos collection. See the Adding New Videos and Options section.

7. Run the development server:
```Bash

npm run dev
# or
yarn dev
```
The application will open in your browser, usually at http://localhost:5173.

## 6. Adding New Videos and Options (Content Management)
AdGuessr currently fetches video data from a Firestore collection named videos. Each document in this collection represents an ad clip.

Each video document should have the following fields:

- youtubeId (string): The unique ID of the YouTube video. (e.g., for https://www.youtube.com/watch?v=dQw4w9WgXcQ, the youtubeId is dQw4w9WgXcQ).
- answer (string): The correct brand/answer for this ad.
- options (array of strings): An array containing 5 strings (your 4 incorrect options + 1 correct answer). The correct answer must be present in this array.
- startTime (number): The time in seconds at which the video clip should start playing.
There are two primary ways to add new video content:

a) Manually via Firebase Console (Recommended for Small Scale)
This is the easiest way to add or modify individual video entries:

- Go to your Firebase Console.
- Navigate to Firestore Database -> Data tab.
- Click on the videos collection (or create it if it doesn't exist).
- Click "+ Add document".
- Enter the youtubeId, answer, options (as an array, adding each option as a separate item), and startTime as fields.
- Click "Save".
b) Programmatically via a Dedicated Form (For Larger Scale / Admin Use)
You can use the provided AddVideoForm.jsx component (or similar custom script) to programmatically add videos
Run your app and navigate to /add-video to use the form.

## 7. Firebase Security Rules
Firebase Security Rules control access to your Firestore database. It's critical to configure these correctly for your application's functionality and security.

Go to Firebase Console -> Firestore Database -> Rules tab.


## 8. Known Issues / Troubleshooting
- "Failed to load leaderboard: The query requires an index.":
Solution: This is expected. Firebase provides a direct link in your browser's console (F12 -> Console tab) to create the necessary composite index (on leaderboard collection, score DESC, timestamp ASC). Click the link and create the index. It may take a few minutes to build.
- "Error submitting score: FirebaseError: Missing or insufficient permissions.":
Solution: Check your Firebase Security Rules for the leaderboard collection. Ensure allow create: if true; (or if request.auth != null; if using authentication) is set.
- "Error adding video: FirebaseError: Missing or insufficient permissions.":
Solution: Check your Firebase Security Rules for the videos collection. Ensure allow create: if true; (or a more secure authenticated rule) is set.
- UI/Layout Issues (Leaderboard/Popups):
Solution: Ensure you have the src/custom-sweetalert.css file created and imported correctly (last in src/index.css or App.css). Clear your browser cache and perform a hard refresh (Ctrl+F5 or Cmd+Shift+R).

## 9. Contributing
Contributions are welcome! If you have suggestions for improvements or find bugs, please open an issue or submit a pull request.
