// Plugins
import vuetify from './vuetify';
import { createPinia } from 'pinia'
import router from '@/router';
import {firebaseApp} from '@/plugins/firebase';
import Firebase from '@/plugins/firebase/install';
import {VueFire, VueFireFirestoreOptionsAPI, VueFireAuth } from "vuefire";

export function registerPlugins (app) {
  app
    .use(vuetify)
    .use(createPinia())
    .use(router)
    .use(VueFire, {
      firebaseApp: firebaseApp,
      modules: [VueFireAuth(), VueFireFirestoreOptionsAPI({
        reset: true,
        wait: false
      })]
    })
    .use(Firebase)
}
