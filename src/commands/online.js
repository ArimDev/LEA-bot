import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { getServer } from "../../src/functions/db.js";

export const slash = new SlashCommandBuilder()
    .setName("online")
    .setDescription(`Zobrazí kolik členů hraje RefreshRP`)
    .setDMPermission(false)
    .setNSFW(false);

export default async function run(bot, i) {

    await i.deferReply({ ephemeral: true });
    try {
        let ms;
        ms = await i.guild.members.fetch({ withPresences: true });
        ms = await ms.filter(m => !m.user.bot && m.presence);
        let n = 0, on = [];
        ms.forEach(m => {
            if (m.presence.activities.find(a => a.name === "RefreshRP")) {
                n++;
                on.push(`<@${m.id}>`);
            }
        });
        const onlineEmbed = new EmbedBuilder()
            .setAuthor({ name: "Online na RefreshRP", iconURL: "https://servers-live.fivem.net/servers/icon/994ldb/-1804725016.png" })
            .setDescription(`Členi **${i.guild.name}** hrající **RefreshRP** právě teď.`)
            .addFields([
                {
                    name: `Seznam`, inline: false,
                    value:
                        `> ${on.join(", ")}`
                },
                {
                    name: `Počet`, inline: false,
                    value:
                        `> **Dohromady online:** \`${n}\``
                }
            ])
            .setThumbnail(i.guild.iconURL())
            .setColor(getServer(i.guild.id).color)
            .setFooter(getServer(i.guild.id).footer);

        await i.editReply({ embeds: [onlineEmbed], ephemeral: true });
    } catch (e) {
        console.error(e);
        await i.editReply({ content: "> 🛑 **Chyba!**", ephemeral: true });
    }

    console.log(" < [CMD/Online] >  " + i.member.displayName + ` zobrazil(a) online hráče`);
};