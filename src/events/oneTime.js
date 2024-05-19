import { ActionRowBuilder, ActivityType, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";


export default async function tools(bot) {
	/*bot.guilds.cache.forEach(async (guild) => {
		const me = await guild.members.fetchMe();
		if (me.nickname !== "LEA Bot") me.setNickname("LEA Bot");
		});*/

	/*const server = await bot.guilds.fetch("1154446248934387828");
	const kanal = await server.channels.fetch("1213984576100241419");
	for (const tag of kanal.availableTags) {
		console.log(tag.name + " | " + tag.id);
	}*/

	/*const server = await bot.guilds.fetch("1139266097921675345");
	const kanal = await server.channels.fetch("1203743211000963082");

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
	const kanal = await server.channels.fetch("1203743211000963082");
	const vlakno = await kanal.threads.fetch("1170795599164080228");
	console.log(vlakno);
	const member = await server.members.fetch("411436203330502658");
	const navodEmbed = new EmbedBuilder()
		.setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() })
		.setTitle("Revoluce zápisů")
		.setDescription("Klikni na tlačítko pro přesun na daný návod.")
		.setThumbnail(bot.LEA.i.SAHP)
		.setColor(getServer(i.guild.id).color)
		.setFooter({ text: "SAHP | Vytvořil b1ngo ✌️", iconURL: bot.LEA.i.SAHP });
	await vlakno.send({ embeds: [navodEmbed], components: [row] });*/

	/*const server = await bot.guilds.fetch("1139266097921675345");
	const kanal = await server.channels.fetch("1139287456928239687");
	await kanal.send({
		"content": "<@&1139276300188647444>",
		"tts": false,
		"embeds": [
		  {
			"id": 16875634,
			"color": 16777215,
			"image": {
			  "url": "https://i.imgur.com/0QTDERM.jpeg"
			},
			"fields": []
		  },
		  {
			"id": 359050108,
			"description": "# STRIKE SYSTÉM\n*řešení pro neomluvené absence*\n\nVážení zaměstnanci, přinášíme vám novinku ohledně trestání neomluvené absence.\n\n> **Proč se řeší absence?**\n> Snažíme se brát RP více vážně a opravdu se **starat o aktivitu PD** v našem městě.\n\n> **Co když nemůžu na meeting?**\n> Jedná se o úplně **v pořádku** případ, kdy ale po vás žádáme, aby jste se omluvili.\n> Budeme tak vědět, kolik lidí máme očekávat, proč členi sboru nejsou aktivní a zároveň důkaz toho, že se stále zajímáte o svoje místo a nekašlete na LSSD.\n\n> **Co se stane, když se neomluvím?**\n> Nově při každém neomluvení na povinnou akci (meeting, převoz skladu, výcvik, zásah, teambuilding...) dostanete **1 strike**, což je nižší váha warnu, na druhou stranu, už ale nebude možné doplnit omluvenky později.\n> - Jakmile obdržíte **3 striky**, dostanete **1 warn**.\n> - Získání 2 warnů vede k **degradu** na nižší hodnost.\n> - V případě Deputy I se jedná o **vyloučení** ze státní ozbrojené složky.\n\nKvůli téhle změně proběhne ještě tzv. **WARN WIPE**, takže se nikdo nebude muset starat o své aktuální warny. Všechny dosavadní warny budou odebrány.",
			"color": 16777215,
			"thumbnail": {
			  "url": "https://i.imgur.com/X3cH2iu.png"
			},
			"fields": [],
			"author": {
			  "name": "[County-6] Tyler Pierce",
			  "icon_url": "https://images-ext-1.discordapp.net/external/eBaH6i4z8RsT5S2m3NjVZpd8I7kO7ul-mv0OIuvh0sc/https/cdn.discordapp.com/guilds/1139266097921675345/users/411436203330502658/avatars/1d41d7d593f6b9a0b8c22bb975574e24.webp"
			},
			"footer": {
			  "text": "Zavedeno"
			},
			"timestamp": "2024-04-14T16:00:00.000Z"
		  }
		],
		"components": [],
		"actions": {}
	});*/
}