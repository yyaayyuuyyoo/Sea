// import Firebase from 'firebase'

import Firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/firestore'
import 'firebase/auth'
import 'firebase/storage'
import 'firebase/analytics'
import 'firebase/performance'
import 'firebase/functions'

// Initialize Firebase
const config = {
  apiKey: 'AIzaSyA7roaApigOth3IsEm59oZBQuMCVsdjq3U',
  authDomain: 'sea-you-sea-me.firebaseapp.com',
  databaseURL: 'https://sea-you-sea-me-default-rtdb.firebaseio.com',
  projectId: 'sea-you-sea-me',
  storageBucket: 'sea-you-sea-me.appspot.com',
  messagingSenderId: '8301580419',
  appId: '1:8301580419:web:e66b0446a70e1202ee8bb6',
  measurementId: 'G-30SGW0V5GV',
}

export const FirebaseApp = Firebase.initializeApp(config)
export const ga = FirebaseApp.analytics()

export const perf = Firebase.performance()

export const rtdb = FirebaseApp.database()
export const db = FirebaseApp.firestore()

export const storage = FirebaseApp.storage()

export const functions = FirebaseApp.functions()

export const auth = FirebaseApp.auth()

export const FieldValue = Firebase.firestore.FieldValue
export const FieldPath = Firebase.firestore.FieldPath

export const Timestamp = Firebase.firestore.Timestamp

export const ServerTIMESTAMP = Firebase.database.ServerValue.TIMESTAMP
