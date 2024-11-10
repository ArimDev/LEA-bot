<template>
    <table v-if="isLoggedIn && hasAccess">
        <thead>
            <tr>
                <th scope="col" rowspan="2" style="text-align: center;">
                    <img src="../assets/logo/LSSD.png" width="65" height="65" alt="Odznak LSSD" />
                </th>
                <th scope="col" rowspan="2">Jméno</th>
                <th scope="col" rowspan="2">Odznak</th>
                <th scope="col" rowspan="2">Hodnost</th>
                <th scope="col" colspan="2">Discord</th>
                <th scope="col" rowspan="2">LD</th>
                <th scope="col" colspan="2">Povýšení</th>
                <th scope="col" colspan="2">Hodin</th>
                <th scope="col" colspan="2">Omluvenky</th>
                <th scope="col" rowspan="2">Složka</th>
                <th scope="col" colspan="4">Pole</th>
                <th scope="col" rowspan="2">Divize</th>
            </tr>
            <tr>
                <th scope="col">ID</th>
                <th scope="col">Tag</th>
                <th scope="col">Datum</th>
                <th scope="col">Hodin</th>
                <th scope="col">Celkem</th>
                <th scope="col">14d</th>
                <th scope="col">Celkem</th>
                <th scope="col">14d</th>
                <th scope="col">Omluven(a)</th>
                <th scope="col">Warn</th>
                <th scope="col">Suspend</th>
                <th scope="col">Redat</th>
            </tr>
        </thead>
        <tbody>
            <template v-for="(staff, index) in staffData" :key="index">
                <tr v-if="staff.title">
                    <td colspan="19" class="tdRankTitle">{{ staff.title }}</td>
                </tr>
                <tr v-for="slotIndex in staff.slots" :key="`${index}-${slotIndex}`" :id="getCallsign(staff.firstCallsign, slotIndex)">
                    <th scope="row">{{ getCallsign(staff.firstCallsign, slotIndex) }}</th>
                    <td class="tdLeft">
                        <template v-if="(workerData = getWorker(staff.firstBadge + slotIndex - 1))">
                            {{ workerData.name || "" }}
                        </template>
                        <template v-else>
                            {{ "" }}
                        </template>
                    </td>
                    <td class="tdCenter">{{ staff.firstBadge + slotIndex - 1 }}</td>
                    <td class="tdLeft">{{ staff.rank }}</td>
                    <td class="tdCenter">{{ workerData?.discordID || "" }}</td>
                    <td class="tdCenter">{{ workerData ? (workerData.u?.tag || "Není na appce") : "" }}</td>
                    <td class="tdCenter" :style="calcWorker(workerData, 'lastDuty').css">{{ calcWorker(workerData, "lastDuty").value }}</td> <!-- LD Last Duty -->
                    <td class="tdCenter">{{ workerData?.rankups[workerData.rankups.length - 1]?.date || "" }}</td>
                    <td class="tdCenter">{{ calcWorker(workerData, "rankUpHours") }}</td>
                    <td class="tdCenter">{{ calcWorker(workerData, "totalHours") }}</td>
                    <td class="tdCenter" :style="calcWorker(workerData, 'hours14d').css">{{ calcWorker(workerData, "hours14d").value }}</td> <!-- Hodin za 14 d -->
                    <td class="tdCenter">{{ calcWorker(workerData, "totalApologies") }}</td>
                    <td class="tdCenter">{{ calcWorker(workerData, "apologies14d") }}</td> <!-- Omluvenky za 14 d -->
                    <td class="tdCenter">{{ calcWorker(workerData, "folderButton") }}</td> <!-- Složka -->
                    <td class="tdCenter"><input type="checkbox" :checked="calcCheckbox(workerData, 'apology')" onclick="return false" /></td> <!-- Omluven? -->
                    <td class="tdCenter"><input type="checkbox" :checked="calcCheckbox(workerData, 'warn')" onclick="return false" /></td> <!-- Warn? -->
                    <td class="tdCenter"><input type="checkbox" :checked="calcCheckbox(workerData, 'suspend')" onclick="return false" /></td> <!-- Suspend? -->
                    <td class="tdCenter"><input type="checkbox" :checked="calcCheckbox(workerData, 'redat')" onclick="return false" /></td> <!-- Redat? -->
                    <td class="tdLeft" style="white-space: nowrap;">{{ workerData?.div.join(", ") || "" }}</td>
                </tr>
            </template>
        </tbody>
    </table>
    <div v-else class="errorMessage">
        <div v-if="!loaded" class="loadingMessage">
            <div class="loader"></div>
        </div>
        <div v-else-if="!isLoggedIn" class="loginMessage">
            <img src="../assets/icon/key.png" width="125">
            <h1>Nepřihlášen(a)!</h1>
            <p>Nejsi přihlášen(a) k ověření přístupu.</p>
        </div>
        <div v-else-if="isLoggedIn && !hasAccess" class="noAccessMessage">
            <img src="../assets/icon/lock.png" width="125">
            <h1>Přístup zamítnut!</h1>
            <p>Nemáš povolení zobrazit tento obsah.</p>
        </div>
        <div v-else-if="fetchError" class="errorMessage">
            <img src="../assets/icon/server-error.png" width="125">
            <h1>Chyba!</h1>
            <p v-html="fetchErrorReason"></p>
        </div>
    </div>
