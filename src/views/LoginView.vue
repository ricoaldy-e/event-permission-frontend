<template>
  <div class="login-container">
    <h2>Login Sistem Perizinan Acara</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="username">Username:</label>
        <input type="text" id="username" v-model="username" required />
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? "Logging in..." : "Login" }}
      </button>
      <p v-if="error" class="error-message">{{ error.message }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useMutation } from "@vue/apollo-composable";
import gql from "graphql-tag";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const username = ref("");
const password = ref("");
const router = useRouter();
const authStore = useAuthStore();

const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      user {
        id
        username
        role
      }
      token
    }
  }
`;

const { mutate: login, loading, error } = useMutation(LOGIN_MUTATION);

const handleLogin = async () => {
  try {
    const { data } = await login({
      input: { username: username.value, password: password.value },
    });
    if (data && data.login) {
      authStore.setToken(data.login.token);
      authStore.setUser(data.login.user);

      alert("Login berhasil!");

      if (data.login.user.role === "operator") {
        router.push("/operator-dashboard");
      } else if (data.login.user.role === "verifikator") {
        router.push("/verifikator-dashboard");
      } else {
        router.push("/");
      }
    }
  } catch (e) {
    console.error("Error during login:", e);
  }
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 80px auto;
  padding: 30px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  text-align: center;
}
h2 {
  color: #333;
  margin-bottom: 25px;
}
.form-group {
  margin-bottom: 18px;
  text-align: left;
}
label {
  display: block;
  margin-bottom: 6px;
  color: #555;
  font-weight: bold;
}
input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 16px;
}
button {
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 20px;
}
button:hover {
  background-color: #0056b3;
}
button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
.error-message {
  color: red;
  margin-top: 15px;
  font-weight: bold;
}
</style>
