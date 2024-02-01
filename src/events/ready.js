import { ActionRowBuilder, ActivityType, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { checkApologies } from "../../src/functions/outdated.js";
import newSystem from "../../src/functions/newSystem.js";
import { update, updateDiv } from "../../web/script.js";
import express from "express";
import path from "path";
import { config as secret } from "dotenv";

export default async function (bot) {
    console.log(` < [DC/Invite] >  https://discord.com/oauth2/authorize?client_id=${bot.user.id}&permissions=309640612928&scope=bot%20applications.commands`);

    bot.user.setPresence({ activities: [{ name: "Sloužit a chránit!", type: ActivityType.Listening }], status: "online", afk: false });

    checkApologies(bot);
    newSystem(bot);

    /*bot.guilds.cache.forEach(async (guild) => {
    const me = await guild.members.fetchMe();
    if (me.nickname !== "LEA Bot") me.setNickname("LEA Bot");
    });*/

    /*const server = await bot.guilds.fetch("1167182546853961860");
    const kanal = await server.channels.fetch("1193340608971018382");
    for (const tag of kanal.availableTags) {
        console.log(tag.name + " | " + tag.id);
    }

    const server = await bot.guilds.fetch("1139266097921675345");
    const kanal = await server.channels.fetch("1188146028440997948");

    const vlakna = await kanal.threads.fetchActive();
    console.log(vlakna)
    console.log(vlakna.threads.first())
    vlakna.threads.forEach(async (t) => {
        if (t.joinable && !t.joined) await t.join(); console.log(` < [DT] >  thread ${t.name} joined`);
    });*/

    /*ORIENTACE V NÁVODU
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setLabel("Vytvoření složky")
                .setURL("https://discord.com/channels/1139266097921675345/1170795599164080228/1170797004595666984")
                .setStyle(ButtonStyle.Link)
                .setEmoji("📂"),
        )
        .addComponents(
            new ButtonBuilder()
                .setLabel("Zapsání duty")
                .setURL("https://discord.com/channels/1139266097921675345/1170795599164080228/1170798279534071900")
                .setStyle(ButtonStyle.Link)
                .setEmoji("🕑"),
        )
        .addComponents(
            new ButtonBuilder()
                .setLabel("Zápis omluvenky")
                .setURL("https://discord.com/channels/1139266097921675345/1170795599164080228/1170799102120960071")
                .setStyle(ButtonStyle.Link)
                .setEmoji("🙏"),
        );

    const server = await bot.guilds.fetch("1139266097921675345");
    const kanal = await server.channels.fetch("1188146028440997948");
    const vlakno = await kanal.threads.fetch("1170795599164080228");
    console.log(vlakno);
    const member = await server.members.fetch("411436203330502658");
    const navodEmbed = new EmbedBuilder()
        .setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() })
        .setTitle("Revoluce zápisů")
        .setDescription("Klikni na tlačítko pro přesun na daný návod.")
        .setThumbnail(bot.LEA.i.SAHP)
        .setColor(getServer(i.guild.id).color)
        .setFooter({ text: "SAHP | Vytvořil b1ngo ✌️", iconURL: bot.LEA.i.SAHP });
    await vlakno.send({ embeds: [navodEmbed], components: [row] });*/

    console.log(" < [PS/Info] >  Discord bot operational!");

    const tApp = express();
    const tPort = secret().port;

    tApp.get('/', (req, res) => {
        res.sendFile(path.resolve("./web/main.html"));
    });

    tApp.get('/sahp', async function (req, res) {
        await update(bot, 1);
        res.sendFile(path.resolve("./web/SAHP.html"));
    });

    tApp.get('/lssd', async function (req, res) {
        await update(bot, 2);
        res.sendFile(path.resolve("./web/LSSD.html"));
    });

    tApp.get('/divize', async function (req, res) {
        await updateDiv(bot);
        res.sendFile(path.resolve("./web/div.html"));
    });

    tApp.get('/div', (req, res) => {
        res.redirect('/divize');
    });

    tApp.listen(tPort, () => {
        console.log(` < [PS/Web] >  LEA Bot tables are now available at IP:${tPort}!`);
    });

    update(bot);
}