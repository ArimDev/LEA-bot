import { ContextMenuCommandBuilder, ApplicationCommandType } from "discord.js";
import { checkDB } from "../functions/db.js";
import { getProfile } from "../functions/profiles.js";

export const context = new ContextMenuCommandBuilder()
    .setName('Profil')
    .setContexts([0, 1, 2])
    .setIntegrationTypes([0, 1])
    .setType(ApplicationCommandType.User);

export default async function run(bot, i) {
    const targetID = i.targetId;
    let found = false

    if (checkDB(targetID)) found = true;
    if (!found) return i.reply({ content: `> 🛑 **<@${targetID}> není členem LEA.**`, ephemeral: true });

    const profile = await getProfile(bot, targetID);

    if (!profile) return i.reply({ content: "> 🛑 **Chyba!**", ephemeral: true });

    console.log(" < [CMD/Profil] >  " + i.user.tag + ` zobrazil(a) profil ${targetID}.json`);

    await i.reply({ embeds: [profile], ephemeral: true });
};