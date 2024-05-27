<template>
    <div class="container">
      <div v-if="!loading">
        <button @click="goBack" class="btn btn-secondary mt-5">Go Back</button>
        <h1 class="mt-5">{{ user.name }}'s Profile</h1>
        <h2 class="mt-4">Posts</h2>
        <div v-if="!postsLoading">
          <div v-if="posts.length > 0">
            <PostComponent
              v-for="post in posts"
              :key="post.id"
              :post="post"
              :userId="userId"
              @update-likes="updatePostLikes"
              @update-comments="updatePostComments"
            />
          </div>
          <div v-else>
            <p>This user has not made any posts yet.</p>
          </div>
        </div>
        <div v-else>
          <div class="posts-loading"></div>
        </div>
      </div>
      <div v-else>
        <div class="loading"></div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  import PostComponent from '@/components/PostComponent.vue';
  import { useRoute, useRouter } from 'vue-router';
  
  export default {
    components: {
      PostComponent
    },
    setup() {
      const route = useRoute();
      const router = useRouter();
      const loading = ref(true);
      const postsLoading = ref(true);
  
      const goBack = () => {
        router.go(-1);
      };
  
      const userId = route.params.userId;
      const users = ref([]);
      const user = ref({});
      const posts = ref([]);
  
      const fetchUserProfile = async () => {
        try {
          const response = await axios.get(`https://swinconnectserver-production.up.railway.app/users`);
          users.value = response.data;
          user.value = users.value.find(u => u.id === parseInt(userId));
          loading.value = false;
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        }
      };
  
      const fetchUserPosts = async () => {
        try {
          const response = await axios.get('https://swinconnectserver-production.up.railway.app/user-posts', {
            params: { userId: userId }
          });
          const postsData = response.data;
  
          for (const post of postsData) {
            const [commentsResponse, likesResponse] = await Promise.all([
              axios.get('https://swinconnectserver-production.up.railway.app/comments', {
                params: { postId: post.id }
              }),
              axios.get('https://swinconnectserver-production.up.railway.app/likes', {
                params: { postId: post.id }
              })
            ]);
  
            post.comments = commentsResponse.data;
            post.likes = likesResponse.data;
          }
  
          posts.value = postsData;
          postsLoading.value = false;
        } catch (error) {
          console.error('Failed to fetch user posts:', error);
        }
      };
  
      const updatePostLikes = (postId, likes) => {
        const post = posts.value.find(p => p.id === postId);
        if (post) {
          post.likes = likes;
        }
      };
  
      const updatePostComments = (postId, comments) => {
        const post = posts.value.find(p => p.id === postId);
        if (post) {
          post.comments = comments;
        }
      };
  
      onMounted(() => {
        fetchUserProfile();
        fetchUserPosts();
      });
  
      return { user, posts, updatePostLikes, updatePostComments, goBack, loading, postsLoading };
    }
  };
  </script>
  
  <style>
  .loading {
    display: inline-block;
    width: 50px;
    height: 50px;
    border: 3px solid #1D3D6F;
    border-radius: 50%;
    border-top: 3px solid #fff;
    animation: spin 1s ease-in-out infinite;
    margin: 20px auto;
  }
  
  .posts-loading {
    display: inline-block;
    width: 50px;
    height: 50px;
    border: 3px solid #1D3D6F;
    border-radius: 50%;
    border-top: 3px solid #fff;
    animation: spin 1s ease-in-out infinite;
    margin: 20px auto;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  </style>
  