import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { getServer } from "../../src/functions/db.js";
import { checkDB, getDB } from "../../src/functions/db.js";

export const slash = new SlashCommandBuilder()
    .setName("online")
    .setDescription(`Zobrazí kolik členů hraje FreshRP`)
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
            if (m.presence && m.presence.activities && m.presence.activities.find(a => a.name.includes("FreshRP"))) {
                if (!(checkDB(m.id))) continue;
                const { data } = getDB(m.id);
                n++;
                onNotSorted.push({ m, data });
            }
        }

        onNotSorted.sort((a, b) => {
            const aBadge = a.data.badge;
            const bBadge = b.data.badge;
            if (aBadge == null && bBadge == null) return 1;
            if (aBadge == null) return 1;
            if (bBadge == null) return -1;
            return aBadge - bBadge;
        });
        for (const o of onNotSorted) {
            onSorted.push(`<@${o.m.id}>`);
        };

        const onlineEmbed = new EmbedBuilder()
            .setAuthor({ name: "Právě ve službě", iconURL: getServer(i.guild.id).footer.iconURL })
            .setDescription(`Členi **${getServer(i.guild.id).name}** hrající **FreshRP** právě teď.`)
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
            .setThumbnail("https://servers-frontend.fivem.net/api/servers/icon/994ldb/1698551087.png")
            .setColor("#df6980")
            .setFooter({ text: `FreshRP`, iconURL: "https://servers-frontend.fivem.net/api/servers/icon/994ldb/1698551087.png" });

        await i.editReply({ embeds: [onlineEmbed], ephemeral: true });
    } catch (e) {
        console.error(e);
        await i.editReply({ content: "> 🛑 **Chyba!**", ephemeral: true });
    }

    console.log(" < [CMD/Online] >  " + i.member.displayName + ` zobrazil(a) online hráče`);
};