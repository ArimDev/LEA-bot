let runType;
if (process.argv[2] === "start") { runType = 0; }
else if (process.argv[2] === "test") { runType = 1; }
else { runType = 2; console.error("ERR! Correct launch: \"node index.js test|start\""); process.exit(4); }
export { runType };

console.log("-------------------------------> LEA Bot <-------------------------------");
if (runType === 0) console.log("                                starting...                               ");
if (runType === 1) console.log("                                testing...                                ");
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

bot.version = packageJson.version;
bot.slashes = new Collection();
bot.ints = new Map();
bot.LEA = {
    a: [
        "411436203330502658", //b1ngo
        "607915400604286997", //samus
        "846451292388851722", //aldix_eu
        "343386988000444417", //cenovka
        "881891977606619156", //kubikxde
        "918542346453385247", //m4art1x
    ],
    c: {
        LEAbot: "#3a9a97",
        LSPD: "#000c1e",
        SAHP: "#457cc0",
        LSSD: "#bd8131",
        LSCSO: "#b68f68",
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
        LSCSO: "<:LSCSO:1266078681479254176>"
    },
    g: {
        LSPD: ["1301163398515396668"],
        LSSD: ["1385604665252642897"],
        SAHP: []
    },
    i: {
        LEAbot: "https://i.imgur.com/EnZErOi.png",
        LSPD: "https://i.imgur.com/gfL0fGf.png",
        SAHP: "https://i.imgur.com/xgFoKuX.png",
        LSSD: "https://i.imgur.com/X3cH2iu.png",
        LSCSO: "https://i.imgur.com/Hex0MQF.png"
    },
    o: "411436203330502658", //b1ngo
    r: {
        LSPD: {
            strike1: "1301163398515396673",
            strike2: "1305972756319436892",
            warn: "1301163398515396674",
            suspend: "1301163398515396672",
        },
        LSSD: {
            strike1: "1391525354039935067",
            strike2: "1391525355386437652",
            warn: "1391525353083764826",
            suspend: "1391525356321640478",
        },
        SAHP: {
            strike1: "",
            strike2: "",
            warn: "",
            suspend: "",
        },
    },
    ch: {
        LSPD: {
            warns: "1301163401292025907",
            suspends: "1301163401292025909",
        },
        LSSD: {
            warns: "1391525425146101860",
            suspends: "1391525426857377973",
        },
        SAHP: {
            warns: "",
            suspends: "",
        },
    },
};

import { events, commands, interactions } from "./src/functions/register.js";
events(bot);
commands(bot);
interactions(bot);

bot.login(secret().parsed.botToken);

export { bot };