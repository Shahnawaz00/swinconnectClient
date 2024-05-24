<template>
    <div class="container">
        <button @click="goBack" class="btn btn-secondary mt-5">Go Back</button>
      <h1 class="mt-5">{{ user.name }}'s Profile</h1>
      <h2 class="mt-4">Posts</h2>
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

      const goBack = () => {
        router.go(-1);
      };

      const userId = route.params.userId;
      const user = ref({});
      const posts = ref([]);
  
      const fetchUserProfile = async () => {
        try {
          const response = await axios.get(`https://swinconnectserver-production.up.railway.app/users/${userId}`);
          user.value = response.data;
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
  
          // Fetch comments and likes for each post
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
  
      return { user, posts, updatePostLikes, updatePostComments, goBack};
    }
  };
  </script>
  