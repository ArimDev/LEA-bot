import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { checkDB, getServer } from "../functions/db.js";

export const slash = new SlashCommandBuilder()
    .setName("suspend")
    .setDescription(`Udělí suspend officerovi`)
    .addUserOption(option =>
        option.setName("discord")
            .setDescription("Discord officera")
            .setRequired(true))
    .addStringOption(option =>
        option.setName("doba")
            .setDescription("Doba trvání suspendu")
            .setRequired(true))
    .addStringOption(option =>
        option.setName("duvod")
            .setDescription("Důvod udělení suspendu")
            .setRequired(true))
    .addBooleanOption(option =>
        option.setName("visible")
            .setDescription("Má být odpověď na tuto interakci viditelná všem?")
            .setRequired(false))
    .setContexts([0])
    .setIntegrationTypes([0])
    .setNSFW(false);

export default async function run(bot, i) {
    let passed = false;
    await i.guild.fetch();
    const admin = i.member;
    if (admin.id === bot.LEA.o) passed = true; //PetyXbron / b1ngo
    if (bot.LEA.g.LSPD.includes(i.guild.id) && !passed) {
        if (admin.roles.cache.has("xxx" /* MISSING ID */)) passed = true; //Leadership
        if (admin.roles.cache.has("xxx" /* MISSING ID */)) passed = true; //Supervisor
    } else if (bot.LEA.g.LSSD.includes(i.guild.id) && !passed) {
        if (admin.roles.cache.has("1267541873451339806")) passed = true; //Leadership
        if (admin.roles.cache.has("1267588695909728348")) passed = true; //Supervisor
    } else if (bot.LEA.g.SAHP.includes(i.guild.id) && !passed) {
        if (admin.roles.cache.has("1301163398557339686")) passed = true; //Leadership
        if (admin.roles.cache.has("1301163398557339683")) passed = true; //Supervisor
    }

    if (!passed) return i.reply({ content: "> 🛑 **Warn může udělit pouze __Leadership__ nebo __Supervisor__**", ephemeral: true });

    const discord = i.options.getUser("discord");
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
    await suspendChannel.send({ content: `<@${admin.id}> <@${discord.id}>`, embeds: [suspendEmbed] });

    const visible = i.options.getBoolean("visible") || false;
    let hide = false;
    if (i.channel.id === channel) hide = true;

    return await i.reply({
        content: `> ✅ **Udělen suspend <@${discord.id}>**`,
        ephemeral: hide ? true : !visible
    });
};