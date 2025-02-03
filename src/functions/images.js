export async function klipy(bot, m) {
    if (!m.attachments.size && !new RegExp(/https?:\/\/\S+/g).test(m.content))
        return m.delete();

    ["❤️", "😂", "🙁"].forEach(r => m.react(r));

    const thread = await m.startThread({
        name: m.member.nickname,
        autoArchiveDuration: 10080
    });
    return await thread.leave();
}

export async function fotosoutez(bot, m) {
    if (
        !bot.LEA.a.includes(m.author.id)
        && !m.attachments.size
        && !new RegExp(/https?:\/\/\S+/g).test(m.content)
    ) return m.delete();
    return m.react("❤️");
}