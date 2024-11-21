import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { getServer } from "../../src/functions/db.js";

export const slash = new SlashCommandBuilder()
    .setName("rep")
    .setDescription(`Přidat reputaci členovi LEA`)
    .setContexts([0])
    .setIntegrationTypes([0])
    .setNSFW(false);

//TODO:
// - Jeden report za den (.lastRep) (date)
// - Výběr +rep -rep
// - Přidat do jeho db

export default async function run(bot, i) {
    return i.reply({ content: "> 🛑 **Tato funkce ještě nebyla dokončena! (ID rep.js)**", ephemeral: true });
}
