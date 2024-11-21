import fs from "fs";
import path from "path";
import { REST, Routes } from "discord.js";
import { runType } from "../../index.js";

export async function events(bot) {
    let events = [];
    const eventsFolder = fs.readdirSync(path.resolve("./src/events")).filter(file => file.endsWith(".js"));
    for (const file of eventsFolder) {
        const eventFile = await import(`../events/${file}`);
        const event = file.split(".")[0];
        bot.on(event, (...args) => {
            eventFile.default(bot, ...args);
        });
        events.push(event);
    }

    bot.once("ready", async () => {
        setTimeout(function () {
            console.log(" < [DC] >  Úspěšně zaregistrováno " + events.length + " eventů!");
        }, 100);
    });
}

export async function commands(bot) {
    const slashCommands = fs
        .readdirSync(path.resolve("./src/slashCommands"))
        .filter(file => file.endsWith(".js"));

    const contextMenus = fs
        .readdirSync(path.resolve("./src/contextMenus"))
        .filter(file => file.endsWith(".js"));

    const summ = [...slashCommands, ...contextMenus];
    const allCmd = [];

    for (const file of summ) {
        let commandFile;
        if (slashCommands.includes(file)) {
            commandFile = await import(`../slashCommands/${file}`);
        } else if (contextMenus.includes(file)) {
            commandFile = await import(`../contextMenus/${file}`);
        }

        bot.slashes.set(file.split(".")[0], commandFile);
        if (commandFile.slash) allCmd.push(commandFile.slash.toJSON());
        else if (commandFile.context) allCmd.push(commandFile.context.toJSON());
    };

    bot.once("ready", async (bot) => {
        const rest = new REST().setToken(bot.token);

        try {
            await rest.put(
                Routes.applicationCommands(bot.user.id),
                { body: allCmd },
            ).then(() => {
                console.log(" < [DC] >  Úspěšně zaregistrováno " + slashCommands.length + " slash příkazů!");
                console.log(" < [DC] >  Úspěšně zaregistrováno " + contextMenus.length + " context menu příkazů!");
                if (runType === 1) {
                    console.log("");
                    console.log("                               test úspěšný                               ");
                    console.log("-------------------------------> LEA Bot <-------------------------------");
                    process.exit();
                }
            });
        } catch (err) {
            console.log(err);
        };
    });
}

export function interactions(bot) {
    const folders = fs.readdirSync(path.resolve("./src/interactions"), { withFileTypes: true })
        .filter(dir => dir.isDirectory());

    let stats = {}, interactions = 0;

    for (const folder of folders) {
        const folderPath = path.join(path.resolve("./src/interactions"), folder.name);
        const files = fs.readdirSync(folderPath)
            .filter(file => file.endsWith(".js"));

        for (const file of files) {
            const filePath = path.join(folderPath, file);
            const customID = path.basename(file, ".js");

            const run = import(filePath).then(fn => fn.default);

            if (!bot.ints.has(folder.name))
                bot.ints.set(folder.name, new Map());
            bot.ints.get(folder.name).set(customID, run);

            stats[folder.name] = interactions++;
        }
    }

    console.log(" < [DC] >  Registrovány funkce: " + Object.entries(stats).map(([k, v]) => `${k} (${v})`).join(", "));
}