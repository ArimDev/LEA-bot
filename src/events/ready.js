import { ActivityType } from "discord.js";
import { checkApologies } from "../../src/functions/outdated.js";
import newSystem from "../../src/functions/newSystem.js";
import web from "./web.js";
import api_1 from "../api/v1.js";
import api_2 from "../api/v2.js";
import ws from "./ws.js";
import express from "express";
import { config as secret } from "dotenv";
import path from "path";

export default async function (bot) {
    console.log(` < [DC/Invite] >  https://discord.com/oauth2/authorize?client_id=${bot.user.id}&permissions=309640612928&scope=bot%20applications.commands`);

    bot.user.setPresence({ activities: [{ name: "Sloužit a chránit!", type: ActivityType.Listening }], status: "online", afk: false });

    checkApologies(bot);
    newSystem(bot);

    console.log(" < [PS/Info] >  Discord bot operational!");

    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    await web(bot, app);
    const { server, wss } = await ws(bot, app);
    await api_1(bot, app, server, wss);
    await api_2(bot, app, server, wss);

    app.use(express.static(path.resolve("./site/dist/")));
    app.get(/^\/(?!api\/|old\/).*/, (req, res) => {
        res.sendFile(path.join(path.resolve("./site/dist/"), "index.html"));
    });

    /*app.use((req, res) => {
        res.status(404).sendFile(secret().parsed.errorPath + "/nginx404.html");
    });*/

    await server.listen(secret().parsed.webPort, () => {
        console.log(` < [PS/Web] >  LEA Bot tables are now available at IP:${secret().parsed.webPort}!`);
    });
}