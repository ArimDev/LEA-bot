import { ActionRowBuilder, AttachmentBuilder, EmbedBuilder, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import fs from "fs";
import path from "path";
import { checkDB, getServer } from "../functions/db.js";
import bl from "../../db/blacklist.json" assert { type: "json" };
import { dcLog } from "../../src/functions/logSystem.js";

export const slash = new SlashCommandBuilder()
    .setName("leader")
    .setDescription(`Různé příkazy obecné správy pro Leadership`)
    .addSubcommand(subcommand =>
        subcommand
            .setName('docházka')
            .setDescription("Kontrola absence")
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('blacklist')
            .setDescription("Správa blacklistu")
            .addStringOption(option =>
                option.setName("reason")
                    .setDescription("Důvod přidání na blacklist")
                    .setRequired(true))
            .addUserOption(option =>
                option.setName("discord")
                    .setDescription("Přidat Discord uživatele")
                    .setRequired(false))
    )
    .setDMPermission(false)
    .setNSFW(false);

export default async function run(bot, i) {
    const sub = i.options._subcommand;

    let passed = false;
    await i.guild.fetch();
    const admin = await i.member;
    if (admin.id === "411436203330502658") passed = true; //PetyXbron / b1ngo
    if (bot.LEA.g.LSPD.includes(i.guild.id) && !passed) {
        if (admin.id === "846451292388851722") passed = true; //aldix_eu
    } else if (bot.LEA.g.LSSD.includes(i.guild.id) && !passed) {
        if (admin.roles.cache.has("1139267137651884072")) passed = true; //Leadership
        if (admin.roles.cache.has("1139295201282764882")) passed = true; //FTO Commander
    }

    if (!passed) return i.reply({ content: "> 🛑 **K tomuhle má přístup jen admin.**", ephemeral: true });

    if (sub === "docházka") {
        const today = new Date();
        const modal = new ModalBuilder()
            .setCustomId("dochazkaModal")
            .setTitle("LEA | Docházka");

        const idInput = new TextInputBuilder()
            .setCustomId("eventID")
            .setLabel("ID události")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("1")
            .setMaxLength(5)
            .setRequired(true);

        const dateInput = new TextInputBuilder()
            .setCustomId("date")
            .setLabel("Datum")
            .setStyle(TextInputStyle.Short)
            .setValue(today.getDate() + ". " + (parseInt(today.getMonth()) + 1) + ". " + today.getFullYear())
            .setPlaceholder(today.getDate() + ". " + (parseInt(today.getMonth()) + 1) + ". " + today.getFullYear())
            .setMinLength(10)
            .setMaxLength(12)
            .setRequired(true);

        const ignoreInput = new TextInputBuilder()
            .setCustomId("ignore")
            .setLabel("Čísla odznaků zaměstnanců, které ignorovat")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("1012, 1035, 1036, 1037, 1050, 1061")
            .setRequired(false);

        const actionRow0 = new ActionRowBuilder().addComponents(idInput);
        const actionRow1 = new ActionRowBuilder().addComponents(dateInput);
        const actionRow2 = new ActionRowBuilder().addComponents(ignoreInput);

        modal.addComponents(actionRow0, actionRow1, actionRow2);

        await i.showModal(modal);

        let submit = await i.awaitModalSubmit({ filter: int => int.user.id === i.user.id, time: 600000 }).catch(e => {
            return null;
        });

        if (submit) {
            await submit.deferReply({ ephemeral: true });

            const id = parseInt(submit.fields.getTextInputValue("eventID"));
            const ignored = submit.fields.getTextInputValue("ignore").split(", ");
            const eventDateArr = submit.fields.getTextInputValue("date").split(". ");
            const eventDate = new Date(eventDateArr[1] + "/" + eventDateArr[0] + "/" + eventDateArr[2]);

            let users = [], db;
            if (bot.LEA.g.LSPD.includes(i.guild.id)) db = fs.readdirSync(path.resolve("./db/LSPD")).filter(file => file.endsWith(".json") && file !== "000000000000000001.json");
            else if (bot.LEA.g.LSSD.includes(i.guild.id)) db = fs.readdirSync(path.resolve("./db/LSSD")).filter(file => file.endsWith(".json") && file !== "000000000000000001.json");
            for (const file of db) {
                let worker;
                if (bot.LEA.g.LSPD.includes(i.guild.id)) worker = JSON.parse(fs.readFileSync((path.resolve("./db/LSPD") + "/" + file), "utf-8"));
                else if (bot.LEA.g.LSSD.includes(i.guild.id)) worker = JSON.parse(fs.readFileSync((path.resolve("./db/LSSD") + "/" + file), "utf-8"));

                let m;
                try {
                    m = await i.guild.members.fetch(file.split(".")[0]);
                } catch (e) {
                    m = false;
                }

                if (m) {
                    const ap = worker.apologies;
                    let apologized = false;
                    if (worker.badge < 1015) apologized = true;
                    if (ignored.includes(worker.badge.toString())) apologized = true;
                    if (m.roles.cache.has("1139267137651884072")) apologized = true;
                    if (!apologized) for (const a of ap) {
                        if (a.eventID === id) {
                            apologized = true;
                        } else {
                            const startDateArr = a.start.split(". ");
                            const startDate = new Date(startDateArr[1] + "/" + startDateArr[0] + "/" + startDateArr[2]);
                            const endDateArr = a.end.split(". ");
                            const endDate = new Date(endDateArr[1] + "/" + endDateArr[0] + "/" + endDateArr[2]);
                            if (eventDate.getTime() >= startDate.getTime() && eventDate <= endDate.getTime()) {
                                apologized = true;
                            }
                        }
                    }

                    if (!apologized) {
                        worker.id = file.split(".")[0];
                        users.push(worker);
                    }
                }
            }

            users.sort((a, b) => a.badge - b.badge);
            let mentions = [], list = [];
            for (const u of users) {
                mentions.push(`<@${u.id}>`);
            }
            const mentionsAtt = new AttachmentBuilder(Buffer.from(mentions.join(", ")), { name: "mentions.txt" });

            for (const u of users) {
                list.push(`[${u.radio}] ${u.name} [${u.badge}] | ${u.id}`);
            }
            const listAtt = new AttachmentBuilder(Buffer.from(list.join("\n")), { name: "list.txt" });

            await submit.editReply({
                files: [listAtt, mentionsAtt],
                ephemeral: true
            });
        }
    }

    if (sub === "blacklist") {
        let record, blUser, blMember, blReason, blDate;
        blUser = i.options.getUser("discord"),
            blReason = i.options.getString("reason"),
            blDate = new Date();

        if (blUser) {
            await i.deferReply();
            blMember = await i.guild.members.fetch(blUser.id).then(() => true).catch(() => false);
            record = {
                "name": blMember?.displayName || "",
                "displayName": blUser.displayName,
                "username": blUser.username,
                "id": blUser.id,
                "from": {
                    "dep": getServer(i.guild.id).name,
                    "name": i.member.displayName,
                    "username": i.user.username,
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

            /*const idInput = new TextInputBuilder()
                .setCustomId("discordID")
                .setLabel("Discord ID pachatele")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("83886770768314368")
                .setMinLength(15)
                .setRequired(false);*/

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
                .setPlaceholder("24. 12. 2024")
                .setMinLength(10)
                .setMaxLength(12)
                .setRequired(false);

            /*const actionRow0 = new ActionRowBuilder().addComponents(idInput);*/
            const actionRow0 = new ActionRowBuilder().addComponents(usernameInput);
            const actionRow1 = new ActionRowBuilder().addComponents(displaynameInput);
            const actionRow2 = new ActionRowBuilder().addComponents(ICnameInput);
            const actionRow3 = new ActionRowBuilder().addComponents(dateInput);

            modal.addComponents(actionRow0, actionRow1, actionRow2, actionRow3);

            await i.showModal(modal);

            var submit = await i.awaitModalSubmit({ filter: int => int.user.id === i.user.id, time: 600000 }).catch(e => {
                return null;
            });

            if (submit) {
                await submit.deferReply();
                var /*bl_discordID = submit.fields.getTextInputValue("discordID"),*/
                    bl_discordUsername = submit.fields.getTextInputValue("discordUsername"),
                    bl_discordDisplayname = submit.fields.getTextInputValue("discordDisplayname"),
                    bl_ICname = submit.fields.getTextInputValue("ICname");

                var bl_date = submit.fields.getTextInputValue("date")

                record = {
                    "name": bl_ICname,
                    "displayName": bl_discordDisplayname,
                    "username": bl_discordUsername,
                    "id": "",
                    "from": {
                        "dep": getServer(i.guild.id).name,
                        "name": i.member.displayName,
                        "username": i.user.username,
                        "displayName": i.user.displayName,
                        "id": i.user.id,
                        "timestamp": bl_date,
                        "reason": blReason
                    }
                };
            }
        }

        bl.push(record);

        fs.writeFileSync(path.resolve("./db/blacklist.json"), JSON.stringify(bl, null, 4), "utf-8");

        const blEmbed = new EmbedBuilder()
            .setTitle("Blacklist upraven!")
            .setDescription(
                `${blUser ? `<@${blUser.id}>` : `\`${bl_discordUsername}\``} byl(a) přidán(a) na blacklist.`
            )
            .setColor(getServer(i.guild.id).color)
            .setFooter(getServer(i.guild.id).footer);

        await dcLog(bot, i.guild.id, i.member,
            {
                title: "Úprava blacklistu",
                description:
                    `**<@${i.user.id}> přidal(a) ${blUser ? `<@${blUser.id}>` : `\`${bl_discordUsername}\``} na BL.**`
                    + `\`\`\`json\n${JSON.stringify(record, null, 4)}\`\`\``,
                color: "#000000"
            }
        );

        if (submit) return await submit.editReply({ embeds: [blEmbed] });
        else return await i.editReply({ embeds: [blEmbed] });
    }
};