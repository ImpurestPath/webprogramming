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

  // Object.defineProperty(dom.window.document.currentScript.ownerDocument, 'currentScript', {
  //   value: dom.window.document,
  // });
  dom.window.document.currentScript.ownerDocument = dom.window.document;
  mockFetch = jest.fn()
  mockFetch.mockImplementation((query) => {
    if (query.includes("favorite")) {
      if (query.includes("city")) {
        return Promise.resolve({
          status: 200,
          json: () => Promise.resolve({
            name: "Moscow"
          })
        })
      }
      else {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve([
          { city: 'Moscow' }
        ])
      })
    }
    } else {
      return Promise.resolve({
        ok: true,
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
  mockAlert = jest.fn()
  script.__set__('alert', mockAlert)
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
  script.__set__('navigator',mockNavigator)
  script.init()
  script.__set__('mainDoc', dom.window.document)
});

afterEach(() => {
  jest.resetModules();
  jest.resetAllMocks()
});

describe('geolocation', () => {
  it('should get location', () => {
    mockGetLocationResponse = jest.fn(() => Promise.resolve(script.loadCity("123")))
    script.__with__('getLocationResponse', mockGetLocationResponse)(() => {
      script.fullUpdate()
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
  it('should fetch city weather', () => {
    script.loadCity("1");
    expect(mockFetch).toHaveBeenCalled()
  });
  it('should fetch latlong weather', () => {
    script.loadLatLong("1", "2");
    expect(mockFetch).toHaveBeenCalled()
  });
  it('should alert when cannot load weather', async () => {
    mockFetch = jest.fn()
    mockFetch.mockImplementation((query) => {
        return Promise.resolve({
          ok: false,
          status: 404,
          json: () => Promise.reject()
        }) 
    })
    script.__with__('load',mockFetch)(async()=>{
      script.__set__('alert',mockAlert)
      await script.getMainCity()
      expect(mockAlert).toHaveBeenCalledWith("Cannot find city")
    })
  });
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
    mockDeleteCityFromDb = jest.fn()
    mockDetachCity = jest.fn()
    script.__with__('deleteCityFromDB', mockDeleteCityFromDb)(() => {
      script.__with__('detachCity', mockDetachCity)(() => {
        city = script.__get__('cities')[0].city
        console.log(script.__get__('cities'));
        script.__get__('document').getElementById(city).querySelector("button").click()
        expect(mockDetachCity).toHaveBeenCalledTimes(1)
        expect(mockDeleteCityFromDb).toHaveBeenCalledTimes(1)
      })
    })
  });

  it('should add favorites on form submit', () => {
    mockAddFavoriteCity = jest.fn()
    script.__with__('handleAddCity', mockAddFavoriteCity)(() => {
      script.init()
      script.__get__('document').getElementById("addFavoriteCity").click()
      expect(mockAddFavoriteCity).toHaveBeenCalled()
    })
  });
  it('should slert when cannot load cities', () => {
    mockFetch = jest.fn()
    mockFetch.mockImplementation((query) => {
        return Promise.resolve({
          ok: false,
          status: 404,
          json: () => Promise.reject()
        }) 
    })
    script.__with__('load',mockFetch)(async()=>{
      script.__set__('alert',mockAlert)
      await script.loadAllCitiesFromDB()
      expect(mockAlert).toHaveBeenCalledWith("Cannot load cities from database")
    })
  });

  it('should alert when cannot find city on adding', () => {
    mockFetch = jest.fn()
    mockFetch.mockImplementation((query) => {
        return Promise.resolve({
          ok: false,
          status: 404,
          json: () => Promise.reject()
        }) 
    })
    script.__with__('load',mockFetch)(async()=>{
      script.__set__('alert',mockAlert)
      await script.addFavoriteCity()
      expect(mockAlert).toHaveBeenCalledWith("Cannot find city")
    })
  });
  it('should alert when city already added', () => {
    mockFetch = jest.fn()
    mockFetch.mockImplementation((query) => {
        return Promise.resolve({
          ok: true,
          status: 208,
          json: () => Promise.reject()
        }) 
    })
    script.__with__('load',mockFetch)(async()=>{
      script.__set__('alert',mockAlert)
      await script.addFavoriteCity()
      expect(mockAlert).toHaveBeenCalledWith("Already added")
    })
  });
  it('should alert when problems with connection', () => {
    mockFetch = jest.fn()
    mockFetch.mockImplementation((query) => {
        return Promise.resolve({
          ok: true,
          status: 500,
          json: () => Promise.reject()
        }) 
    })
    script.__with__('load',mockFetch)(async()=>{
      script.__set__('alert',mockAlert)
      await script.addFavoriteCity()
      expect(mockAlert).toHaveBeenCalledWith("Error at adding to db")
    })
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