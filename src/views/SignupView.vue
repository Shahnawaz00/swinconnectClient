<template>
  <div class="container">
    <h1 class="mt-5">Sign Up</h1>
    <form @submit.prevent="signup" novalidate>
      <div class="mb-3">
        <label class="form-label">Name:</label>
        <input type="text" class="form-control" v-model="name" required :class="{ 'is-invalid': !isNameValid && nameTouched }" @blur="nameTouched = true" />
        <div class="invalid-feedback" v-if="nameTouched">Please enter your name.</div>
      </div>
      <div class="mb-3">
        <label class="form-label">Email:</label>
        <input type="email" class="form-control" v-model="email" required :class="{ 'is-invalid': !isEmailValid && emailTouched }" @blur="emailTouched = true" />
        <div class="invalid-feedback" v-if="emailTouched">Please enter a valid email address.</div>
      </div>
      <div class="mb-3">
        <label class="form-label">Password:</label>
        <input type="password" class="form-control" v-model="password" required :class="{ 'is-invalid': !isPasswordValid && passwordTouched }" @blur="passwordTouched = true" />
        <div class="invalid-feedback" v-if="passwordTouched">Please enter a password.</div>
      </div>
      <button type="submit" class="btn btn-primary" :disabled="!isFormValid">Sign Up</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';
import { ref, computed } from 'vue';
// import { useRouter } from 'vue-router';

export default {
  setup() {
    const name = ref('');
    const email = ref('');
    const password = ref('');
    // const router = useRouter();
    const nameTouched = ref(false);
    const emailTouched = ref(false);
    const passwordTouched = ref(false);

    const isNameValid = computed(() => !!name.value || !nameTouched.value);
    const isEmailValid = computed(() => isValidEmail(email.value) || !emailTouched.value);
    const isPasswordValid = computed(() => !!password.value || !passwordTouched.value);
    const isFormValid = computed(() => isNameValid.value && isEmailValid.value && isPasswordValid.value);

    const signup = async () => {
      if (!isFormValid.value) return;

      try {
        const response = await axios.post('https://swinconnectserver-production.up.railway.app/signup', {
          name: name.value,
          email: email.value,
          password: password.value,
        });
        localStorage.setItem('user', JSON.stringify(response.data));
        window.location.href = '/home';
      } catch (error) {
        console.error('Sign up failed:', error);
        alert('Sign up failed. Please try again.');
      }
    };

    const isValidEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    return { name, email, password, nameTouched, emailTouched, passwordTouched, isNameValid, isEmailValid, isPasswordValid, isFormValid, signup };
  }
};
</script>
