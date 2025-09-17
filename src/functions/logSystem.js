import fs from "fs";
import path from "path";
import util from "util";
import { getServer } from "./db.js";
import { EmbedBuilder } from "discord.js";

export function dg(date, option) {
    let r;
    if (option === "Month") r = parseInt(date["get" + option]()) + 1;
    else if (option === "FullYear" || option === "Date") r = date["get" + option]();
    else {
        if (parseInt(date["get" + option]()) < 10) {
            r = "0" + date["get" + option]();
        } else {
            r = date["get" + option]();
        }
    }

    return r.toString();
}

export async function dcLog(bot, guildID, member, options = {}) {
    const gotServer = getServer(guildID);
    let guild, channel,
        title = options.title,
        description = options.description,
        color = options.color,
        file = options.file;
    if (gotServer.id === 1) {
        let files = [];
        if (!!file) files = [file];

        guild = await bot.guilds.fetch("1301163398515396668");
        channel = await guild.channels.fetch("1301163400466010167");
        const logEmbed = new EmbedBuilder()
            .setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() })
            .setTitle(title)
            .setDescription(description)
            .setColor(color)
            .setFooter({ text: `LSPD | LEA-Bot v${bot.version} 🏳️`, iconURL: bot.LEA.i.LSPD });
        await channel.send({ embeds: [logEmbed], files: files });
    } else if (gotServer.id === 2) {
        let files = [];
        if (!!file) files = [file];

        guild = await bot.guilds.fetch("1385604665252642897");
        channel = await guild.channels.fetch("1391525445375103086");
        const logEmbed = new EmbedBuilder()
            .setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() })
            .setTitle(title)
            .setDescription(description)
            .setColor(color)
            .setFooter({ text: `LSSD | LEA-Bot v${bot.version} 🏳️`, iconURL: bot.LEA.i.LSSD });
        await channel.send({ embeds: [logEmbed], files: files });
    } else if (gotServer.id === 3) {
        let files = [];
        if (!!file) files = [file];

        guild = await bot.guilds.fetch(/* MISSING ID */);
        channel = await guild.channels.fetch(/* MISSING ID */);
        const logEmbed = new EmbedBuilder()
            .setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() })
            .setTitle(title)
            .setDescription(description)
            .setColor(color)
            .setFooter({ text: `SAHP | LEA-Bot v${bot.version} 🏳️`, iconURL: bot.LEA.i.SAHP });
        await channel.send({ embeds: [logEmbed], files: files });
    }
}

export async function simpleLog(bot, guildID, options) {
    const gotServer = getServer(guildID);

    let guild, channel;
    if (gotServer.id === 1) {
        guild = await bot.guilds.fetch("1301163398515396668");
        channel = await guild.channels.fetch("1301163400935768160");
    } else if (gotServer.id === 2) {
        guild = await bot.guilds.fetch("1385604665252642897");
        channel = await guild.channels.fetch("1391525480515108914");
    } else if (gotServer.id === 3) {
        guild = await bot.guilds.fetch(/* MISSING ID */);
        channel = await guild.channels.fetch(/* MISSING ID */);
    }

    const logEmbed = new EmbedBuilder()
        .setAuthor(options.author)
        .setTitle(options.title)
        .setColor(options.color)
        .setFooter(options.footer);
    if (options.description) logEmbed.setDescription(options.description);
    await channel.send({ embeds: [logEmbed] });
}