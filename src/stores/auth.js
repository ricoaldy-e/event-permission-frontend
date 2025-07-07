import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("jwt_token") || null,
    user: JSON.parse(localStorage.getItem("user_data")) || null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    userRole: (state) => (state.user ? state.user.role : null),
    username: (state) => (state.user ? state.user.username : null),
    userId: (state) => (state.user ? state.user.id : null),
  },
  actions: {
    setToken(token) {
      this.token = token;
      localStorage.setItem("jwt_token", token);
    },
    setUser(user) {
      this.user = user;
      localStorage.setItem("user_data", JSON.stringify(user));
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("user_data");
    },
  },
});
