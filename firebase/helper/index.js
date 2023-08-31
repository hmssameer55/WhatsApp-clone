// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

export const FirebaseApp = () => {
  const firebaseConfig = {
    apiKey: 'AIzaSyDNeUvTYbauQqv-vdDnr3GgHc463yiJ2U8',
    authDomain: 'whatsapp-edba1.firebaseapp.com',
    projectId: 'whatsapp-edba1',
    storageBucket: 'whatsapp-edba1.appspot.com',
    messagingSenderId: '809139649998',
    appId: '1:809139649998:web:459365f4dc566325fc3f9f',
    measurementId: 'G-W6SGK3W3FE'
  }

  // Initialize Firebase
  return initializeApp(firebaseConfig)
}
