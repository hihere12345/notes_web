import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../views/LoginPage.vue';
import RegisterPage from '../views/RegisterPage.vue';
import NotesPage from '../views/NotesPage.vue';
import { getToken, clearToken } from '../auth';

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginPage,
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
  },
  {
    path: '/notes',
    name: 'Notes',
    component: NotesPage,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const token = getToken();
    if (token) {
      next();
    } else {
      clearToken();
      next({ name: 'Login' });
    }
  } else {
    next();
  }
});

export default router;