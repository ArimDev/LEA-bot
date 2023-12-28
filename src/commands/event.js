import { SlashCommandBuilder } from "discord.js";
import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, InteractionType, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import fs from "fs";
import path from "path";
import { checkDB, checkEVENT, getServer } from "../../src/functions/db.js";

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
    .setDMPermission(false)
    .setNSFW(false);

export default async function run(bot, i) {
    return i.reply({ content: "> 🛑 **Aktuálně žádný event neprobíhá!**" });
    const sub = i.options._subcommand;
    const user = i.options.getUser("účastník");

    let passed = false;
    await i.guild.fetch();
    const admin = await i.member;
    if (admin.roles.cache.has("1145344761402765343")) passed = true; //Staff team Refresh
    if (admin.roles.cache.has("1139266408681844887")) passed = true; //.
    if (admin.id === "607915400604286997") passed = true; //Samus
    if (admin.id === "436180906533715969") passed = true; //Mičut
    if (admin.id === "411436203330502658") passed = true; //PetyXbron

    if (bot.LEA.g.LSSD.includes(i.guild.id)) return i.reply({
        content: "> 🛑 **Příkazy </event faktura:1176554266652069989>, </event souhrn:1176554266652069989> a </event žebříček:1176554266652069989> nejsou aktuálně dostupné pro " + i.guild.name + ".**",
        ephemeral: true
    });

    if (sub === "faktura") { //Faktura
        const modal = new ModalBuilder()
            .setCustomId("fakturaModal")
            .setTitle("SAHP EVENT | Zápis faktury");

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
        if (!(await checkEVENT(user.id, i))) return i.reply({ content: "> 🛑 **<@" + user.id + "> ještě nesoutěží.**", ephemeral: true });

        const eventer = JSON.parse(fs.readFileSync((path.resolve("./db/event") + "/" + user.id + ".json"), "utf-8"));
        const member = await i.guild.members.fetch(user.id);

        let invoices = [], values = [];
        for (const inv of eventer.invoices) {
            invoices.push(`ID: ${inv.id}\nDate: ${inv.shared}\nValue: ${inv.value} $`);
            values.push(inv.value);
        }

        const summaryEmbed = new EmbedBuilder()
            .setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() })
            .setTitle("EVENT | Souhrn " + eventer.name)
            .addFields([
                {
                    name: "Statistika", inline: false,
                    value:
                        `> **Dohromady faktur:** \`${eventer.invoices.length.toLocaleString()}\`\n`
                        + `> **Dohromady zadáno:** \`${eventer.stats.value.toLocaleString()} $\`\n`
                        + `> **Průměrně zadáno:** \`${Math.trunc(values.reduce((a, c) => a + c, 0) / values.length).toLocaleString()} $\``
                },
                {
                    name: "Faktury", inline: false,
                    value:
                        `Kvůli vysokému počtu dostupné v \`txt\` příloze.`
                }
            ])
            .setThumbnail("https://i.imgur.com/bGCFY6I.png")
            .setColor(bot.LEA.c.event)
            .setFooter(getServer(i).footer);
        const listAtt = new AttachmentBuilder(Buffer.from(invoices.join("\n\n")), { name: "faktury.txt" });

        console.log(" < [EVE/Souhrn] >  " + i.member.displayName + " zobrazil(a) souhrn " + member.displayName);

        return i.reply({ embeds: [summaryEmbed], files: [listAtt], ephemeral: true });
    } else if (sub === "žebříček") { //Žěbříček
        if (!passed) return i.reply({ content: "> 🛑 **Žebříček je už skrytý! To je napětí...**", ephemeral: true });

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
        users = users.slice(0, 10);

        users.forEach((user, i) => {
            users[i] = `> ### ${i + 1}. <@${user.id}>\n> **Faktur:** \`${user.invoices.toLocaleString()}\`\n> **Hodnota:** \`${user.value.toLocaleString()} $\``;
        });

        const firstEmbed = new EmbedBuilder()
            .setTitle("EVENT | Žebříček (Top 1-5)")
            .setDescription(users.slice(0, 5).join("\n\n"))
            .setThumbnail("https://i.imgur.com/bGCFY6I.png")
            .setColor(bot.LEA.c.event)
            .setFooter(getServer(i).footer);

        const secondEmbed = new EmbedBuilder()
            .setTitle("EVENT | Žebříček (Top 5-10)")
            .setDescription(users.slice(5, 10).join("\n\n"))
            .setThumbnail("https://i.imgur.com/bGCFY6I.png")
            .setColor(bot.LEA.c.event)
            .setFooter(getServer(i).footer);

        console.log(" < [EVE/Žěbříček] >  " + i.member.displayName + " zobrazil(a) žebříček");

        return i.reply({ embeds: [firstEmbed, secondEmbed], ephemeral: true });
    }
};