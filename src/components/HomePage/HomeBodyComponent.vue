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
                page-text="Exibindo {0} até {1} — Total: {2} contas"
                :items-per-page-options="[5, 10, 20, 50, 100]"
  >
    <template v-slot:top>
      <v-toolbar style="border-top-left-radius: 10px; border-top-right-radius: 10px">
        <v-btn color="success" text="Nova Conta" prepend-icon="mdi-bank-plus" @click="addConta"/>
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

    <template v-slot:footer.prepend>
      <v-btn style="margin-left: 15px" text="Relatório" variant="tonal" prepend-icon="mdi-poll" color="primary"/>
      <v-spacer/>
    </template>
  </v-data-table>

  <h1 style="text-align: center; margin-top: 25px" v-else>Conteúdo disponível apenas após efetuar login.</h1>

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
            <tr v-if="!objDetalhes.aVista">
              <td>Parcelado</td>
              <td>{{objDetalhes.isParcelado ? `Sim, em ${objDetalhes.parcelas} vezes` : 'Não'}}</td>
            </tr>
            <tr v-if="objDetalhes.isParcelado">
              <td>Parcelas Quitadas</td>
              <td>
                <v-btn :disabled="disableMinusBtn" color="red" @click="removeParcelaPaga" :loading="loadingParcelasPaga" icon="mdi-minus" variant="text"/>
                {{objDetalhes.parcelasPaga}}
                <v-btn :disabled="disablePlusBtn" color="success" @click="addParcelaPaga" :loading="loadingParcelasPaga" icon="mdi-plus" variant="text"/>
              </td>
            </tr>
            <tr v-if="!objDetalhes.isParcelado">
              <td>A vista</td>
              <td>{{objDetalhes.aVista ? 'Sim' : 'Não'}}</td>
            </tr>
            <tr>
              <td>Forma de Pagamento</td>
              <td>{{ getFormaPagamentoText(objDetalhes.formaPagamento) }}</td>
            </tr>
            <tr>
              <td>Quitada</td>
              <td>{{objDetalhes.quitada ? 'Sim' : 'Não'}}</td>
            </tr>
            <tr>
              <td>Descrição</td>
              <td>{{objDetalhes.description}}</td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
      <v-card-actions>
        <v-spacer/>
        <v-btn color="primary" @click="dialogDetalhes = false">Fechar</v-btn>
      </v-card-actions>
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
        <v-btn prepend-icon="mdi-close" :loading="loadingDelete" @click="dialogApagar = false">Cancelar</v-btn>
        <v-btn append-icon="mdi-delete" :loading="loadingDelete" color="error" @click="apagar">Apagar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="dialogRelatorio">
    <v-card>
      <v-card-title>
        <v-icon icon="mdi-file-document-multiple-outline"/> Relatório de contas
        <v-btn icon="mdi-close" variant="text" @click="dialogRelatorio = false" style="position: absolute; right: 0; top: 0"/>
      </v-card-title>
      <v-card-text>
        <v-table>
          <tbody>
          <tr>
            <td>Total de contas</td>
            <td>{{contas.length}}</td>
          </tr>
          <tr>
            <td>Total em dinheiro</td>
            <td>valor em dinheiro</td>
          </tr>
          <tr>
            <td>Total parcelado</td>
            <td>valor em parcelado</td>
          </tr>
          <tr>
            <td>Total a vista</td>
            <td>valor em a vista</td>
          </tr>
          </tbody>
        </v-table>
      </v-card-text>
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
    objDetalhesId: null,
    dialogApagar: false,
    dialogRelatorio: false,
    loadingParcelasPaga: false,
    loadingDelete: false
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
      this.objDetalhes = {id: obj.id, ...obj};
      this.dialogDetalhes = true;
    },
    async recarregar(){
      this.contas = await this.repository.conta.getAllInRealTime();
    },
    async apagar(){
      this.loadingDelete = true;
      await this.repository.conta.delete(this.objDetalhes);
      this.dialogApagar = false;
      this.loadingDelete = false;
    },
    abrirDialogApagar(conta){
      this.dialogApagar = true;
      this.objDetalhes = {id: conta.id, ...conta}
    },
    getFormaPagamentoText(number){
      switch (number) {
        case 1:
          return 'Dinheiro';
        case 2:
          return 'Cartão';
        case 3:
          return 'Pix';
        default:
          return 'Não informado';
      }
    },
    async addParcelaPaga(){
      this.loadingParcelasPaga = true;
      await this.repository.conta.addParcelaPaga(this.objDetalhes).then((value) => {
          if(value){
            this.objDetalhes.parcelasPaga = this.objDetalhes.parcelasPaga + 1;

            this.objDetalhes.quitada = this.objDetalhes.parcelasPaga >= this.objDetalhes.parcelas;
          }
      }).finally(() => {
        this.loadingParcelasPaga = false;
      });
    },
    async removeParcelaPaga(){
      this.loadingParcelasPaga = true;
      await this.repository.conta.removeParcelaPaga(this.objDetalhes).then((value) => {
        if(value){
          this.objDetalhes.parcelasPaga = this.objDetalhes.parcelasPaga - 1;

          this.objDetalhes.quitada = this.objDetalhes.parcelasPaga >= this.objDetalhes.parcelas;
        }
      }).finally(() => {
        this.loadingParcelasPaga = false;
      });
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
  },
  computed: {
    disableMinusBtn(){
      return this.objDetalhes.parcelasPaga <= 0;
    },
    disablePlusBtn(){
      return this.objDetalhes.parcelasPaga >= this.objDetalhes.parcelas;
    }
  }
}
</script>

<style scoped lang="sass">

</style>
