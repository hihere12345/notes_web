<template>
  <div class="login-container">
    <h2>用户登录</h2>
    <form @submit.prevent="handleLogin" class="login-form">
      <div class="form-group">
        <label for="username">用户名:</label>
        <input
          type="text"
          id="username"
          v-model="username"
          required
          aria-label="用户名"
        />
      </div>
      <div class="form-group">
        <label for="password">密码:</label>
        <input
          type="password"
          id="password"
          v-model="password"
          required
          aria-label="密码"
        />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? '登录中...' : '登录' }}
      </button>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <p class="register-link">
        还没有账号？<router-link to="/register">立即注册</router-link>
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../api';
import { setToken } from '../auth';

const username = ref('');
const password = ref('');
const errorMessage = ref('');
const loading = ref(false);
const router = useRouter();

if (localStorage.getItem('user_token')) {
    router.push('/notes')
}

const handleLogin = async () => {
  errorMessage.value = '';
  loading.value = true;

  try {
    const response = await authService.login(username.value, password.value);

    if (response.data && response.data.token) {
      setToken(response.data.token);
      alert('登录成功！');
      router.push('/notes');
    } else {
      errorMessage.value = '登录失败：未获取到有效的 token。';
    }
  } catch (error) {
    console.error('登录请求失败:', error);
    if (error.response) {
      if (error.response.status === 401) {
        errorMessage.value = '登录失败：用户名或密码错误。';
      } else if (error.response.data && error.response.data.message) {
        errorMessage.value = `登录失败：${error.response.data.message}`;
      } else {
        errorMessage.value = `登录失败：服务器错误（状态码：${error.response.status}）。`;
      }
    } else if (error.request) {
      errorMessage.value = '登录失败：无法连接到服务器，请检查网络。';
    } else {
      errorMessage.value = `登录失败：${error.message}`;
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  background-color: #f4f7f6;
}

.login-form {
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

.register-link {
  margin-top: 20px;
  text-align: center;
  color: #666;
}

.register-link a {
  color: #42b983;
  text-decoration: none;
  font-weight: bold;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>