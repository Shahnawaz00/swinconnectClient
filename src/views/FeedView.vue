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
    <div v-if="paginatedPosts.length > 0">
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
import { ref, computed, onMounted } from 'vue';
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

    const totalPages = computed(() => Math.ceil(posts.value.length / pageSize));
    const paginatedPosts = computed(() => {
      const startIndex = (currentPage.value - 1) * pageSize;
      return posts.value.slice(startIndex, startIndex + pageSize);
    });

    const fetchFollowedPosts = async () => {
      try {
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
      if (sortBy.value === 'newest') {
        posts.value.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else {
        posts.value.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      }
    };

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
      user
    };
  }
};
</script>
