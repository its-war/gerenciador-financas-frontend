<template>
  <header>
    <v-app-bar>
      <v-app-bar-title style="font-size: 18px"><v-icon icon="mdi-finance" color="success"/>
        <span>Finanças Controller</span>
      </v-app-bar-title>
      <v-btn v-if="!isLogged" @click="dialogLogin = true">Login</v-btn>
      <v-btn v-if="isLogged" @click="logout">Sair da Conta</v-btn>
    </v-app-bar>
  </header>
  <v-main>
    <HomeBodyComponent @addConta="activeAddDialog = true" :is-logged="isLogged"/>
    <v-dialog v-model="dialogLogin">
      <v-card>
        <v-card-title>
          Login
        </v-card-title>
        <v-card-text>
          <v-text-field
            label="Email"
            variant="outlined"
            prepend-icon="mdi-email"
            v-model="userAuth.email"
          />
          <v-text-field
            label="Senha"
            variant="outlined"
            prepend-icon="mdi-lock"
            type="password"
            v-model="userAuth.password"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn color="primary" @click="login">Login</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <AddContaDialogComponent :active="activeAddDialog" @update:active="activeAddDialog = false"/>
  </v-main>
  <AppFooter/>
</template>

<script>
import AppFooter from "@/components/HomePage/AppFooter.vue";
import AddContaDialogComponent from "@/components/ContaComponents/AddContaDialogComponent.vue";
import HomeBodyComponent from "@/components/HomePage/HomeBodyComponent.vue";

export default {
  name: "HomePage",
  inject: ['repository'],
  components: {HomeBodyComponent, AddContaDialogComponent, AppFooter},
  data: () => ({
    activeAddDialog: false,
    dialogLogin: false,
    userAuth: {
      email: '',
      password: ''
    },
    isLogged: false
  }),
  methods: {
    async login(){
      const loggedUser = await this.repository.userAuth.signIn(this.userAuth.email, this.userAuth.password);
      if(loggedUser !== undefined) {
        this.isLogged = true;
        this.repository.conta.setUser(loggedUser);
        this.dialogLogin = false;
        this.userAuth = {
          email: '',
          password: ''
        }
      }
    },
    async logout(){
      this.isLogged = false;
      await this.repository.userAuth.signOut();
      this.repository.conta.setUser(null);
    }
  }
}
</script>

<style scoped lang="sass">

</style>
