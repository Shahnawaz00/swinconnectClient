<template>
  <div class="container">
    <h1 class="mt-5">Login</h1>
    <form @submit.prevent="login" novalidate>
      <div class="mb-3">
        <label class="form-label">Email:</label>
        <input type="email" class="form-control" v-model="email" required />
        <div class="invalid-feedback" v-if="!isEmailValid">Please enter a valid email address.</div>
      </div>
      <div class="mb-3">
        <label class="form-label">Password:</label>
        <input type="password" class="form-control" v-model="password" required />
        <div class="invalid-feedback" v-if="!isPasswordValid">Please enter a password.</div>
      </div>
      <button type="submit" class="btn btn-primary" :disabled="!isFormValid">Login</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';
import { ref, computed } from 'vue';

export default {
  setup() {
    const email = ref('');
    const password = ref('');

    const isEmailValid = computed(() => isValidEmail(email.value));
    const isPasswordValid = computed(() => !!password.value);
    const isFormValid = computed(() => isEmailValid.value && isPasswordValid.value);

    const login = async () => {
      if (!isFormValid.value) return;

      try {
        const response = await axios.post('https://swinconnectserver-production.up.railway.app/login', {
          email: email.value,
          password: password.value,
        });
        localStorage.setItem('user', JSON.stringify(response.data));
        window.location.href = '/home';
      } catch (error) {
        console.error('Login failed:', error);
        alert('Login failed. Please check your credentials and try again.');
      }
    };

    const isValidEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    return { email, password, isEmailValid, isPasswordValid, isFormValid, login };
  }
};
</script>
