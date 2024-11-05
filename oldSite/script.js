import fs from "fs";
import path from "path";
import { getDB } from "../src/functions/db.js";
import { config as secret } from "dotenv";

export async function update(bot, sbor) {
    if (!bot) return false;
    if (!sbor) return await updateLSPD(bot), updateLSCSO(bot), updateDiv(bot);
    if (sbor === 1) return await updateLSPD(bot);
    if (sbor === 2) return await updateLSCSO(bot);
}

export async function updateDiv(bot) {
    let divs = [
        {
            id: "0cid",
            active: true,
            count: 0,
            roles: ["1139297368450277376", "1240021941277036586"],
            commanderRoles: ["1153704499651817573", "1240021941277036586"],
            commanders: [],
            radio: "Echo 1-8<br>Eric 1-4",
            fullname: "Criminal Investigative Division",
            members: [],
        },
        {
            id: "0dea",
            active: true,
            count: 0,
            roles: ["1139296112117817534", "1267542133628338186"],
            commanderRoles: ["1139295819753852948", "1267541991999279134"],
            commanders: [],
            radio: "Delta 1-30",
            fullname: "Drug Enforcement Administration",
            members: [],
        },
        {
            id: "1srt",
            active: true,
            count: 0,
            roles: ["1139275625740370001"],
            commanderRoles: ["1139275915357081761"],
            commanders: [],
            radio: "Sierra 1-30<br>Sierra tým",
            fullname: "Special Response Team",
            members: [],
        },
        {
            id: "1st",
            active: true,
            count: 0,
            roles: ["1139293160602874066"],
            commanderRoles: ["1139293329218097244"],
            commanders: [],
            radio: "Fox 1-8",
            fullname: "Sniper Team",
            members: [],
        },
        {
            id: "1asd",
            active: true,
            count: 0,
            roles: ["1139294859354710188"],
            commanderRoles: ["1139295075080347730"],
            commanders: [],
            radio: "Air 1-25",
            fullname: "Air Support Division",
            members: [],
        },
        {
            id: "1tu",
            active: true,
            count: 0,
            roles: ["1139297065063690315"],
            commanderRoles: ["1139296993190097068"],
            commanders: [],
            radio: "Puma 1-20",
            fullname: "Traffic Unit",
            members: [],
        },
        {
            id: "1mbu",
            active: true,
            count: 0,
            roles: ["1139298429391089685"],
            commanderRoles: ["1139298099706220544"],
            commanders: [],
            radio: "Marry 1-10",
            fullname: "MotorBike Unit",
            members: [],
        },
        {
            id: "1fto",
            active: true,
            count: 0,
            roles: ["1139295387266580652"],
            commanderRoles: ["1139295201282764882"],
            commanders: [],
            radio: false,
            fullname: "Field Training Officer",
            members: [],
        },
        {
            id: "1ia",
            active: true,
            count: 0,
            roles: ["1208461923373285498"],
            commanderRoles: ["1208464035448885349"],
            commanders: [],
            radio: false,
            fullname: "Internal Affairs",
            members: [],
        },
        {
            id: "1k9",
            active: false,
            count: 0,
            roles: ["1248652194979254425"],
            commanderRoles: ["1248652390673158267"],
            commanders: [],
            radio: "Hunter 1-10",
            fullname: "",
            members: [],
        },
        {
            id: "1cttf",
            active: true,
            count: 0,
            roles: ["1265773683251613879"],
            commanderRoles: ["1265773417056047236"],
            commanders: [],
            radio: "X-ray 1-10",
            fullname: "Counter Terrorism Task Force",
            members: [],
        },
        {
            id: "2swat",
            active: true,
            count: 0,
            roles: ["1154446248934387836"],
            commanderRoles: ["1233922903569862758"],
            commanders: [],
            radio: "David 1-30",
            fullname: "Special Weapons And Tactics",
            members: [],
        },
        {
            id: "2tu",
            active: true,
            count: 0,
            roles: ["1154446248946978950"],
            commanderRoles: ["1154446248946978951"],
            commanders: [],
            radio: "Cobra 1-20<br>Snake tým",
            fullname: "Traffic Unit",
            members: [],
        },
        {
            id: "2au",
            active: true,
            count: 0,
            roles: ["1242926544574349343"],
            commanderRoles: ["1242926308137242745"],
            commanders: [],
            radio: "Eagle 1-7",
            fullname: "Air Unit",
            members: [],
        }
    ];

    const LSCSO = await bot.guilds.fetch("1139266097921675345");
    await LSCSO.members.fetch();
    await LSCSO.roles.fetch(divs.filter(d => d.id.split("")[0] === "1").map(d => d.roles[0]));

    const LSPD = await bot.guilds.fetch("1154446248934387828");
    await LSPD.members.fetch();
    await LSPD.roles.fetch(divs.filter(d => d.id.split("")[0] === "2").map(d => d.roles[0]));

    let data = fs.readFileSync(path.resolve("./web/divize.html"), "utf-8"), count = 0;

    await divs.forEach(async d => { // deepscan-disable-line
        let mSize = 0, m = [], cm = [], m1 = [], m2 = [], cm1 = [], cm2 = [], mF = [], cmF = [];
        const sborID = d.id.split("")[0];
        if (sborID === "1") {
            if (d.roles[0]) m2 = LSCSO.roles.cache.get(d.roles[0]).members, mSize = m2.size;
            if (d.commanderRoles[0]) cm2 = LSCSO.roles.cache.get(d.commanderRoles[0]).members;

            m2.forEach(m => {
                let call = m.displayName.match(/\[(.*?)\]/);
                if (!!call) {
                    call = call[1];
                    call = call.split("-")[0].toLowerCase() + parseInt(call.split("-")[1]);
                    call = `<a href="${secret().parsed.web}/lscso#${call}">${m.displayName.match(/\[(.*?)\]/)[0]}</a>`;
                    mF.push(call);
                }
            });
            cm2.forEach(m => {
                let call = m.displayName.match(/\[(.*?)\]/);
                if (!!call) {
                    call = call[1];
                    call = call.split("-")[0].toLowerCase() + parseInt(call.split("-")[1]);
                    call = `<a href="${secret().parsed.web}/lscso#${call}">${m.displayName.match(/\[(.*?)\]/)[0]}</a>`;
                    cmF.push(call);
                }
            });
        }
        if (sborID === "2") {
            if (d.roles[0]) m1 = LSPD.roles.cache.get(d.roles[0]).members, mSize = m1.size;
            if (d.commanderRoles[0]) cm1 = LSPD.roles.cache.get(d.commanderRoles[0]).members;

            m1.forEach(m => {
                let call = m.displayName.match(/\[(.*?)\]/);
                if (!!call) {
                    call = call[1];
                    call = call.split("-")[0].toLowerCase() + parseInt(call.split("-")[1]);
                    call = `<a href="${secret().parsed.web}/lspd#${call}">${m.displayName.match(/\[(.*?)\]/)[0]}</a>`;
                    mF.push(call);
                }
            });
            cm1.forEach(m => {
                let call = m.displayName.match(/\[(.*?)\]/);
                if (!!call) {
                    call = call[1];
                    call = call.split("-")[0].toLowerCase() + parseInt(call.split("-")[1]);
                    call = `<a href="${secret().parsed.web}/lspd#${call}">${m.displayName.match(/\[(.*?)\]/)[0]}</a>`;
                    cmF.push(call);
                }
            });
        }
        if (sborID === "0") {
            m1 = LSPD.roles.cache.get(d.roles[1]).members;
            m2 = LSCSO.roles.cache.get(d.roles[0]).members;
            cm1 = LSPD.roles.cache.get(d.commanderRoles[1]).members;
            cm2 = LSCSO.roles.cache.get(d.commanderRoles[0]).members;
            mSize = m1.size + m2.size;
            m1.forEach(m => {
                let call = m.displayName.match(/\[(.*?)\]/);
                if (!!call) {
                    call = call[1];
                    call = call.split("-")[0].toLowerCase() + parseInt(call.split("-")[1]);
                    call = `<a href="${secret().parsed.web}/lspd#${call}">${m.displayName.match(/\[(.*?)\]/)[0]}</a>`;
                    mF.push(call);
                }
            });
            m2.forEach(m => {
                let call = m.displayName.match(/\[(.*?)\]/);
                if (!!call) {
                    call = call[1];
                    call = call.split("-")[0].toLowerCase() + parseInt(call.split("-")[1]);
                    call = `<a href="${secret().parsed.web}/lscso#${call}">${m.displayName.match(/\[(.*?)\]/)[0]}</a>`;
                    mF.push(call);
                }
            });
            cm1.forEach(m => {
                let call = m.displayName.match(/\[(.*?)\]/);
                if (!!call) {
                    call = call[1];
                    call = call.split("-")[0].toLowerCase() + parseInt(call.split("-")[1]);
                    call = `<a href="${secret().parsed.web}/lspd#${call}">${m.displayName.match(/\[(.*?)\]/)[0]}</a>`;
                    cmF.push(call);
                }
            });
            cm2.forEach(m => {
                let call = (m.displayName.match(/\[(.*?)\]/))[1];
                if (!!call) {
                    call = call[1];
                    call = call.split("-")[0].toLowerCase() + parseInt(call.split("-")[1]);
                    call = `<a href="${secret().parsed.web}/lscso#${call}">${m.displayName.match(/\[(.*?)\]/)[0]}</a>`;
                    cmF.push(call);
                }
            });
        }
        const divName = d.id.slice(1).toUpperCase();
        m = m.filter((mm, i) => i === m.indexOf(mm));
        cm = cm.filter((cc, i) => i === cm.indexOf(cc));

        //console.log(`${d.id} ${sborID} ${mSize} ${m}`);

        let newData = [];
        newData.push(`style="text-align: center; color: white;">${divName}</th>`);
        newData.push(`                <td style="text-align: center;"><input type="checkbox" style="width: 20px; height: 20px;" onclick="return false" ${d.active ? "checked" : ""}/></td>`);
        newData.push(`                <td style="text-align: center;">${mSize !== 0 ? mSize : ""}</td>`);
        newData.push(`                <td>${cmF.join(", ")}</td>`);
        newData.push(`                <td style="white-space: nowrap;">${d.radio || ""}</td>`);
        newData.push(`                <td>${d.fullname || ""}</td>`);
        newData.push(`                <td>${mF.join(", ")}</td>`);

        if (!data.includes(
            `style="text-align: center; color: white;">${divName}</th>`
            + `\r\n                <td style="text-align: center;"><input type="checkbox" style="width: 20px; height: 20px;" onclick="return false" /></td>`
            + `\r\n                <td style="text-align: center;"></td>`
            + `\r\n                <td></td>`
            + `\r\n                <td>${d.radio || ""}</td>`
            + `\r\n                <td>${d.fullname || ""}</td>`
            + `\r\n                <td></td>`
        )) { /**/console.log(d.id); }
        else count++;

        try {
            data = data.replace(
                `style="text-align: center; color: white;">${divName}</th>`
                + `\r\n                <td style="text-align: center;"><input type="checkbox" style="width: 20px; height: 20px;" onclick="return false" /></td>`
                + `\r\n                <td style="text-align: center;"></td>`
                + `\r\n                <td></td>`
                + `\r\n                <td>${d.radio || ""}</td>`
                + `\r\n                <td>${d.fullname || ""}</td>`
                + `\r\n                <td></td>`,
                newData.join("\r\n")
            );
        } catch (e) { console.error(e); }
    });

    console.log(` < [PS/Web] >  div.html generated! (${count} / ${divs.length})`);
    return data;
}

