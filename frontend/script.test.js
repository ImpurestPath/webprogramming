const fs = require('fs');
const path = require('path');
const rewire = require('rewire')
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const html = fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf8');
jest.dontMock('fs');

const script = rewire('./script');
beforeEach(() => {
  const dom = new JSDOM(html.toString())
  Object.defineProperty(dom.window.document, 'currentScript', {
    value: document.createElement('script'),
  });
  dom.window.document.currentScript.ownerDocument = dom.window.document;
  mockFetch = jest.fn()
  mockFetch.mockImplementation((query) => {
    if (query.includes("favorite")) {
      return Promise.resolve({
        status: 200,
        json: () => Promise.resolve([
          { city: 'Yakutsk' },
          { city: 'Moscow' },
          { city: 'Helsinki' }
        ])
      })
    } else {
      return Promise.resolve({
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
      })
    }
  })
  script.__set__('fetch', mockFetch)
  script.__set__('document', dom.window.document)
  script.init()
});

afterEach(() => {
  jest.resetModules();
});

describe('geolocation', () => {
  it('should get location', () => {
    mockGetLocationResponse = jest.fn(() => Promise.resolve(script.loadCity("123")))
    script.__with__('getLocationResponse', mockGetLocationResponse)(() => {
      script.init()
      expect(mockGetLocationResponse).toHaveBeenCalledTimes(1)
    })
  });

  it('should fetch geolocation if available', async () => {
    mockGeolocationGetCurrentPosition = {
      coords: {
        latitude: 1,
        longitude: 1,
      }
    }
    mockGeolocation = {
      getCurrentPosition: (callbackGood, callbackBad) => callbackGood(mockGeolocationGetCurrentPosition),
    }
    mockNavigator = {
      geolocation: mockGeolocation
    }
    script.__with__('navigator', mockNavigator)(async () => {
      await script.getLocationResponse()
      expect(mockFetch).toHaveBeenCalledWith("/weather/city?q=1,1")
    })
  });


  it('should fetch default if geolocation available', async () => {
    mockNavigator = {
      geolocation: null
    }
    script.__with__('navigator', mockNavigator)(async () => {
      await script.getLocationResponse()
      expect(mockFetch).toHaveBeenCalledWith("/weather/city?q=Moscow")
    })
  });

});

describe('weather loading', () => {

});

describe('favorites loading', () => {
  it('should load favorites on page load', () => {
    mockLoadAllCitiesFromDB = jest.fn()
    script.__with__('loadAllCitiesFromDB', mockLoadAllCitiesFromDB)(() => {
      script.init()
      expect(mockLoadAllCitiesFromDB).toHaveBeenCalledTimes(1)
    })
  });

  it('should fetch all favorites on page load/refresh', () => {
    script.init()
    expect(mockFetch).toHaveBeenCalledWith("/favorites")
  });

  it('should delete favorites on button click', () => {

  });

  it('should add favorites on form submit', () => {

  });
})

describe('favorites on page', () => {

  it('should add element if city not already added', () => {

  });

  it('should show alert if city already added', () => {

  });

  it('should show alert if city not found', () => {

  });

  it('should delete element on button click', () => {

  });
  it('should refresh element', () => {

  });


  it('should show city name', () => {

  });
  it('should show temperature', () => {

  });
  it('should show image', () => {

  });
  it('should show wind', () => {

  });
  it('should show cloud', () => {

  });
  it('should show pressure', () => {

  });

  it('should show humidity', () => {

  });

  it('should show coordinates', () => {

  });
});

describe('main city', () => {
  it('should show city name', () => {

  });
  it('should show temperature', () => {

  });
  it('should show image', () => {

  });
  it('should show wind', () => {

  });
  it('should show cloud', () => {

  });
  it('should show pressure', () => {

  });

  it('should show humidity', () => {

  });

  it('should show coordinates', () => {

  });
})

describe('Page', () => {
  it('should show title', () => {
    expect(script.__get__('document').querySelector("h1")).not.toBeNull()
  });
  it('should show refresh button', () => {
    expect(script.__get__('document').getElementById("headerbutton")).not.toBeNull()
  });
  it('should start refresh on button click', () => {
    mockFullUpdate = jest.fn()
    script.__with__('fullUpdate', mockFullUpdate)(() => {
      script.__get__('document').getElementById("headerbutton").click()
      expect(mockFullUpdate).toBeCalledTimes(1)
    })
    
  });
});