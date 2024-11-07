<template>
	<div class="center">
		<p class="beforeHeader"><b>VEGAS RP</b> vs <b>b1ngo</b></p>
		<h1>Law Enforcement Agencies - Bot</h1>
		<p>
			<b>LEA-Bot</b> slouží k digitální <b>organizaci</b> státních ozbrojených složek.
		</p>
		<p>
			<br>Součástí projektu je <b>Discord bot</b> s hl. ovládáním
			<br>a <b>webové stránky</b> k přehlednému zobrazení zaměstnanců v tabulkách.
			<br><br>Web je zabezpečen <b>přihlášením přes Discord</b> a zároveň kontroluje, zda-li je součástí Leadershipu.
		</p>
	</div>
</template>

<style scoped>
.center {
	text-align: center;
	display: flex;
	flex-direction: column;
	margin: auto;
}

.beforeHeader {
    margin-bottom: -30px;
}
</style>

<script>
document.getElementById("ogDescription").setAttribute("content", "Digitální organizace státních ozbrojených složek LEA.");
document.getElementById("themeColor").setAttribute("content", "#ffffff");

import icon from "../assets/logo/leabot.png";
document.getElementById("twitterImage").setAttribute("content", icon);
document.getElementById("ogImage").setAttribute("content", icon);
document.getElementById("ogTitle").setAttribute("content", "LEA-Bot Tabulky");
</script>