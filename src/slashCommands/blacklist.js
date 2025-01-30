import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import fs from "fs";
import path from "path";
import { checkDB, getServer } from "../functions/db.js";
import { dcLog, simpleLog } from "../../src/functions/logSystem.js";

export const slash = new SlashCommandBuilder()
    .setName("blacklist")
    .setDescription(`Správa blacklistu`)
    .addSubcommand(subcommand =>
        subcommand
            .setName('add')
            .setDescription("Přidat blacklist záznam")
            .addStringOption(option =>
                option.setName("reason")
                    .setDescription("Důvod přidání na blacklist")
                    .setRequired(true)
                    .setMaxLength(100))
            .addUserOption(option =>
                option.setName("discord")
                    .setDescription("Přidat Discord uživatele")
                    .setRequired(false))
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('edit')
            .setDescription("Upravit blacklist záznam")
            .addIntegerOption(option =>
                option.setName("id")
                    .setDescription("ID blacklist záznamu")
                    .setRequired(true))
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('remove')
            .setDescription("Odebrat blacklist záznam")
            .addIntegerOption(option =>
                option.setName("id")
                    .setDescription("ID blacklist záznamu")
                    .setRequired(true))
    )
    .setContexts([0])
    .setIntegrationTypes([0])
    .setNSFW(false);

