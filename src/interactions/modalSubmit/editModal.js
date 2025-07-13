import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, InteractionType, ModalBuilder, TextInputBuilder, TextInputStyle, time } from "discord.js";
import fs from "fs";
import path from "path";
import { checkDB, checkEVENT, getDB, getServer } from "../../functions/db.js";
import { dcLog, simpleLog } from "../../functions/logSystem.js";

export default async function run(bot, i) {
    if (!(checkDB(i.fields.getTextInputValue("id"), i))) return i.reply({ content: "> 🛑 <@" + i.fields.getTextInputValue("id") + "> **není v DB.**", ephemeral: true });
    const gotDB = getDB(i.fields.getTextInputValue("id"));
    if (!bot.LEA.g[gotDB.guildName].includes(i.guild.id)) return i.reply({ content: `> 🛑 **<@${i.fields.getTextInputValue("id")}> je členem \`${gotDB.guildName}\`!** (Nemůžeš ho upravit)`, ephemeral: true });

    let member;
    try { member = await i.guild.members.fetch(i.fields.getTextInputValue("id")); }
    catch {
        return await i.editReply({
            content: "> 🛑 <@" + i.fields.getTextInputValue("id") + "> **není v DB.**",
            ephemeral: true
        });
    }

    const visible = i.customId.includes("_") ? (/true/).test(i.customId.split("_")[1]) : false;

    let content, oldRolesIDs, rolesIDs, tagID, gotNick = true, gotRole = true, newRank = i.fields.getTextInputValue("rank");
    if (i.guild.id === "1301163398515396668") { //LSPD
        content = JSON.parse(fs.readFileSync((path.resolve("./db/LSPD") + "/" + i.fields.getTextInputValue("id") + ".json"), "utf-8"));
        let folderExists = true;
        try { if (!(await i.guild.channels.fetch(content.folder))) folderExists = false; }
        catch { folderExists = false; }
        if (!folderExists) return i.reply({ content: "> 🛑 **Nebyla nalezena složka <@" + i.fields.getTextInputValue("id") + ">!**", ephemeral: true });

        if (newRank !== content.rank) {
            if (newRank === "Chief of Police") rolesIDs = ["1301163398595350582", "1301163398557339686"], tagID = "1394017573586341898";
            else if (newRank === "Assistant Chief of Police") rolesIDs = ["1301163398595350581", "1301163398557339686"], tagID = "1394017573586341898";
            else if (newRank === "Deputy Chief of Police") rolesIDs = ["1301163398595350580", "1301163398557339686"], tagID = "1394017573586341898";
            else if (newRank === "Commander") rolesIDs = ["1301163398595350578", "1301163398557339686"], tagID = "1394017573586341898";
            else if (newRank === "Captain") rolesIDs = ["1301163398557339688", "1301163398557339686"], tagID = "1394017573586341898";
            else if (newRank === "Lieutenant") rolesIDs = ["1301163398557339687", "1301163398557339686"], tagID = "1394017573586341898";
            else if (newRank === "Sergeant II") rolesIDs = ["1301163398557339685", "1301163398557339683"], tagID = "1394017606662619297";
            else if (newRank === "Sergeant I") rolesIDs = ["1301163398557339684", "1301163398557339683"], tagID = "1394017606662619297";
            else if (newRank === "Police Officer III+I") rolesIDs = ["1367967086365773956"], tagID = "1394017661620584578";
            else if (newRank === "Police Officer III") rolesIDs = ["1301163398557339681"], tagID = "1394017679207170059";
            else if (newRank === "Police Officer II") rolesIDs = ["1301163398557339680"], tagID = "1394017698236862466";
            else if (newRank === "Police Officer I") rolesIDs = ["1301163398557339679"], tagID = "1394017709552832612";
            else if (newRank === "Cadet") rolesIDs = ["1301163398540689497"], tagID = "1394017721641074810";
            else rolesIDs = false, tagID = false;
            if (!rolesIDs) return i.reply({ content: `> 🛑 **Neznámá hodnost... (\`${newRank}\`)**`, ephemeral: true });

            if (content.rank === "Chief of Police") oldRolesIDs = ["1301163398595350582", "1301163398557339686"];
            else if (content.rank === "Assistant Chief of Police") oldRolesIDs = ["1301163398595350581", "1301163398557339686"];
            else if (content.rank === "Deputy Chief of Police") oldRolesIDs = ["1301163398595350580", "1301163398557339686"];
            else if (content.rank === "Commander") oldRolesIDs = ["1301163398595350578", "1301163398557339686"];
            else if (content.rank === "Captain") oldRolesIDs = ["1301163398557339688", "1301163398557339686"];
            else if (content.rank === "Lieutenant") oldRolesIDs = ["1301163398557339687", "1301163398557339686"];
            else if (content.rank === "Sergeant II") oldRolesIDs = ["1301163398557339685", "1301163398557339683"];
            else if (content.rank === "Sergeant I") oldRolesIDs = ["1301163398557339684", "1301163398557339683"];
            else if (content.rank === "Police Officer III+I") oldRolesIDs = ["1367967086365773956"];
            else if (content.rank === "Police Officer III") oldRolesIDs = ["1301163398557339681"];
            else if (content.rank === "Police Officer II") oldRolesIDs = ["1301163398557339680"];
            else if (content.rank === "Police Officer I") oldRolesIDs = ["1301163398557339679"];
            else if (content.rank === "Cadet") oldRolesIDs = ["1301163398540689497"];
        }
    } else if (i.guild.id === "1385604665252642897") { //LSSD
        content = JSON.parse(fs.readFileSync((path.resolve("./db/LSSD") + "/" + i.fields.getTextInputValue("id") + ".json"), "utf-8"));
        let folderExists = true;
        try { if (!(await i.guild.channels.fetch(content.folder))) folderExists = false; }
        catch { folderExists = false; }
        if (!folderExists) return i.reply({ content: "> 🛑 **Nebyla nalezena složka <@" + i.fields.getTextInputValue("id") + ">!**", ephemeral: true });

        if (newRank !== content.rank) {
            if (newRank === "Sheriff") rolesIDs = ["1391525286021169185", "1391525298461347971"], tagID = "1391880113921982595";
            else if (newRank === "Undersheriff") rolesIDs = ["1391525287421804624", "1391525298461347971"], tagID = "1391880113921982595";
            else if (newRank === "Assistant Sheriff") rolesIDs = ["1391525289045266472", "1391525298461347971"], tagID = "1391880113921982595";
            else if (newRank === "Division Chief") rolesIDs = ["1391525291620307044", "1391525298461347971"], tagID = "1391880113921982595";
            else if (newRank === "Area Commander") rolesIDs = ["1391525292828524685", "1391525298461347971"], tagID = "1391880113921982595";
            else if (newRank === "Captain") rolesIDs = ["1391525295432929341", "1391525298461347971"], tagID = "1391880113921982595";
            else if (newRank === "Lieutenant") rolesIDs = ["1391525296385163334", "1391525298461347971"], tagID = "1391880113921982595";
            else if (newRank === "Sergeant") rolesIDs = ["1391525302638874794", "1391525303733452860"], tagID = "1391880138500608162";
            else if (newRank === "Deputy III") rolesIDs = ["1391525305134354634"], tagID = "1391880178694750218";
            else if (newRank === "Deputy II") rolesIDs = ["1391525306505887956"], tagID = "1391880192061865984";
            else if (newRank === "Deputy I") rolesIDs = ["1391525307550404799"], tagID = "1391880204988973077";
            else if (newRank === "Deputy Trainee") rolesIDs = ["1391525308628205662"], tagID = "1391880217613570269";
            else rolesIDs = false, tagID = false;
            if (!rolesIDs) return i.reply({ content: `> 🛑 **Neznámá hodnost... (\`${newRank}\`)**`, ephemeral: true });

            if (content.rank === "Sheriff") rolesIDs = ["1391525286021169185", "1391525298461347971"];
            else if (content.rank === "Undersheriff") rolesIDs = ["1391525287421804624", "1391525298461347971"];
            else if (content.rank === "Assistant Sheriff") rolesIDs = ["1391525289045266472", "1391525298461347971"];
            else if (content.rank === "Division Chief") rolesIDs = ["1391525291620307044", "1391525298461347971"];
            else if (content.rank === "Area Commander") rolesIDs = ["1391525292828524685", "1391525298461347971"];
            else if (content.rank === "Captain") rolesIDs = ["1391525295432929341", "1391525298461347971"];
            else if (content.rank === "Lieutenant") rolesIDs = ["1391525296385163334", "1391525298461347971"];
            else if (content.rank === "Sergeant") rolesIDs = ["1391525302638874794", "1391525303733452860"];
            else if (content.rank === "Deputy III") rolesIDs = ["1391525305134354634"];
            else if (content.rank === "Deputy II") rolesIDs = ["1391525306505887956"];
            else if (content.rank === "Deputy I") rolesIDs = ["1391525307550404799"];
            else if (content.rank === "Deputy Trainee") rolesIDs = ["1391525308628205662"];
        }
    } else if (i.guild.id === "xxx" /* MISSING ID */) { //SAHP
        content = JSON.parse(fs.readFileSync((path.resolve("./db/SAHP") + "/" + i.fields.getTextInputValue("id") + ".json"), "utf-8"));
        let folderExists = true;
        try { if (!(await i.guild.channels.fetch(content.folder))) folderExists = false; }
        catch { folderExists = false; }
        if (!folderExists) return i.reply({ content: "> 🛑 **Nebyla nalezena složka <@" + i.fields.getTextInputValue("id") + ">!**", ephemeral: true });

        if (newRank !== content.rank) {
            if (newRank === "Commissioner") rolesIDs = [/* MISSING IDs */], tagID = "xxx" /* MISSING ID */;
            else if (newRank === "Deputy Commissioner") rolesIDs = [/* MISSING IDs */], tagID = "xxx" /* MISSING ID */;
            else if (newRank === "Assistant Commissioner") rolesIDs = [/* MISSING IDs */], tagID = "xxx" /* MISSING ID */;
            else if (newRank === "Chief") rolesIDs = [/* MISSING IDs */], tagID = "xxx" /* MISSING ID */;
            else if (newRank === "Assistant Chief") rolesIDs = [/* MISSING IDs */], tagID = "xxx" /* MISSING ID */;
            else if (newRank === "Captain") rolesIDs = [/* MISSING IDs */], tagID = "xxx" /* MISSING ID */;
            else if (newRank === "Lieutenant") rolesIDs = [/* MISSING IDs */], tagID = "xxx" /* MISSING ID */;
            else if (newRank === "Sergeant II") rolesIDs = [/* MISSING IDs */], tagID = "xxx" /* MISSING ID */;
            else if (newRank === "Sergeant I") rolesIDs = [/* MISSING IDs */], tagID = "xxx" /* MISSING ID */;
            else if (newRank === "Senior Trooper") rolesIDs = [/* MISSING IDs */], tagID = "xxx" /* MISSING ID */;
            else if (newRank === "Trooper III") rolesIDs = [/* MISSING IDs */], tagID = "xxx" /* MISSING ID */;
            else if (newRank === "Trooper II") rolesIDs = [/* MISSING IDs */], tagID = "xxx" /* MISSING ID */;
            else if (newRank === "Trooper I") rolesIDs = [/* MISSING IDs */], tagID = "xxx" /* MISSING ID */;
            else if (newRank === "Trooper Trainee") rolesIDs = [/* MISSING IDs */], tagID = "xxx" /* MISSING ID */;
            else rolesIDs = false, tagID = false;

            if (!rolesIDs) return i.reply({ content: `> 🛑 **Neznámá hodnost... (\`${newRank}\`)**`, ephemeral: true });

            if (content.rank === "Commissioner") oldRolesIDs = [/* MISSING IDs */];
            else if (content.rank === "Deputy Commissioner") oldRolesIDs = [/* MISSING IDs */];
            else if (content.rank === "Assistant Commissioner") oldRolesIDs = [/* MISSING IDs */];
            else if (content.rank === "Chief") oldRolesIDs = [/* MISSING IDs */];
            else if (content.rank === "Assistant Chief") oldRolesIDs = [/* MISSING IDs */];
            else if (content.rank === "Captain") oldRolesIDs = [/* MISSING IDs */];
            else if (content.rank === "Lieutenant") oldRolesIDs = [/* MISSING IDs */];
            else if (content.rank === "Sergeant II") oldRolesIDs = [/* MISSING IDs */];
            else if (content.rank === "Sergeant I") oldRolesIDs = [/* MISSING IDs */];
            else if (content.rank === "Senior Trooper") oldRolesIDs = [/* MISSING IDs */];
            else if (content.rank === "Trooper III") oldRolesIDs = [/* MISSING IDs */];
            else if (content.rank === "Trooper II") oldRolesIDs = [/* MISSING IDs */];
            else if (content.rank === "Trooper I") oldRolesIDs = [/* MISSING IDs */];
            else if (content.rank === "Trooper Trainee") oldRolesIDs = [/* MISSING IDs */];
        }
    }

    await i.deferReply({ ephemeral: !visible });

    let changed = { name: false, badge: false, radio: false, rank: false },
        old = { name: content.name, badge: content.badge, radio: content.radio, rank: content.rank };
    if (i.fields.getTextInputValue("name") !== content.name) changed.name = true;
    if (parseInt(i.fields.getTextInputValue("badge")) !== content.badge) changed.badge = true;
    if (i.fields.getTextInputValue("call") !== content.radio) changed.radio = true;
    if (i.fields.getTextInputValue("rank") !== content.rank) changed.rank = true;

    await dcLog(bot, i.guild.id, i.member,
        {
            title: "Úprava v DB",
            description:
                `**<@${i.user.id}> upravil(a) <@${i.fields.getTextInputValue("id")}> v DB.**`
                + "\n" + (changed.name ? `> **Jméno:** \`${old.name}\` -> \`${i.fields.getTextInputValue("name")}\`` : `> **Jméno:** \`${content.name}\``)
                + "\n" + (changed.rank ? `> **Hodnost:** \`${old.rank}\` -> \`${i.fields.getTextInputValue("rank")}\`` : `> **Hodnost:** \`${content.rank}\``)
                + "\n" + (changed.radio ? `> **Volačka:** \`${old.radio}\` -> \`${i.fields.getTextInputValue("call")}\`` : `> **Volačka:** \`${content.radio}\``)
                + "\n" + (changed.badge ? `> **Odznak:** \`${old.badge}\` -> \`${i.fields.getTextInputValue("badge")}\`` : `> **Odznak:** \`${content.badge}\``),
            color: "#fcba03"
        }
    );

    console.log(" < [DB/Edit] >  " + i.member.displayName + ` upravil(a) [${content.radio}] ${content.name} na [${i.fields.getTextInputValue("call")}] ${i.fields.getTextInputValue("name")} (${i.fields.getTextInputValue("rank")})`);

    if (changed.name) content.name = i.fields.getTextInputValue("name");
    if (changed.badge) content.badge = parseInt(i.fields.getTextInputValue("badge"));
    if (changed.radio) content.radio = i.fields.getTextInputValue("call");
    if (changed.rank) content.rank = i.fields.getTextInputValue("rank");

    let workersPath;
    if (bot.LEA.g.LSPD.includes(i.guild.id)) workersPath = (path.resolve("./db/LSPD") + "/" + i.fields.getTextInputValue("id") + ".json");
    else if (bot.LEA.g.LSSD.includes(i.guild.id)) workersPath = (path.resolve("./db/LSSD") + "/" + i.fields.getTextInputValue("id") + ".json");
    else if (bot.LEA.g.SAHP.includes(i.guild.id)) workersPath = (path.resolve("./db/SAHP") + "/" + i.fields.getTextInputValue("id") + ".json");

    fs.writeFileSync(
        workersPath,
        JSON.stringify(content, null, 4)
    );

    if (changed.name || changed.radio) try { await member.setNickname(`[${content.radio}] ${content.name}`); } catch { gotNick = false; }
    if (changed.rank) try { await member.roles.remove(oldRolesIDs); } catch { gotRole = false; }
    if (changed.rank) try { await member.roles.add(rolesIDs); } catch { gotRole = false; }

    if (content.folder) {
        const folder = await i.guild.channels.fetch(content.folder);

        if (folder.archived) folder.setArchived(false, "otevření složky z neaktivity");
        const start = await folder.fetchStarterMessage({ force: true });

        if (changed.rank && tagID) await folder.setAppliedTags([tagID]);

        if (start) {
            const rankUpDateArr = content.rankups[content.rankups.length - 1].date.split(". ");
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
            .setTitle("Úprava!")
            .setDescription(
                (changed.name ? `> **Jméno:** \`${old.name}\` -> \`${content.name}\`` : `> **Jméno:** \`${content.name}\``)
                + "\n" + (changed.rank ? `> **Hodnost:** \`${old.rank}\` -> **__\`${content.rank}\`__**` : `> **Hodnost:** \`${content.rank}\``)
                + "\n" + (changed.radio ? `> **Volačka:** \`${old.radio}\` -> **__\`${content.radio}\`__**` : `> **Volačka:** \`${content.radio}\``)
                + "\n" + (changed.badge ? `> **Odznak:** \`${old.badge}\` -> **__\`${content.badge}\`__**` : `> **Odznak:** \`${content.badge}\``)
            )
            .setColor(getServer(i.guild.id).color)
            .setFooter(getServer(i.guild.id).footer);
        await folder.send({ content: `<@${i.fields.getTextInputValue("id")}>` + (start ? "" : `<@${bot.LEA.o}>`), embeds: [rankup2Embed] });
        if (changed.name || changed.radio) await folder.setName(`[${i.fields.getTextInputValue("call")}] ${content.name}`);

        const rankupEmbed = new EmbedBuilder()
            .setTitle("Úspěch")
            .setDescription(
                `<@${i.fields.getTextInputValue("id")}> byl(a) upravena(a)!`)
            .setColor(getServer(i.guild.id).color)
            .setFooter(getServer(i.guild.id).footer);

        await i.editReply({ embeds: [rankupEmbed], ephemeral: !visible });
    }

}