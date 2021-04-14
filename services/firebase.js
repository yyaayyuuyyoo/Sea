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
  apiKey: 'AIzaSyBaQOlmwIGfeLYZ_soeOMjfQH39NcduekU',
  authDomain: 'online-sea.firebaseapp.com',
  projectId: 'online-sea',
  storageBucket: 'online-sea.appspot.com',
  messagingSenderId: '421897507364',
  appId: '1:421897507364:web:29c174c5d16fdd0dc9beb1',
  measurementId: 'G-3RK8CRLVBG',
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
