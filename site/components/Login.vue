<template>
    <button class="loginButton" :class="{ loggedOff: !isLoggedIn, loggedIn: isLoggedIn }" @click="login(false)">
        {{ loginButtonValue }}
    </button>
    <button class="loginAvatar" :class="{ loggedOff: !isLoggedIn, loggedIn: isLoggedIn, [darkModeClass]: true }" :style="{ backgroundImage: `url(${loginAvatarImageSource})` }">
        <img id="loginAvatarImage" :class="{ loggedOff: !isLoggedIn, loggedIn: isLoggedIn, [darkModeClass]: true }" src="../assets/icon/user.png">
    </button>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
const botid = import.meta.env.VITE_BOT_ID;
const botredirect = import.meta.env.VITE_BOT_REDIRECT;

const darkModeClass = ref(localStorage.getItem("colorTheme") === "dark" ? "darkMode" : "lightMode")

const router = useRouter();
const route = useRoute();
const emit = defineEmits(["alert", "popup"]);

const loginButtonValue = ref("PŘIHLÁSIT");
const loginAvatarImageSource = ref(false);
const isLoggedIn = ref(false);

const lsGetItem = (id) => {
    return window.localStorage.getItem(id);
};

const lsSetItem = (id, value) => {
    return window.localStorage.setItem(id, value);
};

const lsRemItem = (id) => {
    return window.localStorage.removeItem(id);
};

const getToken = async (code) => {
    const result = await fetch("/api/v2/login/getToken", {
        method: "POST",
        body: JSON.stringify({ code }),
        headers: {
            "Content-Type": "application/json",
        },
    });

    const resultJson = await result.json();
    lsSetItem("access_token", resultJson.access_token);
    lsSetItem("token_type", resultJson.token_type);
    return resultJson;
};

const getMe = async (tokenType, accessToken) => {
    const result = await fetch("/api/v1/login/getMe", {
        headers: {
            authorization: `${tokenType} ${accessToken}`,
        },
    });

    const resultJson = await result.json();

    isLoggedIn.value = true;
    loginButtonValue.value = resultJson.user.global_name;
    loginAvatarImageSource.value = `https://cdn.discordapp.com/avatars/${resultJson.user.id}/${resultJson.user.avatar}.png?size=100`;
    return resultJson;
};

onMounted(async () => {
    const fragment = new URLSearchParams(window.location.search);

    if (fragment.get("error")) {
        router.replace({ path: route.path });
        emit("alert", { h: "Chyba přihlášení!", msg: `<b>${fragment.get("error")}</b>\n<i>${fragment.get("error_description")}</i>` });
    } else if (fragment.get("code") && !lsGetItem("access_token")) {
        router.replace({ path: route.path });
        const result = await getToken(fragment.get("code"));
        if (result.token_type && result.access_token) {
            lsSetItem("token_type", result.token_type);
            lsSetItem("access_token", result.access_token);
            lsSetItem("expiry", (Date.now() + (result.expires_in * 1000)));

            await getMe(result.token_type, result.access_token);

            emit("popup", "Přihlášen(a)!");
        }
    } else if (lsGetItem("token_type") && lsGetItem("access_token")) {
        if (!lsGetItem("expiry")) login(3);
        if (lsGetItem("expiry") < Date.now()) login(4);
        await getMe(lsGetItem("token_type"), lsGetItem("access_token"));
    }
});

