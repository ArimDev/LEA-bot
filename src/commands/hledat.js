import { SlashCommandBuilder } from "discord.js";
import { checkDB } from "../../src/functions/db.js";

export const slash = new SlashCommandBuilder()
    .setName("hledat")
    .setDescription(`Najít kolegu`)
    .setDMPermission(false)
    .setNSFW(false);

export default async function run(bot, i) {
    i.reply({ content: "> 🛑 **Tahle funkce ještě nebyla dokončena! (ID 1)**\nCredits: <@697087720874311740>", ephemeral: true });
};