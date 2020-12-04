const sqlite3 = require('sqlite3');
module.exports = function getDatabase(){
    let db = new sqlite3.Database('favorites.db', (err) => {
        if (err) {
            return console.error(err);
        }

        console.log('Connected to SQlite database.');
    });
    db.run('CREATE TABLE IF NOT EXISTS favorites(city text UNIQUE)');
    return db;
}