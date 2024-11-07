<template>
    <div class="center">
        <p class="beforeHeader">Hledal jsi, až jsi dohledal...</p>
        <h1>404 - Nenalezeno</h1>
        <p>
            <b>Tady</b> je <b>prázdno.</b>
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
document.getElementById("ogTitle").setAttribute("content", "LEA-Bot Tabulky | 404");
</script>