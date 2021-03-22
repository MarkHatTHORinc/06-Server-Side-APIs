var apiKey = "2bf6b66810e81d2eaafabb9505c4eb18";
var lat = 0;
var lon = 0;
var uviColors = ["green", "green", "green", "yellow", "yellow", "yellow", "orange", "orange", "orange", "red", "red", "red"]

async function getGeoInfo(cityName) {

  var geoInfoUrl = encodeURI(`http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`);

  // fetch(geoInfoUrl, {
  await fetch(geoInfoUrl, {
    method: 'GET', //GET is the default.
    credentials: 'same-origin', // include, *same-origin, omit
    redirect: 'follow', // manual, *follow, error
    cache: 'reload'  // Refresh the cache
  })
    .then(response => {
      return response.json();
    })
    .then(data => {
      console.log(data);
      lat = data[0].lat;
      lon = data[0].lon;
      getCityWeather(cityName);
    })
    .catch(error => {
      alert('City entered is not valid.');
    });
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
      // var uviEl = $("<button class='btn'>").text("UV Index: " + data.current.uvi);
      var uviEl = $("<div>").text(`UV Index: `);
      var uviSpanEl = $("<span>").text(data.current.uvi);
      var uvi = Math.ceil(data.current.uvi);
      // make sure we have a valid UV Index
      if (uvi < 0) {
        uvi = 0;
      } else if (uvi > 10) {
        uvi = 10;
      } 
      uviSpanEl.attr("id", "uviNumb");
      uviSpanEl.attr("class", "uviNumb");
      uviSpanEl.css("background-color", uviColors[uvi]);
      uviEl.append(uviSpanEl);
      let uvIndexEl = $('#uvIndex');
      uvIndexEl.html(uviEl);
      // Set the UV Index background color based upon the value
      // uviEl.css("background-color", uviColors[data.current.uvi]);
      $("#uviNumb").css("background-color", uviColors[data.current.uvi]);

      // Build the Forecast Section
      buildForecast(data);
    });
}

// Build the weather image
function buildWeatherIcon(iconName) {
  return `http://openweathermap.org/img/wn/${iconName}.png`;
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

}

// Get the Previously Searched Cities
function getPreviousSearch() {
  var previousSearch = JSON.parse(localStorage.getItem("previousSearch"));
  var searchedEl = $("<button class='btn border text-muted mt-1 shadow-sm bg-white rounded' style='width: 12rem;'>").text(previousSearch);
  var previousCityEl = $("<div>");
  previousCityEl.append(searchedEl)
  $("#previousSearch").prepend(previousCityEl);
}

// Listen for the search button to be clicked
$("#searchCity").on("click", function (event) {
  // Preventing the button from trying to submit the form......
  event.preventDefault();
  // Storing the city name........
  var cityInput = $("#cityInput").val().trim();

  // Save search city to local storage
  var textContent = $(this).siblings("input").val();
  var cityArray = [];
  cityArray.push(textContent);
  localStorage.setItem('previousSearch', JSON.stringify(cityArray));

  getGeoInfo(cityInput);
  getPreviousSearch();
});

// Listen for one of the previously searched cities to be clicked
$("#previousSearch").on('click', '.btn', function (event) {
  event.preventDefault();
  console.log($(this).text());
  getCityWeather($(this).text());
});

getPreviousSearch();
