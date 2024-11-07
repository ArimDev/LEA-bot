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
        ![
            "411436203330502658"/*b1ngo*/, "607915400604286997"/*samus*/, "801373399564681236"/*daviiid_.*/,
            "846451292388851722"/*aldix_eu*/, "343386988000444417"/*cenovka*/
        ].includes(m.author.id)
        && !m.attachments.size
        && !new RegExp(/https?:\/\/\S+/g).test(m.content)
    ) return m.delete();
    return m.react("❤️");
}