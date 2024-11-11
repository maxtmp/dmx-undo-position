<template>
  <div class="undo">
    <button @click="undo">Undo</button>
  </div>
</template>

<script>
export default {
  inject: {
    dmx:  'dmx',
    http: 'axios',
    Vue:  'Vue'
  },

  computed: {
    buttonLabel () {
      return this.$store.state.undo.buttonLabel
    }
  },

  methods: {
    undo () {
      this.$store.dispatch('undoLastMove')
    }
  }
}
</script>

<style>
.undo {
  margin-left: 2em;
}
</style>
