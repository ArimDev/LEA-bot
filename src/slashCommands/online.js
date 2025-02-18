import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { getServer } from "../../src/functions/db.js";
import { checkDB, getDB } from "../../src/functions/db.js";

export const slash = new SlashCommandBuilder()
    .setName("online")
    .setDescription(`Zobrazí kolik členů hraje VegasRP`)
    .setContexts([0])
    .setIntegrationTypes([0])
    .setNSFW(false);

export default async function run(bot, i) {

    await i.deferReply({ ephemeral: true });
    try {
        let ms = await i.guild.members.fetch({ withPresences: true });

        ms = ms.filter(m => !m.user.bot && m.presence);

        let n = 0, onNotSorted = [], onSorted = [];

        for (const m of ms.values()) {
            if (m.presence && m.presence.activities && m.presence.activities.find(a => a.name.includes("VegasRP"))) {
                if (!(checkDB(m.id))) continue;
                const { data } = getDB(m.id);
                n++;
                onNotSorted.push({ m, data });
            }
        }

        onNotSorted.sort((a, b) => a.data.badge - b.data.badge);
        for (const o of onNotSorted) {
            onSorted.push(`<@${o.m.id}>`);
        };

        const onlineEmbed = new EmbedBuilder()
            .setAuthor({ name: "Právě ve službě", iconURL: getServer(i.guild.id).footer.iconURL })
            .setDescription(`Členi **${getServer(i.guild.id).name}** hrající **VegasRP** právě teď.`)
            .addFields([
                {
                    name: `Seznam`, inline: false,
                    value:
                        onSorted.length > 0 ? `> - ${onSorted.join(",\n> - ")}` : "> **Nikdo není online.**"
                },
                {
                    name: `Počet`, inline: false,
                    value:
                        `> **Dohromady online:** \`${n}\``
                }
            ])
            .setThumbnail("https://servers-live.fivem.net/servers/icon/994ldb/-892566759.png")
            .setColor("#6a371c")
            .setFooter({ text: `VegasRP by Nolimit | nlmt.cc`, iconURL: "https://servers-live.fivem.net/servers/icon/994ldb/-892566759.png" });

        await i.editReply({ embeds: [onlineEmbed], ephemeral: true });
    } catch (e) {
        console.error(e);
        await i.editReply({ content: "> 🛑 **Chyba!**", ephemeral: true });
    }

    console.log(" < [CMD/Online] >  " + i.member.displayName + ` zobrazil(a) online hráče`);
};