</template>

<script setup>
import '../assets/style/staffTables.css';
import axios from "axios";
import { ref, onMounted } from "vue";

const loaded = ref(false);
const staffData = ref([]);
const isLoggedIn = ref(false);
const hasAccess = ref(false);
const fetchError = ref(false);
const fetchErrorReason = ref("");
const workers = ref([]);

onMounted(async () => {
    checkLogin();
    if (isLoggedIn.value) {
        staffData.value = await fetchPositions();
        if (staffData.value.length) workers.value = await fetchWorkers();
    }
    loaded.value = true;
});

function checkLogin() {
    const tokenType = window.localStorage.getItem("token_type");
    const accessToken = window.localStorage.getItem("access_token");
    const expiry = window.localStorage.getItem("expiry");

    isLoggedIn.value = !!(tokenType && accessToken && expiry);
}

async function fetchWorkers() {
    try {
        const response = await axios.get("/api/v1/db/getTable/LSSD", {
            headers: { authorization: `${window.localStorage.getItem("token_type")} ${window.localStorage.getItem("access_token")}` }
        });

        const { workers, passed, guildID, user, member } = response.data;

        if (!workers.length) {
            console.log("[LEA-Bot / API Login] Databáze nebyla získána nebo je prázdná.");
            hasAccess.value = passed;
            fetchError.value = true;
            fetchErrorReason.value = `Databáze nebyla získána nebo je prázdná. (${response.status})`;
            return [];
        } else {
            console.log("[LEA-Bot / API Login] Úspěch! Databáze byla získána.");
            hasAccess.value = passed;
            return workers;
        }
    } catch (error) {
        console.log(`[LEA-Bot / API Login] Chyba při kontaktování serveru! (${error.response?.status || "500"})`);
        if (error.response?.status === 403) hasAccess.value = false;
        fetchError.value = true;
        fetchErrorReason.value = `Kontakt s databází selhal!<br>(${error.response?.status || "500"})`;
        return [];
    }
}

async function fetchPositions() {
    try {
        const response = await axios.get("/api/v2/db/LSSD/positions");

        const pos = response.data;

        if (!pos.length) {
            console.log("[LEA-Bot / GET pos] Databáze nebyla získána nebo je prázdná.");
            fetchError.value = true;
            fetchErrorReason.value = `Databáze nebyla získána nebo je prázdná. (${response.status})`;
            return [];
        } else {
            console.log("[LEA-Bot / GET pos] Úspěch! Pozice byly získány.");
            return pos;
        }
    } catch (error) {
        console.log(`[LEA-Bot / GET pos] Chyba při kontaktování serveru! (${error.response?.status || "500"})`);
        fetchError.value = true;
        fetchErrorReason.value = `Kontakt s databází selhal!<br>(${error.response?.status || "500"})`;
        return [];
    }
}

function getCallsign(firstCallsign, slotIndex) {
    const [prefix, num] = firstCallsign.split("-");
    return `${prefix}-${Number(num) + slotIndex - 1}`;
}

