<template>
  <div class="container">
    <h1 class="mt-5">My Profile</h1>
    <nav class="mt-4">
      <ul class="nav nav-tabs">
        <li class="nav-item">
          <a class="nav-link" :class="{ active: activeTab === 'posts' }" @click="activeTab = 'posts'">My Posts</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" :class="{ active: activeTab === 'create' }" @click="activeTab = 'create'">Create a Post</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" :class="{ active: activeTab === 'followed' }" @click="activeTab = 'followed'">Followed Accounts</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" :class="{ active: activeTab === 'liked' }" @click="activeTab = 'liked'">Liked Posts</a>
        </li>
      </ul>
    </nav>
    <div v-if="activeTab === 'posts'" class="mt-5">
      <h2>Your Posts</h2>
      <div class="loading" v-if="isLoadingPosts">
      </div>
      <div class="row" v-else-if="posts.length > 0">
        <div class="col-md-6" v-for="post in posts" :key="post.id">
          <PostComponent
            :post="post"
            :userId="userId"
            @update-likes="updatePostLikes"
            @update-comments="updatePostComments"
          />
        </div>
      </div>
      <div v-else>
        <p>You have not made any posts yet.</p>
      </div>  
    </div>
    <div v-if="activeTab === 'create'" class="mt-5">
      <h2>Create a Post</h2>
      <form @submit.prevent="createPost">
        <div class="mb-3">
          <label class="form-label">Title:</label>
          <input type="text" class="form-control" v-model="newPost.title" required />
        </div>
        <div class="mb-3">
          <label class="form-label">Content:</label>
          <textarea class="form-control" v-model="newPost.content" required></textarea>
        </div>
        <button type="submit" class="btn btn-primary">Create Post</button>
      </form>
      <div v-if="createdPostId" class="mt-3">
        <a :href="'/post/' + createdPostId" class="btn btn-link">Go to Post</a>
      </div>
    </div>
    <div v-if="activeTab === 'followed'" class="mt-5">
      <h2>Followed Accounts</h2>
      <div class="loading" v-if="isLoadingFollowedUsers">
      </div>
      <div v-else-if="followedUsersList.length > 0" class="row">
        <div v-for="user in followedUsersList" :key="user.id" class="col-md-4 mb-3">
          <div class="card" @click="goToUserProfile(user.id)">
            <div class="card-body">
              <h5 class="card-title">{{ user.name }}</h5>
              <p class="card-text">{{ user.email }}</p>
              <button class="btn btn-primary" @click.stop="unfollowUser(user.id)"> - Unfollow</button>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <p>You are not following any accounts yet.</p>
      </div>
    </div>
    <div v-if="activeTab === 'liked'" class="mt-5">
      <h2>Liked Posts</h2>
      <div class="loading" v-if="isLoadingLikedPosts">
      </div>
      <div class="row" v-else>
        <div class="col-md-5" v-if="likedPosts.length > 0">
          <PostComponent
            v-for="post in likedPosts" 
            :key="post.id"
            :post="post"
            :userId="userId"
            @update-likes="updatePostLikes"
            @update-comments="updatePostComments"
          />
        </div>
        <div v-else >
          <p>You have not liked any posts yet.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import PostComponent from '@/components/PostComponent.vue';

