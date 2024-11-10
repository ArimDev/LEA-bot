<template>
	<PopUp ref="popupRef">
		<h1>{{ popupText }}</h1>
	</PopUp>
	<PopBox v-show="displayPopBox" @close="closePopBox">
		<h1>{{ popboxContent.heading }}</h1>
		<p v-html="popboxContent.message"></p>
	</PopBox>
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
				<a class="homeLink" href="/"><img src="./assets/logo/leabot.png" width="75"></a>
			</div>
			<div class="rightMenu">
				<li class="LSPD">
					<RouterLink to="/lspd">LSPD</RouterLink>
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
				Exkluzivně pro <a target="_blank" href="https://nlmt.cc/#servers">VegasRP by Nolimit</a>
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
import Login from './components/Login.vue';
import PopBox from './components/PopBox.vue';
import PopUp from './components/PopUp.vue';
import { ref } from "vue";

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

const popupRef = ref(null);
const popupText = ref("Ahoj světe!");

function popup(msg) {
	popupText.value = msg;
	popupRef.value.show();
}
</script>