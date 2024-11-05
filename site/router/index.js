import { createRouter, createWebHistory } from 'vue-router';

import viewsHome from "../views/Home.vue";
import viewsLSPD from "../views/LSPD.vue";
import viewsLSSD from "../views/LSSD.vue";
import viewsBlacklist from "../views/Blacklist.vue";
import views404 from "../views/404.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/", name: "Domů", component: viewsHome
    },
    {
      path: "/lspd", name: "LSPD", component: viewsLSPD, meta: {
        title: "LSPD"
      },
    },
    {
      path: "/lssd", name: "LSSD", component: viewsLSSD, meta: {
        title: "LSSD"
      },
    },
    {
      path: "/blacklist", name: "Blacklist", component: viewsBlacklist, meta: {
        title: "Blacklist"
      },
    },
    {
      path: "/:pathMatch(.*)*", name: "404", component: views404, meta: {
        title: "404"
      },
    }
  ]
});

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `LEA Bot | ${to.meta.title}` : "LEA Bot";
  next();
});

export default router;