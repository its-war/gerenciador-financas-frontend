import {initializeApp} from "firebase/app";
import FirebaseCRUD from "@/plugins/firebase/FirebaseCRUD";
import Auth from "@/plugins/firebase/Auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_PROJECT_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID
};

export const firebaseApp = initializeApp(firebaseConfig);

export function install(app) {
  app.provide('repository', {
    conta: new FirebaseCRUD('contas'),
    userAuth: new Auth()
  });
}
