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

export async function setup() {
    const date = new Date();

    async function getWriteStream() {
        let files = await fs.readdirSync(path.resolve("./logs"));

        files = await files.filter((d) => d.includes((dg(date, "FullYear") + "-" + dg(date, "Month") + "-" + dg(date, "Date"))));

        if (files[0]) await files.forEach((f, i) => {
            files[i] = parseInt(f.split("_")[1].split(".log")[0]);
        });

        const index = files[0] ? (Math.max(...files) + 1) : 1;
        return fs.createWriteStream(
            path.resolve(
                "./logs/"
                + dg(date, "FullYear") + "-" + dg(date, "Month") + "-" + dg(date, "Date") + "_" + index
                + ".log"
            ),
            { flags: 'wx' });
    }

    const logStream = await getWriteStream();
    const logStdout = process.stdout;

    console.log = function (d) {
        const day = dg(date, "Date") + ":" + dg(date, "Month") + ":" + dg(date, "FullYear");
        const time = dg(date, "Hours") + ":" + dg(date, "Minutes") + ":" + dg(date, "Seconds");
        logStream.write(`[${day} | ${time} LOG] ${util.format(d)}` + "\n");
        logStdout.write(`[${day} | ${time} LOG] ${util.format(d)}` + "\n");
    };

    console.error = function (d) {
        const day = dg(date, "Date") + ":" + dg(date, "Month") + ":" + dg(date, "FullYear");
        const time = dg(date, "Hours") + ":" + dg(date, "Minutes") + ":" + dg(date, "Seconds");
        logStream.write(`[${day} | ${time} ERR] ${util.format(d)}` + "\n");
        logStdout.write(`[${day} | ${time} ERR] ${util.format(d)}` + "\n");
    };

    console.warn = function (d) {
        const day = dg(date, "Date") + ":" + dg(date, "Month") + ":" + dg(date, "FullYear");
        const time = dg(date, "Hours") + ":" + dg(date, "Minutes") + ":" + dg(date, "Seconds");
        logStream.write(`[${day} | ${time} WAR] ${util.format(d)}` + "\n");
        logStdout.write(`[${day} | ${time} WAR] ${util.format(d)}` + "\n");
    };
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

        guild = await bot.guilds.fetch("1154446248934387828");
        channel = await guild.channels.fetch("1290052054273757249");
        const logEmbed = new EmbedBuilder()
            .setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() })
            .setTitle(title)
            .setDescription(description)
            .setColor(color)
            .setFooter({ text: `LSPD | LEA-Bot v${process.env.version} ✏️`, iconURL: bot.LEA.i.LSPD });
        await channel.send({ embeds: [logEmbed], files: files });
    } else if (gotServer.id === 2) {
        let files = [];
        if (!!file) files = [file];

        guild = await bot.guilds.fetch("1139266097921675345");
        channel = await guild.channels.fetch("1204181260688167012");
        const logEmbed = new EmbedBuilder()
            .setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() })
            .setTitle(title)
            .setDescription(description)
            .setColor(color)
            .setFooter({ text: `LSSD | LEA-Bot v${process.env.version} ✏️`, iconURL: bot.LEA.i.LSSD });
        await channel.send({ embeds: [logEmbed], files: files });
    } else if (gotServer.id === 3) {
        let files = [];
        if (!!file) files = [file];

        guild = await bot.guilds.fetch("1301163398515396668");
        channel = await guild.channels.fetch("1301163400466010167");
        const logEmbed = new EmbedBuilder()
            .setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() })
            .setTitle(title)
            .setDescription(description)
            .setColor(color)
            .setFooter({ text: `SAHP | LEA-Bot v${process.env.version} ✏️`, iconURL: bot.LEA.i.SAHP });
        await channel.send({ embeds: [logEmbed], files: files });
    }
}

export async function simpleLog(bot, guildID, options) {
    const gotServer = getServer(guildID);

    let guild, channel;
    if (gotServer.id === 1) {
        guild = await bot.guilds.fetch("1154446248934387828");
        channel = await guild.channels.fetch("1269400178415112283");
    } else if (gotServer.id === 2) {
        guild = await bot.guilds.fetch("1139266097921675345");
        channel = await guild.channels.fetch("1266109055135383693");
    } else if (gotServer.id === 3) {
        guild = await bot.guilds.fetch("1301163398515396668");
        channel = await guild.channels.fetch("1301163400935768160");
    }

    const logEmbed = new EmbedBuilder()
        .setAuthor(options.author)
        .setTitle(options.title)
        .setColor(options.color)
        .setFooter(options.footer);
    if (options.description) logEmbed.setDescription(options.description);
    await channel.send({ embeds: [logEmbed] });
}