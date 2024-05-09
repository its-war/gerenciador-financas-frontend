<template>
  <v-footer height="40" app>
    <a
      v-for="item in items"
      :key="item.title"
      :href="item.href"
      :title="item.title"
      class="d-inline-block mx-2 social-link"
      rel="noopener noreferrer"
      target="_blank"
    >
      <v-icon
        :icon="item.icon"
        :size="24"
      />
    </a>

    <div
      class="text-caption text-disabled"
      style="position: absolute; right: 16px;"
    >
      &copy; {{ ano }}
      — Karlos Warney
    </div>
  </v-footer>
</template>

<script setup>
import { computed } from "vue";

const ano = computed(() => {
  const anoInicial = 2024;
  const anoAtual = (new Date()).getFullYear();
  if(anoAtual > anoInicial) {
    return `${anoInicial}-${anoAtual}`;
  }
  return anoInicial;
});

const items = [
    {
      title: 'Karlos Warney GitHub',
      icon: `mdi-github`,
      href: 'https://github.com/its-war'
    }
  ]
</script>

<style scoped lang="sass">
  .social-link :deep(.v-icon)
    color: rgba(var(--v-theme-on-background), var(--v-disabled-opacity))
    text-decoration: none
    transition: .2s ease-in-out

    &:hover
      color: rgba(25, 118, 210, 1)
</style>
