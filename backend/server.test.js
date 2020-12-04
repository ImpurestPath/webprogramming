const app = require('./server') // Link to your server file
const supertest = require('supertest')
const request = supertest(app)
jest.mock('./favorites')
const favorites = require('./favorites');
jest.mock('./weather')
const weather = require('./weather');

afterEach(() => {
    jest.clearAllMocks()
})

describe('city weather endpoint', () => {
    it('should return weather with status 200 when city is found', async () => {
        weather.load = jest.fn(() => Promise.resolve({
            json: () => Promise.resolve({})
        }));
        const city = "aaa"
        const response = await request.get('/weather/city?q=' + city)
        expect(response.status).toBe(200);
    });

    it('should return weather gotten from api', async () => {
        weather.load = jest.fn(() => Promise.resolve({
            json: () => Promise.resolve({})
        }));
        const city = "aaa"
        const response = await request.get('/weather/city?q=' + city)
        expect(response.body).toEqual({});
    });

    it('should return weather with status 404 when city isn\'t found', async () => {
        weather.load = jest.fn(() => Promise.reject());
        const city = "aaa"
        const response = await request.get('/weather/city?q=' + city)
        expect(response.status).toBe(404);
    });
});

describe('favorites endpoint', () => {
    describe('get', () => {
        it('should return status 200 on success', async () => {
            favorites.getAll = jest.fn(() => Promise.resolve([]))
            const response = await request.get('/favorites')
            expect(response.status).toEqual(200)
        });

        it('should return empty array', async () => {
            favorites.getAll = jest.fn(() => Promise.resolve([]))
            const response = await request.get('/favorites')
            expect(response.body).toEqual([])
        });

        it('should return not modified array', async () => {
            const arr = ["1", "2", "3"]
            favorites.getAll = jest.fn(() => Promise.resolve(arr))
            const response = await request.get('/favorites')
            expect(response.body).toEqual(arr)
        });

        it('should return status 500 on fail', async () => {
            favorites.getAll = jest.fn(() => Promise.reject())
            const response = await request.get('/favorites')
            expect(response.status).toEqual(500)
        });
    });
    describe('post', () => {
        it('should return status 200 on success', async () => {
            const city = "aaa"
            favorites.add = jest.fn((cityName) => Promise.resolve(cityName))
            weather.load = jest.fn(() => Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    location: {
                        name: city
                    }
                })
            }))
            const response = await request.post('/favorites?city=' + city)
            expect(response.status).toEqual(200)
        });

        it('should return city name on success', async () => {
            const city = "aaa"
            favorites.add = jest.fn((cityName) => Promise.resolve(cityName))
            weather.load = jest.fn(() => Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    location: {
                        name: city
                    }
                })
            }))
            const response = await request.post('/favorites?city=' + city)
            expect(response.body).toEqual({ name: city })
        });

        it('should return status 500 on error during process', async () => {
            const city = "aaa"
            favorites.add = jest.fn((cityName) => Promise.resolve(cityName))
            weather.load = jest.fn(() => Promise.reject())
            const response = await request.post('/favorites?city=' + city)
            expect(response.status).toEqual(500)
        });

        it('should return status 404 when city isn\'t found', async () => {
            const city = "aaa"
            favorites.add = jest.fn((cityName) => Promise.resolve(cityName))
            weather.load = jest.fn(() => Promise.resolve({
                ok: false,
                json: () => Promise.resolve()
            }))
            const response = await request.post('/favorites?city=' + city)
            expect(response.status).toEqual(404)
        });

        it('should return status 208 when city already added', async () => {
            const city = "aaa"
            favorites.add = jest.fn((cityName) => Promise.reject({
                status: 208
            }))
            weather.load = jest.fn(() => Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    location: {
                        name: city
                    }
                })
            }))
            const response = await request.post('/favorites?city=' + city)
            expect(response.status).toEqual(208)
        });
    });
    describe('delete', () => {
        it('should return status 200 on success', async () => {
            const city = "aaa"
            favorites.deleteCity = jest.fn(() => Promise.resolve())
            const response = await request.delete('/favorites?city=' + city)
            expect(response.status).toEqual(200)
        });

        it('should return status 500 on fail', async () => {
            const city = "aaa"
            favorites.deleteCity = jest.fn(() => Promise.reject())
            const response = await request.delete('/favorites?city=' + city)
            expect(response.status).toEqual(500)
        });
    });
});