import { ActionRowBuilder, ApplicationCommandType, ButtonBuilder, ButtonStyle, ContextMenuCommandBuilder, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import fs from "fs";
import path from "path";
import { checkDB, getDB } from "../functions/db.js";
import { dcLog } from "../functions/logSystem.js";

export const context = new ContextMenuCommandBuilder()
    .setName('Smazat z DB')
    .setType(ApplicationCommandType.User)
    .setDMPermission(false);

export default async function run(bot, i) {
    const user = i.targetUser;

    let passed = false;
    await i.guild.fetch();
    const admin = await i.member;
    if (admin.id === "411436203330502658") passed = true; //PetyXbron / b1ngo
    if (bot.LEA.g.LSPD.includes(i.guild.id) && !passed) {
        if (admin.roles.cache.has("1154446249005690917")) passed = true; //Staff team Refresh
        if (admin.roles.cache.has("1201813866548580443")) passed = true; //.
        if (admin.roles.cache.has("1154446249005690916")) passed = true; //*
        if (admin.id === "846451292388851722") passed = true; //aldix_eu
        if (admin.id === "644571265725628437") passed = true; //griffin0s
    } else if (bot.LEA.g.LSSD.includes(i.guild.id) && !passed) {
        if (admin.roles.cache.has("1139267137651884072")) passed = true; //Leadership
        if (admin.roles.cache.has("1139295201282764882")) passed = true; //FTO Commander
    }

    if (!passed) return i.reply({ content: "> 🛑 **K tomuhle má přístup jen admin.**", ephemeral: true });

    if (!(await checkDB(user.id))) return i.reply({ content: "> 🛑 <@" + user.id + "> **už není v DB.**", ephemeral: true });

    let loc, worker;
    if (bot.LEA.g.LSPD.includes(i.guild.id)) loc = path.resolve("./db/LSPD") + "/" + user.id + ".json";
    else if (bot.LEA.g.LSSD.includes(i.guild.id)) loc = path.resolve("./db/LSSD") + "/" + user.id + ".json";
    else return i.reply({ content: "> 🛑 **Tenhle server není uveden a seznamu.**\nKontaktuj majitele (viz. </menu:1170376396678377596>).", ephemeral: true });

    const admins = [
        "411436203330502658"/*b1ngo*/, "607915400604286997"/*samus*/, "436180906533715969"/*micut*/,
        "846451292388851722"/*aldix_eu*/, "644571265725628437"/*griffin0s*/
    ];

    if (!fs.existsSync(loc)) {
        if (!admins.includes(admin.id)) return i.reply({ content: "> 🛑 **<@" + user.id + "> je v jiném sboru. Nemůžeš ho odebrat!**", ephemeral: true });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('confirmOtherSborDelete')
                    .setLabel('Opravdu smazat')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🛑'),
            );
        const rpl = await i.reply({ content: "> ⚠️ **<@" + user.id + "> je v DB jiného sboru. Opravdu chceš záznam odebrat?** *(30s na odpověď)*", ephemeral: true, components: [row] });

        const filter = i => i.customId === 'confirmOtherSborDelete' && i.user.id === admin.id;

        const collector = rpl.createMessageComponentCollector({
            filter, max: 1, time: 30000
        });

        collector.on('collect', async i => {
            if (bot.LEA.g.LSPD.includes(i.guild.id)) loc = path.resolve("./db/LSSD") + "/" + user.id + ".json", worker = JSON.parse(fs.readFileSync(loc, "utf-8"));
            else if (bot.LEA.g.LSSD.includes(i.guild.id)) loc = path.resolve("./db/LSPD") + "/" + user.id + ".json", worker = JSON.parse(fs.readFileSync(loc, "utf-8"));

            await rpl.edit({ content: `**Tenhle záznam (<@${user.id}>) byl vymazán z DB!**`, files: [loc], components: [] });

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

            fs.unlinkSync(loc);
            return console.log(" < [CMD/DB] >  " + i.member.displayName + ` smazal(a) DB záznam ${user.id}.json`);
        });

        collector.on('error', async () => {
            return await rpl.edit({ content: "> 🛑 **Čas vypršel. Záznam nebyl smazán.**", components: [] });
        });

        collector.on('end', async collected => {
            if (collected.size === 0) return await rpl.edit({ content: "> 🛑 **Čas vypršel. Záznam nebyl smazán.**", components: [] });
        });
    } else {
        worker = JSON.parse(fs.readFileSync(loc, "utf-8"));
        await i.reply({ content: `**Tenhle záznam (<@${user.id}>) byl vymazán z DB!**`, files: [loc], ephemeral: true });
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
        return fs.unlinkSync(loc);
    }
};