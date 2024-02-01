import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import fs from "fs";
import path from "path";
import { checkDB, getDB } from "../../src/functions/db.js";

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
    if (bot.LEA.g.SAHP.includes(i.guild.id) && !passed) {
        if (admin.roles.cache.has("1145344761402765343")) passed = true; //Staff team Refresh
        if (admin.roles.cache.has("1139266408681844887")) passed = true; //.
        if (admin.id === "607915400604286997") passed = true; //Samus
        if (admin.id === "436180906533715969") passed = true; //Mičut
    } else if (bot.LEA.g.LSSD.includes(i.guild.id) && !passed) {
        if (admin.roles.cache.has("1167182546904293481")) passed = true; //Staff team Refresh
        if (admin.roles.cache.has("1167182546904293482")) passed = true; //*
        if (admin.roles.cache.has("1190825815596875829")) passed = true; //.
        if (admin.id === "798644986215661589") passed = true; //Smouky
        if (admin.id === "829978476701941781") passed = true; //Frexik
    }

    if (!passed) return i.reply({ content: "> 🛑 **K tomuhle má přístup jen admin.**", ephemeral: true });

    if (choice === "p") {
        if (await checkDB(user.id)) return i.reply({ content: "> 🛑 <@" + user.id + "> **už je v DB.**", ephemeral: true });
        const modal = new ModalBuilder()
            .setCustomId("loginModal")
            .setTitle("SAHP | Přihlášení");

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
        if (bot.LEA.g.SAHP.includes(i.guild.id)) log = path.resolve("./db/SAHP") + "/" + user.id + ".json", sbor = "SAHP";
        else if (bot.LEA.g.LSSD.includes(i.guild.id)) log = path.resolve("./db/LSSD") + "/" + user.id + ".json", sbor = "LSSD";
        else return i.reply({ content: "> 🛑 **Tenhle server není uveden a seznamu.**\nKontaktuj majitele (viz. </menu:1170376396678377596>).", ephemeral: true });

        if (!fs.existsSync(log)) {
            if (bot.LEA.g.SAHP.includes(i.guild.id)) log = path.resolve("./db/LSSD") + "/" + user.id + ".json", sbor = "LSSD";
            else if (bot.LEA.g.LSSD.includes(i.guild.id)) log = path.resolve("./db/SAHP") + "/" + user.id + ".json", sbor = "SAHP";
        }

        console.log(" < [CMD/DB] >  " + i.member.displayName + ` zobrazil(a) DB záznam ${user.id}.json`);

        i.reply({ content: `> ✅ **<@${user.id}>, členem \`${sbor}\`**`, files: [log], ephemeral: true });
    } else if (choice === "r") {
        if (!(await checkDB(user.id))) return i.reply({ content: "> 🛑 <@" + user.id + "> **už není v DB.**", ephemeral: true });

        const gotDB = await getDB(user.id);
        if (!bot.LEA.g[gotDB.guildName].includes(i.guild.id)) return i.reply({ content: `> 🛑 **<@${user.id}> je členem \`${gotDB.guildName}\`!** (Nemůžeš ho povýšit)`, ephemeral: true });

        const modal = new ModalBuilder()
            .setCustomId("rankUpModal")
            .setTitle("SAHP | Povýšení");

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

        const reasonInput = new TextInputBuilder()
            .setCustomId("reason")
            .setLabel("Důvod")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Úspěšná hodnocená patrola")
            .setRequired(true);

        const actionRow0 = new ActionRowBuilder().addComponents(idInput);
        const actionRow1 = new ActionRowBuilder().addComponents(callInput);
        const actionRow2 = new ActionRowBuilder().addComponents(badgeInput);
        const actionRow3 = new ActionRowBuilder().addComponents(rankInput);
        const actionRow4 = new ActionRowBuilder().addComponents(reasonInput);

        modal.addComponents(actionRow0, actionRow1, actionRow2, actionRow3, actionRow4);

        await i.showModal(modal);
    } else if (choice === "s") {
        if (!(await checkDB(user.id))) return i.reply({ content: "> 🛑 <@" + user.id + "> **už není v DB.**", ephemeral: true });

        let loc;
        if (bot.LEA.g.SAHP.includes(i.guild.id)) loc = path.resolve("./db/SAHP") + "/" + user.id + ".json";
        else if (bot.LEA.g.LSSD.includes(i.guild.id)) loc = path.resolve("./db/LSSD") + "/" + user.id + ".json";
        else return i.reply({ content: "> 🛑 **Tenhle server není uveden a seznamu.**\nKontaktuj majitele (viz. </menu:1170376396678377596>).", ephemeral: true });

        const admins = [
            "411436203330502658"/*b1ngo*/, "607915400604286997"/*samus*/, "436180906533715969",/*micut*/
            "829978476701941781"/*frexikk*/, "798644986215661589"/*smouky*/
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
                if (bot.LEA.g.SAHP.includes(i.guild.id)) loc = path.resolve("./db/LSSD") + "/" + user.id + ".json";
                else if (bot.LEA.g.LSSD.includes(i.guild.id)) loc = path.resolve("./db/SAHP") + "/" + user.id + ".json";

                fs.unlinkSync(loc);
                console.log(" < [CMD/DB] >  " + i.member.displayName + ` smazal(a) DB záznam ${user.id}.json`);

                return await rpl.edit({ content: `**Tenhle záznam (<@${user.id}>) byl vymazán z DB!**`, files: [loc], components: [] });
            });

            collector.on('error', async () => {

                return await rpl.edit({ content: "> 🛑 **Čas vypršel. Záznam nebyl smazán.**", components: [] });
            });

            collector.on('end', async collected => {
                if (collected.size === 0) return await rpl.edit({ content: "> 🛑 **Čas vypršel. Záznam nebyl smazán.**", components: [] });
            });
        } else {
            i.reply({ content: `**Tenhle záznam (<@${user.id}>) byl vymazán z DB!**`, files: [loc], ephemeral: true });
            console.log(" < [CMD/DB] >  " + i.member.displayName + ` smazal(a) DB záznam ${user.id}.json`);
            return fs.unlinkSync(loc);
        }
    }
};