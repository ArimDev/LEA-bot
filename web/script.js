import fs from "fs";
import path from "path";
import { getDB } from "../src/functions/db.js";

export async function update(bot, sbor) {
    if (!bot) return false;
    if (!sbor) return await updateSAHP(bot), updateLSSD(bot), updateDiv(bot);
    if (sbor === 1) return await updateSAHP(bot);
    if (sbor === 2) return await updateLSSD(bot);
}

export async function updateSAHP(bot) {
    let jsonData = [], count = 0;
    const db = fs.readdirSync(path.resolve("./db/SAHP")).filter(file => file.endsWith(".json") && file !== "000000000000000001.json");
    for (const file of db) {
        let worker = JSON.parse(fs.readFileSync((path.resolve("./db/SAHP") + "/" + file), "utf-8"));
        worker.discordID = file.split(".json")[0];
        jsonData.push(worker);
    }

    let data = fs.readFileSync(path.resolve("./web/tableSAHP.html"), "utf-8");

    const guild = await bot.guilds.fetch("1139266097921675345");
    await guild.members.fetch();

    await jsonData.forEach(async (item, i) => { // deepscan-disable-line
        let tag = item.radio.toLowerCase().replaceAll("-", ""),
            mem = false,
            stlS = "", stlH = "",
            stlM = " style=\"text-align: center;\"",
            stlF = " style=\"background: #c80000; color: white; text-align: center; font-weight: bold;\"";

        mem = await guild.members.cache.get(item.discordID);
        if (!mem) {
            stlS = " style=\"background: #a60000; color: white;\"";
            stlH = " style=\"background: #c80000; color: white;\"";
            stlM = " style=\"background: #a60000; color: white; text-align: center;\"";
        } else if ((Math.round((item.hours + Number.EPSILON) * 100) / 100) === 0) {
            stlS = " style=\"background: #a60000; color: white;\"";
            stlH = " style=\"background: #c80000; color: white;\"";
            stlM = " style=\"background: #a60000; color: white; text-align: center;\"";
        }
        let roles = { warn: false, _1068: false, _1080: false }, div = [];
        if (mem) {
            roles.warn = mem.roles.cache.has("1139379787324997722");
            roles._1068 = mem.roles.cache.has("1178405506927300608");
            roles._1080 = mem.roles.cache.has("1179493599650521200");
            if (mem.roles.cache.has("1139275625740370001")) div.push("SWAT");
            if (mem.roles.cache.has("1139296112117817534")) div.push("DOA");
            if (mem.roles.cache.has("1139293160602874066")) div.push("ST");
            if (mem.roles.cache.has("1139294859354710188")) div.push("AU");
            if (mem.roles.cache.has("1149017017345638410")) div.push("BP");
            if (mem.roles.cache.has("1139297065063690315")) div.push("TU");
            if (mem.roles.cache.has("1139298429391089685")) div.push("MBU");
            if (mem.roles.cache.has("1139295387266580652")) div.push("FTO");
            if (mem.roles.cache.has("1139297368450277376")) div.push("CID");
        }


        let newData = [];
        newData.push(`<tr id="${tag}">`);
        newData.push(`                <th scope="row"${stlH}>${item.radio}</th>`);
        newData.push(`                <td${stlS}>${item.name}</td>`);
        newData.push(`                <td${stlM}>${item.badge}</td>`);
        newData.push(`                <td${stlS}>${item.rank}</td>`);
        newData.push(`                <td${stlS}>${item.discordID}</td>`);
        newData.push(`                <td${mem ? stlS : stlF}>${mem ? mem.user.tag : "Není na appce"}</td>`);
        newData.push(`                <td${stlM}>${item.rankups[item.rankups.length - 1].date}</td>`);
        newData.push(`                <td${stlM}>${Math.round(((item.hours - item.rankups[item.rankups.length - 1].hours) + Number.EPSILON) * 100) / 100}</td>`);
        newData.push(`                <td${(Math.round((item.hours + Number.EPSILON) * 100) / 100) === 0 ? stlF : stlM}>${Math.round((item.hours + Number.EPSILON) * 100) / 100}</td>`);
        newData.push(`                <td${stlM}>N/A</td>`);
        newData.push(`                <td${stlM}>${item.apologies.length}</td>`);
        newData.push(`                <td${stlM}>N/A</td>`);
        newData.push(`                <td${stlM}><a href="https://discord.com/channels/1139266097921675345/${item.folder}" target="_blank" style="background: white; background-color: white; text-align: center;"><button type="button"tyle="background: white; background-color: white; text-align: center;">Odkaz</button></a></td>`);
        if (roles.warn) newData.push(`                <td${stlM}><input type="checkbox" style="width: 20px; height: 20px; accent-color: #e90000; background: #e90000;" onclick="return false" checked /></td>`);
        else newData.push(`                <td${stlM}><input type="checkbox" style="width: 20px; height: 20px;" onclick="return false" /></td>`);
        newData.push(`                <td${stlM}><input type="checkbox" style="width: 20px; height: 20px;" onclick="return false" /></td>`);
        if (roles._1068) newData.push(`                <td${stlM}><input type="checkbox" style="width: 20px; height: 20px;" onclick="return false" checked /></td>`);
        else newData.push(`                <td${stlM}><input type="checkbox" style="width: 20px; height: 20px;" onclick="return false" /></td>`);
        if (roles._1080) newData.push(`                <td${stlM}><input type="checkbox" style="width: 20px; height: 20px;" onclick="return false" checked /></td>`);
        else newData.push(`                <td${stlM}><input type="checkbox" style="width: 20px; height: 20px;" onclick="return false" /></td>`);
        newData.push(`                <td${stlM}><input type="checkbox" style="width: 20px; height: 20px;" onclick="return false" /></td>`);
        newData.push(`                <td${stlS}>${div.join(", ")}</td>`);
        newData.push(`            <tr></tr>`);

        if (!data.includes(
            `<tr id="${tag}">`
            + `\r\n                <th scope="row">${item.radio}</th>`
            + `\r\n                <td></td>`
            + `\r\n                <td style="text-align: center;">${item.badge}</td>`
            + `\r\n                <td>${item.rank}</td>`
            + `\r\n                <td></td>`
            + `\r\n                <td></td>`
            + `\r\n                <td></td>`
            + `\r\n                <td></td>`
            + `\r\n                <td></td>`
            + `\r\n                <td></td>`
            + `\r\n                <td></td>`
            + `\r\n                <td></td>`
            + `\r\n                <td style="text-align: center;"></td>`
            + `\r\n                <td style="text-align: center;"><input type="checkbox" style="width: 20px; height: 20px;" onclick="return false" /></td>`
            + `\r\n                <td style="text-align: center;"><input type="checkbox" style="width: 20px; height: 20px;" onclick="return false" /></td>`
            + `\r\n                <td style="text-align: center;"><input type="checkbox" style="width: 20px; height: 20px;" onclick="return false" /></td>`
            + `\r\n                <td style="text-align: center;"><input type="checkbox" style="width: 20px; height: 20px;" onclick="return false" /></td>`
            + `\r\n                <td style="text-align: center;"><input type="checkbox" style="width: 20px; height: 20px;" onclick="return false" /></td>`
            + `\r\n                <td></td>`
            + `\r\n            </tr>`
        )) { /*console.log(item.discordID + " " + item.radio);*/ }
        else count++;

        try {
            data = data.replace(
                `<tr id="${tag}">`
                + `\r\n                <th scope="row">${item.radio}</th>`
                + `\r\n                <td></td>`
                + `\r\n                <td style="text-align: center;">${item.badge}</td>`
                + `\r\n                <td>${item.rank}</td>`
                + `\r\n                <td></td>`
                + `\r\n                <td></td>`
                + `\r\n                <td></td>`
                + `\r\n                <td></td>`
                + `\r\n                <td></td>`
                + `\r\n                <td></td>`
                + `\r\n                <td></td>`
                + `\r\n                <td></td>`
                + `\r\n                <td style="text-align: center;"></td>`
                + `\r\n                <td style="text-align: center;"><input type="checkbox" style="width: 20px; height: 20px;" onclick="return false" /></td>`
                + `\r\n                <td style="text-align: center;"><input type="checkbox" style="width: 20px; height: 20px;" onclick="return false" /></td>`
                + `\r\n                <td style="text-align: center;"><input type="checkbox" style="width: 20px; height: 20px;" onclick="return false" /></td>`
                + `\r\n                <td style="text-align: center;"><input type="checkbox" style="width: 20px; height: 20px;" onclick="return false" /></td>`
                + `\r\n                <td style="text-align: center;"><input type="checkbox" style="width: 20px; height: 20px;" onclick="return false" /></td>`
                + `\r\n                <td></td>`
                + `\r\n            </tr>`,
                newData.join("\r\n")
            );
        } catch (e) { console.error(e); }
    });

    try {
        fs.writeFileSync(path.resolve("./web/SAHP.html"), data, "utf-8");
        console.log(` < [PS/Web] >  SAHP.html updated! (${count} / ${jsonData.length})`);
        return true;
    } catch (e) {
        console.error(`Error writing file: ${e.message}`);
        return false;
    };
}

