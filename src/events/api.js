import path from "path";
import fetch from "node-fetch";
import fs from "fs";
import { config as secret } from "dotenv";

export default async function api(bot, app) {
    //Login feature
    app.post('/api/login/getToken', async (req, res) => {
        const tokenResponseData = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            body: new URLSearchParams({
                client_id: secret().parsed.botClientID,
                client_secret: secret().parsed.botClientSecret,
                code: req.body.code,
                grant_type: 'authorization_code',
                redirect_uri: secret().parsed.web,
                scope: 'identify+guilds+guilds.members.read',
            }).toString(),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        return res.json(await tokenResponseData.json());
    });

    app.get("/api/login/getMe", async (req, res) => {
        const authString = req.headers.authorization;
        const me = await fetch('https://discord.com/api/users/@me', {
            headers: {
                authorization: authString,
            },
        });
        if (!me.ok) return false;
        const response = await me.json();
        const { id, global_name } = response;

        console.log(` < [PS/Login] > Fetch: ${response.global_name} | ${response.username} | ${response.id}`);

        res.json({ id, global_name });
    });

    app.get("/api/db/getTable/:dep(LSSD|LSPD)", async (req, res) => {
        const dep = req.params.dep;
        const authString = req.headers.authorization;
        const verifyResponse = await fetch(secret().parsed.web + "/api/login/verifyMe", {
            method: 'GET',
            headers: {
                authorization: authString,
            },
        });
        if (!verifyResponse.ok) return res.json({ passed: false, username: "xxx", id: "000", displayName: "XXX", workers: [] });
        const { passed, username, id, displayName, avatar } = await verifyResponse.json();
        if (!passed) return res.json({ passed: false, username, id, displayName, avatar, workers: [] });

        const guild = await bot.guilds.fetch(dep === "LSSD" ? "1139266097921675345" : "1154446248934387828");
        await guild.members.fetch();

        let final = [], workers = 0;
        const db = fs.readdirSync(path.resolve("./db/" + dep)).filter(file => file.endsWith(".json") && file !== "000000000000000001.json");
        for (const file of db) {
            let worker = JSON.parse(fs.readFileSync((path.resolve("./db/" + dep) + "/" + file), "utf-8"));

            worker.discordID = file.split(".json")[0],
                worker.tag = worker.radio.toLowerCase().replaceAll("-", ""),
                worker.header = { red: false };
            let hours0 = false,
                moHours = 0;

            worker.m = await guild.members.cache.get(worker.discordID);
            worker.u = worker.m?.user || false;
            if (!worker.m) worker.header.red = true, worker.m = false;

            worker.roles = { omluvenka: false, warn: false, suspend: false, redat: false }, worker.div = [];
            for (const a of worker.apologies) {
                if (a.removed) continue;
                const startDateArr = a.start.split(". ");
                const startDate = new Date(startDateArr[1] + "/" + startDateArr[0] + "/" + startDateArr[2]);
                const endDateArr = a.end.split(". ");
                const endDate = new Date(endDateArr[1] + "/" + endDateArr[0] + "/" + endDateArr[2]);
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                if (now.getTime() >= startDate.getTime() && now.getTime() <= endDate.getTime()) {
                    worker.roles.omluvenka = true;
                    break;
                }
            }

            if (dep === "LSSD" && worker.m) { //ONLY LSSD!
                worker.roles.warn = worker.m.roles.cache.has("1139379787324997722");
                worker.roles.suspend = worker.m.roles.cache.has("1139379875610898522");
                if (worker.m.roles.cache.has("1139275625740370001")) worker.div.push("SRT");
                if (worker.m.roles.cache.has("1139296112117817534")) worker.div.push("DEA");
                if (worker.m.roles.cache.has("1139293160602874066")) worker.div.push("ST");
                if (worker.m.roles.cache.has("1139294859354710188")) worker.div.push("AU");
                if (worker.m.roles.cache.has("1139297065063690315")) worker.div.push("TU");
                if (worker.m.roles.cache.has("1139298429391089685")) worker.div.push("MBU");
                if (worker.m.roles.cache.has("1139295387266580652")) worker.div.push("FTO");
                if (worker.m.roles.cache.has("1139297368450277376")) worker.div.push("CID");
                if (
                    !worker.m.roles.cache.has("1139267137651884072")
                    && !worker.roles.omluvenka
                    && (Math.round((worker.hours + Number.EPSILON) * 100) / 100) === 0
                ) hours0 = true;
            } else if (dep === "LSPD" && worker.m) {
                worker.roles.warn = worker.m.roles.cache.has("1154446248934387830");
                worker.roles.suspend = worker.m.roles.cache.has("1154446248934387831");
                if (worker.m.roles.cache.has("1205534460733296700")) worker.div.push("METRO");
                if (worker.m.roles.cache.has("1154446248934387836")) worker.div.push("SWAT");
                if (worker.m.roles.cache.has("1154446248946978950")) worker.div.push("MBU");
                if (worker.m.roles.cache.has("1154446248946978948")) worker.div.push("AU");
                if (worker.m.roles.cache.has("1156133057393336331")) worker.div.push("FTO");
                if (worker.m.roles.cache.has("1154446248934387832")) worker.div.push("ST");
                if (
                    !worker.m.roles.cache.has("1154446248967938179")
                    && !worker.roles.omluvenka
                    && (Math.round((worker.hours + Number.EPSILON) * 100) / 100) === 0
                ) hours0 = true;
            }

            if (worker.roles.suspend || hours0) worker.header.red = true;

            await worker.duties.filter(d => !d.removed).forEach(function (duty) {
                const dutyDateArr = duty.date.split(". ");
                const dutyDate = new Date(dutyDateArr[1] + "/" + dutyDateArr[0] + "/" + dutyDateArr[2]).getTime();
                const todayDate = new Date().getTime();
                const ms30days = 1000 * 60 * 60 * 24 * 30;

                if (todayDate - dutyDate < ms30days) moHours = moHours + duty.hours;
            });

            worker.hours0 = hours0;
            final.push(worker);
            workers++;
        }

        console.log(` < [PS/Login] > Tables generated: ${dep} (${workers}w) | ${displayName} | ${username} | ${id}`);

        res.json({ passed: true, username, id, displayName, avatar, workers: final });
    });

    app.get("/api/login/verifyMe", async (req, res) => {
        const authString = req.headers.authorization;
        let me, lssd, lspd, meR, lssdR, lspdR, r, rBy, passed = false;

        lssd = await fetch('https://discord.com/api/users/@me/guilds/1139266097921675345/member', {
            headers: {
                authorization: authString,
            },
        });

        if (lssd.ok) {
            lssdR = await lssd.json();
            passed = lssdR.roles.includes("1139267137651884072");
        } else {
            me = await fetch('https://discord.com/api/users/@me', {
                headers: {
                    authorization: authString,
                },
            });
            if (!me.ok) {
                console.log(" < [PS/Login] > Verify: " + "XXX" + " has not been verified");
                return res.json({ passed: false, username: undefined, id: undefined, displayName: undefined, avatar: undefined });
            } else if (me.ok) meR = await me.json();
        }

        if (!passed) {
            lspd = await fetch('https://discord.com/api/users/@me/guilds/1154446248934387828/member', {
                headers: {
                    authorization: authString,
                },
            });
            if (lspd.ok) {
                lspdR = await lspd.json();
                passed = lspdR.roles.includes("1154446248967938179");
                if (passed) r = lspdR, rBy = "LSPD";
                else r = lspdR, rBy = false;
            }
        } else if (lssd.ok) r = lssdR, rBy = "LSSD";
        else if (!lssd.ok) r = undefined, rBy = null;

        if (!lssd.ok && me.ok) {
            console.log(" < [PS/Login] > Verify: " + meR.user.username + " has not been verified (LSSD verify check failed)");
            return res.json({ passed: false, username: meR.user.username, id: meR.user.id, displayName: meR.user.global_name, avatar: meR.user.avatar });
        }

        if (passed) console.log(" < [PS/Login] > Verify: " + r.user.username + " verified from " + rBy);
        else console.log(" < [PS/Login] > Verify: " + "XXX" + " has not been verified");
        return res.json({ passed, username: r?.user.username, id: r?.user.id, displayName: r?.user.global_name, avatar: r?.user.avatar });
    });

    //DONE
    app.listen(secret().parsed.webPort, () => {
        console.log(` < [PS/Web] >  LEA Bot tables are now available at IP:${secret().parsed.webPort}!`);
    });
}