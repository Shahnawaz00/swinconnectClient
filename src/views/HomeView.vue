<template>
    <div class="container">
      <h1 class="mt-5">Home</h1>
      <p v-if="!isAuthenticated">
        Please <router-link to="/login">login</router-link> or <router-link to="/signup">sign up</router-link>.
      </p>
      <p v-else>
        Welcome, you are logged in! 
        <button class="btn btn-primary" @click="logout">Logout</button>
      </p>
    </div>
  </template>
  
  <script>
  import { computed } from 'vue';
  import { useRouter } from 'vue-router';
  
  export default {
    setup() {
      const router = useRouter();
      const isAuthenticated = computed(() => !!localStorage.getItem('user'));
  
      const logout = () => {
        localStorage.removeItem('user');
        router.push('/login');
        window.location.reload();
      };
  
      return { isAuthenticated, logout };
    }
  };
  </script>
  