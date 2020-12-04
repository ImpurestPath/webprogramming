const fs = require('fs');
const path = require('path');
// const script = require('./script');

const html = fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf8');
let script

jest.dontMock('fs');
global.fetch = jest.fn(() => Promise.resolve({
    status: 200,
    json: () => Promise.resolve({
        "location": {
          "name": "Moscow",
          "region": "Moscow City",
          "country": "Russia",
          "lat": 55.75,
          "lon": 37.62,
          "tz_id": "Europe/Moscow",
          "localtime_epoch": 1606954100,
          "localtime": "2020-12-03 3:08"
        },
        "current": {
          "last_updated_epoch": 1606952710,
          "last_updated": "2020-12-03 02:45",
          "temp_c": -8,
          "temp_f": 17.6,
          "is_day": 0,
          "condition": {
            "text": "Clear",
            "icon": "//cdn.weatherapi.com/weather/64x64/night/113.png",
            "code": 1000
          },
          "wind_mph": 6.9,
          "wind_kph": 11.2,
          "wind_degree": 110,
          "wind_dir": "ESE",
          "pressure_mb": 1033,
          "pressure_in": 31,
          "precip_mm": 0,
          "precip_in": 0,
          "humidity": 85,
          "cloud": 0,
          "feelslike_c": -13.5,
          "feelslike_f": 7.8,
          "vis_km": 7,
          "vis_miles": 4,
          "uv": 1,
          "gust_mph": 10.5,
          "gust_kph": 16.9
        }
      })
}))
// const fetchMock = jest.spyOn(global, 'fetch');
beforeEach(() => {
    document.documentElement.innerHTML = html.toString();
    Object.defineProperty(document, 'currentScript', {
        value: document.createElement('script'),
      });
    
    // require('./script')
});

afterEach(() => {
    jest.resetModules();
});

describe('main city', () => {
    it('should get location', () => {
        // const getLocationResponseMock = jest.spyOn(script,'getLocationResponse')
        // const getLocationResponseMock = jest.spyOn(script', getLocationResponse)
        // const script = require('./script')
        script = require('./script')
        script.getLocationResponse = jest.fn()
        script.fullUpdate()
        expect(script.getLocationResponse).toHaveBeenCalledTimes(1)
        // console.log(document.documentElement.innerHTML)
    });

});