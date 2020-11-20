const sqlite3 = require('sqlite3').verbose();
module.exports = {
    getAll() {
        return getAllCity();
    },
    add(city) {
        return addCity(city);
    },
    deleteCity(city) {
        return deleteCity(city);
    }
};

function getDatabase() {
    let db = new sqlite3.Database('favorites.db', (err) => {
        if (err) {
            return console.error(err);
        }

        console.log('Connected to SQlite database.');
    });
    db.run('CREATE TABLE IF NOT EXISTS favorites(city text UNIQUE)');
    return db;
}

function getCity(city) {
    return new Promise((resolve, reject) => {
        let db = getDatabase();
        db.get(`SELECT City as city
        FROM favorites WHERE city = ?`, [city], (err, row) => {
            if (err) {
                reject(err);
                db.close();
                console.error(err.message);
                return
            }
            resolve(row);
            db.close();
            console.log(row);
        });
    })
}

function addCity(city) {
    return new Promise(async (resolve, reject) => {
        let db = getDatabase();
        getCity(city).then(row => {
            if (row != null) {
                console.log("Rejecting with 208")
                reject({ message: "Already added", status: 208 })
            } else {
                db.run(`INSERT INTO favorites(city) VALUES(?)`, [city], function (err) {
                    if (err) {
                        err.status = 500
                        reject(err);
                        db.close();
                        console.error(err);
                        return;
                    }
                    resolve(city);
                    db.close();
                    console.log("Added " + city);
                });
            }
        })

    })
}

function getAllCity() {
    return new Promise((resolve, reject) => {
        let db = getDatabase();
        db.serialize(() => {
            db.all(`SELECT City as city
                 FROM favorites`, (err, rows) => {
                if (err) {
                    reject(err);
                    db.close();
                    console.error(err.message);
                    return;
                }

                resolve(rows);
                db.close();
                console.log(rows);
            });
        });
    })
}

function deleteCity(city) {
    return new Promise((resolve, reject) => {
        let db = getDatabase()
        db.run(`DELETE FROM favorites WHERE city=?`, city, function (err) {
            if (err) {
                reject(err);
                db.close;
                console.error(err);
                return;
            }
            resolve();
            db.close;
            console.log(`Row(s) deleted ${this.changes}`);
        });

    })

}
