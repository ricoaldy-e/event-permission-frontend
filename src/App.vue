<template>
  <nav>
    <router-link to="/">Home</router-link> |
    <router-link v-if="!authStore.isLoggedIn" to="/login">Login</router-link>
    <template v-else>
      <span style="margin-left: 10px"
        >Halo, {{ authStore.username }} ({{ authStore.userRole }})!</span
      >
      |
      <router-link
        v-if="authStore.userRole === 'operator'"
        to="/operator-dashboard"
        >Dashboard Operator</router-link
      >
      <router-link
        v-else-if="authStore.userRole === 'verifikator'"
        to="/verifikator-dashboard"
        >Dashboard Verifikator</router-link
      >
      |
      <a href="#" @click.prevent="logout">Logout</a>
    </template>
  </nav>
  <router-view />
</template>

<script setup>
import { useAuthStore } from "./stores/auth";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const router = useRouter();

const logout = () => {
  authStore.logout(); // Panggil action logout
  router.push("/login"); // Redirect ke login
};
</script>

<style>
/* Styling global untuk navigasi dan reset CSS dasar */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px; /* Memberi sedikit ruang dari atas */
}

nav {
  padding: 30px;
  background-color: #f2f2f2;
  border-bottom: 1px solid #ddd;
  margin-bottom: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
  padding: 0 10px;
  text-decoration: none;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
