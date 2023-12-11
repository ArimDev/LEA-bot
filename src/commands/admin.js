import { ActionRowBuilder, AttachmentBuilder, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import fs from "fs";
import path from "path";
import { checkDB } from "../../src/functions/db.js";

export const slash = new SlashCommandBuilder()
    .setName("admin")
    .setDescription(`Obecná správa`)
    .addSubcommand(subcommand =>
        subcommand
            .setName('docházka')
            .setDescription("Kontrola absence")
    )
    .setDMPermission(false)
    .setNSFW(false);

export default async function run(bot, i) {
    const sub = i.options._subcommand;

    let passed = false;
    await i.guild.fetch();
    const admin = await i.member;
    if (admin.roles.cache.has("1145344761402765343")) passed = true; //Staff team Refresh
    if (admin.roles.cache.has("1139266408681844887")) passed = true; //.
    if (admin.id === "607915400604286997") passed = true; //Samus
    if (admin.id === "436180906533715969") passed = true; //Mičut
    if (admin.id === "411436203330502658") passed = true; //PetyXbron
    if (!passed) return i.reply({ content: "> 🛑 **K tomuhle má přístup jen admin.**", ephemeral: true });

    if (sub === "docházka") {
        const modal = new ModalBuilder()
            .setCustomId("dochazkaModal")
            .setTitle("SAHP | Docházka");

        const idInput = new TextInputBuilder()
            .setCustomId("eventID")
            .setLabel("ID události")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("1")
            .setMaxLength(5)
            .setRequired(true);

        const ignoreInput = new TextInputBuilder()
            .setCustomId("ignore")
            .setLabel("Čísla odznakl, kteří se účastnili")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("1012, 1035, 1036, 1037, 1050, 1061")
            .setRequired(false);

        const actionRow0 = new ActionRowBuilder().addComponents(idInput);
        const actionRow1 = new ActionRowBuilder().addComponents(ignoreInput);

        modal.addComponents(actionRow0, actionRow1);

        await i.showModal(modal);

        let submit = await i.awaitModalSubmit({ filter: int => int.user.id === i.user.id, time: 600000 }).catch(e => {
            return null;
        });

        if (submit) {
            await submit.deferReply({ ephemeral: true });

            const id = parseInt(submit.fields.getTextInputValue("eventID"));
            const ignored = submit.fields.getTextInputValue("ignore").split(", ");
            const nowDate = new Date();

            let users = [], db;
            if (bot.LEA.g.SAHP.includes(i.guild.id)) db = fs.readdirSync(path.resolve("./db/SAHP")).filter(file => file.endsWith(".json") && file !== "000000000000000001.json");
            else if (bot.LEA.g.LSSD.includes(i.guild.id)) db = fs.readdirSync(path.resolve("./db/LSSD")).filter(file => file.endsWith(".json") && file !== "000000000000000001.json");
            for (const file of db) {
                let worker;
                if (bot.LEA.g.SAHP.includes(i.guild.id)) worker = JSON.parse(fs.readFileSync((path.resolve("./db/SAHP") + "/" + file), "utf-8"));
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
                            if (nowDate.getTime() >= startDate.getTime() && nowDate <= endDate.getTime()) {
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
};