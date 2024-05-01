<template>
  <v-dialog v-model="activeLocal">
    <v-card>
      <v-card-title>
        Adicionar Conta
      </v-card-title>
      <v-card-text>
        <v-text-field
          label="Data da conta"
          variant="outlined"
          prepend-icon="mdi-calendar"
          type="date"
          v-model="dados.date"
        />

        <v-text-field
          label="Valor"
          variant="outlined"
          prepend-icon="mdi-currency-usd"
          type="number"
          step="0.01"
          v-model="dados.price"
        />

        <v-textarea
          label="Descrição"
          variant="outlined"
          prepend-icon="mdi-text"
          v-model="dados.description"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "AddContaDialogComponent",
  data: () => ({
    activeLocal: false,
    dados: {
      date: new Date().toISOString().substring(0, 10),
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
  emits: ['update:active']
}
</script>

<style scoped lang="sass">

</style>