async function login(type) {
    if (!type) {
        if (lsGetItem("token_type") && lsGetItem("access_token")) {
            const result = await fetch("/api/v1/login/revokeToken", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "authorization": lsGetItem("token_type") + " " + lsGetItem("access_token")
                },
            });

            if (result.ok) {
                const res = await result.json();
                if (res.code === 200) {
                    lsRemItem("token_type");
                    lsRemItem("access_token");
                    lsRemItem("expiry");

                    isLoggedIn.value = false;
                    loginAvatarImageSource.value = false;
                    loginButtonValue.value = "PŘIHLÁSIT";

                    emit("popup", "Odhlášen(a)!");
                } else {
                    emit("alert", { h: "Chyba přihlášení!", msg: "Více najdeš v konzoli." });
                    console.log("[LEA-Bot / API Logout] Vznikla chyba! Token se nepodařilo zrušit.");
                    console.log("[LEA-Bot / API Logout] Discord API kód: " + res.code);
                }
            } else {
                emit("alert", { h: "Chyba přihlášení!", msg: "Více najdeš v konzoli." });
                console.log("[LEA-Bot / API Logout] Vznikla chyba! Token se nepodařilo zrušit.");
                console.log("[LEA-Bot / API Logout] API nebyla kontaktována. Kód: " + result.status);
            }
        } else {
            window.location.href = `https://discord.com/oauth2/authorize?client_id=${botid}&response_type=code&redirect_uri=${encodeURIComponent(botredirect)}&scope=identify+guilds.members.read`;
        }
    } else if (type === 1) window.location.href = `https://discord.com/oauth2/authorize?client_id=${botid}&response_type=code&redirect_uri=${encodeURIComponent(botredirect)}&scope=identify+guilds.members.read`;
    else if (type === 2) {
        if (lsGetItem("token_type") && lsGetItem("access_token")) {
            const result = await fetch("/api/v1/login/revokeToken", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "authorization": lsGetItem("token_type") + " " + lsGetItem("access_token")
                },
            });

            if (result.ok) {
                const res = await result.json();
                if (res.code === 200) {
                    lsRemItem("token_type");
                    lsRemItem("access_token");
                    lsRemItem("expiry");

                    isLoggedIn.value = false;
                    loginAvatarImageSource.value = false;
                    loginButtonValue.value = "PŘIHLÁSIT";

                    emit("popup", "Odhlášen(a)!");
                } else {
                    emit("alert", { h: "Chyba přihlášení!", msg: "Více najdeš v konzoli." });
                    console.log("[LEA-Bot / API Logout] Vznikla chyba! Token se nepodařilo zrušit.");
                    console.log("[LEA-Bot / API Logout] Discord API kód: " + res.code);
                }
            } else {
                emit("alert", { h: "Chyba přihlášení!", msg: "Více najdeš v konzoli." });
                console.log("[LEA-Bot / API Logout] Vznikla chyba! Token se nepodařilo zrušit.");
                console.log("[LEA-Bot / API Logout] API nebyla kontaktována. Kód: " + result.status);
            }
        }
    } else if (type === 3) {
        if (lsGetItem("token_type") && lsGetItem("access_token")) {
            const result = await fetch("/api/v1/login/revokeToken", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "authorization": lsGetItem("token_type") + " " + lsGetItem("access_token")
                },
            });

            if (result.ok) {
                const res = await result.json();
                if (res.code === 200) {
                    lsRemItem("token_type");
                    lsRemItem("access_token");
                    lsRemItem("expiry");

                    isLoggedIn.value = false;
                    loginAvatarImageSource.value = false;
                    loginButtonValue.value = "PŘIHLÁSIT";

                    emit("alert", { h: "Je tu aktualizace!", msg: "Byl(a) jsi odhlášen(a) kvůli aktualizaci API!\nPřihlaš s prosím znova!" });
                } else {
                    emit("alert", { h: "Chyba přihlášení!", msg: "Více najdeš v konzoli." });
                    console.log("[LEA-Bot / API Logout] Vznikla chyba! Token se nepodařilo zrušit.");
                    console.log("[LEA-Bot / API Logout] Discord API kód: " + res.code);
                }
            } else {
                emit("alert", { h: "Chyba přihlášení!", msg: "Více najdeš v konzoli." });
                console.log("[LEA-Bot / API Logout] Vznikla chyba! Token se nepodařilo zrušit.");
                console.log("[LEA-Bot / API Logout] API nebyla kontaktována. Kód: " + result.status);
            }
        }
    } else if (type === 4) {
        if (lsGetItem("expiry") > Date.now()) return login(2);
        lsRemItem("token_type");
        lsRemItem("access_token");
        lsRemItem("expiry");

        isLoggedIn.value = false;
        loginAvatarImageSource.value = false;
        loginButtonValue.value = "PŘIHLÁSIT";

        emit("alert", { h: "Přihlášení vypršelo!", msg: "Tvůj přihlašovací token po týdnu vypršel!\nProsím, přihlaš se znova!" });
    }
};
</script>