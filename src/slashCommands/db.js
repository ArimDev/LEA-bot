import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import fs from "fs";
import path from "path";
import { checkDB, getDB, getServer } from "../functions/db.js";
import { dcLog, simpleLog } from "../functions/logSystem.js";

export const slash = new SlashCommandBuilder()
    .setName("db")
    .setDescription(`Úprava systému zaměstnanců`)
    .addStringOption(option =>
        option.setName("choice")
            .setDescription("Co chceš udělat?")
            .setRequired(true)
            .addChoices(
                { name: "Registrovat", value: "p" },
                { name: "Povýšit", value: "r" },
                { name: "Upravit", value: "u" },
                { name: "Smazat", value: "s" }
            ))
    .addUserOption(option =>
        option.setName("user")
            .setDescription("Vyber člena")
            .setRequired(true))
    .addBooleanOption(option =>
        option.setName("visible")
            .setDescription("Má být odpověď na tuto interakci viditelná všem?")
            .setRequired(false))
    .setContexts([0])
    .setIntegrationTypes([0])
    .setNSFW(false);

export default async function run(bot, i) {
    const choice = i.options.getString("choice");
    const user = i.options.getUser("user");
    const visible = i.options.getBoolean("visible") || false;

    let passed = false;
    i.guild.fetch();
    const admin = i.member;
    if (admin.id === bot.LEA.o) passed = true; //PetyXbron / b1ngo
    if (bot.LEA.g.LSPD.includes(i.guild.id) && !passed) {
        if (admin.roles.cache.has("xxx" /* MISSING ID */)) passed = true; //Leadership
    } else if (bot.LEA.g.LSSD.includes(i.guild.id) && !passed) {
        if (admin.roles.cache.has("1267541873451339806")) passed = true; //Leadership
        if (admin.roles.cache.has("1251504025610747966")) passed = true; //FTO Commander
    } else if (bot.LEA.g.SAHP.includes(i.guild.id) && !passed) {
        if (admin.roles.cache.has("1301163398557339686")) passed = true; //Leadership
    }

    if (!passed) return i.reply({ content: "> 🛑 **K tomuhle má přístup jen admin.**", ephemeral: true });

    if (choice === "p") {
        const modal = new ModalBuilder()
            .setCustomId("loginModal_" + visible)
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

        modal.addComponents(actionRow0, actionRow1, actionRow2, actionRow3, actionRow4);

        i.showModal(modal);
    } else if (choice === "r") {
        if (!(checkDB(user.id))) return i.reply({ content: "> 🛑 <@" + user.id + "> **už není v DB.**", ephemeral: true });

        const gotDB = getDB(user.id);
        if (!bot.LEA.g[gotDB.guildName].includes(i.guild.id)) return i.reply({ content: `> 🛑 **<@${user.id}> je členem \`${gotDB.guildName}\`!** (Nemůžeš ho povýšit)`, ephemeral: true });

        const modal = new ModalBuilder()
            .setCustomId("rankupModal_" + visible)
            .setTitle("LEA | Povýšení");

        const idInput = new TextInputBuilder()
            .setCustomId("id")
            .setLabel("ID Discord člena")
            .setStyle(TextInputStyle.Short)
            .setValue(user.id.toString())
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
        const actionRow1 = new ActionRowBuilder().addComponents(callInput);
        const actionRow2 = new ActionRowBuilder().addComponents(badgeInput);
        const actionRow3 = new ActionRowBuilder().addComponents(rankInput);

        modal.addComponents(actionRow0, actionRow1, actionRow2, actionRow3);

        i.showModal(modal);
    } else if (choice === "u") {
        if (!(checkDB(user.id))) return i.reply({ content: "> 🛑 <@" + user.id + "> **už není v DB.**", ephemeral: true });
        const gotDB = getDB(user.id);
        const data = gotDB.data;
        const modal = new ModalBuilder()
            .setCustomId("editModal_" + visible)
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
            .setPlaceholder(data.badge === 0 ? "0000" : data.badge.toString())
            .setValue(data.badge === 0 ? "0000" : data.badge.toString())
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
    } else if (choice === "s") {
        const gotDB = getDB(user.id);
        if (!gotDB.exists) return i.reply({ content: "> 🛑 <@" + user.id + "> **už není v DB.**", ephemeral: true });
        const serverDB = getServer(i.guild.id);

        const modal = new ModalBuilder()
            .setCustomId("dbDeleteWithReason")
            .setTitle("LEA | Výpověď");

        const reasonInput = new TextInputBuilder()
            .setCustomId("duvod")
            .setLabel("Důvod propuštění")
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(1000)
            .setRequired(true);

        const actionRow0 = new ActionRowBuilder().addComponents(reasonInput);

        modal.addComponents(actionRow0);

        i.showModal(modal);

        await i.awaitModalSubmit({ filter: int => int.user.id === i.user.id, time: 600000 })
            .then(async (submit) => {
                await submit.deferReply({ ephemeral: !visible });

                const reason = submit.fields.getTextInputValue("duvod");

                let loc, worker, guild;
                loc = path.resolve(`./db/${gotDB.guildName}`) + "/" + user.id + ".json";

                const admins = bot.LEA.a;

                let passedFromOther = true;
                if (serverDB.id !== gotDB.guild) {
                    passedFromOther = false;

                    if (!admins.includes(admin.id))
                        return submit.editReply({ content: "> 🛑 **<@" + user.id + "> je v jiném sboru. Nemůžeš ho odebrat!**", ephemeral: true });

                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('confirmOtherSborDelete')
                                .setLabel('Opravdu smazat')
                                .setStyle(ButtonStyle.Danger)
                                .setEmoji('🛑'),
                        );

                    const rpl = await submit.editReply(
                        {
                            content: "> ⚠️ **<@" + user.id + "> je v DB jiného sboru. Opravdu chceš záznam odebrat?** *(30s na odpověď)*",
                            ephemeral: true, components: [row]
                        }
                    );

                    const filter = i => i.customId === 'confirmOtherSborDelete' && i.user.id === admin.id;

                    const collector = rpl.createMessageComponentCollector({
                        filter, max: 1, time: 30000
                    });

                    function collecting() {
                        return new Promise((resolve, reject) => {
                            collector.on('error', () => {
                                submit.editReply({ content: "> 🛑 **Čas vypršel. Záznam nebyl smazán.**", components: [], ephememeral: true });
                                reject(new Error("Crashed"));
                            });

                            collector.on('end', (collected) => {
                                if (collected.size === 0) {
                                    submit.editReply({ content: "> 🛑 **Čas vypršel. Záznam nebyl smazán.**", components: [], ephememeral: true });
                                    reject(new Error("Timed out"));
                                } else {
                                    resolve("Ended");
                                }
                            });

                            collector.on('collect', () => {
                                passedFromOther = true;
                                resolve("Collected");
                            });
                        });
                    }

                    await collecting();
                }

                if (!passedFromOther) return;

                worker = gotDB.data;
                guild = await bot.guilds.fetch(bot.LEA.g[gotDB.guildName][0]);

                let member;
                try {
                    member = await guild.members.fetch(user.id);
                } catch (err) {
                    member = undefined;
                }

                const userEmbed = new EmbedBuilder()
                    .setTitle("Byl(a) jste propuštěn(a)!")
                    .setDescription(
                        `**${admin.nickname || `<@${admin.id}>`}** vás odebral(a) z(e) **${getServer(guild.id).name}**.`
                        + `\n**Důvod výpovědi**:\`\`\`${reason}\`\`\``
                    )
                    .setColor(getServer(guild.id).color)
                    .setFooter(getServer(guild.id).footer)
                    .setTimestamp();

                let removedRoles, removedNickname, removedFolder, sentPM;
                try {
                    const folder = await guild.channels.fetch(worker.folder);
                    await folder.delete();
                    removedFolder = true;
                } catch { removedFolder = false; }
                if (member) {
                    try { await member.roles.remove(member.roles.cache); removedRoles = true; } catch { removedRoles = false; }
                    try { await member.setNickname(null); removedNickname = true; } catch { removedNickname = false; }
                    try { await member.send({ embeds: [userEmbed] }); sentPM = true; } catch { sentPM = false; }
                }

                fs.unlinkSync(loc);

                console.log(" < [CMD/DB] >  " + user.displayName + ` smazal(a) DB záznam ${user.id}.json`);

                const deleteEmbed = new EmbedBuilder()
                    .setTitle("Officer vyhozen!")
                    .setDescription(
                        `<@${user.id}> byl(a) odebrána(a) z databáze.`
                        + "\n> **Databáze smazána:** ✅"
                        + "\n> **Složka smazána:**  " + (removedFolder ? "✅" : "❌")
                        + "\n> **Všechny role odebrány:** " + (removedRoles ? "✅" : "❌")
                        + "\n> **Přezdívka resetována:** " + (removedNickname ? "✅" : "❌")
                        + "\n> **Zpráva odeslána:** " + (sentPM ? "✅" : "❌")
                    )
                    .setColor(getServer(guild.id).color)
                    .setFooter(getServer(guild.id).footer);

                await submit.editReply({ content: "", embeds: [deleteEmbed], files: [loc], components: [], ephemeral: !visible });

                if (!member) submit.followUp({
                    content: "*Role a přezdívka nebyly vymazány protože officer již není na tomhle serveru.*",
                    ephemeral: true
                });

                if (member && (!removedRoles || !removedNickname)) i.followUp({
                    content:
                        "*Role a/nebo přezdívka nebyly vymazány protože bot nemá práva.*"
                        + "\n-# *Pravděpodobně to je vysoce umístěný člen.*",
                    ephemeral: true
                });

                await dcLog(bot, guild.id, member || user,
                    {
                        title: "Smazání z DB",
                        description:
                            `**<@${admin.id}> smazal <@${user.id}> z DB.**`
                            + `\n> **Jméno:** \`${worker.name}\``
                            + `\n> **Volačka:** \`${worker.radio}\``
                            + `\n> **Odznak:** \`${worker.badge}\``
                            + `\n> **Důvod:**\`\`\`${reason}\`\`\``,
                        color: "#ff0000",
                        file: loc
                    }
                );

                await simpleLog(bot, guild.id,
                    {
                        author: { name: `[${worker.radio}] ${worker.name}`, iconURL: member ? member.displayAvatarURL() : `https://cdn.discordapp.com/embed/avatars/${Math.floor(Math.random() * 6)}.png` },
                        title: "Vyloučení",
                        color: "#ff0000",
                        footer: { text: i.member.displayName, iconURL: i.member.displayAvatarURL() }
                    }
                );

                return;
            })
            .catch(e => null);
    }
};