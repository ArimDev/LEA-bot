import { ActionRowBuilder, ApplicationCommandType, ButtonBuilder, ButtonStyle, ContextMenuCommandBuilder, EmbedBuilder } from "discord.js";
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

    const gotDB = getDB(user.id);
    if (!gotDB.exists) return i.reply({ content: "> 🛑 <@" + user.id + "> **už není v DB.**", ephemeral: true });
    const serverDB = getServer(i.guild.id);

    let loc, worker, guild;
    loc = path.resolve(`./db/${gotDB.guildName}`) + "/" + user.id + ".json";

    const admins = [
        "411436203330502658"/*b1ngo*/, "607915400604286997"/*samus*/, "801373399564681236"/*daviiid_.*/,
        "846451292388851722"/*aldix_eu*/, "343386988000444417"/*cenovka*/
    ];

    await i.deferReply({ ephemeral: true });

    let passedFromOther = true;
    if (serverDB.id !== gotDB.guild) {
        passedFromOther = false;

        if (!admins.includes(admin.id))
            return i.editReply({ content: "> 🛑 **<@" + user.id + "> je v jiném sboru. Nemůžeš ho odebrat!**", ephemeral: true });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('confirmOtherSborDelete')
                    .setLabel('Opravdu smazat')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🛑'),
            );

        const rpl = await i.editReply(
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
                    i.editReply({ content: "> 🛑 **Čas vypršel. Záznam nebyl smazán.**", components: [], ephememeral: true });
                    reject(new Error("Crashed"));
                });

                collector.on('end', (collected) => {
                    if (collected.size === 0) {
                        i.editReply({ content: "> 🛑 **Čas vypršel. Záznam nebyl smazán.**", components: [], ephememeral: true });
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

    let removedRoles, removedNickname, removedFolder;
    try {
        const folder = await guild.channels.fetch(worker.folder);
        await folder.delete();
        removedFolder = true;
    } catch { removedFolder = false; }
    if (member) try { await member.roles.remove(member.roles.cache); removedRoles = true; } catch { removedRoles = false; }
    if (member) try { await member.setNickname(null); removedNickname = true; } catch { removedNickname = false; }

    const deleteEmbed = new EmbedBuilder()
        .setTitle("Officer vyhozen!")
        .setDescription(
            `<@${user.id}> byl(a) odebrána(a) z databáze.`
            + "\n> **Databáze smazána:** ✅"
            + "\n> **Složka smazána:**  " + (removedFolder ? "✅" : "❌")
            + "\n> **Všechny role odebrány:** " + (removedRoles ? "✅" : "❌")
            + "\n> **Přezdívka resetována:** " + (removedNickname ? "✅" : "❌")
        )
        .setColor(getServer(guild.id).color)
        .setFooter(getServer(guild.id).footer);

    await i.editReply({ content: "", embeds: [deleteEmbed], files: [loc], components: [], ephemeral: true });

    if (!member) i.followUp({
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
                + `\n> **Odznak:** \`${worker.badge}\``,
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

    fs.unlinkSync(loc);

    return console.log(" < [CMD/DB] >  " + user.displayName + ` smazal(a) DB záznam ${user.id}.json`);
};