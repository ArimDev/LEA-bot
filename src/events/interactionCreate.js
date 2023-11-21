import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, InteractionType, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import fs from "fs";
import path from "path";
import { checkDB, checkEVENT } from "../../src/functions/db.js";

export default async function (bot, i) {
    if (i.type === InteractionType.ApplicationCommand) {
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
                return i.reply({ content: "🛑 **Nemůžeš přepisovat cizí záznamy!**", ephemeral: true });
            }

            let type;
            if (i.message.embeds[0] && i.message.embeds[0].title === "Záznam služby") type = 0;
            if (i.message.embeds[0] && i.message.embeds[0].title === "Omluvenka") type = 1;
            if (i.message.embeds[0] && i.message.embeds[0].fields[0].name === "CPZ záznam") type = 2;

            if (type === 0) {
                const modal = new ModalBuilder()
                    .setCustomId("dutyOWModal")
                    .setTitle("SAHP | Přepis služby");

                const dateInput = new TextInputBuilder()
                    .setCustomId("datum")
                    .setLabel("Datum služby [31. 12. 2023]")
                    .setStyle(TextInputStyle.Short);

                const startInput = new TextInputBuilder()
                    .setCustomId("start")
                    .setLabel("Začátek služby [13:00]")
                    .setStyle(TextInputStyle.Short);

                const endInput = new TextInputBuilder()
                    .setCustomId("end")
                    .setLabel("Konec služby [17:00]")
                    .setStyle(TextInputStyle.Short);

                const signInput = new TextInputBuilder()
                    .setCustomId("signature")
                    .setLabel("Podpis [Smith]")
                    .setStyle(TextInputStyle.Short);

                const actionRow0 = new ActionRowBuilder().addComponents(dateInput);
                const actionRow1 = new ActionRowBuilder().addComponents(startInput);
                const actionRow2 = new ActionRowBuilder().addComponents(endInput);
                const actionRow3 = new ActionRowBuilder().addComponents(signInput);

                modal.addComponents(actionRow0, actionRow1, actionRow2, actionRow3);

                await i.showModal(modal);
            } else if (type === 1) {
                const modal = new ModalBuilder()
                    .setCustomId("apologyOWModal")
                    .setTitle("SAHP | Přepis omluvenky");

                const startInput = new TextInputBuilder()
                    .setCustomId("start")
                    .setLabel("Od kdy [31. 12. 2023]")
                    .setStyle(TextInputStyle.Short);

                const endInput = new TextInputBuilder()
                    .setCustomId("end")
                    .setLabel("Do kdy [5. 1. 2024]")
                    .setStyle(TextInputStyle.Short);

                const oocInput = new TextInputBuilder()
                    .setCustomId("ooc")
                    .setLabel("OOC důvod [Rodinná akce]")
                    .setStyle(TextInputStyle.Paragraph);

                const icInput = new TextInputBuilder()
                    .setCustomId("ic")
                    .setLabel("IC důvod [Zlomená ruka]")
                    .setStyle(TextInputStyle.Paragraph);

                const signInput = new TextInputBuilder()
                    .setCustomId("signature")
                    .setLabel("Podpis [Smith]")
                    .setStyle(TextInputStyle.Short);

                const actionRow0 = new ActionRowBuilder().addComponents(startInput);
                const actionRow1 = new ActionRowBuilder().addComponents(endInput);
                const actionRow2 = new ActionRowBuilder().addComponents(oocInput);
                const actionRow3 = new ActionRowBuilder().addComponents(icInput);
                const actionRow4 = new ActionRowBuilder().addComponents(signInput);

                modal.addComponents(actionRow0, actionRow1, actionRow2, actionRow3, actionRow4);

                await i.showModal(modal);
            } else if (type === 2) {
                const modal = new ModalBuilder()
                    .setCustomId("cpzOWModal")
                    .setTitle("SAHP | Přepis CPZ");

                const nameInput = new TextInputBuilder()
                    .setCustomId("name")
                    .setLabel("Jméno občana [Will Smith]")
                    .setStyle(TextInputStyle.Short);

                const birthInput = new TextInputBuilder()
                    .setCustomId("birth")
                    .setLabel("Narození občana [12/31/1990]")
                    .setStyle(TextInputStyle.Short);

                const reasonInput = new TextInputBuilder()
                    .setCustomId("reason")
                    .setLabel("Důvod zadržení [Nelegální akce]")
                    .setStyle(TextInputStyle.Paragraph);

                const moneyInput = new TextInputBuilder()
                    .setCustomId("money")
                    .setLabel("Výpis trestu / pokut")
                    .setStyle(TextInputStyle.Paragraph);

                const pdInput = new TextInputBuilder()
                    .setCustomId("pd")
                    .setLabel("Řešili [Chris Evans, Adam Sandler]")
                    .setStyle(TextInputStyle.Short);

                const actionRow0 = new ActionRowBuilder().addComponents(nameInput);
                const actionRow1 = new ActionRowBuilder().addComponents(birthInput);
                const actionRow2 = new ActionRowBuilder().addComponents(reasonInput);
                const actionRow3 = new ActionRowBuilder().addComponents(moneyInput);
                const actionRow4 = new ActionRowBuilder().addComponents(pdInput);

                modal.addComponents(actionRow0, actionRow1, actionRow2, actionRow3, actionRow4);

                await i.showModal(modal);
            }
        }

        if (i.customId === "summary") {
            await i.deferReply({ ephemeral: true });

            const worker = i.message.interaction.user;
            if (!(await checkDB(worker.id))) return i.editReply({ content: "🛑 <@" + worker.id + "> **není v DB.**", ephemeral: true });
            const member = await i.guild.members.fetch(worker.id);

            const log = JSON.parse(fs.readFileSync((path.resolve("./db/workers") + "/" + worker.id + ".json"), "utf-8"));

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
                .setColor(bot.SAHP.c.summary)
                .setFooter({ text: "SAHP", iconURL: bot.user.avatarURL() });

            console.log(" < [DB/Souhrn] >  " + i.member.displayName + " zobrazil(a) souhrn " + member.displayName);

            await i.editReply({ embeds: [summEmbed], ephemeral: true });;
        }
    }

    if (i.type === InteractionType.ModalSubmit) {
        if (i.customId === "dutyModal") {
            let content = JSON.parse(fs.readFileSync((path.resolve("./db/workers") + "/" + i.user.id + ".json"), "utf-8"));
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
                        + `> **Do:** \`${i.fields.getTextInputValue("end")}\`\n`
                        + `> **Podpis:** ${i.fields.getTextInputValue("signature")}`,
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
                        + `> **Do:** \`${i.fields.getTextInputValue("end")}\`\n`
                        + `> **Podpis:** ${i.fields.getTextInputValue("signature")}`,
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
                            + `> **Hodin:**  \`${hours}\`\n`
                            + `> **Podpis:** ${i.fields.getTextInputValue("signature")}`
                    }
                ])
                .setThumbnail("https://i.imgur.com/dsZyqaJ.png")
                .setColor(bot.SAHP.c.duty)
                .setFooter({ text: "SAHP", iconURL: bot.user.avatarURL() });

            await i.editReply({ embeds: [dutyEmbed], components: [row] });

            content.duties.push({
                "removed": false,
                "date": i.fields.getTextInputValue("datum"),
                "start": i.fields.getTextInputValue("start"),
                "end": i.fields.getTextInputValue("end"),
                "hours": hours
            });
            content.hours = (Math.round((parseFloat(content.hours) + Number.EPSILON) * 100) / 100) + hours;
            content.folder = i.channelId;

            fs.writeFileSync(
                (path.resolve("./db/workers") + "/" + i.user.id + ".json"),
                JSON.stringify(content, null, 4)
            );

            console.log(" < [DB/Duty] >  " + i.member.displayName + " zapsal(a) duty o délce" + hours.toString() + " hodin");
        } else if (i.customId === "apologyModal") {
            let content = JSON.parse(fs.readFileSync((path.resolve("./db/workers") + "/" + i.user.id + ".json"), "utf-8"));
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
                (i.fields.getTextInputValue("start").split(" ").length - 1) !== 2
                || (i.fields.getTextInputValue("end").split(".").length - 1) !== 2
            ) {
                return await i.reply({
                    content:
                        "### Nalezena chyba - datum!"
                        + "\n- Formát data je špatně. Napiš např. `24. 12. 2023` (tečky a mezery)"
                        + "\nZadal(a) jsi:\n"
                        + `> **Začátek:** \`${i.fields.getTextInputValue("start")}\`\n`
                        + `> **Konec:** \`${i.fields.getTextInputValue("end")}\`\n`
                        + `> **OOC Důvod:** \`${i.fields.getTextInputValue("ooc")}\`\n`
                        + `> **IC Důvod:** \`${i.fields.getTextInputValue("ic")}\`\n`
                        + `> **Podpis:** ${i.fields.getTextInputValue("signature")}`,
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
                            `> **Začátek:** \`${i.fields.getTextInputValue("start")}\`\n`
                            + `> **Konec:** \`${i.fields.getTextInputValue("end")}\`\n`
                            + `> **OOC Důvod:** \`${i.fields.getTextInputValue("ooc")}\`\n`
                            + `> **IC Důvod:** \`${i.fields.getTextInputValue("ic")}\`\n`
                            + `> **Podpis:** ${i.fields.getTextInputValue("signature")}`
                    }
                ])
                .setThumbnail("https://i.imgur.com/Ja58hkU.png")
                .setColor(bot.SAHP.c.apology)
                .setFooter({ text: "SAHP", iconURL: bot.user.avatarURL() });

            await i.editReply({ embeds: [dutyEmbed], components: [row] });

            const today = new Date();
            content.apologies.push({
                "removed": false,
                "shared": today.getDate() + ". " + (parseInt(today.getMonth()) + 1) + ". " + today.getFullYear(),
                "start": i.fields.getTextInputValue("start"),
                "end": i.fields.getTextInputValue("end"),
                "ooc": i.fields.getTextInputValue("ooc"),
                "ic": i.fields.getTextInputValue("ic")
            });
            content.folder = i.channelId;

            fs.writeFileSync(
                (path.resolve("./db/workers") + "/" + i.user.id + ".json"),
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
                .setColor(bot.SAHP.c.cpz)
                .setFooter({ text: "SAHP", iconURL: bot.user.avatarURL() });

            console.log(" < [CMD/CPZ] >  " + i.member.displayName + " zapsal(a) CPZ občana " + i.fields.getTextInputValue("name"));

            await i.editReply({ embeds: [cpzEmbed], components: [row] });
        } else if (i.customId === "loginModal") {
            await i.deferReply({ ephemeral: true });

            if (await checkDB(i.fields.getTextInputValue("id"))) return i.editReply({ content: "🛑 <@" + i.fields.getTextInputValue("id") + "> **už je v DB.**", ephemeral: true });

            const today = new Date();

            const worker = {
                "badge": parseInt(i.fields.getTextInputValue("badge")),
                "name": i.fields.getTextInputValue("name"),
                "radio": i.fields.getTextInputValue("call"),
                "rank": i.fields.getTextInputValue("rank"),
                "folder": null,
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

            fs.writeFileSync(
                (path.resolve("./db/workers") + "/" + i.fields.getTextInputValue("id") + ".json"),
                JSON.stringify(worker, null, 4)
            );

            const loginEmbed = new EmbedBuilder()
                .setTitle("Úspěch")
                .setDescription(`<@${i.fields.getTextInputValue("id")}> přidán(a) do datbáze!`)
                .setColor(bot.SAHP.c.master)
                .setFooter({ text: "SAHP", iconURL: bot.user.avatarURL() });

            console.log(" < [DB/Login] >  " + i.member.displayName + " zaregistroval(a) [" + i.fields.getTextInputValue("call") + "] " + i.fields.getTextInputValue("name") + " do DB");

            await i.editReply({ embeds: [loginEmbed], ephemeral: true });
        } else if (i.customId === "rankUpModal") {
            await i.deferReply({ ephemeral: true });

            if (!(await checkDB(i.fields.getTextInputValue("id")))) return i.editReply({ content: "🛑 <@" + i.fields.getTextInputValue("id") + "> **není v DB.**", ephemeral: true });

            let content = JSON.parse(fs.readFileSync((path.resolve("./db/workers") + "/" + i.fields.getTextInputValue("id") + ".json"), "utf-8"));
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

            fs.writeFileSync(
                (path.resolve("./db/workers") + "/" + i.fields.getTextInputValue("id") + ".json"),
                JSON.stringify(content, null, 4)
            );

            const rankupEmbed = new EmbedBuilder()
                .setTitle("Úspěch")
                .setDescription(`<@${i.fields.getTextInputValue("id")}> byl(a) povýšen(a)!`)
                .setColor(bot.SAHP.c.master)
                .setFooter({ text: "SAHP", iconURL: bot.user.avatarURL() });

            await i.editReply({ embeds: [rankupEmbed], ephemeral: true });

            if (content.folder) {
                try {
                    const folder = await i.guild.channels.fetch(content.folder);
                    const rankup2Embed = new EmbedBuilder()
                        .setTitle("Povýšení!")
                        .setDescription(`Gratuluji, <@${i.fields.getTextInputValue("id")}> byl(a) jsi úspěšně povýšen(a).\nZkontroluj si své nové údaje:`)
                        .addFields([
                            {
                                name: `Aktuální údaje`, inline: false,
                                value:
                                    `> **Hodnost:** \`${i.fields.getTextInputValue("rank")}\`\n`
                                    + `> **Volačka:** \`${i.fields.getTextInputValue("call")}\`\n`
                                    + `> **Č. Odznaku:** \`${i.fields.getTextInputValue("badge")}\``
                            }
                        ])
                        .setColor(bot.SAHP.c.master)
                        .setFooter({ text: "SAHP", iconURL: bot.user.avatarURL() });
                    await folder.send({ content: `<@${i.fields.getTextInputValue("id")}>`, embeds: [rankup2Embed] });
                } catch (e) {
                    console.error(e);
                }
            }
        } else if (i.customId === "dutyOWModal") {
            await i.deferReply({ ephemeral: true });

            if (!(await checkDB(i.message.interaction.user.id))) return i.editReply({ content: "🛑 <@" + user.id + "> **už není v DB.**", ephemeral: true });

            let content = JSON.parse(fs.readFileSync((path.resolve("./db/workers") + "/" + i.message.interaction.user.id + ".json"), "utf-8"));
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
                        + `> **Do:** \`${i.fields.getTextInputValue("end")}\`\n`
                        + `> **Podpis:** ${i.fields.getTextInputValue("signature")}`,
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
                        + `> **Do:** \`${i.fields.getTextInputValue("end")}\`\n`
                        + `> **Podpis:** ${i.fields.getTextInputValue("signature")}`,
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
                            + `> **Hodin:**  \`${hoursAfter}\`\n`
                            + `> **Podpis:** ${i.fields.getTextInputValue("signature")}`
                    }
                ])
                .setThumbnail("https://i.imgur.com/dsZyqaJ.png")
                .setColor(bot.SAHP.c.duty)
                .setFooter({ text: "SAHP", iconURL: bot.user.avatarURL() });

            try {
                await i.message.edit({ embeds: [dutyEmbed], components: [row] });
            } catch (e) {
                console.error(e);
                return await i.editReply({ content: "> 🛑 **Chyba! Zpráva nešla upravit.**```" + e + "```" });
            }

            content.duties[index] = {
                "removed": false,
                "date": i.fields.getTextInputValue("datum"),
                "start": i.fields.getTextInputValue("start"),
                "end": i.fields.getTextInputValue("end"),
                "hours": hoursAfter
            };

            content.hours = parseFloat(content.hours) - parseFloat(hoursBefore);
            content.hours = (Math.round((parseFloat(content.hours) + Number.EPSILON) * 100) / 100) + parseFloat(hoursAfter);

            fs.writeFileSync(
                (path.resolve("./db/workers") + "/" + i.message.interaction.user.id + ".json"),
                JSON.stringify(content, null, 4)
            );

            console.log(" < [DB/OW/Duty] >  " + i.member.displayName + ` přepsal(a) duty [${content.radio}] ${content.name} (${index}) z ${i.fields.getTextInputValue("datum")}`);

            i.editReply({ content: "✅ **Přepsáno!**", ephemeral: true });
        } else if (i.customId === "apologyOWModal") {
            await i.deferReply({ ephemeral: true });

            if (!(await checkDB(i.message.interaction.user.id))) return i.editReply({ content: "🛑 <@" + user.id + "> **už není v DB.**", ephemeral: true });

            let content = JSON.parse(fs.readFileSync((path.resolve("./db/workers") + "/" + i.message.interaction.user.id + ".json"), "utf-8"));
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
                (i.fields.getTextInputValue("start").split(" ").length - 1) !== 2
                || (i.fields.getTextInputValue("end").split(".").length - 1) !== 2
            ) {
                return await i.editReply({
                    content:
                        "### Nalezena chyba - datum!"
                        + "\n- Formát data je špatně. Napiš např. `24. 12. 2023` (tečky a mezery)"
                        + "\nZadal(a) jsi:\n"
                        + `> **Začátek:** \`${i.fields.getTextInputValue("start")}\`\n`
                        + `> **Konec:** \`${i.fields.getTextInputValue("end")}\`\n`
                        + `> **OOC Důvod:** \`${i.fields.getTextInputValue("ooc")}\`\n`
                        + `> **IC Důvod:** \`${i.fields.getTextInputValue("ic")}\`\n`
                        + `> **Podpis:** ${i.fields.getTextInputValue("signature")}`,
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
                            `> **Začátek:** \`${i.fields.getTextInputValue("start")}\`\n`
                            + `> **Konec:** \`${i.fields.getTextInputValue("end")}\`\n`
                            + `> **OOC Důvod:** \`${i.fields.getTextInputValue("ooc")}\`\n`
                            + `> **IC Důvod:** \`${i.fields.getTextInputValue("ic")}\`\n`
                            + `> **Podpis:** ${i.fields.getTextInputValue("signature")}`
                    }
                ])
                .setThumbnail("https://i.imgur.com/Ja58hkU.png")
                .setColor(bot.SAHP.c.apology)
                .setFooter({ text: "SAHP", iconURL: bot.user.avatarURL() });

            try {
                await i.message.edit({ embeds: [apologyEmbed], components: [row] });
            } catch (e) {
                console.error(e);
                return await i.editReply({ content: "> 🛑 **Chyba! Zpráva nešla upravit.**```" + e + "```" });
            }

            const today = new Date();
            if (content.apologies[index]) {
                content.apologies[index] = {
                    "removed": false,
                    "shared": content.apologies[index].shared ? content.apologies[index].shared : today.getDate() + ". " + (parseInt(today.getMonth()) + 1) + ". " + today.getFullYear(),
                    "start": i.fields.getTextInputValue("start"),
                    "end": i.fields.getTextInputValue("end"),
                    "ooc": i.fields.getTextInputValue("ooc"),
                    "ic": i.fields.getTextInputValue("ic")
                };
            } else {
                content.apologies.push({
                    "removed": false,
                    "shared": today.getDate() + ". " + (parseInt(today.getMonth()) + 1) + ". " + today.getFullYear(),
                    "start": i.fields.getTextInputValue("start"),
                    "end": i.fields.getTextInputValue("end"),
                    "ooc": i.fields.getTextInputValue("ooc"),
                    "ic": i.fields.getTextInputValue("ic")
                });
            }

            fs.writeFileSync(
                (path.resolve("./db/workers") + "/" + i.message.interaction.user.id + ".json"),
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
                .setColor(bot.SAHP.c.cpz)
                .setFooter({ text: "SAHP", iconURL: bot.user.avatarURL() });

            try {
                await i.message.edit({ embeds: [cpzEmbed], components: [row] });
            } catch (e) {
                console.error(e);
                return await i.editReply({ content: "> 🛑 **Chyba! Zpráva nešla upravit.**```" + e + "```" });
            }

            console.log(" < [OW/CPZ] >  " + i.member.displayName + ` přepsal(a) CPZ zápis ${i.fields.getTextInputValue("name")} (${i.fields.getTextInputValue("birth")}) od ${i.fields.getTextInputValue("pd")}`);

            i.editReply({ content: "✅ **Přepsáno!**", ephemeral: true });
        } else if (i.customId === "fakturaModal") {
            if (!(await checkDB(i.user.id))) {
                const worker = JSON.parse(fs.readFileSync((path.resolve("./db/workers") + "/" + i.user.id + ".json"), "utf-8"));
                if (!worker) return i.reply({ content: "🛑 **Před zapsáním __faktury__ tě musí admin přilásit do DB.**\nZalož si vlastní složku v <#1139311793555116172> a počkej na správce DB.", ephemeral: true });
            }

            if (!(await checkEVENT(i.user.id))) {
                const worker = JSON.parse(fs.readFileSync((path.resolve("./db/workers") + "/" + i.user.id + ".json"), "utf-8"));
                const content = {
                    name: worker.name,
                    stats: {
                        value: 0,
                        invoices: 0
                    },
                    invoices: []
                };

                await fs.writeFileSync(
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
                .setImage(bot.SAHP.i.event[Math.floor(Math.random() * bot.SAHP.i.event.length)])
                .setColor(bot.SAHP.c.event)
                .setFooter({ text: "SAHP", iconURL: bot.user.avatarURL() });

            const today = new Date();
            user.invoices.push({
                "value": parseInt(i.fields.getTextInputValue("money").split(" ").join("")),
                "shared": today.getDate() + ". " + (parseInt(today.getMonth()) + 1) + ". " + today.getFullYear(),
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