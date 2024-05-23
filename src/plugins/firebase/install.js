import Conta from "@/plugins/firebase/Conta";
import Auth from "@/plugins/firebase/Auth";
import FirebaseCRUD from "@/plugins/firebase/FirebaseCRUD";
import Storage from "@/plugins/firebase/Storage";

export default function install(app) {
  app.provide('repository', {
    conta: new Conta(),
    userAuth: new Auth(),
    cartao: new FirebaseCRUD('cartoes'),
    storage: Storage
  });
}
