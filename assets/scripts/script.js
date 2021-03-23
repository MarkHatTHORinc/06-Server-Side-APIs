var apiKey = "2bf6b66810e81d2eaafabb9505c4eb18";
var lat = 0;
var lon = 0;
var uviColors = ["green", "green", "green", "yellow", "yellow", "yellow", "orange", "orange", "orange", "red", "red", "red"]
var cityArray = [];

// Save the city to local storage
function saveCity(cityName) {
  // Only store the city if it hasn't been previously stored
  if (!cityArray ||
      cityArray.length === 0 ||
      !cityArray.includes(cityName)) {
    cityArray.push(cityName);
    // Sort the previously searched cities so they are alphabetical
    cityArray.sort();
    // Store to local storage
    localStorage.removeItem("previousSearch");
    localStorage.setItem("previousSearch", JSON.stringify(cityArray));
  }
  return;
}

// Convert the city Name to Pascal Case to make consistent and help with sorting
function toPascalCase(myString) {
  return myString.replace(/\w\S*/g, m => m.charAt(0).toUpperCase() + m.substr(1).toLowerCase());
}

// Get Geo info for City - lattitude and longitude
// async function getGeoInfo(cityName) {
function getGeoInfo(cityName) {

  var geoInfoUrl = encodeURI(`http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`);

  fetch(geoInfoUrl, {
  // await fetch(geoInfoUrl, {
    method: 'GET', //GET is the default.
    credentials: 'same-origin', // include, *same-origin, omit
    redirect: 'follow', // manual, *follow, error
    cache: 'reload'  // Refresh the cache
  })
    .then(response => {
      return response.json();
    })
    .then(data => {
      // console.log(data);
      lat = data[0].lat;
      lon = data[0].lon;
      // Save search city to local storage
      saveCity(cityName);
      // Get the weather for this city
      getCityWeather(cityName);
    })
    .catch(error => {
      alert('City entered is not valid.');
    });
  return;
}

function getCityWeather(cityName) {
  var oneCallUrl = encodeURI(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minutely&units=imperial&appid=${apiKey}`);
  fetch(oneCallUrl, {
    method: 'GET', //GET is the default.
    credentials: 'same-origin', // include, *same-origin, omit
    redirect: 'follow', // manual, *follow, error
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      // Build the Current Weather Section
      buildCurrentWeather(cityName, data);
      // Build the Forecast Section
      buildForecast(data);
      // Build the Previously Searched Cities Section
      buildPreviousSearch();
    });
  return;
}

// Build the weather image
function buildWeatherIcon(iconName) {
  return `http://openweathermap.org/img/wn/${iconName}.png`;
}

// Build the current weather section
function buildCurrentWeather(cityName, data) {
  // Clear out current weather for search city
  $("#currentWeather").empty();
  var today = moment().format('L');

  // Create Elements for city information
  var cityNameEl = $("<h2>").text(cityName);
  var currentIcon = buildWeatherIcon(data.current.weather[0].icon);
  var currentIconEl = $('<img>').attr("src", currentIcon);
  currentIconEl.attr("style", "height: 60px; width: 60px");
  var todayEl = cityNameEl.append(`&nbsp;${today}`, currentIconEl);
  var tempEL = $("<p>").text(`Temperature: ${data.current.temp} \xB0F`);
  var humidityEl = $("<p>").text(`Humidity: ${data.current.humidity}%`);
  var windEl = $("<p>").text(`Wind Speed: ${data.current.wind_speed} MPH`);

  // Create HTML div to append new elements to render on page....
  var currentWeatherEl = $('<div>');
  currentWeatherEl.append(todayEl, tempEL, humidityEl, windEl);
  $("#currentWeather").html(currentWeatherEl);

  //Clear out UV Index
  $("#uvIndex").empty();
  // Create Elements for UV Index div
  var uviEl = $("<div>").text(`UV Index: `);
  var uviSpanEl = $("<span>").text(data.current.uvi);
  // var uvi = Math.ceil(data.current.uvi);
  var uvi = parseInt(data.current.uvi);
  // make sure we have a valid UV Index
  if (uvi < 0) {
    uvi = 0;
  } else if (uvi > 10) {
    uvi = 10;
  }
  uviSpanEl.attr("id", "uviNumb");
  uviSpanEl.attr("class", "uviNumb");
  // Set the UV Index background color based upon the value
  uviSpanEl.css("background-color", uviColors[uvi]);
  uviEl.append(uviSpanEl);
  let uvIndexEl = $('#uvIndex');
  uvIndexEl.html(uviEl);
  return;
}

// Build the forecast section
function buildForecast(data) {
  // Clear out any previous forecast html elements
  $("#forecast").empty();
  // create elements for forecast
  // start index at 1 because 0 is current day
  for (var i = 1; i < 6; i++) {
    // Creating Forecast div
    var forecastEl = $("<div class='card shadow-lg text-white bg-primary mx-auto mb-10 p-2' style='width: 8.5rem; height: 11rem;'>");

    // Store the responses date temp and humidity
    var forecastDate = new Date((data.daily[i].dt) * 1000).toLocaleDateString("en-US")
    var forecastTemp = data.daily[i].temp.max;
    var forecastHumidity = data.daily[i].humidity;

    // Creating tags with the result items
    var forecastDateEl = $("<h5 class='card-title'>").text(forecastDate);
    var forecastTempEl = $("<p class='card-text'>").text(`Temp: ${forecastTemp} \xB0F`);
    var forecastHumidityEl = $("<p class='card-text'>").text(`Humidity:  ${forecastHumidity}%`);

    var icon = buildWeatherIcon(data.daily[i].weather[0].icon);
    var forecastIconEl = $('<img>').attr("src", icon);
    forecastIconEl.attr("style", "height: 40px; width: 40px");

    // Append elements to forecastEl
    forecastEl.append(forecastDateEl);
    forecastEl.append(forecastIconEl);
    forecastEl.append(forecastTempEl);
    forecastEl.append(forecastHumidityEl);
    $("#forecast").append(forecastEl);
  }
  return;
}

// Build the Previously Searched Cities section
function buildPreviousSearch() {
  $("#previousSearch").empty();
  var previousSearch = JSON.parse(localStorage.getItem("previousSearch"));
  if (previousSearch) {
    cityArray = previousSearch;
  }
  if (cityArray && cityArray.length) {
    cityArray.forEach(city => {
      var searchedEl = $("<button class='btn border text-muted mt-1 shadow-sm bg-white rounded' style='width: 12rem;'>");
      var previousCityEl = $("<div>");
      searchedEl.text(city);
      previousCityEl.append(searchedEl)
      $("#previousSearch").append(previousCityEl);
    });
  }
  return;
}

// Listen for the search button to be clicked
$("#searchCity").on("click", function (event) {
  // Preventing the button from trying to submit the form......
  event.preventDefault();
  // Get the city entereed
  var cityInput = $("#cityInput").val().trim();

  //Verify a city name was entered
  if (cityInput === "" || cityInput == "undefined") {
    alert("Please enter a city name.")
  } else {
    // Pascalize the city name
    cityInput = toPascalCase(cityInput);
    // Get the city's Geo lat and lon to get weather
    getGeoInfo(cityInput);
  }
});

// Listen for one of the previously searched cities to be clicked
$("#previousSearch").on('click', '.btn', function (event) {
  event.preventDefault();
  console.log($(this).text());
  getGeoInfo($(this).text());
});

// Build the Previously Searched City Section on load
buildPreviousSearch();
