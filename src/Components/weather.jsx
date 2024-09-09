import React, { useState } from 'react';
import axios from 'axios';


const Weather = () => {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [isCelsius, setIsCelsius] = useState(true);
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(''); 

  const units = 'metric';
  const apiKey = process.env.REACT_APP_WEATHER_API_KEY; 

  const fetchWeatherData = async (currentCity) => {
    if (currentCity === '') return;

    setLoading(true); 
    setError('');  
    setWeatherData(null);

    try {
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${currentCity}&appid=${apiKey}&units=${units}`
      );
      const weather = res.data;

      const forecastRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${currentCity}&appid=${apiKey}&units=${units}`
      );
      const forecast = forecastRes.data;

      setWeatherData(weather);
      setForecastData(forecast);
    } catch (error) {
      setError('Enter a valid city name');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchWeatherData(city);
  };

  const handleGeoLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      setError(''); 
      setWeatherData(null);

      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=${units}`
          );
          const weather = res.data;
          const forecastRes = await axios.get(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=${units}`
          );
          const forecast = forecastRes.data;

          setWeatherData(weather);
          setForecastData(forecast);
        } catch (error) {
          setError('Enter a valid city name');
        } finally {
          setLoading(false); 
        }
      });
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };

  const getDailyForecasts = (forecastData) => {
    const dailyForecasts = [];
    const forecastMap = {};

    forecastData.list.forEach((forecast) => {
      const date = new Date(forecast.dt * 1000).toLocaleDateString();
      if (!forecastMap[date]) {
        dailyForecasts.push(forecast);
        forecastMap[date] = true;
      }
    });

    return dailyForecasts.slice(0, 5);
  };

  const convertToFahrenheit = (tempCelsius) => (tempCelsius * 9/5) + 32;
  const convertToCelsius = (tempFahrenheit) => (tempFahrenheit - 32) * 5/9;

  const handleSwitchUnit = () => {
    if (weatherData) {
      const updatedWeatherData = { ...weatherData };
      if (isCelsius) {
        updatedWeatherData.main.temp = convertToFahrenheit(weatherData.main.temp);
      } else {
        updatedWeatherData.main.temp = convertToCelsius(weatherData.main.temp);
      }
      setWeatherData(updatedWeatherData);
      setIsCelsius(!isCelsius);
    }
  };

  return (
    <div className="min-h-screen bg-blue-100   flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Weather App</h1>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
            <div className="flex w-full">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="flex-grow p-2 border border-gray-400 rounded-l-md bg-white text-black"
                placeholder="Search for cities"
              />
              <button
                onClick={handleSearch}
                className="bg-blue-300 px-4 py-2 rounded-r-md text-white flex-shrink-0"
              >
                Search
              </button>
            </div>
            <button
              onClick={handleGeoLocation}
              className="bg-blue-950 w-full sm:w-auto px-10 py-2 rounded-lg text-white"
            >
              Use My Location
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center text-lg">Loading...</div>
        )}

        {error && (
          <div className="text-center text-red-500 mb-4">{error}</div>
        )}

        {weatherData && (
          <div className="flex flex-col lg:flex-row lg:space-x-10 space-y-6 lg:space-y-0">
            <div className="bg-blue-300 p-6 rounded-lg shadow-lg flex flex-col sm:flex-row justify-between items-center lg:w-1/2">
              <div>
                <h2 className="text-3xl font-bold mb-2">{weatherData.name}</h2>
                <p className="text-lg mb-4">Chances of rain<span className=' text-xl'>🌧️</span> {weatherData.clouds.all}%</p>
                <p className="text-6xl font-bold mb-4">
                  {Math.ceil(weatherData.main.temp)}°{isCelsius ? 'C' : 'F'}
                </p>
                <p className="text-xl capitalize">{weatherData.weather[0].description}</p>
                <p className="text-lg">Humidity <span className=' text-xl'>💧</span>{weatherData.main.humidity}%</p>
                <p className="text-xl mb-2">Wind Speed <span className=' text-xl'>🍃</span> {Math.ceil(weatherData.wind.speed)} m/s</p>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <button
                  onClick={handleSwitchUnit}
                  className="bg-sky-950 px-4 py-2 rounded-lg text-white"
                >
                  Switch to {isCelsius ? 'Fahrenheit' : 'Celsius'}
                </button>
                <img
                  src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                  alt={weatherData.weather[0].description}
                  className=" w-32"
                />
              </div>
            </div>

            {forecastData && (
              <div className="bg-blue-950 p-6 rounded-lg shadow-lg lg:w-1/2">
                <h3 className="text-2xl text-white font-bold mb-4">5-Day Forecast</h3>
                <div className="flex flex-col space-y-4">
                  {getDailyForecasts(forecastData).map((forecast, index) => (
                    <div key={index} className="flex justify-between items-center bg-blue-300 p-3 rounded-md">
                      <p>{new Date(forecast.dt * 1000).toLocaleDateString()}</p>
                      <img
                        src={`http://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`}
                        alt={forecast.weather[0].description}
                        className="w-12"
                      />
                      <p>{forecast.weather[0].description}</p>
                      <p>{Math.ceil(forecast.main.temp)}°C</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Weather;