export default {
  components: {
    PostComponent
  },
  setup() {
    const activeTab = ref('posts');
    const posts = ref([]);
    const newPost = ref({
      title: '',
      content: ''
    });
    const users = ref([]);
    const followedUsers = ref([]);
    const followedUsersList = ref([]);
    const likedPosts = ref([]);
    const createdPostId = ref(null);
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = ref(user ? user.id : null);

    const isLoadingPosts = ref(false);
    const isLoadingFollowedUsers = ref(false);
    const isLoadingLikedPosts = ref(false);

    const fetchPosts = async () => {
      try {
        isLoadingPosts.value = true;
        const response = await axios.get('https://swinconnectserver-production.up.railway.app/user-posts', {
          params: { userId: userId.value }
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
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        isLoadingPosts.value = false;
      }
    };

    const createPost = async () => {
      try {
        const response = await axios.post('https://swinconnectserver-production.up.railway.app/posts', {
          title: newPost.value.title,
          content: newPost.value.content,
          userId: userId.value
        });
        newPost.value = { title: '', content: '' };
        createdPostId.value = response.data.id; 
        fetchPosts();
      } catch (error) {
        console.error('Failed to create post:', error);
      }
    };

    const fetchFollowedUsers = async () => {
      try {
        isLoadingFollowedUsers.value = true;
        const response = await axios.get('https://swinconnectserver-production.up.railway.app/followed-users', {
          params: { userId: userId.value }
        });
        followedUsers.value = response.data.map(user => user.id); 
        filterFollowedUsers();
      } catch (error) {
        console.error('Failed to fetch followed users:', error);
      } finally {
        isLoadingFollowedUsers.value = false;
      }
    };

    const filterFollowedUsers = () => {
      followedUsersList.value = users.value.filter(user => followedUsers.value.includes(user.id));
    };

    const allUsers = async () => {
      try {
        const response = await axios.get('https://swinconnectserver-production.up.railway.app/users');
        users.value = response.data;
        fetchFollowedUsers();
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    const followUser = async (followId) => {
      try {
        await axios.post('https://swinconnectserver-production.up.railway.app/follow', {
          userId: userId.value,
          followId
        });
        followedUsers.value.push(followId);
      } catch (error) {
        console.error('Failed to follow user:', error);
      }
    };

    const unfollowUser = async (unfollowId) => {
      try {
        await axios.post('https://swinconnectserver-production.up.railway.app/unfollow', {
          userId: userId.value,
          unfollowId
        });
        const index = followedUsers.value.indexOf(unfollowId);
        if (index > -1) {
          followedUsers.value.splice(index, 1);
          filterFollowedUsers(); 
        }
      } catch (error) {
        console.error('Failed to unfollow user:', error);
      }
    };

    const isFollowed = (userId) => {
      return followedUsers.value.includes(userId);
    };

    const fetchLikedPosts = async () => {
      try {
        isLoadingLikedPosts.value = true;
        const response = await axios.get('https://swinconnectserver-production.up.railway.app/liked-posts', {
          params: { userId: userId.value }
        });

        const likedPostsData = response.data.map(data => data.post);

        for (const post of likedPostsData) {
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

        likedPosts.value = likedPostsData;
      } catch (error) {
        console.error('Failed to fetch liked posts:', error);
      } finally {
        isLoadingLikedPosts.value = false;
      }
    };

    const updatePostLikes = (postId, likes) => {
      const post = posts.value.find(p => p.id === postId);
      if (post) {
        post.likes = likes;
      }
    
      const likedPost = likedPosts.value.find(p => p.id === postId);
      if (likedPost) {
        likedPost.likes = likes;
      }
    };

    const updatePostComments = (postId, comments) => {
      const post = posts.value.find(p => p.id === postId);
      if (post) {
        post.comments = comments;
      }
    
      const likedPost = likedPosts.value.find(p => p.id === postId);
      if (likedPost) {
        likedPost.comments = comments;
      }
    };

    const goToUserProfile = (userId) => {
      window.location.href = `/user-profile/${userId}`;
    };

    onMounted(() => {
      fetchPosts();
      fetchFollowedUsers();
      fetchLikedPosts();
      allUsers();
    });

    return {
      activeTab,
      posts,
      newPost,
      users,
      followedUsers,
      likedPosts,
      createdPostId,
      userId,
      isLoadingPosts,
      isLoadingFollowedUsers,
      isLoadingLikedPosts,
      createPost,
      updatePostLikes,
      updatePostComments,
      goToUserProfile,
      followUser,
      unfollowUser,
      isFollowed,
      followedUsersList,
    };
  }
};
</script>

<style>
.nav-tabs .nav-link.active {
  background-color: #007bff;
  color: white;
}
.nav-tabs .nav-link {
  cursor: pointer;
}
.card {
  cursor: pointer;
}
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
