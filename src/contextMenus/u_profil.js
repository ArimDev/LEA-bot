import { ContextMenuCommandBuilder, ApplicationCommandType } from "discord.js";
import { checkDB } from "../functions/db.js";
import { getProfile } from "../functions/profiles.js";

export const context = new ContextMenuCommandBuilder()
    .setName('Profil')
    .setContexts([0, 1, 2])
    .setIntegrationTypes([0, 1])
    .setType(ApplicationCommandType.User);

export default async function run(bot, i) {
    const discord = await i.targetUser;

    let found = false, db = [], worker = { id: undefined, name: undefined, radio: undefined, badge: undefined };

    if (checkDB(discord.id)) found = true, worker.id = discord.id;
    if (!found) return i.reply({ content: `> 🛑 **<@${discord.id}> není členem LEA.**`, ephemeral: true });

    const profile = await getProfile(bot, worker.id);

    if (!profile) return i.reply({ content: "> 🛑 **Chyba!**", ephemeral: true });

    console.log(" < [CMD/Profil] >  " + i.user.tag + ` zobrazil(a) profil ${worker.id}.json`);

    await i.reply({ embeds: [profile], ephemeral: true });
};