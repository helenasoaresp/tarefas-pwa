<template>
  <div class="login-container">
    <form class="login-form" @submit.prevent="handleLogin">
      <h1>Entrar</h1>

      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

      <div class="field">
        <label for="email">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          placeholder="seu@email.com"
          required
          autocomplete="email"
        />
      </div>

      <div class="field">
        <label for="password">Senha</label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="••••••••"
          required
          autocomplete="current-password"
        />
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Entrando...' : 'Entrar' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');

async function handleLogin() {
  loading.value = true;
  errorMessage.value = '';
  try {
    await authStore.login(email.value, password.value);
    router.push('/');
  } catch (err) {
    errorMessage.value =
      err.response?.data?.detail ??
      'Erro ao entrar. Verifique suas credenciais.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f4f8fc;
}

.login-container {
  width: 100%;
  max-width: 400px;
  background: white;
  padding: 35px 40px;
  border-radius: 12px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
}

.login-container h1 {
  text-align: center;
  color: #333;
  margin: 0 0 8px;
  font-size: 28px;
}

.login-container .subtitle {
  text-align: center;
  color: #777;
  font-size: 14px;
  margin-bottom: 30px;
}

.field {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.field label {
  margin-bottom: 7px;
  color: #444;
  font-size: 14px;
  font-weight: 600;
}

.field input {
  padding: 12px 14px;
  border: 1px solid #d5dce5;
  border-radius: 7px;
  font-size: 15px;
  outline: none;
  transition: 0.2s;
  box-sizing: border-box;
}

.field input:focus {
  border-color: #4a90e2;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.12);
}

.login-container button[type="submit"] {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 7px;
  background: #4a90e2;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.login-container button[type="submit"]:hover {
  background: #357abd;
}

.login-container button[type="submit"]:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background: #fff0f0;
  color: #d93025;
  border: 1px solid #f3c2c2;
  padding: 10px 12px;
  border-radius: 7px;
  font-size: 14px;
  margin-bottom: 20px;
}
</style>