export async function updateLSSD(bot) {
    let jsonData = [], count = 0;
    const db = fs.readdirSync(path.resolve("./db/LSSD")).filter(file => file.endsWith(".json") && file !== "000000000000000001.json");
    for (const file of db) {
        let worker = JSON.parse(fs.readFileSync((path.resolve("./db/LSSD") + "/" + file), "utf-8"));
        worker.discordID = file.split(".json")[0];
        jsonData.push(worker);
    }

    let data = fs.readFileSync(path.resolve("./web/tableLSSD.html"), "utf-8");

    const guild = await bot.guilds.fetch("1167182546853961860");
    await guild.members.fetch();

    await jsonData.forEach(async (item, i) => { // deepscan-disable-line
        let tag = item.radio.toLowerCase().replaceAll("-", ""),
            mem = false,
            stlS = "", stlH = "",
            stlM = " style=\"text-align: center;\"",
            stlF = " style=\"background: #c80000; color: white; text-align: center; font-weight: bold;\"";

        mem = await guild.members.cache.get(item.discordID);
        if (!mem) {
            stlS = " style=\"background: #a60000; color: white;\"";
            stlH = " style=\"background: #c80000; color: white;\"";
            stlM = " style=\"background: #a60000; color: white; text-align: center;\"";
        } else if ((Math.round((item.hours + Number.EPSILON) * 100) / 100) === 0) {
            stlS = " style=\"background: #a60000; color: white;\"";
            stlH = " style=\"background: #c80000; color: white;\"";
            stlM = " style=\"background: #a60000; color: white; text-align: center;\"";
        }
        let roles = { warn: false, suspend: false }, div = [];
        if (mem) {
            roles.warn = mem.roles.cache.has("1167182546853961862");
            roles.suspend = mem.roles.cache.has("1167182546853961863");
            if (mem.roles.cache.has("1167182546874945700")) div.push("MBU");
            if (mem.roles.cache.has("1167182546874945696")) div.push("SRT");
            if (mem.roles.cache.has("1167182546853961868")) div.push("CID");
            if (mem.roles.cache.has("1167182546853961866")) div.push("FTO");
            if (mem.roles.cache.has("1167182546853961864")) div.push("ST");
            if (mem.roles.cache.has("1167182546874945698")) div.push("DEA");
            if (mem.roles.cache.has("1191352540680437780")) div.push("GU");
            if (mem.roles.cache.has("1170450979896963122")) div.push("AU");
            if (mem.roles.cache.has("1191724184011808929")) div.push("K-9");
        }


        let newData = [];
        newData.push(`<tr id="${tag}">`);
        newData.push(`                <th scope="row"${stlH}>${item.radio}</th>`);
        newData.push(`                <td${stlS}>${item.name}</td>`);
        newData.push(`                <td${stlM}>${item.badge}</td>`);
        newData.push(`                <td${stlS}>${item.rank}</td>`);
        newData.push(`                <td${stlS}>${item.discordID}</td>`);
        newData.push(`                <td${mem ? stlS : stlF}>${mem ? mem.user.tag : "Není na appce"}</td>`);
        newData.push(`                <td${stlM}>${item.rankups[item.rankups.length - 1].date}</td>`);
        newData.push(`                <td${stlM}>${Math.round(((item.hours - item.rankups[item.rankups.length - 1].hours) + Number.EPSILON) * 100) / 100}</td>`);
        newData.push(`                <td${(Math.round((item.hours + Number.EPSILON) * 100) / 100) === 0 ? stlF : stlM}>${Math.round((item.hours + Number.EPSILON) * 100) / 100}</td>`);
        newData.push(`                <td${stlM}>N/A</td>`);
        newData.push(`                <td${stlM}>${item.apologies.length}</td>`);
        newData.push(`                <td${stlM}>N/A</td>`);
        newData.push(`                <td${stlM}><a href="https://discord.com/channels/1139266097921675345/${item.folder}" target="_blank" style="background: white; background-color: white; text-align: center;"><button type="button"tyle="background: white; background-color: white; text-align: center;">Odkaz</button></a></td>`);
        if (roles.warn) newData.push(`                <td${stlM}><input type="checkbox" style="width: 20px; height: 20px; accent-color: #e90000; background: #e90000;" onclick="return false" checked /></td>`);
        else newData.push(`                <td${stlM}><input type="checkbox" style="width: 20px; height: 20px;" onclick="return false" /></td>`);
        if (roles.suspend) newData.push(`                <td${stlM}><input type="checkbox" style="width: 20px; height: 20px; accent-color: #e90000; background: #e90000;" onclick="return false" checked /></td>`);
        else newData.push(`                <td${stlM}><input type="checkbox" style="width: 20px; height: 20px;" onclick="return false" /></td>`);
        newData.push(`                <td${stlS}>${div.join(", ")}</td>`);
        newData.push(`            <tr></tr>`);

        if (!data.includes(
            `<tr id="${tag}">`
            + `\r\n                <th scope="row">${item.radio}</th>`
            + `\r\n                <td></td>`
            + `\r\n                <td style="text-align: center;">${item.badge}</td>`
            + `\r\n                <td>${item.rank}</td>`
            + `\r\n                <td></td>`
            + `\r\n                <td></td>`
            + `\r\n                <td></td>`
            + `\r\n                <td></td>`
            + `\r\n                <td></td>`
            + `\r\n                <td></td>`
            + `\r\n                <td></td>`
            + `\r\n                <td></td>`
            + `\r\n                <td style="text-align: center;"></td>`
            + `\r\n                <td style="text-align: center;"><input type="checkbox" style="width: 20px; height: 20px;" onclick="return false" /></td>`
            + `\r\n                <td style="text-align: center;"><input type="checkbox" style="width: 20px; height: 20px;" onclick="return false" /></td>`
            + `\r\n                <td></td>`
            + `\r\n            </tr>`
        )) { /*console.log(item.discordID + " " + item.radio);*/ }
        else count++;

        try {
            data = data.replace(
                `<tr id="${tag}">`
                + `\r\n                <th scope="row">${item.radio}</th>`
                + `\r\n                <td></td>`
                + `\r\n                <td style="text-align: center;">${item.badge}</td>`
                + `\r\n                <td>${item.rank}</td>`
                + `\r\n                <td></td>`
                + `\r\n                <td></td>`
                + `\r\n                <td></td>`
                + `\r\n                <td></td>`
                + `\r\n                <td></td>`
                + `\r\n                <td></td>`
                + `\r\n                <td></td>`
                + `\r\n                <td></td>`
                + `\r\n                <td style="text-align: center;"></td>`
                + `\r\n                <td style="text-align: center;"><input type="checkbox" style="width: 20px; height: 20px;" onclick="return false" /></td>`
                + `\r\n                <td style="text-align: center;"><input type="checkbox" style="width: 20px; height: 20px;" onclick="return false" /></td>`
                + `\r\n                <td></td>`
                + `\r\n            </tr>`,
                newData.join("\r\n")
            );
        } catch (e) { console.error(e); }
    });

    try {
        fs.writeFileSync(path.resolve("./web/LSSD.html"), data, "utf-8");
        console.log(` < [PS/Web] >  LSSD.html updated! (${count} / ${jsonData.length})`);
        return true;
    } catch (e) {
        console.error(`Error writing file: ${e.message}`);
        return false;
    };
}

