<template>
  <v-image
    :config="{
      image: image,
    }"
  />
</template>

<script>
export default {
  props: {
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
