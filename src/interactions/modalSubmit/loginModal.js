import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, InteractionType, ModalBuilder, TextInputBuilder, TextInputStyle, time } from "discord.js";
import fs from "fs";
import path from "path";
import { checkDB, checkEVENT, getDB, getServer } from "../../functions/db.js";
import { dcLog, simpleLog } from "../../functions/logSystem.js";
import { findWorker } from "../../functions/profiles.js";

export default async function run(bot, i) {
    const rank = i.fields.getTextInputValue("rank"),
        name = i.fields.getTextInputValue("name"),
        radio = i.fields.getTextInputValue("call"),
        badge = i.fields.getTextInputValue("badge");
    const bl = JSON.parse(fs.readFileSync(path.resolve("./db/blacklist.json"), "utf-8"));

    const visible = i.customId.includes("_") ? (/true/).test(i.customId.split("_")[1]) : false;

    //Checks
    if (checkDB(i.fields.getTextInputValue("id"), i))
        return i.reply({ content: "> 🛑 <@" + i.fields.getTextInputValue("id") + "> **už je v DB.**", ephemeral: true });
    if (bl.some(e => !e.removed && e.id === i.fields.getTextInputValue("id")))
        return i.reply({ content: `> 🛑 <@${i.fields.getTextInputValue("id")}> **je na blacklistu!**`, ephemeral: true });
    if (!radio.includes("-") || !/^\p{Lu}/u.test(radio))
        return i.reply({
            content:
                `> 🛑 **Formát volacího znaku (\`${radio}\`) není správný!**`
                + "\nPravidla:"
                + "\n- Musí obsahovat `-`"
                + "\n- Musí začínat velkým písmenem",
            ephemeral: true
        });
    if (await findWorker("badge", badge))
        return i.reply({ content: `> 🛑 **Číslo odznaku \`${badge}\` už je obsazené!**`, ephemeral: true });
    if (await findWorker("radio", radio))
        return i.reply({ content: `> 🛑 **Volací znak \`${radio}\` už je obsazený!**`, ephemeral: true });

    let post = false, gotNick = true, gotRole = true, folders;
    const today = new Date();
    if (i.guild.id === "xxx" /* MISSING ID */) { //LSPD
        folders = await i.guild.channels.fetch(/* MISSING ID */);
        try { var member = await i.guild.members.fetch(i.fields.getTextInputValue("id")); }
        catch (e) { await i.reply({ content: "> 🛑 **Člen nebyl nalezen.**", ephemeral: true }); return console.log(e); }

        let rolesIDs, tagID;
        if (rank === "Chief of Police") rolesIDs = [/* MISSING IDs */], tagID = "xxx" /* MISSING ID */;
        else if (rank === "Assistant Chief of Police") rolesIDs = [/* MISSING IDs */], tagID = "xxx" /* MISSING ID */;
        else if (rank === "Deputy Chief of Police") rolesIDs = [/* MISSING IDs */], tagID = "xxx" /* MISSING ID */;
        else if (rank === "Commander") rolesIDs = [/* MISSING IDs */], tagID = "xxx" /* MISSING ID */;
        else if (rank === "Captain") rolesIDs = [/* MISSING IDs */], tagID = "xxx" /* MISSING ID */;
        else if (rank === "Lieutenant") rolesIDs = [/* MISSING IDs */], tagID = "xxx" /* MISSING ID */;
        else if (rank === "Sergeant II") rolesIDs = [/* MISSING IDs */], tagID = "xxx" /* MISSING ID */;
        else if (rank === "Sergeant I") rolesIDs = [/* MISSING IDs */], tagID = "xxx" /* MISSING ID */;
        else if (rank === "Police Officer III+I") rolesIDs = [/* MISSING IDs */], tagID = "xxx" /* MISSING ID */;
        else if (rank === "Police Officer III") rolesIDs = [/* MISSING IDs */], tagID = "xxx" /* MISSING ID */;
        else if (rank === "Police Officer II") rolesIDs = [/* MISSING IDs */], tagID = "xxx" /* MISSING ID */;
        else if (rank === "Police Officer I") rolesIDs = [/* MISSING IDs */], tagID = "xxx" /* MISSING ID */;
        else if (rank === "Cadet") rolesIDs = [/* MISSING IDs */], tagID = "xxx" /* MISSING ID */;
        else rolesIDs = false, tagID = false;

        if (!rolesIDs) return i.reply({ content: `> 🛑 **Neznámá hodnost... (\`${rank}\`)**`, ephemeral: true });
        rolesIDs.push("xxx" /* MISSING ID */); //LSPD role

        await i.deferReply({ ephemeral: !visible });

        const workerEmbed = new EmbedBuilder()
            .setAuthor({ name: `[${radio}] ${name}`, iconURL: member.displayAvatarURL() })
            .setDescription(
                `> **App:** <@${member.id}>`
                + `\n> **Jméno:** \`${name}\``
                + `\n> **Hodnost:** <@&${rolesIDs[0]}>`
                + `\n> **Odznak:** \`${badge}\``
                + `\n> **Volačka:** \`${radio}\``
                + "\n\n"
                + `\n> **Hodin:** \`0\``
                + `\n> **Omluvenek:** \`0\``
                + `\n> **Povýšení:** ${time(today, "R")}`
            )
            .setThumbnail(bot.LEA.i.LSPD)
            .setColor(bot.LEA.c.LSPD)
            .setFooter({ text: `LSPD | LEA-Bot v${bot.version} 💫`, iconURL: bot.LEA.i.LSPD });
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("summary_" + member.id)
                    .setStyle(ButtonStyle.Success)
                    .setLabel("Souhrn")
                    .setEmoji("📑"),
            );
        post = await folders.threads.create({
            name: `[${radio}] ${name}`,
            message: {
                content: `<@${member.id}>`,
                embeds: [workerEmbed],
                components: [row]
            },
            appliedTags: [tagID],
            reason: "Registrace od " + i.user.tag
        });

        try { await member.setNickname(`[${radio}] ${name}`); } catch { gotNick = false; }
        try { await member.roles.add(rolesIDs); } catch { gotRole = false; }

        const slozkaEmbed = new EmbedBuilder()
            .setTitle("Vítejte ve Vaší složce!")
            .setDescription(
                `<@${member.id}>, gratulujeme Vám k úspěšnému přijetí na hodnost <@&${rolesIDs[0]}>.`
                + "\n\n**Zde si povinně zapisujete časy služeb a případné omluvenky.**"
                + "\n\nZápis probíhá pomocí bota **LEA-Bot**."
                + "\n**Službu si zapisujete pomocí </duty:1170376396678377595> a omluvenku přes </omluvenka:1170382276492800131>.**"
                + "\n\nV případě problémů, použijte <#MISSING ID> nebo kontaktujte <@411436203330502658>."
            )
            .setThumbnail(bot.LEA.i.LSPD)
            .setColor(getServer(i.guild.id).color)
            .setFooter({ text: `LEA-Bot v${bot.version} 💫`, iconURL: bot.user.avatarURL() });
        await post.send({ content: `<@${member.id}>`, embeds: [slozkaEmbed] });
    } else if (i.guild.id === "1154446248934387828") { //LSSD
        folders = await i.guild.channels.fetch("1290050353793994814");
        try { var member = await i.guild.members.fetch(i.fields.getTextInputValue("id")); }
        catch (e) { await i.reply({ content: "> 🛑 **Člen nebyl nalezen.**", ephemeral: true }); console.log(e); }

        let rolesIDs, tagID;
        if (rank === "Sheriff") rolesIDs = ["1154446249005690910"], tagID = "1203829217167409192";
        else if (rank === "Undersheriff") rolesIDs = ["1154446248967938187"], tagID = "1203829217167409192";
        else if (rank === "Assistant Sheriff") rolesIDs = ["1154446248967938186"], tagID = "1203829217167409192";
        else if (rank === "Division Chief") rolesIDs = ["1154446248967938185"], tagID = "1203829217167409192";
        else if (rank === "Area Commander") rolesIDs = ["1312853345806979092"], tagID = "1203829217167409192";
        else if (rank === "Captain") rolesIDs = ["1154446248967938183"], tagID = "1203829217167409192";
        else if (rank === "Lieutenant") rolesIDs = ["1267588047533248583"], tagID = "1203829217167409192";
        else if (rank === "Sergeant") rolesIDs = ["1267587700240809994", "1267588695909728348"], tagID = "1203829180232630362";
        else if (rank === "Deputy III") rolesIDs = ["1267542148102750238"], tagID = "1203829143234551898";
        else if (rank === "Deputy II") rolesIDs = ["1267589547462754385"], tagID = "1203829113240952904";
        else if (rank === "Deputy I") rolesIDs = ["1267589491405754369"], tagID = "1203829081100001311";
        else if (rank === "Deputy Trainee") rolesIDs = ["1267589609378812129"], tagID = "1203829031049367593";
        else rolesIDs = false, tagID = false;

        if (!rolesIDs) return i.reply({ content: `> 🛑 **Neznámá hodnost... (\`${rank}\`)**`, ephemeral: true });
        rolesIDs.push("1267590027496652961"); //LSSD role

        await i.deferReply({ ephemeral: !visible });

        const workerEmbed = new EmbedBuilder()
            .setAuthor({ name: `[${radio}] ${name}`, iconURL: member.displayAvatarURL() })
            .setDescription(
                `> **App:** <@${member.id}>`
                + `\n> **Jméno:** \`${name}\``
                + `\n> **Hodnost:** <@&${rolesIDs[0]}>`
                + `\n> **Odznak:** \`${badge}\``
                + `\n> **Volačka:** \`${radio}\``
                + "\n\n"
                + `\n> **Hodin:** \`0\``
                + `\n> **Omluvenek:** \`0\``
                + `\n> **Povýšení:** ${time(today, "R")}`
            )
            .setThumbnail(bot.LEA.i.LSSD)
            .setColor(bot.LEA.c.LSSD)
            .setFooter({ text: `LSSD | LEA-Bot v${bot.version} 💫`, iconURL: bot.LEA.i.LSSD });
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("summary_" + member.id)
                    .setStyle(ButtonStyle.Success)
                    .setLabel("Souhrn")
                    .setEmoji("📑"),
            );
        post = await folders.threads.create({
            name: `[${radio}] ${name}`,
            message: {
                content: `<@${member.id}>`,
                embeds: [workerEmbed],
                components: [row]
            },
            appliedTags: [tagID],
            reason: "Registrace od " + i.user.tag
        });

        try { await member.setNickname(`[${radio}] ${name}`); } catch { gotNick = false; }
        try { await member.roles.add(rolesIDs); } catch { gotRole = false; }

        const slozkaEmbed = new EmbedBuilder()
            .setTitle("Vítejte ve Vaší složce!")
            .setDescription(
                `<@${member.id}>, gratulujeme Vám k úspěšnému přijetí na hodnost <@&${rolesIDs[0]}>.`
                + "\n\n**Zde si povinně zapisujete časy služeb a případné omluvenky.**"
                + "\n\nZápis probíhá pomocí bota **LEA-Bot**."
                + "\n**Službu si zapisujete pomocí </duty:1170376396678377595> a omluvenku přes </omluvenka:1170382276492800131>.**"
                + "\n\nV případě problémů, použijte <#1203634831284772864> nebo kontaktujte <@411436203330502658>."
            )
            .setThumbnail(bot.LEA.i.LSSD)
            .setColor(getServer(i.guild.id).color)
            .setFooter({ text: `LEA-Bot v${bot.version} 💫`, iconURL: bot.user.avatarURL() });
        await post.send({ content: `<@${member.id}>`, embeds: [slozkaEmbed] });
    } else if (i.guild.id === "1301163398515396668") { //SAHP
        folders = await i.guild.channels.fetch("1301228299858481162");
        try { var member = await i.guild.members.fetch(i.fields.getTextInputValue("id")); }
        catch (e) { await i.reply({ content: "> 🛑 **Člen nebyl nalezen.**", ephemeral: true }); console.log(e); }

        let rolesIDs, tagID;
        if (rank === "Commissioner") rolesIDs = ["1301163398595350582", "1301163398557339686"], tagID = "1304980716693487618";
        else if (rank === "Deputy Commissioner") rolesIDs = ["1301163398595350581", "1301163398557339686"], tagID = "1304980716693487618";
        else if (rank === "Assistant Commissioner") rolesIDs = ["1301163398595350580", "1301163398557339686"], tagID = "1304980716693487618";
        else if (rank === "Chief") rolesIDs = ["1301163398595350578", "1301163398557339686"], tagID = "1304980716693487618";
        else if (rank === "Assistant Chief") rolesIDs = ["1301165286954635344", "1301163398557339686"], tagID = "1304980716693487618";
        else if (rank === "Captain") rolesIDs = ["1301163398557339688", "1301163398557339686"], tagID = "1304980716693487618";
        else if (rank === "Lieutenant") rolesIDs = ["1301163398557339687", "1301163398557339686"], tagID = "1304980716693487618";
        else if (rank === "Sergeant II") rolesIDs = ["1301163398557339685", "1301163398557339683"], tagID = "1304980780182798438";
        else if (rank === "Sergeant I") rolesIDs = ["1301163398557339684", "1301163398557339683"], tagID = "1304980780182798438";
        else if (rank === "Trooper III") rolesIDs = ["1301163398557339681"], tagID = "1304980812646842421";
        else if (rank === "Trooper II") rolesIDs = ["1301163398557339680"], tagID = "1304980828375486524";
        else if (rank === "Trooper I") rolesIDs = ["1301163398557339679"], tagID = "1304980853318746182";
        else if (rank === "Trooper Trainee") rolesIDs = ["1301163398540689497"], tagID = "1304980877234929694";
        else rolesIDs = false, tagID = false;

        if (!rolesIDs) return i.reply({ content: `> 🛑 **Neznámá hodnost... (\`${rank}\`)**`, ephemeral: true });
        rolesIDs.push("1301163398540689496"); //SAHP role

        await i.deferReply({ ephemeral: !visible });

        const workerEmbed = new EmbedBuilder()
            .setAuthor({ name: `[${radio}] ${name}`, iconURL: member.displayAvatarURL() })
            .setDescription(
                `> **App:** <@${member.id}>`
                + `\n> **Jméno:** \`${name}\``
                + `\n> **Hodnost:** <@&${rolesIDs[0]}>`
                + `\n> **Odznak:** \`${badge}\``
                + `\n> **Volačka:** \`${radio}\``
                + "\n\n"
                + `\n> **Hodin:** \`0\``
                + `\n> **Omluvenek:** \`0\``
                + `\n> **Povýšení:** ${time(today, "R")}`
            )
            .setThumbnail(bot.LEA.i.SAHP)
            .setColor(bot.LEA.c.SAHP)
            .setFooter({ text: `SAHP | LEA-Bot v${bot.version} 💫`, iconURL: bot.LEA.i.SAHP });
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("summary_" + member.id)
                    .setStyle(ButtonStyle.Success)
                    .setLabel("Souhrn")
                    .setEmoji("📑"),
            );
        post = await folders.threads.create({
            name: `[${radio}] ${name}`,
            message: {
                content: `<@${member.id}>`,
                embeds: [workerEmbed],
                components: [row]
            },
            appliedTags: [tagID],
            reason: "Registrace od " + i.user.tag
        });

        try { await member.setNickname(`[${radio}] ${name}`); } catch { gotNick = false; }
        try { await member.roles.add(rolesIDs); } catch { gotRole = false; }
        if (i.guild.id === "1301163398515396668" && rank === "Trooper Trainee") //Odebrat roli Akademika pro SAHP
            try {
                await member.roles.remove([
                    "1302389194836148226", //Akademik
                    "1302351904562483200", //1. výcvik
                    "1302352056727765053", //2. výcvik
                ]);
            } catch { gotRole = false; }

        const slozkaEmbed = new EmbedBuilder()
            .setTitle("Vítejte ve Vaší složce!")
            .setDescription(
                `<@${member.id}>, gratulujeme Vám k úspěšnému přijetí na hodnost <@&${rolesIDs[0]}>.`
                + "\n\n**Zde si povinně zapisujete časy služeb a případné omluvenky.**"
                + "\n\nZápis probíhá pomocí bota **LEA-Bot**."
                + "\n**Službu si zapisujete pomocí </duty:1170376396678377595> a omluvenku přes </omluvenka:1170382276492800131>.**"
                + "\n\nV případě problémů, použijte <#1301163401527169068> nebo kontaktujte <@411436203330502658>."
            )
            .setThumbnail(bot.LEA.i.SAHP)
            .setColor(getServer(i.guild.id).color)
            .setFooter({ text: `LEA-Bot v${bot.version} 💫`, iconURL: bot.user.avatarURL() });
        await post.send({ content: `<@${member.id}>`, embeds: [slozkaEmbed] });
    }

    const worker = {
        "active": true,
        "badge": parseInt(i.fields.getTextInputValue("badge")),
        "name": i.fields.getTextInputValue("name"),
        "radio": i.fields.getTextInputValue("call"),
        "rank": i.fields.getTextInputValue("rank"),
        "folder": post ? post.id : null,
        "hours": 0,
        "duties": [],
        "apologies": [],
        "reputations": [],
        "rankups": [
            {
                "date": today.getDate() + ". " + (parseInt(today.getMonth()) + 1) + ". " + today.getFullYear(),
                "to": i.fields.getTextInputValue("rank"),
                "from": null,
                "boss": i.member.displayName,
                "hours": 0
            }
        ]
    };

    let workersPath;
    if (bot.LEA.g.LSPD.includes(i.guild.id)) workersPath = (path.resolve("./db/LSPD") + "/" + i.fields.getTextInputValue("id") + ".json");
    else if (bot.LEA.g.LSSD.includes(i.guild.id)) workersPath = (path.resolve("./db/LSSD") + "/" + i.fields.getTextInputValue("id") + ".json");
    else if (bot.LEA.g.SAHP.includes(i.guild.id)) workersPath = (path.resolve("./db/SAHP") + "/" + i.fields.getTextInputValue("id") + ".json");
    else return i.editReply({ content: "> 🛑 **Tenhle server není uveden a seznamu.**\nKontaktuj majitele (viz. </menu:1170376396678377596>).", ephemeral: true });

    fs.writeFileSync(
        workersPath,
        JSON.stringify(worker, null, 4)
    );

    console.log(" < [DB/Login] >  " + i.member.displayName + " zaregistroval(a) [" + i.fields.getTextInputValue("call") + "] " + i.fields.getTextInputValue("name") + " do DB");

    const loginEmbed = new EmbedBuilder()
        .setTitle("Složka vytvořena!")
        .setDescription(
            `<@${i.fields.getTextInputValue("id")}> byl(a) přihlášen(a) do systému.`
            + (post ? `\n> **Složka:** <#${post.id}>` : "\n> **Složka:** ✅")
            + "\n> **Přezdívka:** " + (gotNick ? "✅" : "❌")
            + "\n> **Role:** " + (gotRole ? "✅" : "❌")
            + "\n> **Databáze:** ✅"
        )
        .setColor(getServer(i.guild.id).color)
        .setFooter(getServer(i.guild.id).footer);

    await i.editReply({ embeds: [loginEmbed], ephemeral: !visible });

    await dcLog(bot, i.guild.id, i.member,
        {
            title: "Přidání do DB",
            description:
                `**<@${i.user.id}> přidal(a) <@${i.fields.getTextInputValue("id")}> do DB.**`
                + `\n> **Jméno:** \`${i.fields.getTextInputValue("name")}\``
                + `\n> **Hodnost:** \`${i.fields.getTextInputValue("rank")}\``
                + `\n> **Volačka:** \`${i.fields.getTextInputValue("call")}\``
                + `\n> **Odznak:** \`${i.fields.getTextInputValue("badge")}\``,
            color: "#00ff0d"
        }
    );

    await simpleLog(bot, i.guild.id,
        {
            author: { name: `[${i.fields.getTextInputValue("call")}] ${i.fields.getTextInputValue("name")}`, iconURL: member.displayAvatarURL() },
            title: "Přijetí",
            color: "#00ff0d",
            footer: { text: i.member.displayName, iconURL: i.member.displayAvatarURL() }
        }
    );

    return;
}