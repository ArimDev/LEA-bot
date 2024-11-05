var accessToken = window.localStorage.getItem("access_token");
tokenType = window.localStorage.getItem("token_type");
let timerStatus = 10;

document.addEventListener('DOMContentLoaded', async () => {
    console.log("[LEA-Bot] Stránka načtena!");
    console.log("[LEA-Bot] Spouštění funkcí...");

    const loadingPopup = document.getElementById('loadingPopup');
    const loadingText = document.getElementById('loadingText');
    const loadingTimer = document.getElementById('loadingTimer');
    const loadingButton = document.getElementById('loadingButton');
    const loader = document.querySelector('.loader');

    function updateTimer() {
        if (timerStatus > 0) {
            if (timerStatus !== 10) loadingTimer.textContent = timerStatus;
            timerStatus = timerStatus - 1;
            setTimeout(updateTimer, 1000);
        } else loadingTimer.textContent = "0";
    }

    if (window.localStorage.getItem("expiry") < Date.now()) {
        window.localStorage.removeItem("token_type");
        window.localStorage.removeItem("access_token");
        window.localStorage.removeItem("expiry");

        window.location.href = "/";
        return alert("Tvůj přihlašovací token po týdnu vypršel!\nProsím, přihlaš se znova!");
    }

    updateTimer();
    highlightTableRow();
    updateTime();

    loadingPopup.style.display = 'block';

    console.log("[LEA-Bot / API Login] Spouštění ověření...");
    const gen = await getData();

    if (!gen.failed && !!gen.workers.length) {
        console.log("[LEA-Bot / API Login] Úspěch! Přihlášen(a). Skipuji animace...");
        loadingPopup.style.display = 'none';

        insertTable(gen.workers);

        document.querySelector("#info-icon").src = `https://cdn.discordapp.com/guilds/${gen.guildID}/users/${gen.user.id}/avatars/${gen.member.avatar}.png?size=100`;
        document.querySelector("#login-icon").src = `https://cdn.discordapp.com/avatars/${gen.user.id}/${gen.user.avatar}.png?size=100`;
        document.querySelector("#info-name").textContent = gen.member.nickname;

        const loginBox = document.querySelector('.login-box');
        const loginBoxText = loginBox.querySelector("#login-box-text");
        loginBoxText.textContent = `Vítej zpět ${gen.user.displayName}!`;
        loginBox.classList.add('active');
        setTimeout(function () {
            loginBox.classList.remove('active');
        }, 4000);
    } else if (!gen.failed && !gen.workers.length) {
        loader.style.display = "none";
        loadingText.textContent = `[${gen.code}] ` + 'Chyba databáze!';
        loadingButton.style.display = "block";
    } else if (gen.failed) {
        if (!gen.loggedIn) {
            setTimeout(() => {
                loader.style.display = "none";
                loadingTimer.style.display = "none";
                loadingText.textContent = `[${gen.code}] ` + 'Nejsi přihlášen(a)!';
                //loadingText.textContent = 'Kontrola přístupu...';
                loadingButton.style.display = "block";
            }, 1500);
        } else if (!gen.verified) {
            setTimeout(() => {
                loader.style.display = "none";
                loadingTimer.style.display = "none";
                loadingText.textContent = `[${gen.code}] ` + 'Nemáš povolení!';
                loadingButton.style.display = "block";
            }, 1500);
        }
    }
});

function centerLoadingBox() {
    const loadingBox = document.querySelector('.loading-box');
    const windowHeight = window.innerHeight;
    const boxHeight = loadingBox.offsetHeight;
    const topPosition = (windowHeight - boxHeight) / 2;
    loadingBox.style.top = topPosition + 'px';
}

document.addEventListener('DOMContentLoaded', () => {
    centerLoadingBox();
});

window.addEventListener('resize', () => {
    centerLoadingBox();
});

function highlightTableRow() {
    const urlAnchor = window.location.hash.substring(1);

    if (urlAnchor) {
        const tableRow = document.getElementById(urlAnchor);
        if (tableRow) {
            tableRow.style.background = "#00a600";
            tableRow.style.color = "white";
            const tableRowHeader = tableRow.firstElementChild;
            if (tableRowHeader) {
                tableRowHeader.style.background = "#00c800";
            }
        }
    }
}

