import fs from "fs";
import path from "path";

export async function checkDB(id) {
    const exists = await fs.existsSync((path.resolve("./db/workers") + "/" + id + ".json"));
    return exists;
}

export async function checkEVENT(id) {
    const exists = await fs.existsSync((path.resolve("./db/event") + "/" + id + ".json"));
    return exists;
}