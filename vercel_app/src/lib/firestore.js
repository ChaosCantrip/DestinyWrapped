import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.FIRESTORE_API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
    measurementId: process.env.MEASUREMENT_ID
}

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export async function fetch_document(collection, document) {
    const docRef = doc(db, collection, document);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        return null;
    }
}

export async function set_document(collection, document, data) {
    const docRef = doc(db, collection, document);
    await setDoc(docRef, data);
}