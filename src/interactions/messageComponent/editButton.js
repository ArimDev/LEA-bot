import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, InteractionType, ModalBuilder, TextInputBuilder, TextInputStyle, time } from "discord.js";
import fs from "fs";
import path from "path";
import { checkDB, checkEVENT, getDB, getServer } from "../../../src/functions/db.js";

export default async function run(bot, i) {
    let authorID;
    if (i.customId.includes("_")) authorID = i.customId.split("_")[2];
    else authorID = i.message.interaction.user.id;

    let passed = false;
    if (i.user.id === bot.LEA.o) passed = true; //PetyXbron / b1ngo
    if (i.user.id === authorID) passed = true;
    if (bot.LEA.g.LSPD.includes(i.guild.id) && !passed) {
        if (i.member.roles.cache.has("xxx" /* MISSING ID */)) passed = true; //Leadership
    } else if (bot.LEA.g.LSSD.includes(i.guild.id) && !passed) {
        if (i.member.roles.cache.has("1267541873451339806")) passed = true; //Leadership
    } else if (bot.LEA.g.SAHP.includes(i.guild.id) && !passed) {
        if (i.member.roles.cache.has("1301163398557339686")) passed = true; //Leadership
    }

    if (!passed) return i.reply({ content: "> 🛑 **Tenhle zápis nemáš právo upravovat.**", ephemeral: true });

    const worker = getDB(authorID).data;
    const embed = i.message.embeds[0];
    const type = i.customId.split("_")[1];
    const recordID = parseInt(embed.fields[0].name.split("#")[1]);
    const record = type === "duty" ? worker.duties[recordID - 1] : worker.apologies[recordID - 1];

    if (type === "duty") {
        if (!record || !record.date || !record.start || !record.end) {
            return i.reply({ content: "> 🛑 **Tenhle zápis nejde upravit.**", ephemeral: true });
        }

        const modal = new ModalBuilder()
            .setCustomId("dutyOwModal")
            .setTitle("LEA | Přepis služby");

        const dateInput = new TextInputBuilder()
            .setCustomId("datum")
            .setLabel("Datum služby")
            .setStyle(TextInputStyle.Short)
            .setValue(record.date)
            .setPlaceholder(record.date)
            .setMinLength(10)
            .setMaxLength(12)
            .setRequired(true);

        const startInput = new TextInputBuilder()
            .setCustomId("start")
            .setLabel("Začátek služby")
            .setStyle(TextInputStyle.Short)
            .setValue(record.start)
            .setPlaceholder(record.start)
            .setMinLength(5)
            .setMaxLength(5)
            .setRequired(true);

        const endInput = new TextInputBuilder()
            .setCustomId("end")
            .setLabel("Konec služby")
            .setStyle(TextInputStyle.Short)
            .setValue(record.end)
            .setPlaceholder(record.end)
            .setMinLength(5)
            .setMaxLength(5)
            .setRequired(true);

        const actionRow0 = new ActionRowBuilder().addComponents(dateInput);
        const actionRow1 = new ActionRowBuilder().addComponents(startInput);
        const actionRow2 = new ActionRowBuilder().addComponents(endInput);

        modal.addComponents(actionRow0, actionRow1, actionRow2);

        i.showModal(modal);

        await i.awaitModalSubmit({ filter: int => int.user.id === i.user.id, time: 600000 })
            .then(async (submit) => {
                if ((submit.fields.getTextInputValue("datum").split(" ").length - 1) !== 2) {
                    return submit.reply({
                        content:
                            "### Nalezena chyba - datum!"
                            + "\n- Formát data je špatně. Napiš např. `24. 12. 2023` (tečky a mezery)"
                            + "\nZadal(a) jsi:\n"
                            + `> **Datum:** \`${submit.fields.getTextInputValue("datum")}\`\n`
                            + `> **Od:** \`${submit.fields.getTextInputValue("start")}\`\n`
                            + `> **Do:** \`${submit.fields.getTextInputValue("end")}\``,
                        ephemeral: true
                    });
                } else if (!submit.fields.getTextInputValue("start").includes(":") || !submit.fields.getTextInputValue("end").includes(":")) {
                    return submit.reply({
                        content:
                            "### Nalezena chyba - čas!"
                            + "\n- V některém z časů se neobjevila `:`."
                            + "\nZadal(a) jsi:\n"
                            + `> **Datum:** \`${submit.fields.getTextInputValue("datum")}\`\n`
                            + `> **Od:** \`${submit.fields.getTextInputValue("start")}\`\n`
                            + `> **Do:** \`${submit.fields.getTextInputValue("end")}\``,
                        ephemeral: true
                    });
                }

                await submit.deferReply({ ephemeral: true });

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("summary_" + authorID)
                            .setStyle(ButtonStyle.Success)
                            .setEmoji("📑"),
                    ).addComponents(
                        new ButtonBuilder()
                            .setCustomId("editButton_duty_" + authorID)
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji("📝"),
                    ).addComponents(
                        new ButtonBuilder()
                            .setCustomId("deleteButton_duty_" + authorID)
                            .setStyle(ButtonStyle.Danger)
                            .setEmoji("🗑️"),
                    );

                let hours,
                    h1 = parseInt(submit.fields.getTextInputValue("start").split(":")[0]),
                    h2 = parseInt(submit.fields.getTextInputValue("end").split(":")[0]),
                    m1 = parseInt(submit.fields.getTextInputValue("start").split(":")[1]),
                    m2 = parseInt(submit.fields.getTextInputValue("end").split(":")[1]),
                    min1 = h1 * 60 + m1,
                    min2 = h2 * 60 + m2;
                hours = (min2 - min1) / 60;
                if (hours < 0) hours = hours + 24;
                hours = Math.round((hours + Number.EPSILON) * 100) / 100;

                worker.hours = worker.hours - record.hours;
                record.date = submit.fields.getTextInputValue("datum");
                record.start = submit.fields.getTextInputValue("start");
                record.end = submit.fields.getTextInputValue("end");
                record.hours = hours;
                worker.hours = (Math.round((parseFloat(worker.hours) + Number.EPSILON) * 100) / 100) + hours;

                const dutyEmbed = new EmbedBuilder(embed)
                    .setFields([
                        {
                            name: `Služba #` + recordID, inline: false,
                            value:
                                `> **Datum:** \`${submit.fields.getTextInputValue("datum")}\`\n`
                                + `> **Od:** \`${submit.fields.getTextInputValue("start")}\`\n`
                                + `> **Do:** \`${submit.fields.getTextInputValue("end")}\`\n`
                                + `> **Hodin:**  \`${hours}\`\n`
                                + `Upravil(a) <@${i.user.id}>.`
                        }
                    ]);

                await i.message.edit({ embeds: [dutyEmbed], components: [row] });

                let workersPath;
                if (bot.LEA.g.LSPD.includes(i.guild.id)) workersPath = (path.resolve("./db/LSPD") + "/" + authorID + ".json");
                else if (bot.LEA.g.LSSD.includes(i.guild.id)) workersPath = (path.resolve("./db/LSSD") + "/" + authorID + ".json");
                else if (bot.LEA.g.SAHP.includes(i.guild.id)) workersPath = (path.resolve("./db/SAHP") + "/" + authorID + ".json");

                fs.writeFileSync(
                    workersPath,
                    JSON.stringify(worker, null, 4)
                );

                console.log(" < [DB/Duty] >  " + i.member.displayName + " přepsala(a) duty o délce " + hours.toString() + " hodin");
                return submit.editReply({ content: "> ✅ **Zápis byl upraven.**" });
            })
            .catch(e => null);
    } else {
        if (
            !record
            || !record.eventID || !record.start || !record.end || !record.ooc || !record.ic
            || record.ooc.length > 100 || record.ic.length > 100
        ) {
            return i.reply({ content: "> 🛑 **Tenhle zápis nelze upravit.**", ephemeral: true });
        }

        const modal = new ModalBuilder()
            .setCustomId("apologyOwModal")
            .setTitle("LEA | Přepis omluvenky");

        const eventIDInput = new TextInputBuilder()
            .setCustomId("eventID")
            .setLabel("ID Události (nepovinné)")
            .setStyle(TextInputStyle.Short)
            .setValue(record.eventID.toString()) //x
            .setPlaceholder(record.eventID.toString())
            .setMaxLength(5)
            .setRequired(false);

        const startInput = new TextInputBuilder()
            .setCustomId("start")
            .setLabel("Od kdy")
            .setStyle(TextInputStyle.Short)
            .setValue(record.start)
            .setPlaceholder(record.start)
            .setMinLength(10)
            .setMaxLength(12)
            .setRequired(true);

        const endInput = new TextInputBuilder()
            .setCustomId("end")
            .setLabel("Do kdy")
            .setStyle(TextInputStyle.Short)
            .setValue(record.end)
            .setPlaceholder(record.end)
            .setMinLength(10)
            .setMaxLength(12)
            .setRequired(true);

        const oocInput = new TextInputBuilder()
            .setCustomId("ooc")
            .setLabel("OOC důvod")
            .setStyle(TextInputStyle.Paragraph)
            .setValue(record.ooc)
            .setPlaceholder(record.ooc)
            .setMaxLength(100)
            .setRequired(true);

        const icInput = new TextInputBuilder()
            .setCustomId("ic")
            .setLabel("IC důvod")
            .setStyle(TextInputStyle.Paragraph)
            .setValue(record.ic)
            .setPlaceholder(record.ic)
            .setMaxLength(100)
            .setRequired(true);

        const actionRow0 = new ActionRowBuilder().addComponents(eventIDInput);
        const actionRow1 = new ActionRowBuilder().addComponents(startInput);
        const actionRow2 = new ActionRowBuilder().addComponents(endInput);
        const actionRow3 = new ActionRowBuilder().addComponents(oocInput);
        const actionRow4 = new ActionRowBuilder().addComponents(icInput);

        modal.addComponents(actionRow0, actionRow1, actionRow2, actionRow3, actionRow4);

        i.showModal(modal);

        await i.awaitModalSubmit({ filter: int => int.user.id === i.user.id, time: 600000 })
            .then(async (submit) => {
                if (
                    (submit.fields.getTextInputValue("start").split(" ").length) !== 3
                    || (submit.fields.getTextInputValue("end").split(" ").length) !== 3
                ) {
                    return submit.reply({
                        content:
                            "### Nalezena chyba - datum!"
                            + "\n- Formát data je špatně. Napiš např. `24. 12. 2023` (tečky a mezery)"
                            + "\nZadal(a) jsi:\n"
                            + (submit.fields.getTextInputValue("eventID") ? `> **ID Události:** \`${submit.fields.getTextInputValue("eventID")}\`\n` : "")
                            + `> **Začátek:** \`${submit.fields.getTextInputValue("start")}\`\n`
                            + `> **Konec:** \`${submit.fields.getTextInputValue("end")}\`\n`
                            + `> **OOC Důvod:** \`${submit.fields.getTextInputValue("ooc")}\`\n`
                            + `> **IC Důvod:** \`${submit.fields.getTextInputValue("ic")}\``,
                        ephemeral: true
                    });
                }

                await submit.deferReply({ ephemeral: true });

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("summary_" + authorID)
                            .setStyle(ButtonStyle.Success)
                            .setEmoji("📑"),
                    ).addComponents(
                        new ButtonBuilder()
                            .setCustomId("editButton_apology_" + authorID)
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji("📝"),
                    ).addComponents(
                        new ButtonBuilder()
                            .setCustomId("deleteButton_apology_" + authorID)
                            .setStyle(ButtonStyle.Danger)
                            .setEmoji("🗑️"),
                    );

                record.start = submit.fields.getTextInputValue("start");
                record.end = submit.fields.getTextInputValue("end");
                record.ooc = submit.fields.getTextInputValue("ooc");
                record.ic = submit.fields.getTextInputValue("ic");

                const apologyEmbed = new EmbedBuilder(embed)
                    .setFields([
                        {
                            name: `Omluvenka #` + recordID, inline: false,
                            value:
                                `> **ID Události:** \`${submit.fields.getTextInputValue("eventID") || "0"}\`\n`
                                + `> **Začátek:** \`${submit.fields.getTextInputValue("start")}\`\n`
                                + `> **Konec:** \`${submit.fields.getTextInputValue("end")}\`\n`
                                + `> **OOC Důvod:** \`${submit.fields.getTextInputValue("ooc")}\`\n`
                                + `> **IC Důvod:** \`${submit.fields.getTextInputValue("ic")}\`\n`
                                + `Upravil(a) <@${i.user.id}>.`
                        }
                    ]);

                await i.message.edit({ embeds: [apologyEmbed], components: [row] });

                let workersPath;
                if (bot.LEA.g.LSPD.includes(i.guild.id)) workersPath = (path.resolve("./db/LSPD") + "/" + authorID + ".json");
                else if (bot.LEA.g.LSSD.includes(i.guild.id)) workersPath = (path.resolve("./db/LSSD") + "/" + authorID + ".json");
                else if (bot.LEA.g.SAHP.includes(i.guild.id)) workersPath = (path.resolve("./db/SAHP") + "/" + authorID + ".json");

                fs.writeFileSync(
                    workersPath,
                    JSON.stringify(worker, null, 4)
                );

                console.log(" < [DB/Duty] >  " + i.member.displayName + " přepsala(a) duty o délce " + hours.toString() + " hodin");
                return submit.editReply({ content: "> ✅ **Zápis byl upraven.**" });
            })
            .catch(e => null);
    }
}