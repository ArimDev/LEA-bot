<script setup>
import DefaultTheme from 'vitepress/theme';
import './LeaLayout.css';
import { onMounted, ref } from "vue";

const { Layout } = DefaultTheme;

const displayConsent = ref(false);

onMounted(() => {
    displayConsent.value = localStorage.getItem("cookiesAccepted") === null;
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