<template>
  <v-app>
    <v-overlay :model-value="store.getOverlay" class="align-center justify-center">
      <v-progress-circular style="margin: auto" color="red" indeterminate :size="40"></v-progress-circular>
    </v-overlay>
    <router-view/>
  </v-app>
</template>

<script setup>
  import mainStore from "@/store/mainStore";
  const store = mainStore();
</script>
