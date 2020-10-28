const mainDoc = document.currentScript.ownerDocument;


function createFromTemplate(cityName, cityResponse) {
    const template = document.importNode(mainDoc.querySelector("#cityTemplate").content, true)
    const mainLiEl = template.querySelector("li"),
        nameEl = template.querySelector("h3"),
        tempEl = template.querySelector("span"),
        imgEl = template.querySelector("img"),
        buttonEl = template.querySelector("button"),
        ulEl = template.querySelector("ul")
    console.log(ulEl);

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
    localStorage.removeItem(elementId)
}

function refreshFavoriteCity(cityName, isOld = true) {
    const cityEl = document.getElementById(cityName)
    cityEl.classList.add("loading")
    return new Promise((resolve, reject) => {
        loadCity(cityName).then(response => {
            if (response.ok) {
                response.json().then(apiResponse => {
                    console.log(apiResponse);
                    const item = localStorage.getItem(apiResponse.location.name);
                    document.getElementsByClassName("favorites")[0].replaceChild(createFromTemplate(apiResponse.location.name, apiResponse), cityEl);
                    resolve(apiResponse.location.name);
                }).catch((err) => {
                    console.log(err);
                    alert("Error at getting json");
                    reject();
                })

            }
            else {
                alert("Cannot find city")
                cityEl.classList.remove("loading")
                reject();
            }
        }).catch(reason => {
            alert("Problems with connection")
            cityEl.classList.remove("loading")
            reject();
        })
    })

}


function addFavoriteCity(cityName) {
    if (localStorage.hasOwnProperty(cityName)) {
        alert("Already added")
        return;
    }
    appendCity(cityName).then(name => {
        if (localStorage.hasOwnProperty(name)) {
            alert("Already added")
            detachCity(name);
        } else {
            localStorage.setItem(name, '')
        }
    }).catch((error) => {
        if (error) {
            alert(error);
            removeCity(name);
        }
        removeCity(cityName);
    })

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
    return fetch("https://api.weatherapi.com/v1/current.json?key=a67d292870584105b00141824200410&q=" + query)
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
    console.log(cityResponse);
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
    console.log(liEls);
    windEl.textContent = wind
    cloudEl.textContent = cloud
    pressEl.textContent = press
    humEl.textContent = hum
    coordsEl.textContent = coords
}

function loadCitiesFromStorage() {
    for (let i = 0; i < localStorage.length; i++) {
        appendCity(localStorage.key(i));
    }
}

function fullUpdate() {
    document.getElementById("hereWeather").classList.add("loading")
    getLocationResponse().then(response => {
        if (response.ok) {
            console.log("Got main city")
            response.json().then(apiResponse => {
                fillMainLocation(apiResponse)
                document.getElementById("hereWeather").classList.remove("loading")
            }).catch((err) => {
                console.log(err);
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
    document.getElementsByClassName("favorites")[0].textContent = ''
    loadCitiesFromStorage()
}


document.getElementById("addFavoriteCityForm").addEventListener("submit", event => {
    addFavoriteCity(event.target[0].value)
    console.log(event.target[0].value);
    console.log(event);
    event.target.reset();
    event.preventDefault();
})
document.getElementById("headerbutton").addEventListener("click", event => {
    fullUpdate()
})

fullUpdate()