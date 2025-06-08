<template>
  <form @submit.prevent class="auth-form">
    <slot name="title"></slot> <slot></slot> <slot name="actions"></slot> <slot name="error"></slot> <slot name="footer"></slot> </form>
</template>

<script setup>
</script>

<style scoped>
.auth-form {
  background-color: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  color: #333;
  margin-bottom: 30px;
  font-size: 2em;
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
}

input[type="text"],
input[type="password"] {
  width: calc(100% - 20px);
  padding: 12px 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1em;
  box-sizing: border-box;
}

button[type="submit"] {
  width: 100%;
  padding: 12px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1.1em;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 10px;
}

button[type="submit"]:hover:not(:disabled) {
  background-color: #36a477;
}

button[type="submit"]:disabled {
  background-color: #a0a0a0;
  cursor: not-allowed;
}

.error-message {
  color: #d9534f;
  margin-top: 15px;
  text-align: center;
  font-weight: bold;
}

.link-text {
  margin-top: 20px;
  text-align: center;
  color: #666;
}

.link-text a {
  color: #3498db;
  text-decoration: none;
  font-weight: bold;
}

.link-text a:hover {
  text-decoration: underline;
}
</style>