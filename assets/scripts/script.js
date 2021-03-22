var apiKey = "2bf6b66810e81d2eaafabb9505c4eb18";
var lat = 0;
var lon = 0;
var uviColors = ["green", "green", "green", "yellow", "yellow", "yellow", "orange", "orange", "orange", "red", "red", "red"]

async function getGeoInfo(cityName) {

  // var geoInfoUrl = encodeURI(`http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`);
  var geoInfoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`;

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
        //empty divs and ids that we need to dump content into.....
        console.log(`Weather data => ${data}`);
        $("#current").empty();
        var today = moment().format('L');

        //create HTML for city information......
        var cityNameEl = $("<h2>").text(cityName);
        var todayEl = cityNameEl.append(`&nbsp;${today}`);
        var tempEL = $("<p>").text("Temperature: " + data.current.temp);
        var humidityEl = $("<p>").text("Humidity: " + data.current.humidity);
        var windEl = $("<p>").text("Wind Speed: " + data.current.wind_speed);
        var currentIcon = buildWeatherIcon(data.current.weather[0].icon);
        var currentIconEl = $('<img>').attr("src", currentIcon);
        currentIconEl.attr("style", "height: 60px; width: 60px");

        //create HTML div to append new elements to render on page....
        var newDiv = $('<div>');

        newDiv.append(todayEl, currentIconEl, tempEL, humidityEl, windEl);

        $("#current").html(newDiv);

        $('#uvl-display').empty();

        //create HTML for UV Index div
        var uviEl = $("<button class='btn'>").text("UV Index: " + data.current.uvi);
        let uvlDisplay = $('#uvl-display');
        uvlDisplay.html(uviEl);
        uviEl.css("background-color", uviColors[data.current.uvi]);

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
        //       //empty 5day div--------
        $("#5day").empty();
        //       //create HTML for 5day forcast................
        // start index at 1 because 0 is current day
              for (var i = 1; i < 6; i++) {
        //           // Creating a div
                  var fiveDayDiv = $("<div class='card shadow-lg text-white bg-primary mx-auto mb-10 p-2' style='width: 8.5rem; height: 11rem;'>");

        //           //Storing the responses date temp and humidity.......
                  var setD = new Date((data.daily[i].dt)*1000).toLocaleDateString("en-US")
                  var temp = data.daily[i].temp.max;
                  var hum = data.daily[i].humidity;

        //           //creating tags with the result items information.....
                  var h5date = $("<h5 class='card-title'>").text(setD);
                  var pTemp = $("<p class='card-text'>").text("Temp: " + temp);;
                  var pHum = $("<p class='card-text'>").text("Humidity " + hum);;

        //           var weather = results[i].weather[0].main

                  var icon = buildWeatherIcon(data.daily[i].weather[0].ico);
                  var iconEl = $('<img>').attr("src", icon);
                  iconEl.attr("style", "height: 40px; width: 40px");

        //           //append items to.......
                  fiveDayDiv.append(h5date);
                  fiveDayDiv.append(iconEl);
                  fiveDayDiv.append(pTemp);
                  fiveDayDiv.append(pHum);
                  $("#5day").append(fiveDayDiv);
              }

  }

  // Get the Previously Searched Cities
  function getPreviousSearch() {
    var previousSearch = JSON.parse(localStorage.getItem("previousSearch"));
    var searchedEl = $("<button class='btn border text-muted mt-1 shadow-sm bg-white rounded' style='width: 12rem;'>").text(previousSearch);
    var previousCityEl = $("<div>");
    previousCityEl.append(searchedEl)
    $("#searchhistory").prepend(previousCityEl);
  }

// Listen for the search button to be clicked
  $("#searchCity").on("click", function (event) {
    // Preventing the button from trying to submit the form......
    event.preventDefault();
    // Storing the city name........
    var cityInput = $("#cityInput").val().trim();

    //save search term to local storage.....
    var textContent = $(this).siblings("input").val();
    var cityArray = [];
    cityArray.push(textContent);
    localStorage.setItem('previousSearch', JSON.stringify(cityArray));

    getGeoInfo(cityInput);
    getPreviousSearch();
  });

  // Listen for one of the previously searched cities to be clicked
  $("#searchhistory").on('click', '.btn', function (event) {
    event.preventDefault();
    console.log($(this).text());
    getCityWeather($(this).text());
  });

  getPreviousSearch();
