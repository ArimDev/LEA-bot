import { SlashCommandBuilder } from "discord.js";

export const slash = new SlashCommandBuilder()
    .setName("trest")
    .setDescription(`Udělí trest officerovi`)
    .addSubcommand(subcommand =>
        subcommand
            .setName("strike")
            .setDescription(`Udělí strike`)
            .addUserOption(option =>
                option.setName("discord")
                    .setDescription("Discord officera")
                    .setRequired(true))
            .addStringOption(option =>
                option.setName("duvod")
                    .setDescription("Důvod udělení striku")
                    .setRequired(true))
            .addBooleanOption(option =>
                option.setName("visible")
                    .setDescription("Má být odpověď na tuto interakci viditelná všem?")
                    .setRequired(false))
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName("warn")
            .setDescription(`Udělí warn`)
            .addUserOption(option =>
                option.setName("discord")
                    .setDescription("Discord officera")
                    .setRequired(true))
            .addStringOption(option =>
                option.setName("duvod")
                    .setDescription("Důvod udělení warnu")
                    .setRequired(true))
            .addBooleanOption(option =>
                option.setName("visible")
                    .setDescription("Má být odpověď na tuto interakci viditelná všem?")
                    .setRequired(false))
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName("suspend")
            .setDescription(`Udělí suspend`)
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
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName("hromadny")
            .setDescription(`Udělí hromadný trest`)
            .addStringOption(option =>
                option.setName("officer")
                    .setDescription("Seznam officerů")
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('trest')
                    .setDescription('Druh trestu')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Strike', value: 'strike' },
                        { name: 'Warn', value: 'warn' },
                        { name: 'Suspend', value: 'suspend' },
                    ))
            .addStringOption(option =>
                option.setName("duvod")
                    .setDescription("Důvod udělení trestu")
                    .setRequired(true))
            .addBooleanOption(option =>
                option.setName("visible")
                    .setDescription("Má být odpověď na tuto interakci viditelná všem?")
                    .setRequired(false))
    )
    .setContexts([0])
    .setIntegrationTypes([0])
    .setNSFW(false);

export default async function run(bot, i) {
    let passed = false;
    await i.guild.fetch();
    const admin = i.member;
    if (admin.id === bot.LEA.o) passed = true; //PetyXbron / b1ngo
    if (bot.LEA.g.LSPD.includes(i.guild.id) && !passed) {
        if (admin.roles.cache.has("1301163398540689494")) passed = true; //Government
        if (admin.roles.cache.has("1301163398557339686")) passed = true; //Leadership
        if (admin.roles.cache.has("1301163398557339683")) passed = true; //Supervisor
    } else if (bot.LEA.g.LSSD.includes(i.guild.id) && !passed) {
        if (admin.roles.cache.has("1391525312994738206")) passed = true; //Government
        if (admin.roles.cache.has("1391525298461347971")) passed = true; //Leadership
        if (admin.roles.cache.has("1391525303733452860")) passed = true; //Supervisor
    } else if (bot.LEA.g.SAHP.includes(i.guild.id) && !passed) {
        if (admin.roles.cache.has("xxx" /* MISSING ID */)) passed = true; //Leadership
        if (admin.roles.cache.has("xxx" /* MISSING ID */)) passed = true; //Supervisor
    } else if (bot.LEA.g.SAND.includes(i.guild.id) && !passed) {
        if (admin.roles.cache.has("1342063021991661572")) passed = true; //CO
    }

    const sub = i.options._subcommand;
    const trest = sub === "hromadny" ?
        (i.options.getString("trest").charAt(0).toUpperCase() + i.options.getString("trest").slice(1).toLowerCase())
        : (sub.charAt(0).toUpperCase() + sub.slice(1).toLowerCase());

    if (!passed) return i.reply({ content: `> 🛑 **${trest} může udělit pouze __Leadership__ nebo __Supervisor__**`, ephemeral: true });

    const run = await import(`./tresty/${sub}.js`).then(fn => fn.default);
    await run(bot, i);
}