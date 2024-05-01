<template>
  <v-data-table style="margin: 20px auto 0; width: 90%; border-radius: 10px"
                :items="contas"
                :headers="headers"
                fixed-header
                hover
                loading-text="Carregando contas..."
                no-data-text="Ainda não há contas"
                items-per-page-text="Contas por página"
                page-text="Página {0} de {1}"
                :items-per-page-options="[5, 10, 20, 50, 100]"
  >
    <template v-slot:top>
      <v-toolbar style="border-top-left-radius: 10px; border-top-right-radius: 10px">
        <v-btn color="red" text="Nova Conta" prepend-icon="mdi-bank-plus" @click="addConta"/>
      </v-toolbar>
    </template>
  </v-data-table>
</template>

<script>
export default {
  name: "HomeBodyComponent",
  inject: ['repository'],
  data: () => ({
    contas: [],
    headers: [
      {
        text: 'Data',
        key: 'fullDate',
        sortable: false
      },
      {
        text: 'Valor',
        key: 'price',
        sortable: false
      },
      {
        text: 'Descrição',
        key: 'description',
        sortable: false
      },
      {
        text: '',
        key: 'actions',
        sortable: false
      }
    ]
  }),
  methods: {
    addConta(){
      this.$emit('addConta');
    }
  },
  emits: ['addConta'],
}
</script>

<style scoped lang="sass">

</style>
