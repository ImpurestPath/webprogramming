
jest.mock('node-fetch')
const weather = require('./weather')
const fetch = require('node-fetch')

afterEach(()=>{
    jest.clearAllMocks()
})

it('load must call fetch from api once per call', async () => {
    const mockResult = "123";
    fetch.mockReturnValue(Promise.resolve(mockResult));
    const query = "Moscow";
    await weather.load(query);
    expect(fetch).toHaveBeenCalledTimes(1);
})


it('load must resolves when fetch resolves', async () => {
    const mockResult = "123";
    fetch.mockReturnValue(Promise.resolve(mockResult));
    const query = "Moscow";
    const result = await weather.load(query);
    expect(result).toBe(mockResult);
})

it('load must rejects when fetch rejects', async () => {
    fetch.mockReturnValue(Promise.reject("Error"));
    await weather.load("1").catch(err => {
        expect(err).toEqual("Error")
    })
})

