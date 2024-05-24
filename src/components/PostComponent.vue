<template>
  <div class="card mt-3" @click="viewPostDetails">
    <div class="card-body">
      <div class="d-flex justify-content-between">
            <h5 class="card-title">{{ post.title }}</h5>
            <span>{{ new Date(post.date).toLocaleDateString() }}</span> 
          </div>
      <p class="card-text">{{ post.content }}</p>
      <div class="d-flex justify-content-between align-items-center">
        <button @click.stop="viewPostDetails" class="btn btn-primary">View Post</button> 

        <div>
          <span class="m-3">{{ localLikes.length }} Likes</span>
         <span>{{ localComments.length }} Comments</span>
        </div>
        
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'PostComponent',
  props: {
    post: {
      type: Object,
      required: true
    },
    userId: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const newComment = ref('');
    const localLikes = ref([]);
    const localComments = ref([]);
    const router = useRouter();

    watch(
      () => props.post,
      (newPost) => {
        localLikes.value = newPost.likes || [];
        localComments.value = newPost.comments || [];
      },
      { immediate: true, deep: true }
    );

    const likePost = async () => {
      try {
        await axios.post('https://swinconnectserver-production.up.railway.app/like', {
          postId: props.post.id,
          userId: props.userId
        });
        localLikes.value.push({ userId: props.userId }); 
        props.$emit('update-likes', props.post.id, localLikes.value);
      } catch (error) {
        console.error('Failed to like post:', error);
      }
    };

    const viewPostDetails = () => {
      router.push({ path: `/post/${props.post.id}` });
    };

    const viewComments = () => {
      // Redirect to the post details page with comments expanded
      router.push({ path: `/post/${props.post.id}`, query: { comments: true } });
    };

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleString();
    };

    return {
      newComment,
      localLikes,
      localComments,
      likePost,
      viewPostDetails,
      viewComments,
      formatDate
    };
  }
};
</script>

<style scoped>
/* Add your styles here */
</style>
