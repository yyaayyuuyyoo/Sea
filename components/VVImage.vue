<template>
  <v-image
    v-bind="$attrs"
    :config="{
      ...config,
      image: image,
    }"
    @click="$emit('click', $event)"
    @dragmove="$emit('dragmove', $event)"
    @dragend="$emit('dragend', $event)"
  />
</template>

<script>
export default {
  props: {
    config: {
      type: Object,
      default: () => ({}),
    },
    src: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      image: null,
    }
  },
  computed: {
    //
  },
  mounted() {
    const image = new window.Image()
    image.src = this.src
    image.onload = () => {
      // set image only when it is loaded
      this.image = image
    }
  },
}
</script>

<style lang="postcss" scoped>
/*  */
</style>
