
let mainDoc;
let cities = [];


function createFromTemplate(cityName, cityResponse) {
    const template = document.importNode(mainDoc.getElementById("cityTemplate").content, true)
    const mainLiEl = template.querySelector("li"),
        nameEl = template.querySelector("h3"),
        tempEl = template.querySelector("span"),
        imgEl = template.querySelector("img"),
        buttonEl = template.querySelector("button"),
        ulEl = template.querySelector("ul")
    // console.log(ulEl);

    mainLiEl.id = cityName
    if (cityResponse) {
        nameEl.textContent = cityResponse.location.name
        tempEl.textContent = cityResponse.current.temp_c + "°C"
        imgEl.src = "https:" + cityResponse.current.condition.icon
        fillUl(ulEl,
            cityResponse.current.wind_dir + ", " + cityResponse.current.wind_kph + " km/h",
            cityResponse.current.cloud + "%",
            cityResponse.current.pressure_mb + " hpa",
            cityResponse.current.humidity + "%",
            cityResponse.location.lat + " " + cityResponse.location.lon
        )
    }
    else {
        nameEl.textContent = cityName
        // tempEl.textContent = ""
        // imgEl.src = ""
        // ulEl = fillUl(ulEl, "", "", "", "", "")
    }
    buttonEl.addEventListener("click", event => { removeCity(cityName) })

    return template;

}

function detachCity(elementId) {
    const el = document.getElementById(elementId)
    if (el) {
        el.remove()
    }
}

function removeCity(elementId) {
    detachCity(elementId)
    deleteCityFromDB(elementId)
}

function refreshFavoriteCity(cityName, isOld = true) {
    const cityEl = document.getElementById(cityName)
    cityEl.classList.add("loading")
    return new Promise((resolve, reject) => {
        loadCity(cityName).then(response => {
            if (response.ok) {
                response.json().then(apiResponse => {
                    // console.log(apiResponse);
                    document.getElementsByClassName("favorites")[0].replaceChild(createFromTemplate(apiResponse.location.name, apiResponse), cityEl);
                    resolve(apiResponse.location.name);
                }).catch((err) => {
                    console.error(err);
                    alert("Error at getting json");
                    // reject();
                })

            }
            else {
                alert("Cannot find city")
                cityEl.classList.remove("loading")
                // reject();
            }
        }).catch(reason => {
            alert("Problems with connection")
            cityEl.classList.remove("loading")
            // reject();
        })
    })

}


function addFavoriteCity(cityName) {
    addCityToDB(cityName).then(async response => {
        // console.log("Adding city status: " + response.status)
        switch (response.status) {
            case 200:
                appendCity((await response.json()).name)
                break;
            case 208:
                alert("Already added")
                break;
            case 404:
                alert("Cannot find city")
                break;
            default:
                alert("Error at adding to db")
                break;
        }
    }).catch(err => {console.error(err); alert("Cannot add city")})
}

function appendCity(cityName) {
    const cityEl = createFromTemplate(cityName, null)
    document.getElementsByClassName("favorites")[0].appendChild(cityEl)
    return refreshFavoriteCity(cityName, false)
}


function loadCity(cityName) {
    return load(cityName)
}

function loadLatLong(lat, long) {
    return load(lat + "," + long)
}

function load(query) {
    return fetch("/weather/city?q=" + query)
}

function addCityToDB(city){
    return fetch("/favorites?city=" + city, {
        method: 'POST'
    })
}

function loadAllCitiesFromDB(){
    cities = []
    fetch("/favorites").then( async response =>  {
        // console.log(response.status)
        responseCities = await response.json()
        console.log(responseCities);
        cities = responseCities;
        loadCitiesFromArray();
    }).catch( err => {
        console.error(err)
        alert("Cannot load cities from database")
    }
    )
}

function loadCitiesFromArray() {
    cleanFavorites()
    for (let i = 0; i < cities.length; i++) {
        appendCity(cities[i].city);
    }
}

function deleteCityFromDB(city){
    fetch("/favorites?city=" + city, {
        method: 'DELETE'
    })
}

function getLocationResponse() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                console.log("Using geo");
                resolve(loadLatLong(position.coords.latitude, position.coords.longitude))
            }, err => {
                console.log("Using default city");
                resolve(loadCity("Moscow"))
            });
        } else {
            resolve(loadCity("Moscow"))
        }
    })

}

function fillMainLocation(cityResponse) {
    // console.log(cityResponse);
    const mainDivEl = document.getElementById('hereWeather'),
        nameEl = mainDivEl.querySelector("h2"),
        imgEl = mainDivEl.querySelector("img"),
        spanEl = mainDivEl.querySelector("span"),
        ulEl = mainDivEl.querySelector("ul")
    if (cityResponse) {
        nameEl.textContent = cityResponse.location.name
        imgEl.src = "https:" + cityResponse.current.condition.icon
        spanEl.textContent = cityResponse.current.temp_c + "°C"
        fillUl(ulEl,
            cityResponse.current.wind_dir + ", " + cityResponse.current.wind_kph + " km/h",
            cityResponse.current.cloud + "%",
            cityResponse.current.pressure_mb + " hpa",
            cityResponse.current.humidity + "%",
            cityResponse.location.lat + " " + cityResponse.location.lon
        )
    }
}

function fillUl(ulEl, wind, cloud, press, hum, coords) {
    const liEls = ulEl.querySelectorAll("ul li span"),
        windEl = liEls[0],
        cloudEl = liEls[1],
        pressEl = liEls[2],
        humEl = liEls[3],
        coordsEl = liEls[4]
    // console.log(liEls);
    windEl.textContent = wind
    cloudEl.textContent = cloud
    pressEl.textContent = press
    humEl.textContent = hum
    coordsEl.textContent = coords
}


function fullUpdate() {
    document.getElementById("hereWeather").classList.add("loading")
    getLocationResponse().then(response => {
        if (response.ok) {
            // console.log("Got main city")
            response.json().then(apiResponse => {
                fillMainLocation(apiResponse)
                document.getElementById("hereWeather").classList.remove("loading")
            }).catch((err) => {
                console.error(err);
                alert("Error at getting json")
            })
        }
        else {
            alert("Cannot find city")
            document.getElementById("hereWeather").classList.remove("loading")
        }
    }).catch(reason => {
        alert("Problems with connection")
        document.getElementById("hereWeather").classList.remove("loading")
    })
    cleanFavorites()
    // loadCitiesFromStorage()
    loadAllCitiesFromDB()
}

function cleanFavorites(){
    document.getElementsByClassName("favorites")[0].textContent = ''
}


function handleAddCity(event) {
    if (event.target[0].value || 0 != event.target[0].value.length) {
        addFavoriteCity(event.target[0].value)
        // console.log(event.target[0].value);
        // console.log(event);
    }
    event.target.reset();
    event.preventDefault();
}

function init() {
    mainDoc = document.currentScript.ownerDocument
    document.getElementById("addFavoriteCityForm").addEventListener("submit", event => {
        handleAddCity(event)
    })
    document.getElementById("headerbutton").addEventListener("click", event => {
        fullUpdate()
    })
    fullUpdate()
}



if (typeof exports !== 'undefined') {
    module.exports = {
        createFromTemplate,
        detachCity,
        removeCity,
        refreshFavoriteCity,
        addFavoriteCity,
        appendCity,
        loadCity,
        loadLatLong,
        load,
        addCityToDB,
        loadAllCitiesFromDB,
        loadCitiesFromArray,
        deleteCityFromDB,
        getLocationResponse,
        fillMainLocation,
        fillUl,
        fullUpdate,
        cleanFavorites,
        init
    };
}