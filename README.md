# SkyHost | Real-Time Weather Updates

SkyHost is a premium weather application providing accurate, real-time atmospheric conditions for any chosen location globally.

## Features

- **Real-Time Weather Data**: Get current temperature, "feels like" temperature, humidity, wind speed, and atmospheric pressure.
- **Location Search with Autocomplete**: Quickly find cities around the world with intelligent auto-suggestions as you type.
- **Dynamic Weather Icons**: Displays visual indicators matching the current atmospheric conditions.
- **Responsive Design**: A clean, modern user interface, built with standard web technologies.

## Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript.
- **APIs Used**:
  - [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) for location search and autocomplete.
  - [Open-Meteo Weather API](https://open-meteo.com/) for fetching atmospheric conditions.
  - [OpenWeatherMap Icons](https://openweathermap.org/weather-conditions) mapped to WMO weather codes.
- **Typography**: [Google Fonts - Outfit](https://fonts.google.com/specimen/Outfit).

## Getting Started

To run the application locally, you can use the provided simple PowerShell HTTP server.

1. Ensure all project files (`index.html`, `styles.css`, `script.js`, and `server.ps1`) are in the same folder.
2. Open PowerShell and navigate to the project directory.
3. Start the server by running the script:
   ```powershell
   ./server.ps1
   ```
4. Open your web browser and navigate to: [http://localhost:8045/](http://localhost:8045/)

*(Note: You can also use any other local web server like VS Code's `Live Server`, `python -m http.server`, or `npx serve` to serve the files).*

## Project Structure

- `index.html`: The main markup file, defining the application layout and UI skeleton.
- `styles.css`: Contains all custom styling, animations, and responsive layouts.
- `script.js`: Core logic for API integration, DOM manipulation, form handling, and state management.
- `server.ps1`: A lightweight local development server.
