/*
better-sqlite3 docs
https://github.com/JoshuaWise/better-sqlite3/blob/master/docs/api.md
*/
const Database = require('better-sqlite3');

function newDatabase(name, verbose) {
    return new Database(`${__dirname}/${name}.db`, {
        fileMustExist: false,
        timeout: 7000
    });
}

module.exports = class Database {
    constructor(name) {
        this.name = name;
        this.db = newDatabase(this.name);
        this.prepare();
        this.save = this.db.prepare(`INSERT INTO ${name} VALUES (?)`);
    }
    prepare() {
        const tables = this.db.prepare(
            `SELECT count(*) FROM sqlite_master WHERE type='table' AND name='${this.name}';`
        ).get();
        if (!tables['count(*)']) {
            this.db.prepare(
                `CREATE TABLE ${this.name} (id TEXT PRIMARY KEY);`
            ).run();
            this.db.prepare(
                `CREATE UNIQUE INDEX idx_${this.name}_id ON ${this.name} (id);`
            ).run();
            this.db.pragma("synchronous = 1");
            this.db.pragma("journal_mode = wal");
        }
    }

    async checkID(id) {
        return new Promise(async (resolve, reject) => {
            let found = await this.db.prepare(`SELECT id FROM ${this.name} where id = ?`).get(id);
            resolve(found);
        });
    }
    async saveID(id) {
        return new Promise(async (resolve, reject) => {
            const saved = this.save.run(id);
            resolve(saved);
        });
    }

}