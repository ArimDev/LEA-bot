import express from "express";
import path from "path";
import { updateDiv, updateBL } from "../../web/script.js";
import { config as secret } from "dotenv";

export default async function web(bot) {
    const app = express();

    app.set('trust proxy', true);
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

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
        res.status(200).sendFile(path.resolve("./web/index/index.html"));
    });

    app.get('/', (req, res) => {
        console.log(` < [PS/Web] >  Got ${req.path} ${req.method} request!`);
        res.status(200).sendFile(path.resolve("./web/index/index.html"));
    });

    app.get('/lspd', async function (req, res) {
        console.log(` < [PS/Web] >  Got ${req.path} ${req.method} request!`);
        res.status(200).sendFile(path.resolve("./web/LSPD/LSPD.html"));
    });

    app.get('/lssd', async function (req, res) {
        console.log(` < [PS/Web] >  Got ${req.path} ${req.method} request!`);
        res.status(200).sendFile(path.resolve("./web/LSSD/LSSD.html"));
    });

    app.get('/divize', async function (req, res) {
        console.log(` < [PS/Web] >  Got ${req.path} ${req.method} request!`);
        res.status(200).send(await updateDiv(bot));
        //res.sendFile(path.resolve("./web/divize.html"));
    });

    app.get('/blacklist', async function (req, res) {
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

    //REDIRECTS
    app.get('/bl', (req, res) => {
        res.redirect('/blacklist');
    });

    app.get('/div', (req, res) => {
        res.redirect('/divize');
    });

    function giveStatic(req, res) {
        const filePath = path.resolve(`./web${req.path}`);
        res.status(200).sendFile(filePath);
    }

    app.get('/index/assets', (req, res) => {
        fs.readdir(path.resolve(`./web/index/assets`), (err, files) => {
            if (err) {
                console.error('Chyba při čtení složky:', err);
                return res.status(500).send('Nastala chyba při čtení složky');
            }
            res.json(files);
        });
    });

    app.use('/index/assets', express.static(path.resolve(`./web/index/assets`)));
    app.get('/index/script.js', giveStatic);
    app.get('/index/style.css', giveStatic);
    app.get('/LSSD/script.js', giveStatic);
    app.get('/LSSD/style.css', giveStatic);
    app.get('/LSPD/script.js', giveStatic);
    app.get('/LSPD/style.css', giveStatic);

    return app;
}