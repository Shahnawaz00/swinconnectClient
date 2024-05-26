<template>
  <div class="container">
    <h1 class="mt-5">Home</h1>
    <div class="mb-3">
      <label for="sortSelect" class="form-label">Sort By:</label>
      <select class="form-select" id="sortSelect" v-model="sortBy" @change="sortPosts">
        <option value="newest">Newest to Oldest</option>
        <option value="oldest">Oldest to Newest</option>
      </select>
    </div>
    <div class="loading" v-if="isLoading">
    </div>
    <div v-else-if="paginatedPosts.length > 0">
      <PostComponent
        v-for="post in paginatedPosts"
        :key="post.id"
        :post="post"
        :userId="user.id"
        @update-likes="updatePostLikes"
        @update-comments="updatePostComments"
      />
      <nav aria-label="Pagination" class="mt-5">
        <ul class="pagination">
          <li class="page-item" :class="{ 'disabled': currentPage === 1 }">
            <a class="page-link" href="#" @click.prevent="prevPage">Previous</a>
          </li>
          <li class="page-item" v-for="page in totalPages" :key="page" :class="{ 'active': currentPage === page }">
            <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
          </li>
          <li class="page-item" :class="{ 'disabled': currentPage === totalPages }">
            <a class="page-link" href="#" @click.prevent="nextPage">Next</a>
          </li>
        </ul>
      </nav>
    </div>
    <div v-else>
      <p>Please follow an account with posts to start seeing posts on your feed.</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { ref, computed, onMounted, watch } from 'vue';
import PostComponent from '@/components/PostComponent.vue';

export default {
  components: {
    PostComponent
  },
  setup() {
    const posts = ref([]);
    const user = ref(null);
    const currentPage = ref(1);
    const pageSize = 5;
    const sortBy = ref('newest');
    const isLoading = ref(false); // Added isLoading reactive reference

    const totalPages = computed(() => Math.ceil(posts.value.length / pageSize));
    const paginatedPosts = computed(() => {
      const startIndex = (currentPage.value - 1) * pageSize;
      return posts.value.slice(startIndex, startIndex + pageSize);
    });

    const fetchFollowedPosts = async () => {
      try {
        isLoading.value = true; // Set isLoading to true before fetching
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
          user.value = storedUser;
          const response = await axios.get('https://swinconnectserver-production.up.railway.app/following-posts', {
            params: { userId: user.value.id }
          });
          const followedPosts = response.data;
          for (const post of followedPosts) {
            const [commentsResponse, likesResponse] = await Promise.all([
              axios.get('https://swinconnectserver-production.up.railway.app/comments', { params: { postId: post.id } }),
              axios.get('https://swinconnectserver-production.up.railway.app/likes', { params: { postId: post.id } })
            ]);
            post.comments = commentsResponse.data;
            post.likes = likesResponse.data;
          }
          posts.value = followedPosts;
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        isLoading.value = false; // Set isLoading to false after fetching
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

    const changePage = (page) => {
      currentPage.value = page;
    };

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
      }
    };

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
      }
    };

    const sortPosts = () => {
      posts.value.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (sortBy.value === 'newest') {
          return dateB - dateA;
        } else {
          return dateA - dateB;
        }
      });
    };

    watch(sortBy, sortPosts);

    onMounted(() => {
      fetchFollowedPosts();
    });

    return {
      paginatedPosts,
      currentPage,
      totalPages,
      changePage,
      nextPage,
      prevPage,
      updatePostLikes,
      updatePostComments,
      sortPosts,
      sortBy,
      user,
      isLoading 
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
  margin: 20px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

</style>
