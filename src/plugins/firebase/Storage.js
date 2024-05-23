import {firebaseApp} from '@/plugins/firebase/index';
import {getStorage, ref, uploadBytesResumable, getDownloadURL} from 'firebase/storage';

const storage = getStorage(firebaseApp);

export default class Storage {
  /**
   * @description Envia uma imagem para o firebase usando o id do usuário para identificar
   * @param idUser {string | number}
   * @param file {File}
   * @returns {Promise<string>} URL da imagem
   */
  static upload(idUser, file) {
    try{
      return new Promise((resolve, reject) => {
        const storageRef = ref(storage, `img/${idUser}/foto-perfil-${idUser}.jpg`);

        console.log(storageRef);

        const upload = uploadBytesResumable(storageRef, file);

        upload.on('state_changed', snapshot => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          console.log(`Upload is ${progress}% done`);
        }, error => {
          console.error(error);
          reject(error);
        }, () => {
          getDownloadURL(upload.snapshot.ref).then(url => {
            resolve(url);
          });
        });

      });

    } catch (e) {
      console.error(e);
    }
  }

  static async download(idUser) {
    return new Promise((resolve, reject) => {
      try{
        const storageRef = ref(storage, `img/${idUser}/foto-perfil-${idUser}.jpg`);
        getDownloadURL(storageRef).then(url => {
          resolve(url);
        });
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });
  }
}
