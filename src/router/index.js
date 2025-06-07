import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../views/LoginPage.vue';
import RegisterPage from '../views/RegisterPage.vue';
import NotesPage from '../views/NotesPage.vue';

const routes = [
  {
    path: '/',
    name: 'LoginRoot',
    component: LoginPage,
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
  },
  {
    path: '/register', // **新增：注册页面路由**
    name: 'Register',
    component: RegisterPage,
  },
  {
    path: '/notes',
    name: 'Notes',
    component: NotesPage,
    meta: { requiresAuth: true }, // 需要认证才能访问此路由
  },
  // 可以添加其他路由...
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 全局导航守卫，用于检查 token
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('user_token');
    if (token) {
      next(); // 存在 token，允许访问
    } else {
      next({ name: 'Login' }); // 不存在 token，重定向到登录页
    }
  } else {
    next(); // 不需要认证的页面直接放行
  }
});

export default router;