import fs from "fs";
import path from "path";
import { ActionRowBuilder, ActivityType, ButtonBuilder, ButtonStyle, EmbedBuilder, time } from "discord.js";

export default async function folders(bot) {
    return;
    try {
        const guild = await bot.guilds.fetch("1139266097921675345");
        const folders = await guild.channels.fetch("1188146028440997948");
        const db = fs.readdirSync(path.resolve("./db/SAHP")).filter(file => file.endsWith(".json") && file !== "000000000000000001.json");
        for (const file of db) {
            let worker = JSON.parse(fs.readFileSync((path.resolve("./db/SAHP") + "/" + file), "utf-8"));
            try {
                var member = await guild.members.fetch(file.slice(0, -5));
            } catch (e) {
                console.log(file + " " + worker.name + "\n" + e);
                continue;
            }

            let roleID, tagID;
            if (worker.rank === "Trooper Trainee") roleID = "1139276175819157646", tagID = "1188146360327872613";
            else if (worker.rank === "Trooper I") roleID = "1139276036673130527", tagID = "1188146386206724126";
            else if (worker.rank === "Trooper II") roleID = "1139275934025916568", tagID = "1188146415583625316";
            else if (worker.rank === "Trooper III") roleID = "1139275782607347905", tagID = "1188146446885716030";
            else if (worker.rank === "Sergeant") roleID = "1139275398295867453", tagID = "1188146467442012160";
            else if (worker.rank === "Lieutenant") roleID = "1139275038877560856", tagID = "1188146485582377051";
            else if (worker.rank === "Captain") roleID = "1139274974683746335", tagID = "1188146485582377051";
            else roleID = false, tagID = false;

            const rankUpDateArr = worker.rankups[worker.rankups.length - 1].date.split(". ");
            const rankUpDate = new Date(rankUpDateArr[1] + "/" + rankUpDateArr[0] + "/" + rankUpDateArr[2]);

            const workerEmbed = new EmbedBuilder()
                .setAuthor({ name: `[${worker.radio}] ${worker.name}`, iconURL: member.displayAvatarURL() })
                .setDescription(
                    `> **App:** <@${file.slice(0, -5)}>`
                    + `\n> **Jméno:** \`${worker.name}\``
                    + `\n> **Hodnost:** ${roleID ? `<@&${roleID}>` : `\`${worker.rank}\``}`
                    + `\n> **Odznak:** \`${worker.badge}\``
                    + `\n> **Volačka:** \`${worker.radio}\``
                    + "\n\n"
                    + `\n> **Hodin:** \`${Math.round((worker.hours + Number.EPSILON) * 100) / 100}\``
                    + `\n> **Omluvenek:** \`${worker.apologies.filter(a => !a.removed).length}\``
                    + `\n> **Povýšení:** ${time(rankUpDate, "R")}`
                )
                .setThumbnail(bot.LEA.i.SAHP)
                .setColor(bot.LEA.c.SAHP)
                .setFooter({ text: "SAHP | Vytvořil b1ngo ✌️", iconURL: bot.LEA.i.SAHP });
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("summary_" + file.slice(0, -5))
                        .setLabel("Souhrn")
                        .setStyle(ButtonStyle.Success)
                        .setEmoji("👀"),
                );
            const folder = await folders.threads.create({
                name: `[${worker.radio}] ${worker.name}`,
                message: {
                    content: `<@${file.slice(0, -5)}>`,
                    embeds: [workerEmbed],
                    components: [row]
                },
                appliedTags: [tagID],
                reason: "LEA-bot přesun složek"
            });
            worker.folder = folder.id;
            for (const apology of worker.apologies) {
                const index = worker.apologies.indexOf(apology);
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("edit")
                            .setLabel("Přepsat")
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji("📝")
                            .setDisabled(),
                    );

                const apologyEmbed = new EmbedBuilder()
                    .setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() })
                    .setTitle("Omluvenka")
                    .addFields([
                        {
                            name: `Omluvenka #` + (index + 1), inline: false,
                            value:
                                `> **ID Události:** \`${apology.eventID || "0"}\`\n`
                                + `> **Začátek:** \`${apology.start}\`\n`
                                + `> **Konec:** \`${apology.end}\`\n`
                                + `> **OOC Důvod:** \`${apology.ooc}\`\n`
                                + `> **IC Důvod:** \`${apology.ic}\``
                        }
                    ])
                    .setThumbnail("https://i.imgur.com/YQb9mPm.png")
                    .setColor(bot.LEA.c.apology)
                    .setFooter({ text: "SAHP | Vytvořil b1ngo ✌️", iconURL: bot.LEA.i.SAHP });

                const msg = await folder.send({ embeds: [apologyEmbed], components: [row] });
                worker.apologies[index].id = msg.id;
            }
            for (const duty of worker.duties) {
                const index = worker.duties.indexOf(duty);
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("edit")
                            .setLabel("Přepsat")
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji("📝")
                            .setDisabled(),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("summary_" + file.slice(0, -5))
                            .setLabel("Souhrn")
                            .setStyle(ButtonStyle.Success)
                            .setEmoji("👀"),
                    );

                const dutyEmbed = new EmbedBuilder()
                    .setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() })
                    .setTitle("Záznam služby")
                    .addFields([
                        {
                            name: `Duty #` + (index + 1), inline: false,
                            value:
                                `> **Datum:** \`${duty.date}\`\n`
                                + `> **Od:** \`${duty.start}\`\n`
                                + `> **Do:** \`${duty.end}\`\n`
                                + `> **Hodin:**  \`${duty.hours}\``
                        }
                    ])
                    .setThumbnail("https://i.imgur.com/fhif3Xj.png")
                    .setColor(bot.LEA.c.duty)
                    .setFooter({ text: "SAHP | Vytvořil b1ngo ✌️", iconURL: bot.LEA.i.SAHP });

                const msg = await folder.send({ embeds: [dutyEmbed], components: [row] });
                worker.duties[index].id = msg.id;
            }

            fs.writeFileSync(
                path.resolve("./db/SAHP") + "/" + file,
                JSON.stringify(worker, null, 4)
            );

            console.log(`Přesun: ${db.indexOf(file) + 1} / ${db.length}`);
        }
    } catch (e) {
        console.error(e);
    }
}