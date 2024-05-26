<template>
    <div class="container mt-4">
      <h1 class="mb-4">Latest News</h1>
      <div class="mb-4">
        <div class="input-group">
          <label class="input-group-text" for="categoryDropdown">Category</label>
          <select class="form-select" id="categoryDropdown" v-model="selectedCategory" @change="fetchNewsArticles">
            <option value="world">World news</option>
            <option value="us-news">US News</option>
            <option value="australia-news">Australia News</option>
            <option value="football">Football</option>
            <option value="lifeandstyle">Life and Style</option>
          </select>
        </div>
      </div>
      <div v-if="loading" class="text-center">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div v-else>
        <div v-for="(article, index) in paginatedArticles" :key="index" class="card mb-3">
  <div class="row g-0">
    <div class="col-md-4">
      <img v-if="article.urlToImage" :src="article.urlToImage" class="img-fluid rounded-start" alt="Article Image">
      <div v-else class="bg-light d-flex justify-content-center align-items-center" style="min-height: 200px;">
        No Image Available
      </div>
    </div>
    <div class="col-md-8">
      <div class="card-body">
        <h5 class="card-title">{{ article.title }}</h5>
        <p class="card-text">{{ article.description }}</p>
        <a :href="article.url" target="_blank" class="btn btn-primary">Read More</a>
      </div>
    </div>
  </div>
</div>
        <nav aria-label="Pagination" class="mt-5">
          <ul class="pagination justify-content-center">
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
    </div>
  </template>
  
  <script>
  import { ref, onMounted, computed } from 'vue';
  
  export default {
    setup() {
        const articles = ref([]);
    const loading = ref(true);
    const selectedCategory = ref('world');
    const currentPage = ref(1);
    const pageSize = 3;

    const fetchNewsArticles = async () => {
      const apiKey = '405932a0-b89e-491b-b63a-2a17629dd00d'; // your Guardian API key
      const apiUrl = `https://content.guardianapis.com/${selectedCategory.value}?api-key=${apiKey}`;

      try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        articles.value = data.response.results.map(article => ({
          title: article.webTitle,
          description: article.webTitle, // Guardian API doesn't provide a description, using title as placeholder
          url: article.webUrl,
          urlToImage: null, // Guardian API doesn't provide image URLs in the basic tier
        }));
        loading.value = false;
      } catch (error) {
        console.error('Error fetching news articles:', error);
        loading.value = false;
      }
    };
      const totalPages = computed(() => Math.ceil(articles.value.length / pageSize));
      const paginatedArticles = computed(() => {
        const startIndex = (currentPage.value - 1) * pageSize;
        return articles.value.slice(startIndex, startIndex + pageSize);
      });
  
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
  
      onMounted(() => {
        fetchNewsArticles();
      });
  
      return {
        paginatedArticles,
        currentPage,
        totalPages,
        changePage,
        nextPage,
        prevPage,
        loading,
        selectedCategory,
        fetchNewsArticles
      };
    }
  };
  </script>
  

  