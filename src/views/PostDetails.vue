
  <template>
    <div class="container mt-5" v-if="post">
        
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
        <div v-if="post.comments && post.comments.length > 0">
          <div v-for="comment in paginatedComments" :key="comment.id" class="card mt-3"> <!-- Paginated comments -->
            <div class="card-body" v-if="comment.user">
              <p><strong>{{ comment.user.name }}:</strong> {{ comment.content }}</p>
            </div>
          </div>
          <button @click="loadMore" v-if="!allCommentsLoaded" class="btn btn-secondary mt-3" >Load more comments</button> <!-- Load more button -->
        </div>
        <div v-else>
          <p>No comments yet.</p>
        </div>
      </div>
    </div>
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
      const liked = ref(false); // Like state
      const commentsPerPage = 5; // Number of comments per page
      const allCommentsLoaded = ref(false); // All comments loaded state
      const currentPage = ref(0); // Current page for comments
      const paginatedComments = ref([]); // Paginated comments
  
      const postId = route.params.id;
  
      const goBack = () => {
        router.go(-1);
      };

      const isOwner = computed(() => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (post.value.authorId === user.id) {
        return true;
      }
      return false;
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
  
          // Fetch comments and likes for the post
          const commentsResponse = await axios.get('https://swinconnectserver-production.up.railway.app/comments', {
            params: { postId: postId }
          });
          post.value.comments = commentsResponse.data || [];
  
          const likesResponse = await axios.get('https://swinconnectserver-production.up.railway.app/likes', {
            params: { postId: postId }
          });
          post.value.likes = likesResponse.data || [];
          
          // Check if the current user has liked the post
          const user = JSON.parse(localStorage.getItem('user'));
          liked.value = post.value.likes.some(like => like.userId === user.id);
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
            // Like post
            await axios.post('https://swinconnectserver-production.up.railway.app/like', {
              postId: post.value.id,
              userId: user.id
            });
            post.value.likes.push({ userId: user.id });
          }
          // Toggle the liked state
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
          post.value.comments.push(response.data); // Optimistically update the comments
          newComment.value = '';
        } catch (error) {
          console.error('Failed to add comment:', error);
        }
      };
  
      const loadMore = () => {
        const loadedComments = post.value.comments.slice(0, commentsPerPage * (currentPage.value + 1));
        if (loadedComments.length === post.value.comments.length) {
          allCommentsLoaded.value = true;
        }
        currentPage.value++;
        paginatedComments.value = loadedComments;
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
        deletePost
      };
    }
  };
  </script>
  
  
  <style scoped>
  /* Add your styles here */
  </style>
  