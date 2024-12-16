import path from "path";
import fetch from "node-fetch";
import fs from "fs";
import { config as secret } from "dotenv";
import { getProfile } from "../functions/profiles.js";
const cachePath = path.resolve("./db/cache.json");

const apiPath = "/api/v1";

export default async function api(bot, app) {
    //Login feature
    app.post(apiPath + '/login/getToken', async (req, res) => {
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

    app.post(apiPath + '/login/revokeToken', async (req, res) => {
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
            return res.status(200).json({ code: tokenResponseData.status });
        } else {
            return res.status(tokenResponseData.status).json({ code: tokenResponseData.status });
        }
    });

    app.post(apiPath + "/bot/msg", async (req, res) => {
        const authString = req.headers.authorization;
        const { workerID, folderID, guildID } = req.body;
        const me = await fetch('https://discord.com/api/users/@me', {
            signal: AbortSignal.timeout(5000),
            headers: {
                authorization: authString,
            },
        });
        if (!me.ok) return res.json({ ok: false, sent: false });
        const user = await me.json();
        console.log(` < [PS/Login] > Fetch: ${user.global_name} | ${user.username} | ${user.id}`);

        try {
            const fetched = await bot.users.fetch(user.id);
            const profileEmbed = await getProfile(bot, workerID);
            if (profileEmbed) {
                await fetched.send({ content: "> Odpověď z **LEA-Bot WEB API**:", embeds: [profileEmbed] });
                console.log(` < [PS/API] > Msg: ${user.username} zobrazil(a) ${workerID}`);
                return res.status(200).json({ ok: true, sent: true });
            } else {
                await fetched.send({
                    content: `> **LEA-Bot WEB API:**` + `\nZde je odkaz do složky: https://discord.com/channels/${guildID}/${folderID}`
                });
                console.log(` < [PS/API] > Msg: ${user.username} zobrazil(a) ${workerID}`);
                return res.status(200).json({ ok: true, sent: true });
            }
        } catch (err) {
            console.log(` < [PS/API ${me.status}] > Msg: ${user.username} se pokusil(a) zobrazit ${workerID}, chyba:\n` + err);
            return res.status(500).json({ ok: true, sent: false });
        }
    });

    app.get(apiPath + "/login/getMe", async (req, res) => {
        const authString = req.headers.authorization;
        const me = await fetch('https://discord.com/api/users/@me', {
            signal: AbortSignal.timeout(5000),
            headers: {
                authorization: authString,
            },
        });
        if (!me.ok) return res.status(me.status).json({ code: me.status, passed: false, user: {} });
        const response = await me.json();

        console.log(` < [PS/Login ${me.status}] > Fetch: ${response.global_name} | ${response.username} | ${response.id}`);

        res.status(200).json({ code: me.status, passed: true, user: response });
    });

    app.get(apiPath + "/db/getTable/:dep(LSSD|LSPD|SAHP)", async (req, res) => {
        const origin = req.headers.host;
        if (!origin.includes(secret().parsed.domain)) {
            return res.status(403).json({});
        }

        const dep = req.params.dep || "LSSD";
        const authString = req.headers.authorization;

        let verifyResponse = false;
        try {
            verifyResponse = await fetch(secret().parsed.web + apiPath + "/login/verifyMe/" + dep, {
                method: 'GET',
                headers: {
                    authorization: authString,
                }
            });
        } catch (e) {
            return res.status(500).json({ passed: false, guildID: false, user: {}, member: {}, workers: [] });
        }

        if (!verifyResponse.ok) return res.status(verifyResponse.status).json({ passed: false, guildID: false, user: {}, member: {}, workers: [] });

        const verRep = await verifyResponse.json();
        const { passed } = verRep;

        if (!passed) return res.status(403).json({ passed: false, guildID: verRep.guildID, user: verRep.user, member: verRep.member, workers: [] });

        const guild = await bot.guilds.fetch(bot.LEA.g[dep][0]);
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

            worker.m = guild.members.cache.get(worker.discordID);
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

            if (dep === "LSSD" && worker.m) {
                worker.roles.warn = worker.m.roles.cache.has("1154446248934387830");
                worker.roles.suspend = worker.m.roles.cache.has("1267600894069964911");
                if (worker.m.roles.cache.has("1240021849518112808")) worker.div.push("CID");
                if (worker.m.roles.cache.has("1290357614039007294")) worker.div.push("SRT");
                if (worker.m.roles.cache.has("1252175791966523444")) worker.div.push("ST");
                if (worker.m.roles.cache.has("1251504241768529971")) worker.div.push("FTO");
                if (worker.m.roles.cache.has("1154446248946978950")) worker.div.push("TEU");
                if (worker.m.roles.cache.has("1312862027206885436")) worker.div.push("MBU");
                if (worker.m.roles.cache.has("1242926544574349343")) worker.div.push("ASD");

                if ( //ACCESS TO THE TABLES - Discord roles
                    worker.m.roles.cache.has("1267541873451339806") //Leadership
                    && !worker.m.roles.cache.has("1154446248967938183") //Captain
                    && !worker.m.roles.cache.has("1267588047533248583") //Lieutenant
                ) leadership = true;
                if (
                    !leadership
                    && !worker.roles.omluvenka
                    && (Math.round((worker.hours + Number.EPSILON) * 100) / 100) === 0
                ) hours0 = true;
            } else if (dep === "LSPD" && worker.m) {
                worker.roles.warn = worker.m.roles.cache.has(/* MISSING IDs */);
                worker.roles.suspend = worker.m.roles.cache.has(/* MISSING IDs */);
                if (worker.m.roles.cache.has("xxx" /* MISSING ID */)) worker.div.push("CID");
                if (worker.m.roles.cache.has("xxx" /* MISSING ID */)) worker.div.push("ETF");
                if (worker.m.roles.cache.has("xxx" /* MISSING ID */)) worker.div.push("ST");
                if (worker.m.roles.cache.has("xxx" /* MISSING ID */)) worker.div.push("FTO");
                if (worker.m.roles.cache.has("xxx" /* MISSING ID */)) worker.div.push("RPU");
                if (worker.m.roles.cache.has("xxx" /* MISSING ID */)) worker.div.push("AU");

                //ACCESS TO THE TABLES - Discord role
                if (worker.m.roles.cache.has("xxx" /* MISSING ID */)) leadership = true;
                if (
                    !leadership
                    && !worker.roles.omluvenka
                    && (Math.round((worker.hours + Number.EPSILON) * 100) / 100) === 0
                ) hours0 = true;
            } else if (dep === "SAHP" && worker.m) {
                worker.roles.warn = worker.m.roles.cache.has("1301163398515396674");
                worker.roles.suspend = worker.m.roles.cache.has("1301163398515396672");
                if (worker.m.roles.cache.has("1301163398528241692")) worker.div.push("TRU");
                if (worker.m.roles.cache.has("1305307518943105095")) worker.div.push("ST");
                if (worker.m.roles.cache.has("1301163398540689489")) worker.div.push("CID");
                if (worker.m.roles.cache.has("1301163398528241687")) worker.div.push("FTO");
                if (worker.m.roles.cache.has("1301163398515396675")) worker.div.push("AU");
                if (worker.m.roles.cache.has("1305941319520092242")) worker.div.push("MBU");

                //ACCESS TO THE TABLES - Discord role
                if (worker.m.roles.cache.has("1301163398557339686")) leadership = true;
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

        res.status(200).json({ passed: true, guildID: verRep.guildID, user: verRep.user, member: verRep.member, workers: final });
    });

    app.get(apiPath + "/login/verifyMe/:dep(LSSD|LSPD|SAHP)", async (req, res) => {
        const origin = req.headers.host;
        if (!origin.includes(secret().parsed.domain)) {
            return res.status(403).json({});
        }
        const dep = req.params.dep || "LSSD";
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
                guildID: cached.guildID,
                user: cached.user,
                member: cached.member
            });
        }

        function getNextDep(dep, index) {
            if (dep === "LSPD") {
                if (!index || index === 1) return "LSSD";
                else if (index === 2) return "SAHP";
            } else if (dep === "LSSD") {
                if (!index || index === 1) return "LSPD";
                else if (index === 2) return "SAHP";
            } else if (dep === "SAHP") {
                if (!index || index === 1) return "LSPD";
                else if (index === 2) return "LSSD";
            }
        }

        const roles = { LSSD: "1267541873451339806", LSPD: "xxx" /* MISSING ID */, SAHP: "1301163398557339686" };
        const dojRoles = { LSSD: "1267592715500257343", LSPD: "xxx" /* MISSING ID */, SAHP: "1301163398540689494" };

        const first = await fetch(`https://discord.com/api/users/@me/guilds/${bot.LEA.g[dep][0]}/member`, {
            headers: { authorization: authString }
        });

        if (first.ok) {
            const firstRes = await first.json();
            passed = firstRes.roles.includes(roles[dep]) || firstRes.roles.includes(dojRoles[dep]);
            if (firstRes.user.id === "411436203330502658") passed = true; //b1ngo access

            if (passed) {
                console.log(` < [PS/Login ${first.status}] > Verify: ${firstRes.user.username} verified from ${dep}`);
                cache.push({
                    from: dep,
                    expiry: Date.now() + 3 * 60 * 1000,
                    authorization: authString,
                    guildID: bot.LEA.g[dep][0],
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
                    guildID: bot.LEA.g[dep][0],
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
        }

        const second = await fetch(`https://discord.com/api/users/@me/guilds/${bot.LEA.g[getNextDep(dep, 1)][0]}/member`, {
            headers: { authorization: authString }
        });

        if (second.ok) {
            const secondRes = await second.json();
            passed = secondRes.roles.includes(roles[getNextDep(dep, 1)]) || secondRes.roles.includes(dojRoles[getNextDep(dep, 1)]);

            if (passed) {
                console.log(` < [PS/Login ${second.status}] > Verify: ${secondRes.user.username} verified from ${getNextDep(dep, 1)}`);
                cache.push({
                    expiry: Date.now() + 3 * 60 * 1000,
                    from: getNextDep(dep, 1),
                    authorization: authString,
                    guildID: bot.LEA.g[getNextDep(dep, 1)][0],
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
                    guildID: bot.LEA.g[getNextDep(dep, 1)][0],
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
        }

        const third = await fetch(`https://discord.com/api/users/@me/guilds/${bot.LEA.g[getNextDep(dep, 2)][0]}/member`, {
            headers: { authorization: authString }
        });

        if (third.ok) {
            const thirdRes = await third.json();
            passed = thirdRes.roles.includes(roles[getNextDep(dep, 2)]) || thirdRes.roles.includes(dojRoles[getNextDep(dep, 2)]);

            if (passed) {
                console.log(` < [PS/Login ${third.status}] > Verify: ${thirdRes.user.username} verified from ${getNextDep(dep, 2)}`);
                cache.push({
                    from: dep.toUpperCase(),
                    expiry: Date.now() + 3 * 60 * 1000,
                    authorization: authString,
                    guildID: bot.LEA.g[dep][0],
                    user: {
                        id: thirdRes.user.id,
                        username: thirdRes.user.username,
                        displayName: thirdRes.user.global_name,
                        avatar: thirdRes.user.avatar,
                        banner: thirdRes.user.banner
                    },
                    member: {
                        nickname: thirdRes.nick,
                        avatar: thirdRes.avatar,
                        banner: thirdRes.banner,
                        bio: thirdRes.bio
                    }
                });
                fs.writeFileSync(path.resolve("./db/cache.json"), JSON.stringify(cache, null, 4), "utf-8");
                return res.status(200).json({
                    code: first.status,
                    passed,
                    guildID: bot.LEA.g[dep][0],
                    user: {
                        id: thirdRes.user.id,
                        username: thirdRes.user.username,
                        displayName: thirdRes.user.global_name,
                        avatar: thirdRes.user.avatar,
                        banner: thirdRes.user.banner
                    },
                    member: {
                        nickname: thirdRes.nick,
                        avatar: thirdRes.avatar,
                        banner: thirdRes.banner,
                        bio: thirdRes.bio
                    }
                });
            } else {
                console.log(` < [PS/Login ${third.status}] > Verify: ${thirdRes.user.username} has not been verified (not leadership).`);
                return res.status(200).json({
                    code: third.status,
                    passed,
                    guildID: bot.LEA.g[getNextDep(dep, 2)][0],
                    user: {
                        id: thirdRes.user.id,
                        username: thirdRes.user.username,
                        displayName: thirdRes.user.global_name,
                        avatar: thirdRes.user.avatar,
                        banner: thirdRes.user.banner
                    },
                    member: {
                        nickname: thirdRes.nick,
                        avatar: thirdRes.avatar,
                        banner: thirdRes.banner,
                        bio: thirdRes.bio
                    }
                });
            }
        }

        console.log(` < [PS/Login ${third.status}] > Verify: ` + "XXX" + ` has not been verified (last [${getNextDep(dep, 2)}] verify check failed)`);
        return res.status(403).json({ code: third.status, passed: false, user: {}, member: {} });
    });
}