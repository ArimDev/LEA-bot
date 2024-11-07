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
				<li class="LSPD">
					<RouterLink to="/lspd">LSPD</RouterLink>
				</li>
				<li class="LSSD">
					<RouterLink to="/lssd">LSSD</RouterLink>
				</li>
				<li class="SAHP">
					<RouterLink to="/sahp">SAHP</RouterLink>
				</li>
				<li>
					<RouterLink to="/blacklist">BLACKLIST</RouterLink>
				</li>
				<li><span class="disabled">DIVIZE</span></li>
			</div>
			<div class="centerMenu">
				<a class="homeLink" href="/"><img src="./assets/logo/leabot.png" width="75"></a>
			</div>
			<div class="rightMenu">
				<Login @alert="openPopBox" @popup="popup" />
			</div>
		</header>

		<main class="content">
			<RouterView />
		</main>

		<footer class="footer">
			<p>© 2024 <a target="_blank" href="https://github.com/Azator-Entertainment/LEA-bot">LEA-Bot</a> vytvořil <a target="_blank" href="https://petyxbron.cz/p">PetyXbron (b1ngo)</a></p>
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