import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [location, setLocation] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [unit, setUnit] = useState("C");
  const [recentSearches, setRecentSearches] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  const apiKey = "108f1172fb5b4588ac9142146251205";

  const getWeather = async (query) => {
    setLoading(true);
    setError("");
    setWeatherData(null);
    const url = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${query}&days=5&aqi=yes`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Weather not found");
      const data = await res.json();
      setWeatherData({
        city: data.location.name,
        country: data.location.country,
        current: {
          temp_c: data.current.temp_c,
          temp_f: data.current.temp_f,
          condition: data.current.condition.text,
          icon: data.current.condition.icon,
        },
        forecast: data.forecast.forecastday.map((day) => ({
          date: day.date,
          avgtemp_c: day.day.avgtemp_c,
          avgtemp_f: day.day.avgtemp_f,
          condition: day.day.condition.text,
          icon: day.day.condition.icon,
        })),
      });
      saveToRecentSearches(query);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    if (location.trim()) {
      getWeather(location.trim());
    }
  };

  const saveToRecentSearches = (query) => {
    const updated = [query, ...recentSearches.filter((item) => item !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const toggleUnit = () => setUnit((prev) => (prev === "C" ? "F" : "C"));
  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("recentSearches")) || [];
    setRecentSearches(stored);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = `${pos.coords.latitude},${pos.coords.longitude}`;
          getWeather(coords);
        },
        () => setError("Geolocation blocked. Enter city manually.")
      );
    }
  }, []);

  return (
    <div className={`app ${darkMode ? "dark" : "light"}`}>
      <div className="card">
        <div className="header">
          <h1>🌤 Weather App</h1>
          <div className="toggles">
            <button onClick={toggleDarkMode}>{darkMode ? "☀️" : "🌙"}</button>
            <button onClick={toggleUnit}>°{unit}</button>
          </div>
        </div>
        <input
          type="text"
          placeholder="Enter city name"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <button onClick={handleSearch}>Check Weather</button>

        {loading && <p>Loading weather...</p>}
        {error && <p className="error">{error}</p>}

        {recentSearches.length > 0 && (
          <div className="recent">
            <p>Recent:</p>
            {recentSearches.map((city, i) => (
              <button key={i} onClick={() => getWeather(city)}>
                {city}
              </button>
            ))}
          </div>
        )}

        {weatherData && (
          <div className="result">
            <h2>
              {weatherData.city}, {weatherData.country}
            </h2>
            <img src={weatherData.current.icon} alt="icon" />
            <p className="temp">
              {unit === "C"
                ? weatherData.current.temp_c + "°C"
                : weatherData.current.temp_f + "°F"}
            </p>
            <p className="condition">{weatherData.current.condition}</p>

            <h3>3-Day Forecast</h3>
            <div className="forecast">
              {weatherData.forecast.map((day, idx) => (
                <div className="forecast-day" key={idx}>
                  <p>{day.date}</p>
                  <img src={day.icon} alt={day.condition} />
                  <p>
                    {unit === "C"
                      ? `${day.avgtemp_c}°C`
                      : `${day.avgtemp_f}°F`}
                  </p>
                  <p>{day.condition}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
