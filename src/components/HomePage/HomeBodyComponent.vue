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
      <v-tooltip open-on-click :location="isMobile?'top':'right'">
        <template v-slot:activator="{ props }" v-if="item.formaPagamento === 2">
          <v-icon v-bind="props" icon="mdi-credit-card" color="white"/>
        </template>

        <p>{{(cartoes.filter((cartao) => cartao.id === item.cartao))[0]?.nome}}</p>
      </v-tooltip>
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

  <v-file-input v-if="isLogged"
                style="margin: 20px auto 0; width: 90%; border-radius: 10px"
                label="Selecione a foto..."
                prepend-icon="mdi-image"
                v-model="uploadFoto"
                :show-size="1000"
                accept="image/*"
                counter
                variant="outlined"
                color="info"
  />

  <v-btn v-if="isLogged && uploadFoto" style="margin: 20px auto 0;" color="success" @click="upload" prepend-icon="mdi-upload" text="Enviar"/>

  * Em testes, por favor, não use!


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
              <td :style="objDetalhes.quitada ? 'color: green' : 'color: red'">{{objDetalhes.quitada ? 'Sim' : 'Não'}}</td>
            </tr>
            <tr>
              <td>Descrição</td>
              <td>{{objDetalhes.description}}</td>
            </tr>
            <tr v-if="!objDetalhes.quitada">
              <td>Já pagou essa conta?</td>
              <td>
                <v-btn color="success" @click="setQuitada" :loading="loadingSetQuitada" prepend-icon="mdi-stamper" variant="text">Quitar</v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
        <v-alert
          v-if="showMessagePayment"
          icon="mdi-check-circle"
          title="Conta quitada com sucesso!"
          type="success"
          variant="tonal"
        />
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
        <v-table hover>
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
            <td>{{ totalGasto.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}) }}</td>
          </tr>
          <tr>
            <td>Total quitado</td>
            <td>{{ totalQuitado.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}) }}</td>
          </tr>
          <tr>
            <td>Total pendente</td>
            <td>{{ totalPendente.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}) }}</td>
          </tr>
          </tbody>
        </v-table>
      </v-card-text>
      <v-card-actions>
        <v-tooltip open-on-click>
          <template v-slot:activator="{ props }">
            <span v-bind="props">Ajuda <v-icon icon="mdi-information"/></span>
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
            <b>contabiliza como 'quitada'</b>, exceto no cartão de crédito.
          </p>

          <p style="margin-top: 10px">
            <b style="color: red">IMPORTANTE!</b><br/>
            Contas feitas na forma de pagamento <b>'Dinheiro'</b> e marcadas como
            <b>'Parcelado'</b>, NÃO serão contabilizadas no valor 'a vista'.
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
    loadingSetQuitada: false,
    showMessagePayment: false,
    uploadFoto: null,
    loadingUpload: false
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

          if(this.objDetalhes.quitada){
            this.showMessagePayment = true;
            setTimeout(() => {
              this.showMessagePayment = false;
            }, 3000);
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
    async setQuitada(){
      this.loadingSetQuitada = true;
      this.objDetalhes.quitada = true;
      if(this.objDetalhes.isParcelado){
        this.objDetalhes.parcelasPaga = this.objDetalhes.parcelas;
      }
      await this.repository.conta.edit(this.objDetalhes).then((value) => {
        if(value){
          this.showMessagePayment = true;
          setTimeout(() => {
            this.showMessagePayment = false;
          }, 3000);
        }
      }).finally(() => {
        this.loadingSetQuitada = false;
      });
    },
    async upload(){
      this.loadingUpload = true;
      if(this.uploadFoto.name.endsWith('.jpg') || this.uploadFoto.name.endsWith('.jpeg')){
        const url = await this.repository.storage.upload(this.repository.conta.getUser().uid, this.uploadFoto);
        console.log(url);
      }else{
        this.convertToJpeg(this.uploadFoto).then((value) => {
          const url = this.repository.storage.upload(this.repository.conta.getUser().uid, value);
          console.log(url);
        })
      }
      this.uploadFoto = null;
      this.loadingUpload = false;
    },
    download(){
      this.repository.storage.download(this.repository.conta.getUser().uid);
    },
    convertToJpeg(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            canvas.toBlob((blob) => {
              resolve(blob);
            }, 'image/jpeg', 0.95);
          };
          img.onerror = reject;
          img.src = e.target.result;
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
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
        if(conta.formaPagamento === 3){
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
