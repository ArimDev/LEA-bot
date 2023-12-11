import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { getServer } from "../../src/functions/db.js";

export default async function (bot, t) {
    if (t.parent.id !== "1139311793555116172") return;
    else if (t.joinable) await t.join();

    const owner = await t.guild.members.fetch(t.ownerId);
    const onderka = await t.guild.members.fetch("411436203330502658");
    console.log(` < [DC/Folder] >  ${owner.displayName} si založil(a) vlastní složku zaměstnance (#${t.id})`);

    try {

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Návod")
                    .setURL("https://discord.com/channels/1139266097921675345/1170795599164080228")
                    .setStyle(ButtonStyle.Link)
                    .setEmoji("📑"),
            );

        const slozkaEmbed = new EmbedBuilder()
            .setAuthor({ name: onderka.displayName, iconURL: onderka.displayAvatarURL() })
            .setTitle("Vítej ve své složce!")
            .setDescription(
                "Prosím zkontroluj si správnost složky dle [návodu](https://discord.com/channels/1139266097921675345/1170795599164080228/1170797004595666984)."
                + "\nBrzy tě zaregistruje do databáze správce. Budeš informován(a)."
                + "\nPoté si zapisuj služby a omluvenky pomocí </duty:1170376396678377595> a </omluvenka:1170382276492800131>."
            )
            .setColor(getServer(t).color)
            .setFooter(getServer(t).footer);
        await t.send({ content: `<@${t.ownerId}>, <@411436203330502658>, <@607915400604286997>`, embeds: [slozkaEmbed], components: [row] });
    } catch (e) {
        console.error(e);
    }

    try {
        let
            passed = true,
            titleErr = [],
            msgErr = [];

        if (!t.name.includes("[" && "]")) {
            titleErr.push("chybí `[` nebo `]`");
            passed = false;
        } if (!t.name.includes(" ")) {
            titleErr.push("chybí mezera");
            passed = false;
        } if (titleErr.length > 0) {
            await t.send({
                content:
                    ">>> ### Nalezeny chyby - __název složky__!"
                    + "\n- " + titleErr.join("\n- ")
                    + "\nOprav si ho dle příkladu:"
                    + "```[Ocean-44] Richard Onderka```"
            });
        }

        const msg = await t.fetchStarterMessage();
        if (!msg.content.includes(">")) {
            msgErr.push("chybí svislá čára [`>`]");
            passed = false;
        } if (!msg.content.includes("**")) {
            msgErr.push("chybí bold [`**`]");
            passed = false;
        } if (!msg.content.includes(" ") || !msg.content.includes(":** ")) {
            msgErr.push("chybí mezera");
            passed = false;
        } if (msgErr.length > 0) {
            await t.send({
                content:
                    ">>> ### Nalezeny chyby - __popis složky__!"
                    + "\n- " + msgErr.join("\n- ")
                    + "\nOprav si ho dle příkladu:"
                    + "```> **Jméno:** Richard Onderka\n> **Hodnost:** Trooper II\n> **Volačka:** Ocean-44```"
            });
        }

        if (passed) await msg.react("✅");
        else await msg.react("❌");
    } catch (e) {
        console.error(e);
    }
}