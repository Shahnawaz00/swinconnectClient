<template>
    <div class="container" v-if="post">
      <div class="card mt-5">
        <div class="card-body">
          <h1 class="card-title">{{ post.title }}</h1>
          <p class="card-text">{{ post.content }}</p>
          <p class="card-text">Date: {{ formatDate(post.createdAt) }}</p>
          <div>
            <button @click="likePost" class="btn btn-primary">Like</button>
            <span v-if="post.likes">{{ post.likes.length }} Likes</span>
          </div>
        </div>
      </div>
      <div class="mt-5">
        <h2>Comments</h2>
        <div v-if="post.comments">
          <div v-for="comment in post.comments" :key="comment.id" class="card mt-3">
            <div class="card-body">
              <p><strong>{{ comment.user.email }}:</strong> {{ comment.content }}</p>
            </div>
          </div>
        </div>
        <div class="mt-5">
          <h2>Add a Comment</h2>
          <form @submit.prevent="addComment">
            <div class="mb-3">
              <textarea class="form-control" v-model="newComment" required></textarea>
            </div>
            <button type="submit" class="btn btn-secondary">Add Comment</button>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import { ref, onMounted } from 'vue';
  
  export default {
    name: 'PostDetails',
    props: {
      id: {
        type: String,
        required: true
      }
    },
    setup(props) {
      const post = ref(null);
      const newComment = ref('');
  
      const fetchPostDetails = async () => {
    try {
        const response = await axios.get(`https://swinconnectserver-production.up.railway.app/posts/${props.id}`);
        post.value = response.data;

        // Initialize likes as an empty array
        post.value.likes = [];

        // Fetch comments for the post
        const commentsResponse = await axios.get('https://swinconnectserver-production.up.railway.app/comments', {
            params: { postId: props.id }
        });
        post.value.comments = commentsResponse.data;

        // Fetch likes for the post
        const likesResponse = await axios.get('https://swinconnectserver-production.up.railway.app/likes', {
            params: { postId: props.id }
        });
        post.value.likes = likesResponse.data;
    } catch (error) {
        console.error('Failed to fetch post details:', error);
    }
};

  
      const likePost = async () => {
        try {
          const user = JSON.parse(localStorage.getItem('user'));
          await axios.post('https://swinconnectserver-production.up.railway.app/like', {
            postId: post.value.id,
            userId: user.id
          });
          post.value.likes.push({ userId: user.id }); // Optimistically update the likes
        } catch (error) {
          console.error('Failed to like post:', error);
        }
      };
  
      const addComment = async () => {
        try {
          const user = JSON.parse(localStorage.getItem('user'));
          const response = await axios.post('https://swinconnectserver-production.up.railway.app/comment', {
            postId: post.value.id,
            userId: user.id,
            content: newComment.value
          });
          post.value.comments.push(response.data); // Optimistically update the comments
          newComment.value = '';
        } catch (error) {
          console.error('Failed to add comment:', error);
        }
      };
  
      const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString();
      };
  
      onMounted(() => {
        fetchPostDetails();
      });
  
      return {
        post,
        newComment,
        likePost,
        addComment,
        formatDate
      };
    }
  };
  </script>
  
  <style scoped>
  /* Add your styles here */
  </style>
  