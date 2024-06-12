import path from "path";
import fetch from "node-fetch";
import fs from "fs";
import { config as secret } from "dotenv";
import { getProfile } from "../../src/functions/profiles.js";
const cachePath = path.resolve("./db/cache.json");

export default async function api(bot, app, server, wss) {
    //Login feature
    app.post('/api/login/getToken', async (req, res) => {
        const tokenResponseData = await fetch('https://discord.com/api/oauth2/token', {
            signal: AbortSignal.timeout(5000),
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

        if (tokenResponseData.ok) {
            console.log(` < [PS/API ${tokenResponseData.status}] > Získán Discord token po přihlášení!`);
            const re = await tokenResponseData.json();
            return res.json(Object.assign({ code: tokenResponseData.status }, re));
        } else {
            return res.json({ code: tokenResponseData.status });
        }
    });

    app.post('/api/login/revokeToken', async (req, res) => {
        const authString = req.headers.authorization;
        const tokenResponseData = await fetch('https://discord.com/api/oauth2/token/revoke', {
            signal: AbortSignal.timeout(5000),
            method: 'POST',
            body: new URLSearchParams({
                client_id: secret().parsed.botClientID,
                client_secret: secret().parsed.botClientSecret,
                token: authString.split(" ")[1],
                token_type: authString.split(" ")[0],
                token_type_hin: "access_token",
                scope: 'identify+guilds+guilds.members.read',
            }).toString(),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        if (tokenResponseData.ok) {
            console.log(` < [PS/API ${tokenResponseData.status}] > Discord token byl smazán!`);
            return res.json({ code: tokenResponseData.status });
        } else {
            return res.json({ code: tokenResponseData.status });
        }
    });

    app.post("/api/bot/msg", async (req, res) => {
        const authString = req.headers.authorization;
        console.log(req.body);
        const { workerID, folderID, guildID } = req.body;
        const me = await fetch('https://discord.com/api/users/@me', {
            signal: AbortSignal.timeout(5000),
            headers: {
                authorization: authString,
            },
        });
        if (!me.ok) return res.json({ ok: false, sent: false });;
        const user = await me.json();
        console.log(` < [PS/Login] > Fetch: ${user.global_name} | ${user.username} | ${user.id}`);

        try {
            const fetched = await bot.users.fetch(user.id);
            const profileEmbed = await getProfile(bot, workerID);
            if (profileEmbed) {
                await fetched.send({ content: "> Odpověď z **LEA-Bot WEB API**:", embeds: [profileEmbed] });
                console.log(` < [PS/API] > Msg: ${user.username} zobrazil(a) ${workerID}`);
                return res.status(200).json({ ok: true, sent: true });;
            } else {
                await fetched.send({
                    content: `> **LEA-Bot WEB API:**` + `\nZde je odkaz do složky: https://discord.com/channels/${guildID}/${folderID}`
                });
                console.log(` < [PS/API] > Msg: ${user.username} zobrazil(a) ${workerID}`);
                return res.status(200).json({ ok: true, sent: true });;
            }
        } catch (err) {
            console.log(` < [PS/API ${me.status}] > Msg: ${user.username} se pokusil(a) zobrazit ${workerID}, chyba:\n` + err);
            return res.status(500).json({ ok: true, sent: false });;
        }
    });

    app.get("/api/login/getMe", async (req, res) => {
        const authString = req.headers.authorization;
        const me = await fetch('https://discord.com/api/users/@me', {
            signal: AbortSignal.timeout(5000),
            headers: {
                authorization: authString,
            },
        });
        if (!me.ok) return res.status(me.status).json({ code: me.status, passed: false, user: {} });;
        const response = await me.json();

        console.log(` < [PS/Login ${me.status}] > Fetch: ${response.global_name} | ${response.username} | ${response.id}`);

        res.status(200).json({ code: me.status, passed: true, user: response });
    });

    app.get("/api/db/getTable/:dep(LSSD|LSPD)", async (req, res) => {
        const origin = req.headers.host;
        if (!origin.includes(secret().parsed.domain)) {
            return res.status(403).json({});
        }
        const dep = req.params.dep || "LSSD";
        const authString = req.headers.authorization;
        const verifyResponse = await fetch(secret().parsed.web + "/api/login/verifyMe/" + dep, {
            signal: AbortSignal.timeout(5000),
            method: 'GET',
            headers: {
                authorization: authString,
            }
        });
        if (!verifyResponse.ok) return res.status(500).json({ passed: false, user: {}, member: {}, workers: [] });
        const verRep = await verifyResponse.json();
        const { passed } = verRep;
        if (!passed) return res.status(403).json({ passed: false, user: verRep.user, member: verRep.member, workers: [] });

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
                leadership = false,
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

                if (worker.m.roles.cache.has("1139267137651884072")) leadership = true;
                if (
                    !leadership
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

                if (worker.m.roles.cache.has("1154446248967938179")) leadership = true;
                if (
                    !leadership
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
            worker.leadership = leadership;
            final.push(worker);
            workers++;
        }

        console.log(` < [PS/Login ${verifyResponse.status}] > Tables generated: ${dep} (${workers}w) | ${verRep.user.displayName} | ${verRep.user.username} | ${verRep.user.id}`);

        res.status(200).json({ passed: true, user: verRep.user, member: verRep.member, workers: final });
    });

    app.get("/api/login/verifyMe/:dep(LSSD|LSPD)", async (req, res) => {
        const origin = req.headers.host;
        if (!origin.includes(secret().parsed.domain)) {
            return res.status(403).json({});
        }
        const dep = req.params.dep.toLowerCase() || "lssd";
        const authString = req.headers.authorization;
        let passed = false;

        const cache = JSON.parse(fs.readFileSync(cachePath));
        let updatedCache = cache.filter(c => c.expiry > Date.now());
        if (updatedCache.length !== cache.length) {
            console.log(` < [API/Cache] > Cache was updated! (${cache.length - updatedCache.length} were outdated)`);
            fs.writeFileSync(cachePath, JSON.stringify(updatedCache, null, 4));
        }

        const cached = updatedCache.find(c => c.authorization === authString);
        if (cached) {
            console.log(` < [PS/Login] > Verify: ${cached.user.username} verified from cache (${cached.from})!`);
            return res.status(200).json({
                code: 200,
                passed: true,
                user: cached.user,
                member: cached.member
            });
        }

        const deps = { lssd: "1139266097921675345", lspd: "1154446248934387828" };
        const roles = { lssd: "1139267137651884072", lspd: "1154446248967938179" };

        const first = await fetch(`https://discord.com/api/users/@me/guilds/${deps[dep]}/member`, {
            signal: AbortSignal.timeout(5000),
            headers: { authorization: authString }
        });

        if (first.ok) {
            const firstRes = await first.json();
            passed = firstRes.roles.includes(roles[dep]);
            if (passed) {
                console.log(` < [PS/Login ${first.status}] > Verify: ${firstRes.user.username} verified from ${req.params.dep}`);
                cache.push({
                    from: dep.toUpperCase(),
                    expiry: Date.now() + 3 * 60 * 1000,
                    authorization: authString,
                    user: {
                        id: firstRes.user.id,
                        username: firstRes.user.username,
                        displayName: firstRes.user.global_name,
                        avatar: firstRes.user.avatar,
                        banner: firstRes.user.banner
                    },
                    member: {
                        nickname: firstRes.nick,
                        avatar: firstRes.avatar,
                        banner: firstRes.banner,
                        bio: firstRes.bio
                    }
                });
                fs.writeFileSync(path.resolve("./db/cache.json"), JSON.stringify(cache, null, 4), "utf-8");
                return res.status(200).json({
                    code: first.status,
                    passed,
                    user: {
                        id: firstRes.user.id,
                        username: firstRes.user.username,
                        displayName: firstRes.user.global_name,
                        avatar: firstRes.user.avatar,
                        banner: firstRes.user.banner
                    },
                    member: {
                        nickname: firstRes.nick,
                        avatar: firstRes.avatar,
                        banner: firstRes.banner,
                        bio: firstRes.bio
                    }
                });
            }
        } else {
            const second = await fetch(`https://discord.com/api/users/@me/guilds/${deps[dep === "lssd" ? "lspd" : "lssd"]}/member`, {
                signal: AbortSignal.timeout(5000),
                headers: { authorization: authString }
            });
            if (second.ok) {
                const secondRes = await second.json();
                passed = secondRes.roles.includes(roles[dep === "lssd" ? "lspd" : "lssd"]);
                if (passed) {
                    console.log(` < [PS/Login ${second.status}] > Verify: ${secondRes.user.username} verified from ${dep === "lssd" ? "LSPD" : "LSSD"}`);
                    cache.push({
                        expiry: Date.now() + 3 * 60 * 1000,
                        from: dep === "lssd" ? "LSPD" : "LSSD",
                        authorization: authString,
                        user: {
                            id: secondRes.user.id,
                            username: secondRes.user.username,
                            displayName: secondRes.user.global_name,
                            avatar: secondRes.user.avatar,
                            banner: secondRes.user.banner
                        },
                        member: {
                            nickname: secondRes.nick,
                            avatar: secondRes.avatar,
                            banner: secondRes.banner,
                            bio: secondRes.bio
                        }
                    });
                    fs.writeFileSync(path.resolve("./db/cache.json"), JSON.stringify(cache, null, 4), "utf-8");
                    return res.status(200).json({
                        code: second.status,
                        passed,
                        user: {
                            id: secondRes.user.id,
                            username: secondRes.user.username,
                            displayName: secondRes.user.global_name,
                            avatar: secondRes.user.avatar,
                            banner: secondRes.user.banner
                        },
                        member: {
                            nickname: secondRes.nick,
                            avatar: secondRes.avatar,
                            banner: secondRes.banner,
                            bio: secondRes.bio
                        }
                    });
                } else {
                    console.log(` < [PS/Login ${second.status}] > Verify: ${secondRes.user.username} has not been verified (not leadership).`);
                    return res.status(200).json({
                        code: second.status,
                        passed,
                        user: {
                            id: secondRes.user.id,
                            username: secondRes.user.username,
                            displayName: secondRes.user.global_name,
                            avatar: secondRes.user.avatar,
                            banner: secondRes.user.banner
                        },
                        member: {
                            nickname: secondRes.nick,
                            avatar: secondRes.avatar,
                            banner: secondRes.banner,
                            bio: secondRes.bio
                        }
                    });
                }
            } else {
                console.log(` < [PS/Login ${first.status}] > Verify: ` + "XXX" + " has not been verified (LSSD verify check failed)");
                return res.status(500).json({ code: first.status, passed: false, user: {}, member: {} });
            }
        }
    });

    app.use((req, res) => {
        res.status(404).sendFile(secret().parsed.errorPath + "/nginx404.html");
    });

    server.listen(secret().parsed.webPort, () => {
        console.log(` < [PS/Web] >  LEA Bot tables are now available at IP:${secret().parsed.webPort}!`);
    });
}