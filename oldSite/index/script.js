let accessToken, tokenType, expiry;
const getToken = async (code) => {
    const result = await fetch('/api/v1/login/getToken', {
        method: 'POST',
        body: JSON.stringify({ code }),
        headers: {
            "Content-Type": "application/json",
        },
    });

    const resultJson = await result.json();
    window.localStorage.setItem("access_token", resultJson.access_token);
    window.localStorage.setItem("token_type", resultJson.token_type);
    return resultJson;
};

const getMe = async (tokenType, accessToken) => {
    const result = await fetch('/api/v1/login/getMe', {
        headers: {
            authorization: `${tokenType} ${accessToken}`,
        },
    });

    const resultJson = await result.json();

    document.getElementById('loginButton').innerText = `ODHLÁSIT: ${resultJson.user.global_name}`;
    return resultJson;
};

window.onload = async () => {
    const bgs = [
        "ps3_306.jpg",
        "ps3_309.jpg",
        "ps3_316.jpg",
        "ps3_568.jpg",
        "ps3_731.jpg",
        "ps3_750.jpg",
        "ps3_820.jpg",
        "ps3_821.jpg",
        "ps3_822.jpg",
        "ps3_823.jpg",
        "ps3_824.jpg",
        "ps3_825.jpg",
        "Snimek_obrazovky_2836.png",
        "image.png"
    ];

    let imagesLoaded = 0;
    let sbg = [];
    let bgi = 0;

    bgs.forEach(url => {
        const img = new Image();
        img.onload = () => {
            imagesLoaded++;
            if (imagesLoaded === bgs.length) {
                sbg = bgs.sort(() => Math.random() - 0.5);
                changeBackground();
            }
        };
        img.src = `/old/index/assets/${url}`;
    });

    function changeBackground() {
        document.body.style.backgroundImage = `url('/old/index/assets/${sbg[bgi]}')`;
        bgi = (bgi + 1) % sbg.length;
        setTimeout(changeBackground, 3500);
    }

    accessToken = window.localStorage.getItem("access_token");
    tokenType = window.localStorage.getItem("token_type");
    expiry = window.localStorage.getItem("expiry");

    const fragment = new URLSearchParams(window.location.search);
    const code = fragment.get('code');

    if (!code && !accessToken) {
        const cssLoginButton = document.getElementById('loginButton');
        cssLoginButton.addEventListener('mouseenter', () => {
            cssLoginButton.style.background = '#57F287';
            cssLoginButton.style.color = 'black';
        });
        cssLoginButton.addEventListener('mouseleave', () => {
            cssLoginButton.style.background = '';
            cssLoginButton.style.color = '';
        });
    };

    if (code && !accessToken) {
        window.history.replaceState({}, document.title, "/");
        const result = await getToken(code);
        if (result.token_type && result.access_token) {
            window.localStorage.setItem("token_type", result.token_type);
            window.localStorage.setItem("access_token", result.access_token);
            window.localStorage.setItem("expiry", (Date.now() + (result.expires_in * 1000)));

            window.location.reload();
            alert("Přihlášen(a)!");
        }
    }
    if (tokenType && accessToken) {
        const cssLoginButton = document.getElementById('loginButton');
        cssLoginButton.addEventListener('mouseenter', () => {
            cssLoginButton.style.background = '#ED4245';
            cssLoginButton.style.color = 'black';
        });
        cssLoginButton.addEventListener('mouseleave', () => {
            cssLoginButton.style.background = '';
            cssLoginButton.style.color = '';
        });
        getMe(tokenType, accessToken);
        if (!expiry) loginButton(3);
        if (expiry < Date.now()) loginButton(4);
    }
};

async function loginButton(type) {
    if (!type) {
        if (tokenType && accessToken) {
            const result = await fetch('/api/v1/login/revokeToken', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "authorization": tokenType + " " + accessToken
                },
            });

            if (result.ok) {
                const res = await result.json();
                if (res.code === 200) {
                    window.localStorage.removeItem("token_type");
                    window.localStorage.removeItem("access_token");
                    window.localStorage.removeItem("expiry");
                    window.location.reload();
                    alert("Odhlášen(a)!");
                } else {
                    alert("Chyba! Více v F12 konzoli.");
                    console.log("[LEA-Bot / API Logout] Vznikla chyba! Token se nepodařilo zrušit.");
                    console.log("[LEA-Bot / API Logout] Discord API kód: " + res.code);
                }
            } else {
                alert("Chyba!");
                console.log("[LEA-Bot / API Logout] Vznikla chyba! Token se nepodařilo zrušit.");
                console.log("[LEA-Bot / API Logout] API nebyla kontaktována. Kód: " + result.status);
            }
        } else {
            window.location.href = "https://discord.com/oauth2/authorize?client_id=1170346450417369088&response_type=code&redirect_uri=https%3A%2F%2FDOMAIN&scope=identify+guilds.members.read";
        }
    } else if (type === 1) window.location.href = "https://discord.com/oauth2/authorize?client_id=1170346450417369088&response_type=code&redirect_uri=https%3A%2F%2FDOMAIN&scope=identify+guilds.members.read";
    else if (type === 2) {
        if (tokenType && accessToken) {
            const result = await fetch('/api/v1/login/revokeToken', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "authorization": tokenType + " " + accessToken
                },
            });

            if (result.ok) {
                const res = await result.json();
                if (res.code === 200) {
                    window.localStorage.removeItem("token_type");
                    window.localStorage.removeItem("access_token");
                    window.localStorage.removeItem("expiry");
                    window.location.reload();
                    alert("Odhlášen(a)!");
                } else {
                    alert("Chyba! Více v F12 konzoli.");
                    console.log("[LEA-Bot / API Logout] Vznikla chyba! Token se nepodařilo zrušit.");
                    console.log("[LEA-Bot / API Logout] Discord API kód: " + res.code);
                }
            } else {
                alert("Chyba!");
                console.log("[LEA-Bot / API Logout] Vznikla chyba! Token se nepodařilo zrušit.");
                console.log("[LEA-Bot / API Logout] API nebyla kontaktována. Kód: " + result.status);
            }
        }
    } else if (type === 3) {
        if (tokenType && accessToken) {
            const result = await fetch('/api/v1/login/revokeToken', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "authorization": tokenType + " " + accessToken
                },
            });

            if (result.ok) {
                const res = await result.json();
                if (res.code === 200) {
                    window.localStorage.removeItem("token_type");
                    window.localStorage.removeItem("access_token");
                    window.localStorage.removeItem("expiry");
                    window.location.reload();
                    alert("Byl(a) jsi odhlášen(a) kvůli aktualizaci API!\nPřihlaš s prosím znova!");
                } else {
                    alert("Chyba! Více v F12 konzoli.");
                    console.log("[LEA-Bot / API Logout] Vznikla chyba! Token se nepodařilo zrušit.");
                    console.log("[LEA-Bot / API Logout] Discord API kód: " + res.code);
                }
            } else {
                alert("Chyba!");
                console.log("[LEA-Bot / API Logout] Vznikla chyba! Token se nepodařilo zrušit.");
                console.log("[LEA-Bot / API Logout] API nebyla kontaktována. Kód: " + result.status);
            }
        }
    } else if (type === 4) {
        if (expiry > Date.now()) return loginButton(2);
        window.localStorage.removeItem("token_type");
        window.localStorage.removeItem("access_token");
        window.localStorage.removeItem("expiry");

        window.location.reload();
        alert("Tvůj přihlašovací token po týdnu vypršel!\nProsím, přihlaš se znova!");
    }
}