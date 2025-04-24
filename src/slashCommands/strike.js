import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { checkDB, getServer } from "../functions/db.js";

export const slash = new SlashCommandBuilder()
    .setName("strike")
    .setDescription(`Udělí strike officerovi`)
    .addUserOption(option =>
        option.setName("discord")
            .setDescription("Discord officera")
            .setRequired(true))
    .addStringOption(option =>
        option.setName("duvod")
            .setDescription("Důvod udělení striku")
            .setRequired(true))
    .setContexts([0])
    .setIntegrationTypes([0])
    .setNSFW(false);

export default async function run(bot, i) {
    await i.deferReply();

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

    if (!passed) return i.editReply({ content: "> 🛑 **Strike může udělit pouze __Leadership__ nebo __Supervisor__**", ephemeral: true });

    const discord = i.options.getUser("discord");
    let found = false, alreadyStriked = false;

    if (checkDB(discord.id)) found = true;
    if (!found) return i.editReply({ content: `> 🛑 **<@${discord.id}> není členem LEA.**`, ephemeral: true });

    const member = await i.guild.members.fetch(discord.id),
        server = getServer(i.guild.id),
        role1 = bot.LEA.r[server.name]?.strike1,
        role2 = bot.LEA.r[server.name]?.strike2,
        channel = bot.LEA.ch[server.name]?.warns;

    if (!role1 || !role2 || !i.guild.roles.fetch(role1) || !i.guild.roles.fetch(role2))
        return i.editReply({ content: `> 🛑 **Role striků je pro ${server.name} neplatné.**`, ephemeral: true });
    if (!channel || !i.guild.channels.fetch(channel))
        return i.editReply({ content: `> 🛑 **Kanál warnů je pro ${server.name} neplatný.**`, ephemeral: true });

    if (member.roles.cache.has(role1))
        alreadyStriked = true;
    if (!alreadyStriked)
        member.roles.add(role1);
    else if (!member.roles.cache.has(role2))
        member.roles.add(role2);
    else
        return await i.editReply({ content: `> 🛑 **<@${discord.id}> už má oba striky!**` });

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
    await warnsChannel.send({ content: `<@${admin.id}> <@${discord.id}>`, embeds: [strikeEmbed] });

    return await i.editReply({ content: `> ✅ **Udělen ${alreadyStriked ? "2." : "1."} strike <@${discord.id}>**` });
};