export default async function run(bot, i) {
    const sub = i.options._subcommand;

    let passed = false;
    await i.guild.fetch();
    const admin = await i.member;
    if (admin.id === "411436203330502658") passed = true; //PetyXbron / b1ngo
    if (bot.LEA.g.LSPD.includes(i.guild.id) && !passed) {
        if (admin.roles.cache.has("xxx" /* MISSING ID */)) passed = true; //Leadership
    } else if (bot.LEA.g.LSSD.includes(i.guild.id) && !passed) {
        if (admin.roles.cache.has("1267541873451339806")) passed = true; //Leadership
        if (admin.roles.cache.has("1251504025610747966")) passed = true; //FTO Commander
    } else if (bot.LEA.g.SAHP.includes(i.guild.id) && !passed) {
        if (admin.roles.cache.has("1301163398557339686")) passed = true; //Leadership
    }

    if (!passed) return i.reply({ content: "> 🛑 **K tomuhle má přístup jen admin.**", ephemeral: true });

    if (sub === "add") {
        let record, blUser, blMember, blReason, blDate;
        blUser = i.options.getUser("discord"),
            blReason = i.options.getString("reason"),
            blDate = new Date();

        if (blUser) {
            await i.deferReply();
            blMember = await i.guild.members.fetch(blUser.id).catch(() => null);
            record = {
                "removed": false,
                "name": blMember ? blMember.displayName : "",
                "displayName": blUser.displayName,
                "username": blUser.username,
                "id": blUser.id,
                "from": {
                    "dep": getServer(i.guild.id).name,
                    "name": i.member.displayName,
                    "username": i.user.tag,
                    "displayName": i.user.displayName,
                    "id": i.user.id,
                    "timestamp": (blDate.getDate() + ". " + (parseInt(blDate.getMonth()) + 1) + ". " + blDate.getFullYear()),
                    "reason": blReason
                }
            };
        } else {
            const modal = new ModalBuilder()
                .setCustomId("blModal")
                .setTitle("LEA | Blacklist");

            const usernameInput = new TextInputBuilder()
                .setCustomId("discordUsername")
                .setLabel("Discord username pachatele")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("petyxbron")
                .setMinLength(3)
                .setRequired(false);

            const displaynameInput = new TextInputBuilder()
                .setCustomId("discordDisplayname")
                .setLabel("Discord displayname pachatele")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("PetyXbron")
                .setMinLength(3)
                .setRequired(false);

            const ICnameInput = new TextInputBuilder()
                .setCustomId("ICname")
                .setLabel("IC jméno pachatele")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("Tyler Pierce")
                .setRequired(false);

            const dateInput = new TextInputBuilder()
                .setCustomId("date")
                .setLabel("Datum blacklistu")
                .setStyle(TextInputStyle.Short)
                .setValue(blDate.getDate() + ". " + (parseInt(blDate.getMonth()) + 1) + ". " + blDate.getFullYear())
                .setMinLength(10)
                .setMaxLength(12)
                .setRequired(false);

            const actionRow0 = new ActionRowBuilder().addComponents(usernameInput);
            const actionRow1 = new ActionRowBuilder().addComponents(displaynameInput);
            const actionRow2 = new ActionRowBuilder().addComponents(ICnameInput);
            const actionRow3 = new ActionRowBuilder().addComponents(dateInput);

            modal.addComponents(actionRow0, actionRow1, actionRow2, actionRow3);

            await i.showModal(modal);

            var submit = await i.awaitModalSubmit({
                filter: int => int.user.id === i.user.id,
                time: 600000
            }).catch(() => {
                return;
            });

            if (submit) {
                await submit.deferReply();
                var bl_discordUsername = submit.fields.getTextInputValue("discordUsername"),
                    bl_discordDisplayname = submit.fields.getTextInputValue("discordDisplayname"),
                    bl_ICname = submit.fields.getTextInputValue("ICname");

                var bl_date = submit.fields.getTextInputValue("date");

                record = {
                    "removed": false,
                    "name": bl_ICname,
                    "displayName": bl_discordDisplayname,
                    "username": bl_discordUsername,
                    "id": "",
                    "from": {
                        "dep": getServer(i.guild.id).name,
                        "name": i.member.displayName,
                        "username": i.user.tag,
                        "displayName": i.user.displayName,
                        "id": i.user.id,
                        "timestamp": bl_date,
                        "reason": blReason
                    }
                };
            } else return;
        }

        const bl = JSON.parse(fs.readFileSync(path.resolve("./db/blacklist.json"), "utf-8"));
        if (record) bl.push(record); //TODO: check this!! record is always true
        else return;

        fs.writeFileSync(path.resolve("./db/blacklist.json"), JSON.stringify(bl, null, 4), "utf-8");

        const blEmbed = new EmbedBuilder()
            .setTitle("Nový blacklist záznam")
            .setDescription(
                `${blUser ? `<@${blUser.id}>` : `\`${bl_discordUsername}\``} byl(a) přidán(a) na blacklist.`
            )
            .setColor(getServer(i.guild.id).color)
            .setFooter(getServer(i.guild.id).footer);

        if (submit) await submit.editReply({ embeds: [blEmbed] });
        else await i.editReply({ embeds: [blEmbed] });

        await dcLog(bot, i.guild.id, i.member,
            {
                title: "Nový blacklist záznam",
                description:
                    `**<@${i.user.id}> přidal(a) ${blUser ? `<@${blUser.id}>` : `\`${bl_discordUsername}\``} na BL.**`
                    + `\`\`\`json\n${JSON.stringify(record, null, 4)}\`\`\``,
                color: "#000000"
            }
        );

        await simpleLog(bot, i.guild.id,
            {
                author: { name: blUser ? blUser.tag : bl_discordUsername, iconURL: blMember ? blMember.displayAvatarURL() : `https://cdn.discordapp.com/embed/avatars/${Math.floor(Math.random() * 6)}.png` },
                title: "Přidání na blacklist",
                color: "#000000",
                footer: { text: i.member.displayName, iconURL: i.member.displayAvatarURL() }
            }
        );

        return;
    }

    if (sub === "edit") {
        let passed = false;
        if (admin.id === "411436203330502658") passed = true; //PetyXbron / b1ngo
        if (admin.id === "644571265725628437") passed = true; //griffin0s
        if (admin.id === "885611486758719498") passed = true; //ceffel

        const blacklist = JSON.parse(fs.readFileSync(path.resolve("./db/blacklist.json"), "utf-8"));
        const blID = i.options.getInteger("id");
        let bl = blacklist[blID - 1];
        if (!bl) return i.reply({ content: `> 🛑 **Záznam s tímto ID (\`${blID}\`) nebyl nalezen.**`, ephemeral: true });
        if (!passed) {
            if (record.from.id !== i.user.id)
                return i.reply({ content: "> 🛑 **Tenhle záznam jsi nevytvořil, proto ho nemůžeš upravit!**", ephemeral: true });
        }

        let blDate = new Date();

        const modal = new ModalBuilder()
            .setCustomId("blModal")
            .setTitle("LEA | Blacklist");

        const usernameInput = new TextInputBuilder()
            .setCustomId("discordUsername")
            .setLabel("Discord username pachatele")
            .setStyle(TextInputStyle.Short)
            .setValue(bl.username || "")
            .setPlaceholder(bl.username || "petyxbron")
            .setMinLength(3)
            .setRequired(false);

        const displaynameInput = new TextInputBuilder()
            .setCustomId("discordDisplayname")
            .setLabel("Discord displayname pachatele")
            .setStyle(TextInputStyle.Short)
            .setValue(bl.displayName || "")
            .setPlaceholder(bl.displayName || "PetyXbron")
            .setMinLength(3)
            .setRequired(false);

        const ICnameInput = new TextInputBuilder()
            .setCustomId("ICname")
            .setLabel("IC jméno pachatele")
            .setStyle(TextInputStyle.Short)
            .setValue(bl.name || "")
            .setPlaceholder(bl.name || "Tyler Pierce")
            .setRequired(false);

        const dateInput = new TextInputBuilder()
            .setCustomId("date")
            .setLabel("Datum blacklistu")
            .setStyle(TextInputStyle.Short)
            .setValue(bl.from.timestamp || "")
            .setPlaceholder(bl.from.timestamp || (blDate.getDate() + ". " + (parseInt(blDate.getMonth()) + 1) + ". " + blDate.getFullYear()))
            .setMinLength(10)
            .setMaxLength(12)
            .setRequired(false);

        const reasonInput = new TextInputBuilder()
            .setCustomId("reason")
            .setLabel("Důvod blacklistu")
            .setStyle(TextInputStyle.Short)
            .setValue(bl.from.reason || "")
            .setPlaceholder(bl.from.reason || "")
            .setMaxLength(100)
            .setRequired(true);

        const actionRow0 = new ActionRowBuilder().addComponents(usernameInput);
        const actionRow1 = new ActionRowBuilder().addComponents(displaynameInput);
        const actionRow2 = new ActionRowBuilder().addComponents(ICnameInput);
        const actionRow3 = new ActionRowBuilder().addComponents(dateInput);
        const actionRow4 = new ActionRowBuilder().addComponents(reasonInput);

        modal.addComponents(actionRow0, actionRow1, actionRow2, actionRow3, actionRow4);

        await i.showModal(modal);

        var submit = await i.awaitModalSubmit({
            filter: int => int.user.id === i.user.id,
            time: 600000
        }).catch(() => {
            return;
        });

        if (submit) {
            await submit.deferReply();
            var bl_discordUsername = submit.fields.getTextInputValue("discordUsername"),
                bl_discordDisplayname = submit.fields.getTextInputValue("discordDisplayname"),
                bl_ICname = submit.fields.getTextInputValue("ICname"),
                bl_date = submit.fields.getTextInputValue("date"),
                bl_reason = submit.fields.getTextInputValue("reason");

            bl = {
                "removed": bl.removed,
                "name": bl_ICname,
                "displayName": bl_discordDisplayname,
                "username": bl_discordUsername,
                "id": bl.id,
                "from": {
                    "dep": getServer(i.guild.id).name,
                    "name": i.member.displayName,
                    "username": i.user.tag,
                    "displayName": i.user.displayName,
                    "id": i.user.id,
                    "timestamp": bl_date,
                    "reason": bl_reason
                }
            };
        } else return;

        if (bl) blacklist[blID - 1] = bl;
        else return;

        fs.writeFileSync(path.resolve("./db/blacklist.json"), JSON.stringify(blacklist, null, 4), "utf-8");

        const blEmbed = new EmbedBuilder()
            .setTitle("Blacklist záznam upraven!")
            .setDescription(
                `${bl_discordUsername} byl(a) upraven(a) na blacklistu (ID \`${blID}\`).`
            )
            .setColor(getServer(i.guild.id).color)
            .setFooter(getServer(i.guild.id).footer);

        await dcLog(bot, i.guild.id, i.member,
            {
                title: "Blacklist úprava",
                description:
                    `**<@${i.user.id}> upravil blacklist záznam \`${blID}\`**`
                    + `\nAktualizovaný záznam:`
                    + `\`\`\`json\n${JSON.stringify(bl, null, 4)}\`\`\``,
                color: "#000000"
            }
        );

        if (submit) return await submit.editReply({ embeds: [blEmbed] });
        else return await i.editReply({ embeds: [blEmbed] });
    }

    if (sub === "remove") {
        let passed = false;
        if (admin.id === "411436203330502658") passed = true; //PetyXbron / b1ngo

        const blacklist = JSON.parse(fs.readFileSync(path.resolve("./db/blacklist.json"), "utf-8"));
        const blID = i.options.getInteger("id");
        let bl = blacklist[blID - 1];
        if (!bl) return i.reply({ content: `> 🛑 **Záznam s tímto ID (\`${blID}\`) nebyl nalezen.**`, ephemeral: true });
        if (!passed) {
            if (bl.from.id !== i.user.id)
                return i.reply({ content: "> 🛑 **Tenhle záznam jsi nevytvořil, proto ho nemůžeš smazat!**", ephemeral: true });
        }

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('confirmBlacklistDelete')
                    .setLabel('Opravdu smazat')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🛑'),
            );
        const rpl = await i.reply({ content: "> ⚠️ **Zkontroluj si blacklist `" + bl.username + "`. Opravdu chceš blacklist záznam smazat?** *(30s na odpověď)*", ephemeral: true, components: [row] });

        const filter = i => i.customId === 'confirmBlacklistDelete' && i.user.id === admin.id;

        const collector = rpl.createMessageComponentCollector({
            filter, max: 1, time: 30000
        });

        collector.on('collect', async _ => {
            bl.removed = true;
            blacklist[blID - 1] = bl;
            fs.writeFileSync(path.resolve("./db/blacklist.json"), JSON.stringify(blacklist, null, 4), "utf-8");

            const blEmbed = new EmbedBuilder()
                .setTitle("Blacklist záznam smazán!")
                .setDescription(
                    `\`${bl.username}\` byl(a) smazán(a) z blacklistu (ID \`${blID}\`).`
                )
                .setColor(getServer(i.guild.id).color)
                .setFooter(getServer(i.guild.id).footer);

            await rpl.edit({ embeds: [blEmbed], content: "", components: [] });

            await dcLog(bot, i.guild.id, i.member,
                {
                    title: "Blacklist smazán",
                    description:
                        `**<@${i.user.id}> upravil blacklist záznam \`${blID}\`**`
                        + `\nZáznam:`
                        + `\`\`\`json\n${JSON.stringify(bl, null, 4)}\`\`\``,
                    color: "#000000"
                }
            );

            await simpleLog(bot, i.guild.id,
                {
                    author: { name: bl.username, iconURL: `https://cdn.discordapp.com/embed/avatars/${Math.floor(Math.random() * 6)}.png` },
                    title: "Odebrání z blacklistu",
                    color: "#000000",
                    footer: { text: i.member.displayName, iconURL: i.member.displayAvatarURL() }
                }
            );

            return;
        });
    }
}