export async function updateDiv(bot) {
    let divs = [
        {
            id: "0cid",
            count: 0,
            roles: ["1139297368450277376", "1167182546853961868"],
            commanderRoles: ["1153704499651817573", "1167182546853961869"],
            commanders: [],
            radio: "Echo 1-5<br>Eric 1-5",
            fullname: "Criminal Investigative Division",
            members: [],
        },
        {
            id: "1swat",
            count: 0,
            roles: ["1139275625740370001"],
            commanderRoles: ["1139275915357081761"],
            commanders: [],
            radio: "Ghost 1-30",
            fullname: "Special Weapons And Tactics",
            members: [],
        },
        {
            id: "1doa",
            count: 0,
            roles: ["1139296112117817534"],
            commanderRoles: ["1139295819753852948"],
            commanders: [],
            radio: false,
            fullname: false,
            members: [],
        },
        {
            id: "1st",
            count: 0,
            roles: ["1139293160602874066"],
            commanderRoles: ["1139293329218097244"],
            commanders: [],
            radio: false,
            fullname: "Sniper Team",
            members: [],
        },
        {
            id: "1au",
            count: 0,
            roles: ["1139294859354710188"],
            commanderRoles: ["1139295075080347730"],
            commanders: [],
            radio: false,
            fullname: "Air Unit",
            members: [],
        },
        {
            id: "1bp",
            count: 0,
            roles: ["1149017017345638410"],
            commanderRoles: ["1149017580791676981"],
            commanders: [],
            radio: false,
            fullname: "Border Patrol",
            members: [],
        },
        {
            id: "1tu",
            count: 0,
            roles: ["1139297065063690315"],
            commanderRoles: ["1139296993190097068"],
            commanders: [],
            radio: false,
            fullname: "Traffic Unit",
            members: [],
        },
        {
            id: "1mbu",
            count: 0,
            roles: ["1139298429391089685"],
            commanderRoles: ["1139298099706220544"],
            commanders: [],
            radio: false,
            fullname: "MotorBike Unit",
            members: [],
        },
        {
            id: "1fto",
            count: 0,
            roles: ["1139295387266580652"],
            commanderRoles: ["1139295201282764882"],
            commanders: [],
            radio: false,
            fullname: "Field Training Officer",
            members: [],
        },
        {
            id: "2mbu",
            count: 0,
            roles: ["1167182546874945700"],
            commanderRoles: ["1167182546874945701"],
            commanders: [],
            radio: false,
            fullname: "MotorBike Unit",
            members: [],
        },
        {
            id: "2srt",
            count: 0,
            roles: ["1167182546874945696"],
            commanderRoles: ["1167182546874945697"],
            commanders: [],
            radio: false,
            fullname: "Special Respond Team",
            members: [],
        },
        {
            id: "2fto",
            count: 0,
            roles: ["1167182546853961866"],
            commanderRoles: ["1167182546853961867"],
            commanders: [],
            radio: false,
            fullname: "Field Training Officer",
            members: [],
        },
        {
            id: "2st",
            count: 0,
            roles: ["1167182546853961864"],
            commanderRoles: ["1167182546853961865"],
            commanders: [],
            radio: false,
            fullname: "Sniper Team",
            members: [],
        },
        {
            id: "2dea",
            count: 0,
            roles: ["1167182546874945698"],
            commanderRoles: ["1167182546874945699"],
            commanders: [],
            radio: false,
            fullname: "Drug Enforcement Administration",
            members: [],
        },
        {
            id: "2gu",
            count: 0,
            roles: ["1191352540680437780"],
            commanderRoles: ["1191352422359117954"],
            commanders: [],
            radio: false,
            fullname: "Gang Unit",
            members: [],
        },
        {
            id: "2au",
            count: 0,
            roles: ["1170450979896963122"],
            commanderRoles: ["1170450636115034154"],
            commanders: [],
            radio: "Air 1-25",
            fullname: "Air Unit",
            members: [],
        },
        {
            id: "2k9",
            count: 0,
            roles: ["1191724184011808929"],
            commanderRoles: ["1191726198758314125"],
            commanders: [],
            radio: false,
            fullname: "K-9",
            members: [],
        }
    ];

    const SAHP = await bot.guilds.fetch("1139266097921675345");
    await SAHP.members.fetch();
    await SAHP.roles.fetch(divs.filter(d => d.id.split("")[0] === "1").map(d => d.roles[0]));

    const LSSD = await bot.guilds.fetch("1167182546853961860");
    await LSSD.members.fetch();
    await LSSD.roles.fetch(divs.filter(d => d.id.split("")[0] === "2").map(d => d.roles[0]));

    let data = fs.readFileSync(path.resolve("./web/tableDIV.html"), "utf-8"), count = 0;

    await divs.forEach(async d => { // deepscan-disable-line
        let mSize = 0, m = [], cm = [], m1, m2, cm1, cm2, mF = [], cmF = [];
        const sborID = d.id.split("")[0];
        if (sborID === "1") {
            m1 = SAHP.roles.cache.get(d.roles[0]).members;
            cm1 = SAHP.roles.cache.get(d.commanderRoles[0]).members;
            mSize = m1.size;
            m1.forEach(m => {
                let call = m.displayName.match(/\[(.*?)\]/);
                if (!!call) {
                    call = call[1];
                    call = call.split("-")[0].toLowerCase() + parseInt(call.split("-")[1]);
                    call = `<a href="http://petyxbron.cz:1011/sahp#${call}">${m.displayName}</a>`;
                    mF.push(call);
                }
            });
            cm1.forEach(m => {
                let call = m.displayName.match(/\[(.*?)\]/);
                if (!!call) {
                    call = call[1];
                    call = call.split("-")[0].toLowerCase() + parseInt(call.split("-")[1]);
                    call = `<a href="http://petyxbron.cz:1011/sahp#${call}">${m.displayName}</a>`;
                    cmF.push(call);
                }
            });
        }
        if (sborID === "2") {
            m2 = LSSD.roles.cache.get(d.roles[0]).members;
            cm2 = LSSD.roles.cache.get(d.commanderRoles[0]).members;
            mSize = m2.size;
            m2.forEach(m => {
                let call = m.displayName.match(/\[(.*?)\]/);
                if (!!call) {
                    call = call[1];
                    call = call.split("-")[0].toLowerCase() + parseInt(call.split("-")[1]);
                    call = `<a href="http://petyxbron.cz:1011/lssd#${call}">${m.displayName}</a>`;
                    mF.push(call);
                }
            });
            cm2.forEach(m => {
                let call = m.displayName.match(/\[(.*?)\]/);
                if (!!call) {
                    call = call[1];
                    call = call.split("-")[0].toLowerCase() + parseInt(call.split("-")[1]);
                    call = `<a href="http://petyxbron.cz:1011/lssd#${call}">${m.displayName}</a>`;
                    cmF.push(call);
                }
            });
        }
        if (sborID === "0") {
            m1 = SAHP.roles.cache.get(d.roles[0]).members;
            m2 = LSSD.roles.cache.get(d.roles[1]).members;
            cm1 = SAHP.roles.cache.get(d.commanderRoles[0]).members;
            cm2 = LSSD.roles.cache.get(d.commanderRoles[1]).members;
            mSize = m1.size + m2.size;
            m1.forEach(m => {
                let call = m.displayName.match(/\[(.*?)\]/);
                if (!!call) {
                    call = call[1];
                    call = call.split("-")[0].toLowerCase() + parseInt(call.split("-")[1]);
                    call = `<a href="http://petyxbron.cz:1011/sahp#${call}">${m.displayName}</a>`;
                    mF.push(call);
                }
            });
            m2.forEach(m => {
                let call = m.displayName.match(/\[(.*?)\]/);
                if (!!call) {
                    call = call[1];
                    call = call.split("-")[0].toLowerCase() + parseInt(call.split("-")[1]);
                    call = `<a href="http://petyxbron.cz:1011/lssd#${call}">${m.displayName}</a>`;
                    mF.push(call);
                }
            });
            cm1.forEach(m => {
                let call = m.displayName.match(/\[(.*?)\]/);
                if (!!call) {
                    call = call[1];
                    call = call.split("-")[0].toLowerCase() + parseInt(call.split("-")[1]);
                    call = `<a href="http://petyxbron.cz:1011/sahp#${call}">${m.displayName}</a>`;
                    cmF.push(call);
                }
            });
            cm2.forEach(m => {
                let call = (m.displayName.match(/\[(.*?)\]/))[1];
                if (!!call) {
                    call = call[1];
                    call = call.split("-")[0].toLowerCase() + parseInt(call.split("-")[1]);
                    call = `<a href="http://petyxbron.cz:1011/lssd#${call}">${m.displayName}</a>`;
                    cmF.push(call);
                }
            });
        }
        const divName = d.id.slice(1).toUpperCase();
        m = m.filter((mm, i) => i === m.indexOf(mm));
        cm = cm.filter((cc, i) => i === cm.indexOf(cc));

        //console.log(`${d.id} ${sborID} ${mSize} ${m}`);

        let newData = [];
        newData.push(`<th scope="row" style="text-align: center; color: white;">${divName}</th>`);
        newData.push(`                <td style="text-align: center;">${mSize !== 0 ? mSize : ""}</td>`);
        newData.push(`                <td>${cmF.join(", ")}</td>`);
        newData.push(`                <td style="white-space: nowrap;">${d.radio || ""}</td>`);
        newData.push(`                <td>${d.fullname || ""}</td>`);
        newData.push(`                <td>${mF.join(", ")}</td>`);

        if (!data.includes(
            `<th scope="row" style="text-align: center; color: white;">${divName}</th>`
            + `\r\n                <td style="text-align: center;"></td>`
            + `\r\n                <td></td>`
            + `\r\n                <td>${d.radio || ""}</td>`
            + `\r\n                <td>${d.fullname || ""}</td>`
            + `\r\n                <td></td>`
        )) { /*console.log(d.id);*/ }
        else count++;

        try {
            data = data.replace(
                `<th scope="row" style="text-align: center; color: white;">${divName}</th>`
                + `\r\n                <td style="text-align: center;"></td>`
                + `\r\n                <td></td>`
                + `\r\n                <td>${d.radio || ""}</td>`
                + `\r\n                <td>${d.fullname || ""}</td>`
                + `\r\n                <td></td>`,
                newData.join("\r\n")
            );
        } catch (e) { console.error(e); }
    });

    try {
        fs.writeFileSync(path.resolve("./web/div.html"), data, "utf-8");
        console.log(` < [PS/Web] >  div.html updated! (${count} / ${divs.length})`);
        return true;
    } catch (e) {
        console.error(`Error writing file: ${e.message}`);
        return false;
    };
}