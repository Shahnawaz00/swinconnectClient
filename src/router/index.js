import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/HomeView.vue';
import Login from '../views/LoginView.vue';
import Signup from '../views/SignupView.vue';
import News from '../views/NewsView.vue';
import Accounts from '../views/AccountsView.vue';
import MyProfile from '../views/MyProfile.vue';
import ManageAccount from '../views/ManageAccount.vue';
import Feed from '../views/FeedView.vue';
import PostDetails from '@/views/PostDetails.vue';
import UserProfile from '@/views/UserProfile.vue'; 

const routes = [
    { path: '/', name: 'Home', component: Home },
    { path: '/home', name: 'Feed', component: Feed },
    { path: '/news', name: 'News', component: News },
    { path: '/accounts', name: 'Accounts', component: Accounts },
    { path: '/my-profile', name: 'MyProfile', component: MyProfile },
    { path: '/manage-account', name: 'ManageAccount', component: ManageAccount },
    { path: '/login', name: 'Login', component: Login },
    { path: '/signup', name: 'Signup', component: Signup },
    { path: '/post/:id', component: PostDetails },
    { path: '/user-profile/:userId', component: UserProfile, name: 'UserProfile', props: true}
  ];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

router.beforeEach((to, from, next) => {
    const publicPages = ['/login', '/signup'];
    const authRequired = !publicPages.includes(to.path);
    const loggedIn = localStorage.getItem('user');
  
    if (authRequired && !loggedIn) {
      return next('/login');
    }
  
    next();
  });

export default router;
