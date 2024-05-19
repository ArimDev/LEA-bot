import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import fs from "fs";
import path from "path";
import { checkDB, getDB } from "../../src/functions/db.js";
import { dcLog } from "../../src/functions/logSystem.js";

export const slash = new SlashCommandBuilder()
    .setName("db")
    .setDescription(`Úprava systému zaměstnanců`)
    .addStringOption(option =>
        option.setName("choice")
            .setDescription("Co chceš udělat?")
            .setRequired(true)
            .addChoices(
                { name: "Registrovat", value: "p" },
                { name: "Zkontrolovat", value: "z" },
                { name: "Povýšit", value: "r" },
                { name: "Upravit", value: "u" },
                { name: "Smazat", value: "s" }
            ))
    .addUserOption(option =>
        option.setName("user")
            .setDescription("Vyber člena")
            .setRequired(true))
    .setDMPermission(false)
    .setNSFW(false);

export default async function run(bot, i) {
    const choice = i.options.getString("choice");
    const user = i.options.getUser("user");

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

    if (choice === "p") {
        if (await checkDB(user.id)) {
            const gotDB = await getDB(user.id);
            return i.reply({ content: `> 🛑 <@${user.id}> **už je v DB. (Členem ${gotDB.guildName}.)**`, ephemeral: true });
        }
        const modal = new ModalBuilder()
            .setCustomId("loginModal")
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
            .setMinLength(4)
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

        await i.showModal(modal);
    } else if (choice === "z") {
        if (!(await checkDB(user.id))) return i.reply({ content: "> 🛑 <@" + user.id + "> **není v DB.**", ephemeral: true });

        let log, sbor;
        if (bot.LEA.g.LSPD.includes(i.guild.id)) log = path.resolve("./db/LSPD") + "/" + user.id + ".json", sbor = "LSPD";
        else if (bot.LEA.g.LSSD.includes(i.guild.id)) log = path.resolve("./db/LSSD") + "/" + user.id + ".json", sbor = "LSSD";
        else return i.reply({ content: "> 🛑 **Tenhle server není uveden a seznamu.**\nKontaktuj majitele (viz. </menu:1170376396678377596>).", ephemeral: true });

        if (!fs.existsSync(log)) {
            if (bot.LEA.g.LSPD.includes(i.guild.id)) log = path.resolve("./db/LSSD") + "/" + user.id + ".json", sbor = "LSSD";
            else if (bot.LEA.g.LSSD.includes(i.guild.id)) log = path.resolve("./db/LSPD") + "/" + user.id + ".json", sbor = "LSPD";
        }

        console.log(" < [CMD/DB] >  " + i.member.displayName + ` zobrazil(a) DB záznam ${user.id}.json`);

        i.reply({ content: `> ✅ **<@${user.id}>, členem \`${sbor}\`**`, files: [log], ephemeral: true });
    } else if (choice === "r") {
        if (!(await checkDB(user.id))) return i.reply({ content: "> 🛑 <@" + user.id + "> **už není v DB.**", ephemeral: true });

        const gotDB = await getDB(user.id);
        if (!bot.LEA.g[gotDB.guildName].includes(i.guild.id)) return i.reply({ content: `> 🛑 **<@${user.id}> je členem \`${gotDB.guildName}\`!** (Nemůžeš ho povýšit)`, ephemeral: true });

        const modal = new ModalBuilder()
            .setCustomId("rankUpModal")
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
            .setMinLength(4)
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

        await i.showModal(modal);
    } else if (choice === "u") {
        if (!(await checkDB(user.id))) return i.reply({ content: "> 🛑 <@" + user.id + "> **už není v DB.**", ephemeral: true });

        const gotDB = await getDB(user.id);
        const data = gotDB.data;
        if (!bot.LEA.g[gotDB.guildName].includes(i.guild.id)) return i.reply({ content: `> 🛑 **<@${user.id}> je členem \`${gotDB.guildName}\`!** (Nemůžeš ho upravit)`, ephemeral: true });

        const modal = new ModalBuilder()
            .setCustomId("editModal")
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
            .setMinLength(4)
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

        await i.showModal(modal);
    } else if (choice === "s") {
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
            if (bot.LEA.g.LSPD.includes(i.guild.id)) {
                const oldFolder = await i.guild.channels.fetch(worker.folder);
                await oldFolder.delete();
            }
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
    }
};