import { ActionRowBuilder, ApplicationCommandType, ButtonBuilder, ButtonStyle, ContextMenuCommandBuilder, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import fs from "fs";
import path from "path";
import { checkDB, getDB } from "../functions/db.js";
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

    if (!(checkDB(user.id))) return i.reply({ content: "> 🛑 <@" + user.id + "> **už není v DB.**", ephemeral: true });

    let loc, worker, workerGuildID;
    if (bot.LEA.g.LSPD.includes(i.guild.id)) loc = path.resolve("./db/LSPD") + "/" + user.id + ".json";
    else if (bot.LEA.g.LSSD.includes(i.guild.id)) loc = path.resolve("./db/LSSD") + "/" + user.id + ".json";
    else if (bot.LEA.g.SAHP.includes(i.guild.id)) loc = path.resolve("./db/SAHP") + "/" + user.id + ".json";
    else return i.reply({ content: "> 🛑 **Tenhle server není uveden a seznamu.**\nKontaktuj majitele (viz. </menu:1170376396678377596>).", ephemeral: true });

    const admins = [
        "411436203330502658"/*b1ngo*/, "607915400604286997"/*samus*/, "801373399564681236"/*daviiid_.*/,
        "846451292388851722"/*aldix_eu*/, "343386988000444417"/*cenovka*/
    ];

    await i.deferReply({ ephemeral: true });

    if (!fs.existsSync(loc)) {
        if (!admins.includes(admin.id)) return i.editReply({ content: "> 🛑 **<@" + user.id + "> je v jiném sboru. Nemůžeš ho odebrat!**", ephemeral: true });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('confirmOtherSborDelete')
                    .setLabel('Opravdu smazat')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🛑'),
            );
        const rpl = await i.editReply({ content: "> ⚠️ **<@" + user.id + "> je v DB jiného sboru. Opravdu chceš záznam odebrat?** *(30s na odpověď)*", ephemeral: true, components: [row] });

        const filter = i => i.customId === 'confirmOtherSborDelete' && i.user.id === admin.id;

        const collector = rpl.createMessageComponentCollector({
            filter, max: 1, time: 30000
        });

        collector.on('collect', async c => {
            if (bot.LEA.g.LSPD.includes(c.guild.id))
                loc = path.resolve("./db/LSSD") + "/" + user.id + ".json", worker = JSON.parse(fs.readFileSync(loc, "utf-8")),
                    workerGuildID = bot.LEA.g.LSPD[0];
            else if (bot.LEA.g.LSSD.includes(c.guild.id))
                loc = path.resolve("./db/LSPD") + "/" + user.id + ".json", worker = JSON.parse(fs.readFileSync(loc, "utf-8")),
                    workerGuildID = bot.LEA.g.LSSD[0];
            else if (bot.LEA.g.SAHP.includes(c.guild.id))
                loc = path.resolve("./db/SAHP") + "/" + user.id + ".json", worker = JSON.parse(fs.readFileSync(loc, "utf-8")),
                    workerGuildID = bot.LEA.g.SAHP[0];

            i.editReply({ content: `**Tenhle záznam (<@${user.id}>) byl vymazán z DB!**\n-# *Pozor, bot neodebral role!*`, files: [loc], components: [] });

            await dcLog(bot, workerGuildID, c.member,
                {
                    title: "Smazání z DB",
                    description:
                        `**<@${c.user.id}> smazal <@${user.id}> z DB.**`
                        + `\n> **Jméno:** \`${worker.name}\``
                        + `\n> **Volačka:** \`${worker.radio}\``
                        + `\n> **Odznak:** \`${worker.badge}\``,
                    color: "#ff0000",
                    file: loc
                }
            );

            fs.unlinkSync(loc);

            return console.log(" < [CMD/DB] >  " + c.member.displayName + ` smazal(a) DB záznam ${user.id}.json`);
        });

        collector.on('error', async () => {
            return i.editReply({ content: "> 🛑 **Čas vypršel. Záznam nebyl smazán.**", components: [] });
        });

        collector.on('end', async collected => {
            if (collected.size === 0) return i.editReply({ content: "> 🛑 **Čas vypršel. Záznam nebyl smazán.**", components: [] });
        });
    } else {
        worker = JSON.parse(fs.readFileSync(loc, "utf-8"));
        let member;
        try {
            member = await i.guild.members.fetch(user.id);
        } catch (err) {
            member = undefined;
        }

        if (bot.LEA.g.LSPD.includes(i.guild.id)) {
            try {
                const oldFolder = await i.guild.channels.fetch(worker.folder);
                await oldFolder.delete();
            } catch { }
        }

        await i.editReply({ content: `**Tenhle záznam (<@${user.id}>) byl vymazán z DB!**\n-# *Pozor, bot neodebral role!*`, files: [loc], ephemeral: true });

        console.log(" < [CMD/DB] >  " + i.member.displayName + ` smazal(a) DB záznam ${user.id}.json`);

        await dcLog(bot, i.guild.id, i.member,
            {
                title: "Smazání z DB",
                description:
                    `**<@${i.user.id}> smazal <@${user.id}> z DB.**`
                    + `\n> **Jméno:** \`${worker.name}\``
                    + `\n> **Volačka:** \`${worker.radio}\``
                    + `\n> **Odznak:** \`${worker.badge}\``,
                color: "#ff0000",
                file: loc
            }
        );

        await simpleLog(bot, i.guild.id,
            {
                author: { name: `[${worker.radio}] ${worker.name}`, iconURL: member ? member.displayAvatarURL() : `https://cdn.discordapp.com/embed/avatars/${Math.floor(Math.random() * 6)}.png` },
                title: "Vyloučení",
                color: "#ff0000",
                footer: { text: i.member.displayName, iconURL: i.member.displayAvatarURL() }
            }
        );

        return fs.unlinkSync(loc);
    }
};