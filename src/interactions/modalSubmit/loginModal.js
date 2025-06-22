import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, InteractionType, ModalBuilder, TextInputBuilder, TextInputStyle, time } from "discord.js";
import fs from "fs";
import path from "path";
import { checkDB, checkEVENT, getDB, getServer } from "../../functions/db.js";
import { dcLog, simpleLog } from "../../functions/logSystem.js";
import { findWorker } from "../../functions/profiles.js";

export default async function run(bot, i) {
    let rank = i.fields.getTextInputValue("rank"),
        name = i.fields.getTextInputValue("name"),
        radio = i.fields.getTextInputValue("call"),
        badge = i.fields.getTextInputValue("badge"),
        userId = i.fields.getTextInputValue("id");
    const bl = JSON.parse(fs.readFileSync(path.resolve("./db/blacklist.json"), "utf-8"));

    const visible = i.customId.includes("_") ? (/true/).test(i.customId.split("_")[1]) : false;

    let member, data = false;
    try { member = await i.guild.members.fetch(userId); }
    catch (e) { return await i.reply({ content: "> 🛑 **Člen nebyl nalezen.**", ephemeral: true }); }

    //Checks
    if (checkDB(userId, i)) {
        if (member.roles.cache.size > 1) // ? Ignoruje tohle i @everyone ?
            return i.reply({ content: "> 🛑 <@" + userId + "> **už je v DB.**", ephemeral: true });
        else {
            data = getDB(userId).data;
            if (rank === "x") rank = data.rank;
            if (name === "x") name = data.name;
            if (radio === "x") radio = data.radio;
            if (badge === "xxx") badge = data.badge;
        }
    }

    if (bl.some(e => !e.removed && e.id === userId))
        return i.reply({ content: `> 🛑 <@${userId}> **je na blacklistu!**`, ephemeral: true });
    if (!radio.includes("-") || !/^\p{Lu}/u.test(radio))
        return i.reply({
            content:
                `> 🛑 **Formát volacího znaku (\`${radio}\`) není správný!**`
                + "\nPravidla:"
                + "\n- Musí obsahovat `-`"
                + "\n- Musí začínat velkým písmenem",
            ephemeral: true
        });
    if (!data && await findWorker("badge", badge))
        return i.reply({ content: `> 🛑 **Číslo odznaku \`${badge}\` už je obsazené!**`, ephemeral: true });
    if (!data && await findWorker("radio", radio))
        return i.reply({ content: `> 🛑 **Volací znak \`${radio}\` už je obsazený!**`, ephemeral: true });

    let post = false, gotNick = true, gotRole = true, folders;
    const today = new Date();
    if (i.guild.id === "xxx" /* MISSING ID */) { //LSPD
        folders = await i.guild.channels.fetch(/* MISSING ID */);

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
                + `\n> **Hodin:** \`${data ? data.hours : "0"}\``
                + `\n> **Omluvenek:** \`${data ? data.apologies.filter(a => !a.removed).length : "0"}\``
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
            reason: (data ? "OBNOVA" : "") + "Registrace od " + i.user.tag
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
                + `\n\nV případě problémů, použijte <#MISSING ID> nebo kontaktujte <@${bot.LEA.o}>.`
            )
            .setThumbnail(bot.LEA.i.LSPD)
            .setColor(getServer(i.guild.id).color)
            .setFooter({ text: `LEA-Bot v${bot.version} 💫`, iconURL: bot.user.avatarURL() });
        await post.send({ content: `<@${member.id}>`, embeds: [slozkaEmbed] });
    } else if (i.guild.id === "1385604665252642897") { //LSSD
        folders = await i.guild.channels.fetch("1386379600795271451");

        let rolesIDs, tagID;
        if (rank === "Sheriff") rolesIDs = ["1385604665340854437"], tagID = "1386379896498163802";
        else if (rank === "Undersheriff") rolesIDs = ["1385604665340854436"], tagID = "1386379896498163802";
        else if (rank === "Assistant Sheriff") rolesIDs = ["1385604665340854435"], tagID = "1386379896498163802";
        else if (rank === "Division Chief") rolesIDs = ["1385604665340854433"], tagID = "1386379896498163802";
        else if (rank === "Area Commander") rolesIDs = ["1385604665328144475"], tagID = "1386379896498163802";
        else if (rank === "Captain") rolesIDs = ["1385604665328144473"], tagID = "1386379896498163802";
        else if (rank === "Lieutenant") rolesIDs = ["1385604665328144472"], tagID = "1386379896498163802";
        else if (rank === "Sergeant") rolesIDs = ["1385604665328144467", "1385604665328144466"], tagID = "1386380080577515530";
        else if (rank === "Deputy III") rolesIDs = ["1385604665315426384"], tagID = "1386380117164429543";
        else if (rank === "Deputy II") rolesIDs = ["1385604665315426383"], tagID = "1386380151566373007";
        else if (rank === "Deputy I") rolesIDs = ["1385604665315426382"], tagID = "1386380164266594474";
        else if (rank === "Deputy Trainee") rolesIDs = ["1385604665315426381"], tagID = "1386380174383255592";
        else rolesIDs = false, tagID = false;

        if (!rolesIDs) return i.reply({ content: `> 🛑 **Neznámá hodnost... (\`${rank}\`)**`, ephemeral: true });
        rolesIDs.push("1385604665315426380"); //LSSD role

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
                + `\n> **Hodin:** \`${data ? data.hours : "0"}\``
                + `\n> **Omluvenek:** \`${data ? data.apologies.filter(a => !a.removed).length : "0"}\``
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
            reason: (data ? "OBNOVA" : "") + "Registrace od " + i.user.tag
        });

        try { await member.setNickname(`[${radio}] ${name}`); } catch { gotNick = false; }
        try { await member.roles.add(rolesIDs); } catch { gotRole = false; }
        if (i.guild.id === "1385604665252642897" && rank === "Deputy Trainee") //Odebrat roli Akademika pro LSSD
            try {
                await member.roles.remove([
                    "1385976135933886526", //Akademik
                ]);
            } catch { gotRole = false; }

        const slozkaEmbed = new EmbedBuilder()
            .setTitle("Vítejte ve Vaší složce!")
            .setDescription(
                `<@${member.id}>, gratulujeme Vám k úspěšnému přijetí na hodnost <@&${rolesIDs[0]}>.`
                + "\n\n**Zde si povinně zapisujete časy služeb a případné omluvenky.**"
                + "\n\nZápis probíhá pomocí bota **LEA-Bot**."
                + "\n**Službu si zapisujete pomocí </duty:1170376396678377595> a omluvenku přes </omluvenka:1170382276492800131>.**"
                + `\n\nV případě problémů, použijte <#1385604666133319844> nebo kontaktujte <@${bot.LEA.o}>.`
            )
            .setThumbnail(bot.LEA.i.LSSD)
            .setColor(getServer(i.guild.id).color)
            .setFooter({ text: `LEA-Bot v${bot.version} 💫`, iconURL: bot.user.avatarURL() });
        await post.send({ content: `<@${member.id}>`, embeds: [slozkaEmbed] });
    } else if (i.guild.id === "1301163398515396668") { //SAHP
        folders = await i.guild.channels.fetch("1301228299858481162");

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
        else if (rank === "Senior Trooper") rolesIDs = ["1367967086365773956"], tagID = "1367968421651939378";
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
                + `\n> **Hodin:** \`${data ? data.hours : "0"}\``
                + `\n> **Omluvenek:** \`${data ? data.apologies.filter(a => !a.removed).length : "0"}\``
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
            reason: (data ? "OBNOVA" : "") + "Registrace od " + i.user.tag
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
                + `\n\nV případě problémů, použijte <#1301163401527169068> nebo kontaktujte <@${bot.LEA.o}>.`
            )
            .setThumbnail(bot.LEA.i.SAHP)
            .setColor(getServer(i.guild.id).color)
            .setFooter({ text: `LEA-Bot v${bot.version} 💫`, iconURL: bot.user.avatarURL() });
        await post.send({ content: `<@${member.id}>`, embeds: [slozkaEmbed] });
    }

    let workersPath, worker;
    if (bot.LEA.g.LSPD.includes(i.guild.id)) workersPath = (path.resolve("./db/LSPD") + "/" + userId + ".json");
    else if (bot.LEA.g.LSSD.includes(i.guild.id)) workersPath = (path.resolve("./db/LSSD") + "/" + userId + ".json");
    else if (bot.LEA.g.SAHP.includes(i.guild.id)) workersPath = (path.resolve("./db/SAHP") + "/" + userId + ".json");
    else return i.editReply({ content: "> 🛑 **Tenhle server není uveden na seznamu.**\nKontaktuj majitele (viz. </menu:1170376396678377596>).", ephemeral: true });

    if (!data) {
        worker = {
            "active": true,
            "badge": parseInt(badge),
            "name": name,
            "radio": radio,
            "rank": rank,
            "folder": post ? post.id : null,
            "hours": 0,
            "duties": [],
            "apologies": [],
            "reputations": [],
            "rankups": [
                {
                    "date": today.getDate() + ". " + (parseInt(today.getMonth()) + 1) + ". " + today.getFullYear(),
                    "to": rank,
                    "from": null,
                    "boss": i.member.displayName,
                    "hours": 0
                }
            ]
        };

        fs.writeFileSync(
            workersPath,
            JSON.stringify(worker, null, 4)
        );
    } else {
        worker = data;
        worker.folder = post ? post.id : null;

        fs.writeFileSync(
            workersPath,
            JSON.stringify(worker, null, 4)
        );
    }

    console.log(" < [DB/Login] >  " + i.member.displayName + ` ${data ? "obnovil(a)" : "zaregistroval(a)"} [` + radio + "] " + name + " do DB");

    const loginEmbed = new EmbedBuilder()
        .setTitle("Složka vytvořena!")
        .setDescription(
            `<@${userId}> byl(a) ${data ? "ZNOVU " : ""}přihlášen(a) do systému.`
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
            title: (data ? "Zpětné p" : "P") + "řidání do DB",
            description:
                `**<@${i.user.id}> přidal(a) <@${userId}> ${data ? "ZNOVU " : ""}do DB.**`
                + `\n> **Jméno:** \`${name}\``
                + `\n> **Hodnost:** \`${rank}\``
                + `\n> **Volačka:** \`${radio}\``
                + `\n> **Odznak:** \`${badge}\``,
            color: "#00ff0d"
        }
    );

    await simpleLog(bot, i.guild.id,
        {
            author: { name: `[${radio}] ${name}`, iconURL: member.displayAvatarURL() },
            title: "Přijetí" + (data ? " (znova)" : ""),
            color: "#00ff0d",
            footer: { text: i.member.displayName, iconURL: i.member.displayAvatarURL() }
        }
    );

    if (data) {
        await i.followUp({
            content:
                "👀 **Bot se nyní pokusí odeslat:**"
                + `\n> \`${worker.apologies.length}\` omluvenek`
                + `\n> \`${worker.duties.length}\` služeb`,
            ephemeral: !visible
        });
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
                .setFooter(getServer(i.guild.id).footer);

            const msg = await post.send({ embeds: [apologyEmbed]/*, components: [row]*/ });
            worker.apologies[index].id = msg.id;
        }
        for (const duty of worker.duties) {
            const index = worker.duties.indexOf(duty);
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("summary_" + userId)
                        .setStyle(ButtonStyle.Success)
                        .setEmoji("📑"),
                ).addComponents(
                    new ButtonBuilder()
                        .setCustomId("editButton_apology")
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji("✏️"),
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
                .setFooter(getServer(i.guild.id).footer);

            const msg = await post.send({ embeds: [dutyEmbed], components: [row] });
            worker.duties[index].id = msg.id;
        }
        await i.followUp({
            content:
                "✅ **Bot ukončil odesílání!**",
            ephemeral: !visible
        });
    }

    return;
}