export async function updateBL(bot) {
    let bl = JSON.parse(fs.readFileSync(path.resolve("./db/blacklist.json"), "utf-8")),
        data = fs.readFileSync(path.resolve("./web/blacklist.html"), "utf-8"),
        count = 0,
        newData = [];

    bl.forEach(async (u, i) => {
        if (u.removed) return;
        newData.push(`<tr id="${i + 1}">`);
        newData.push(`        <th scope="row" style="text-align: center; color: white;">${i + 1}</th>`);
        newData.push(`        <td style="text-align: center;">${u.username}</td>`);
        newData.push(`        <td style="text-align: center;">${u.displayName}</td>`);
        newData.push(`        <td style="text-align: center;">${u.name}</td>`);
        newData.push(`        <td style="text-align: center;">${u.id}</td>`);
        newData.push(`        <td style="text-align: center; white-space: normal;">${u.from.reason}</td>`);
        newData.push(`        <td style="text-align: center;">${u.from.timestamp}</td>`);
        newData.push(`        <td style="text-align: center;">${u.from.name}</td>`);
        newData.push(`        <td style="text-align: center;">${u.from.username}</td>`);
        newData.push(`        <td style="text-align: center;">${u.from.displayName}</td>`);
        newData.push(`        <td style="text-align: center;">${u.from.id}</td>`);
        newData.push(`        <td style="text-align: center;"><img src="${bot.LEA.i[u.from.dep]}"width="30" height="30" alt="${u.from.dep}" /></td>`);
        newData.push(`</tr>`);
        count++;
    });

    data = data.replace(
        `REPLACE_HERE`,
        newData.join("\r\n")
    );

    console.log(` < [PS/Web] >  bl.html generated! (${count} / ${bl.length})`);
    return data;
}