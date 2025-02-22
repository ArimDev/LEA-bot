import { ActivityType } from "discord.js";
import web from "./web.js";
import api_1 from "../api/v1.js";
import api_2 from "../api/v2.js";
import express from "express";
import { config as secret } from "dotenv";
import path from "path";

export default async function (bot) {
    console.log(` < [DC/Invite] >  https://discord.com/oauth2/authorize?client_id=${bot.user.id}&permissions=309640612928&scope=bot%20applications.commands`);

    bot.user.setPresence({ activities: [{ name: "Sloužit a chránit!", type: ActivityType.Listening }], status: "online", afk: false });

    console.log(" < [PS/Info] >  Discord bot operational!");

    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    await web(bot, app);
    await api_1(bot, app,);
    await api_2(bot, app,);

    app.use(express.static(path.resolve("./site/dist/")));
    app.get(/^\/(?!api\/|old\/|docs\/).*/, (req, res) => {
        res.sendFile(path.join(path.resolve("./site/dist/"), "index.html"));
    });

    await app.listen(secret().parsed.webPort, () => {
        console.log(` < [PS/Web] >  LEA Bot tables are now available at IP:${secret().parsed.webPort}!`);
    });
}