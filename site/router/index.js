import { createRouter, createWebHistory } from 'vue-router';

import viewsHome from "../views/Home.vue";
import viewsLSPD from "../views/LSPD.vue";
import viewsLSSD from "../views/LSSD.vue";
import viewsSAHP from "../views/SAHP.vue";
import viewsBlacklist from "../views/Blacklist.vue";
import views404 from "../views/404.vue";

import logo from "../assets/logo/leabot.png";
import badgeLSPD from "../assets/logo/LSPD.png";
import badgeLSSD from "../assets/logo/LSSD.png";
import badgeSAHP from "../assets/logo/SAHP.png";

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: "/", name: "Domů", component: viewsHome
		},
		{
			path: "/lspd", name: "LSPD", component: viewsLSPD, meta: {
				title: "LSPD", image: badgeLSPD, color: "#ffc935"
			},
		},
		{
			path: "/lssd", name: "LSSD", component: viewsLSSD, meta: {
				title: "LSSD", image: badgeLSSD, color: "#bd8131"
			},
		},
		{
			path: "/sahp", name: "SAHP", component: viewsSAHP, meta: {
				title: "SAHP", image: badgeSAHP, color: "#294a73"
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

	/*const ogImage = document.querySelector('meta[property="og:image"]');
	//<meta id="themeColor" name="theme-color" content="#ffffff">

	if (ogImage) ogImage.setAttribute("content", to.meta.image || logo);
	else {
		const newOgImage = document.createElement("meta");
		newOgImage.setAttribute("property", "og:image");
		newOgImage.setAttribute("content", to.meta.image || logo);
		document.head.appendChild(newOgImage);
	}

	const themeColor = document.querySelector('meta[name="theme-color"]');
	if (themeColor) themeColor.setAttribute("content", to.meta.color || "#ffffff");
	else {
		const newThemeColor = document.createElement("meta");
		newThemeColor.setAttribute("name", "theme-color");
		newThemeColor.setAttribute("content", to.meta.color || "#ffffff");
		document.head.appendChild(newThemeColor);
	}*/

	next();
});

export default router;