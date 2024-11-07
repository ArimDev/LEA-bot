<script setup>
import TableSAHP from '../components/TableSAHP.vue';

document.getElementById("ogDescription").setAttribute("content", "");
document.getElementById("themeColor").setAttribute("content", "#294a73");

import icon from "../assets/logo/SAHP.png";
document.getElementById("twitterImage").setAttribute("content", icon);
document.getElementById("ogImage").setAttribute("content", icon);
document.getElementById("ogTitle").setAttribute("content", "LEA-Bot Tabulky | SAHP");
</script>

<template>
	<TableSAHP />
</template>

<style>
.content {
	padding: 0;
}
</style>