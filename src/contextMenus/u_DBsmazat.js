import { ActionRowBuilder, AttachmentBuilder, ApplicationCommandType, ButtonBuilder, ButtonStyle, ContextMenuCommandBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import fs from "fs";
import path from "path";
import { getDB, getServer } from "../functions/db.js";
import { dcLog, simpleLog } from "../functions/logSystem.js";

export const context = new ContextMenuCommandBuilder()
    .setName('DB Smazat')
    .setContexts([0])
    .setIntegrationTypes([0])
    .setType(ApplicationCommandType.User);

export default async function run(bot, i) {
    const user = i.targetUser;

    let passed = false;
    i.guild.fetch();
    const admin = i.member;
    if (admin.id === bot.LEA.o) passed = true; //PetyXbron / b1ngo
    if (bot.LEA.g.LSPD.includes(i.guild.id) && !passed) {
        if (admin.roles.cache.has("1301163398557339686")) passed = true; //Leadership
    } else if (bot.LEA.g.LSSD.includes(i.guild.id) && !passed) {
        if (admin.roles.cache.has("1391525298461347971")) passed = true; //Leadership
        if (admin.roles.cache.has("1391525331835420722")) passed = true; //FTO Commander
    } else if (bot.LEA.g.SAHP.includes(i.guild.id) && !passed) {
        if (admin.roles.cache.has("xxx" /* MISSING ID */)) passed = true; //Leadership
    } else if (bot.LEA.g.SAND.includes(i.guild.id) && !passed) {
        if (admin.roles.cache.has("1342063021991661572")) passed = true; //CO
    }

    if (!passed) return i.reply({ content: "> 🛑 **K tomuhle má přístup jen admin.**", ephemeral: true });

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
            await submit.deferReply({ ephemeral: true });

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

            const file = fs.readFileSync(loc);
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

            await submit.editReply({ content: "", embeds: [deleteEmbed], components: [], ephemeral: true });

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
        .catch(() => {});
};