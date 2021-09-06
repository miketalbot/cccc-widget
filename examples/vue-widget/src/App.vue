<template>
<div class="message">
  <label for="message">Message</label>
  <input class="expand" v-model="message" name="message"/>
  </div>
</template>

<script>

export default {
  name: 'App'
}
</script>

<style>
.expand {
  flex: 1;
  margin-left: 8px;
  }
.message {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: flex;
  width: 100%;
  color: #2c3e50;
  padding: 16px;
}
</style>
