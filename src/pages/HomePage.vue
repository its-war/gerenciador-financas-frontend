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
          <v-btn icon="mdi-close" variant="text" style="position: absolute; right: 0; top: 0" @click="dialogLogin = false"/>
        </v-card-title>
        <v-card-text>
          <v-text-field
            label="Email"
            variant="outlined"
            prepend-icon="mdi-email"
            v-model="userAuth.email"
            @keyup.enter="nextFocus"
          />
          <v-text-field
            ref="txtSenha"
            label="Senha"
            variant="outlined"
            prepend-icon="mdi-lock"
            type="password"
            v-model="userAuth.password"
            @keyup.enter="login(true)"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn :loading="loginLoading" color="success" @click="login">Login</v-btn>
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
    isLogged: false,
    loginLoading: false
  }),
  methods: {
    async login(focusOut = false){
      if(focusOut){
        this.$refs.txtSenha.blur();
      }
      this.loginLoading = true;
      const loggedUser = await this.repository.userAuth.signIn(this.userAuth.email, this.userAuth.password);
      if(loggedUser !== undefined) {
        localStorage.setItem('loggedUser', JSON.stringify(loggedUser));
        this.isLogged = true;
        this.repository.conta.setUser(loggedUser);
        this.dialogLogin = false;
        this.userAuth = {
          email: '',
          password: ''
        }
      }
      this.loginLoading = false;
    },
    async logout(){
      this.isLogged = false;
      await this.repository.userAuth.signOut();
      this.repository.conta.setUser(null);
      localStorage.removeItem('loggedUser');
    },
    nextFocus(){
      this.$refs.txtSenha.focus();
    }
  },
  created() {
    const loggedUser = localStorage.getItem('loggedUser');
    if(loggedUser !== null){
      this.isLogged = true;
      this.repository.conta.setUser(JSON.parse(loggedUser));
    }
  }
}
</script>

<style scoped lang="sass">

</style>
