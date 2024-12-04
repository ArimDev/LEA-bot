import { ActionRowBuilder, ApplicationCommandType, ButtonBuilder, ButtonStyle, ContextMenuCommandBuilder, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import fs from "fs";
import path from "path";
import { checkDB, getDB } from "../functions/db.js";
import { dcLog } from "../functions/logSystem.js";

export const context = new ContextMenuCommandBuilder()
    .setName('DB Upravit')
    .setContexts([0])
    .setIntegrationTypes([0])
    .setType(ApplicationCommandType.User);

export default async function run(bot, i) {
    const user = i.targetUser;

    let passed = false;
    i.guild.fetch();
    const admin = i.member;
    if (admin.id === "411436203330502658") passed = true; //PetyXbron / b1ngo
    if (bot.LEA.g.LSPD.includes(i.guild.id) && !passed) {
        if (admin.roles.cache.has("xxx" /* MISSING ID */)) passed = true; //Leadership
    } else if (bot.LEA.g.LSSD.includes(i.guild.id) && !passed) {
        if (admin.roles.cache.has("1267541873451339806")) passed = true; //Leadership
        if (admin.roles.cache.has("1251504025610747966")) passed = true; //FTO Commander
    } else if (bot.LEA.g.SAHP.includes(i.guild.id) && !passed) {
        if (admin.roles.cache.has("1301163398557339686")) passed = true; //Leadership
    }

    if (!passed) return i.reply({ content: "> 🛑 **K tomuhle má přístup jen admin.**", ephemeral: true });

    if (!(checkDB(user.id))) return i.reply({ content: "> 🛑 <@" + user.id + "> **už není v DB.**", ephemeral: true });

    const gotDB = getDB(user.id);
    const data = gotDB.data;
    if (!bot.LEA.g[gotDB.guildName].includes(i.guild.id)) return i.reply({ content: `> 🛑 **<@${user.id}> je členem \`${gotDB.guildName}\`!** (Nemůžeš ho upravit)`, ephemeral: true });

    const modal = new ModalBuilder()
        .setCustomId("editModal")
        .setTitle("LEA | Úprava DB");

    const idInput = new TextInputBuilder()
        .setCustomId("id")
        .setLabel("ID Discord člena")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder(user.id)
        .setValue(user.id)
        .setRequired(true);

    const nameInput = new TextInputBuilder()
        .setCustomId("name")
        .setLabel("Jméno")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder(data.name)
        .setValue(data.name)
        .setRequired(true);

    const callInput = new TextInputBuilder()
        .setCustomId("call")
        .setLabel("Volačka")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder(data.radio)
        .setValue(data.radio)
        .setRequired(true);

    const badgeInput = new TextInputBuilder()
        .setCustomId("badge")
        .setLabel("Číslo odznaku")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder(data.badge.toString())
        .setValue(data.badge.toString())
        .setMinLength(3)
        .setMaxLength(4)
        .setRequired(true);

    const rankInput = new TextInputBuilder()
        .setCustomId("rank")
        .setLabel("Hodnost")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder(data.rank)
        .setValue(data.rank)
        .setRequired(true);

    const actionRow0 = new ActionRowBuilder().addComponents(idInput);
    const actionRow1 = new ActionRowBuilder().addComponents(nameInput);
    const actionRow2 = new ActionRowBuilder().addComponents(callInput);
    const actionRow3 = new ActionRowBuilder().addComponents(badgeInput);
    const actionRow4 = new ActionRowBuilder().addComponents(rankInput);

    modal.addComponents(actionRow0, actionRow1, actionRow2, actionRow3, actionRow4);

    i.showModal(modal);
};