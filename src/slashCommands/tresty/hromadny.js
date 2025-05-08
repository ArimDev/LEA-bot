import { EmbedBuilder } from "discord.js";
import { checkDB, getServer } from "../../functions/db.js";
import { findWorker } from "../../functions/profiles.js";

export default async function run(bot, i) {
    const admin = i.member,
        input = i.options.getString("officer"),
        trest = i.options.getString("trest");

    const officers = input.split(", ");
    const discords = [], fault = [];
    for (let officer of officers) {
        const data =
            (checkDB(officer) ? officer : false)
            || (await findWorker("radio", officer))?.id
            || (await findWorker("badge", parseInt(officer)))?.id;
        if (data)
            discords.push(data);
        else
            fault.push(officer);
    }

    const server = getServer(i.guild.id);

    if (trest === "strike") {
        const roleStrike1 = bot.LEA.r[server.name]?.strike1,
            roleStrike2 = bot.LEA.r[server.name]?.strike2,
            roleWarn = bot.LEA.r[server.name]?.warn,
            channelWarn = bot.LEA.ch[server.name]?.warns;

        if (
            !roleStrike1 || !i.guild.roles.fetch(roleStrike1)
            || !roleStrike2 || !i.guild.roles.fetch(roleStrike2)
            || !roleWarn || !i.guild.roles.fetch(roleWarn)
        )
            return i.reply({ content: `> 🛑 **Role trestů ${server.name} jsou neplatné.**`, ephemeral: true });
        if (!channelWarn || !i.guild.channels.fetch(channelWarn))
            return i.reply({ content: `> 🛑 **Kanál warnů je pro ${server.name} neplatný.**`, ephemeral: true });

        const visible = i.options.getBoolean("visible") || false;
        let hide = false;
        if (i.channel.id === channelWarn) hide = true;
        await i.deferReply({ ephemeral: hide ? true : !visible });

        const firstStrike = [], secondStrike = [], notStriked = [];
        for (const discord of discords) {
            const member = await i.guild.members.fetch(discord);
            if (!member.roles.cache.has(roleStrike1)) {
                member.roles.add(roleStrike1);
                if (!member.roles.cache.has(roleStrike2)) {
                    firstStrike.push(`<@${member.id}>`); continue;
                }
            }

            if (!member.roles.cache.has(roleStrike2)) {
                member.roles.add(roleStrike2);
                secondStrike.push(`<@${member.id}>`);
            } else {
                if (member.roles.cache.has(roleStrike1)) member.roles.remove(roleStrike1);
                if (member.roles.cache.has(roleStrike2)) member.roles.remove(roleStrike2);
                notStriked.push(`<@${member.id}>`);
            }
        }

        const warned = [], notWarned = [];
        for (const member of notStriked) {
            if (!member.roles.cache.has(roleWarn)) {
                member.roles.add(roleWarn);
                warned.push(`<@${member.id}>`);
            }
            else notWarned.push(`<@${member.id}>`);
        }

        const channel = await i.guild.channels.fetch(channelWarn);

        if (firstStrike.length > 0) {
            const strikeEmbed = new EmbedBuilder()
                .setAuthor({ name: admin.displayName, iconURL: admin.displayAvatarURL() })
                .setTitle("Strike 🎳")
                .setDescription(
                    `> **Officeři:** ${firstStrike.join(", ")}`
                    + `\n> **Číslo:** 1/2`
                    + `\n> **Důvod:** ${i.options.getString("duvod")}`
                    + `\n> **Nadřízený:** <@${admin.id}>`
                )
                .setColor("#ccd6dd")
                .setFooter({ text: `${server.name}`, iconURL: bot.LEA.i[server.name] })
                .setTimestamp();
            await channel.send({ content: `<@${admin.id}> udělil(a) **strike** officerům ${firstStrike.join(", ")}`, embeds: [strikeEmbed] });
        }

        if (secondStrike.length > 0) {
            const strikeEmbed = new EmbedBuilder()
                .setAuthor({ name: admin.displayName, iconURL: admin.displayAvatarURL() })
                .setTitle("Strike 🎳")
                .setDescription(
                    `> **Officeři:** ${secondStrike.join(", ")}`
                    + `\n> **Číslo:** 2/2`
                    + `\n> **Důvod:** ${i.options.getString("duvod")}`
                    + `\n> **Nadřízený:** <@${admin.id}>`
                )
                .setColor("#ccd6dd")
                .setFooter({ text: `${server.name}`, iconURL: bot.LEA.i[server.name] })
                .setTimestamp();
            await channel.send({ content: `<@${admin.id}> udělil(a) **strike** officerům ${secondStrike.join(", ")}`, embeds: [strikeEmbed] });
        }

        if (warned.length > 0) {
            const warnEmbed = new EmbedBuilder()
                .setAuthor({ name: admin.displayName, iconURL: admin.displayAvatarURL() })
                .setTitle("Warn ⚠️")
                .setDescription(
                    `> **Officeři:** ${warned.join(", ")}`
                    + `\n> **Číslo:** 1/2`
                    + `\n> **Důvod:** ${i.options.getString("duvod")}`
                    + `\n> **Nadřízený:** <@${admin.id}>`
                )
                .setColor("#ffcc4d")
                .setFooter({ text: `${server.name}`, iconURL: bot.LEA.i[server.name] })
                .setTimestamp();
            await channel.send({ content: `<@${admin.id}> udělil(a) **warn** officerům ${warned.join(", ")}`, embeds: [warnEmbed] });
        }

        if (notWarned.length > 0) {
            const warnEmbed = new EmbedBuilder()
                .setAuthor({ name: admin.displayName, iconURL: admin.displayAvatarURL() })
                .setTitle("Warn ⚠️")
                .setDescription(
                    `> **Officeři:** ${notWarned.join(", ")}`
                    + `\n> **Číslo:** 2/2`
                    + `\n> **Důvod:** ${i.options.getString("duvod")}`
                    + `\n> **Nadřízený:** <@${admin.id}>`
                )
                .setColor("#ffcc4d")
                .setFooter({ text: `${server.name}`, iconURL: bot.LEA.i[server.name] })
                .setTimestamp();
            await channel.send({ content: `<@${admin.id}> udělil(a) **warn** officerům ${notWarned.join(", ")}`, embeds: [warnEmbed] });
        }

        const resultEmbed = new EmbedBuilder()
            .setTitle("Detaily trestů")
            .setFields([
                { name: "1. strike", value: `${firstStrike.length}`, inline: true },
                { name: "2. strike", value: `${secondStrike.length}`, inline: true },
                { name: "1. warn", value: `${warned.length}`, inline: true },
                { name: "2. warn", value: `${notWarned.length > 0 ? notWarned.join(", ") : "N/A"}`, inline: false },
                { name: "Nenalezeni", value: `${fault.length > 0 ? fault.join(", ") : "N/A"}`, inline: false },
            ]);

        await i.editReply({
            content: `> ✅ **Tresty byly uděleny.**`,
            embeds: [resultEmbed],
            ephemeral: hide ? true : !visible
        });
        return;
    }
};