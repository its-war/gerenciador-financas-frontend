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
      <v-btn style="margin-left: 15px" text="Relatório" variant="tonal" prepend-icon="mdi-poll" color="primary" @click="relatorioDialog = true"/>
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

  <v-dialog v-model="relatorioDialog">
    <v-card>
      <v-card-title>
        Relatório
        <v-btn icon="mdi-close" variant="text" style="position: absolute; right: 0; top: 0" @click="relatorioDialog = false"/>
      </v-card-title>
      <v-card-text>
        <v-table>
          <tbody>
          <tr>
            <td>Gastos em Dinheiro</td>
            <td>{{totalGastoDinheiro.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}}</td>
          </tr>
          <tr>
            <td>Gastos no Pix</td>
            <td>{{ totalGastoPix.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}) }}</td>
          </tr>
          <tr>
            <td rowspan="2">Gastos no Cartão de Crédito</td>
            <td style="padding-top: 10px">
              <v-select
                :items="cartoes"
                item-title="nome"
                item-value="id"
                :prepend-inner-icon="isMobile ? 'mdi-credit-card-outline' : ''"
                :label="isMobile ? '' : 'Selecione o Cartão'"
                variant="plain"
                v-model="relatorioCartaoSelected"
                no-data-text="Nenhum cartão cadastrado"
                return-object
                single-line>
                <template v-slot:details v-if="isMobile">
                  {{this.relatorioCartaoSelected?.nome}}
                </template>
              </v-select>
            </td>
          </tr>
          <tr>
            <td>
              <span v-if="relatorioCartaoSelected">{{ totalGastoCartao.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}) }}</span>
            </td>
          </tr>
          <tr>
            <td>Total gasto</td>
            <td>{{ totalGasto.toLocaleString('pr-BR', {style: 'currency', currency: 'BRL'}) }}</td>
          </tr>
          <tr>
            <td>Total quitado</td>
            <td>{{ totalQuitado.toLocaleString('pr-BR', {style: 'currency', currency: 'BRL'}) }}</td>
          </tr>
          <tr>
            <td>Total pendente</td>
            <td>{{ totalPendente.toLocaleString('pr-BR', {style: 'currency', currency: 'BRL'}) }}</td>
          </tr>
          </tbody>
        </v-table>
      </v-card-text>
      <v-card-actions>
        <v-tooltip v-model="showMobileTooltipTotalGasto">
          <template v-slot:activator="{ props }">
            Ajuda <v-icon v-bind="props" icon="mdi-information" @click="activeTooltipMobile"/>
          </template>

          <p>
            - Conforme você for <b>pagando as parcelas</b><br/>
            o sistema <b>atualiza automaticamente</b> os valores;
          </p>

          <p>
            - <b>Selecione o Cartão de Crédito</b> para mostrar o valor <b>total gasto no cartão</b>;
          </p>

          <p>
            - Quando você marca a <b>forma de pagamento</b><br/>
            como 'a vista', o sistema já<br/>
            <b>contabiliza como 'quitada'</b>, seja no cartão ou não.
          </p>
        </v-tooltip>
        <v-spacer/>
        <v-btn prepend-icon="mdi-close" @click="relatorioDialog = false" color="info">Fechar</v-btn>
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
    objDetalhesId: null,
    dialogApagar: false,
    loadingParcelasPaga: false,
    loadingDelete: false,
    relatorioDialog: false,
    relatorioCartaoSelected: null,
    showMobileTooltipTotalGasto: false
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
    },
    activeTooltipMobile(){
      if(this.isMobile){
        this.showMobileTooltipTotalGasto = !this.showMobileTooltipTotalGasto;
      }
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
    },
    cartoes: {
      type: Array,
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
    },
    isMobile(){
      return this.$vuetify.display.mobile;
    },
    totalGastoDinheiro(){
      let total = 0;
      this.contas.forEach(conta => {
        if(conta.formaPagamento === 1){
          total += Number(conta.price);
        }
      });
      return total;
    },
    totalGastoCartao(){
      let total = 0;
      let contasCartao = this.contas.filter(conta => conta.formaPagamento === 2);
      contasCartao.forEach(conta => {
        if(this.relatorioCartaoSelected && conta.cartao === this.relatorioCartaoSelected?.id){
          total += Number(conta.price);
        }
      });
      if(this.relatorioCartaoSelected){
        return total;
      }
      return false;
    },
    totalGastoPix(){
      let total = 0;
      this.contas.forEach(conta => {
        if(this.relatorioCartaoSelected && conta.cartao === this.relatorioCartaoSelected?.id){
          total += Number(conta.price);
        }
      });
      return total;
    },
    totalGasto(){
      let total = 0;
      this.contas.forEach(conta => {
        total += Number(conta.price);
      });
      return total;
    },
    totalQuitado(){
      let total = 0;
      this.contas.forEach(conta => {
        if(conta.quitada){
          total += Number(conta.price);
        }
      });
      return total;
    },
    totalPendente(){
      let total = 0;
      this.contas.forEach(conta => {
        if(!conta.quitada){
          if(conta.isParcelado){
            total += (Number(conta.price) / conta.parcelas) * (conta.parcelas - conta.parcelasPaga);
          }else{
            total += Number(conta.price);
          }
        }
      });
      return total;
    }
  }
}
</script>

<style scoped lang="sass">

</style>
