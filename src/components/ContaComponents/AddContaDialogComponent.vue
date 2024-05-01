<template>
  <v-dialog v-model="activeLocal">
    <v-card>
      <v-card-title>
        Adicionar Conta
        <v-btn icon="mdi-close" variant="text"
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
          v-model="dados.price"
        />

        <v-checkbox v-if="!dados.aVista" :value="true" v-model="dados.isParcelado"
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

        <v-checkbox v-if="!dados.isParcelado" :value="true" v-model="dados.aVista"
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
        <v-btn @click="$emit('update:active')">Cancelar</v-btn>
        <v-btn @click="addConta">Adicionar</v-btn>
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
      price: 0.0,
      isParcelado: false,
      parcelas: null,
      description: '',
      aVista: false
    }
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
      const conta = {
        fullDate: this.dados.date,
        dia: this.dados.date.split('-')[2],
        mes: this.dados.date.split('-')[1],
        ano: this.dados.date.split('-')[0],
        price: this.dados.price,
        isParcelado: this.dados.isParcelado,
        aVista: this.dados.aVista,
        parcelas: this.dados.parcelas,
        description: this.dados.description,
        quitada: this.dados.aVista
      }
      await this.repository.conta.save(conta);
      this.dados = {
        date: new Date().toISOString().substring(0, 10),
        price: 0.0,
        isParcelado: false,
        parcelas: null,
        description: '',
        aVista: false
      };
      this.activeLocal = false;
    }
  }
}
</script>

<style scoped lang="sass">

</style>
