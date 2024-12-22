<template>
	<PopUp ref="popupRef">
		<h1>{{ popupText }}</h1>
	</PopUp>
	<PopBox v-show="displayPopBox" @close="closePopBox">
		<h1>{{ popboxContent.heading }}</h1>
		<p v-html="popboxContent.message"></p>
	</PopBox>
	<ConsentBar v-show="displayConsent" @consent="consent">
		<h1>{{ consentContent.heading }}</h1>
		<p v-html="consentContent.message"></p>
	</ConsentBar>
	<div class="wrapper">
		<header class="header">
			<div class="routerMenu">
				<li>
					<RouterLink to="/">DOMŮ</RouterLink>
				</li>
				<li><span class="disabled">STATISTIKY</span></li>
				<li>
					<RouterLink to="/blacklist">BLACKLIST</RouterLink>
				</li>
				<li><span class="disabled">GALERIE</span></li>
			</div>
			<div class="centerMenu">
				<a class="homeLink" href="/"><img class="webLogo" src="./assets/logo/leabot.png"></a>
			</div>
			<div class="rightMenu">
				<li class="LSPD">
					<span class="disabled">LSPD</span>
				</li>
				<li class="LSSD">
					<RouterLink to="/lssd">LSSD</RouterLink>
				</li>
				<li class="SAHP">
					<RouterLink to="/sahp">SAHP</RouterLink>
				</li>
				<div class="loginSide">
					<Login @alert="openPopBox" @popup="popup" />
				</div>
			</div>
		</header>

		<main class="content">
			<RouterView />
		</main>

		<footer class="footer">
			<div class="left">
				<button @click="toggleDarkMode()">
					<img id="darkModeImage" :class="{ darkMode }" src="/media/icon/darkmode.png" width="20" height="20">
				</button>
				<button>
					<a target="_self" href="/docs/">
						<img id="docsImage" :class="{ darkMode }" src="/media/icon/book.png" width="20" height="20">
					</a>
				</button>
				<button>
					<a target="_blank" href="https://discord.com/invite/PYTqqhWad2">
						<img id="discordImage" :class="{ darkMode }" src="/media/icon/discord.png" width="20" height="20">
					</a>
				</button>
				<button>
					<a target="_blank" href="https://github.com/Azator-Entertainment/LEA-bot">
						<img id="githubImage" :class="{ darkMode }" src="/media/icon/github.png" width="20" height="20">
					</a>
				</button>
			</div>
			<div class="center">
				<p>© 2024 <a target="_blank" href="https://github.com/Azator-Entertainment/LEA-bot">LEA-Bot</a> vytvořil <a target="_blank" href="https://petyxbron.cz/p">PetyXbron (b1ngo)</a></p>
			</div>
			<div class="right">
				<a target="_blank" href="https://github.com/ArimDev/LEA-bot/blob/master/docs/usage.md">Jak používat</a>
				|
				<a target="_blank" href="https://github.com/ArimDev/LEA-bot/blob/master/docs/terms-of-use.md">Podmínky použití</a>
				|
				<a target="_blank" href="https://github.com/ArimDev/LEA-bot/blob/master/docs/privacy-policy.md">Zásady ochrany osobních údajů</a>
			</div>
		</footer>
	</div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router';
import './assets/style/frame.css';
import './assets/style/frameMedia.css';
import Login from './components/Login.vue';
import PopBox from './components/PopBox.vue';
import PopUp from './components/PopUp.vue';
import ConsentBar from './components/ConsentBar.vue';
import darkModePNG from './assets/icon/darkmode.png';
import lightModePNG from './assets/icon/lightmode.png';
import { onMounted, ref } from "vue";

onMounted(() => {
	const darkModeState = localStorage.getItem("colorTheme") === "dark" ? "dark" : "light";
	document.documentElement.setAttribute(
		"data-theme",
		darkModeState
	);
	if (darkModeState === "dark")
		document.getElementById('darkModeImage').src = lightModePNG;
});

const displayPopBox = ref(false);
const popboxContent = ref({ heading: "Uvítání!", message: "Ahoj světe!" });

function openPopBox({ h, msg }) {
	popboxContent.value.heading = h;
	popboxContent.value.message = msg.replace(/\n/g, '<br>');
	displayPopBox.value = true;
}

function closePopBox() {
	displayPopBox.value = false;
}

const displayConsent = ref(localStorage.getItem("cookiesAccepted") === null);
const consentContent = ref({
	heading:
		"Pojďme společně vylepšit Tabulky!",
	message:
		`Tato stránka používá soubory <b>cookies</b>.
		Kliknutím na tlačítko <b>„Jdeme na to“</b>
		souhlasíš s využívaním cookies<br>a dalších údajů k nezbytnému,
		analytickému a marketingovému použití.`
});

function consent(consent) {
	localStorage.setItem("cookiesAccepted", consent);
	const state = consent ? "granted" : "denied";
	gtag('consent', 'update', {
		'ad_storage': state,
		'ad_user_data': state,
		'ad_personalization': state,
		'analytics_storage': state
	});
	displayConsent.value = false;
}

const popupRef = ref(null);
const popupText = ref("Ahoj světe!");

function popup(msg) {
	popupText.value = msg;
	popupRef.value.show();
}

const darkMode = ref(localStorage.getItem("colorTheme") === "dark");

function toggleDarkMode() {
	let darkModeState = localStorage.getItem("colorTheme");

	const darkModeImage = document.getElementById('darkModeImage');
	const githubImage = document.getElementById('githubImage');
	const loginAvatarImage = document.getElementById('loginAvatarImage');

	if (darkModeState === "dark") {
		localStorage.setItem("colorTheme", "light");
		document.documentElement.setAttribute("data-theme", "light");
		darkMode.value = false;

		darkModeImage.src = darkModePNG;
		darkModeImage.classList.toggle('darkMode');
		githubImage.classList.toggle('darkMode');
		loginAvatarImage.classList.toggle('darkMode');
	} else {
		localStorage.setItem("colorTheme", "dark");
		document.documentElement.setAttribute("data-theme", "dark");
		darkMode.value = true;

		darkModeImage.src = lightModePNG;
		darkModeImage.classList.toggle('darkMode');
		githubImage.classList.toggle('darkMode');
		loginAvatarImage.classList.toggle('darkMode');
	}
}
</script>