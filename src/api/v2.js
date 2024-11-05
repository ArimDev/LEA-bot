import path from "path";
import fetch from "node-fetch";
import fs from "fs";
import { config as secret } from "dotenv";

const apiPath = "/api/v2";

export default async function api(bot, app, server, wss) {

    //LOGIN
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
            console.log(` < [PS/API/v2 | /login/getToken ${tokenResponseData.status}] > Discord data odeslána!`);
            return res.status(tokenResponseData.status).json(Object.assign({ code: tokenResponseData.status }, re));
        } else {
            console.log(tokenResponseData);
            console.log(` < [PS/API/v2 | /login/getToken ${tokenResponseData.status}] > Discord data neodeslána!`);
            return res.status(tokenResponseData.status).json({ code: tokenResponseData.status });
        }
    });

    //DATABASE
    app.get(apiPath + "/db/:dep(LSSD|LSPD)/positions", async (req, res) => {
        const dep = req.params.dep || "LSSD";
        try {
            const pos = await fs.readFileSync((path.resolve("./db/" + dep) + ".json"), "utf-8");
            const posJSON = JSON.parse(pos);
            console.log(` < [PS/API/v2 | /db/${dep}/positions 200] > Pozice odeslány (velikost ${posJSON.length})!`);
            res.status(200).json(posJSON);
        } catch (error) {
            console.log(` < [PS/API/v2 | /db/${dep}/positions 500] > Pozice neodeslány (err: ${error})!`);
            res.status(500).json({ error: "JSON nebyl získán!" });
        }
    });

    app.get(apiPath + "/db/blacklist", async (req, res) => {
        try {
            const bl = await fs.readFileSync((path.resolve("./db/blacklist") + ".json"), "utf-8");
            const blJSON = JSON.parse(bl);
            console.log(` < [PS/API/v2 | /db/blacklist 200] > Blacklist odeslán (velikost ${blJSON.length})!`);
            res.status(200).json(blJSON);
        } catch (error) {
            console.log(` < [PS/API/v2 | /db/blacklist 500] > lacklist odeslán (err: ${error})!`);
            res.status(500).json({ error: "JSON nebyl získán!" });
        }
    });
}