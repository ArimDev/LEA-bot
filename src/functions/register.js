import fs from "fs";
import path from "path";
import { REST, Routes } from "discord.js";
import { runType } from '../../index.js';

export async function events(bot) {
    let events = [];
    const eventsFolder = fs.readdirSync(path.resolve("./src/events")).filter(file => file.endsWith('.js'));
    for (const file of eventsFolder) {
        const eventFile = await import(`../events/${file}`);
        const event = file.split(".")[0];
        bot.on(event, (...args) => {
            eventFile.default(bot, ...args);
        });
        events.push(event);
    }

    bot.once('ready', async () => {
        setTimeout(function () {
            console.log("< [DC] >  Successfully registered " + events.length + " events!");
        }, 100);
    });
}

export async function commands(bot) {
    let slashCommands = [];
    const commandsFolder = fs.readdirSync(path.resolve("./src/commands")).filter(file => file.endsWith('.js'));
    for (const file of commandsFolder) {
        const commandFile = await import(`../commands/${file}`);
        const command = file.split(".")[0];
        function registerCommand(cmd, cmdFile) {
            bot.slashes.set(cmd, cmdFile);
            slashCommands.push(cmdFile.slash.toJSON());
        }
        registerCommand(command, commandFile);
    };;

    bot.once('ready', async (bot) => {
        const rest = new REST().setToken(bot.token);

        try {
            await rest.put(
                Routes.applicationCommands(bot.user.id),
                { body: slashCommands },
            ).then(() => {
                console.log("< [DC] >  Successfully registered " + slashCommands.length + " slash commands!");
                if (runType === 1) {
                    console.log("");
                    console.log("                              test successful                             ");
                    console.log("-------------------------------> SAHP-bot <-------------------------------");
                    process.exit();
                }
            });
        } catch (err) {
            console.log(err);
        };
    });
}