import express from "express";
import path from "path";
import { update, updateDiv, updateBL } from "../../web/script.js";
import { config as secret } from "dotenv";

export default async function web(bot) {
    const app = express();

    app.set('trust proxy', true);
    app.use(express.json());

    app.use((req, res, next) => {
        if (req.hostname === secret().parsed.domain && req.headers.host.includes(':')) {
            const subdomain = 'leabot';
            const newHost = `${subdomain}.${req.hostname}`;
            return res.redirect(301, `${req.protocol}://${newHost}${req.url}`);
        }
        next();
    });

    //SITES
    app.get('/', (req, res) => {
        console.log(` < [PS/Web] >  Got ${req.path} ${req.method} request!`);
        res.sendFile(path.resolve("./web/index/index.html"));
    });
    app.get('/', (req, res) => {
        console.log(` < [PS/Web] >  Got ${req.path} ${req.method} request!`);
        res.sendFile(path.resolve("./web/index/index.html"));
    });

    app.get('/lspd', async function (req, res) {
        console.log(` < [PS/Web] >  Got ${req.path} ${req.method} request!`);
        //res.send(await update(bot, 1));
        res.sendFile(path.resolve("./web/LSPD/LSPD.html"));
    });

    app.get('/lssd', async function (req, res) {
        console.log(` < [PS/Web] >  Got ${req.path} ${req.method} request!`);
        //res.send(await update(bot, 2));
        res.sendFile(path.resolve("./web/LSSD/LSSD.html"));
    });

    app.get('/divize', async function (req, res) {
        console.log(` < [PS/Web] >  Got ${req.path} ${req.method} request!`);
        res.send(await updateDiv(bot));
        //res.sendFile(path.resolve("./web/divize.html"));
    });

    app.get('/blacklist', async function (req, res) {
        console.log(` < [PS/Web] >  Got ${req.path} ${req.method} request!`);
        res.send(await updateBL(bot));
        //res.sendFile(path.resolve("./web/blacklist.html"));
    });

    //REDIRECTS
    app.get('/bl', (req, res) => {
        res.redirect('/blacklist');
    });

    app.get('/div', (req, res) => {
        res.redirect('/divize');
    });

    function giveStatic(req, res) {
        const filePath = path.resolve(`./web${req.path}`);
        res.sendFile(filePath);
    }

    app.get('/index/script.js', giveStatic);
    app.get('/index/style.css', giveStatic);
    app.get('/LSSD/script.js', giveStatic);
    app.get('/LSSD/style.css', giveStatic);
    app.get('/LSPD/script.js', giveStatic);
    app.get('/LSPD/style.css', giveStatic);

    return app
}