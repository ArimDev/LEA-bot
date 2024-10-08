import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import fs from "fs";
import path from "path";
import { checkDB, getDB, getServer } from "../../src/functions/db.js";
import { getProfile } from "../../src/functions/profiles.js";

export const slash = new SlashCommandBuilder()
    .setName("profil")
    .setDescription(`Zobrazí profil o členovi LEA`)
    .addUserOption(option =>
        option.setName("discord")
            .setDescription("Hledat na základě Discord uživatele")
            .setRequired(false))
    .addStringOption(option =>
        option.setName("volačka")
            .setDescription("Hledat na základě volačky")
            .setRequired(false))
    .addIntegerOption(option =>
        option.setName("odznak")
            .setDescription("Hledat na základě odznaku")
            .setMinValue(1000)
            .setMaxValue(9999)
            .setRequired(false))
    .addStringOption(option =>
        option.setName("jméno")
            .setDescription("Hledat na základě jména")
            .setRequired(false))
    .setContexts([0, 1, 2])
    .setIntegrationTypes([0, 1])
    .setNSFW(false);

export default async function run(bot, i) {
    const discord = i.options.getUser("discord"),
        radio = i.options.getString("volačka"),
        badge = i.options.getInteger("odznak"),
        name = i.options.getString("jméno");

    let found = false, db = [], worker = { id: undefined, name: undefined, radio: undefined, badge: undefined };

    if (!discord && !radio && !badge && !name) found = true, worker.id = i.user.id;

    if (discord && !found) {
        if (checkDB(discord.id)) found = true, worker.id = discord.id;
    }
    if (!found) {
        db = fs.readdirSync(path.resolve("./db/LSPD")).filter(file => file.endsWith(".json") && file !== "000000000000000001.json");
        db = db.concat(fs.readdirSync(path.resolve("./db/LSCSO")).filter(file => file.endsWith(".json") && file !== "000000000000000001.json"));
        for (const log of db) {
            const gotDB = getDB(log.split(".")[0]);
            if (!gotDB.exists) continue;
            const content = gotDB.data;
            if (radio) {
                if (radio.toLowerCase() === content.radio.toLowerCase().replace(" ", "-")) {
                    worker = { id: log.split(".")[0], name: content.name, radio: content.radio, badge: content.badge }, found = true;
                    break;
                }
            }
            if (badge) {
                if (badge === content.badge) {
                    worker = { id: log.split(".")[0], name: content.name, radio: content.radio, badge: content.badge }, found = true;
                    break;
                }
            }
            if (name) {
                if (content.name.toLowerCase().includes(name.toLowerCase())) {
                    worker = { id: log.split(".")[0], name: content.name, radio: content.radio, badge: content.badge }, found = true;
                    break;
                }
            }
        }
    }
    if (!found) return i.reply({ content: "> 🛑 **Nikdo ze zadaných parametrů nebyl nalezen.**", ephemeral: true });

    const profile = await getProfile(bot, worker.id);

    if (!profile) return i.reply({ content: "> 🛑 **Chyba!**", ephemeral: true });

    console.log(" < [CMD/Profil] >  " + i.user.tag + ` zobrazil(a) profil ${worker.id}.json`);

    await i.reply({ embeds: [profile], ephemeral: true });
};