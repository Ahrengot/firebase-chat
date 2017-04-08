import firebase from 'firebase'
import keys from './firebase-keys'

firebase.initializeApp(keys);

export default firebase;

export const database = firebase.database();
export const auth = firebase.auth();
export const fbAuthProvider = new firebase.auth.FacebookAuthProvider();
