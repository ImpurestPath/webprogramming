const getDatabase = require('./db')
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


function getCity(city) {
    return new Promise((resolve, reject) => {
        let db = getDatabase();
        db.serialize(() => {
            db.all(`SELECT City as city
        FROM favorites WHERE city = ?`, [city], (err, row) => {
                if (err) {
                    // db.close();
                    // console.warn(err.message);
                    reject(err);
                    return
                }
                // db.close();
                resolve(row);
                console.log(row);
                return
            });
            db.close()
        })
    })
}

function addCity(city) {
    return new Promise(async (resolve, reject) => {
        let db = getDatabase();
        await getCity(city).then(row => {
            if (typeof row === 'undefined' || row.length == 0) {
                db.serialize(() => {
                    db.run(`INSERT INTO favorites(city) VALUES(?)`, [city], function (err) {
                        if (err) {
                            err.status = 500
                            // db.close();
                            console.warn(err);
                            reject(err);
                            return;
                        }
                        // db.close();
                        console.log("Added " + city);
                        resolve(city);
                        return;
                    });
                    db.close()
                })
            } else {
                console.log("Rejecting with 208")
                reject({ message: "Already added", status: 208 })
                db.close()
            }
        }).catch(() => {
            reject({ message: "getCityError", status: 500 })
            db.close()
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
                    // db.close();
                    // console.warn(err.message);
                    reject(err);
                    return;
                }

                // db.close();
                resolve(rows);
                return
            });
            db.close()
        });

    })
}

function deleteCity(city) {
    return new Promise((resolve, reject) => {
        let db = getDatabase()
        db.serialize(() => {
            db.run(`DELETE FROM favorites WHERE city=?`, city, function (err) {
                if (err) {
                    // db.close();
                    // console.warn(err);
                    reject(err);
                    return;
                }
                // db.close();
                console.log(`Row(s) deleted ${this.changes}`);
                resolve();
                return
            });
            db.close()
        })
    })

}
