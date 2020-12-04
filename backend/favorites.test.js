const favorites = require('./favorites');
const sqlite3 = require('sqlite3').verbose();
jest.mock('./db')
const getDatabase = require('./db')
function getMemoryDB() {
    const db = new sqlite3.Database(':memory:');
    db.serialize(() => {
        db.run('CREATE TABLE favorites(city text)');
    });
    return db;
}

afterEach(() => {
    jest.clearAllMocks();
})

describe('getAllCity', () => {

    it('should get database connection once', async () => {
        getDatabase.mockImplementation(() => {
            return getMemoryDB();
        });
        await favorites.getAll();
        expect(getDatabase).toHaveBeenCalledTimes(1);
    })

    it('should close database connection once', async () => {
        let cls;
        getDatabase.mockImplementation(() => {
            let db = getMemoryDB();
            cls = jest.fn(() => db.close)
            Object.defineProperty(db, 'close', { value: cls })
            return db;
        });
        await favorites.getAll();
        expect(cls).toHaveBeenCalledTimes(1);
    })

    it('should return empty list on empty database', async () => {
        getDatabase.mockImplementation(() => {
            return getMemoryDB();
        });
        const list = await favorites.getAll();
        expect(list).toEqual([]);
    })

    it('should return three values from database', async () => {
        getDatabase.mockImplementation(() => {
            const db = getMemoryDB();
            db.run(`INSERT INTO favorites(city) VALUES(?)`, ["1"]);
            db.run(`INSERT INTO favorites(city) VALUES(?)`, ["2"]);
            db.run(`INSERT INTO favorites(city) VALUES(?)`, ["3"]);
            return db;
        });
        const list = await favorites.getAll();
        expect(list.length).toBe(3);
    })

    it('should reject on problems with db', async () => {
        getDatabase.mockImplementation(() => {
            const db = new sqlite3.Database(':memory:');
            db.serialize(() => {
                db.run('CREATE TABLE favorites_different(city text)');
            });
            return db;
        });
        return expect(favorites.getAll()).rejects.toThrow();
    })
})

describe('addCity', () => {

    it('should not add value if it\'s not unique and return status 208', async () => {
        getDatabase.mockImplementation(() => {
            const db = getMemoryDB();
            db.run(`INSERT INTO favorites(city) VALUES(?)`, ["3"]);
            return db;
        });
        return expect(favorites.add("3")).rejects.toEqual({
            message: "Already added",
            status: 208
        });

    })

    it('should get database connection twice', async () => {
        getDatabase.mockImplementation(() => {
            return getMemoryDB();
        });
        await favorites.add("6");
        expect(getDatabase).toHaveBeenCalledTimes(2);
    })

    it('should close database connection twice', async () => {
        let cls
        getDatabase.mockImplementation(() => {
            let db = getMemoryDB();
            cls = jest.fn(() => db.close);
            Object.defineProperty(db, 'close', { value: cls });
            return db;
        });
        return favorites.add("5").then(expect(cls).toHaveBeenCalledTimes(1));
    })

    it('should add value if it\'s unique and return name', async () => {
        getDatabase.mockImplementation(() => {
            const db = getMemoryDB();
            return db;
        });
        return favorites.add("4")
    })
    it('should reject on problems with db after getCity', async () => {
        getDatabase.mockImplementationOnce(() => {
            const db = new sqlite3.Database(':memory:');
            db.serialize(() => {
                db.run('CREATE TABLE favorites_different(city text)');
            });

            getDatabase.mockImplementationOnce(() => {
                const db = new sqlite3.Database(':memory:');
                db.serialize(() => {
                    db.run('CREATE TABLE favorites(city text)');
                });
                return db;
            });

            return db;
        })
        return expect(favorites.add("7")).rejects.toBeDefined()
    })
    it('should reject on problems with db', async () => {
        getDatabase.mockImplementation(() => {
            const db = new sqlite3.Database(':memory:');
            db.serialize(() => {
                db.run('CREATE TABLE favorites_different(city text)');
            });
            return db;
        });
        return expect(favorites.add("7")).rejects.toBeDefined();
    })
})


describe('deleteCity', () => {
    it('should get database connection once', async () => {
        getDatabase.mockImplementation(() => {
            return getMemoryDB();
        });
        await favorites.deleteCity("1");
        expect(getDatabase).toHaveBeenCalledTimes(1);
    })
    it('should close database connection once', async () => {
        let cls
        getDatabase.mockImplementation(() => {
            let db = getMemoryDB();
            cls = jest.fn(() => db.close);
            Object.defineProperty(db, 'close', { value: cls });
            return db;
        });
        favorites.deleteCity("2").then(expect(cls).toHaveBeenCalledTimes(1));
    })

    it('should delete row if it\'s in db', async () => {
        getDatabase.mockImplementation(() => {
            const db = getMemoryDB();
            db.run(`INSERT INTO favorites(city) VALUES(?)`, ["3"]);
            return db;
        });
        return favorites.deleteCity("3");
    })
    it('should reject on problems with db', async () => {
        getDatabase.mockImplementation(() => {
            const db = new sqlite3.Database(':memory:');
            db.serialize(() => {
                db.run('CREATE TABLE favorites_different(city text)');
            });
            return db;
        });
        return expect(favorites.deleteCity("4")).rejects.toThrow();
    })
})