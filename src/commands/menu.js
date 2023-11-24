import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import fs from "fs";
import path from "path";

export const slash = new SlashCommandBuilder()
    .setName("menu")
    .setDescription(`Otevře pomocné menu bota`)
    .setDMPermission(true)
    .setNSFW(false);

export default async function run(bot, i) {
    function msToTime(ms) {
        let s = Math.floor((ms / 1000) % 60),
            min = Math.floor((ms / (1000 * 60)) % 60),
            h = Math.floor((ms / (1000 * 60 * 60))),
            d = Math.floor((ms / (1000 * 60 * 60 * 24)));

        const tPassed = [];

        if (d === 0) d = false;
        else if (d === 1) tPassed.push(d + " den");
        else if (d > 1 && d < 5) tPassed.push(d + " dny");
        else tPassed.push(d + " dnů");

        if (h === 0) h = false;
        else if (d < 3 && tPassed.length < 2) {
            if (h === 1) tPassed.push(h + " hodina");
            else if (h > 1 && h < 5) tPassed.push(h + " hodiny");
            else tPassed.push(h + " hodin");
        }

        if (min === 0) min = false;
        else if (!d && h < 24 && tPassed.length < 2) {
            if (min === 1) tPassed.push(min + " minuta");
            else if (min > 1 && min < 5) tPassed.push(min + " minuty");
            else tPassed.push(min + " minut");
        }

        if (s === 0) s = false;
        else if (!d && !h && min < 60 && tPassed.length < 2) {
            if (s === 1) tPassed.push(s + " sekunda");
            else if (s > 1 && s < 5) tPassed.push(s + " sekundy");
            else tPassed.push(s + " sekund");
        }

        return tPassed.join(" a ");
    }

    console.log(" < [CMD/Menu] >  " + (i.member.displayName || i.user.displayName) + ` zobrazil(a) menu`);

    const commands = fs.readdirSync(path.resolve("./src/commands")).filter(file => file.endsWith(".js"));
    const helpEmbed = new EmbedBuilder()
        .setTitle("Menu")
        .setDescription(
            `> **Odezva**: \`${bot.ws.ping > 1 ? bot.ws.ping + " ms" : "N/A"}\``
            + `\n> **Uptime**: \`${msToTime(bot.uptime)}\``
            + `\n> **Příkazů**: \`${commands.length}\``
            + `\n> **GitHub**: [zde](https://github.com/Azator-Entertainment/SAHP-bot)`
        )
        .setColor(bot.SAHP.c.master)
        .setFooter({ text: "SAHP", iconURL: bot.user.avatarURL() });
    return i.reply({ embeds: [helpEmbed], ephemeral: true });
};