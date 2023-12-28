import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, InteractionType, ModalBuilder, TextInputBuilder, TextInputStyle, time } from "discord.js";
import fs from "fs";
import path from "path";
import { checkDB, checkEVENT, getServer } from "../../src/functions/db.js";
import { dg } from "../../src/functions/logSystem.js";

export default async function (bot, i) {
    if (i.type === InteractionType.ApplicationCommand) {
        //return i.reply({ content: "> 🛑 **Probíhá údržba bota!**", ephemeral: true });
        const command = bot.slashes.get(i.commandName);
        if (command) {
            command.default(bot, i);
        }
    }

    if (i.type === InteractionType.MessageComponent) {

        if (i.customId === "edit") {
            let passed = false;
            await i.guild.fetch();
            const admin = await i.member;
            if (admin.roles.cache.has("1145344761402765343")) passed = true; //Staff team Refresh
            if (admin.roles.cache.has("1139266408681844887")) passed = true; //.
            if (admin.id === "607915400604286997") passed = true; //Samus
            if (admin.id === "436180906533715969") passed = true; //Mičut
            if (admin.id === "411436203330502658") passed = true; //PetyXbron
            if (admin.id === i.message.interaction.user.id) passed = true; //Owner
            if (!passed) {
                return i.reply({ content: "> 🛑 **Nemůžeš přepisovat cizí záznamy!**", ephemeral: true });
            }

            let type;
            if (i.message.embeds[0] && i.message.embeds[0].title === "Záznam služby") type = 0;
            if (i.message.embeds[0] && i.message.embeds[0].title === "Omluvenka") type = 1;
            if (i.message.embeds[0] && i.message.embeds[0].fields[0].name === "CPZ záznam") type = 2;

            if (type === 0) {
                const modal = new ModalBuilder()
                    .setCustomId("dutyOWModal")
                    .setTitle("SAHP | Přepis služby");

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
                    .setTitle("SAHP | Přepis omluvenky");

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
            } else if (type === 2) {
                const modal = new ModalBuilder()
                    .setCustomId("cpzOWModal")
                    .setTitle("SAHP | Přepis CPZ");

                const nameInput = new TextInputBuilder()
                    .setCustomId("name")
                    .setLabel("Jméno občana")
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder("Will Smith")
                    .setRequired(true);

                const birthInput = new TextInputBuilder()
                    .setCustomId("birth")
                    .setLabel("Narození občana")
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder("12/31/1990")
                    .setMinLength(10)
                    .setMaxLength(10)
                    .setRequired(true);

                const reasonInput = new TextInputBuilder()
                    .setCustomId("reason")
                    .setLabel("Důvod zadržení")
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder("Nelegální akce")
                    .setRequired(true);

                const moneyInput = new TextInputBuilder()
                    .setCustomId("money")
                    .setLabel("Výpis trestu / pokut")
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder("15 000 $ + 1 rok odnětí svobody")
                    .setRequired(true);

                const pdInput = new TextInputBuilder()
                    .setCustomId("pd")
                    .setLabel("Řešili")
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder("Chris Evans, Addam Sandler")
                    .setRequired(true);

                const actionRow0 = new ActionRowBuilder().addComponents(nameInput);
                const actionRow1 = new ActionRowBuilder().addComponents(birthInput);
                const actionRow2 = new ActionRowBuilder().addComponents(reasonInput);
                const actionRow3 = new ActionRowBuilder().addComponents(moneyInput);
                const actionRow4 = new ActionRowBuilder().addComponents(pdInput);

                modal.addComponents(actionRow0, actionRow1, actionRow2, actionRow3, actionRow4);

                await i.showModal(modal);
            }
        }

        if (i.customId.includes("summary")) {
            let worker = {};
            if (i.customId.includes("_")) worker.id = i.customId.split("_")[1];
            else worker = i.message.interaction.user;
            await i.deferReply({ ephemeral: true });

            if (!(await checkDB(worker.id, i))) return i.editReply({ content: "> 🛑 <@" + worker.id + "> **není v DB.**", ephemeral: true });
            const member = await i.guild.members.fetch(worker.id);

            let log;
            if (bot.LEA.g.SAHP.includes(i.guild.id)) log = JSON.parse(fs.readFileSync((path.resolve("./db/SAHP") + "/" + worker.id + ".json"), "utf-8"));
            else if (bot.LEA.g.LSSD.includes(i.guild.id)) log = JSON.parse(fs.readFileSync((path.resolve("./db/LSSD") + "/" + worker.id + ".json"), "utf-8"));
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
                .setDescription("Pro zjištění dalších informací,\npoužij </kolega:1171119036730449975>.")
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
                .setFooter(getServer(i).footer);

            console.log(" < [DB/Souhrn] >  " + i.member.displayName + " zobrazil(a) souhrn " + member.displayName);

            await i.editReply({ embeds: [summEmbed], ephemeral: true });;
        }

        if (i.customId === "cidCreateCPZ") {
            const modal = new ModalBuilder()
                .setCustomId("cidCreateCPZmodal")
                .setTitle("CID | Vytvoření CID kanálu");

            const nameInput = new TextInputBuilder()
                .setCustomId("name")
                .setLabel("Jméno a přijmení zadrženého")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("Will Smith")
                .setRequired(true);

            const birthInput = new TextInputBuilder()
                .setCustomId("birth")
                .setLabel("Datum narození zadrženého")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("12/24/2023")
                .setMinLength(10)
                .setMaxLength(10)
                .setRequired(true);

            const actionRow0 = new ActionRowBuilder().addComponents(nameInput);
            const actionRow1 = new ActionRowBuilder().addComponents(birthInput);

            modal.addComponents(actionRow0, actionRow1);

            await i.showModal(modal);

            let submit = await i.awaitModalSubmit({ filter: int => int.user.id === i.user.id, time: 120000 }).catch(e => {
                return false;
            });

            if (submit) {
                const ch = await i.guild.channels.create({
                    name: submit.fields.getTextInputValue("name").replaceAll(" ", "-"),
                    type: ChannelType.GuildText,
                    topic: "CPZ kanál na jméno \"" + submit.fields.getTextInputValue("name") + "\" narozen(a) " + submit.fields.getTextInputValue("birth"),
                    nsfw: false,
                    reason: "CPZ kanál na vyžádání " + i.user.tag,
                    parent: i.channel.parent.id
                });

                await ch.send({ content: `## ${submit.fields.getTextInputValue("name")}\n> **Narozen(a):** ${submit.fields.getTextInputValue("birth")}\n> **Vytvořil(a):** <@${i.user.id}>` });

                await submit.reply({ content: `> ✅ **Úspěch! Kanál <#${ch.id}> vytvořen!**`, ephemeral: true });
            } else {
                await i.reply({ content: `> ❌ **Chyba, kanál nebyl vytvořen!**`, ephemeral: true });
            }

            console.log(" < [CID/CPZ] >  " + i.member.displayName + " vytvořil(a) CID kanál");
        }
    }

    if (i.type === InteractionType.ModalSubmit) {
        if (i.customId === "dutyModal") {
            let content;
            if (bot.LEA.g.SAHP.includes(i.guild.id)) content = JSON.parse(fs.readFileSync((path.resolve("./db/SAHP") + "/" + i.user.id + ".json"), "utf-8"));
            else if (bot.LEA.g.LSSD.includes(i.guild.id)) content = JSON.parse(fs.readFileSync((path.resolve("./db/LSSD") + "/" + i.user.id + ".json"), "utf-8"));
            else return i.reply({ content: "> 🛑 **Tenhle server není uveden a seznamu.**\nKontaktuj majitele (viz. </menu:1170376396678377596>).", ephemeral: true });

            const index = content.duties.length + 1;

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("edit")
                        .setLabel("Přepsat")
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji("📝"),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("summary")
                        .setLabel("Souhrn")
                        .setStyle(ButtonStyle.Success)
                        .setEmoji("👀"),
                );

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

            await i.deferReply();

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
                .setFooter(getServer(i).footer);

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
            if (bot.LEA.g.SAHP.includes(i.guild.id)) workersPath = (path.resolve("./db/SAHP") + "/" + i.user.id + ".json");
            else if (bot.LEA.g.LSSD.includes(i.guild.id)) workersPath = (path.resolve("./db/LSSD") + "/" + i.user.id + ".json");

            fs.writeFileSync(
                workersPath,
                JSON.stringify(content, null, 4)
            );

            console.log(" < [DB/Duty] >  " + i.member.displayName + " zapsal(a) duty o délce " + hours.toString() + " hodin");
        } else if (i.customId === "apologyModal") {
            let content;
            if (bot.LEA.g.SAHP.includes(i.guild.id)) content = JSON.parse(fs.readFileSync((path.resolve("./db/SAHP") + "/" + i.user.id + ".json"), "utf-8"));
            else if (bot.LEA.g.LSSD.includes(i.guild.id)) content = JSON.parse(fs.readFileSync((path.resolve("./db/LSSD") + "/" + i.user.id + ".json"), "utf-8"));
            else return i.reply({ content: "> 🛑 **Tenhle server není uveden a seznamu.**\nKontaktuj majitele (viz. </menu:1170376396678377596>).", ephemeral: true });

            const index = content.apologies.length + 1;

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("edit")
                        .setLabel("Přepsat")
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji("📝"),
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
                .setFooter(getServer(i).footer);

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
            if (bot.LEA.g.SAHP.includes(i.guild.id)) workersPath = (path.resolve("./db/SAHP") + "/" + i.user.id + ".json");
            else if (bot.LEA.g.LSSD.includes(i.guild.id)) workersPath = (path.resolve("./db/LSSD") + "/" + i.user.id + ".json");

            fs.writeFileSync(
                workersPath,
                JSON.stringify(content, null, 4)
            );

            console.log(" < [DB/Apology] >  " + i.member.displayName + " zapsal(a) omluvenku trvající do " + i.fields.getTextInputValue("end"));
        } else if (i.customId === "cpzModal") {
            await i.deferReply();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("edit")
                        .setLabel("Přepsat")
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji("📝"),
                );

            const cpzEmbed = new EmbedBuilder()
                .setAuthor({ name: i.member.displayName, iconURL: i.member.displayAvatarURL() })
                .setTitle(i.fields.getTextInputValue("name"))
                .addFields([
                    {
                        name: "CPZ záznam", inline: false,
                        value:
                            `**Jméno:** \`${i.fields.getTextInputValue("name")}\`\n`
                            + `**Narozen(a):** \`${i.fields.getTextInputValue("birth")}\`\n`
                            + `**Důvod:** \`\`\`${i.fields.getTextInputValue("reason")}\`\`\`\n`
                            + `**Tresty:** \`${i.fields.getTextInputValue("money")}\`\n`
                            + `**Řešili:** \`${i.fields.getTextInputValue("pd")}\``
                    }
                ])
                .setThumbnail("https://i.imgur.com/31WU5cn.png")
                .setColor(bot.LEA.c.cpz)
                .setFooter(getServer(i).footer);

            console.log(" < [CMD/CPZ] >  " + i.member.displayName + " zapsal(a) CPZ občana " + i.fields.getTextInputValue("name"));

            await i.editReply({ embeds: [cpzEmbed], components: [row] });
        } else if (i.customId === "loginModal") {
            if (await checkDB(i.fields.getTextInputValue("id"), i)) return i.reply({ content: "> 🛑 <@" + i.fields.getTextInputValue("id") + "> **už je v DB.**", ephemeral: true });

            let post = false, folders;
            const today = new Date();
            if (i.guild.id === "1035916575594795008") { //LSSD
                return await i.editReply({ content: "> 🛑 **LSSD má pozastavenou podporu.**" });
                /*folders = await i.guild.channels.fetch("1178098611733667880");
                post = await folders.threads.create({
                    name: `[${i.fields.getTextInputValue("call")}] ${i.fields.getTextInputValue("name")}`,
                    message: {
                        content:
                            `> **Jméno:** ${i.fields.getTextInputValue("name")}`
                            + `\n> **Hodnost:** ${i.fields.getTextInputValue("rank")}`
                            + `\n> **Odznak:** ${i.fields.getTextInputValue("badge")}`
                            + `\n> **Volačka:** ${i.fields.getTextInputValue("call")}`
                    }
                });*/
            } else if (i.guild.id === "1139266097921675345") { //SAHP
                folders = await i.guild.channels.fetch("1188146028440997948");
                try { var member = await i.guild.members.fetch(i.fields.getTextInputValue("id")); }
                catch (e) { await i.reply({ content: "> 🛑 **Člen nebyl nalezen.**", ephemeral: true }); console.log(e); }

                const rank = i.fields.getTextInputValue("rank"),
                    name = i.fields.getTextInputValue("name"),
                    radio = i.fields.getTextInputValue("call"),
                    badge = i.fields.getTextInputValue("badge");
                let roleID, tagID;
                if (rank === "Trooper Trainee") roleID = "1139276175819157646", tagID = "1188146360327872613";
                else if (rank === "Trooper I") roleID = "1139276036673130527", tagID = "1188146386206724126";
                else if (rank === "Trooper II") roleID = "1139275934025916568", tagID = "1188146415583625316";
                else if (rank === "Trooper III") roleID = "1139275782607347905", tagID = "1188146446885716030";
                else if (rank === "Sergeant") roleID = "1139275398295867453", tagID = "1188146467442012160";
                else if (rank === "Lieutenant") roleID = "1139275038877560856", tagID = "1188146485582377051";
                else if (rank === "Captain") roleID = "1139274974683746335", tagID = "1188146485582377051";
                else roleID = false, tagID = false;

                if (!roleID) await i.reply({ content: `> 🛑 **Neznámá hodnost... (\`${rank}\`)**`, ephemeral: true });

                await i.deferReply();

                const workerEmbed = new EmbedBuilder()
                    .setAuthor({ name: `[${radio}] ${name}`, iconURL: member.displayAvatarURL() })
                    .setDescription(
                        `> **App:** <@${member.id}>`
                        + `\n> **Jméno:** \`${name}\``
                        + `\n> **Hodnost:** ${roleID ? `<@&${roleID}>` : `\`${rank}\``}`
                        + `\n> **Odznak:** \`${badge}\``
                        + `\n> **Volačka:** \`${radio}\``
                        + "\n\n"
                        + `\n> **Hodin:** \`0\``
                        + `\n> **Omluvenek:** \`0\``
                        + `\n> **Povýšení:** ${time(today, "R")}`
                    )
                    .setThumbnail("https://i.imgur.com/xgFoKuX.png")
                    .setColor(bot.LEA.c.SAHP)
                    .setFooter({ text: "SAHP | Vytvořil b1ngo ✌️", iconURL: bot.LEA.i.SAHP });
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("summary_" + member.id)
                            .setLabel("Souhrn")
                            .setStyle(ButtonStyle.Success)
                            .setEmoji("👀"),
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
                await member.setNickname(`[${radio}] ${name}`);
                try { await member.roles.add(["1139276300188647444", roleID]); }
                catch { }

                const onderka = await i.guild.members.fetch("411436203330502658");
                const slozkaEmbed = new EmbedBuilder()
                    .setAuthor({ name: onderka.displayName, iconURL: onderka.displayAvatarURL() })
                    .setTitle("Vítejte ve Vaší složce!")
                    .setDescription(
                        `Zdravím <@${member.id}>, gratuluji Vám k úspěšnému přijetí na hodnost <@&${roleID}>.`
                        + "\n**Zde si povinně zapisujete časy služeb a případné omluvenky.**"
                        + "\n\n**Službu si zapisujete pomocí </duty:1170376396678377595> a omluvenku přes </omluvenka:1170382276492800131>.**"
                        + "\nVe skutečnosti je to prosté. Systém Vás navede při použití příkazů."
                        + "\nV případě dotazů, neváhejte mě (<@411436203330502658>) označit. Ovšem, nepište DMs."
                    )
                    .setThumbnail("https://i.imgur.com/xgFoKuX.png")
                    .setColor(getServer(i).color)
                    .setFooter(getServer(i).footer);
                await post.send({ content: `<@${member.id}>`, embeds: [slozkaEmbed] });
            }

            const worker = {
                "badge": parseInt(i.fields.getTextInputValue("badge")),
                "name": i.fields.getTextInputValue("name"),
                "radio": i.fields.getTextInputValue("call"),
                "rank": i.fields.getTextInputValue("rank"),
                "folder": post ? post.id : null,
                "hours": 0,
                "duties": [],
                "apologies": [],
                "rankups": [
                    {
                        "date": today.getDate() + ". " + (parseInt(today.getMonth()) + 1) + ". " + today.getFullYear(),
                        "to": i.fields.getTextInputValue("rank"),
                        "from": null,
                        "boss": i.member.displayName,
                        "reason": "Přidání do DB",
                        "hours": 0
                    }
                ]
            };

            let workersPath;
            if (bot.LEA.g.SAHP.includes(i.guild.id)) workersPath = (path.resolve("./db/SAHP") + "/" + i.fields.getTextInputValue("id") + ".json");
            else if (bot.LEA.g.LSSD.includes(i.guild.id)) workersPath = (path.resolve("./db/LSSD") + "/" + i.fields.getTextInputValue("id") + ".json");
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
                    + "\n> **Přezdívka:** ✅"
                    + "\n> **Role:** ✅"
                    + "\n> **Databáze:** ✅"
                )
                .setColor(getServer(i).color)
                .setFooter(getServer(i).footer);

            console.log(" < [DB/Login] >  " + i.member.displayName + " zaregistroval(a) [" + i.fields.getTextInputValue("call") + "] " + i.fields.getTextInputValue("name") + " do DB");

            await i.editReply({ embeds: [loginEmbed] });
        } else if (i.customId === "rankUpModal") {
            await i.deferReply({ ephemeral: true });

            if (!(await checkDB(i.fields.getTextInputValue("id"), i))) return i.editReply({ content: "> 🛑 <@" + i.fields.getTextInputValue("id") + "> **není v DB.**", ephemeral: true });

            let oldRoleID, roleID, tagID, newRank = i.fields.getTextInputValue("rank");
            if (newRank === "Trooper Trainee") roleID = "1139276175819157646", tagID = "1188146360327872613";
            else if (newRank === "Trooper I") roleID = "1139276036673130527", tagID = "1188146386206724126";
            else if (newRank === "Trooper II") roleID = "1139275934025916568", tagID = "1188146415583625316";
            else if (newRank === "Trooper III") roleID = "1139275782607347905", tagID = "1188146446885716030";
            else if (newRank === "Sergeant") roleID = "1139275398295867453", tagID = "1188146467442012160";
            else if (newRank === "Lieutenant") roleID = "1139275038877560856", tagID = "1188146485582377051";
            else if (newRank === "Captain") roleID = "1139274974683746335", tagID = "1188146485582377051";
            else roleID = false, tagID = false;
            if (!roleID) await i.reply({ content: `> 🛑 **Neznámá hodnost... (\`${newRank}\`)**`, ephemeral: true });

            let content;
            if (bot.LEA.g.SAHP.includes(i.guild.id)) content = JSON.parse(fs.readFileSync((path.resolve("./db/SAHP") + "/" + i.fields.getTextInputValue("id") + ".json"), "utf-8"));
            else if (bot.LEA.g.LSSD.includes(i.guild.id)) content = JSON.parse(fs.readFileSync((path.resolve("./db/LSSD") + "/" + i.fields.getTextInputValue("id") + ".json"), "utf-8"));
            const member = await i.guild.members.fetch(i.fields.getTextInputValue("id"));

            if (content.rank === "Trooper Trainee") oldRoleID = "1139276175819157646";
            else if (content.rank === "Trooper I") oldRoleID = "1139276036673130527";
            else if (content.rank === "Trooper II") oldRoleID = "1139275934025916568";
            else if (content.rank === "Trooper III") oldRoleID = "1139275782607347905";
            else if (content.rank === "Sergeant") oldRoleID = "1139275398295867453";
            else if (content.rank === "Lieutenant") oldRoleID = "1139275038877560856";
            else if (content.rank === "Captain") oldRoleID = "1139274974683746335";

            const today = new Date();

            console.log(" < [DB/Rankup] >  " + i.member.displayName + ` povýšil(a) [${content.radio}] ${content.name} na [${i.fields.getTextInputValue("call")}] ${content.name} (${i.fields.getTextInputValue("rank")})`);

            const rankup = {
                "date": today.getDate() + ". " + (parseInt(today.getMonth()) + 1) + ". " + today.getFullYear(),
                "to": i.fields.getTextInputValue("rank"),
                "from": content.rank,
                "boss": i.member.displayName,
                "reason": i.fields.getTextInputValue("reason"),
                "hours": content.hours
            };
            content.rankups.push(rankup);
            content.badge = parseInt(i.fields.getTextInputValue("badge"));
            content.radio = i.fields.getTextInputValue("call");
            content.rank = i.fields.getTextInputValue("rank");

            let workersPath;
            if (bot.LEA.g.SAHP.includes(i.guild.id)) workersPath = (path.resolve("./db/SAHP") + "/" + i.fields.getTextInputValue("id") + ".json");
            else if (bot.LEA.g.LSSD.includes(i.guild.id)) workersPath = (path.resolve("./db/LSSD") + "/" + i.fields.getTextInputValue("id") + ".json");

            fs.writeFileSync(
                workersPath,
                JSON.stringify(content, null, 4)
            );

            await member.setNickname(`[${content.radio}] ${content.name}`);
            await member.roles.remove([oldRoleID]);
            await member.roles.add([roleID]);

            const rankupEmbed = new EmbedBuilder()
                .setTitle("Úspěch")
                .setDescription(`<@${i.fields.getTextInputValue("id")}> byl(a) povýšen(a)!`)
                .setColor(getServer(i).color)
                .setFooter(getServer(i).footer);

            await i.editReply({ embeds: [rankupEmbed], ephemeral: true });

            if (content.folder) {
                try {
                    const folder = await i.guild.channels.fetch(content.folder);
                    const start = await folder.fetchStarterMessage({ force: true });

                    await folder.setAppliedTags([tagID]);

                    if (start) {
                        const rankUpDateArr = content.rankups[content.rankups.length - 1].date.split(". ");
                        const rankUpDate = new Date(rankUpDateArr[1] + "/" + rankUpDateArr[0] + "/" + rankUpDateArr[2]);

                        const workerEmbed = new EmbedBuilder()
                            .setAuthor({ name: `[${content.radio}] ${content.name}`, iconURL: member.displayAvatarURL() })
                            .setDescription(
                                `> **App:** <@${i.fields.getTextInputValue("id")}>`
                                + `\n> **Jméno:** \`${content.name}\``
                                + `\n> **Hodnost:** ${roleID ? `<@&${roleID}>` : `\`${content.rank}\``}`
                                + `\n> **Odznak:** \`${content.badge}\``
                                + `\n> **Volačka:** \`${content.radio}\``
                                + "\n\n"
                                + `\n> **Hodin:** \`${Math.round((content.hours + Number.EPSILON) * 100) / 100}\``
                                + `\n> **Omluvenek:** \`${content.apologies.filter(a => !a.removed).length}\``
                                + `\n> **Povýšení:** ${time(rankUpDate, "R")}`
                            )
                            .setThumbnail("https://i.imgur.com/xgFoKuX.png")
                            .setColor(bot.LEA.c.SAHP)
                            .setFooter({ text: "SAHP | Vytvořil b1ngo ✌️", iconURL: bot.LEA.i.SAHP });
                        const row = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId("summary_" + i.fields.getTextInputValue("id"))
                                    .setLabel("Souhrn")
                                    .setStyle(ButtonStyle.Success)
                                    .setEmoji("👀"),
                            );
                        await start.edit({ message: `<@${i.fields.getTextInputValue("id")}>`, embeds: [workerEmbed], components: [row] });
                    }
                    const rankup2Embed = new EmbedBuilder()
                        .setTitle("Povýšení!")
                        .setDescription(
                            `Gratuluji <@${i.fields.getTextInputValue("id")}>, byl(a) jste úspěšně povýšen(a).`
                            + `\nZkontrolujte si své nové údaje.`
                        )
                        .addFields([
                            {
                                name: `Aktualizace`, inline: true,
                                value:
                                    `> **Popis složky:** ${start ? "✅" : "❌"}\n`
                                    + `> **Název složky:** "✅"\n`
                                    + `> **Přezdívka:** "✅"`
                                    + `> **Role:** "✅"`
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
                        .setThumbnail("https://i.imgur.com/xgFoKuX.png")
                        .setColor(getServer(i).color)
                        .setFooter(getServer(i).footer);
                    await folder.send({ content: `<@${i.fields.getTextInputValue("id")}>` + (start ? "" : "<@411436203330502658>"), embeds: [rankup2Embed] });

                    await folder.setName(`[${i.fields.getTextInputValue("call")}] ${content.name}`);
                    await folder.setName(`[${i.fields.getTextInputValue("call")}] ${content.name}`);
                    await folder.setName(`[${i.fields.getTextInputValue("call")}] ${content.name}`);
                } catch (e) {
                    console.error(e);
                }

                if (bot.LEA.g.LSSD.includes(i.guild.id) && !bot.LEA.g.SAHP.includes(i.guild.id)) {
                    const msg = folder.fetchStarterMessage();
                    await msg.edit({
                        content:
                            `> **Jméno:** ${content.name}`
                            + `\n> **Hodnost:** ${i.fields.getTextInputValue("rank")}`
                            + `\n> **Odznak:** ${i.fields.getTextInputValue("badge")}`
                            + `\n> **Volačka:** ${i.fields.getTextInputValue("call")}`
                    });
                }
            }

        } else if (i.customId === "dutyOWModal") {
            await i.deferReply({ ephemeral: true });

            if (!(await checkDB(i.message.interaction.user.id, i))) return i.editReply({ content: "> 🛑 <@" + user.id + "> **už není v DB.**", ephemeral: true });

            let content;
            if (bot.LEA.g.SAHP.includes(i.guild.id)) content = JSON.parse(fs.readFileSync((path.resolve("./db/SAHP") + "/" + i.message.interaction.user.id + ".json"), "utf-8"));
            else if (bot.LEA.g.LSSD.includes(i.guild.id)) content = JSON.parse(fs.readFileSync((path.resolve("./db/LSSD") + "/" + i.message.interaction.user.id + ".json"), "utf-8"));

            const index = parseInt(i.message.embeds[0].fields[0].name.slice(-1)) - 1;
            const member = await i.guild.members.fetch(i.message.interaction.user.id);

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("edit")
                        .setLabel("Přepsat")
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji("📝"),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("summary")
                        .setLabel("Souhrn")
                        .setStyle(ButtonStyle.Success)
                        .setEmoji("👀"),
                );

            if (
                (i.fields.getTextInputValue("datum").split(" ").length - 1) !== 2
                || (i.fields.getTextInputValue("datum").split(".").length - 1) !== 2
            ) {
                return await i.editReply({
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
                return await i.editReply({
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
                .setFooter(getServer(i).footer);

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
            if (bot.LEA.g.SAHP.includes(i.guild.id)) workersPath = (path.resolve("./db/SAHP") + "/" + i.message.interaction.user.id + ".json");
            else if (bot.LEA.g.LSSD.includes(i.guild.id)) workersPath = (path.resolve("./db/LSSD") + "/" + i.message.interaction.user.id + ".json");

            fs.writeFileSync(
                workersPath,
                JSON.stringify(content, null, 4)
            );

            console.log(" < [DB/OW/Duty] >  " + i.member.displayName + ` přepsal(a) duty [${content.radio}] ${content.name} (${index}) z ${i.fields.getTextInputValue("datum")}`);

            i.editReply({ content: "✅ **Přepsáno!**", ephemeral: true });
        } else if (i.customId === "apologyOWModal") {
            await i.deferReply({ ephemeral: true });

            if (!(await checkDB(i.message.interaction.user.id, i))) return i.editReply({ content: "> 🛑 <@" + user.id + "> **už není v DB.**", ephemeral: true });

            let content;
            if (bot.LEA.g.SAHP.includes(i.guild.id)) content = JSON.parse(fs.readFileSync((path.resolve("./db/SAHP") + "/" + i.message.interaction.user.id + ".json"), "utf-8"));
            else if (bot.LEA.g.LSSD.includes(i.guild.id)) content = JSON.parse(fs.readFileSync((path.resolve("./db/LSSD") + "/" + i.message.interaction.user.id + ".json"), "utf-8"));

            const index = parseInt(i.message.embeds[0].fields[0].name.slice(-1)) - 1;
            const member = await i.guild.members.fetch(i.message.interaction.user.id);

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("edit")
                        .setLabel("Přepsat")
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji("📝"),
                );

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
                .setFooter(getServer(i).footer);

            try {
                await i.message.edit({ embeds: [apologyEmbed], components: [row] });
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
            if (bot.LEA.g.SAHP.includes(i.guild.id)) workersPath = (path.resolve("./db/SAHP") + "/" + i.message.interaction.user.id + ".json");
            else if (bot.LEA.g.LSSD.includes(i.guild.id)) workersPath = (path.resolve("./db/LSSD") + "/" + i.message.interaction.user.id + ".json");

            fs.writeFileSync(
                workersPath,
                JSON.stringify(content, null, 4)
            );

            console.log(" < [DB/OW/Apology] >  " + i.member.displayName + ` přepsal(a) omluvenku [${content.radio}] ${content.name} (${index})`);

            i.editReply({ content: "✅ **Přepsáno!**", ephemeral: true });
        } else if (i.customId === "cpzOWModal") {
            await i.deferReply({ ephemeral: true });

            const member = await i.guild.members.fetch(i.message.interaction.user.id);

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("edit")
                        .setLabel("Přepsat")
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji("📝"),
                );

            const cpzEmbed = new EmbedBuilder()
                .setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() })
                .setTitle(i.fields.getTextInputValue("name"))
                .addFields([
                    {
                        name: "CPZ záznam", inline: false,
                        value:
                            `**Jméno:** \`${i.fields.getTextInputValue("name")}\`\n`
                            + `**Narozen(a):** \`${i.fields.getTextInputValue("birth")}\`\n`
                            + `**Důvod:** \`\`\`${i.fields.getTextInputValue("reason")}\`\`\`\n`
                            + `**Tresty:** \`${i.fields.getTextInputValue("money")}\`\n`
                            + `**Řešili:** \`${i.fields.getTextInputValue("pd")}\``
                    }
                ])
                .setThumbnail("https://i.imgur.com/31WU5cn.png")
                .setColor(bot.LEA.c.cpz)
                .setFooter(getServer(i).footer);

            try {
                await i.message.edit({ embeds: [cpzEmbed], components: [row] });
            } catch (e) {
                console.error(e);
                return await i.editReply({ content: "> 🛑 **Chyba! Zpráva nešla upravit.**```" + e + "```" });
            }

            console.log(" < [OW/CPZ] >  " + i.member.displayName + ` přepsal(a) CPZ zápis ${i.fields.getTextInputValue("name")} (${i.fields.getTextInputValue("birth")}) od ${i.fields.getTextInputValue("pd")}`);

            i.editReply({ content: "✅ **Přepsáno!**", ephemeral: true });
        } else if (i.customId === "fakturaModal") {
            if (!(await checkDB(i.user.id, i))) {
                let worker;
                if (bot.LEA.g.SAHP.includes(i.guild.id)) worker = JSON.parse(fs.readFileSync((path.resolve("./db/SAHP") + "/" + i.user.id + ".json"), "utf-8"));
                else if (bot.LEA.g.LSSD.includes(i.guild.id)) worker = JSON.parse(fs.readFileSync((path.resolve("./db/LSSD") + "/" + i.user.id + ".json"), "utf-8"));
                else return i.reply({ content: "> 🛑 **Tenhle server není uveden a seznamu.**\nKontaktuj majitele (viz. </menu:1170376396678377596>).", ephemeral: true });

                if (!worker) return i.reply({ content: "> 🛑 **Před zapsáním __faktury__ tě musí admin přilásit do DB.** Můžeš si založit <#1139284046388674610>.", ephemeral: true });
            }

            if (!(await checkEVENT(i.user.id, i))) {
                let worker;
                if (bot.LEA.g.SAHP.includes(i.guild.id)) worker = JSON.parse(fs.readFileSync((path.resolve("./db/SAHP") + "/" + i.user.id + ".json"), "utf-8"));
                else if (bot.LEA.g.LSSD.includes(i.guild.id)) worker = JSON.parse(fs.readFileSync((path.resolve("./db/LSSD") + "/" + i.user.id + ".json"), "utf-8"));
                else return i.reply({ content: "> 🛑 **Tenhle server není uveden a seznamu.**\nKontaktuj majitele (viz. </menu:1170376396678377596>).", ephemeral: true });

                const content = {
                    name: worker.name,
                    stats: {
                        value: 0,
                        invoices: 0
                    },
                    invoices: []
                };

                fs.writeFileSync(
                    (path.resolve("./db/event") + "/" + i.user.id + ".json"),
                    JSON.stringify(content, null, 4)
                );
            }

            const user = await JSON.parse(fs.readFileSync((path.resolve("./db/event") + "/" + i.user.id + ".json"), "utf-8"));

            await i.deferReply({ ephemeral: true });

            const idFile = fs.readdirSync(path.resolve("./db/event")).filter(f => f.endsWith(".txt"))[0];
            const id = parseInt(idFile.split(".")[0]) + 1;

            const invoiceEmbed = new EmbedBuilder()
                .setAuthor({ name: i.member.displayName, iconURL: i.member.displayAvatarURL() })
                .setTitle("EVENT | Zápis faktury")
                .setDescription("Faktura byla zapsána do soutěže!")
                .addFields([
                    {
                        name: `Faktura #` + id.toString(), inline: false,
                        value:
                            `> **Jméno:** \`${i.fields.getTextInputValue("name")}\`\n`
                            + `> **Důvod:** \`\`\`${i.fields.getTextInputValue("reason")}\`\`\`\n`
                            + `> **Částka:** \`${parseInt(i.fields.getTextInputValue("money").split(" ").join("")).toLocaleString()} $\``
                    }
                ])
                .setThumbnail("https://i.imgur.com/bGCFY6I.png")
                .setImage(bot.LEA.i.event[Math.floor(Math.random() * bot.LEA.i.event.length)])
                .setColor(bot.LEA.c.event)
                .setFooter(getServer(i).footer);

            const today = new Date();

            const day = dg(today, "Date") + ". " + dg(today, "Month") + ". " + dg(today, "FullYear");
            const time = dg(today, "Hours") + ":" + dg(today, "Minutes") + ":" + dg(today, "Seconds");

            user.invoices.push({
                "value": parseInt(i.fields.getTextInputValue("money").split(" ").join("")),
                "shared": day + " " + time,
                "reason": i.fields.getTextInputValue("reason"),
                "name": i.fields.getTextInputValue("name"),
                "id": id
            });
            user.stats.value = user.stats.value + parseInt(i.fields.getTextInputValue("money").split(" ").join(""));
            user.stats.invoices = user.invoices.length;

            fs.writeFileSync(
                (path.resolve("./db/event") + "/" + i.user.id + ".json"),
                JSON.stringify(user, null, 4)
            );

            fs.renameSync(path.resolve("./db/event") + "/" + idFile, path.resolve("./db/event") + "/" + id.toString() + ".txt");

            console.log(" < [EVE/Faktura] >  " + i.member.displayName + " si zapsal fakturu s ID " + id);

            await i.editReply({ embeds: [invoiceEmbed], ephemeral: true });
        }
    }
}