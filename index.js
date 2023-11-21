let runType;
if (process.argv[2] === "start") { runType = 0; }
else if (process.argv[2] === "test") { runType = 1; }
else { runType = 2; console.error("ERR! Correct launch: \"node index.js test|start\""); process.exit(4); }
export { runType };

import { setup as setupLogs } from "./src/functions/logSystem.js";
await setupLogs();

console.log("-------------------------------> SAHP-bot <-------------------------------");
if (runType === 0) console.log("                                starting...                               ");
if (runType === 1) console.log("                                testing...                                ");
console.log("");

import { config as secret } from "dotenv";
import { Client, GatewayIntentBits, Collection } from "discord.js";

let bot = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

bot.slashes = new Collection();
bot.SAHP = {
    c: {
        master: "#2596be",
        duty: "#5245c0",
        apology: "#c05245",
        summary: "#25be5c",
        cpz: "#bea925",
        event: "#Be25ab"
    },
    i: {
        event: [
            "https://i.imgur.com/pkEErJp.png",
            "https://i.imgur.com/Dj4dvsr.png",
            "https://imgur.com/NARTJhy.png"
        ]
    }
};

import { events, commands } from "./src/functions/register.js";
events(bot);
commands(bot);

bot.login(secret().parsed.token);