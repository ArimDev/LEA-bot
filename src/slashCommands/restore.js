import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, time } from "discord.js";
import fs from "fs";
import path from "path";
import { getServer } from "../functions/db.js";

export const slash = new SlashCommandBuilder()
    .setName("restore")
    .setDescription(`Obnovení složek z databáze`)
    .setContexts([0])
    .setIntegrationTypes([0])
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setNSFW(false)
    .addChannelOption(option =>
        option.setName("kanál")
            .setDescription("Kanál, kde se mají složky vytvořit")
            .setRequired(true)
            .addChannelTypes(15)
    )
    .addIntegerOption(option =>
        option.setName("start")
            .setDescription("Pořadí, od kterého začít.")
            .setRequired(false)
            .setMinValue(2)
    );

export default async function run(bot, i) {
    const guild = i.guild;
    const folders = i.options.getChannel("kanál");
    const start = i.options.getInteger("start");
    const server = getServer(guild.id).name;
    const db = fs.readdirSync(path.resolve(`./db/${server}`)).filter(file => file.endsWith(".json") && file !== "000000000000000001.json");
    if (!db.length) return;

    await i.reply({ content: `**Obnovuji složky...** (${start || "0"}/${db.length})`, ephemeral: true });

    let failed = 0, failedList = [];
    for (const file of db) {
        const index = db.indexOf(file) + 1;
        if (start && index < start) continue;

        let worker = JSON.parse(fs.readFileSync((path.resolve(`./db/${server}`) + "/" + file), "utf-8"));
        console.log(`[R] Obnovuji složku pro ${worker.name} (${index}/${db.length})`);

        const workerId = file.slice(0, -5);
        const rank = worker.rank;

        try {
            var member = await guild.members.fetch(workerId);
        } catch (e) { failed++; failedList.push(workerId); continue; }

        let roleID, tagID;
        if (server === "LSPD") {
            if (rank === "Chief") roleID = "1301163398595350582", tagID = false;
            else if (rank === "Assistant Chief") roleID = "1301163398595350581", tagID = false;
            else if (rank === "Deputy Chief") roleID = "1301163398595350580", tagID = false;
            else if (rank === "Commander") roleID = "1301163398595350578", tagID = false;
            else if (rank === "Captain") roleID = "1301163398557339688", tagID = false;
            else if (rank === "Lieutenant") roleID = "1301163398557339687", tagID = false;
            else if (rank === "Sergeant II") roleID = "1301163398557339685", tagID = false;
            else if (rank === "Sergeant I") roleID = "1301163398557339684", tagID = false;
            else if (rank === "Police Officer III+I") roleID = "1367967086365773956", tagID = false;
            else if (rank === "Police Officer III") roleID = "1301163398557339681", tagID = false;
            else if (rank === "Police Officer II") roleID = "1301163398557339680", tagID = false;
            else if (rank === "Police Officer I") roleID = "1301163398557339679", tagID = false;
            else if (rank === "Cadet") roleID = "1301163398540689497", tagID = false;
            else roleID = false, tagID = false;
        } else if (server === "LSSD") {
            if (rank === "Sheriff") roleID = "1391525286021169185", tagID = "1417958911549505579";
            else if (rank === "Undersheriff") roleID = "1391525287421804624", tagID = "1417958911549505579";
            else if (rank === "Assistant Sheriff") roleID = "1391525289045266472", tagID = "1417958911549505579";
            else if (rank === "Division Chief") roleID = "1391525291620307044", tagID = "1417958911549505579";
            else if (rank === "Area Commander") roleID = "1391525292828524685", tagID = "1417958911549505579";
            else if (rank === "Captain") roleID = "1391525295432929341", tagID = "1417958911549505579";
            else if (rank === "Lieutenant") roleID = "1391525296385163334", tagID = "1417958911549505579";
            else if (rank === "Sergeant") roleID = "1391525302638874794", tagID = "1417958995670470707";
            else if (rank === "Deputy Senior") roleID = "1409231271774650510", tagID = "1417959092764541039";
            else if (rank === "Deputy III") roleID = "1391525305134354634", tagID = "1417959251208573039";
            else if (rank === "Deputy II") roleID = "1391525306505887956", tagID = "1417959324763951325";
            else if (rank === "Deputy I") roleID = "1391525307550404799", tagID = "1417959369714303026";
            else if (rank === "Deputy Trainee") roleID = "1391525308628205662", tagID = "1417959411946754069";
            else roleID = false, tagID = false;
        }

        if (!roleID) { failed++; failedList.push(workerId); continue; }

        const rankUpDateArr = worker.rankups[worker.rankups.length - 1].date.split(". ");
        const rankUpDate = new Date(rankUpDateArr[1] + "/" + rankUpDateArr[0] + "/" + rankUpDateArr[2]);

        const workerEmbed = new EmbedBuilder()
            .setAuthor({ name: `[${worker.radio}] ${worker.name}`, iconURL: member.displayAvatarURL() })
            .setDescription(
                `> **App:** <@${workerId}>`
                + `\n> **Jméno:** \`${worker.name}\``
                + `\n> **Hodnost:** <@&${roleID}>`
                + `\n> **Odznak:** \`${worker.badge}\``
                + `\n> **Volačka:** \`${worker.radio}\``
                + "\n\n"
                + `\n> **Hodin:** \`${Math.round((worker.hours + Number.EPSILON) * 100) / 100}\``
                + `\n> **Omluvenek:** \`${worker.apologies.filter(a => !a.removed).length}\``
                + `\n> **Povýšení:** ${time(rankUpDate, "R")}`
            )
            .setThumbnail(bot.LEA.i[server])
            .setColor(bot.LEA.c[server])
            .setFooter({ text: `${server} | LEA-Bot v${bot.version} 🏳️`, iconURL: bot.LEA.i[server] });
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("summary_" + workerId)
                    .setStyle(ButtonStyle.Success)
                    .setLabel("Souhrn")
                    .setEmoji("📑"),
            );
        const folder = await folders.threads.create({
            name: `[${worker.radio}] ${worker.name}`,
            message: {
                content: `<@${workerId}>`,
                embeds: [workerEmbed],
                components: [row]
            },
            appliedTags: tagID ? [tagID] : [],
            reason: "LEA-bot obnova složek"
        });
        worker.folder = folder.id;
        for (const apology of worker.apologies) {
            const index = worker.apologies.indexOf(apology);
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("summary_" + i.user.id)
                        .setStyle(ButtonStyle.Success)
                        .setEmoji("📑"),
                ).addComponents(
                    new ButtonBuilder()
                        .setCustomId("editButton_apology_" + i.user.id)
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji("📝"),
                ).addComponents(
                    new ButtonBuilder()
                        .setCustomId("deleteButton_apology_" + i.user.id)
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji("🗑️"),
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
                .setFooter(getServer(guild.id).footer);

            const msg = await folder.send({ embeds: [apologyEmbed], components: [row] });
            worker.apologies[index].id = msg.id;
        }
        for (const duty of worker.duties) {
            const index = worker.duties.indexOf(duty);
            let row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("summary_" + i.user.id)
                        .setStyle(ButtonStyle.Success)
                        .setEmoji("📑"),
                ).addComponents(
                    new ButtonBuilder()
                        .setCustomId("editButton_duty_" + i.user.id)
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji("📝"),
                ).addComponents(
                    new ButtonBuilder()
                        .setCustomId("deleteButton_duty_" + i.user.id)
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji("🗑️"),
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
                .setFooter(getServer(guild.id).footer);

            const msg = await folder.send({ embeds: [dutyEmbed], components: [row] });
            worker.duties[index].id = msg.id;
        }

        fs.writeFileSync(
            path.resolve(`./db/${server}`) + "/" + file,
            JSON.stringify(worker, null, 4)
        );

        if (index % 10 === 0 && index !== db.length) {
            await i.editReply({ content: `**Obnovuji složky...** (${index}/${db.length})`, ephemeral: true });
        } else if (index === db.length) {
            failed = failed > 0 ? `\n**Selhání obnovy:** ${failed}x` : "";
            await i.editReply({ content: `**Obnova složek dokončena!** (${db.length}/${db.length})` + failed, ephemeral: true });
            if (failedList.length) await i.followUp({ content: `**Selhané záznamy:**\n${failedList.join(",\n")}` });
        }
    }
};