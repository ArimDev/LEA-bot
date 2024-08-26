import { ActivityType } from "discord.js";
import { checkApologies } from "../../src/functions/outdated.js";
import newSystem from "../../src/functions/newSystem.js";
import web from "./web.js";
import api from "./api.js";
import ws from "./ws.js";

export default async function (bot) {
    console.log(` < [DC/Invite] >  https://discord.com/oauth2/authorize?client_id=${bot.user.id}&permissions=309640612928&scope=bot%20applications.commands`);

    bot.user.setPresence({ activities: [{ name: "Sloužit a chránit!", type: ActivityType.Listening }], status: "online", afk: false });

    checkApologies(bot);
    newSystem(bot);

    console.log(" < [PS/Info] >  Discord bot operational!");

    const app = await web(bot);
    const { newApp, server, wss } = await ws(bot, app);
    await api(bot, app, server, wss);
}