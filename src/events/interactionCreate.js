import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, InteractionType, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import fs from "fs";
import path from "path";
import { checkDB } from "../../src/functions/db.js";

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
            if (!passed) {
                return i.reply({ content: "🛑 **Nemůžeš přepisovat cizí záznamy!**", ephemeral: true });
            }

            let type;
            if (i.message.embeds[0] && i.message.embeds[0].title === "Záznam služby") type = 0;
            if (i.message.embeds[0] && i.message.embeds[0].title === "Omluvenka") type = 1;
            if (i.message.embeds[0] && i.message.embeds[0].fields[0].name === "CPZ záznam") type = 2;

            if (type === 0) {
                const modal = new ModalBuilder()
                    .setCustomId('dutyOWModal')
                    .setTitle('SAHP | Přepis služby');

                const dateInput = new TextInputBuilder()
                    .setCustomId('datum')
                    .setLabel("Datum služby [31. 12. 2023]")
                    .setStyle(TextInputStyle.Short);

                const startInput = new TextInputBuilder()
                    .setCustomId('start')
                    .setLabel("Začátek služby [13:00]")
                    .setStyle(TextInputStyle.Short);

                const endInput = new TextInputBuilder()
                    .setCustomId('end')
                    .setLabel("Konec služby [17:00]")
                    .setStyle(TextInputStyle.Short);

                const signInput = new TextInputBuilder()
                    .setCustomId('signature')
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
                    .setCustomId('apologyOWModal')
                    .setTitle('SAHP | Přepis omluvenky');

                const startInput = new TextInputBuilder()
                    .setCustomId('start')
                    .setLabel("Od kdy [31. 12. 2023]")
                    .setStyle(TextInputStyle.Short);

                const endInput = new TextInputBuilder()
                    .setCustomId('end')
                    .setLabel("Do kdy [5. 1. 2024]")
                    .setStyle(TextInputStyle.Short);

                const oocInput = new TextInputBuilder()
                    .setCustomId('ooc')
                    .setLabel("OOC důvod [Rodinná akce]")
                    .setStyle(TextInputStyle.Paragraph);

                const icInput = new TextInputBuilder()
                    .setCustomId('ic')
                    .setLabel("IC důvod [Zlomená ruka]")
                    .setStyle(TextInputStyle.Paragraph);

                const signInput = new TextInputBuilder()
                    .setCustomId('signature')
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
                    .setCustomId('cpzOWModal')
                    .setTitle('SAHP | Přepis CPZ');

                const nameInput = new TextInputBuilder()
                    .setCustomId('name')
                    .setLabel("Jméno občana [Will Smith]")
                    .setStyle(TextInputStyle.Short);

                const birthInput = new TextInputBuilder()
                    .setCustomId('birth')
                    .setLabel("Narození občana [12/31/1990]")
                    .setStyle(TextInputStyle.Short);

                const reasonInput = new TextInputBuilder()
                    .setCustomId('reason')
                    .setLabel("Důvod zadržení [Nelegální akce]")
                    .setStyle(TextInputStyle.Paragraph);

                const moneyInput = new TextInputBuilder()
                    .setCustomId('money')
                    .setLabel("Výpis trestu / pokut")
                    .setStyle(TextInputStyle.Paragraph);

                const pdInput = new TextInputBuilder()
                    .setCustomId('pd')
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
            log.duties.forEach(function (e) {
                const mo = parseInt(e.date.split(". ")[1]);
                const tMo = new Date().getMonth() + 1;
                if (mo === tMo) moHours = moHours + e.hours;
            });

            const summEmbed = new EmbedBuilder()
                .setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() })
                .setTitle("Souhrn zaměstnance")
                .addFields([
                    {
                        name: `Duties`, inline: false,
                        value:
                            `> **Počet vykonanných služeb:** \`${log.duties.length}\`\n`
                            + `> **Hodin celkem:** \`${log.hours}\`\n`
                            + `> **Hodin od povýšení:** \`${log.hours - log.rankups.slice(-1)[0].hours}\`\n`
                            + `> **Hodin za tento měsíc:** \`${await moHours}\``
                    }
                ])
                .setThumbnail("https://i.imgur.com/wDab7i4.png")
                .setColor(bot.SAHP.c.summary)
                .setFooter({ text: "SAHP", iconURL: bot.user.avatarURL() });

            await i.editReply({ embeds: [summEmbed], ephemeral: true });;
        }
    }

    if (i.type === InteractionType.ModalSubmit) {
        if (i.customId === "dutyModal") {
            await i.deferReply();

            let content = JSON.parse(fs.readFileSync((path.resolve("./db/workers") + "/" + i.user.id + ".json"), "utf-8"));
            const index = content.duties.length + 1;

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('edit')
                        .setLabel('Přepsat')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji("📝"),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('summary')
                        .setLabel('Souhrn')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji("👀"),
                );

            let hours,
                h1 = parseInt(i.fields.getTextInputValue('start').slice(0, 2)),
                h2 = parseInt(i.fields.getTextInputValue('end').slice(0, 2)),
                m1 = parseInt(i.fields.getTextInputValue('start').slice(3, 5)),
                m2 = parseInt(i.fields.getTextInputValue('end').slice(3, 5)),
                min1 = h1 * 60 + m1,
                min2 = h2 * 60 + m2;
            hours = (min2 - min1) / 60;
            if (hours < 0) hours = hours + 24;

            const dutyEmbed = new EmbedBuilder()
                .setAuthor({ name: i.member.displayName, iconURL: i.member.displayAvatarURL() })
                .setTitle("Záznam služby")
                .addFields([
                    {
                        name: `Duty #` + index, inline: false,
                        value:
                            `> **Datum:** \`${i.fields.getTextInputValue('datum')}\`\n`
                            + `> **Od:** \`${i.fields.getTextInputValue('start')}\`\n`
                            + `> **Do:** \`${i.fields.getTextInputValue('end')}\`\n`
                            + `> **Hodin:**  \`${hours}\`\n`
                            + `> **Podpis:** ${i.fields.getTextInputValue('signature')}`
                    }
                ])
                .setThumbnail("https://i.imgur.com/dsZyqaJ.png")
                .setColor(bot.SAHP.c.duty)
                .setFooter({ text: "SAHP", iconURL: bot.user.avatarURL() });

            await i.editReply({ embeds: [dutyEmbed], components: [row] });

            content.duties.push({
                "date": i.fields.getTextInputValue('datum'),
                "start": i.fields.getTextInputValue('start'),
                "end": i.fields.getTextInputValue('end'),
                "hours": hours
            });
            content.hours = content.hours + hours;
            content.folder = i.channelId;

            fs.writeFileSync(
                (path.resolve("./db/workers") + "/" + i.user.id + ".json"),
                JSON.stringify(content, null, 4)
            );
        } else if (i.customId === "apologyModal") {
            await i.deferReply();

            let content = JSON.parse(fs.readFileSync((path.resolve("./db/workers") + "/" + i.user.id + ".json"), "utf-8"));
            const index = content.apologies.length + 1;

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('edit')
                        .setLabel('Přepsat')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji("📝"),
                );

            const dutyEmbed = new EmbedBuilder()
                .setAuthor({ name: i.member.displayName, iconURL: i.member.displayAvatarURL() })
                .setTitle("Omluvenka")
                .addFields([
                    {
                        name: `Omluvenka #` + index, inline: false,
                        value:
                            `> **Začátek:** \`${i.fields.getTextInputValue('start')}\`\n`
                            + `> **Konec:** \`${i.fields.getTextInputValue('end')}\`\n`
                            + `> **OOC Důvod:** \`${i.fields.getTextInputValue('ooc')}\`\n`
                            + `> **IC Důvod:** \`${i.fields.getTextInputValue('ic')}\`\n`
                            + `> **Podpis:** ${i.fields.getTextInputValue('signature')}`
                    }
                ])
                .setThumbnail("https://i.imgur.com/Ja58hkU.png")
                .setColor(bot.SAHP.c.apology)
                .setFooter({ text: "SAHP", iconURL: bot.user.avatarURL() });

            await i.editReply({ embeds: [dutyEmbed], components: [row] });

            const today = new Date();
            content.apologies.push({
                "shared": today.getDate() + ". " + (parseInt(today.getMonth()) + 1) + ". " + today.getFullYear(),
                "start": i.fields.getTextInputValue('start'),
                "end": i.fields.getTextInputValue('end'),
                "ooc": i.fields.getTextInputValue('ooc'),
                "ic": i.fields.getTextInputValue('ic')
            });
            content.folder = i.channelId;

            fs.writeFileSync(
                (path.resolve("./db/workers") + "/" + i.user.id + ".json"),
                JSON.stringify(content, null, 4)
            );
        } else if (i.customId === "cpzModal") {
            await i.deferReply();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('edit')
                        .setLabel('Přepsat')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji("📝"),
                );

            const cpzEmbed = new EmbedBuilder()
                .setAuthor({ name: i.member.displayName, iconURL: i.member.displayAvatarURL() })
                .setTitle(i.fields.getTextInputValue('name'))
                .addFields([
                    {
                        name: "CPZ záznam", inline: false,
                        value:
                            `**Jméno:** \`${i.fields.getTextInputValue('name')}\`\n`
                            + `**Narozen(a):** \`${i.fields.getTextInputValue('birth')}\`\n`
                            + `**Důvod:** \`\`\`${i.fields.getTextInputValue('reason')}\`\`\`\n`
                            + `**Tresty:** \`${i.fields.getTextInputValue('money')}\`\n`
                            + `**Řešili:** \`${i.fields.getTextInputValue('pd')}\``
                    }
                ])
                .setThumbnail("https://i.imgur.com/31WU5cn.png")
                .setColor(bot.SAHP.c.cpz)
                .setFooter({ text: "SAHP", iconURL: bot.user.avatarURL() });

            await i.editReply({ embeds: [cpzEmbed], components: [row] });
        } else if (i.customId === "loginModal") {
            await i.deferReply({ ephemeral: true });

            if (await checkDB(i.fields.getTextInputValue('id'))) return i.editReply({ content: "🛑 <@" + i.fields.getTextInputValue('id') + "> **už je v DB.**", ephemeral: true });

            const today = new Date();

            const worker = {
                "badge": parseInt(i.fields.getTextInputValue('badge')),
                "name": i.fields.getTextInputValue('name'),
                "radio": i.fields.getTextInputValue('call'),
                "rank": i.fields.getTextInputValue('rank'),
                "folder": null,
                "hours": 0,
                "duties": [],
                "apologies": [],
                "rankups": [
                    {
                        "date": today.getDate() + ". " + (parseInt(today.getMonth()) + 1) + ". " + today.getFullYear(),
                        "to": i.fields.getTextInputValue('rank'),
                        "from": null,
                        "boss": i.member.displayName,
                        "reason": "Přidání do DB",
                        "hours": 0
                    }
                ]
            };

            fs.writeFileSync(
                (path.resolve("./db/workers") + "/" + i.fields.getTextInputValue('id') + ".json"),
                JSON.stringify(worker, null, 4)
            );

            const loginEmbed = new EmbedBuilder()
                .setTitle("Úspěch")
                .setDescription(`<@${i.fields.getTextInputValue('id')}> přidán(a) do datbáze!`)
                .setColor(bot.SAHP.c.master)
                .setFooter({ text: "SAHP", iconURL: bot.user.avatarURL() });

            await i.editReply({ embeds: [loginEmbed], ephemeral: true });
        } else if (i.customId === "rankUpModal") {
            await i.deferReply({ ephemeral: true });

            if (!(await checkDB(i.fields.getTextInputValue('id')))) return i.editReply({ content: "🛑 <@" + i.fields.getTextInputValue('id') + "> **není v DB.**", ephemeral: true });

            let content = JSON.parse(fs.readFileSync((path.resolve("./db/workers") + "/" + i.fields.getTextInputValue('id') + ".json"), "utf-8"));
            const today = new Date();

            const rankup = {
                "date": today.getDate() + ". " + (parseInt(today.getMonth()) + 1) + ". " + today.getFullYear(),
                "to": i.fields.getTextInputValue('rank'),
                "from": content.rank,
                "boss": i.member.displayName,
                "reason": i.fields.getTextInputValue('reason'),
                "hours": content.hours
            };
            content.rankups.push(rankup);
            content.badge = parseInt(i.fields.getTextInputValue('badge'));
            content.radio = i.fields.getTextInputValue('call');
            content.rank = i.fields.getTextInputValue('rank');

            fs.writeFileSync(
                (path.resolve("./db/workers") + "/" + i.fields.getTextInputValue('id') + ".json"),
                JSON.stringify(content, null, 4)
            );

            const loginEmbed = new EmbedBuilder()
                .setTitle("Úspěch")
                .setDescription(`<@${i.fields.getTextInputValue('id')}> byl(a) povýšen(a)!`)
                .setColor(bot.SAHP.c.master)
                .setFooter({ text: "SAHP", iconURL: bot.user.avatarURL() });

            await i.editReply({ embeds: [loginEmbed], ephemeral: true });
        } else if (i.customId === "dutyOWModal") {
            await i.deferReply({ ephemeral: true });

            if (!(await checkDB(i.message.interaction.user.id))) return i.editReply({ content: "🛑 <@" + user.id + "> **už není v DB.**", ephemeral: true });

            let content = JSON.parse(fs.readFileSync((path.resolve("./db/workers") + "/" + i.message.interaction.user.id + ".json"), "utf-8"));
            const index = parseInt(i.message.embeds[0].fields[0].name.slice(-1)) - 1;
            const member = await i.guild.members.fetch(i.message.interaction.user.id);

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('edit')
                        .setLabel('Přepsat')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji("📝"),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('summary')
                        .setLabel('Souhrn')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji("👀"),
                );

            const hoursBefore = parseInt(i.message.embeds[0].fields[0].value.split("`")[7]);
            let hoursAfter,
                h1 = parseInt(i.fields.getTextInputValue('start').slice(0, 2)),
                h2 = parseInt(i.fields.getTextInputValue('end').slice(0, 2)),
                m1 = parseInt(i.fields.getTextInputValue('start').slice(3, 5)),
                m2 = parseInt(i.fields.getTextInputValue('end').slice(3, 5)),
                min1 = h1 * 60 + m1,
                min2 = h2 * 60 + m2;
            hoursAfter = (min2 - min1) / 60;
            if (hoursAfter < 0) hoursAfter = hoursAfter + 24;


            const dutyEmbed = new EmbedBuilder()
                .setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() })
                .setTitle("Záznam služby")
                .addFields([
                    {
                        name: `Duty #` + (index + 1), inline: false,
                        value:
                            `> **Datum:** \`${i.fields.getTextInputValue('datum')}\`\n`
                            + `> **Od:** \`${i.fields.getTextInputValue('start')}\`\n`
                            + `> **Do:** \`${i.fields.getTextInputValue('end')}\`\n`
                            + `> **Hodin:**  \`${hoursAfter}\`\n`
                            + `> **Podpis:** ${i.fields.getTextInputValue('signature')}`
                    }
                ])
                .setThumbnail("https://i.imgur.com/dsZyqaJ.png")
                .setColor(bot.SAHP.c.duty)
                .setFooter({ text: "SAHP", iconURL: bot.user.avatarURL() });

            try {
                await i.message.edit({ embeds: [dutyEmbed], components: [row] });
            } catch (e) {
                return await i.editReply({ content: "> 🛑 **Chyba! Zpráva nešla upravit.**```" + e + "```" });
            }

            content.duties[index] = {
                "date": i.fields.getTextInputValue('datum'),
                "start": i.fields.getTextInputValue('start'),
                "end": i.fields.getTextInputValue('end'),
                "hours": hoursAfter
            };

            content.hours = parseInt(content.hours) - parseInt(hoursBefore);
            content.hours = parseInt(content.hours) + parseInt(hoursAfter);

            fs.writeFileSync(
                (path.resolve("./db/workers") + "/" + i.message.interaction.user.id + ".json"),
                JSON.stringify(content, null, 4)
            );

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
                        .setCustomId('edit')
                        .setLabel('Přepsat')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji("📝"),
                );

            const apologyEmbed = new EmbedBuilder()
                .setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() })
                .setTitle("Omluvenka")
                .addFields([
                    {
                        name: `Omluvenka #` + (index + 1), inline: false,
                        value:
                            `> **Začátek:** \`${i.fields.getTextInputValue('start')}\`\n`
                            + `> **Konec:** \`${i.fields.getTextInputValue('end')}\`\n`
                            + `> **OOC Důvod:** \`${i.fields.getTextInputValue('ooc')}\`\n`
                            + `> **IC Důvod:** \`${i.fields.getTextInputValue('ic')}\`\n`
                            + `> **Podpis:** ${i.fields.getTextInputValue('signature')}`
                    }
                ])
                .setThumbnail("https://i.imgur.com/Ja58hkU.png")
                .setColor(bot.SAHP.c.apology)
                .setFooter({ text: "SAHP", iconURL: bot.user.avatarURL() });

            try {
                await i.message.edit({ embeds: [apologyEmbed], components: [row] });
            } catch (e) {
                return await i.editReply({ content: "> 🛑 **Chyba! Zpráva nešla upravit.**```" + e + "```" });
            }

            const today = new Date();
            if (content.apologies[index]) {
                content.apologies[index] = {
                    "shared": content.apologies[index].shared ? content.apologies[index].shared : today.getDate() + ". " + (parseInt(today.getMonth()) + 1) + ". " + today.getFullYear(),
                    "start": i.fields.getTextInputValue('start'),
                    "end": i.fields.getTextInputValue('end'),
                    "ooc": i.fields.getTextInputValue('ooc'),
                    "ic": i.fields.getTextInputValue('ic')
                };
            } else {
                content.apologies.push({
                    "shared": today.getDate() + ". " + (parseInt(today.getMonth()) + 1) + ". " + today.getFullYear(),
                    "start": i.fields.getTextInputValue('start'),
                    "end": i.fields.getTextInputValue('end'),
                    "ooc": i.fields.getTextInputValue('ooc'),
                    "ic": i.fields.getTextInputValue('ic')
                });
            }

            fs.writeFileSync(
                (path.resolve("./db/workers") + "/" + i.message.interaction.user.id + ".json"),
                JSON.stringify(content, null, 4)
            );

            i.editReply({ content: "✅ **Přepsáno!**", ephemeral: true });
        } else if (i.customId === "cpzOWModal") {
            await i.deferReply({ ephemeral: true });

            const member = await i.guild.members.fetch(i.message.interaction.user.id);

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('edit')
                        .setLabel('Přepsat')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji("📝"),
                );

            const cpzEmbed = new EmbedBuilder()
                .setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() })
                .setTitle(i.fields.getTextInputValue('name'))
                .addFields([
                    {
                        name: "CPZ záznam", inline: false,
                        value:
                            `**Jméno:** \`${i.fields.getTextInputValue('name')}\`\n`
                            + `**Narozen(a):** \`${i.fields.getTextInputValue('birth')}\`\n`
                            + `**Důvod:** \`\`\`${i.fields.getTextInputValue('reason')}\`\`\`\n`
                            + `**Tresty:** \`${i.fields.getTextInputValue('money')}\`\n`
                            + `**Řešili:** \`${i.fields.getTextInputValue('pd')}\``
                    }
                ])
                .setThumbnail("https://i.imgur.com/31WU5cn.png")
                .setColor(bot.SAHP.c.cpz)
                .setFooter({ text: "SAHP", iconURL: bot.user.avatarURL() });

            try {
                await i.message.edit({ embeds: [cpzEmbed], components: [row] });
            } catch (e) {
                return await i.editReply({ content: "> 🛑 **Chyba! Zpráva nešla upravit.**```" + e + "```" });
            }

            i.editReply({ content: "✅ **Přepsáno!**", ephemeral: true });
        }
    }
}