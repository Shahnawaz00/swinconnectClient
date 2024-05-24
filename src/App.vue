<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container-fluid">
        <router-link class="navbar-brand" to="/" style="padding-right: 20px;">Swin Connect</router-link>
        <button class="navbar-toggler" type="button" @click="toggleNavbar">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div :class="['collapse', 'navbar-collapse', { 'show': isNavbarOpen }]" id="navbarNav">
          <ul class="navbar-nav">
            <li v-if="isAuthenticated" class="nav-item">
              <router-link class="nav-link" to="/home" :class="{ active: $route.path === '/home' }">Home</router-link>
            </li>
            <li v-if="isAuthenticated" class="nav-item">
              <router-link class="nav-link" to="/news" :class="{ active: $route.path === '/news' }">News</router-link>
            </li>
            <li v-if="isAuthenticated" class="nav-item">
              <router-link class="nav-link" to="/accounts" :class="{ active: $route.path === '/accounts' }">Accounts</router-link>
            </li>
            <li v-if="isAuthenticated" class="nav-item">
              <router-link class="nav-link" to="/my-profile" :class="{ active: $route.path === '/my-profile' }">My Profile</router-link>
            </li>
            <li v-if="isAuthenticated" class="nav-item">
              <router-link class="nav-link" to="/manage-account" :class="{ active: $route.path === '/manage-account' }">Manage Account</router-link>
            </li>
            <li v-if="isAuthenticated" class="nav-item">
              <button class="nav-link btn" @click="logout">Logout</button>
            </li>
            <li v-if="!isAuthenticated" class="nav-item">
              <router-link class="nav-link" to="/" :class="{ active: $route.path === '/' }">Home</router-link>
            </li>
            <li v-if="!isAuthenticated" class="nav-item">
              <router-link class="nav-link" to="/login" :class="{ active: $route.path === '/login' }">Login</router-link>
            </li>
            <li v-if="!isAuthenticated" class="nav-item">
              <router-link class="nav-link" to="/signup" :class="{ active: $route.path === '/signup' }">Sign Up</router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const router = useRouter();
    const isAuthenticated = ref(!!localStorage.getItem('user'));
    const isNavbarOpen = ref(false);

    const logout = () => {
      localStorage.removeItem('user');
      router.push('/login');
      window.location.reload();
    };

    const toggleNavbar = () => {
      isNavbarOpen.value = !isNavbarOpen.value;
    };

    return { isAuthenticated, logout, toggleNavbar, isNavbarOpen };
  }
};
</script>

<style>
@import "bootstrap/dist/css/bootstrap.min.css";

.navbar-nav .nav-link:hover {
  color: #007bff; /* Change color on hover */
}

.navbar-nav .nav-link.active {
  color: #007bff !important; /* Change color of active link */
}
</style>