function getWorker(badge) {
    if (!badge) return null;
    else return workers.value.find(worker => worker.badge === badge) || null;
}

function calcWorker(workerData, method) {
    if (!workerData) return "";

    if (method === "rankUpHours") {
        const lastRankUp = workerData.rankups[workerData.rankups.length - 1];
        return Math.round(((workerData.hours - lastRankUp.hours) + Number.EPSILON) * 100) / 100;
    } else if (method === "totalHours") {
        return Math.round((workerData.hours + Number.EPSILON) * 100) / 100;
    } else if (method === "totalApologies") {
        return (workerData.apologies.filter(a => !a.removed).length || "0");
    } else if (method === "lastDuty") {
        if (workerData.duties.length) {
            const tdLastDutyDateArr = workerData.duties[workerData.duties.length - 1].date.split(". "),
                tdLastDutyDate = new Date(tdLastDutyDateArr[1] + "/" + tdLastDutyDateArr[0] + "/" + tdLastDutyDateArr[2]),
                today = new Date(),
                tdLastDutyDays = Math.floor((today - tdLastDutyDate) / (1000 * 60 * 60 * 24));

            let ldCSS;
            if (!workerData.leadership && tdLastDutyDays <= 7) ldCSS = "background-color: #40BE25; text-align: center;";
            if (!workerData.leadership && tdLastDutyDays > 7) ldCSS = "background-color: orange; text-align: center;";
            if (!workerData.leadership && tdLastDutyDays > 14) ldCSS = "background-color: #c80000; font-weight: bold; color: white; text-align: center;";

            return { css: ldCSS, value: (tdLastDutyDays.toLocaleString() + "d") };
        } else return { css: "", value: "0" };
    } else if (method === "hours14d") {
        let tdHours14Counter = 0;
        workerData.duties.filter(d => {
            if (d.removed) return false;
            const dutyDateArr = d.date.split(". ");
            const dutyDate = new Date(dutyDateArr[1] + "/" + dutyDateArr[0] + "/" + dutyDateArr[2]);
            const todayDate = new Date();
            const days = (todayDate - dutyDate) / (1000 * 60 * 60 * 24);
            if (days <= 14) return true;
            else return false;
        }).forEach(d => tdHours14Counter = tdHours14Counter + d.hours);

        let h14dCSS;
        if (!workerData.leadership && tdHours14Counter < 10) h14dCSS = "background-color: #c80000; font-weight: bold; color: white; text-align: center;";
        if (!workerData.leadership && tdHours14Counter >= 10) h14dCSS = "background-color: orange; text-align: center;";
        if (!workerData.leadership && tdHours14Counter > 40) h14dCSS = "background-color: #40BE25; text-align: center;";

        return { css: h14dCSS, value: Math.round((tdHours14Counter + Number.EPSILON) * 100) / 100 };
    } else if (method === "apologies14d") {
        return workerData.apologies.filter(a => {
            if (a.removed) return false;
            const apologyDateArr = a.end.split(". ");
            const apologyDate = new Date(apologyDateArr[1] + "/" + apologyDateArr[0] + "/" + apologyDateArr[2]);
            const todayDate = new Date();
            const days = (todayDate - apologyDate) / (1000 * 60 * 60 * 24);
            if (days <= 14) return true;
            else return false;
        }).length;
    } else if (method === "folderButton") {
        return "WIP";
    } else return "";

}

function calcCheckbox(workerData, method) {
    if (!workerData) return false;
    if (method === "apology")
        return workerData.roles.omluvenka;
    else if (method === "warn")
        return workerData.roles.warn;
    else if (method === "suspend")
        return workerData.roles.suspend;
    else if (method === "redat")
        return workerData.roles.redat;
    else return false;
}
</script>

<style scoped>
tbody tr:hover {
    background: #3655c3;
    color: white;
}

table {
    background-color: white;
}

td {
    border: 1px solid black;
}

th {
    color: #bd8131;
    border: 1px solid black;
}

th[scope="row"] {
    color: black;
    background: #bd8131;
}

th[scope="col"] {
    color: black;
    background: #bd8131;
}
</style>