// Plugins
import vuetify from './vuetify';
import router from '@/router';
import {firebaseApp, install as Firebase} from '@/plugins/firebase';
import {VueFire, VueFireFirestoreOptionsAPI, VueFireAuth } from "vuefire";

export function registerPlugins (app) {
  app
    .use(vuetify)
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
