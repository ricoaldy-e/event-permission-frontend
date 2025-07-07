import { createRouter, createWebHashHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import OperatorDashboard from "../views/OperatorDashboard.vue";
import VerifikatorDashboard from "../views/VerifikatorDashboard.vue";

import { useAuthStore } from "../stores/auth";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/login",
    name: "login",
    component: LoginView,
  },
  {
    path: "/operator-dashboard",
    name: "operator-dashboard",
    component: OperatorDashboard,
    meta: { requiresAuth: true, role: "operator" },
  },
  {
    path: "/verifikator-dashboard",
    name: "verifikator-dashboard",
    component: VerifikatorDashboard,
    meta: { requiresAuth: true, role: "verifikator" },
  },

  {
    path: "/:catchAll(.*)",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHashHistory("/"),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    alert("Anda perlu login untuk mengakses halaman ini.");
    next("/login");
  } else if (
    to.meta.role &&
    authStore.isLoggedIn &&
    authStore.userRole !== to.meta.role
  ) {
    alert(
      `Anda tidak memiliki akses ke halaman ini. Role Anda adalah "${authStore.userRole}".`
    );

    if (authStore.userRole === "operator") {
      next("/operator-dashboard");
    } else if (authStore.userRole === "verifikator") {
      next("/verifikator-dashboard");
    } else {
      next("/");
    }
  } else if (to.name === "login" && authStore.isLoggedIn) {
    if (authStore.userRole === "operator") {
      next("/operator-dashboard");
    } else if (authStore.userRole === "verifikator") {
      next("/verifikator-dashboard");
    } else {
      next("/");
    }
  } else {
    next();
  }
});

export default router;
