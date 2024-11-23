import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, InteractionType, ModalBuilder, TextInputBuilder, TextInputStyle, time } from "discord.js";
import fs from "fs";
import path from "path";
import { checkDB, checkEVENT, getDB, getServer } from "../../functions/db.js";
import { dg } from "../../functions/logSystem.js";

export default async function run(bot, i) {
    if (!checkDB(i.user.id))
        return i.reply({ content: "> 🛑 **Před zapsáním __faktury__ tě musí admin přilásit do DB.**\nZalož si vlastní složku v <#1139311793555116172> a počkej na správce DB.", ephemeral: true });

    if (!checkEVENT(i.user.id)) {
        const worker = getDB(i.user.id).data;

        const content = {
            name: worker.name,
            stats: {
                value: 0,
                invoices: 0
            },
            invoices: []
        };

        fs.writeFileSync(
            (path.resolve("./db/event") + "/" + i.user.id + ".json"),
            JSON.stringify(content, null, 4)
        );
    }

    const user = JSON.parse(fs.readFileSync((path.resolve("./db/event") + "/" + i.user.id + ".json"), "utf-8"));

    const idFile = fs.readdirSync(path.resolve("./db/event")).filter(f => f.endsWith(".txt"))[0];
    const id = parseInt(idFile.split(".")[0]) + 1;

    const invoiceEmbed = new EmbedBuilder()
        .setAuthor({ name: i.member.displayName, iconURL: i.member.displayAvatarURL() })
        .setTitle("EVENT | Zápis faktury")
        .setDescription("Faktura byla zapsána do soutěže!")
        .addFields([
            {
                name: `Faktura #` + id.toString(), inline: false,
                value:
                    `> **Jméno:** \`${i.fields.getTextInputValue("name")}\`\n`
                    + `> **Důvod:** \`\`\`${i.fields.getTextInputValue("reason")}\`\`\`\n`
                    + `> **Částka:** \`${parseInt(i.fields.getTextInputValue("money").split(" ").join("")).toLocaleString()} $\``
                    + `\nPro žebříček použij </event žebříček:1287846346715431117>`
                    + `\nPro osobní souhrn </event souhrn:1287846346715431117>`
            }
        ])
        .setThumbnail("https://i.imgur.com/bGCFY6I.png")
        .setColor(bot.LEA.c.event)
        .setFooter(getServer(i.guild.id).footer);

    const today = new Date();

    const day = dg(today, "Date") + ". " + dg(today, "Month") + ". " + dg(today, "FullYear");
    const time = dg(today, "Hours") + ":" + dg(today, "Minutes") + ":" + dg(today, "Seconds");

    user.invoices.push({
        "value": parseInt(i.fields.getTextInputValue("money").split(" ").join("")),
        "shared": day + " " + time,
        "reason": i.fields.getTextInputValue("reason"),
        "name": i.fields.getTextInputValue("name"),
        "id": id
    });
    user.stats.value = user.stats.value + parseInt(i.fields.getTextInputValue("money").split(" ").join(""));
    user.stats.invoices = user.invoices.length;

    fs.writeFileSync(
        (path.resolve("./db/event") + "/" + i.user.id + ".json"),
        JSON.stringify(user, null, 4)
    );

    fs.renameSync(path.resolve("./db/event") + "/" + idFile, path.resolve("./db/event") + "/" + id.toString() + ".txt");

    console.log(" < [EVE/Faktura] >  " + i.member.displayName + " si zapsal fakturu s ID " + id);

    i.reply({ embeds: [invoiceEmbed], ephemeral: true });

    const ch = await i.guild.channels.fetch("1287863043883008010");
    const invoiceEmbedPublic = new EmbedBuilder()
        .setAuthor({ name: i.member.displayName, iconURL: i.member.displayAvatarURL() })
        .setTitle("Faktura #" + id.toString())
        .setDescription(
            `> **Jméno:** \`${i.fields.getTextInputValue("name")}\``
            + `\n> **Důvod:** \`\`\`${i.fields.getTextInputValue("reason")}\`\`\``
            + `\n> **Částka:** \`${parseInt(i.fields.getTextInputValue("money").split(" ").join("")).toLocaleString()} $\``
        )
        .setColor(bot.LEA.c.event)
        .setFooter(getServer(i.guild.id).footer);
    return ch.send({ embeds: [invoiceEmbedPublic] });
}