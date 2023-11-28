import { ActionRowBuilder, ActivityType, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { checkApologies } from "../../src/functions/outdated.js";

export default async function (bot) {
    console.log(` < [DC/Invite] >  https://discord.com/oauth2/authorize?client_id=${bot.user.id}&permissions=274878221376&scope=bot%20applications.commands`);

    bot.user.setPresence({ activities: [{ name: "Sloužit a chránit!", type: ActivityType.Listening }], status: "online", afk: false });

    checkApologies(bot);

    /*bot.guilds.cache.forEach(async (guild) => {
    const me = await guild.members.fetchMe();
    if (me.nickname !== "LEA Bot") me.setNickname("LEA Bot");
    });*/

    /*const server = await bot.guilds.fetch("1139266097921675345");
    const kanal = await server.channels.fetch("1139311793555116172");

    const vlakna = await kanal.threads.fetchActive();
    console.log(vlakna)
    console.log(vlakna.threads.first())
    vlakna.threads.forEach(async (t) => {
        if (t.joinable && !t.joined) await t.join(); console.log(` < [DT] >  thread ${t.name} joined`);
    });*/

    /*ORIENTACE V NÁVODU
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setLabel("Vytvoření složky")
                .setURL("https://discord.com/channels/1139266097921675345/1170795599164080228/1170797004595666984")
                .setStyle(ButtonStyle.Link)
                .setEmoji("📂"),
        )
        .addComponents(
            new ButtonBuilder()
                .setLabel("Zapsání duty")
                .setURL("https://discord.com/channels/1139266097921675345/1170795599164080228/1170798279534071900")
                .setStyle(ButtonStyle.Link)
                .setEmoji("🕑"),
        )
        .addComponents(
            new ButtonBuilder()
                .setLabel("Zápis omluvenky")
                .setURL("https://discord.com/channels/1139266097921675345/1170795599164080228/1170799102120960071")
                .setStyle(ButtonStyle.Link)
                .setEmoji("🙏"),
        );

    const server = await bot.guilds.fetch("1139266097921675345");
    const kanal = await server.channels.fetch("1139311793555116172");
    const vlakno = await kanal.threads.fetch("1170795599164080228");
    console.log(vlakno);
    const member = await server.members.fetch("411436203330502658");
    const navodEmbed = new EmbedBuilder()
        .setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() })
        .setTitle("Revoluce zápisů")
        .setDescription("Klikni na tlačítko pro přesun na daný návod.")
        .setThumbnail("https://i.imgur.com/xgFoKuX.png")
        .setColor(getServer(i).color)
        .setFooter({ text: "SAHP | Vytvořil b1ngo ✌️", iconURL: bot.LEA.i.SAHP });
    await vlakno.send({ embeds: [navodEmbed], components: [row] });*/

    console.log(" < [PS/Info] >  Discord bot operational!");
}