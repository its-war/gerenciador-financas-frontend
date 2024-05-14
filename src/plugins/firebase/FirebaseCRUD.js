import {firebaseApp} from "@/plugins/firebase/index";
import {useCollection} from "vuefire";
import {getFirestore, collection, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc, query, where, orderBy}
  from "firebase/firestore";

export default class FirebaseCRUD {
  constructor(name) {
    this.tableName = name;
    this.database = getFirestore(firebaseApp);
    this.tableCollection = collection(this.database, this.tableName);
    this.user = null;
  }

  async getAll() {
    try {
      const snapshot = await getDocs(this.tableCollection);
      const data = [];
      snapshot.forEach((doc) => {
        data.push({id: doc.id, ...doc.data()});
      });
      return data;
    } catch (e) {
      console.error(e);
    }
  }

  async getAllInRealTime() {
    try{
      if(this.isUserDefined()){
        const q = query(
          this.tableCollection, where("uid", "==", this.user.uid),
          orderBy('fullDate', 'desc')
        );
        return await useCollection(q);
      }else return [];
    } catch (e) {
      console.error(e);
    }
  }

  async get(document){
    try{
      const documentRef = doc(this.tableCollection, document.id);
      const docSnap = await getDoc(documentRef);
      if(docSnap.exists()){
        return {id: docSnap.id, ...docSnap.data()};
      }else{
        return null;
      }
    } catch (e) {
      console.error(e);
    }
  }

  async save(documentObject, id = null){
    try{
      documentObject = {uid: this.user.uid, ...documentObject};
      const documentRef = id ? doc(this.tableCollection, id) : doc(this.tableCollection);
      await setDoc(documentRef, documentObject);
    } catch (e) {
      console.error(e);
    }
  }

  async edit(documentObject){
    return new Promise((resolve, reject) => {
      try{
        const documentRef = doc(this.tableCollection, documentObject.id);
        updateDoc(documentRef, documentObject).then(() => {
          resolve(true);
        });
      } catch (e) {
        console.error(e);
        reject(false);
      }
    });
  }

  async delete(documentObject){
    try{
      const documentRef = doc(this.tableCollection, documentObject.id);
      await deleteDoc(documentRef);
    } catch (e) {
      console.error(e);
    }
  }

  setUser(user){
    this.user = user;
  }

  getUser(){
    return this.user;
  }

  isUserDefined(){
    return this.user !== null;
  }
}
