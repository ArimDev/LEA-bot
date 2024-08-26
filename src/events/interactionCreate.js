import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, InteractionType, ModalBuilder, TextInputBuilder, TextInputStyle, time } from "discord.js";
import fs from "fs";
import path from "path";
import { checkDB, getServer } from "../../src/functions/db.js";
import { dcLog, simpleLog } from "../../src/functions/logSystem.js";
import { findWorker } from "../../src/functions/profiles.js";
import { live } from "../../src/functions/liveTables.js";
import { generateFooter } from "../../src/functions/other.js";

export default async function (bot, i) {
    if (
        !i.isUserContextMenuCommand()
        && i.type !== InteractionType.ApplicationCommand
        && i.type !== InteractionType.MessageComponent
        && i.type !== InteractionType.ModalSubmit
    ) return;

    /*console.log(" < [CMD/*] >  " + i.user.username + ` se pokusil o příkaz při údržbě!`);
    return i.reply({
        content:
            `> 🛑 ***Probíhá údržba bota!***
            > Odhadovaný konec: <t:1715625900:R>
            > Správce: <@411436203330502658>`,
        ephemeral: true });*/

    if (i.isUserContextMenuCommand() || i.type === InteractionType.ApplicationCommand) {
        let cmdName = i.commandName;
        if (i.isUserContextMenuCommand()) {
            cmdName = i.commandName.replaceAll(" ", "");
            cmdName = "u_" + cmdName;
        }

        let lowSlashes = new Map();
        bot.slashes.forEach((value, key) =>
            lowSlashes.set(key.toLowerCase(), value)
        );

        const command = lowSlashes.get(cmdName.toLowerCase());
        if (command) {
            command.default(bot, i);
        }
    }

    if (i.type === InteractionType.MessageComponent) {
        if (i.customId === "edit") {
            let passed = false;
            await i.guild.fetch();
            const admin = await i.member;
            if (admin.id === "411436203330502658") passed = true; //PetyXbron / b1ngo
            if (bot.LEA.g.LSPD.includes(i.guild.id) && !passed) {
                if (admin.roles.cache.has("1201813866548580443")) passed = true; //.
                if (admin.roles.cache.has("1267541873451339806")) passed = true; //Leadership
                if (admin.id === "644571265725628437") passed = true; //griffin0s
            } else if (bot.LEA.g.LSCSO.includes(i.guild.id) && !passed) {
                if (admin.roles.cache.has("1139267137651884072")) passed = true; //Leadership
                if (admin.roles.cache.has("1139295201282764882")) passed = true; //FTO Commander
            }
            if (admin.id === i.message.interaction.user.id) passed = true; //Owner
            if (!passed) {
                return i.reply({ content: "> 🛑 **Nemůžeš přepisovat cizí záznamy!**", ephemeral: true });
            }

            let type;
            if (i.message.embeds[0] && i.message.embeds[0].title === "Záznam služby") type = 0;
            if (i.message.embeds[0] && i.message.embeds[0].title === "Omluvenka") type = 1;

            if (type === 0) {
                const modal = new ModalBuilder()
                    .setCustomId("dutyOWModal")
                    .setTitle("LEA | Přepis služby");

                const today = new Date();

                const dateInput = new TextInputBuilder()
                    .setCustomId("datum")
                    .setLabel("Datum služby")
                    .setStyle(TextInputStyle.Short)
                    .setValue(today.getDate() + ". " + (parseInt(today.getMonth()) + 1) + ". " + today.getFullYear())
                    .setPlaceholder(today.getDate() + ". " + (parseInt(today.getMonth()) + 1) + ". " + today.getFullYear())
                    .setMinLength(10)
                    .setMaxLength(12)
                    .setRequired(true);

                const startInput = new TextInputBuilder()
                    .setCustomId("start")
                    .setLabel("Začátek služby")
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder("13:00")
                    .setMinLength(5)
                    .setMaxLength(5)
                    .setRequired(true);

                const endInput = new TextInputBuilder()
                    .setCustomId("end")
                    .setLabel("Konec služby")
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder("17:00")
                    .setMinLength(5)
                    .setMaxLength(5)
                    .setRequired(true);

                const actionRow0 = new ActionRowBuilder().addComponents(dateInput);
                const actionRow1 = new ActionRowBuilder().addComponents(startInput);
                const actionRow2 = new ActionRowBuilder().addComponents(endInput);

                modal.addComponents(actionRow0, actionRow1, actionRow2);

                await i.showModal(modal);
            } else if (type === 1) {
                const modal = new ModalBuilder()
                    .setCustomId("apologyOWModal")
                    .setTitle("LEA | Přepis omluvenky");

                const today = new Date();

                const eventIDInput = new TextInputBuilder()
                    .setCustomId("eventID")
                    .setLabel("ID Události (nepovinné)")
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder("1")
                    .setMaxLength(5)
                    .setRequired(false);

                const startInput = new TextInputBuilder()
                    .setCustomId("start")
                    .setLabel("Od kdy")
                    .setStyle(TextInputStyle.Short)
                    .setValue(today.getDate() + ". " + (parseInt(today.getMonth()) + 1) + ". " + today.getFullYear())
                    .setPlaceholder(today.getDate() + ". " + (parseInt(today.getMonth()) + 1) + ". " + today.getFullYear())
                    .setMinLength(10)
                    .setMaxLength(12)
                    .setRequired(true);

                const endInput = new TextInputBuilder()
                    .setCustomId("end")
                    .setLabel("Do kdy")
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder("5. 1. 2024")
                    .setMinLength(10)
                    .setMaxLength(12)
                    .setRequired(true);

                const oocInput = new TextInputBuilder()
                    .setCustomId("ooc")
                    .setLabel("OOC důvod")
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder("Rodinna akce")
                    .setRequired(true);

                const icInput = new TextInputBuilder()
                    .setCustomId("ic")
                    .setLabel("IC důvod")
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder("Zlomená ruka")
                    .setRequired(true);

                const actionRow0 = new ActionRowBuilder().addComponents(eventIDInput);
                const actionRow1 = new ActionRowBuilder().addComponents(startInput);
                const actionRow2 = new ActionRowBuilder().addComponents(endInput);
                const actionRow3 = new ActionRowBuilder().addComponents(oocInput);
                const actionRow4 = new ActionRowBuilder().addComponents(icInput);

                modal.addComponents(actionRow0, actionRow1, actionRow2, actionRow3, actionRow4);

                await i.showModal(modal);
            }
        }

        if (i.customId.includes("summary")) {
            let worker = {};
            if (i.customId.includes("_")) worker.id = i.customId.split("_")[1];
            else worker = i.message.interaction.user;
            await i.deferReply({ ephemeral: true });

            if (!(checkDB(worker.id))) return i.editReply({ content: "> 🛑 <@" + worker.id + "> **není v DB.**", ephemeral: true });
            const member = await i.guild.members.fetch(worker.id);

            let log;
            if (bot.LEA.g.LSPD.includes(i.guild.id)) log = JSON.parse(fs.readFileSync((path.resolve("./db/LSPD") + "/" + worker.id + ".json"), "utf-8"));
            else if (bot.LEA.g.LSCSO.includes(i.guild.id)) log = JSON.parse(fs.readFileSync((path.resolve("./db/LSCSO") + "/" + worker.id + ".json"), "utf-8"));
            else return i.editReply({ content: "> 🛑 **Tenhle server není uveden a seznamu.**\nKontaktuj majitele (viz. </menu:1170376396678377596>).", ephemeral: true });

            let moHours = 0;
            await log.duties.filter(d => !d.removed).forEach(function (e) {
                const dutyDateArr = e.date.split(". ");
                const dutyDate = new Date(dutyDateArr[1] + "/" + dutyDateArr[0] + "/" + dutyDateArr[2]).getTime();
                const todayDate = new Date().getTime();
                const ms30days = 1000 * 60 * 60 * 24 * 30;

                if (todayDate - dutyDate < ms30days) moHours = moHours + e.hours;
            });

            const summEmbed = new EmbedBuilder()
                .setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() })
                .setTitle("Souhrn zaměstnance")
                .setDescription("Pro zjištění dalších informací,\npoužij </profil:1195506010970931260>.")
                .addFields([
                    {
                        name: `Omluvenky`, inline: false,
                        value:
                            `> **Počet omluvenek:** \`${log.apologies.filter(d => !d.removed).length}\`\n`
                            + `> **Omluvenek za posledních 30 dnů:** \`${log.apologies.filter(a => !a.removed).length}\``
                    },
                    {
                        name: `Služby`, inline: false,
                        value:
                            `> **Počet vykonanných služeb:** \`${log.duties.filter(d => !d.removed).length}\`\n`
                            + `> **Hodin celkem:** \`${Math.round((log.hours + Number.EPSILON) * 100) / 100}\`\n`
                            + `> **Hodin od povýšení:** \`${Math.round(((log.hours - log.rankups.slice(-1)[0].hours) + Number.EPSILON) * 100) / 100}\`\n`
                            + `> **Hodin za posledních 30 dnů:** \`${Math.round(((await moHours) + Number.EPSILON) * 100) / 100}\``
                    }
                ])
                .setThumbnail("https://i.imgur.com/wDab7i4.png")
                .setColor(bot.LEA.c.summary)
                .setFooter(getServer(i.guild.id).footer);

            console.log(" < [DB/Souhrn] >  " + i.member.displayName + " zobrazil(a) souhrn " + member.displayName);

            await i.editReply({ embeds: [summEmbed], ephemeral: true });
        }
    }

    if (i.type === InteractionType.ModalSubmit) {
        if (i.customId === "dutyModal") {
            if (!(checkDB(i.user.id))) return i.reply({ content: "> 🛑 **Před zadáváním __duties__ a __omluvenek__ tě musí admin přilásit do DB.**\nZalož si vlastní složku a počkej na správce DB.", ephemeral: true });

            if (
                (i.fields.getTextInputValue("datum").split(" ").length - 1) !== 2
                || (i.fields.getTextInputValue("datum").split(" ").length - 1) !== 2
            ) {
                return await i.reply({
                    content:
                        "### Nalezena chyba - datum!"
                        + "\n- Formát data je špatně. Napiš např. `24. 12. 2023` (tečky a mezery)"
                        + "\nZadal(a) jsi:\n"
                        + `> **Datum:** \`${i.fields.getTextInputValue("datum")}\`\n`
                        + `> **Od:** \`${i.fields.getTextInputValue("start")}\`\n`
                        + `> **Do:** \`${i.fields.getTextInputValue("end")}\``,
                    ephemeral: true
                });
            } else if (!i.fields.getTextInputValue("start").includes(":") || !i.fields.getTextInputValue("end").includes(":")) {
                return await i.reply({
                    content:
                        "### Nalezena chyba - čas!"
                        + "\n- V některém z časů se neobjevila `:`."
                        + "\nZadal(a) jsi:\n"
                        + `> **Datum:** \`${i.fields.getTextInputValue("datum")}\`\n`
                        + `> **Od:** \`${i.fields.getTextInputValue("start")}\`\n`
                        + `> **Do:** \`${i.fields.getTextInputValue("end")}\``,
                    ephemeral: true
                });
            }

            let content;
            if (bot.LEA.g.LSPD.includes(i.guild.id)) content = JSON.parse(fs.readFileSync((path.resolve("./db/LSPD") + "/" + i.user.id + ".json"), "utf-8"));
            else if (bot.LEA.g.LSCSO.includes(i.guild.id)) content = JSON.parse(fs.readFileSync((path.resolve("./db/LSCSO") + "/" + i.user.id + ".json"), "utf-8"));
            else return i.reply({ content: "> 🛑 **Tenhle server není uveden a seznamu.**\nKontaktuj majitele (viz. </menu:1170376396678377596>).", ephemeral: true });

            try { await i.deferReply(); } catch { return; }

            const index = content.duties.length + 1;

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("summary")
                        .setStyle(ButtonStyle.Success)
                        .setEmoji("📑"),
                ).addComponents(
                    new ButtonBuilder()
                        .setCustomId("editButton")
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji("✏️")
                        .setDisabled(),
                ).addComponents(
                    new ButtonBuilder()
                        .setCustomId("deleteButton")
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji("🗑️")
                        .setDisabled(),
                );

            let hours,
                h1 = parseInt(i.fields.getTextInputValue("start").split(":")[0]),
                h2 = parseInt(i.fields.getTextInputValue("end").split(":")[0]),
                m1 = parseInt(i.fields.getTextInputValue("start").split(":")[1]),
                m2 = parseInt(i.fields.getTextInputValue("end").split(":")[1]),
                min1 = h1 * 60 + m1,
                min2 = h2 * 60 + m2;
            hours = (min2 - min1) / 60;
            if (hours < 0) hours = hours + 24;
            hours = Math.round((hours + Number.EPSILON) * 100) / 100;

            const dutyEmbed = new EmbedBuilder()
                .setAuthor({ name: i.member.displayName, iconURL: i.member.displayAvatarURL() })
                .setTitle("Záznam služby")
                .addFields([
                    {
                        name: `Duty #` + index, inline: false,
                        value:
                            `> **Datum:** \`${i.fields.getTextInputValue("datum")}\`\n`
                            + `> **Od:** \`${i.fields.getTextInputValue("start")}\`\n`
                            + `> **Do:** \`${i.fields.getTextInputValue("end")}\`\n`
                            + `> **Hodin:**  \`${hours}\``
                    }
                ])
                .setThumbnail("https://i.imgur.com/fhif3Xj.png")
                .setColor(bot.LEA.c.duty)
                .setFooter(getServer(i.guild.id).footer);

            const msg = await i.editReply({ embeds: [dutyEmbed], components: [row] });

            content.duties.push({
                "id": msg.id,
                "removed": false,
                "date": i.fields.getTextInputValue("datum"),
                "start": i.fields.getTextInputValue("start"),
                "end": i.fields.getTextInputValue("end"),
                "hours": hours
            });
            content.hours = (Math.round((parseFloat(content.hours) + Number.EPSILON) * 100) / 100) + hours;
            content.folder = i.channelId;

            let workersPath;
            if (bot.LEA.g.LSPD.includes(i.guild.id)) workersPath = (path.resolve("./db/LSPD") + "/" + i.user.id + ".json");
            else if (bot.LEA.g.LSCSO.includes(i.guild.id)) workersPath = (path.resolve("./db/LSCSO") + "/" + i.user.id + ".json");

            fs.writeFileSync(
                workersPath,
                JSON.stringify(content, null, 4)
            );

            console.log(" < [DB/Duty] >  " + i.member.displayName + " zapsal(a) duty o délce " + hours.toString() + " hodin");
        } else if (i.customId === "apologyModal") {
            let content;
            if (bot.LEA.g.LSPD.includes(i.guild.id)) content = JSON.parse(fs.readFileSync((path.resolve("./db/LSPD") + "/" + i.user.id + ".json"), "utf-8"));
            else if (bot.LEA.g.LSCSO.includes(i.guild.id)) content = JSON.parse(fs.readFileSync((path.resolve("./db/LSCSO") + "/" + i.user.id + ".json"), "utf-8"));
            else return i.reply({ content: "> 🛑 **Tenhle server není uveden a seznamu.**\nKontaktuj majitele (viz. </menu:1170376396678377596>).", ephemeral: true });

            const index = content.apologies.length + 1;

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("summary")
                        .setStyle(ButtonStyle.Success)
                        .setEmoji("📑"),
                ).addComponents(
                    new ButtonBuilder()
                        .setCustomId("editButton")
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji("✏️")
                        .setDisabled(),
                ).addComponents(
                    new ButtonBuilder()
                        .setCustomId("deleteButton")
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji("🗑️")
                        .setDisabled(),
                );

            if (
                (i.fields.getTextInputValue("start").split(" ").length) !== 3
                || (i.fields.getTextInputValue("end").split(" ").length) !== 3
            ) {
                return await i.reply({
                    content:
                        "### Nalezena chyba - datum!"
                        + "\n- Formát data je špatně. Napiš např. `24. 12. 2023` (tečky a mezery)"
                        + "\nZadal(a) jsi:\n"
                        + (i.fields.getTextInputValue("eventID") ? `> **ID Události:** \`${i.fields.getTextInputValue("eventID")}\`\n` : "")
                        + `> **Začátek:** \`${i.fields.getTextInputValue("start")}\`\n`
                        + `> **Konec:** \`${i.fields.getTextInputValue("end")}\`\n`
                        + `> **OOC Důvod:** \`${i.fields.getTextInputValue("ooc")}\`\n`
                        + `> **IC Důvod:** \`${i.fields.getTextInputValue("ic")}\``,
                    ephemeral: true
                });
            }

            await i.deferReply();

            const dutyEmbed = new EmbedBuilder()
                .setAuthor({ name: i.member.displayName, iconURL: i.member.displayAvatarURL() })
                .setTitle("Omluvenka")
                .addFields([
                    {
                        name: `Omluvenka #` + index, inline: false,
                        value:
                            `> **ID Události:** \`${i.fields.getTextInputValue("eventID") || "0"}\`\n`
                            + `> **Začátek:** \`${i.fields.getTextInputValue("start")}\`\n`
                            + `> **Konec:** \`${i.fields.getTextInputValue("end")}\`\n`
                            + `> **OOC Důvod:** \`${i.fields.getTextInputValue("ooc")}\`\n`
                            + `> **IC Důvod:** \`${i.fields.getTextInputValue("ic")}\``
                    }
                ])
                .setThumbnail("https://i.imgur.com/YQb9mPm.png")
                .setColor(bot.LEA.c.apology)
                .setFooter(getServer(i.guild.id).footer);

            const msg = await i.editReply({ embeds: [dutyEmbed], components: [row] });

            const today = new Date();
            content.apologies.push({
                "id": msg.id,
                "removed": false,
                "shared": today.getDate() + ". " + (parseInt(today.getMonth()) + 1) + ". " + today.getFullYear(),
                "eventID": parseInt(i.fields.getTextInputValue("eventID")) || 0,
                "start": i.fields.getTextInputValue("start"),
                "end": i.fields.getTextInputValue("end"),
                "ooc": i.fields.getTextInputValue("ooc"),
                "ic": i.fields.getTextInputValue("ic")
            });
            content.folder = i.channelId;

            let workersPath;
            if (bot.LEA.g.LSPD.includes(i.guild.id)) workersPath = (path.resolve("./db/LSPD") + "/" + i.user.id + ".json");
            else if (bot.LEA.g.LSCSO.includes(i.guild.id)) workersPath = (path.resolve("./db/LSCSO") + "/" + i.user.id + ".json");

            fs.writeFileSync(
                workersPath,
                JSON.stringify(content, null, 4)
            );

            console.log(" < [DB/Apology] >  " + i.member.displayName + " zapsal(a) omluvenku trvající do " + i.fields.getTextInputValue("end"));
        } else if (i.customId === "loginModal") {
            const rank = i.fields.getTextInputValue("rank"),
                name = i.fields.getTextInputValue("name"),
                radio = i.fields.getTextInputValue("call"),
                badge = i.fields.getTextInputValue("badge");
            const bl = JSON.parse(fs.readFileSync(path.resolve("./db/blacklist.json"), "utf-8"));

            //Checks
            if (checkDB(i.fields.getTextInputValue("id"), i))
                return i.reply({ content: "> 🛑 <@" + i.fields.getTextInputValue("id") + "> **už je v DB.**", ephemeral: true });
            if (bl.some(e => !e.removed && e.id === i.fields.getTextInputValue("id")))
                return i.reply({ content: `> 🛑 <@${i.fields.getTextInputValue("id")}> **je na blacklistu!**`, ephemeral: true });
            if (!radio.includes("-") || !/^\p{Lu}/u.test(radio))
                return i.reply({
                    content:
                        `> 🛑 **Formát volacího znaku (\`${radio}\`) není správný!**`
                        + "\nPravidla:"
                        + "\n- Musí obsahovat `-`"
                        + "\n- Musí začínat velkým písmenem",
                    ephemeral: true
                });
            if (await findWorker("badge", badge))
                return i.reply({ content: `> 🛑 **Číslo odznaku \`${badge}\` už je obsazené!**`, ephemeral: true });
            if (await findWorker("radio", radio))
                return i.reply({ content: `> 🛑 **Volací znak \`${radio}\` už je obsazený!**`, ephemeral: true });

            let post = false, gotNick = true, gotRole = true, folders;
            const today = new Date();
            if (i.guild.id === "1154446248934387828") { //LSPD
                folders = await i.guild.channels.fetch("1213984576100241419");
                try { var member = await i.guild.members.fetch(i.fields.getTextInputValue("id")); }
                catch (e) { await i.reply({ content: "> 🛑 **Člen nebyl nalezen.**", ephemeral: true }); return console.log(e); }

                let rolesIDs, tagID;
                if (rank === "Chief of Police") rolesIDs = ["1154446249005690910"], tagID = "1213985427724308490";
                else if (rank === "Assistant Chief of Police") rolesIDs = ["1154446248967938187"], tagID = "1213985427724308490";
                else if (rank === "Deputy Chief of Police") rolesIDs = ["1154446248967938186"], tagID = "1213985427724308490";
                else if (rank === "Commander") rolesIDs = ["1154446248967938185"], tagID = "1213985427724308490";
                else if (rank === "Captain") rolesIDs = ["1154446248967938183"], tagID = "1213985427724308490";
                else if (rank === "Lieutenant") rolesIDs = ["1267588047533248583"], tagID = "1213985427724308490";
                else if (rank === "Sergeant II") rolesIDs = ["1154446248967938181"], tagID = "1213985702484643930";
                else if (rank === "Sergeant I") rolesIDs = ["1267587700240809994"], tagID = "1213985702484643930";
                else if (rank === "Police Officer III+I") rolesIDs = ["1267588850952437800"], tagID = "1213985550458163200";
                else if (rank === "Police Officer III") rolesIDs = ["1267542148102750238"], tagID = "1213985579742797874";
                else if (rank === "Police Officer II") rolesIDs = ["1267589547462754385"], tagID = "1213985508917514250";
                else if (rank === "Police Officer") rolesIDs = ["1267589491405754369"], tagID = "1213985475396771860";
                else if (rank === "Cadet") rolesIDs = ["1267589609378812129"], tagID = "1213985402961006612";
                else rolesIDs = false, tagID = false;

                if (!rolesIDs) return i.reply({ content: `> 🛑 **Neznámá hodnost... (\`${rank}\`)**`, ephemeral: true });
                rolesIDs.push("1267590027496652961"); //LSPD role

                await i.deferReply();

                const workerEmbed = new EmbedBuilder()
                    .setAuthor({ name: `[${radio}] ${name}`, iconURL: member.displayAvatarURL() })
                    .setDescription(
                        `> **App:** <@${member.id}>`
                        + `\n> **Jméno:** \`${name}\``
                        + `\n> **Hodnost:** <@&${rolesIDs[0]}>`
                        + `\n> **Odznak:** \`${badge}\``
                        + `\n> **Volačka:** \`${radio}\``
                        + "\n\n"
                        + `\n> **Hodin:** \`0\``
                        + `\n> **Omluvenek:** \`0\``
                        + `\n> **Povýšení:** ${time(today, "R")}`
                    )
                    .setThumbnail(bot.LEA.i.LSPD)
                    .setColor(bot.LEA.c.LSPD)
                    .setFooter({ text: `LSPD | Vytvořil b1ngo 🚀`, iconURL: bot.LEA.i.LSPD });
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("summary_" + member.id)
                            .setStyle(ButtonStyle.Success)
                            .setLabel("Souhrn")
                            .setEmoji("📑"),
                    );
                post = await folders.threads.create({
                    name: `[${radio}] ${name}`,
                    message: {
                        content: `<@${member.id}>`,
                        embeds: [workerEmbed],
                        components: [row]
                    },
                    appliedTags: [tagID],
                    reason: "Registrace od " + i.user.tag
                });

                try { await member.setNickname(`[${radio}] ${name}`); } catch { gotNick = false; }
                try { await member.roles.add(rolesIDs); } catch { gotRole = false; }

                const b1ngo = await i.guild.members.fetch("411436203330502658");
                const slozkaEmbed = new EmbedBuilder()
                    .setAuthor({ name: b1ngo.displayName, iconURL: b1ngo.displayAvatarURL() })
                    .setTitle("Vítejte ve Vaší složce!")
                    .setDescription(
                        `Zdravím <@${member.id}>, gratuluji Vám k úspěšnému přijetí na hodnost <@&${rolesIDs[0]}>.`
                        + "\n**Zde si povinně zapisujete časy služeb a případné omluvenky.**"
                        + "\n\n**Službu si zapisujete pomocí </duty:1170376396678377595> a omluvenku přes </omluvenka:1170382276492800131>.**"
                        + "\nVe skutečnosti je to prosté. Systém Vás navede při použití příkazů."
                        + "\nV případě dotazů, neváhejte mě (<@411436203330502658>) označit. Ovšem, nepište DMs."
                    )
                    .setThumbnail(bot.LEA.i.LSPD)
                    .setColor(getServer(i.guild.id).color)
                    .setFooter(getServer(i.guild.id).footer);
                await post.send({ content: `<@${member.id}>`, embeds: [slozkaEmbed] });
            } else if (i.guild.id === "1139266097921675345") { //LSCSO
                folders = await i.guild.channels.fetch("1203743211000963082");
                try { var member = await i.guild.members.fetch(i.fields.getTextInputValue("id")); }
                catch (e) { await i.reply({ content: "> 🛑 **Člen nebyl nalezen.**", ephemeral: true }); console.log(e); }

                let rolesIDs, tagID;
                if (rank === "Sheriff") rolesIDs = ["1139274486085058590"], tagID = "1203829217167409192";
                else if (rank === "Undersheriff") rolesIDs = ["1139274565973983262"], tagID = "1203829217167409192";
                else if (rank === "Assistant Sheriff") rolesIDs = ["1139274629547053139"], tagID = "1203829217167409192";
                else if (rank === "Division Chief") rolesIDs = ["1139274788842516520"], tagID = "1203829217167409192";
                else if (rank === "Area Commander") rolesIDs = ["1139274892617977966"], tagID = "1203829217167409192";
                else if (rank === "Captain") rolesIDs = ["1139274974683746335"], tagID = "1203829217167409192";
                else if (rank === "Lieutenant") rolesIDs = ["1139275038877560856"], tagID = "1203829217167409192";
                else if (rank === "Sergeant") rolesIDs = ["1139275398295867453", "1139279790210306198"], tagID = "1203829180232630362";
                else if (rank === "Deputy III") rolesIDs = ["1139275782607347905"], tagID = "1203829143234551898";
                else if (rank === "Deputy II") rolesIDs = ["1139275934025916568"], tagID = "1203829113240952904";
                else if (rank === "Deputy I") rolesIDs = ["1139276036673130527"], tagID = "1203829081100001311";
                else if (rank === "Deputy Trainee") rolesIDs = ["1139276175819157646"], tagID = "1203829031049367593";
                else rolesIDs = false, tagID = false;

                if (!rolesIDs) return i.reply({ content: `> 🛑 **Neznámá hodnost... (\`${rank}\`)**`, ephemeral: true });
                rolesIDs.push("1139276300188647444"); //LSCSO role

                await i.deferReply();

                const workerEmbed = new EmbedBuilder()
                    .setAuthor({ name: `[${radio}] ${name}`, iconURL: member.displayAvatarURL() })
                    .setDescription(
                        `> **App:** <@${member.id}>`
                        + `\n> **Jméno:** \`${name}\``
                        + `\n> **Hodnost:** <@&${rolesIDs[0]}>`
                        + `\n> **Odznak:** \`${badge}\``
                        + `\n> **Volačka:** \`${radio}\``
                        + "\n\n"
                        + `\n> **Hodin:** \`0\``
                        + `\n> **Omluvenek:** \`0\``
                        + `\n> **Povýšení:** ${time(today, "R")}`
                    )
                    .setThumbnail(bot.LEA.i.LSCSO)
                    .setColor(bot.LEA.c.LSCSO)
                    .setFooter({ text: `LSCSO | Vytvořil b1ngo 🚀`, iconURL: bot.LEA.i.LSCSO });
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("summary_" + member.id)
                            .setStyle(ButtonStyle.Success)
                            .setLabel("Souhrn")
                            .setEmoji("📑"),
                    );
                post = await folders.threads.create({
                    name: `[${radio}] ${name}`,
                    message: {
                        content: `<@${member.id}>`,
                        embeds: [workerEmbed],
                        components: [row]
                    },
                    appliedTags: [tagID],
                    reason: "Registrace od " + i.user.tag
                });

                try { await member.setNickname(`[${radio}] ${name}`); } catch { gotNick = false; }
                try { await member.roles.add(rolesIDs); } catch { gotRole = false; }

                const b1ngo = await i.guild.members.fetch("411436203330502658");
                const slozkaEmbed = new EmbedBuilder()
                    .setAuthor({ name: b1ngo.displayName, iconURL: b1ngo.displayAvatarURL() })
                    .setTitle("Vítejte ve Vaší složce!")
                    .setDescription(
                        `Zdravím <@${member.id}>, gratuluji Vám k úspěšnému přijetí na hodnost <@&${rolesIDs[0]}>.`
                        + "\n**Zde si povinně zapisujete časy služeb a případné omluvenky.**"
                        + "\n\n**Službu si zapisujete pomocí </duty:1170376396678377595> a omluvenku přes </omluvenka:1170382276492800131>.**"
                        + "\nVe skutečnosti je to prosté. Systém Vás navede při použití příkazů."
                        + "\nV případě dotazů, neváhejte mě (<@411436203330502658>) označit. Ovšem, nepište DMs."
                    )
                    .setThumbnail(bot.LEA.i.LSCSO)
                    .setColor(getServer(i.guild.id).color)
                    .setFooter(getServer(i.guild.id).footer);
                await post.send({ content: `<@${member.id}>`, embeds: [slozkaEmbed] });
            }

            const worker = {
                "active": true,
                "badge": parseInt(i.fields.getTextInputValue("badge")),
                "name": i.fields.getTextInputValue("name"),
                "radio": i.fields.getTextInputValue("call"),
                "rank": i.fields.getTextInputValue("rank"),
                "folder": post ? post.id : null,
                "hours": 0,
                "duties": [],
                "apologies": [],
                "reputations": [],
                "rankups": [
                    {
                        "date": today.getDate() + ". " + (parseInt(today.getMonth()) + 1) + ". " + today.getFullYear(),
                        "to": i.fields.getTextInputValue("rank"),
                        "from": null,
                        "boss": i.member.displayName,
                        "hours": 0
                    }
                ]
            };

            let workersPath;
            if (bot.LEA.g.LSPD.includes(i.guild.id)) workersPath = (path.resolve("./db/LSPD") + "/" + i.fields.getTextInputValue("id") + ".json");
            else if (bot.LEA.g.LSCSO.includes(i.guild.id)) workersPath = (path.resolve("./db/LSCSO") + "/" + i.fields.getTextInputValue("id") + ".json");
            else return i.editReply({ content: "> 🛑 **Tenhle server není uveden a seznamu.**\nKontaktuj majitele (viz. </menu:1170376396678377596>).", ephemeral: true });

            fs.writeFileSync(
                workersPath,
                JSON.stringify(worker, null, 4)
            );

            const loginEmbed = new EmbedBuilder()
                .setTitle("Složka vytvořena!")
                .setDescription(
                    `<@${i.fields.getTextInputValue("id")}> byl(a) přihlášen(a) do systému.`
                    + (post ? `\n> **Složka:** <#${post.id}>` : "\n> **Složka:** ✅")
                    + "\n> **Přezdívka:** " + (gotNick ? "✅" : "❌")
                    + "\n> **Role:** " + (gotRole ? "✅" : "❌")
                    + "\n> **Databáze:** ✅"
                )
                .setColor(getServer(i.guild.id).color)
                .setFooter(getServer(i.guild.id).footer);

            await dcLog(bot, i.guild.id, i.member,
                {
                    title: "Přidání do DB",
                    description:
                        `**<@${i.user.id}> přidal(a) <@${i.fields.getTextInputValue("id")}> do DB.**`
                        + `\n> **Jméno:** \`${i.fields.getTextInputValue("name")}\``
                        + `\n> **Hodnost:** \`${i.fields.getTextInputValue("rank")}\``
                        + `\n> **Volačka:** \`${i.fields.getTextInputValue("call")}\``
                        + `\n> **Odznak:** \`${i.fields.getTextInputValue("badge")}\``,
                    color: "#00ff0d"
                }
            );
            await simpleLog(bot, i.guild.id,
                {
                    author: { name: `[${i.fields.getTextInputValue("call")}] ${i.fields.getTextInputValue("name")}`, iconURL: member.displayAvatarURL() },
                    title: "Přijetí",
                    color: "#00ff0d",
                    footer: { text: i.member.displayName, iconURL: i.member.displayAvatarURL() }
                }
            );

            live(getServer(i.guild.id).name);

            console.log(" < [DB/Login] >  " + i.member.displayName + " zaregistroval(a) [" + i.fields.getTextInputValue("call") + "] " + i.fields.getTextInputValue("name") + " do DB");

            await i.editReply({ embeds: [loginEmbed] });
        } else if (i.customId === "rankUpModal") {
            if (!(checkDB(i.fields.getTextInputValue("id"), i))) return i.reply({ content: "> 🛑 <@" + i.fields.getTextInputValue("id") + "> **není v DB.**", ephemeral: true });
            const member = await i.guild.members.fetch(i.fields.getTextInputValue("id"));
            if (!member) return i.reply({ content: "> 🛑 <@" + i.fields.getTextInputValue("id") + "> **není v DB.**", ephemeral: true });

            let content, oldRolesIDs, rolesIDs, tagID, gotNick = true, gotRole = true, newRank = i.fields.getTextInputValue("rank"),
                oldGrade, newGrade;
            if (i.guild.id === "1154446248934387828") { //LSPD
                if (newRank === "Chief of Police") rolesIDs = ["1154446249005690910"], tagID = "1213985427724308490", newGrade = 15;
                else if (newRank === "Assistant Chief of Police") rolesIDs = ["1154446248967938187"], tagID = "1213985427724308490", newGrade = 14;
                else if (newRank === "Deputy Chief of Police") rolesIDs = ["1154446248967938186"], tagID = "1213985427724308490", newGrade = 13;
                else if (newRank === "Commander") rolesIDs = ["1154446248967938185"], tagID = "1213985427724308490", newGrade = 12;
                else if (newRank === "Captain") rolesIDs = ["1154446248967938183"], tagID = "1213985427724308490", newGrade = 11;
                else if (newRank === "Lieutenant") rolesIDs = ["1267588047533248583"], tagID = "1213985427724308490", newGrade = 10;
                else if (newRank === "Sergeant II") rolesIDs = ["1154446248967938181"], tagID = "1213985427724308490", newGrade = 8;
                else if (newRank === "Sergeant I") rolesIDs = ["1267587700240809994"], tagID = "1213985427724308490", newGrade = 6;
                else if (newRank === "Police Officer III+I") rolesIDs = ["1267588850952437800"], tagID = "1213985550458163200", newGrade = 4;
                else if (newRank === "Police Officer III") rolesIDs = ["1267542148102750238"], tagID = "1213985579742797874", newGrade = 3;
                else if (newRank === "Police Officer II") rolesIDs = ["1267589547462754385"], tagID = "1213985508917514250", newGrade = 2;
                else if (newRank === "Police Officer") rolesIDs = ["1267589491405754369"], tagID = "1213985475396771860", newGrade = 1;
                else if (newRank === "Cadet") rolesIDs = ["1267589609378812129"], tagID = "1213985402961006612", newGrade = 0;
                else rolesIDs = false, tagID = false;
                if (!rolesIDs) return i.reply({ content: `> 🛑 **Neznámá hodnost... (\`${newRank}\`)**`, ephemeral: true });

                content = JSON.parse(fs.readFileSync((path.resolve("./db/LSPD") + "/" + i.fields.getTextInputValue("id") + ".json"), "utf-8"));
                if (!(await i.guild.channels.fetch(content.folder))) return i.reply({ content: "> 🛑 **Nebyla nalezena složka <@" + i.fields.getTextInputValue("id") + ">!**", ephemeral: true });

                if (content.rank === "Chief of Police") oldRolesIDs = ["1154446249005690910"], oldGrade = 15;
                else if (content.rank === "Assistant Chief of Police") oldRolesIDs = ["1154446248967938187"], oldGrade = 14;
                else if (content.rank === "Deputy Chief of Police") oldRolesIDs = ["1154446248967938186"], oldGrade = 13;
                else if (content.rank === "Commander") oldRolesIDs = ["1154446248967938185"], oldGrade = 12;
                else if (content.rank === "Captain") oldRolesIDs = ["1154446248967938183"], oldGrade = 11;
                else if (content.rank === "Lieutenant") oldRolesIDs = ["1267588047533248583"], oldGrade = 10;
                else if (content.rank === "Detective III") oldRolesIDs = ["1201811560708964402"], oldGrade = 9;
                else if (content.rank === "Sergeant II") oldRolesIDs = ["1154446248967938181"], oldGrade = 8;
                else if (content.rank === "Detective II") oldRolesIDs = ["1201811536117501972"], oldGrade = 7;
                else if (content.rank === "Sergeant I") oldRolesIDs = ["1267587700240809994"], oldGrade = 6;
                else if (content.rank === "Detective I") oldRolesIDs = ["1201811500252274689"], oldGrade = 5;
                else if (content.rank === "Police Officer III+I") oldRolesIDs = ["1267588850952437800"], oldGrade = 4;
                else if (content.rank === "Police Officer III") oldRolesIDs = ["1267542148102750238"], oldGrade = 3;
                else if (content.rank === "Police Officer II") oldRolesIDs = ["1267589547462754385"], oldGrade = 2;
                else if (content.rank === "Police Officer") oldRolesIDs = ["1267589491405754369"], oldGrade = 1;
                else if (content.rank === "Cadet") oldRolesIDs = ["1267589609378812129"], oldGrade = 0;
            } else if (i.guild.id === "1139266097921675345") { //LSCSO
                if (newRank === "Sheriff") rolesIDs = ["1139274486085058590", "1139267137651884072"], tagID = "1203829217167409192", newGrade = 11;
                else if (newRank === "Undersheriff") rolesIDs = ["1139274565973983262", "1139267137651884072"], tagID = "1203829217167409192", newGrade = 10;
                else if (newRank === "Assistant Sheriff") rolesIDs = ["1139274629547053139", "1139267137651884072"], tagID = "1203829217167409192", newGrade = 9;
                else if (newRank === "Division Chief") rolesIDs = ["1139274788842516520", "1139267137651884072"], tagID = "1203829217167409192", newGrade = 8;
                else if (newRank === "Area Commander") rolesIDs = ["1139274892617977966", "1139267137651884072"], tagID = "1203829217167409192", newGrade = 7;
                else if (newRank === "Captain") rolesIDs = ["1139274974683746335", "1139267137651884072"], tagID = "1203829217167409192", newGrade = 6;
                else if (newRank === "Lieutenant") rolesIDs = ["1139275038877560856", "1139267137651884072"], tagID = "1203829217167409192", newGrade = 5;
                else if (newRank === "Sergeant") rolesIDs = ["1139275398295867453", "1139279790210306198"], tagID = "1203829180232630362", newGrade = 4;
                else if (newRank === "Deputy III") rolesIDs = ["1139275782607347905"], tagID = "1203829143234551898", newGrade = 3;
                else if (newRank === "Deputy II") rolesIDs = ["1139275934025916568"], tagID = "1203829113240952904", newGrade = 2;
                else if (newRank === "Deputy I") rolesIDs = ["1139276036673130527"], tagID = "1203829081100001311", newGrade = 1;
                else if (newRank === "Deputy Trainee") rolesIDs = ["1139276175819157646"], tagID = "1203829031049367593", newGrade = 0;
                else rolesIDs = false, tagID = false;
                if (!rolesIDs) return i.reply({ content: `> 🛑 **Neznámá hodnost... (\`${newRank}\`)**`, ephemeral: true });

                content = JSON.parse(fs.readFileSync((path.resolve("./db/LSCSO") + "/" + i.fields.getTextInputValue("id") + ".json"), "utf-8"));
                if (!(await i.guild.channels.fetch(content.folder))) return i.reply({ content: "> 🛑 **Nebyla nalezena složka <@" + i.fields.getTextInputValue("id") + ">!**", ephemeral: true });

                if (content.rank === "Sheriff") oldRolesIDs = ["1139274486085058590", "1139267137651884072"], oldGrade = 11;
                else if (content.rank === "Undersheriff") oldRolesIDs = ["1139274565973983262", "1139267137651884072"], oldGrade = 10;
                else if (content.rank === "Assistant Sheriff") oldRolesIDs = ["1139274629547053139", "1139267137651884072"], oldGrade = 9;
                else if (content.rank === "Division Chief") oldRolesIDs = ["1139274788842516520", "1139267137651884072"], oldGrade = 8;
                else if (content.rank === "Area Commander") oldRolesIDs = ["1139274892617977966", "1139267137651884072"], oldGrade = 7;
                else if (content.rank === "Captain") oldRolesIDs = ["1139274974683746335", "1139267137651884072"], oldGrade = 6;
                else if (content.rank === "Lieutenant") oldRolesIDs = ["1139275038877560856", "1139267137651884072"], oldGrade = 5;
                else if (content.rank === "Sergeant") oldRolesIDs = ["1139275398295867453", "1139279790210306198"], oldGrade = 4;
                else if (content.rank === "Deputy III") oldRolesIDs = ["1139275782607347905"], oldGrade = 3;
                else if (content.rank === "Deputy II") oldRolesIDs = ["1139275934025916568"], oldGrade = 2;
                else if (content.rank === "Deputy I") oldRolesIDs = ["1139276036673130527"], oldGrade = 1;
                else if (content.rank === "Deputy Trainee") oldRolesIDs = ["1139276175819157646"], oldGrade = 0;
            }

            await i.deferReply();

            const today = new Date();

            await dcLog(bot, i.guild.id, i.member,
                {
                    title: `${newGrade >= oldGrade ? "Povýšení" : "Degradace"} v DB`,
                    description:
                        `**<@${i.user.id}> ${newGrade >= oldGrade ? "povýšil" : "degradoval"}(a) <@${i.fields.getTextInputValue("id")}> v DB.**`
                        + `\n> **Jméno:** \`${content.name}\``
                        + `\n> **Hodnost:** \`${content.rank}\` -> \`${i.fields.getTextInputValue("rank")}\``
                        + `\n> **Volačka:** \`${content.radio}\` -> \`${i.fields.getTextInputValue("call")}\``
                        + `\n> **Odznak:** \`${content.badge}\` -> \`${i.fields.getTextInputValue("badge")}\``,
                    color: newGrade >= oldGrade ? "#0033ff" : "#ff9500"
                }
            );
            await simpleLog(bot, i.guild.id,
                {
                    author: { name: member.displayName, iconURL: member.displayAvatarURL() },
                    title: newGrade >= oldGrade ? "Povýšení" : "Degradace",
                    description:
                        `${content.rank} ➤ **${i.fields.getTextInputValue("rank")}**`
                        + `\n${content.radio} ➤ **${i.fields.getTextInputValue("call")}**`,
                    color: newGrade >= oldGrade ? "#0033ff" : "#ff9500",
                    footer: { text: i.member.displayName, iconURL: i.member.displayAvatarURL() }
                }
            );

            live(getServer(i.guild.id).name);

            console.log(" < [DB/Rankup] >  " + i.member.displayName + ` ${newGrade >= oldGrade ? "povýšil" : "degradoval"}(a) [${content.radio}] ${content.name} na [${i.fields.getTextInputValue("call")}] ${content.name} (${i.fields.getTextInputValue("rank")})`);

            const rankup = {
                "date": today.getDate() + ". " + (parseInt(today.getMonth()) + 1) + ". " + today.getFullYear(),
                "to": i.fields.getTextInputValue("rank"),
                "from": content.rank,
                "boss": i.member.displayName,
                "hours": content.hours
            };
            content.rankups.push(rankup);
            content.badge = parseInt(i.fields.getTextInputValue("badge"));
            content.radio = i.fields.getTextInputValue("call");
            content.rank = i.fields.getTextInputValue("rank");

            let workersPath;
            if (bot.LEA.g.LSPD.includes(i.guild.id)) workersPath = (path.resolve("./db/LSPD") + "/" + i.fields.getTextInputValue("id") + ".json");
            else if (bot.LEA.g.LSCSO.includes(i.guild.id)) workersPath = (path.resolve("./db/LSCSO") + "/" + i.fields.getTextInputValue("id") + ".json");

            fs.writeFileSync(
                workersPath,
                JSON.stringify(content, null, 4)
            );

            try { await member.setNickname(`[${content.radio}] ${content.name}`); } catch { gotNick = false; }
            try { await member.roles.remove(oldRolesIDs); } catch { gotRole = false; }
            try { await member.roles.add(rolesIDs); } catch { gotRole = false; }

            if (content.folder) {
                try {
                    const folder = await i.guild.channels.fetch(content.folder);
                    const start = await folder.fetchStarterMessage({ force: true });

                    if (folder.archived) folder.setArchived(false, "otevření složky");
                    await folder.setAppliedTags([tagID]);

                    if (start) {
                        const rankUpDateArr = rankup.date.split(". ");
                        const rankUpDate = new Date(rankUpDateArr[1] + "/" + rankUpDateArr[0] + "/" + rankUpDateArr[2]);

                        const workerEmbed = new EmbedBuilder()
                            .setAuthor({ name: `[${content.radio}] ${content.name}`, iconURL: member.displayAvatarURL() })
                            .setDescription(
                                `> **App:** <@${i.fields.getTextInputValue("id")}>`
                                + `\n> **Jméno:** \`${content.name}\``
                                + `\n> **Hodnost:** ${rolesIDs ? `<@&${rolesIDs}>` : `\`${content.rank}\``}`
                                + `\n> **Odznak:** \`${content.badge}\``
                                + `\n> **Volačka:** \`${content.radio}\``
                                + "\n\n"
                                + `\n> **Hodin:** \`${Math.round((content.hours + Number.EPSILON) * 100) / 100}\``
                                + `\n> **Omluvenek:** \`${content.apologies.filter(a => !a.removed).length}\``
                                + `\n> **Povýšení:** ${time(rankUpDate, "R")}`
                            )
                            .setThumbnail(getServer(i.guild.id).footer.iconURL)
                            .setColor(getServer(i.guild.id).color)
                            .setFooter(getServer(i.guild.id).footer);
                        const row = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId("summary_" + i.fields.getTextInputValue("id"))
                                    .setStyle(ButtonStyle.Success)
                                    .setLabel("Souhrn")
                                    .setEmoji("📑"),
                            );
                        await start.edit({ message: `<@${i.fields.getTextInputValue("id")}>`, embeds: [workerEmbed], components: [row] });
                    }

                    const rankup2Embed = new EmbedBuilder()
                        .setTitle(newGrade >= oldGrade ? "Povýšení!" : "Degradace!")
                        .setDescription(
                            newGrade >= oldGrade ?
                                `Gratuluji <@${i.fields.getTextInputValue("id")}>, byl(a) jste povýšen(a).`
                                : `<@${i.fields.getTextInputValue("id")}>, byl(a) jste degradován(a).`
                                + `\nZkontrolujte si své nové údaje.`
                        )
                        .addFields([
                            {
                                name: `Aktualizace`, inline: true,
                                value:
                                    `> **Popis složky:** ${start ? "✅" : "❌"}\n`
                                    + `> **Název složky:** ✅\n`
                                    + `> **Přezdívka:** ${gotNick ? "✅" : "❌"}\n`
                                    + `> **Role:** ${gotRole ? "✅" : "❌"}`
                            },
                            {
                                name: `Aktuální údaje`, inline: true,
                                value:
                                    `> **Jméno:** \`${content.name}\`\n`
                                    + `> **Hodnost:** \`${i.fields.getTextInputValue("rank")}\`\n`
                                    + `> **Volačka:** \`${i.fields.getTextInputValue("call")}\`\n`
                                    + `> **Č. Odznaku:** \`${i.fields.getTextInputValue("badge")}\``
                            }
                        ])
                        .setThumbnail(getServer(i.guild.id).footer.iconURL)
                        .setColor(getServer(i.guild.id).color)
                        .setFooter(getServer(i.guild.id).footer);
                    await folder.send({ content: `<@${i.fields.getTextInputValue("id")}>` + (start ? "" : "<@411436203330502658>"), embeds: [rankup2Embed] });
                    await folder.setName(`[${i.fields.getTextInputValue("call")}] ${content.name}`);

                    const rankupEmbed = new EmbedBuilder()
                        .setTitle("Úspěch")
                        .setDescription(
                            `<@${i.fields.getTextInputValue("id")}> byl(a) ${newGrade >= oldGrade ? "povýšen" : "degradován"}(a)!\n`
                            + `> **Popis složky:** ${start ? "✅" : "❌"}\n`
                            + `> **Název složky:** ✅\n`
                            + `> **Přezdívka:** ${gotNick ? "✅" : "❌"}\n`
                            + `> **Role:** ${gotRole ? "✅" : "❌"}`)
                        .setColor(getServer(i.guild.id).color)
                        .setFooter(getServer(i.guild.id).footer);

                    await i.editReply({ embeds: [rankupEmbed], ephemeral: true });
                } catch (e) {
                    console.error(e);
                }
            }

        } else if (i.customId === "editModal") {
            if (!(checkDB(i.fields.getTextInputValue("id"), i))) return i.reply({ content: "> 🛑 <@" + i.fields.getTextInputValue("id") + "> **není v DB.**", ephemeral: true });
            const gotDB = getDB(user.id);
            const data = gotDB.data;
            if (!bot.LEA.g[gotDB.guildName].includes(i.guild.id)) return i.reply({ content: `> 🛑 **<@${user.id}> je členem \`${gotDB.guildName}\`!** (Nemůžeš ho upravit)`, ephemeral: true });
            const member = await i.guild.members.fetch(i.fields.getTextInputValue("id"));
            if (!member) return i.reply({ content: "> 🛑 <@" + i.fields.getTextInputValue("id") + "> **není v DB.**", ephemeral: true });

            let content, oldRolesIDs, rolesIDs, tagID, gotNick = true, gotRole = true, newRank = i.fields.getTextInputValue("rank");
            if (i.guild.id === "1154446248934387828") { //LSPD
                content = JSON.parse(fs.readFileSync((path.resolve("./db/LSPD") + "/" + i.fields.getTextInputValue("id") + ".json"), "utf-8"));
                if (!(await i.guild.channels.fetch(content.folder))) return i.reply({ content: "> 🛑 **Nebyla nalezena složka <@" + i.fields.getTextInputValue("id") + ">!**", ephemeral: true });

                if (newRank !== content.rank) {
                    if (newRank === "Chief of Police") rolesIDs = ["1154446249005690910"], tagID = "1213985427724308490";
                    else if (newRank === "Assistant Chief of Police") rolesIDs = ["1154446248967938187"], tagID = "1213985427724308490";
                    else if (newRank === "Deputy Chief of Police") rolesIDs = ["1154446248967938186"], tagID = "1213985427724308490";
                    else if (newRank === "Commander") rolesIDs = ["1154446248967938185"], tagID = "1213985427724308490";
                    else if (newRank === "Captain") rolesIDs = ["1154446248967938183"], tagID = "1213985427724308490";
                    else if (newRank === "Lieutenant") rolesIDs = ["1267588047533248583"], tagID = "1213985427724308490";
                    else if (newRank === "Detective III") rolesIDs = ["1201811560708964402"], tagID = "1213985702484643930";
                    else if (newRank === "Sergeant II") rolesIDs = ["1154446248967938181"], tagID = "1213985702484643930";
                    else if (newRank === "Detective II") rolesIDs = ["1201811536117501972"], tagID = "1213985702484643930";
                    else if (newRank === "Sergeant I") rolesIDs = ["1267587700240809994"], tagID = "1213985702484643930";
                    else if (newRank === "Detective I") rolesIDs = ["1201811500252274689"], tagID = "1213985702484643930";
                    else if (newRank === "Police Officer III+I") rolesIDs = ["1267588850952437800"], tagID = "1213985550458163200";
                    else if (newRank === "Police Officer III") rolesIDs = ["1267542148102750238"], tagID = "1213985579742797874";
                    else if (newRank === "Police Officer II") rolesIDs = ["1267589547462754385"], tagID = "1213985508917514250";
                    else if (newRank === "Police Officer") rolesIDs = ["1267589491405754369"], tagID = "1213985475396771860";
                    else if (newRank === "Cadet") rolesIDs = ["1267589609378812129"], tagID = "1213985402961006612";
                    else rolesIDs = false, tagID = false;
                    if (!rolesIDs) return i.reply({ content: `> 🛑 **Neznámá hodnost... (\`${newRank}\`)**`, ephemeral: true });

                    if (content.rank === "Chief of Police") oldRolesIDs = ["1154446249005690910"];
                    else if (content.rank === "Assistant Chief of Police") oldRolesIDs = ["1154446248967938187"];
                    else if (content.rank === "Deputy Chief of Police") oldRolesIDs = ["1154446248967938186"];
                    else if (content.rank === "Commander") oldRolesIDs = ["1154446248967938185"];
                    else if (content.rank === "Captain") oldRolesIDs = ["1154446248967938183"];
                    else if (content.rank === "Lieutenant") oldRolesIDs = ["1267588047533248583"];
                    else if (content.rank === "Detective III") oldRolesIDs = ["1201811560708964402"];
                    else if (content.rank === "Sergeant II") oldRolesIDs = ["1154446248967938181"];
                    else if (content.rank === "Detective II") oldRolesIDs = ["1201811536117501972"];
                    else if (content.rank === "Sergeant I") oldRolesIDs = ["1267587700240809994"];
                    else if (content.rank === "Detective I") oldRolesIDs = ["1201811500252274689"];
                    else if (content.rank === "Police Officer III+I") oldRolesIDs = ["1267588850952437800"];
                    else if (content.rank === "Police Officer III") oldRolesIDs = ["1267542148102750238"];
                    else if (content.rank === "Police Officer II") oldRolesIDs = ["1267589547462754385"];
                    else if (content.rank === "Police Officer") oldRolesIDs = ["1267589491405754369"];
                    else if (content.rank === "Cadet") oldRolesIDs = ["1267589609378812129"];
                }
            } else if (i.guild.id === "1139266097921675345") { //LSCSO
                content = JSON.parse(fs.readFileSync((path.resolve("./db/LSCSO") + "/" + i.fields.getTextInputValue("id") + ".json"), "utf-8"));
                if (!(await i.guild.channels.fetch(content.folder))) return i.reply({ content: "> 🛑 **Nebyla nalezena složka <@" + i.fields.getTextInputValue("id") + ">!**", ephemeral: true });

                if (newRank !== content.rank) {
                    if (newRank === "Sheriff") rolesIDs = ["1139274486085058590", "1139267137651884072"], tagID = "1203829217167409192";
                    else if (newRank === "Undersheriff") rolesIDs = ["1139274565973983262", "1139267137651884072"], tagID = "1203829217167409192";
                    else if (newRank === "Assistant Sheriff") rolesIDs = ["1139274629547053139", "1139267137651884072"], tagID = "1203829217167409192";
                    else if (newRank === "Division Chief") rolesIDs = ["1139274788842516520", "1139267137651884072"], tagID = "1203829217167409192";
                    else if (newRank === "Area Commander") rolesIDs = ["1139274892617977966", "1139267137651884072"], tagID = "1203829217167409192";
                    else if (newRank === "Captain") rolesIDs = ["1139274974683746335", "1139267137651884072"], tagID = "1203829217167409192";
                    else if (newRank === "Lieutenant") rolesIDs = ["1139275038877560856", "1139267137651884072"], tagID = "1203829217167409192";
                    else if (newRank === "Sergeant") rolesIDs = ["1139275398295867453", "1139279790210306198"], tagID = "1203829180232630362";
                    else if (newRank === "Deputy III") rolesIDs = ["1139275782607347905"], tagID = "1203829143234551898";
                    else if (newRank === "Deputy II") rolesIDs = ["1139275934025916568"], tagID = "1203829113240952904";
                    else if (newRank === "Deputy I") rolesIDs = ["1139276036673130527"], tagID = "1203829081100001311";
                    else if (newRank === "Deputy Trainee") rolesIDs = ["1139276175819157646"], tagID = "1203829031049367593";
                    else rolesIDs = false, tagID = false;
                    if (!rolesIDs) return i.reply({ content: `> 🛑 **Neznámá hodnost... (\`${newRank}\`)**`, ephemeral: true });

                    if (content.rank === "Sheriff") rolesIDs = ["1139274486085058590", "1139267137651884072"];
                    else if (content.rank === "Undersheriff") rolesIDs = ["1139274565973983262", "1139267137651884072"];
                    else if (content.rank === "Assistant Sheriff") rolesIDs = ["1139274629547053139", "1139267137651884072"];
                    else if (content.rank === "Division Chief") rolesIDs = ["1139274788842516520", "1139267137651884072"];
                    else if (content.rank === "Area Commander") rolesIDs = ["1139274892617977966", "1139267137651884072"];
                    else if (content.rank === "Captain") rolesIDs = ["1139274974683746335", "1139267137651884072"];
                    else if (content.rank === "Lieutenant") rolesIDs = ["1139275038877560856", "1139267137651884072"];
                    else if (content.rank === "Sergeant") rolesIDs = ["1139275398295867453", "1139279790210306198"];
                    else if (content.rank === "Deputy III") rolesIDs = ["1139275782607347905"];
                    else if (content.rank === "Deputy II") rolesIDs = ["1139275934025916568"];
                    else if (content.rank === "Deputy I") rolesIDs = ["1139276036673130527"];
                    else if (content.rank === "Deputy Trainee") rolesIDs = ["1139276175819157646"];
                }
            }

            await i.deferReply();

            let changed = { name: false, badge: false, radio: false, rank: false },
                old = { name: content.name, badge: content.badge, radio: content.radio, rank: content.rank };
            if (i.fields.getTextInputValue("name") !== content.name) changed.name = true;
            if (parseInt(i.fields.getTextInputValue("badge")) !== content.badge) changed.badge = true;
            if (i.fields.getTextInputValue("call") !== content.radio) changed.radio = true;
            if (i.fields.getTextInputValue("rank") !== content.rank) changed.rank = true;

            await dcLog(bot, i.guild.id, i.member,
                {
                    title: "Úprava v DB",
                    description:
                        `**<@${i.user.id}> upravil(a) <@${i.fields.getTextInputValue("id")}> v DB.**`
                        + "\n" + (changed.name ? `> **Jméno:** \`${old.name}\` -> \`${i.fields.getTextInputValue("name")}\`` : `> **Jméno:** \`${content.name}\``)
                        + "\n" + (changed.rank ? `> **Hodnost:** \`${old.rank}\` -> \`${i.fields.getTextInputValue("rank")}\`` : `> **Hodnost:** \`${content.rank}\``)
                        + "\n" + (changed.radio ? `> **Volačka:** \`${old.radio}\` -> \`${i.fields.getTextInputValue("call")}\`` : `> **Volačka:** \`${content.radio}\``)
                        + "\n" + (changed.badge ? `> **Odznak:** \`${old.badge}\` -> \`${i.fields.getTextInputValue("badge")}\`` : `> **Odznak:** \`${content.badge}\``),
                    color: "#fcba03"
                }
            );

            live(getServer(i.guild.id).name);

            console.log(" < [DB/Edit] >  " + i.member.displayName + ` upravil(a) [${content.radio}] ${content.name} na [${i.fields.getTextInputValue("call")}] ${i.fields.getTextInputValue("name")} (${i.fields.getTextInputValue("rank")})`);

            if (changed.name) content.name = i.fields.getTextInputValue("name");
            if (changed.badge) content.badge = parseInt(i.fields.getTextInputValue("badge"));
            if (changed.radio) content.radio = i.fields.getTextInputValue("call");
            if (changed.rank) content.rank = i.fields.getTextInputValue("rank");

            let workersPath;
            if (bot.LEA.g.LSPD.includes(i.guild.id)) workersPath = (path.resolve("./db/LSPD") + "/" + i.fields.getTextInputValue("id") + ".json");
            else if (bot.LEA.g.LSCSO.includes(i.guild.id)) workersPath = (path.resolve("./db/LSCSO") + "/" + i.fields.getTextInputValue("id") + ".json");

            fs.writeFileSync(
                workersPath,
                JSON.stringify(content, null, 4)
            );

            if (changed.name || changed.radio) try { await member.setNickname(`[${content.radio}] ${content.name}`); } catch { gotNick = false; }
            if (changed.rank) try { await member.roles.remove(oldRolesIDs); } catch { gotRole = false; }
            if (changed.rank) try { await member.roles.add(rolesIDs); } catch { gotRole = false; }

            if (content.folder) {
                try {
                    const folder = await i.guild.channels.fetch(content.folder);
                    const start = await folder.fetchStarterMessage({ force: true });

                    if (changed.rank) await folder.setAppliedTags([tagID]);

                    if (start) {
                        const rankUpDateArr = content.rankups[content.rankups.length - 1].date.split(". ");
                        const rankUpDate = new Date(rankUpDateArr[1] + "/" + rankUpDateArr[0] + "/" + rankUpDateArr[2]);

                        const workerEmbed = new EmbedBuilder()
                            .setAuthor({ name: `[${content.radio}] ${content.name}`, iconURL: member.displayAvatarURL() })
                            .setDescription(
                                `> **App:** <@${i.fields.getTextInputValue("id")}>`
                                + `\n> **Jméno:** \`${content.name}\``
                                + `\n> **Hodnost:** ${rolesIDs ? `<@&${rolesIDs}>` : `\`${content.rank}\``}`
                                + `\n> **Odznak:** \`${content.badge}\``
                                + `\n> **Volačka:** \`${content.radio}\``
                                + "\n\n"
                                + `\n> **Hodin:** \`${Math.round((content.hours + Number.EPSILON) * 100) / 100}\``
                                + `\n> **Omluvenek:** \`${content.apologies.filter(a => !a.removed).length}\``
                                + `\n> **Povýšení:** ${time(rankUpDate, "R")}`
                            )
                            .setThumbnail(getServer(i.guild.id).footer.iconURL)
                            .setColor(getServer(i.guild.id).color)
                            .setFooter(getServer(i.guild.id).footer);
                        const row = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId("summary_" + i.fields.getTextInputValue("id"))
                                    .setStyle(ButtonStyle.Success)
                                    .setLabel("Souhrn")
                                    .setEmoji("📑"),
                            );
                        await start.edit({ message: `<@${i.fields.getTextInputValue("id")}>`, embeds: [workerEmbed], components: [row] });
                    }

                    const rankup2Embed = new EmbedBuilder()
                        .setTitle("Úprava!")
                        .setDescription(
                            (changed.name ? `> **Jméno:** \`${old.name}\` -> \`${content.name}\`` : `> **Jméno:** \`${content.name}\``)
                            + "\n" + (changed.rank ? `> **Hodnost:** \`${old.rank}\` -> **__\`${content.rank}\`__**` : `> **Hodnost:** \`${content.rank}\``)
                            + "\n" + (changed.radio ? `> **Volačka:** \`${old.radio}\` -> **__\`${content.radio}\`__**` : `> **Volačka:** \`${content.radio}\``)
                            + "\n" + (changed.badge ? `> **Odznak:** \`${old.badge}\` -> **__\`${content.badge}\`__**` : `> **Odznak:** \`${content.badge}\``)
                        )
                        .setColor(getServer(i.guild.id).color)
                        .setFooter(getServer(i.guild.id).footer);
                    await folder.send({ content: `<@${i.fields.getTextInputValue("id")}>` + (start ? "" : "<@411436203330502658>"), embeds: [rankup2Embed] });
                    if (changed.name || changed.radio) await folder.setName(`[${i.fields.getTextInputValue("call")}] ${content.name}`);

                    const rankupEmbed = new EmbedBuilder()
                        .setTitle("Úspěch")
                        .setDescription(
                            `<@${i.fields.getTextInputValue("id")}> byl(a) upravena(a)!`)
                        .setColor(getServer(i.guild.id).color)
                        .setFooter(getServer(i.guild.id).footer);

                    await i.editReply({ embeds: [rankupEmbed], ephemeral: true });
                } catch (e) {
                    console.error(e);
                }
            }

        } else if (i.customId === "dutyOWModal") {
            if (
                (i.fields.getTextInputValue("datum").split(" ").length - 1) !== 2
                || (i.fields.getTextInputValue("datum").split(".").length - 1) !== 2
            ) {
                return await i.reply({
                    content:
                        "### Nalezena chyba - datum!"
                        + "\n- Formát data je špatně. Napiš např. `24. 12. 2023` (tečky a mezery)"
                        + "\nZadal(a) jsi:\n"
                        + `> **Datum:** \`${i.fields.getTextInputValue("datum")}\`\n`
                        + `> **Od:** \`${i.fields.getTextInputValue("start")}\`\n`
                        + `> **Do:** \`${i.fields.getTextInputValue("end")}\``,
                    ephemeral: true
                });
            } else if (!i.fields.getTextInputValue("start").includes(":") || !i.fields.getTextInputValue("end").includes(":")) {
                return await i.reply({
                    content:
                        "### Nalezena chyba - čas!"
                        + "\n- V některém z časů se neobjevila `:`."
                        + "\nZadal(a) jsi:\n"
                        + `> **Datum:** \`${i.fields.getTextInputValue("datum")}\`\n`
                        + `> **Od:** \`${i.fields.getTextInputValue("start")}\`\n`
                        + `> **Do:** \`${i.fields.getTextInputValue("end")}\``,
                    ephemeral: true
                });
            }

            await i.deferReply({ ephemeral: true });

            if (!(checkDB(i.message.interaction.user.id))) return i.editReply({ content: "> 🛑 <@" + user.id + "> **už není v DB.**", ephemeral: true });

            let content;
            if (bot.LEA.g.LSPD.includes(i.guild.id)) content = JSON.parse(fs.readFileSync((path.resolve("./db/LSPD") + "/" + i.message.interaction.user.id + ".json"), "utf-8"));
            else if (bot.LEA.g.LSCSO.includes(i.guild.id)) content = JSON.parse(fs.readFileSync((path.resolve("./db/LSCSO") + "/" + i.message.interaction.user.id + ".json"), "utf-8"));

            const index = parseInt(i.message.embeds[0].fields[0].name.slice(-1)) - 1;
            const member = await i.guild.members.fetch(i.message.interaction.user.id);

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("summary")
                        .setStyle(ButtonStyle.Success)
                        .setEmoji("📑"),
                ).addComponents(
                    new ButtonBuilder()
                        .setCustomId("editButton")
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji("✏️")
                        .setDisabled(),
                ).addComponents(
                    new ButtonBuilder()
                        .setCustomId("deleteButton")
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji("🗑️")
                        .setDisabled(),
                );

            const hoursBefore = parseFloat(i.message.embeds[0].fields[0].value.split("`")[7]);
            let hoursAfter,
                h1 = parseInt(i.fields.getTextInputValue("start").split(":")[0]),
                h2 = parseInt(i.fields.getTextInputValue("end").split(":")[0]),
                m1 = parseInt(i.fields.getTextInputValue("start").split(":")[1]),
                m2 = parseInt(i.fields.getTextInputValue("end").split(":")[1]),
                min1 = h1 * 60 + m1,
                min2 = h2 * 60 + m2;
            hoursAfter = (min2 - min1) / 60;
            if (hoursAfter < 0) hoursAfter = hoursAfter + 24;
            hoursAfter = Math.round((hoursAfter + Number.EPSILON) * 100) / 100;


            const dutyEmbed = new EmbedBuilder()
                .setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() })
                .setTitle("Záznam služby")
                .addFields([
                    {
                        name: `Duty #` + (index + 1), inline: false,
                        value:
                            `> **Datum:** \`${i.fields.getTextInputValue("datum")}\`\n`
                            + `> **Od:** \`${i.fields.getTextInputValue("start")}\`\n`
                            + `> **Do:** \`${i.fields.getTextInputValue("end")}\`\n`
                            + `> **Hodin:**  \`${hoursAfter}\``
                    }
                ])
                .setThumbnail("https://i.imgur.com/fhif3Xj.png")
                .setColor(bot.LEA.c.duty)
                .setFooter(getServer(i.guild.id).footer);

            try {
                await i.message.edit({ embeds: [dutyEmbed], components: [row] });
            } catch (e) {
                console.error(e);
                return await i.editReply({ content: "> 🛑 **Chyba! Zpráva nešla upravit.**```" + e + "```" });
            }

            content.duties[index] = {
                "id": i.message.id,
                "removed": false,
                "date": i.fields.getTextInputValue("datum"),
                "start": i.fields.getTextInputValue("start"),
                "end": i.fields.getTextInputValue("end"),
                "hours": hoursAfter
            };

            content.hours = parseFloat(content.hours) - parseFloat(hoursBefore);
            content.hours = (Math.round((parseFloat(content.hours) + Number.EPSILON) * 100) / 100) + parseFloat(hoursAfter);

            let workersPath;
            if (bot.LEA.g.LSPD.includes(i.guild.id)) workersPath = (path.resolve("./db/LSPD") + "/" + i.message.interaction.user.id + ".json");
            else if (bot.LEA.g.LSCSO.includes(i.guild.id)) workersPath = (path.resolve("./db/LSCSO") + "/" + i.message.interaction.user.id + ".json");

            fs.writeFileSync(
                workersPath,
                JSON.stringify(content, null, 4)
            );

            console.log(" < [DB/OW/Duty] >  " + i.member.displayName + ` přepsal(a) duty [${content.radio}] ${content.name} (${index}) z ${i.fields.getTextInputValue("datum")}`);

            i.editReply({ content: "✅ **Přepsáno!**", ephemeral: true });
        } else if (i.customId === "apologyOWModal") {
            await i.deferReply({ ephemeral: true });

            if (!(checkDB(i.message.interaction.user.id))) return i.editReply({ content: "> 🛑 <@" + user.id + "> **už není v DB.**", ephemeral: true });

            let content;
            if (bot.LEA.g.LSPD.includes(i.guild.id)) content = JSON.parse(fs.readFileSync((path.resolve("./db/LSPD") + "/" + i.message.interaction.user.id + ".json"), "utf-8"));
            else if (bot.LEA.g.LSCSO.includes(i.guild.id)) content = JSON.parse(fs.readFileSync((path.resolve("./db/LSCSO") + "/" + i.message.interaction.user.id + ".json"), "utf-8"));

            const index = parseInt(i.message.embeds[0].fields[0].name.slice(-1)) - 1;
            const member = await i.guild.members.fetch(i.message.interaction.user.id);

            /*const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("editButton")
                        .setLabel("Přepsat")
                        .setDisabled()
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji("📝"),
                );*/

            if (
                (i.fields.getTextInputValue("start").split(" ").length) !== 3
                || (i.fields.getTextInputValue("end").split(" ").length) !== 3
            ) {
                return await i.editReply({
                    content:
                        "### Nalezena chyba - datum!"
                        + "\n- Formát data je špatně. Napiš např. `24. 12. 2023` (tečky a mezery)"
                        + "\nZadal(a) jsi:\n"
                        + (i.fields.getTextInputValue("eventID") ? `> **ID Události:** \`${i.fields.getTextInputValue("eventID")}\`\n` : "")
                        + `> **Začátek:** \`${i.fields.getTextInputValue("start")}\`\n`
                        + `> **Konec:** \`${i.fields.getTextInputValue("end")}\`\n`
                        + `> **OOC Důvod:** \`${i.fields.getTextInputValue("ooc")}\`\n`
                        + `> **IC Důvod:** \`${i.fields.getTextInputValue("ic")}\``,
                    ephemeral: true
                });
            }

            const apologyEmbed = new EmbedBuilder()
                .setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() })
                .setTitle("Omluvenka")
                .addFields([
                    {
                        name: `Omluvenka #` + (index + 1), inline: false,
                        value:
                            `> **ID Události:** \`${i.fields.getTextInputValue("eventID") || "0"}\`\n`
                            + `> **Začátek:** \`${i.fields.getTextInputValue("start")}\`\n`
                            + `> **Konec:** \`${i.fields.getTextInputValue("end")}\`\n`
                            + `> **OOC Důvod:** \`${i.fields.getTextInputValue("ooc")}\`\n`
                            + `> **IC Důvod:** \`${i.fields.getTextInputValue("ic")}\``
                    }
                ])
                .setThumbnail("https://i.imgur.com/YQb9mPm.png")
                .setColor(bot.LEA.c.apology)
                .setFooter(getServer(i.guild.id).footer);

            try {
                await i.message.edit({ embeds: [apologyEmbed]/*, components: [row]*/ });
            } catch (e) {
                console.error(e);
                return await i.editReply({ content: "> 🛑 **Chyba! Zpráva nešla upravit.**```" + e + "```" });
            }

            const today = new Date();
            if (content.apologies[index]) {
                content.apologies[index] = {
                    "id": i.message.id,
                    "removed": false,
                    "shared": content.apologies[index].shared ? content.apologies[index].shared : today.getDate() + ". " + (parseInt(today.getMonth()) + 1) + ". " + today.getFullYear(),
                    "eventID": parseInt(i.fields.getTextInputValue("eventID")) || 0,
                    "start": i.fields.getTextInputValue("start"),
                    "end": i.fields.getTextInputValue("end"),
                    "ooc": i.fields.getTextInputValue("ooc"),
                    "ic": i.fields.getTextInputValue("ic")
                };
            } else {
                content.apologies.push({
                    "id": i.message.id,
                    "removed": false,
                    "shared": today.getDate() + ". " + (parseInt(today.getMonth()) + 1) + ". " + today.getFullYear(),
                    "eventID": parseInt(i.fields.getTextInputValue("eventID")) || 0,
                    "start": i.fields.getTextInputValue("start"),
                    "end": i.fields.getTextInputValue("end"),
                    "ooc": i.fields.getTextInputValue("ooc"),
                    "ic": i.fields.getTextInputValue("ic")
                });
            }

            let workersPath;
            if (bot.LEA.g.LSPD.includes(i.guild.id)) workersPath = (path.resolve("./db/LSPD") + "/" + i.message.interaction.user.id + ".json");
            else if (bot.LEA.g.LSCSO.includes(i.guild.id)) workersPath = (path.resolve("./db/LSCSO") + "/" + i.message.interaction.user.id + ".json");

            fs.writeFileSync(
                workersPath,
                JSON.stringify(content, null, 4)
            );

            console.log(" < [DB/OW/Apology] >  " + i.member.displayName + ` přepsal(a) omluvenku [${content.radio}] ${content.name} (${index})`);

            i.editReply({ content: "✅ **Přepsáno!**", ephemeral: true });
        }
    }
}