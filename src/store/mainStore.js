import {defineStore} from "pinia";

export default defineStore("main", {
  state: () => ({
    overlay: true
  }),
  getters: {
    getOverlay: (state) => {
      return state.overlay;
    }
  },
  actions: {
    setOverlay(value) {
      this.overlay = value;
    }
  }
});
