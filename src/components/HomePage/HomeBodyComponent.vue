<template>
  <v-data-table v-if="$props.isLogged"
    style="margin: 20px auto 0; width: 90%; border-radius: 10px"
                :items="contas"
                :headers="headers"
                fixed-header
                hover
                loading-text="Carregando contas..."
                no-data-text="Ainda não há contas"
                items-per-page-text="Contas por página"
                page-text="Exibindo {0} à {1}, de {2} contas"
                :items-per-page-options="[5, 10, 20, 50, 100]"
  >
    <template v-slot:top>
      <v-toolbar style="border-top-left-radius: 10px; border-top-right-radius: 10px">
        <v-btn color="red" text="Nova Conta" prepend-icon="mdi-bank-plus" @click="addConta"/>
        <v-spacer/>
        <v-btn color="primary" text="Recarregar" append-icon="mdi-refresh" @click="recarregar"/>
      </v-toolbar>
    </template>

    <template v-slot:item.fullDate="{ item }">
      {{getDateFormatted(item.fullDate)}}
    </template>

    <template v-slot:item.price="{ item }">
      {{Number(item.price).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}}
    </template>

    <template v-slot:item.description="{ item }">
      {{limitarTexto(item.description)}}
    </template>

    <template v-slot:item.actions="{ item }">
      <v-btn @click="abrirDetalhes(item)" text="Detalhes" color="success" size="small"/>
      <v-btn @click="abrirDialogApagar(item)" variant="text" icon="mdi-delete" color="error" size="small"/>
    </template>
  </v-data-table>

  <v-dialog v-model="dialogDetalhes">
    <v-card>
      <v-card-title>
        Detalhes da conta
        <v-btn icon="mdi-close" variant="text" @click="dialogDetalhes = false"
               style="position: absolute; right: 0; top: 0"/>
      </v-card-title>
      <v-card-text>
        <v-table>
          <tbody>
            <tr>
              <td>Data</td>
              <td>{{getDateFormatted(objDetalhes.fullDate)}}</td>
            </tr>
            <tr>
              <td>Valor</td>
              <td>
                {{Number(objDetalhes.price).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}}
              </td>
            </tr>
            <tr>
              <td>Descrição</td>
              <td>{{objDetalhes.description}}</td>
            </tr>
            <tr v-if="!objDetalhes.aVista">
              <td>Parcelado</td>
              <td>{{objDetalhes.isParcelado ? `Sim, em ${objDetalhes.parcelas} vezes` : 'Não'}}</td>
            </tr>
            <tr v-if="!objDetalhes.isParcelado">
              <td>A vista</td>
              <td>{{objDetalhes.aVista ? 'Sim' : 'Não'}}</td>
            </tr>
            <tr>
              <td>Quitada</td>
              <td>{{objDetalhes.quitada ? 'Sim' : 'Não'}}</td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
  </v-dialog>

  <v-dialog v-model="dialogApagar">
    <v-card>
      <v-card-title>
        <v-icon icon="mdi-alert" color="yellow"/> Deseja apagar<br/> a conta a seguir?
        <v-btn icon="mdi-close" variant="text" @click="dialogApagar = false"
               style="position: absolute; right: 0; top: 0"/>
      </v-card-title>
      <v-card-text>
        <v-table>
          <tbody>
          <tr>
            <td>Data</td>
            <td>{{getDateFormatted(objDetalhes.fullDate)}}</td>
          </tr>
          <tr>
            <td>Valor</td>
            <td>
              {{Number(objDetalhes.price).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}}
            </td>
          </tr>
          <tr>
            <td>Descrição</td>
            <td>{{objDetalhes.description}}</td>
          </tr>
          <tr v-if="!objDetalhes.aVista">
            <td>Parcelado</td>
            <td>{{objDetalhes.isParcelado ? `Sim, em ${objDetalhes.parcelas} vezes` : 'Não'}}</td>
          </tr>
          <tr v-if="!objDetalhes.isParcelado">
            <td>A vista</td>
            <td>{{objDetalhes.aVista ? 'Sim' : 'Não'}}</td>
          </tr>
          <tr>
            <td>Quitada</td>
            <td>{{objDetalhes.quitada ? 'Sim' : 'Não'}}</td>
          </tr>
          </tbody>
        </v-table>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="dialogApagar = false">Cancelar</v-btn>
        <v-btn color="error" @click="apagar">Apagar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "HomeBodyComponent",
  inject: ['repository'],
  data: () => ({
    contas: [],
    headers: [
      {
        title: 'Data',
        key: 'fullDate',
        sortable: false
      },
      {
        title: 'Valor',
        key: 'price',
        sortable: false
      },
      {
        title: 'Descrição',
        key: 'description',
        sortable: false
      },
      {
        title: '',
        key: 'actions',
        sortable: false
      }
    ],
    dialogDetalhes: false,
    objDetalhes: {},
    dialogApagar: false
  }),
  methods: {
    addConta(){
      this.$emit('addConta');
    },
    getDateFormatted(date){
      return date.split('-').reverse().join('/');
    },
    limitarTexto(texto){
      let t = texto.split(' ');
      if(t.length > 5) return t.slice(0, 5).join(' ').trim() + '...';
      else return texto;
    },
    abrirDetalhes(obj){
      this.objDetalhes = {...obj};
      this.dialogDetalhes = true;
    },
    async recarregar(){
      this.contas = await this.repository.conta.getAllInRealTime();
    },
    async apagar(){
      await this.repository.conta.delete(this.objDetalhes);
      this.dialogApagar = false;
    },
    abrirDialogApagar(conta){
      this.dialogApagar = true;
      this.objDetalhes = {id: conta.id, ...conta}
    }
  },
  emits: ['addConta'],
  async created() {
    this.contas = await this.repository.conta.getAllInRealTime();
  },
  props: {
    isLogged: {
      type: Boolean,
      required: true
    }
  },
  watch: {
    async '$props.isLogged'(newValue){
      if(newValue){
        await this.recarregar();
      }
    }
  }
}
</script>

<style scoped lang="sass">

</style>
