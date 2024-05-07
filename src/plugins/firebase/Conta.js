import FirebaseCRUD from "@/plugins/firebase/FirebaseCRUD";

export default class Conta extends FirebaseCRUD {
  constructor() {
    super('contas');
  }

  /**
   * @param documentObject
   * @returns {Promise<boolean>}
   */
  async addParcelaPaga(documentObject){
    documentObject = {uid: super.getUser().uid, ...documentObject};
    documentObject.parcelasPaga = documentObject.parcelasPaga + 1;
    if(documentObject.parcelasPaga >= documentObject.parcelas) documentObject.quitada = true;
    return await super.edit(documentObject);
  }

  /**
   * @param documentObject
   * @returns {Promise<boolean>}
   */
  async removeParcelaPaga(documentObject){
    documentObject = {uid: super.getUser().uid, ...documentObject};
    documentObject.parcelasPaga = documentObject.parcelasPaga - 1;
    documentObject.quitada = false;
    return await super.edit(documentObject);
  }
}
