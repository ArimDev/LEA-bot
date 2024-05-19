let runType;
if (process.argv[2] === "start") { runType = 0; }
else if (process.argv[2] === "test") { runType = 1; }
else { runType = 2; console.error("ERR! Correct launch: \"node index.js test|start\""); process.exit(4); }
export { runType };

import { setup as setupLogs } from "./src/functions/logSystem.js";
await setupLogs();

console.log("-------------------------------> LEA Bot <-------------------------------");
if (runType === 0) console.log("                                starting...                               ");
if (runType === 1) console.log("                                testing...                                ");
console.log("");

import { config as secret } from "dotenv";
import { Client, GatewayIntentBits, Collection } from "discord.js";

let bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMembers
    ]
});

bot.slashes = new Collection();
bot.LEA = {
    c: {
        LEAbot: "#3a9a97",
        LSPD: "#000c1e",
        SAHP: "#457cc0",
        LSSD: "#bd8131",
        duty: "#5245c0",
        apology: "#c05245",
        summary: "#25be5c",
        event: "#Be25ab"
    },
    i: {
        LEAbot: "https://i.imgur.com/EnZErOi.png",
        LSPD: "https://i.imgur.com/gfL0fGf.png",
        SAHP: "https://i.imgur.com/xgFoKuX.png",
        LSSD: "https://i.imgur.com/X3cH2iu.png",
        event: [
            "https://i.imgur.com/pkEErJp.png",
            "https://i.imgur.com/Dj4dvsr.png",
            "https://imgur.com/NARTJhy.png"
        ]
    },
    e: {
        LSPD: "<:LSPD:1178108366514565181>",
        SAHP: "<:SAHP:1174876044570931210>",
        LSSD: "<:LSSD:1178106303198011412>"
    },
    g: {
        LSPD: [
            "1154446248934387828", "1203275468544151583"
        ],
        LSSD: [
            "1139266097921675345", "1174843772446703718", "714147774299373629"
        ]
    }
};

import { events, commands } from "./src/functions/register.js";
events(bot);
commands(bot);

bot.login(secret().parsed.botToken);

export { bot };