function loginButton() {
    window.localStorage.removeItem("token_type");
    window.localStorage.removeItem("access_token");
    window.location.href = "/";
    alert("Odhlášen(a)!");
}

function formatDateTime(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}. ${month}. ${year} ${hours}:${minutes}:${seconds}`;
}

function updateTime() {
    const now = new Date();
    const formattedTime = formatDateTime(now);
    document.getElementById('current-time').textContent = formattedTime;
}

async function getData() {
    if (!accessToken || !tokenType) {
        return { code: 401, failed: true, loggedIn: false, verified: false, guildID: false, workers: [] };
    }

    const result1 = await fetch("/api/v1/db/getTable/LSPD", {
        headers: {
            authorization: `${tokenType} ${accessToken}`,
        },
    });

    console.log("[LEA-Bot / API Login] Server kontaktován! OK: " + result1.ok);
    if (!result1.ok) {
        console.log("[LEA-Bot / API Login] Přihlášený uživatel ověřen: " + false);
        return { code: result1.status, failed: true, loggedIn: false, verified: false, guildID: false, workers: [] };
    }

    const result = await result1.json();
    if (!result.workers.length) {
        console.log("[LEA-Bot / API Login] Chyba! Databáze nebyla získána, nebo je prázdná.");
        console.log("[LEA-Bot / API Login] Přihlášený uživatel ověřen: " + result.passed);
        return { code: result1.status, failed: true, loggedIn: true, verified: result.passed, guildID: result.guildID, user: result.user, member: result.member, workers: [] };
    }

    console.log("[LEA-Bot / API Login] Úspěch! Databáze byla získána.");
    console.log("[LEA-Bot / API Login] Přihlášený uživatel ověřen: " + true);
    return { code: result1.status, failed: false, loggedIn: true, verified: result.passed, guildID: result.guildID, user: result.user, member: result.member, workers: result.workers };
};

async function sendFolder(workerID, folderID) {
    console.log("[LEA-Bot / API] Kontaktuji msg API...");
    result = await fetch("/api/v1/bot/msg", {
        signal: AbortSignal.timeout(5000),
        method: 'POST',
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "authorization": `${tokenType} ${accessToken}`,
        },
        body: new URLSearchParams({
            workerID: workerID,
            folderID: folderID,
            guildID: "1154446248934387828",
        }).toString()
    });
    if (!result.ok) {
        console.log("[LEA-Bot / API] Chyba při posílání složky!");
        return window.open('https://discord.com/channels/1154446248934387828/' + folderID, '_blank');
    }
    result = await result.json();
    if (!result.sent) {

        console.log("[LEA-Bot / API] Chyba při posílání složky!");
        return window.open('https://discord.com/channels/1154446248934387828/' + folderID, '_blank');
    }
    else return console.log("[LEA-Bot / API] Úspěch! Složka byla odeslána do DM.");;
}

function insertTable(workers) {
    let i = 0;
    if (!workers.length) return false;
    workers.forEach((worker) => {
        const table = document.getElementById("tabulky");
        const tbody = table.querySelector("#tabulky2");
        const row = tbody.querySelector("#" + worker.tag);
        if (row) {
            const td = row.querySelectorAll("td"),
                tdName = td[0],
                tdID = td[3],
                tdTag = td[4],
                tdLastDuty = td[5],
                tdRankupDate = td[6],
                tdRankupHours = td[7],
                tdHoursSum = td[8],
                tdHours14 = td[9],
                tdApologiesSum = td[10],
                tdApologies14 = td[11],
                tdFolder = td[12],
                tdCheckApologised = td[13],
                tdCheckWarned = td[14],
                tdCheckSuspended = td[15],
                tdCheckRedatDone = td[16],
                tdDivisions = td[17];

            const zeroDuties = !worker.duties.length;
            if (!zeroDuties) {
                const tdLastDutyDateArr = worker.duties[worker.duties.length - 1].date.split(". "),
                    tdLastDutyDate = new Date(tdLastDutyDateArr[1] + "/" + tdLastDutyDateArr[0] + "/" + tdLastDutyDateArr[2]),
                    today = new Date(),
                    tdLastDutyDays = Math.floor((today - tdLastDutyDate) / (1000 * 60 * 60 * 24));
                if (!worker.leadership && tdLastDutyDays <= 7) tdLastDuty.style.cssText = "background-color: #40BE25; text-align: center;";
                if (!worker.leadership && tdLastDutyDays > 7) tdLastDuty.style.cssText = "background-color: orange; text-align: center;";
                if (!worker.leadership && tdLastDutyDays > 14) tdLastDuty.style.cssText = "background-color: #c80000; font-weight: bold; color: white; text-align: center;";

                tdLastDuty.textContent = tdLastDutyDays + "d";
            } else { tdLastDuty.textContent = ""; }

            let tdHours14Counter = 0;
            worker.duties.filter(d => {
                if (d.removed) return false;
                const dutyDateArr = d.date.split(". ");
                const dutyDate = new Date(dutyDateArr[1] + "/" + dutyDateArr[0] + "/" + dutyDateArr[2]);
                const todayDate = new Date();
                const days = (todayDate - dutyDate) / (1000 * 60 * 60 * 24);
                if (days <= 14) return true;
                else return false;
            }).forEach(d => tdHours14Counter = tdHours14Counter + d.hours);
            tdHours14.textContent = Math.round((tdHours14Counter + Number.EPSILON) * 100) / 100;
            if (!worker.leadership && tdHours14Counter < 10) tdHours14.style.cssText = "background-color: #c80000; font-weight: bold; color: white; text-align: center;";
            if (!worker.leadership && tdHours14Counter >= 10) tdHours14.style.cssText = "background-color: orange; text-align: center;";
            if (!worker.leadership && tdHours14Counter > 40) tdHours14.style.cssText = "background-color: #40BE25; text-align: center;";

            tdApologies14.textContent = worker.apologies.filter(a => {
                if (a.removed) return false;
                const apologyDateArr = a.end.split(". ");
                const apologyDate = new Date(apologyDateArr[1] + "/" + apologyDateArr[0] + "/" + apologyDateArr[2]);
                const todayDate = new Date();
                const days = (todayDate - apologyDate) / (1000 * 60 * 60 * 24);
                if (days <= 14) return true;
                else return false;
            }).length;

            tdName.textContent = worker.name,
                tdID.textContent = worker.discordID,
                tdTag.textContent = worker.u?.tag || "Není na appce",
                tdRankupDate.textContent = worker.rankups[worker.rankups.length - 1].date,
                tdRankupHours.textContent = Math.round(((worker.hours - worker.rankups[worker.rankups.length - 1].hours) + Number.EPSILON) * 100) / 100,
                tdHoursSum.textContent = Math.round((worker.hours + Number.EPSILON) * 100) / 100,
                tdApologiesSum.textContent = worker.apologies.filter(a => !a.removed).length,
                tdFolder.innerHTML = `<button type="button" onclick="sendFolder('${worker.discordID}', '${worker.folder}')" style="background: white; background-color: white; text-align: center; cursor: pointer;"><i class="fas fa-paper-plane"></i></button>`,
                tdDivisions.textContent = worker.div.join(", ");

            if (!worker.u) tdTag.style.cssText = "background: #c80000; color: white; text-align: center; font-weight: bold;";
            if (worker.hours0) tdHoursSum.style.cssText = "background: #c80000; color: white; text-align: center; font-weight: bold;";

            if (worker.roles.omluvenka) tdCheckApologised.innerHTML = `<input type="checkbox" style="width: 20px; height: 20px; cursor: not-allowed;" onclick="return false" checked />`;
            if (worker.roles.warn) tdCheckWarned.innerHTML = `<input type="checkbox" style="width: 20px; height: 20px; cursor: not-allowed;" onclick="return false" checked />`;
            if (worker.roles.suspend) tdCheckSuspended.innerHTML = `<input type="checkbox" style="width: 20px; height: 20px; cursor: not-allowed;" onclick="return false" checked />`;
            if (worker.roles.redat) tdCheckRedatDone.innerHTML = `<input type="checkbox" style="width: 20px; height: 20px; cursor: not-allowed;" onclick="return false" checked />`;
            i++;
        }
    });

    console.log(`[LEA-Bot] Tabulky byly vloženy! (${i} zaměstnanců/řádků)`);
    return true;
}