<template>
    <div class="container">
      <h1 class="mt-5">Accounts</h1>
      <div class="mb-3">
        <input type="text" class="form-control" v-model="searchQuery" placeholder="Search for a user" @input="searchUsers" />
      </div>
      <div class="row">
        <div v-for="user in users" :key="user.id" class="col-md-4 mb-3">
          <div class="card" @click="goToUserProfile(user.id)">
            <div class="card-body">
              <h5 class="card-title">{{ user.name }}</h5>
              <p class="card-text">{{ user.email }}</p>
              <button v-if="isFollowed(user.id)" class="btn btn-primary" @click.stop="unfollowUser(user.id)">Unfollow</button>
              <button v-else class="btn btn-primary" @click.stop="followUser(user.id)">Follow</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  import { useRouter } from 'vue-router';
  
  export default {
    setup() {
      const searchQuery = ref('');
      const users = ref([]);
      const followedUsers = ref([]);
      const router = useRouter();
  
      const fetchFollowedUsers = async () => {
        try {
          const user = JSON.parse(localStorage.getItem('user'));
          const response = await axios.get('https://swinconnectserver-production.up.railway.app/followed-users', {
            params: { userId: user.id }
          });
          followedUsers.value = response.data.map(user => user.id); // Store only user IDs
        } catch (error) {
          console.error('Failed to fetch followed users:', error);
        }
      };
  
      const allUsers = async () => {
        try {
          const response = await axios.get('https://swinconnectserver-production.up.railway.app/users');
          users.value = response.data;
        } catch (error) {
          console.error('Failed to fetch users:', error);
        }
      };
  
      const searchUsers = async () => {
        try {
          const response = await axios.get('https://swinconnectserver-production.up.railway.app/search-users', {
            params: { q: searchQuery.value }
          });
          users.value = response.data;
        } catch (error) {
          console.error('Failed to fetch users:', error);
        }
      };
  
      const followUser = async (userId) => {
        try {
          const user = JSON.parse(localStorage.getItem('user'));
          await axios.post('https://swinconnectserver-production.up.railway.app/follow', {
            userId: user.id,
            followId: userId
          });
          followedUsers.value.push(userId); // Add userId to followedUsers
        } catch (error) {
          console.error('Failed to follow user:', error);
        }
      };
  
      const unfollowUser = async (userId) => {
        try {
          const user = JSON.parse(localStorage.getItem('user'));
          await axios.post('https://swinconnectserver-production.up.railway.app/unfollow', {
            userId: user.id,
            unfollowId: userId
          });
          const index = followedUsers.value.indexOf(userId);
          if (index > -1) {
            followedUsers.value.splice(index, 1); // Remove userId from followedUsers
          }
        } catch (error) {
          console.error('Failed to unfollow user:', error);
        }
      };
  
      const isFollowed = (userId) => {
        return followedUsers.value.includes(userId); // Check if user is followed
      };
  
      const goToUserProfile = (userId) => {
        router.push(`/user-profile/${userId}`);
      };
  
      onMounted(() => {
        allUsers();
        fetchFollowedUsers();
      });
  
      return { searchQuery, users, searchUsers, followUser, unfollowUser, isFollowed, goToUserProfile };
    }
  };
  </script>
  
  <style scoped>
  .card {
    cursor: pointer;
  }
  </style>
  