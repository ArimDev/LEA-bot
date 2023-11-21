import fs from "fs";
import path from "path";
import util from "util";

export function dg(date, option) {
    if (option === "Month") return parseInt(date["get" + option]()) + 1;
    if (option === "FullYear" || "Date") return parseInt(date["get" + option]());
    return parseInt(date["get" + option]()) > 10 ? date["get" + option]() : "0" + date["get" + option]();
}

export async function setup() {
    const date = new Date();

    async function getWriteStream() {
        let files = await fs.readdirSync(path.resolve("./logs/"));

        console.log(dg(date, "FullYear") + "-" + dg(date, "Month") + "-" + dg(date, "Date"));
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

    console.log = async function (d) {
        const date = new Date();
        const time = dg(date, "Hours") + ":" + dg(date, "Minutes") + ":" + dg(date, "Seconds");
        logStream.write(`[${time} LOG] ${util.format(d)}` + "\n");
        logStdout.write(`[${time} LOG] ${util.format(d)}` + "\n");
    };

    console.error = function (d) {
        const date = new Date();
        const time = dg(date, "Hours") + ":" + dg(date, "Minutes") + ":" + dg(date, "Seconds");
        logStream.write(`[${time} ERR] ${util.format(d)}` + "\n");
        logStdout.write(`[${time} ERR] ${util.format(d)}` + "\n");
    };

    console.warn = function (d) {
        const date = new Date();
        const time = dg(date, "Hours") + ":" + dg(date, "Minutes") + ":" + dg(date, "Seconds");
        logStream.write(`[${time} WAR] ${util.format(d)}` + "\n");
        logStdout.write(`[${time} WAR] ${util.format(d)}` + "\n");
    };
}