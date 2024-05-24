<template>
  <div class="container mt-5">
    <h1>Manage Account</h1>
    <div v-if="!editMode">
      <div class="mb-3">
        <label for="name" class="form-label">Name:</label>
        <input type="text" class="form-control" id="name" v-model="user.name" readonly>
      </div>
      <div class="mb-3">
        <label for="email" class="form-label">Email:</label>
        <input type="email" class="form-control" id="email" v-model="user.email" readonly>
      </div>
      <button class="btn btn-primary" @click="editMode = true">Edit</button>
    </div>
    <div v-else>
      <div class="mb-3">
        <label for="newname" class="form-label">New Name:</label>
        <input type="text" class="form-control" id="newname" v-model="newname">
      </div>
      <div class="mb-3">
        <label for="newEmail" class="form-label">New Email:</label>
        <input type="email" class="form-control" id="newEmail" v-model="newEmail">
      </div>
      <div class="mb-3">
        <label for="password" class="form-label">Password:</label>
        <input type="password" class="form-control" id="password" v-model="password" @input="checkPasswordMatch" >
      </div>
      <div class="mb-3">
        <label for="confirmPassword" class="form-label">Confirm Password:</label>
        <input type="password" class="form-control" id="confirmPassword" v-model="confirmPassword" @input="checkPasswordMatch">
        <div v-if="!passwordsMatch" class="text-danger">Passwords do not match</div>
      </div>
      <button class="btn btn-primary" @click="saveChanges" :disabled="!passwordsMatch">Save Changes</button>
      <button class="btn btn-secondary" @click="cancelEdit">Cancel</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { ref } from 'vue';

export default {
  name: 'ManageAccount',
  setup() {
    const user = ref(JSON.parse(localStorage.getItem('user')));
    const newname = ref(user.value.name);
    const newEmail = ref(user.value.email);
    const password = ref(user.value.password);
    const confirmPassword = ref(user.value.password);
    const passwordsMatch = ref(true); 
    const editMode = ref(false);


    const checkPasswordMatch = () => {
      passwordsMatch.value = password.value === confirmPassword.value;
    };

    const saveChanges = async () => {
      try {
        if (!passwordsMatch.value) {
          console.error('Passwords do not match');
          return;
        }

        const updatedUser = {
          ...user.value,
          name: newname.value,
          email: newEmail.value,
          password: password.value
        };
        const response = await axios.put(`https://swinconnectserver-production.up.railway.app/users/${user.value.id}`, updatedUser);
        localStorage.setItem('user', JSON.stringify(response.data));
        user.value = response.data;
        editMode.value = false;
      } catch (error) {
        console.error('Failed to save changes:', error);
      }
    };

    const cancelEdit = () => {
      newname.value = user.value.name;
      newEmail.value = user.value.email;
      password.value = '';
      confirmPassword.value = '';
      passwordsMatch.value = true; 
      editMode.value = false;
    };

    return {
      user,
      newname,
      newEmail,
      password,
      confirmPassword,
      passwordsMatch,
      editMode,
      saveChanges,
      cancelEdit,
      checkPasswordMatch
    };
  }
};
</script>
