import fs from "fs";
import path from "path";
import { ActionRowBuilder, ActivityType, ButtonBuilder, ButtonStyle, EmbedBuilder, time } from "discord.js";
import { generateFooter } from "../../src/functions/other.js";

export default async function folders(bot) {
    return;
    try {
        const guild = await bot.guilds.fetch("1139266097921675345");
        const folders = await guild.channels.fetch("1203743211000963082");
        const db = fs.readdirSync(path.resolve("./db/LSPD")).filter(file => file.endsWith(".json") && file !== "000000000000000001.json");
        for (const file of db) {
            let worker = JSON.parse(fs.readFileSync((path.resolve("./db/LSPD") + "/" + file), "utf-8"));
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
            else if (worker.rank === "A. Chief") roleID = "1139274974683746335", tagID = "1188146485582377051";
            else if (worker.rank === "Chief") roleID = "1139274974683746335", tagID = "1188146485582377051";
            else if (worker.rank === "A. Commissioner") roleID = "1139274629547053139", tagID = "1188146485582377051";
            else if (worker.rank === "D. Commissioner") roleID = "1139274565973983262", tagID = "1188146485582377051";
            else if (worker.rank === "Commissioner") roleID = "1139274486085058590", tagID = "1188146485582377051";
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
                .setFooter({ text: `SAHP | LEA-Bot v${process.env.version} 💫`, iconURL: bot.LEA.i.SAHP });
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("summary_" + file.slice(0, -5))
                        .setStyle(ButtonStyle.Success)
                        .setLabel("Souhrn")
                        .setEmoji("📑"),
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
                    .setFooter({ text: `SAHP | LEA-Bot v${process.env.version} 💫`, iconURL: bot.LEA.i.SAHP });

                const msg = await folder.send({ embeds: [apologyEmbed]/*, components: [row]*/ });
                worker.apologies[index].id = msg.id;
            }
            for (const duty of worker.duties) {
                const index = worker.duties.indexOf(duty);
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("summary_" + file.slice(0, -5))
                            .setStyle(ButtonStyle.Success)
                            .setEmoji("📑"),
                    ).addComponents(
                        new ButtonBuilder()
                            .setCustomId("editButton_apology")
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji("💫"),
                    ).addComponents(
                        new ButtonBuilder()
                            .setCustomId("deleteButton_apology")
                            .setStyle(ButtonStyle.Danger)
                            .setEmoji("🗑️")
                    );

                const dutyEmbed = new EmbedBuilder()
                    .setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() })
                    .setTitle("Záznam služby")
                    .addFields([
                        {
                            name: `Služba #` + (index + 1), inline: false,
                            value:
                                `> **Datum:** \`${duty.date}\`\n`
                                + `> **Od:** \`${duty.start}\`\n`
                                + `> **Do:** \`${duty.end}\`\n`
                                + `> **Hodin:**  \`${duty.hours}\``
                        }
                    ])
                    .setThumbnail("https://i.imgur.com/fhif3Xj.png")
                    .setColor(bot.LEA.c.duty)
                    .setFooter({ text: `SAHP | LEA-Bot v${process.env.version} 💫`, iconURL: bot.LEA.i.SAHP });

                const msg = await folder.send({ embeds: [dutyEmbed], components: [row] });
                worker.duties[index].id = msg.id;
            }

            fs.writeFileSync(
                path.resolve("./db/LSPD") + "/" + file,
                JSON.stringify(worker, null, 4)
            );

            console.log(`Přesun: ${db.indexOf(file) + 1} / ${db.length}`);
        }
    } catch (e) {
        console.error(e);
    }
}