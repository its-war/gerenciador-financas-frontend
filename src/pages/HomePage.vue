<template>
  <header>
    <v-app-bar>
      <v-app-bar-title><v-icon icon="mdi-finance" color="success"/> Finanças Controller</v-app-bar-title>
      <v-spacer/>
      <v-btn to="/login">Login</v-btn>
      <v-btn color="red" prepend-icon="mdi-bank-plus">Adicionar Conta</v-btn>
    </v-app-bar>
  </header>
  <v-main>
    <router-view @addConta="activeAddDialog = true"/>
    <AddContaDialogComponent :active="activeAddDialog" @update:active="activeAddDialog = false"/>
  </v-main>
  <AppFooter/>
</template>

<script>
import AppFooter from "@/components/HomePage/AppFooter.vue";
import AddContaDialogComponent from "@/components/ContaComponents/AddContaDialogComponent.vue";

export default {
  name: "HomePage",
  components: {AddContaDialogComponent, AppFooter},
  data: () => ({
    activeAddDialog: false
  })
}
</script>

<style scoped lang="sass">

</style>
