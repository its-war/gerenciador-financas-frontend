import {firebaseApp} from "@/plugins/firebase/index";
import {useCollection} from "vuefire";
import {getFirestore, collection, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc} from "firebase/firestore";

export default class FirebaseCRUD {
  constructor(name) {
    this.tableName = name;
    this.database = getFirestore(firebaseApp);
    this.tableCollection = collection(this.database, this.tableName);
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
      return await useCollection(this.tableCollection);
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
      const documentRef = id ? doc(this.tableCollection, id) : doc(this.tableCollection);
      await setDoc(documentRef, documentObject);
    } catch (e) {
      console.error(e);
    }
  }

  async edit(documentObject){
    try{
      const documentRef = doc(this.tableCollection, documentObject.id);
      await updateDoc(documentRef, documentObject);
    } catch (e) {
      console.error(e);
    }
  }

  async delete(documentObject){
    try{
      const documentRef = doc(this.tableCollection, documentObject.id);
      await deleteDoc(documentRef);
    } catch (e) {
      console.error(e);
    }
  }
}
