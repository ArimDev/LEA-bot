import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, InteractionType, ModalBuilder, TextInputBuilder, TextInputStyle, time } from "discord.js";
import fs from "fs";
import path from "path";
import { checkDB, checkEVENT, getDB, getServer } from "../../functions/db.js";
import { dcLog, simpleLog } from "../../functions/logSystem.js";

export default async function run(bot, i) {
    if (!(checkDB(i.fields.getTextInputValue("id"), i))) return i.reply({ content: "> 🛑 <@" + i.fields.getTextInputValue("id") + "> **není v DB.**", ephemeral: true });

    let member;
    try { member = await i.guild.members.fetch(i.fields.getTextInputValue("id")); }
    catch {
        return await i.editReply({
            content: "> 🛑 <@" + i.fields.getTextInputValue("id") + "> **již není členem Discord serveru.**",
            ephemeral: true
        });
    }

    const visible = i.customId.includes("_") ? (/true/).test(i.customId.split("_")[1]) : false;

    let content, oldRolesIDs, rolesIDs, tagID, gotNick = true, gotRole = true, newRank = i.fields.getTextInputValue("rank"),
        oldGrade, newGrade, start = null;
    if (i.guild.id === "1301163398515396668") { //LSPD
        if (newRank === "Chief of Police") rolesIDs = ["1301163398595350582", "1301163398557339686"], tagID = "1394017573586341898", newGrade = 15;
        else if (newRank === "Assistant Chief of Police") rolesIDs = ["1301163398595350581", "1301163398557339686"], tagID = "1394017573586341898", newGrade = 14;
        else if (newRank === "Deputy Chief of Police") rolesIDs = ["1301163398595350580", "1301163398557339686"], tagID = "1394017573586341898", newGrade = 13;
        else if (newRank === "Commander") rolesIDs = ["1301163398595350578", "1301163398557339686"], tagID = "1394017573586341898", newGrade = 12;
        else if (newRank === "Captain") rolesIDs = ["1301163398557339688", "1301163398557339686"], tagID = "1394017573586341898", newGrade = 11;
        else if (newRank === "Lieutenant") rolesIDs = ["1301163398557339687", "1301163398557339686"], tagID = "1394017573586341898", newGrade = 10;
        else if (newRank === "Sergeant II") rolesIDs = ["1301163398557339685", "1301163398557339683"], tagID = "1394017606662619297", newGrade = 8;
        else if (newRank === "Sergeant I") rolesIDs = ["1301163398557339684", "1301163398557339683"], tagID = "1394017606662619297", newGrade = 6;
        else if (newRank === "Police Officer III+I") rolesIDs = ["1367967086365773956"], tagID = "1394017661620584578", newGrade = 4;
        else if (newRank === "Police Officer III") rolesIDs = ["1301163398557339681"], tagID = "1394017679207170059", newGrade = 3;
        else if (newRank === "Police Officer II") rolesIDs = ["1301163398557339680"], tagID = "1394017698236862466", newGrade = 2;
        else if (newRank === "Police Officer I") rolesIDs = ["1301163398557339679"], tagID = "1394017709552832612", newGrade = 1;
        else if (newRank === "Cadet") rolesIDs = ["1301163398540689497"], tagID = "1394017721641074810", newGrade = 0;
        else rolesIDs = false, tagID = false;

        if (!rolesIDs) return i.reply({ content: `> 🛑 **Neznámá hodnost... (\`${newRank}\`)**`, ephemeral: true });

        content = JSON.parse(fs.readFileSync((path.resolve("./db/LSPD") + "/" + i.fields.getTextInputValue("id") + ".json"), "utf-8"));

        let folderCh = false;
        try { folderCh = await i.guild.channels.fetch(content.folder); } catch { }
        if (!folderCh) return i.reply({ content: "> 🛑 **Nebyla nalezena složka <@" + i.fields.getTextInputValue("id") + ">!**", ephemeral: true });

        if (content.rank === "Chief of Police") oldRolesIDs = ["1301163398595350582", "1301163398557339686"], oldGrade = 15;
        else if (content.rank === "Assistant Chief of Police") oldRolesIDs = ["1301163398595350581", "1301163398557339686"], oldGrade = 14;
        else if (content.rank === "Deputy Chief of Police") oldRolesIDs = ["1301163398595350580", "1301163398557339686"], oldGrade = 13;
        else if (content.rank === "Commander") oldRolesIDs = ["1301163398595350578", "1301163398557339686"], oldGrade = 12;
        else if (content.rank === "Captain") oldRolesIDs = ["1301163398557339688", "1301163398557339686"], oldGrade = 11;
        else if (content.rank === "Lieutenant") oldRolesIDs = ["1301163398557339687", "1301163398557339686"], oldGrade = 10;
        else if (content.rank === "Sergeant II") oldRolesIDs = ["1301163398557339685", "1301163398557339683"], oldGrade = 8;
        else if (content.rank === "Sergeant I") oldRolesIDs = ["1301163398557339684", "1301163398557339683"], oldGrade = 6;
        else if (content.rank === "Police Officer III+I") oldRolesIDs = ["1367967086365773956"], oldGrade = 4;
        else if (content.rank === "Police Officer III") oldRolesIDs = ["1301163398557339681"], oldGrade = 3;
        else if (content.rank === "Police Officer II") oldRolesIDs = ["1301163398557339680"], oldGrade = 2;
        else if (content.rank === "Police Officer I") oldRolesIDs = ["1301163398557339679"], oldGrade = 1;
        else if (content.rank === "Cadet") oldRolesIDs = ["1301163398540689497"], oldGrade = 0;
    } else if (i.guild.id === "1385604665252642897") { //LSSD
        if (newRank === "Sheriff") rolesIDs = ["1391525286021169185", "1391525298461347971"], tagID = "1391880113921982595", newGrade = 11;
        else if (newRank === "Undersheriff") rolesIDs = ["1391525287421804624", "1391525298461347971"], tagID = "1391880113921982595", newGrade = 10;
        else if (newRank === "Assistant Sheriff") rolesIDs = ["1391525289045266472", "1391525298461347971"], tagID = "1391880113921982595", newGrade = 9;
        else if (newRank === "Division Chief") rolesIDs = ["1391525291620307044", "1391525298461347971"], tagID = "1391880113921982595", newGrade = 8;
        else if (newRank === "Area Commander") rolesIDs = ["1391525292828524685", "1391525298461347971"], tagID = "1391880113921982595", newGrade = 7;
        else if (newRank === "Captain") rolesIDs = ["1391525295432929341", "1391525298461347971"], tagID = "1391880113921982595", newGrade = 6;
        else if (newRank === "Lieutenant") rolesIDs = ["1391525296385163334", "1391525298461347971"], tagID = "1391880113921982595", newGrade = 5;
        else if (newRank === "Sergeant") rolesIDs = ["1391525302638874794", "1391525303733452860"], tagID = "1391880138500608162", newGrade = 4;
        else if (newRank === "Deputy III") rolesIDs = ["1391525305134354634"], tagID = "1391880178694750218", newGrade = 3;
        else if (newRank === "Deputy II") rolesIDs = ["1391525306505887956"], tagID = "1391880192061865984", newGrade = 2;
        else if (newRank === "Deputy I") rolesIDs = ["1391525307550404799"], tagID = "1391880204988973077", newGrade = 1;
        else if (newRank === "Deputy Trainee") rolesIDs = ["1391525308628205662"], tagID = "1391880217613570269", newGrade = 0;
        else rolesIDs = false, tagID = false;

        if (!rolesIDs) return i.reply({ content: `> 🛑 **Neznámá hodnost... (\`${newRank}\`)**`, ephemeral: true });

        content = JSON.parse(fs.readFileSync((path.resolve("./db/LSSD") + "/" + i.fields.getTextInputValue("id") + ".json"), "utf-8"));

        let folderCh = false;
        try { folderCh = await i.guild.channels.fetch(content.folder); } catch { }
        if (!folderCh) return i.reply({ content: "> 🛑 **Nebyla nalezena složka <@" + i.fields.getTextInputValue("id") + ">!**", ephemeral: true });

        if (content.rank === "Sheriff") oldRolesIDs = ["1391525286021169185", "1391525298461347971"], oldGrade = 11;
        else if (content.rank === "Undersheriff") oldRolesIDs = ["1391525287421804624", "1391525298461347971"], oldGrade = 10;
        else if (content.rank === "Assistant Sheriff") oldRolesIDs = ["1391525289045266472", "1391525298461347971"], oldGrade = 9;
        else if (content.rank === "Division Chief") oldRolesIDs = ["1391525291620307044", "1391525298461347971"], oldGrade = 8;
        else if (content.rank === "Area Commander") oldRolesIDs = ["1391525292828524685", "1391525298461347971"], oldGrade = 7;
        else if (content.rank === "Captain") oldRolesIDs = ["1391525295432929341", "1391525298461347971"], oldGrade = 6;
        else if (content.rank === "Lieutenant") oldRolesIDs = ["1391525296385163334", "1391525298461347971"], oldGrade = 5;
        else if (content.rank === "Sergeant") oldRolesIDs = ["1391525302638874794", "1391525303733452860"], oldGrade = 4;
        else if (content.rank === "Deputy III") oldRolesIDs = ["1391525305134354634"], oldGrade = 3;
        else if (content.rank === "Deputy II") oldRolesIDs = ["1391525306505887956"], oldGrade = 2;
        else if (content.rank === "Deputy I") oldRolesIDs = ["1391525307550404799"], oldGrade = 1;
        else if (content.rank === "Deputy Trainee") oldRolesIDs = ["1391525308628205662"], oldGrade = 0;
    } else if (i.guild.id === "xxx" /* MISSING ID */) { //SAHP
        if (newRank === "Commissioner") rolesIDs = [/* MISSING IDs */], tagID = "xxx" /* MISSING ID */, newGrade = 13;
        else if (newRank === "Deputy Commissioner") rolesIDs = [/* MISSING IDs */], tagID = "xxx" /* MISSING ID */, newGrade = 12;
        else if (newRank === "Assistant Commissioner") rolesIDs = [/* MISSING IDs */], tagID = "xxx" /* MISSING ID */, newGrade = 11;
        else if (newRank === "Chief") rolesIDs = [/* MISSING IDs */], tagID = "xxx" /* MISSING ID */, newGrade = 10;
        else if (newRank === "Assistant Chief") rolesIDs = [/* MISSING IDs */], tagID = "xxx" /* MISSING ID */, newGrade = 9;
        else if (newRank === "Captain") rolesIDs = [/* MISSING IDs */], tagID = "xxx" /* MISSING ID */, newGrade = 8;
        else if (newRank === "Lieutenant") rolesIDs = [/* MISSING IDs */], tagID = "xxx" /* MISSING ID */, newGrade = 7;
        else if (newRank === "Sergeant II") rolesIDs = [/* MISSING IDs */], tagID = "xxx" /* MISSING ID */, newGrade = 6;
        else if (newRank === "Sergeant I") rolesIDs = [/* MISSING IDs */], tagID = "xxx" /* MISSING ID */, newGrade = 5;
        else if (newRank === "Senior Trooper") rolesIDs = [/* MISSING IDs */], tagID = "xxx" /* MISSING ID */, newGrade = 4;
        else if (newRank === "Trooper III") rolesIDs = [/* MISSING IDs */], tagID = "xxx" /* MISSING ID */, newGrade = 3;
        else if (newRank === "Trooper II") rolesIDs = [/* MISSING IDs */], tagID = "xxx" /* MISSING ID */, newGrade = 2;
        else if (newRank === "Trooper I") rolesIDs = [/* MISSING IDs */], tagID = "xxx" /* MISSING ID */, newGrade = 1;
        else if (newRank === "Trooper Trainee") rolesIDs = [/* MISSING IDs */], tagID = "xxx" /* MISSING ID */, newGrade = 0;
        else rolesIDs = false, tagID = false;

        if (!rolesIDs) return i.reply({ content: `> 🛑 **Neznámá hodnost... (\`${newRank}\`)**`, ephemeral: true });

        content = JSON.parse(fs.readFileSync((path.resolve("./db/SAHP") + "/" + i.fields.getTextInputValue("id") + ".json"), "utf-8"));

        let folderCh = false;
        try { folderCh = await i.guild.channels.fetch(content.folder); } catch { }
        if (!folderCh) return i.reply({ content: "> 🛑 **Nebyla nalezena složka <@" + i.fields.getTextInputValue("id") + ">!**", ephemeral: true });

        if (content.rank === "Commissioner") oldRolesIDs = [/* MISSING IDs */], oldGrade = 13;
        else if (content.rank === "Deputy Commissioner") oldRolesIDs = [/* MISSING IDs */], oldGrade = 12;
        else if (content.rank === "Assistant Commissioner") oldRolesIDs = [/* MISSING IDs */], oldGrade = 11;
        else if (content.rank === "Chief") oldRolesIDs = [/* MISSING IDs */], oldGrade = 10;
        else if (content.rank === "Assistant Chief") oldRolesIDs = [/* MISSING IDs */], oldGrade = 9;
        else if (content.rank === "Captain") oldRolesIDs = [/* MISSING IDs */], oldGrade = 8;
        else if (content.rank === "Lieutenant") oldRolesIDs = [/* MISSING IDs */], oldGrade = 7;
        else if (content.rank === "Sergeant II") oldRolesIDs = [/* MISSING IDs */], oldGrade = 6;
        else if (content.rank === "Sergeant I") oldRolesIDs = [/* MISSING IDs */], oldGrade = 5;
        else if (content.rank === "Senior Trooper") oldRolesIDs = [/* MISSING IDs */], oldGrade = 4;
        else if (content.rank === "Trooper III") oldRolesIDs = [/* MISSING IDs */], oldGrade = 3;
        else if (content.rank === "Trooper II") oldRolesIDs = [/* MISSING IDs */], oldGrade = 2;
        else if (content.rank === "Trooper I") oldRolesIDs = [/* MISSING IDs */], oldGrade = 1;
        else if (content.rank === "Trooper Trainee") oldRolesIDs = [/* MISSING IDs */], oldGrade = 0;
    }

    await i.deferReply({ ephemeral: !visible });

    const today = new Date();

    const oldContent = { ...content };

    const rankup = {
        "date": today.getDate() + ". " + (parseInt(today.getMonth()) + 1) + ". " + today.getFullYear(),
        "to": i.fields.getTextInputValue("rank"),
        "from": content.rank,
        "boss": i.member.displayName,
        "hours": content.hours
    };
    content.rankups.push(rankup);
    content.badge = parseInt(i.fields.getTextInputValue("badge"));
    content.radio = i.fields.getTextInputValue("call");
    content.rank = i.fields.getTextInputValue("rank");

    let workersPath;
    if (bot.LEA.g.LSPD.includes(i.guild.id)) workersPath = (path.resolve("./db/LSPD") + "/" + i.fields.getTextInputValue("id") + ".json");
    else if (bot.LEA.g.LSSD.includes(i.guild.id)) workersPath = (path.resolve("./db/LSSD") + "/" + i.fields.getTextInputValue("id") + ".json");
    else if (bot.LEA.g.SAHP.includes(i.guild.id)) workersPath = (path.resolve("./db/SAHP") + "/" + i.fields.getTextInputValue("id") + ".json");

    fs.writeFileSync(
        workersPath,
        JSON.stringify(content, null, 4)
    );

    try { await member.setNickname(`[${content.radio}] ${content.name}`); } catch { gotNick = false; }
    try { await member.roles.remove(oldRolesIDs); } catch { gotRole = false; }
    try { await member.roles.add(rolesIDs); } catch { gotRole = false; }

    const server = getServer(i.guild.id),
        strike1Role = bot.LEA.r[server.name]?.strike1,
        strike2Role = bot.LEA.r[server.name]?.strike2,
        warnRole = bot.LEA.r[server.name]?.warn;

    let removedWarn = false, removedStrikes = 0,
        failedWarn = false, failedStrikes = false;

    if (member.roles.cache.has(strike1Role)) {
        try { await member.roles.remove(strike1Role); removedStrikes++; }
        catch { failedStrikes = true; }
    }

    if (member.roles.cache.has(strike2Role)) {
        try { await member.roles.remove(strike2Role); removedStrikes++; }
        catch { failedStrikes = true; }
    }

    if (member.roles.cache.has(warnRole)) {
        try { await member.roles.remove(warnRole); removedWarn = true; }
        catch { failedWarn = true; }
    }

    if (
        server.name === "LSSD" && newGrade >= 5 && oldGrade < 5
        || server.name === "SAHP" && newGrade >= 7 && oldGrade < 7
    ) {
        try {
            await member.send({
                content:
                    `*Gratuluji k povýšení na **${newRank}**!*`
                    + "\n\nVzhledem k tomu, že jsi nyní členem **Leadershipu**,"
                    + "\nprosím připoj se na Discord server **LEA-Bota**."
                    + "\nPo obdržení role můžeš navrhovat, diskutovat a hlasovat o nových funkcích."
                    + "\nhttps://discord.com/invite/PYTqqhWad2"
            });
        } catch { }
    }

    if (content.folder) {
        const folder = await i.guild.channels.fetch(content.folder);

        if (folder.archived) folder.setArchived(false, "otevření složky z neaktivity");
        start = await folder.fetchStarterMessage({ force: true });
        if (tagID) await folder.setAppliedTags([tagID]);

        if (start) {
            const rankUpDateArr = rankup.date.split(". ");
            const rankUpDate = new Date(rankUpDateArr[1] + "/" + rankUpDateArr[0] + "/" + rankUpDateArr[2]);

            const workerEmbed = new EmbedBuilder()
                .setAuthor({ name: `[${content.radio}] ${content.name}`, iconURL: member.displayAvatarURL() })
                .setDescription(
                    `> **App:** <@${i.fields.getTextInputValue("id")}>`
                    + `\n> **Jméno:** \`${content.name}\``
                    + `\n> **Hodnost:** ${rolesIDs ? `<@&${rolesIDs[0]}>` : `\`${content.rank}\``}`
                    + `\n> **Odznak:** \`${content.badge}\``
                    + `\n> **Volačka:** \`${content.radio}\``
                    + "\n\n"
                    + `\n> **Hodin:** \`${Math.round((content.hours + Number.EPSILON) * 100) / 100}\``
                    + `\n> **Omluvenek:** \`${content.apologies.filter(a => !a.removed).length}\``
                    + `\n> **Povýšení:** ${time(rankUpDate, "R")}`
                )
                .setThumbnail(getServer(i.guild.id).footer.iconURL)
                .setColor(getServer(i.guild.id).color)
                .setFooter(getServer(i.guild.id).footer);
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("summary_" + i.fields.getTextInputValue("id"))
                        .setStyle(ButtonStyle.Success)
                        .setLabel("Souhrn")
                        .setEmoji("📑"),
                );
            await start.edit({ message: `<@${i.fields.getTextInputValue("id")}>`, embeds: [workerEmbed], components: [row] });
        }

        const rankup2Embed = new EmbedBuilder()
            .setTitle(newGrade >= oldGrade ? "Povýšení!" : "Degradace!")
            .setDescription(
                newGrade >= oldGrade ?
                    `Gratuluji <@${i.fields.getTextInputValue("id")}>, byl(a) jste povýšen(a).`
                    : `<@${i.fields.getTextInputValue("id")}>, byl(a) jste degradován(a).`
                    + `\nZkontrolujte si své nové údaje.`
            )
            .addFields([
                {
                    name: `Aktualizace`, inline: true,
                    value:
                        `> **Popis složky:** ${start ? "✅" : "❌"}`
                        + `\n> **Název složky:** ✅`
                        + `\n> **Přezdívka:** ${gotNick ? "✅" : "❌"}`
                        + `\n> **Role:** ${gotRole ? "✅" : "❌"}`
                        + (removedStrikes > 0 ? `\n> **Odebrány striky:** ${failedStrikes ? "❌" : "✅"} (${removedStrikes})` : "")
                        + (removedWarn ? `\n> **Odebrán warn:** ${failedWarn ? "❌" : "✅"}` : "")
                },
                {
                    name: `Aktuální údaje`, inline: true,
                    value:
                        `> **Jméno:** \`${content.name}\`\n`
                        + `> **Hodnost:** \`${i.fields.getTextInputValue("rank")}\`\n`
                        + `> **Volačka:** \`${i.fields.getTextInputValue("call")}\`\n`
                        + `> **Č. Odznaku:** \`${i.fields.getTextInputValue("badge")}\``
                }
            ])
            .setThumbnail(getServer(i.guild.id).footer.iconURL)
            .setColor(getServer(i.guild.id).color)
            .setFooter(getServer(i.guild.id).footer);
        await folder.send({ content: `<@${i.fields.getTextInputValue("id")}>` + (start ? "" : `<@${bot.LEA.o}>`), embeds: [rankup2Embed] });
        await folder.setName(`[${i.fields.getTextInputValue("call")}] ${content.name}`);
    }

    console.log(" < [DB/Rankup] >  " + i.member.displayName + ` ${newGrade >= oldGrade ? "povýšil" : "degradoval"}(a) [${content.radio}] ${content.name} na [${i.fields.getTextInputValue("call")}] ${content.name} (${i.fields.getTextInputValue("rank")})`);

    const rankupEmbed = new EmbedBuilder()
        .setTitle("Úspěch")
        .setDescription(
            `<@${i.fields.getTextInputValue("id")}> byl(a) ${newGrade >= oldGrade ? "povýšen" : "degradován"}(a)!`
            + `\n> **Popis složky:** ${start ? "✅" : "❌"}`
            + `\n> **Název složky:** ✅\n`
            + `\n> **Přezdívka:** ${gotNick ? "✅" : "❌"}`
            + `\n> **Role:** ${gotRole ? "✅" : "❌"}`
            + (removedStrikes > 0 ? `\n> **Odebrány striky:** ${failedStrikes ? "❌" : "✅"} (${removedStrikes})` : "")
            + (removedWarn ? `\n> **Odebrán warn:** ${failedWarn ? "❌" : "✅"}` : "")
        )
        .setColor(getServer(i.guild.id).color)
        .setFooter(getServer(i.guild.id).footer);

    await i.editReply({ embeds: [rankupEmbed], ephemeral: !visible });

    await dcLog(bot, i.guild.id, i.member,
        {
            title: `${newGrade >= oldGrade ? "Povýšení" : "Degradace"} v DB`,
            description:
                `**<@${i.user.id}> ${newGrade >= oldGrade ? "povýšil" : "degradoval"}(a) <@${i.fields.getTextInputValue("id")}> v DB.**`
                + `\n> **Jméno:** \`${content.name}\``
                + `\n> **Hodnost:** \`${oldContent.rank}\` -> \`${content.rank}\``
                + `\n> **Volačka:** \`${oldContent.radio}\` -> \`${content.radio}\``
                + `\n> **Odznak:** \`${oldContent.badge}\` -> \`${content.badge}\``,
            color: newGrade >= oldGrade ? "#0033ff" : "#ff9500"
        }
    );

    await simpleLog(bot, i.guild.id,
        {
            author: { name: member.displayName, iconURL: member.displayAvatarURL() },
            title: newGrade >= oldGrade ? "Povýšení" : "Degradace",
            description:
                `${oldContent.rank} ➤ **${content.rank}**`
                + `\n${oldContent.radio} ➤ **${content.radio}**`,
            color: newGrade >= oldGrade ? "#0033ff" : "#ff9500",
            footer: { text: i.member.displayName, iconURL: i.member.displayAvatarURL() }
        }
    );

    return;
}