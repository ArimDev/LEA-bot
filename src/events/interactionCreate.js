import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, InteractionType, ModalBuilder, TextInputBuilder, TextInputStyle, time } from "discord.js";
import fs from "fs";
import path from "path";
import { checkDB, checkEVENT, getDB, getServer } from "../../src/functions/db.js";
import { dcLog, simpleLog } from "../../src/functions/logSystem.js";
import { findWorker } from "../../src/functions/profiles.js";
import { dg } from "../../src/functions/logSystem.js";

export default async function (bot, i) {
    if (
        !i.isUserContextMenuCommand()
        && i.type !== InteractionType.ApplicationCommand
        && i.type !== InteractionType.MessageComponent
        && i.type !== InteractionType.ModalSubmit
    ) return;

    /*console.log(" < [CMD/*] >  " + i.user.username + ` se pokusil o příkaz při údržbě!`);
    return i.reply({
        content:
            `> 🛑 ***Probíhá údržba bota!***
            > Odhadovaný konec: <t:1715625900:R>
            > Správce: <@411436203330502658>`,
        ephemeral: true });*/

    if (
        i.isUserContextMenuCommand()
        || i.type === InteractionType.ApplicationCommand
    ) {
        let cmdName = i.commandName;
        if (i.isUserContextMenuCommand()) {
            cmdName = i.commandName.replaceAll(" ", "");
            cmdName = "u_" + cmdName;
        }

        let lowSlashes = new Map();
        bot.slashes.forEach((value, key) =>
            lowSlashes.set(key.toLowerCase(), value)
        );

        const command = lowSlashes.get(cmdName.toLowerCase());
        if (command) {
            return command.default(bot, i);
        }
    }

    if (i.type === InteractionType.MessageComponent
        || i.type === InteractionType.ModalSubmit
    ) {
        let category = "";
        if (i.type === InteractionType.MessageComponent) category = "messageComponent";
        else if (i.type === InteractionType.ModalSubmit) category = "modalSubmit";

        const ints = bot.ints.get(category);

        function findInt(thatMap, includesName) {
            for (const [name, run] of thatMap.entries()) {
                if (name.includes(includesName))
                    return run;
            }
            return null;
        }

        const int = findInt(ints, i.customId.split("_")[0]);
        if (int) return int(bot, i);
    }
}