import { SlashCommandBuilder } from "discord.js";

export const slash = new SlashCommandBuilder()
    .setName("online")
    .setDescription(`Zobrazí kolik členů serveru aktuálně hraje`)
    .setDMPermission(false)
    .setNSFW(false);

export default async function run(bot, i) {
    return i.reply({ content: "> 🛑 **Tahle funkce ještě nebyla dokončena! (ID 3)**", ephemeral: true });
    //TODO
};