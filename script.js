document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form');
    const locationInput = document.getElementById('location-input');
    const suggestionsList = document.getElementById('suggestions');
    
    const dashboard = document.getElementById('weather-dashboard');
    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');
    const errorMessage = document.getElementById('error-message');

    // DOM Elements for updating weather
    const locationName = document.getElementById('location-name');
    const currentDate = document.getElementById('current-date');
    const weatherIcon = document.getElementById('weather-icon');
    const weatherDesc = document.getElementById('weather-desc');
    const tempValue = document.getElementById('temperature');
    
    // Details
    const feelsLike = document.getElementById('feels-like');
    const humidity = document.getElementById('humidity');
    const windSpeed = document.getElementById('wind-speed');
    const pressure = document.getElementById('pressure');

    // Debounce timer for suggestions
    let debounceTimer;

    // --- Weather Codes to Icons & Descriptions Mapping ---
    // WMO Weather interpretation codes (WMO code)
    const weatherMap = {
        0: { desc: 'Clear sky', icon: 'clear.svg' },
        1: { desc: 'Mainly clear', icon: 'clear.svg' },
        2: { desc: 'Partly cloudy', icon: 'cloudy.svg' },
        3: { desc: 'Overcast', icon: 'cloudy.svg' },
        45: { desc: 'Fog', icon: 'fog.svg' },
        48: { desc: 'Depositing rime fog', icon: 'fog.svg' },
        51: { desc: 'Drizzle: Light', icon: 'rain.svg' },
        53: { desc: 'Drizzle: Moderate', icon: 'rain.svg' },
        55: { desc: 'Drizzle: Dense', icon: 'rain.svg' },
        56: { desc: 'Freezing Drizzle: Light', icon: 'snow.svg' },
        57: { desc: 'Freezing Drizzle: Dense', icon: 'snow.svg' },
        61: { desc: 'Rain: Slight', icon: 'rain.svg' },
        63: { desc: 'Rain: Moderate', icon: 'rain.svg' },
        65: { desc: 'Rain: Heavy', icon: 'rain.svg' },
        66: { desc: 'Freezing Rain: Light', icon: 'snow.svg' },
        67: { desc: 'Freezing Rain: Heavy', icon: 'snow.svg' },
        71: { desc: 'Snow fall: Slight', icon: 'snow.svg' },
        73: { desc: 'Snow fall: Moderate', icon: 'snow.svg' },
        75: { desc: 'Snow fall: Heavy', icon: 'snow.svg' },
        77: { desc: 'Snow grains', icon: 'snow.svg' },
        80: { desc: 'Rain showers: Slight', icon: 'rain.svg' },
        81: { desc: 'Rain showers: Moderate', icon: 'rain.svg' },
        82: { desc: 'Rain showers: Violent', icon: 'rain.svg' },
        85: { desc: 'Snow showers slight', icon: 'snow.svg' },
        86: { desc: 'Snow showers heavy', icon: 'snow.svg' },
        95: { desc: 'Thunderstorm', icon: 'thunder.svg' },
        96: { desc: 'Thunderstorm with hail', icon: 'thunder.svg' },
        99: { desc: 'Thunderstorm with heavy hail', icon: 'thunder.svg' },
    };

    // Get fallback icon URL if we don't have SVGs hosted
    const getIconUrl = (isDay, weatherCode) => {
        // Alternatively, use open source APIs or standard emojis, but let's map to static assets we can use
        // We'll use openweathermap icons but fetch from open-meteo mapping
        const codeMap = {
            0: isDay ? '01d' : '01n',
            1: isDay ? '01d' : '01n',
            2: isDay ? '02d' : '02n',
            3: isDay ? '03d' : '03n',
            45: isDay ? '50d' : '50n',
            48: isDay ? '50d' : '50n',
            51: isDay ? '09d' : '09n',
            53: isDay ? '09d' : '09n',
            55: isDay ? '09d' : '09n',
            56: isDay ? '13d' : '13n',
            57: isDay ? '13d' : '13n',
            61: isDay ? '10d' : '10n',
            63: isDay ? '10d' : '10n',
            65: isDay ? '10d' : '10n',
            66: isDay ? '13d' : '13n',
            67: isDay ? '13d' : '13n',
            71: isDay ? '13d' : '13n',
            73: isDay ? '13d' : '13n',
            75: isDay ? '13d' : '13n',
            77: isDay ? '13d' : '13n',
            80: isDay ? '09d' : '09n',
            81: isDay ? '09d' : '09n',
            82: isDay ? '09d' : '09n',
            85: isDay ? '13d' : '13n',
            86: isDay ? '13d' : '13n',
            95: isDay ? '11d' : '11n',
            96: isDay ? '11d' : '11n',
            99: isDay ? '11d' : '11n',
        };
        const mappedCode = codeMap[weatherCode] || (isDay ? '01d' : '01n');
        return `https://openweathermap.org/img/wn/${mappedCode}@4x.png`;
    };

    // Search input listener for autocomplete (Optional Enhancement)
    locationInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        clearTimeout(debounceTimer);
        
        if (query.length < 3) {
            suggestionsList.classList.add('hidden');
            return;
        }

        debounceTimer = setTimeout(() => fetchSuggestions(query), 500);
    });

    // Form submit
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = locationInput.value.trim();
        if (query) {
            suggestionsList.classList.add('hidden');
            fetchWeatherForCity(query);
            locationInput.value = ''; // clear input after search
        }
    });

    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchForm.contains(e.target)) {
            suggestionsList.classList.add('hidden');
        }
    });

    // Fetch Auto-Suggest
    async function fetchSuggestions(query) {
        try {
            const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
            const data = await res.json();
            
            suggestionsList.innerHTML = '';
            
            if (data.results && data.results.length > 0) {
                data.results.forEach(city => {
                    const li = document.createElement('li');
                    li.className = 'suggestion-item';
                    
                    const countryDisplay = city.admin1 ? `${city.admin1}, ${city.country}` : city.country;
                    
                    li.innerHTML = `
                        <span>📍</span>
                        <div>
                            <div>${city.name}</div>
                            <div class="suggestion-sub">${countryDisplay}</div>
                        </div>
                    `;
                    
                    li.addEventListener('click', () => {
                        locationInput.value = city.name;
                        suggestionsList.classList.add('hidden');
                        fetchWeatherByCoords(city.latitude, city.longitude, city.name, city.country);
                        locationInput.value = '';
                    });
                    
                    suggestionsList.appendChild(li);
                });
                suggestionsList.classList.remove('hidden');
            } else {
                suggestionsList.classList.add('hidden');
            }
        } catch (error) {
            console.error("Geocoding fetch error:", error);
        }
    }

    // Fetch weather given a city name
    async function fetchWeatherForCity(cityName) {
        showLoading();
        try {
            // Step 1: Geocoding
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`);
            if (!geoRes.ok) throw new Error("Geocoding failed");
            const geoData = await geoRes.json();

            if (!geoData.results || geoData.results.length === 0) {
                showError("Location not found. Please try a different name.");
                return;
            }

            const { latitude, longitude, name, country } = geoData.results[0];
            await fetchWeatherByCoords(latitude, longitude, name, country);
            
        } catch (error) {
            console.error(error);
            showError("An error occurred while fetching data.");
        }
    }

    // Fetch Weather Data given coordinates
    async function fetchWeatherByCoords(lat, lon, cityName, countryName) {
        showLoading();
        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,surface_pressure,wind_speed_10m&timezone=auto`;
            const weatherRes = await fetch(url);
            if (!weatherRes.ok) throw new Error("Weather fetch failed");
            const weatherData = await weatherRes.json();

            updateUI(weatherData, cityName, countryName);
        } catch (error) {
            console.error(error);
            showError("Failed to fetch weather conditions.");
        }
    }

    // Update the DOM
    function updateUI(data, city, country) {
        if (!data.current) return;

        const current = data.current;
        
        // Update texts
        locationName.textContent = `${city}${country ? ', ' + country : ''}`;
        
        // Format Date
        const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
        currentDate.textContent = new Date().toLocaleDateString('en-US', options);

        // Core Weather Info
        tempValue.textContent = Math.round(current.temperature_2m);
        
        // Weather Code Interpretation
        const wCode = current.weather_code;
        const wInfo = weatherMap[wCode] || { desc: 'Unknown condition', icon: 'clear' };
        weatherDesc.textContent = wInfo.desc;
        
        // Icon
        const isDay = current.is_day === 1;
        weatherIcon.src = getIconUrl(isDay, wCode);
        weatherIcon.alt = wInfo.desc;

        // Details
        feelsLike.textContent = `${Math.round(current.apparent_temperature)}°`;
        humidity.textContent = `${current.relative_humidity_2m}%`;
        windSpeed.textContent = `${current.wind_speed_10m} km/h`;
        pressure.textContent = `${current.surface_pressure} hPa`;

        // Wait a slight moment for smooth transition
        setTimeout(() => {
            hideLoading();
            dashboard.classList.remove('hidden');
        }, 300);
    }

    // State Management functions
    function showLoading() {
        dashboard.classList.add('hidden');
        errorState.classList.add('hidden');
        loadingState.classList.remove('hidden');
    }

    function hideLoading() {
        loadingState.classList.add('hidden');
    }

    function showError(msg) {
        hideLoading();
        dashboard.classList.add('hidden');
        errorMessage.textContent = msg;
        errorState.classList.remove('hidden');
    }

    // Init default city
    fetchWeatherForCity('London');
});
