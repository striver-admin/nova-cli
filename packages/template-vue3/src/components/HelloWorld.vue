<script setup lang="ts">
defineProps<{
  msg: string
}>()
</script>

<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <p>
      Edit <code>src/components/HelloWorld.vue</code> to test hot module replacement.
    </p>
  </div>
</template>

<style scoped>
.hello {
  padding: 20px;
}
h1 {
  color: #42b983;
}
code {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
}
</style>
