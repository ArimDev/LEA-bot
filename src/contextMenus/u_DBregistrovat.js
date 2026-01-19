import { ActionRowBuilder, ApplicationCommandType, ButtonBuilder, ButtonStyle, ContextMenuCommandBuilder, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import fs from "fs";
import path from "path";
import { checkDB, getDB } from "../functions/db.js";
import { dcLog } from "../functions/logSystem.js";

export const context = new ContextMenuCommandBuilder()
    .setName('DB Registrovat')
    .setContexts([0])
    .setIntegrationTypes([0])
    .setType(ApplicationCommandType.User);

export default async function run(bot, i) {
    const user = i.targetUser;

    let passed = false, SAND = false;
    i.guild.fetch();
    const admin = i.member;
    if (admin.id === bot.LEA.o) passed = true; //PetyXbron / b1ngo
    if (bot.LEA.g.LSPD.includes(i.guild.id) && !passed) {
        if (admin.roles.cache.has("1301163398540689494")) passed = true; //Government
        if (admin.roles.cache.has("1301163398557339686")) passed = true; //Leadership
    } else if (bot.LEA.g.LSSD.includes(i.guild.id) && !passed) {
        if (admin.roles.cache.has("1391525312994738206")) passed = true; //Government
        if (admin.roles.cache.has("1391525298461347971")) passed = true; //Leadership
        if (admin.roles.cache.has("1391525331835420722")) passed = true; //FTO Commander
    } else if (bot.LEA.g.SAHP.includes(i.guild.id) && !passed) {
        if (admin.roles.cache.has("xxx" /* MISSING ID */)) passed = true; //Leadership
    } else if (bot.LEA.g.SAND.includes(i.guild.id) && !passed) {
        if (admin.roles.cache.has("1342063021991661572")) passed = true; //CO
    }

    if (!passed) return i.reply({ content: "> 🛑 **K tomuhle má přístup jen admin.**", ephemeral: true });
    if (bot.LEA.g.SAND.includes(i.guild.id)) SAND = true;

    if (checkDB(user.id)) {
        const gotDB = getDB(user.id);
        return i.reply({ content: `> 🛑 <@${user.id}> **už je v DB. (Členem ${gotDB.guildName}.)**`, ephemeral: true });
    }

    const modal = new ModalBuilder()
        .setCustomId("loginModal")
        .setTitle("LEA | Přihlášení");

    const idInput = new TextInputBuilder()
        .setCustomId("id")
        .setLabel("ID Discord člena")
        .setStyle(TextInputStyle.Short)
        .setValue(user.id.toString())
        .setRequired(true);

    const nameInput = new TextInputBuilder()
        .setCustomId("name")
        .setLabel("Jméno")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Will Smith")
        .setRequired(true);

    const callInput = new TextInputBuilder()
        .setCustomId("call")
        .setLabel("Volačka")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Heaven-2")
        .setRequired(true);

    const badgeInput = new TextInputBuilder()
        .setCustomId("badge")
        .setLabel("Číslo odznaku")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("1033")
        .setMinLength(3)
        .setMaxLength(4)
        .setRequired(true);

    const rankInput = new TextInputBuilder()
        .setCustomId("rank")
        .setLabel("Hodnost")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Trooper II")
        .setRequired(true);

    const actionRow0 = new ActionRowBuilder().addComponents(idInput);
    const actionRow1 = new ActionRowBuilder().addComponents(nameInput);
    const actionRow2 = new ActionRowBuilder().addComponents(callInput);
    const actionRow3 = new ActionRowBuilder().addComponents(badgeInput);
    const actionRow4 = new ActionRowBuilder().addComponents(rankInput);

    modal.addComponents(actionRow0, actionRow1, actionRow2, ...(!SAND ? [actionRow3] : []), actionRow4);

    i.showModal(modal);
};