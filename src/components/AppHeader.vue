<template>
  <header class="app-header">
    <h1>Meu gestor de Tarefas!</h1>
    <nav>
      <router-link to="/">Início</router-link>
      <router-link to="/about">Sobre</router-link>
      <button
        v-if="authStore.isAuthenticated"
        class="logout-btn"
        @click="handleLogout"
      >
        Sair
      </button>
    </nav>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>

<style scoped>
.app-header {
  padding: 20px 30px 12px;
}

.app-header h1 {
  margin-bottom: 18px;
  color: #4a90e2;
}

.app-header nav {
  display: flex;
  justify-content: flex-end;
  gap: 20px;
}

.app-header nav a,
.logout-btn {
  color: #4a90e2;
  text-decoration: none;
  font-size: 16px;
}

.app-header nav a.router-link-active {
  text-decoration: underline;
  text-underline-offset: 4px;
}

.app-header nav a:hover,
.logout-btn:hover {
  color: #357abd;
}

.logout-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}
</style>
