import { EmbedBuilder } from "discord.js";
import { checkDB, getServer } from "../../functions/db.js";

export default async function run(bot, i) {
    const admin = i.member,
        discord = i.options.getUser("discord");
    let found = false, alreadySuspended = false;

    if (checkDB(discord.id)) found = true;
    if (!found) return i.reply({ content: `> 🛑 **<@${discord.id}> není členem LEA.**`, ephemeral: true });

    const member = await i.guild.members.fetch(discord.id),
        server = getServer(i.guild.id),
        role = bot.LEA.r[server.name]?.suspend,
        channel = bot.LEA.ch[server.name]?.suspends;

    if (!role || !i.guild.roles.fetch(role))
        return i.reply({ content: `> 🛑 **Role suspendu je pro ${server.name} neplatná.**`, ephemeral: true });
    if (!channel || !i.guild.channels.fetch(channel))
        return i.reply({ content: `> 🛑 **Kanál suspendů je pro ${server.name} neplatný.**`, ephemeral: true });

    if (member.roles.cache.has(role))
        alreadySuspended = true;
    if (!alreadySuspended)
        member.roles.add(role);
    else
        return await i.reply({ content: `> 🛑 **<@${discord.id}> už má jeden suspend!**`, ephemeral: true });

    const suspendEmbed = new EmbedBuilder()
        .setAuthor({ name: admin.displayName, iconURL: admin.displayAvatarURL() })
        .setTitle("Suspend ⛔")
        .setDescription(
            `> **Officer:** <@${discord.id}>`
            + `\n> **Doba:** ${i.options.getString("doba")}`
            + `\n> **Důvod:** ${i.options.getString("duvod")}`
            + `\n> **Nadřízený:** <@${admin.id}>`
        )
        .setColor("#be1931")
        .setFooter({ text: `${server.name}`, iconURL: bot.LEA.i[server.name] })
        .setTimestamp();
    let suspendChannel = await i.guild.channels.fetch(channel);
    await suspendChannel.send({ content: `<@${admin.id}> udělil(a) **suspend** <@${discord.id}>`, embeds: [suspendEmbed] });

    const visible = i.options.getBoolean("visible") || false;
    let hide = false;
    if (i.channel.id === channel) hide = true;

    return await i.reply({
        content: `> ✅ **Udělen suspend <@${discord.id}>**`,
        ephemeral: hide ? true : !visible
    });
};