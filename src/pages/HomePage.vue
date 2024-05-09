<template>
  <header>
    <v-app-bar>
      <v-toolbar-title style="user-select: none">
        <div class="d-flex" style="align-items: center">
          <img :src="getLogo" alt="Logo" style="width: 55px; pointer-events: none"/>
          <span style="cursor: pointer">War Finanças</span>
        </div>
      </v-toolbar-title>

      <v-btn v-if="!isLogged" @click="dialogLogin = true">Login</v-btn>

      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn v-if="isLogged" icon="mdi-dots-vertical" v-bind="props" color="rgb(100,100,200)" variant="flat"/>
        </template>

        <v-list bg-color="rgb(100,100,200)" base-color="white">
          <v-list-item @click="addCreditCardDialog = true">
            <v-list-item-title>Adicionar Cartão de Crédito</v-list-item-title>
          </v-list-item>
          <v-list-item @click="logout">
            <v-list-item-title>Sair da Conta</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
  </header>
  <v-main>
    <HomeBodyComponent @addConta="activeAddDialog = true" :is-logged="isLogged" :cartoes="cartoes"/>
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
    <AddContaDialogComponent :cartoes="cartoes" :active="activeAddDialog" @update:active="activeAddDialog = false"/>
    <v-dialog v-model="addCreditCardDialog">
      <v-card>
        <v-card-title>
          Adicionar Cartão
          <v-btn icon="mdi-close" variant="text" style="position: absolute; right: 0; top: 0" @click="addCreditCardDialog = false"/>
        </v-card-title>
        <v-card-text>
          <v-text-field
            label="Nome"
            variant="outlined"
            prepend-icon="mdi-account-credit-card"
            v-model="cartao.nome"
          />

          <v-text-field
            label="Fechamento da fatura do cartão"
            variant="outlined"
            prepend-icon="mdi-calendar"
            v-model="cartao.fechamento"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn :loading="cartaoLoading" color="red" @click="addCreditCardDialog = false" prepend-icon="mdi-close" >Cancelar</v-btn>
          <v-btn :loading="cartaoLoading" color="success" @click="addCartao" append-icon="mdi-content-save">Adicionar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-main>
  <AppFooter/>
</template>

<script>
import AppFooter from "@/components/HomePage/AppFooter.vue";
import AddContaDialogComponent from "@/components/ContaComponents/AddContaDialogComponent.vue";
import HomeBodyComponent from "@/components/HomePage/HomeBodyComponent.vue";
import logo from "../assets/financas-icon.png";

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
    loginLoading: false,
    cartoes: [],
    addCreditCardDialog: false,
    cartao: {
      nome: '',
      fechamento: null
    },
    cartaoLoading: false
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
        this.repository.cartao.setUser(loggedUser);
        this.cartoes = await this.repository.cartao.getAllInRealTime();
      }
      this.loginLoading = false;
    },
    async logout(){
      this.isLogged = false;
      await this.repository.userAuth.signOut();
      this.repository.conta.setUser(null);
      this.repository.cartao.setUser(null);
      localStorage.removeItem('loggedUser');
    },
    nextFocus(){
      this.$refs.txtSenha.focus();
    },
    async addCartao(){
      this.cartaoLoading = true;
      await this.repository.cartao.save(this.cartao);
      this.addCreditCardDialog = false;
      this.cartao = {
        nome: '',
        fechamento: null
      }
      this.cartaoLoading = false;
    }
  },
  async created() {
    const loggedUser = localStorage.getItem('loggedUser');
    if(loggedUser !== null){
      this.isLogged = true;
      this.repository.conta.setUser(JSON.parse(loggedUser));
      this.repository.cartao.setUser(JSON.parse(loggedUser));
      this.cartoes = await this.repository.cartao.getAllInRealTime();
    }
  },
  computed: {
    getLogo(){
      if(logo){
        return logo;
      }else{
        return new File([''], '', {type: 'image/png'});
      }
    }
  }
}
</script>

<style scoped lang="sass">

</style>
