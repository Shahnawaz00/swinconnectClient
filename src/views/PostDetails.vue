<template>
    <div class="container mt-5" v-if="!loading">
      <div class="d-flex justify-content-between">
        <button @click="goBack" class="btn btn-secondary">Go Back</button>
        <!-- Only show the delete button if the post belongs to the logged-in user -->
        <button v-if="isOwner" @click="deletePost" class="btn btn-danger">Delete</button>
      </div>
      <div class="card mt-5">
        <div class="card-body">
          <div class="d-flex justify-content-between">
            <h1 class="card-title">{{ post.title }}</h1>
            <span>{{ new Date(post.date).toLocaleDateString() }}</span>
          </div>
          <p class="card-text">{{ post.content }}</p>
          <div class="d-flex justify-content-between">
            <button @click="toggleLike" class="btn btn-primary">{{ liked ? 'Unlike' : 'Like' }}</button>
            <span>{{ post.likes.length }} Likes</span>
          </div>
        </div>
      </div>
      <div class="mt-5">
        <h2>Comments</h2>
        <div class="mt-5">
          <form @submit.prevent="addComment">
            <div class="mb-3">
              <textarea class="form-control" v-model="newComment" required></textarea>
            </div>
            <button type="submit" class="btn btn-secondary">Add Comment</button>
          </form>
        </div>
        <div v-if="!commentsLoading">
          <div v-if="post.comments && post.comments.length > 0">
            <div v-for="comment in paginatedComments" :key="comment.id" class="card mt-3">
              <div class="card-body" v-if="comment.user">
                <p><strong>{{ comment.user.name }}:</strong> {{ comment.content }}</p>
              </div>
            </div>
            <button @click="loadMore" v-if="!allCommentsLoaded" class="btn btn-secondary mt-3">Load more comments</button>
          </div>
          <div v-else>
            <p>No comments yet.</p>
          </div>
        </div>
        <div v-else>
          <div class="loading"></div>
        </div>
      </div>
    </div>
    <div class="loading" v-else></div>
  </template>
  
  <script>
  import axios from 'axios';
  import { ref, onMounted, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  
  export default {
    name: 'PostDetails',
    setup() {
      const route = useRoute();
      const router = useRouter();
  
      const post = ref(null);
      const newComment = ref('');
      const loading = ref(true);
      const liked = ref(false);
      const commentsPerPage = 5;
      const allCommentsLoaded = ref(false);

      const commentsLoading = ref(true);

      const currentPage = ref(1);
      const paginatedComments = ref([]);
  
      const postId = route.params.id;
  
      const goBack = () => {
        router.go(-1);
      };
  
      const isOwner = computed(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        return post.value.authorId === user.id;
      });
  
      const deletePost = async () => {
        try {
          await axios.delete(`https://swinconnectserver-production.up.railway.app/posts/${postId}`);
          router.go(-1);
        } catch (error) {
          console.error('Failed to delete post:', error);
        }
      };
  
      const fetchPostDetails = async () => {
        try {
          const response = await axios.get(`https://swinconnectserver-production.up.railway.app/posts/${postId}`);
          post.value = response.data;
  
          const commentsResponse = await axios.get('https://swinconnectserver-production.up.railway.app/comments', {
            params: { postId: postId }
          });
          post.value.comments = commentsResponse.data || [];
          post.value.comments.sort((a, b) => b.id - a.id); 
          commentsLoading.value = false;
  
          const likesResponse = await axios.get('https://swinconnectserver-production.up.railway.app/likes', {
            params: { postId: postId }
          });
          post.value.likes = likesResponse.data || [];
  
          const user = JSON.parse(localStorage.getItem('user'));
          liked.value = post.value.likes.some(like => like.userId === user.id);
  
          loadInitialComments();
        } catch (error) {
          console.error('Failed to fetch post details:', error);
        } finally {
          loading.value = false;
        }
      };
  
      const toggleLike = async () => {
        try {
          const user = JSON.parse(localStorage.getItem('user'));
          if (liked.value) {
            // Unlike post
            await axios.delete('https://swinconnectserver-production.up.railway.app/like', {
              data: {
                postId: post.value.id,
                userId: user.id
              }
            });
            post.value.likes = post.value.likes.filter(like => like.userId !== user.id);
          } else {
            await axios.post('https://swinconnectserver-production.up.railway.app/like', {
              postId: post.value.id,
              userId: user.id
            });
            post.value.likes.push({ userId: user.id });
          }
          liked.value = !liked.value;
        } catch (error) {
          console.error('Failed to toggle like:', error);
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
  
          response.data.user = { name: user.name };
          // Add the new comment to the beginning of both post comments and paginatedComments
          post.value.comments.unshift(response.data);
          paginatedComments.value.unshift(response.data);
  
          // Check if all comments are loaded
          allCommentsLoaded.value = paginatedComments.value.length >= post.value.comments.length;
          
          newComment.value = '';
        } catch (error) {
          console.error('Failed to add comment:', error);
        }
      };
  
      const loadInitialComments = () => {
        currentPage.value = 1;
        paginatedComments.value = post.value.comments.slice(0, commentsPerPage);
        allCommentsLoaded.value = paginatedComments.value.length >= post.value.comments.length;
      };
  
      const loadMore = () => {
        const nextPageComments = post.value.comments.slice(0, commentsPerPage * (currentPage.value + 1));
        currentPage.value++;
        paginatedComments.value = nextPageComments;
        if (paginatedComments.value.length >= post.value.comments.length) {
          allCommentsLoaded.value = true;
        }
      };
  
      onMounted(() => {
        fetchPostDetails();
    });

    return {
      post,
      newComment,
      toggleLike,
      addComment,
      loading,
      liked,
      loadMore,
      allCommentsLoaded,
      paginatedComments,
      currentPage,
      goBack,
      isOwner,
      deletePost,
      commentsLoading
    };
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
  margin: 20px 50px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
  