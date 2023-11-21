import fs from "fs";
import path from "path";

export async function checkApologies(bot) {
    let workers = await fs.promises.readdir(path.resolve("./db/workers"));

    for (const fileName of workers.filter(f => f !== "000000000000000001.json")) {
        const workerID = fileName.split(".json")[0];

        let worker = JSON.parse(fs.readFileSync((path.resolve("./db/workers") + "/" + workerID + ".json"), "utf-8"));

        await worker.apologies.filter(a => !a.removed).forEach(async (a, i) => {
            const aDateArr = a.end.split(". ");
            const aDate = new Date(aDateArr[1] + "/" + aDateArr[0] + "/" + aDateArr[2]);
            const todayDate = new Date();
            const ms30days = 1000 * 60 * 60 * 24 * 30;

            if (todayDate.getTime() - aDate.getTime() > ms30days) {
                a.removed = true;
                worker.apologies[i] = a;
                console.log(` < [DB/Outdated/Apologies] >  Omluvenka končící ${aDate.toLocaleString()} od [${worker.radio}] ${worker.name} (${workerID}.json) byla odebrána`);
                if (worker.folder) {
                    try {
                        const guild = await bot.guilds.fetch("1139266097921675345");
                        const folder = await guild.channels.fetch(worker.folder);
                        await folder.send({ content: "> ✅ **Omluvenka #" + (i + 1) + " byla odebrána. Uplynulo více jak 30 dní od jejího konce.**" });
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
        });

        await fs.writeFileSync(
            (path.resolve("./db/workers") + "/" + workerID + ".json"),
            JSON.stringify(worker, null, 4)
        );
    }
    setTimeout(checkApologies, (1000 * 60 * 60 * 24)); //Every day
}