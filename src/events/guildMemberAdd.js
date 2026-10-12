import { EmbedBuilder } from "discord.js";

export default async function (bot, member) {
    if (member.guild.id !== "1557478892774625282") return;

    const channel = await member.guild.channels.fetch("1557478893957546039");
    const joinEmbed = new EmbedBuilder()
        .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
        .setDescription(`<@${member.id}> se připojil jako ${member.guild.memberCount}. člen.`)
        .setFooter({ text: `ID: ${member.id}` });

    await channel.send({ embeds: [joinEmbed] });
}
