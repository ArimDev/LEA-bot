<script setup>
import TableLSPD from '../components/TableLSPD.vue';

document.getElementById("ogDescription").setAttribute("content", "");
document.getElementById("themeColor").setAttribute("content", "#ffc935");

import icon from "../assets/logo/LSPD.png";
document.getElementById("twitterImage").setAttribute("content", icon);
document.getElementById("ogImage").setAttribute("content", icon);
document.getElementById("ogTitle").setAttribute("content", "LEA-Bot Tabulky | LSPD");
</script>

<template>
	<TableLSPD />
</template>

<style>
.content {
	padding: 0;
}
</style>