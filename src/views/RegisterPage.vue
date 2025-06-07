<template>
  <div class="register-container">
    <h2>用户注册</h2>
    <form @submit.prevent="handleRegister" class="register-form">
      <div class="form-group">
        <label for="reg-username">用户名:</label>
        <input
          type="text"
          id="reg-username"
          v-model="username"
          required
          aria-label="用户名"
        />
      </div>
      <div class="form-group">
        <label for="reg-password">密码:</label>
        <input
          type="password"
          id="reg-password"
          v-model="password"
          required
          aria-label="密码"
        />
      </div>
      <div class="form-group">
        <label for="confirm-password">确认密码:</label>
        <input
          type="password"
          id="confirm-password"
          v-model="confirmPassword"
          required
          aria-label="确认密码"
        />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? '注册中...' : '注册' }}
      </button>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <p class="login-link">
        已有账号？<router-link to="/">去登录</router-link>
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const errorMessage = ref('');
const loading = ref(false);

const router = useRouter();
const API_BASE_URL = 'http://localhost:8000'; // 你的后端API地址

const handleRegister = async () => {
  errorMessage.value = ''; // 清除之前的错误信息
  if (password.value !== confirmPassword.value) {
    errorMessage.value = '两次输入的密码不一致！';
    return;
  }
  if (password.value.length < 6) { // 简单密码强度检查
    errorMessage.value = '密码长度至少为6位。';
    return;
  }

  loading.value = true; // 设置加载状态

  try {
    const response = await axios.post(`${API_BASE_URL}/register/`, {
      username: username.value,
      password: password.value,
    });

    if (response.status === 201) { // 201 Created
      alert('注册成功！请登录。');
      router.push('/'); // 注册成功后跳转回登录页
    }
  } catch (error) {
    console.error('注册请求失败:', error);
    if (error.response) {
      if (error.response.status === 409) {
        errorMessage.value = '注册失败：用户名已存在。';
      } else if (error.response.data && error.response.data.message) {
        errorMessage.value = `注册失败：${error.response.data.message}`;
      } else {
        errorMessage.value = `注册失败：服务器错误（状态码：${error.response.status}）。`;
      }
    } else if (error.request) {
      errorMessage.value = '注册失败：无法连接到服务器，请检查网络。';
    } else {
      errorMessage.value = `注册失败：${error.message}`;
    }
  } finally {
    loading.value = false; // 无论成功或失败，都解除加载状态
  }
};
</script>

<style scoped>
.register-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  background-color: #f4f7f6;
}

.register-form {
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
  background-color: #3498db; /* 蓝色 */
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1.1em;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 10px;
}

button[type="submit"]:hover:not(:disabled) {
  background-color: #2980b9;
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

.login-link {
  margin-top: 20px;
  text-align: center;
  color: #666;
}

.login-link a {
  color: #42b983;
  text-decoration: none;
  font-weight: bold;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>