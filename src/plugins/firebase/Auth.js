import {firebaseApp} from "@/plugins/firebase/index";
import {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword} from "firebase/auth";

export default class Auth {
  constructor() {
    this.auth = getAuth(firebaseApp);
  }

  async createUser(email, password) {
    try{
      const result = await createUserWithEmailAndPassword(this.auth, email, password);
      return result.user;
    } catch (e) {
      console.error(e);
    }
  }

  async signIn(email, password) {
    try{
      const result = await signInWithEmailAndPassword(this.auth, email, password);
      return result.user;
    } catch (e) {
      console.error(e);
    }
  }
}
