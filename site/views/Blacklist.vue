<script setup>
import Blacklist from '../components/Blacklist.vue';
</script>

<template>
	<Blacklist />
</template>

<style>
.content {
	padding: 0;
}
</style>

<script>
document.getElementById("ogDescription").setAttribute("content", "Digitální organizace státních ozbrojených složek LEA.");
document.getElementById("themeColor").setAttribute("content", "#ffffff");

import icon from "../assets/logo/leabot.png";
document.getElementById("twitterImage").setAttribute("content", icon);
document.getElementById("ogImage").setAttribute("content", icon);
document.getElementById("ogTitle").setAttribute("content", "LEA-Bot Tabulky | Blacklist");
</script>