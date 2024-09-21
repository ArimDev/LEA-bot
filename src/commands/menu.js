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
    let helpEmbed = new EmbedBuilder()
        .setTitle("Bot Menu")
        .setFields([
            {
                name: `Stav`, inline: true,
                value:
                    `> **Odezva**: \`${bot.ws.ping > 1 ? bot.ws.ping + " ms" : "N/A"}\``
                    + `\n> **Uptime**: \`${msToTime(bot.uptime)}\``
            },
            {
                name: `Analytika`, inline: true,
                value:
                    `> **Příkazů**: \`${commands.length}\``
            },
            {
                name: `Info`, inline: false,
                value:
                    `> **Autor:** <@411436203330502658> ([web](https://petyxbron.cz/cs/p))
                    > **Sloužím:** LSPD ${bot.LEA.e.LSPD} a LSCSO ${bot.LEA.e.LSCSO}
                    > **FiveM:** RefreshRP by Nolimit 🌴
                    > **GitHub**: [petyxbron.cz/lea-bot](https://petyxbron.cz/lea-bot)`
            },
            {
                name: `Další`, inline: true,
                value:
                    `> **Podmínky Použití (TOS):** [/docs/terms-of-use.md](https://github.com/ArimDev/LEA-bot/blob/master/docs/terms-of-use.md)
                    > **Zásady Ochrany Osobních Údajů:** [/docs/privacy-policy.md](https://github.com/ArimDev/LEA-bot/blob/master/docs/privacy-policy.md)
                    > **Jak Používat:** [/docs/usage.md](https://github.com/ArimDev/LEA-bot/blob/master/docs/usage.md)`
            }
        ])
        .setColor(bot.LEA.c.LEAbot)
        .setThumbnail(bot.user.avatarURL())
        .setFooter({ text: `LEA Bot v${process.env.version} | Vytvořil b1ngo 🎈`, iconURL: bot.user.avatarURL() });

    let group;
    if (bot.LEA.g.LSPD.includes(i.guild.id)) group = "**LSPD** " + bot.LEA.e.LSPD;
    else if (bot.LEA.g.LSCSO.includes(i.guild.id)) group = "**LSCSO** " + bot.LEA.e.LSCSO;
    else group = false;

    if (group) helpEmbed.setDescription(`> ✅ Server **${i.guild.name}** je součástí sboru ${group}`);
    else helpEmbed.setDescription(`> ❎ Server **${i.guild.name}** není součásti žádného sboru.`);

    return i.reply({ embeds: [helpEmbed], ephemeral: true });
};