import { ActionRowBuilder, ApplicationCommandType, ButtonBuilder, ButtonStyle, ContextMenuCommandBuilder, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import fs from "fs";
import path from "path";
import { checkDB, getDB } from "../functions/db.js";
import { dcLog } from "../functions/logSystem.js";

export const context = new ContextMenuCommandBuilder()
    .setName('Zkontrolovat v DB')
    .setType(ApplicationCommandType.User)
    .setDMPermission(false);

export default async function run(bot, i) {
    const user = i.targetUser;

    let passed = false;
    await i.guild.fetch();
    const admin = await i.member;
    if (admin.id === "411436203330502658") passed = true; //PetyXbron / b1ngo
    if (bot.LEA.g.LSPD.includes(i.guild.id) && !passed) {
        if (admin.roles.cache.has("1154446249005690917")) passed = true; //Staff team Refresh
        if (admin.roles.cache.has("1201813866548580443")) passed = true; //.
        if (admin.roles.cache.has("1154446249005690916")) passed = true; //*
        if (admin.id === "846451292388851722") passed = true; //aldix_eu
        if (admin.id === "644571265725628437") passed = true; //griffin0s
    } else if (bot.LEA.g.LSSD.includes(i.guild.id) && !passed) {
        if (admin.roles.cache.has("1139267137651884072")) passed = true; //Leadership
        if (admin.roles.cache.has("1139295201282764882")) passed = true; //FTO Commander
    }

    if (!passed) return i.reply({ content: "> 🛑 **K tomuhle má přístup jen admin.**", ephemeral: true });

    if (!(await checkDB(user.id))) return i.reply({ content: "> 🛑 <@" + user.id + "> **není v DB.**", ephemeral: true });

    let log, sbor;
    if (bot.LEA.g.LSPD.includes(i.guild.id)) log = path.resolve("./db/LSPD") + "/" + user.id + ".json", sbor = "LSPD";
    else if (bot.LEA.g.LSSD.includes(i.guild.id)) log = path.resolve("./db/LSSD") + "/" + user.id + ".json", sbor = "LSSD";
    else return i.reply({ content: "> 🛑 **Tenhle server není uveden a seznamu.**\nKontaktuj majitele (viz. </menu:1170376396678377596>).", ephemeral: true });

    if (!fs.existsSync(log)) {
        if (bot.LEA.g.LSPD.includes(i.guild.id)) log = path.resolve("./db/LSSD") + "/" + user.id + ".json", sbor = "LSSD";
        else if (bot.LEA.g.LSSD.includes(i.guild.id)) log = path.resolve("./db/LSPD") + "/" + user.id + ".json", sbor = "LSPD";
    }

    console.log(" < [CMD/DB] >  " + i.member.displayName + ` zobrazil(a) DB záznam ${user.id}.json`);

    i.reply({ content: `> ✅ **<@${user.id}>, členem \`${sbor}\`**`, files: [log], ephemeral: true });
};