import { ActionRowBuilder, AttachmentBuilder, EmbedBuilder, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import fs from "fs";
import path from "path";
import { checkDB, getServer } from "../functions/db.js";

export const slash = new SlashCommandBuilder()
    .setName("leader")
    .setDescription(`Různé příkazy obecné správy pro Leadership`)
    .addSubcommand(subcommand =>
        subcommand
            .setName('docházka')
            .setDescription("Kontrola absence")
    )
    .setContexts([0])
    .setIntegrationTypes([0])
    .setNSFW(false);

export default async function run(bot, i) {
    const sub = i.options._subcommand;

    let passed = false;
    i.guild.fetch();
    const admin = i.member;
    if (admin.id === bot.LEA.o) passed = true; //PetyXbron / b1ngo
    if (bot.LEA.g.LSPD.includes(i.guild.id) && !passed) {
        if (admin.roles.cache.has("xxx" /* MISSING ID */)) passed = true; //Leadership
    } else if (bot.LEA.g.LSSD.includes(i.guild.id) && !passed) {
        if (admin.roles.cache.has("1267541873451339806")) passed = true; //Leadership
        if (admin.roles.cache.has("1251504025610747966")) passed = true; //FTO Commander
    } else if (bot.LEA.g.SAHP.includes(i.guild.id) && !passed) {
        if (admin.roles.cache.has("1301163398557339686")) passed = true; //Leadership
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

        i.awaitModalSubmit({ filter: int => int.user.id === i.user.id, time: 600000 })
            .then(async submit => {
                await submit.deferReply({ ephemeral: true });

                const id = parseInt(submit.fields.getTextInputValue("eventID"));
                const ignored = submit.fields.getTextInputValue("ignore").split(", ");
                const eventDateArr = submit.fields.getTextInputValue("date").split(". ");
                const eventDate = new Date(eventDateArr[1] + "/" + eventDateArr[0] + "/" + eventDateArr[2]);

                let users = [], db;
                if (bot.LEA.g.LSPD.includes(i.guild.id)) db = fs.readdirSync(path.resolve("./db/LSPD")).filter(file => file.endsWith(".json") && file !== "000000000000000001.json");
                else if (bot.LEA.g.LSSD.includes(i.guild.id)) db = fs.readdirSync(path.resolve("./db/LSSD")).filter(file => file.endsWith(".json") && file !== "000000000000000001.json");
                else if (bot.LEA.g.SAHP.includes(i.guild.id)) db = fs.readdirSync(path.resolve("./db/SAHP")).filter(file => file.endsWith(".json") && file !== "000000000000000001.json");
                for (const file of db) {
                    let worker;
                    if (bot.LEA.g.LSPD.includes(i.guild.id)) worker = JSON.parse(fs.readFileSync((path.resolve("./db/LSPD") + "/" + file), "utf-8"));
                    else if (bot.LEA.g.LSSD.includes(i.guild.id)) worker = JSON.parse(fs.readFileSync((path.resolve("./db/LSSD") + "/" + file), "utf-8"));
                    else if (bot.LEA.g.SAHP.includes(i.guild.id)) worker = JSON.parse(fs.readFileSync((path.resolve("./db/SAHP") + "/" + file), "utf-8"));

                    let m = false;
                    try { m = await i.guild.members.fetch(file.split(".")[0]); } catch { }

                    if (m) {
                        const ap = worker.apologies;

                        let apologized = false;
                        if (bot.LEA.g.LSPD.includes(i.guild.id)) {
                            if (m.roles.cache.has("xxx" /* MISSING ID */)) apologized = true; //Leadership
                        } else if (bot.LEA.g.LSSD.includes(i.guild.id)) {
                            if (m.roles.cache.has("1267541873451339806")) apologized = true; //Leadership
                        } else if (bot.LEA.g.SAHP.includes(i.guild.id)) {
                            if (m.roles.cache.has("1301163398557339686")) apologized = true; //Leadership
                        }
                        if (ignored.includes(worker.badge.toString())) apologized = true;

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

                const command = `/trest hromadny officer:${users.map(u => u.id).join(", ")} trest:Strike duvod:Neomluvená absence na události ${id}`;
                await submit.editReply({
                    content: `**Neomluveno:** ${users.length}\n-# *Příkaz pro zkopírování bude v další zprávě.*`,
                    files: [listAtt, mentionsAtt],
                    ephemeral: true
                });
                await submit.followUp({
                    content: command,
                    ephemeral: true
                });
                return;
            })
            .catch(() => { });
    }
};