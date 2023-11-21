import { ActionRowBuilder, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

export const slash = new SlashCommandBuilder()
    .setName("warn")
    .setDescription(`Zapíše varování zaměstnanci`)
    .setDMPermission(false)
    .setNSFW(false);

export default async function run(bot, i) {
    let passed = false;
    await i.guild.fetch();
    const admin = await i.member;
    if (admin.roles.cache.has("1145344761402765343")) passed = true; //Staff team Refresh
    if (admin.roles.cache.has("1139266408681844887")) passed = true; //.
    if (admin.id === "607915400604286997") passed = true; //Samus
    if (admin.id === "436180906533715969") passed = true; //Mičut
    if (admin.id === "411436203330502658") passed = true; //PetyXbron
    if (!passed) return i.reply({ content: "🛑 **K tomuhle má přístup jen admin.**", ephemeral: true });

    return i.reply({ content: "> 🛑 **Tahle funkce ještě nebyla dokončena! (ID 2)**", ephemeral: true });
    //TODO

    console.log(" < [CMD/Warn] >  " + i.member.displayName + ` udělil(a) varování zaměstnancovi / zaměstnankyni [RADIO] NAME (ID.JSON)`);
};