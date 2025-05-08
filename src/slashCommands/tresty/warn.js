import { EmbedBuilder } from "discord.js";
import { checkDB, getServer } from "../../functions/db.js";

export default async function run(bot, i) {
    const admin = i.member,
        discord = i.options.getUser("discord");
    let found = false, alreadyWarned = false;

    if (checkDB(discord.id)) found = true;
    if (!found) return i.reply({ content: `> 🛑 **<@${discord.id}> není členem LEA.**`, ephemeral: true });

    const member = await i.guild.members.fetch(discord.id),
        server = getServer(i.guild.id),
        role = bot.LEA.r[server.name]?.warn,
        channel = bot.LEA.ch[server.name]?.warns;

    if (!role || !i.guild.roles.fetch(role))
        return i.reply({ content: `> 🛑 **Role warnu je pro ${server.name} neplatná.**`, ephemeral: true });
    if (!channel || !i.guild.channels.fetch(channel))
        return i.reply({ content: `> 🛑 **Kanál warnů je pro ${server.name} neplatný.**`, ephemeral: true });

    if (member.roles.cache.has(role)) alreadyWarned = true;
    if (!alreadyWarned) member.roles.add(role);

    const warnEmbed = new EmbedBuilder()
        .setAuthor({ name: admin.displayName, iconURL: admin.displayAvatarURL() })
        .setTitle("Warn ⚠️")
        .setDescription(
            `> **Officer:** <@${discord.id}>`
            + `\n> **Číslo:** ${alreadyWarned ? "2" : "1"}/2`
            + `\n> **Důvod:** ${i.options.getString("duvod")}`
            + `\n> **Nadřízený:** <@${admin.id}>`
        )
        .setColor("#ffcc4d")
        .setFooter({ text: `${server.name}`, iconURL: bot.LEA.i[server.name] })
        .setTimestamp();
    let warnsChannel = await i.guild.channels.fetch(channel);
    await warnsChannel.send({ content: `<@${admin.id}> udělil(a) **warn** <@${discord.id}>`, embeds: [warnEmbed] });

    const visible = i.options.getBoolean("visible") || false;
    let hide = false;
    if (i.channel.id === channel) hide = true;

    await i.reply({
        content: `> ✅ **Udělen ${alreadyWarned ? "2." : "1."} warn <@${discord.id}>**`,
        ephemeral: hide ? true : !visible
    });
    if (alreadyWarned) await i.followUp({
        content: `> ⚠️ **Tohle byl už 2. warn <@${discord.id}>**`,
        ephemeral: hide ? true : !visible
    });
    return;
};