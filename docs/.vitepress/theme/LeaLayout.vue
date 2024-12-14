<script setup>
import DefaultTheme from 'vitepress/theme';
import { ref } from "vue";

const { Layout } = DefaultTheme;

const displayConsent = ref(localStorage.getItem("cookiesAccepted") === null);

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
</script>

<template>
    <Layout>
        <template #layout-top>
            <div v-show="displayConsent" class="consentBar">
                <div class="consentBarContent">
                    <p>
                        Tato stránka používá soubory <b>cookies</b>.
                        Kliknutím na tlačítko <b>„Povolit“</b> souhlasíš
                        <br>s využívaním cookies a dalších údajů k <b>nezbytnému</b>,
                        <b>analytickému</b> a <b>marketingovému</b> použití.
                    </p>
                    <div class="consentBarButtons">
                        <button @click="consent(true)">Povolit</button>
                        <button @click="consent(false)">Odmítnout</button>
                    </div>
                </div>
            </div>
        </template>
    </Layout>
</template>

<style>
.consentBar {
    position: fixed;
    width: 73%;
    bottom: 0;
    margin-bottom: 30px;
    z-index: 99;
    background-color: var(--vp-sidebar-bg-color);
    color: var(--vp-c-text-1);
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    border-radius: 20px;
    margin-left: 14%;
    margin-right: 14%;
}

.consentBarContent {
    padding: 21px;
    text-align: left;
    font-size: 15px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

.consentBarContent strong {
    color: var(--vp-c-text-1);
}

.consentBarButtons {
    display: flex;
    gap: 10px;
}

.consentBarButtons button {
    font-size: 16px;
    font-weight: bold;
    text-decoration: none;
    color: var(--vp-c-text-1);
    border-radius: 25px;
    border: 2px solid var(--vp-c-text-1);
    padding: 10px 15px;
    background-color: transparent;
    transition: background-color 0.5s, color 0.5s;
    cursor: pointer;
}

.consentBarButtons button:hover {
    background-color: var(--vp-c-text-1);
    color: var(--vp-c-bg);
}

@media (max-width: 800px) {
    .consentBarContent {
        flex-direction: column;
        gap: 1rem;
    }

    .consentBar {
        margin-left: 0;
        margin-right: 0;
        width: 100%;
    }
}

@media (min-width: 1025px) and (max-width: 1279px) {
    .consentBarContent {
        flex-direction: column;
        gap: 1rem;
    }

    .consentBar {
        margin-left: 0;
        margin-right: 0;
        width: 100%;
    }
}
</style>