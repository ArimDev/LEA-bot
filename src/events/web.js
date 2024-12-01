import express from "express";
import path from "path";
import { updateDiv, updateBL } from "../../web/script.js";
import { config as secret } from "dotenv";

export default async function web(bot, app) {
    //app.set('trust proxy', true);

    /*app.use((req, res, next) => {
        if (req.hostname === secret().parsed.domain && req.headers.host.includes(':')) {
            const subdomain = 'leabot';
            const newHost = `${subdomain}.${req.hostname}`;
            return res.redirect(301, `${req.protocol}://${newHost}${req.url}`);
        }
        next();
    });*/

    //SITES
    app.get('/old/', (req, res) => {
        console.log(` < [PS/Web] >  Got ${req.path} ${req.method} request!`);
        res.status(200).sendFile(path.resolve("./web/index/index.html"));
    });

    app.get('/old/lscso', async function (req, res) {
        console.log(` < [PS/Web] >  Got ${req.path} ${req.method} request!`);
        res.status(200).sendFile(path.resolve("./web/LSCSO/LSCSO.html"));
    });

    app.get('/old/divize', async function (req, res) {
        console.log(` < [PS/Web] >  Got ${req.path} ${req.method} request!`);
        res.status(200).send(await updateDiv(bot));
        //res.sendFile(path.resolve("./web/divize.html"));
    });

    app.get('/old/blacklist', async function (req, res) {
        console.log(` < [PS/Web] >  Got ${req.path} ${req.method} request!`);
        res.status(200).send(await updateBL(bot));
        //res.sendFile(path.resolve("./web/blacklist.html"));
    });

    app.get('/502', async function (req, res) {
        res.status(502).sendFile(secret().parsed.errorPath + "/nginx502.html");
    });

    app.get('/404', async function (req, res) {
        res.status(404).sendFile(secret().parsed.errorPath + "/nginx404.html");
    });

    function giveStatic(req, res) {
        const requestedPath = req.path.replace('/old', '');
        const filePath = path.resolve(`./web${requestedPath}`);
        res.status(200).sendFile(filePath);
    }

    app.use('/old/index/assets', express.static(path.resolve(`./web/index/assets`)));
    app.get('/old/index/script.js', giveStatic);
    app.get('/old/index/style.css', giveStatic);
    app.get('/old/LSCSO/script.js', giveStatic);
    app.get('/old/LSCSO/style.css', giveStatic);
}