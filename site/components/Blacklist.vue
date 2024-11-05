<template>
    <table class="otherTables">
        <thead>
            <tr>
                <th scope="col" rowspan="2" style="text-align: center;">
                    <img src="../assets/logo/leabot.png" width="65" height="65" alt="LEA-Bot icon" />
                </th>
                <th scope="col" colspan="4">WHO</th>
                <th scope="col" rowspan="2">REASON</th>
                <th scope="col" rowspan="2">DATE</th>
                <th scope="col" colspan="5">FROM</th>
            </tr>
            <tr>
                <th scope="col">USERNAME</th>
                <th scope="col">DISPLAYNAME</th>
                <th scope="col">IC</th>
                <th scope="col">ID</th>
                <th scope="col">IC</th>
                <th scope="col">USERNAME</th>
                <th scope="col">DISPLAYNAME</th>
                <th scope="col">ID</th>
                <th scope="col"></th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(victim, index) in blData" :key="index">
                <th scope="row">{{ victim.index }}</th> <!-- ID blacklistu -->
                <td>{{ victim.username }}</td> <!-- victim Discord username -->
                <td>{{ victim.displayName }}</td> <!-- victim Discord displayName -->
                <td>{{ victim.name }}</td> <!-- victim IC name -->
                <td>{{ victim.id }}</td> <!-- victim Discord ID -->
                <td>{{ victim.from.reason }}</td> <!-- blacklist reason -->
                <td>{{ victim.from.timestamp }}</td> <!-- blacklist date -->
                <td>{{ victim.from.name }}</td> <!-- judge IC name -->
                <td>{{ victim.from.username }}</td> <!-- judge Discord username -->
                <td>{{ victim.from.displayName }}</td> <!-- judge Discord displayName -->
                <td>{{ victim.from.id }}</td> <!-- judge Discord ID -->
                <td><img :src="getBadge(victim.from.dep)" width="45" height="45" :alt="victim.from.dep" /></td><!-- department badge icon -->
            </tr>
        </tbody>
    </table>
    <div class="errorMessage">
        <div v-if="!loaded" class="loadingMessage">
            <div class="loader"></div>
        </div>
        <div v-else-if="fetchError" class="errorMessage">
            <img src="../assets/icon/server-error.png" width="125">
            <h1>Chyba!</h1>
            <p v-html="fetchErrorReason"></p>
        </div>
    </div>
</template>

<script setup>
import '../assets/style/otherTables.css';
import axios from "axios";
import { ref, onMounted } from "vue";

const loaded = ref(false);
const blData = ref([]);
const fetchError = ref(false);
const fetchErrorReason = ref("");

onMounted(async () => {
    blData.value = await fetchBL();
    loaded.value = true;
});

async function fetchBL() {
    try {
        const response = await axios.get("/api/v2/db/blacklist");

        const bl = response.data;

        if (!bl.length) {
            console.log("[LEA-Bot / GET bl] Databáze nebyla získána nebo je prázdná.");
            fetchError.value = true;
            fetchErrorReason.value = `Databáze nebyla získána nebo je prázdná. (${response.status})`;
            return [];
        } else {
            console.log("[LEA-Bot / GET bl] Úspěch! Blacklist byl získán.");
            let blEnabled = [];
            for (const b of bl) {
                if (b.removed) continue;
                b.index = bl.indexOf(b);
                blEnabled.push(b);
            }
            return blEnabled;
        }
    } catch (error) {
        console.log(`[LEA-Bot / GET bl] Chyba při kontaktování serveru! (${error.response?.status || "500"})`);
        fetchError.value = true;
        fetchErrorReason.value = `Kontakt s databází selhal!<br>(${error.response?.status || "500"})`;
        return [];
    }
}

function getBadge(dep) {
    if (!dep) return "";
    else if (dep === "LSPD") {
        return "../assets/logo/LSPD.png";
    } else if (dep === "LSCSO") {
        return "../assets/logo/LSCSO.png";
    } else return "";
}
</script>

<style scoped>
.otherTables tbody tr:hover {
    background: #3655c3;
    color: white;
}

.otherTables table {
    background-color: white;
}

.otherTables td {
    border: 1px solid #edebe9;
}

.otherTables th {
    color: white;
    border: 1px solid #edebe9;
}

.otherTables th[scope="row"] {
    color: white;
    background: black;
}

.otherTables th[scope="col"] {
    color: white;
    background: black;
}
</style>