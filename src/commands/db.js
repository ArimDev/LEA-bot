import { ActionRowBuilder, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import fs from "fs";
import path from "path";
import { checkDB } from "../../src/functions/db.js";

export const slash = new SlashCommandBuilder()
    .setName('db')
    .setDescription(`Úprava systému zaměstnanců`)
    .addStringOption(option =>
        option.setName('choice')
            .setDescription('Co chceš udělat?')
            .setRequired(true)
            .addChoices(
                { name: 'Registrace', value: "p" },
                { name: 'Kontrola', value: "z" },
                { name: 'Povýšit', value: "r" },
                { name: 'Smazání', value: "s" }
            ))
    .addUserOption(option =>
        option.setName('user')
            .setDescription('Vyber člena')
            .setRequired(true))
    .setDMPermission(false)
    .setNSFW(false);

export default async function run(bot, i) {
    const choice = i.options.getString('choice');
    let user = i.options.getUser('user');

    let passed = false;
    await i.guild.fetch();
    const admin = await i.member;
    if (admin.roles.cache.has("1145344761402765343")) passed = true; //Staff team Refresh
    if (admin.roles.cache.has("1139266408681844887")) passed = true; //.
    if (admin.id === "607915400604286997") passed = true; //Samus
    if (admin.id === "436180906533715969") passed = true; //Mičut
    if (admin.id === "411436203330502658") passed = true; //PetyXbron
    if (!passed) return i.reply({ content: "🛑 **K tomuhle má přístup jen admin.**", ephemeral: true });

    if (choice === "p") {
        const modal = new ModalBuilder()
            .setCustomId('loginModal')
            .setTitle('SAHP | Přihlášení');

        const idInput = new TextInputBuilder()
            .setCustomId('id')
            .setLabel("ID Discord člena [411436203330502658]")
            .setStyle(TextInputStyle.Short);

        const nameInput = new TextInputBuilder()
            .setCustomId('name')
            .setLabel("Jméno [Will Smith]")
            .setStyle(TextInputStyle.Short);

        const callInput = new TextInputBuilder()
            .setCustomId('call')
            .setLabel("Volačka [Heaven-2]")
            .setStyle(TextInputStyle.Short);

        const badgeInput = new TextInputBuilder()
            .setCustomId('badge')
            .setLabel("Číslo odznaku [1033]")
            .setStyle(TextInputStyle.Short);

        const rankInput = new TextInputBuilder()
            .setCustomId('rank')
            .setLabel("Hodnost [Trooper II]")
            .setStyle(TextInputStyle.Short);

        const actionRow0 = new ActionRowBuilder().addComponents(idInput);
        const actionRow1 = new ActionRowBuilder().addComponents(nameInput);
        const actionRow2 = new ActionRowBuilder().addComponents(callInput);
        const actionRow3 = new ActionRowBuilder().addComponents(badgeInput);
        const actionRow4 = new ActionRowBuilder().addComponents(rankInput);

        modal.addComponents(actionRow0, actionRow1, actionRow2, actionRow3, actionRow4);

        await i.showModal(modal);
    } else if (choice === "z") {
        if (!(await checkDB(user.id))) return i.reply({ content: "🛑 <@" + user.id + "> **není v DB.**", ephemeral: true });
        let log = fs.readFileSync((path.resolve("./db/workers") + "/" + user.id + ".json"), "utf-8");
        i.reply({ content: `\`\`\`json\n${log}\`\`\``, ephemeral: true });
    } else if (choice === "r") {
        if (!(await checkDB(user.id))) return i.reply({ content: "🛑 <@" + user.id + "> **už není v DB.**", ephemeral: true });
        const modal = new ModalBuilder()
            .setCustomId('rankUpModal')
            .setTitle('SAHP | Povýšení');

        const idInput = new TextInputBuilder()
            .setCustomId('id')
            .setLabel("ID Discord člena [411436203330502658]")
            .setStyle(TextInputStyle.Short);

        const callInput = new TextInputBuilder()
            .setCustomId('call')
            .setLabel("Volačka [Heaven-2]")
            .setStyle(TextInputStyle.Short);

        const badgeInput = new TextInputBuilder()
            .setCustomId('badge')
            .setLabel("Číslo odznaku [1033]")
            .setStyle(TextInputStyle.Short);

        const rankInput = new TextInputBuilder()
            .setCustomId('rank')
            .setLabel("Hodnost [Trooper II]")
            .setStyle(TextInputStyle.Short);

        const reasonInput = new TextInputBuilder()
            .setCustomId('reason')
            .setLabel("Důvod [Úspěšná hodnocená patrola]")
            .setStyle(TextInputStyle.Paragraph);

        const actionRow0 = new ActionRowBuilder().addComponents(idInput);
        const actionRow1 = new ActionRowBuilder().addComponents(callInput);
        const actionRow2 = new ActionRowBuilder().addComponents(badgeInput);
        const actionRow3 = new ActionRowBuilder().addComponents(rankInput);
        const actionRow4 = new ActionRowBuilder().addComponents(reasonInput);

        modal.addComponents(actionRow0, actionRow1, actionRow2, actionRow3, actionRow4);

        await i.showModal(modal);
    } else if (choice === "s") {
        if (!(await checkDB(user.id))) return i.reply({ content: "🛑 <@" + user.id + "> **už není v DB.**", ephemeral: true });
        let loc = path.resolve("./db/workers") + "/" + user.id + ".json";
        let log = fs.readFileSync(loc, "utf-8");
        fs.unlinkSync(loc);
        i.reply({ content: `\`\`\`json\n${log}\`\`\`Tenhle záznam (<@${user.id}>) byl vymazán z DB!`, ephemeral: true });
    }
};