import fs from "fs";
import path from "path";
import util from "util";

export function dg(date, option) {
    let r;
    if (option === "Month") r = parseInt(date["get" + option]()) + 1;
    else if (option === "FullYear" || option === "Date") r = date["get" + option]();
    else {
        if (parseInt(date["get" + option]()) < 10) {
            r = "0" + date["get" + option]();
        } else {
            r = date["get" + option]();
        }
    }

    return r.toString();
}

export async function setup() {
    const date = new Date();

    async function getWriteStream() {
        let files = await fs.readdirSync(path.resolve("./logs/"));

        files = await files.filter((d) => d.includes((dg(date, "FullYear") + "-" + dg(date, "Month") + "-" + dg(date, "Date"))));

        if (files[0]) await files.forEach((f, i) => {
            files[i] = parseInt(f.split("_")[1].split(".log")[0]);
        });

        const index = files[0] ? (Math.max(...files) + 1) : 1;
        return fs.createWriteStream(
            path.resolve(
                "./logs/"
                + dg(date, "FullYear") + "-" + dg(date, "Month") + "-" + dg(date, "Date") + "_" + index
                + ".log"
            ),
            { flags: 'wx' });
    }

    const logStream = await getWriteStream();
    const logStdout = process.stdout;

    console.log = function (d) {
        const day = dg(date, "Date") + ":" + dg(date, "Month") + ":" + dg(date, "FullYear");
        const time = dg(date, "Hours") + ":" + dg(date, "Minutes") + ":" + dg(date, "Seconds");
        logStream.write(`[${day} | ${time} LOG] ${util.format(d)}` + "\n");
        logStdout.write(`[${day} | ${time} LOG] ${util.format(d)}` + "\n");
    };

    console.error = function (d) {
        const day = dg(date, "Date") + ":" + dg(date, "Month") + ":" + dg(date, "FullYear");
        const time = dg(date, "Hours") + ":" + dg(date, "Minutes") + ":" + dg(date, "Seconds");
        logStream.write(`[${day} | ${time} ERR] ${util.format(d)}` + "\n");
        logStdout.write(`[${day} | ${time} ERR] ${util.format(d)}` + "\n");
    };

    console.warn = function (d) {
        const day = dg(date, "Date") + ":" + dg(date, "Month") + ":" + dg(date, "FullYear");
        const time = dg(date, "Hours") + ":" + dg(date, "Minutes") + ":" + dg(date, "Seconds");
        logStream.write(`[${day} | ${time} WAR] ${util.format(d)}` + "\n");
        logStdout.write(`[${day} | ${time} WAR] ${util.format(d)}` + "\n");
    };
}