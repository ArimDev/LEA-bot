import { EmbedBuilder } from "discord.js";
import { checkDB, getServer } from "../../functions/db.js";

export default async function run(bot, i) {
    const admin = i.member,
        discord = i.options.getUser("discord");
    let found = false, alreadyStriked = false;

    if (checkDB(discord.id)) found = true;
    if (!found) return i.reply({ content: `> 🛑 **<@${discord.id}> není členem LEA.**`, ephemeral: true });

    const member = await i.guild.members.fetch(discord.id),
        server = getServer(i.guild.id),
        role1 = bot.LEA.r[server.name]?.strike1,
        role2 = bot.LEA.r[server.name]?.strike2,
        channel = bot.LEA.ch[server.name]?.warns;

    if (!role1 || !role2 || !i.guild.roles.fetch(role1) || !i.guild.roles.fetch(role2))
        return i.reply({ content: `> 🛑 **Role striků je pro ${server.name} neplatné.**`, ephemeral: true });
    if (!channel || !i.guild.channels.fetch(channel))
        return i.reply({ content: `> 🛑 **Kanál warnů je pro ${server.name} neplatný.**`, ephemeral: true });

    if (member.roles.cache.has(role1))
        alreadyStriked = true;
    if (!alreadyStriked)
        member.roles.add(role1);
    else if (!member.roles.cache.has(role2))
        member.roles.add(role2);
    else
        return await i.reply({ content: `> 🛑 **<@${discord.id}> už má oba striky!**`, ephemeral: true });

    const strikeEmbed = new EmbedBuilder()
        .setAuthor({ name: admin.displayName, iconURL: admin.displayAvatarURL() })
        .setTitle("Strike 🎳")
        .setDescription(
            `> **Officer:** <@${discord.id}>`
            + `\n> **Číslo:** ${alreadyStriked ? "2" : "1"}/2`
            + `\n> **Důvod:** ${i.options.getString("duvod")}`
            + `\n> **Nadřízený:** <@${admin.id}>`
        )
        .setColor("#ccd6dd")
        .setFooter({ text: `${server.name}`, iconURL: bot.LEA.i[server.name] })
        .setTimestamp();
    let warnsChannel = await i.guild.channels.fetch(channel);
    await warnsChannel.send({ content: `<@${admin.id}> udělil(a) **strike** <@${discord.id}>`, embeds: [strikeEmbed] });

    const visible = i.options.getBoolean("visible") || false;
    let hide = false;
    if (i.channel.id === channel) hide = true;

    return await i.reply({
        content: `> ✅ **Udělen ${alreadyStriked ? "2." : "1."} strike <@${discord.id}>**`,
        ephemeral: hide ? true : !visible
    });
};