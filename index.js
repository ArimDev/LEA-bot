let runType;
if (process.argv[2] === "start") { runType = 0; }
else if (process.argv[2] === "test") { runType = 1; }
else { runType = 2; console.error("ERR! Correct launch: \"node index.js test|start\""); process.exit(4); }
export { runType };

console.log("-------------------------------> LEA Bot <-------------------------------");
if (runType === 0) console.log("                                starting...");
if (runType === 1) console.log("                                testing...");
console.log("");

import { config as secret } from "dotenv";
import { Client, GatewayIntentBits, Collection } from "discord.js";

let bot = new Client({
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.MessageContent
    ]
});

import fs from "fs/promises";
const packageJson = JSON.parse(await fs.readFile("./package.json"));
console.log(`                            launching v${packageJson.version}`);

bot.version = packageJson.version;
bot.slashes = new Collection();
bot.ints = new Map();
bot.LEA = {
    a: [
        "411436203330502658", //b1ngo
        "607915400604286997", //samus
        "846451292388851722", //aldix_eu
        "918542346453385247", //m4art1x
    ],
    c: {
        LEAbot: "#3a9a97",
        LSPD: "#000c1e",
        SAHP: "#457cc0",
        LSSD: "#bd8131",
        LSCSO: "#b68f68",
        SAND: "#253818",
        SASP: "#063673",
        duty: "#5245c0",
        apology: "#c05245",
        summary: "#25be5c",
        event: "#Be25ab",
        deleted: "#c43136"
    },
    e: {
        LSPD: "<:LSPD:1178108366514565181>",
        SAHP: "<:SAHP:1174876044570931210>",
        LSSD: "<:LSSD:1178106303198011412>",
        LSCSO: "<:LSCSO:1266078681479254176>",
        SAND: "<:SAND:1460373510617829553>",
        SASP: "<:SASP:1559277531939741696> ",
    },
    g: {
        LSPD: ["1510304641135673384"],
        LSSD: [""],
        SAHP: [],
        SAND: [""],
        SASP: ["1557478892774625282"],
    },
    i: {
        LEAbot: "https://i.imgur.com/EnZErOi.png",
        LSPD: "https://i.imgur.com/gfL0fGf.png",
        SAHP: "https://i.imgur.com/xgFoKuX.png",
        LSSD: "https://i.imgur.com/X3cH2iu.png",
        LSCSO: "https://i.imgur.com/Hex0MQF.png",
        SAND: "https://i.imgur.com/OvRkxFN.png",
        SASP: "https://i.imgur.com/m7C8hoX.png",
    },
    o: "411436203330502658", //b1ngo
    r: {
        LSPD: {
            strike1: "1510304641135673385",
            strike2: "1510304641135673386",
            warn: "1510304641135673387",
            suspend: "1510304641135673388",
        },
        LSSD: {
            strike1: "",
            strike2: "",
            warn: "",
            suspend: "",
        },
        SAHP: {
            strike1: "",
            strike2: "",
            warn: "",
            suspend: "",
        },
        SAND: {
            strike1: "",
            strike2: "",
            warn: "",
            suspend: "",
        },
        SASP: {
            strike1: "1557478892774625285",
            strike2: "1557478892774625286",
            warn: "1557478892774625287",
            suspend: "1557478892774625288",
        },
    },
    ch: {
        LSPD: {
            warns: "1510304641802436877",
            suspends: "1546553171055349880",
        },
        LSSD: {
            warns: "",
            suspends: "",
        },
        SAHP: {
            warns: "",
            suspends: "",
        },
        SAND: {
            warns: "",
            suspends: "",
        },
        SASP: {
            warns: "1557478895882731610",
            suspends: "1557478895421489309",
        },
    },
};

import { events, commands, interactions } from "./src/functions/register.js";
events(bot);
commands(bot);
interactions(bot);

bot.login(secret().parsed.botToken);

export { bot };