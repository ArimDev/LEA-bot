import { SlashCommandBuilder } from "discord.js";
import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, InteractionType, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import fs from "fs";
import path from "path";
import { checkEVENT, getServer } from "../../src/functions/db.js";

export const slash = new SlashCommandBuilder()
    .setName("event")
    .setDescription(`Správa a informace o eventu`)
    .addSubcommand(subcommand =>
        subcommand
            .setName('faktura')
            .setDescription("Zápis faktury do eventu")
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('souhrn')
            .setDescription("Souhrn účastníka eventu")
            .addUserOption(option =>
                option.setName("účastník")
                    .setDescription("Vyber účastníka")
                    .setRequired(true))
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('žebříček')
            .setDescription("Žěbříček účastníků eventu")
    )
    .setContexts([0])
    .setIntegrationTypes([0])
    .setNSFW(false);

export default async function run(bot, i) {
    const sub = i.options._subcommand;
    const user = i.options.getUser("účastník");

    let passed = false;
    i.guild.fetch();
    const admin = i.member;
    if (admin.id === "411436203330502658") passed = true; //PetyXbron / b1ngo
    if (bot.LEA.g.LSSD.includes(i.guild.id) && !passed) {
        if (admin.roles.cache.has("1139267137651884072")) passed = true; //Leadership
    }

    if (!bot.LEA.g.LSSD.includes(i.guild.id)) return i.reply({
        content: "> 🛑 **Příkazy /event nejsou aktuálně dostupné pro " + i.guild.name + ".**",
        ephemeral: true
    });

    if (sub === "faktura") { //Faktura
        const modal = new ModalBuilder()
            .setCustomId("fakturaModal")
            .setTitle("EVENT | Zápis faktury");

        const nameInput = new TextInputBuilder()
            .setCustomId("name")
            .setLabel("Jméno občana")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Will Smith")
            .setRequired(true);

        const birthInput = new TextInputBuilder()
            .setCustomId("reason")
            .setLabel("Popis faktury")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Nelegální akce")
            .setRequired(true);

        const moneyInput = new TextInputBuilder()
            .setCustomId("money")
            .setLabel("Čáska faktury")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("15 000")
            .setMinLength(4)
            .setRequired(true);

        const actionRow0 = new ActionRowBuilder().addComponents(nameInput);
        const actionRow1 = new ActionRowBuilder().addComponents(birthInput);
        const actionRow2 = new ActionRowBuilder().addComponents(moneyInput);

        modal.addComponents(actionRow0, actionRow1, actionRow2);

        await i.showModal(modal);
    } else if (sub === "souhrn") { //Souhrn
        if (user.id !== i.user.id && !passed) return i.reply({ content: "> 🛑 **Můžeš zobrazit pouze svoje faktury.**", ephemeral: true });
        if (!(checkEVENT(user.id, i))) return i.reply({ content: "> 🛑 **<@" + user.id + "> ještě nesoutěží.**", ephemeral: true });

        const eventer = JSON.parse(fs.readFileSync((path.resolve("./db/event") + "/" + user.id + ".json"), "utf-8"));
        const member = await i.guild.members.fetch(user.id);

        let invoices = [], values = [], att = [];
        for (const inv of eventer.invoices) {
            invoices.push(`> **ID** \`${inv.id}\` (${inv.shared})\n> \`${inv.value} $\``);
            values.push(inv.value);
        }
        const invoicesString = invoices.join("\n\n");

        const summaryEmbed = new EmbedBuilder()
            .setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() })
            .setTitle("EVENT | Souhrn " + eventer.name)
            .addFields([
                {
                    name: "Statistika", inline: false,
                    value:
                        `> **Dohromady faktur:** \`${eventer.invoices.length.toLocaleString()}\`\n`
                        + `> **Dohromady zadáno:** \`${eventer.stats.value.toLocaleString()} $\`\n`
                        + `> **Průměr faktury:** \`${(Math.round(values.reduce((a, c) => a + c, 0) / values.length)).toLocaleString()} $\``
                }
            ])
            .setThumbnail("https://i.imgur.com/bGCFY6I.png")
            .setColor(bot.LEA.c.event)
            .setFooter(getServer(i).footer);

        if (invoicesString.length <= 1024) {
            summaryEmbed.addFields([
                {
                    name: "Faktury", inline: false,
                    value: invoices.join("\n\n")
                }
            ]);
        } else {
            const fileLines = [`${eventer.name} Faktury:`, ""];
            for (const inv of eventer.invoices) {
                fileLines.push(`#${inv.id} > ${inv.value.toLocaleString()} $ (${inv.shared})`);
            }
            att = [new AttachmentBuilder(Buffer.from(fileLines.join("\n")), { name: `LEA-Bot v${process.env.version}_faktury_${eventer.name}.txt` })];
        }

        i.reply({ embeds: [summaryEmbed], files: att, ephemeral: true });

        return console.log(" < [EVE/Souhrn] >  " + i.member.displayName + " zobrazil(a) souhrn " + member.displayName);
    } else if (sub === "žebříček") { //Žěbříček
        //if (!passed) return i.reply({ content: "> 🛑 **Žebříček je už skrytý! To je napětí...**", ephemeral: true });

        let users = [];
        const eventDB = fs.readdirSync(path.resolve("./db/event")).filter(file => file.endsWith(".json") && file !== "000000000000000001.json");
        for (const file of eventDB) {
            const eventer = JSON.parse(fs.readFileSync((path.resolve("./db/event") + "/" + file), "utf-8"));
            const user = {
                id: file.split(".")[0],
                name: eventer.name,
                invoices: eventer.invoices.length,
                value: eventer.stats.value
            };
            users.push(user);
        }
        users = users.sort((a, b) => b.value - a.value);
        users = users.slice(0, 5);

        users.forEach((user, i) => {
            users[i] = `> ### ${i + 1}. <@${user.id}>\n> **Faktur:** \`${user.invoices.toLocaleString()}\`\n> **Hodnota:** \`${user.value.toLocaleString()} $\``;
        });

        const topEmbed = new EmbedBuilder()
            .setTitle("EVENT | Žebříček (Top 5)")
            .setDescription(users.length ? users.join("\n\n") : "Nikdo ještě fakturu nezapsal!")
            .setThumbnail("https://i.imgur.com/bGCFY6I.png")
            .setColor(bot.LEA.c.event)
            .setFooter(getServer(i).footer);

        console.log(" < [EVE/Žěbříček] >  " + i.member.displayName + " zobrazil(a) žebříček");

        return i.reply({ embeds: [topEmbed], ephemeral: true });
    }
};