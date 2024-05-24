<template>
    <ul class="navbar-nav">
      <li class="nav-item">
        <router-link class="nav-link" to="/home">Home</router-link>
      </li>
      <li class="nav-item">
        <router-link class="nav-link" to="/news">News</router-link>
      </li>
      <li class="nav-item">
        <router-link class="nav-link" to="/accounts">Accounts</router-link>
      </li>
      <li class="nav-item">
        <router-link class="nav-link" to="/my-profile">My Profile</router-link>
      </li>
      <li class="nav-item">
        <router-link class="nav-link" to="/manage-account">Manage Account</router-link>
      </li>
      <li class="nav-item">
        <button class="nav-link btn" @click="logout">Logout</button>
      </li>
    </ul>
  </template>
  
  <script>
  export default {
    props: ['logout']
  };
  </script>
  