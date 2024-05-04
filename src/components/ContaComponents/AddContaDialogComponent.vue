<template>
  <v-dialog v-model="activeLocal">
    <v-card>
      <v-card-title>
        Adicionar Conta
        <v-btn icon="mdi-close" variant="text" :loading="loading"
               @click="$emit('update:active')" style="position: absolute; right: 0; top: 0"/>
      </v-card-title>
      <v-card-text>
        <v-text-field
          required
          label="Data da conta"
          variant="outlined"
          prepend-icon="mdi-calendar"
          type="date"
          v-model="dados.date"
        />

        <v-text-field
          required
          label="Valor"
          variant="outlined"
          prepend-icon="mdi-currency-usd"
          type="number"
          step="0.01"
          :rules="[v => v > 0 || 'Valor da conta não pode estar vazio.']"
          v-model="dados.price"
        />

        <v-radio-group color="primary" label="Forma de Pagamento" v-model="dados.formaPagamento" direction="horizontal">
          <v-radio label="Dinheiro" :value="1"/>
          <v-radio label="Cartão" :value="2"/>
          <v-radio label="Pix" :value="3"/>
        </v-radio-group>

        <v-checkbox color="primary" v-if="!dados.aVista" :value="true" v-model="dados.isParcelado"
              :label="dados.isParcelado ? 'Parcelado!' : 'Esta conta foi parcelada?'"
        />

        <v-text-field
          v-show="dados.isParcelado && !dados.aVista"
          :required="dados.isParcelado"
          label="Quantas parcelas?"
          prepend-icon="mdi-number"
          variant="outlined"
          type="number"
          min="2"
          v-model="dados.parcelas"
          :rules="[v => v > 1 || 'Mínimo de 2 parcelas']"
        />

        <v-checkbox color="primary" v-if="!dados.isParcelado" :value="true" v-model="dados.aVista"
              :label="dados.aVista ? 'A vista!' : 'Esta conta foi paga a vista?'"
        />

        <v-textarea
          label="Descrição"
          variant="outlined"
          prepend-icon="mdi-text"
          v-model="dados.description"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer/>
        <v-btn :loading="loading" prepend-icon="mdi-close" @click="$emit('update:active')" color="error">Cancelar</v-btn>
        <v-btn :loading="loading" @click="addConta" append-icon="mdi-plus" color="success">Adicionar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "AddContaDialogComponent",
  inject: ['repository'],
  data: () => ({
    activeLocal: false,
    dados: {
      date: new Date().toISOString().substring(0, 10),
      price: null,
      isParcelado: false,
      parcelas: null,
      description: '',
      aVista: false,
      formaPagamento: 1
    },
    loading: false
  }),
  props: {
    active: {
      type: Boolean,
      required: true
    }
  },
  watch: {
    '$props.active'(newValue){
      this.activeLocal = newValue;
    },
    activeLocal(newValue){
      if(!newValue) this.$emit('update:active');
    }
  },
  emits: ['update:active'],
  methods: {
    async addConta(){
      this.loading = true;
      const conta = {
        fullDate: this.dados.date,
        dia: this.dados.date.split('-')[2],
        mes: this.dados.date.split('-')[1],
        ano: this.dados.date.split('-')[0],
        price: this.dados.price,
        isParcelado: this.dados.isParcelado,
        aVista: this.dados.aVista,
        parcelas: this.dados.parcelas,
        parcelasPaga: 0,
        description: this.dados.description,
        quitada: this.dados.aVista,
        formaPagamento: this.dados.formaPagamento
      }
      await this.repository.conta.save(conta);
      this.dados = {
        date: new Date().toISOString().substring(0, 10),
        price: 0.0,
        isParcelado: false,
        parcelas: null,
        description: '',
        aVista: false,
        formaPagamento: 1
      };
      this.activeLocal = false;
      this.loading = false;
    }
  }
}
</script>

<style scoped lang="sass">

</style>
