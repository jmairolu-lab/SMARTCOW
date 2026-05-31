const axios = require('axios');

const getCareAdvice = (temp, condition) => {
  const advice = [];
  const condLower = (condition || '').toLowerCase();

  if (temp >= 35) {
    advice.push({
      type: 'heat',
      message: 'High temperature detected. Ensure cattle have ample shade and fresh water. Increase hydration frequency.',
    });
  }

  if (condLower.includes('rain') || condLower.includes('drizzle') || condLower.includes('shower')) {
    advice.push({
      type: 'rain',
      message: 'Rainy conditions expected. Provide dry shelter for cattle. Keep bedding clean and dry to prevent hoof problems.',
    });
  }

  if (temp <= 15) {
    advice.push({
      type: 'cold',
      message: 'Cold weather alert. Provide windbreaks and extra feed. Protect calves and weak animals with blankets.',
    });
  }

  if (advice.length === 0) {
    advice.push({
      type: 'normal',
      message: 'Weather conditions are moderate. Maintain regular feeding schedule and routine health checks.',
    });
  }

  return advice;
};

const getMockWeather = (lat, lng) => {
  const temp = 28 + Math.round((lat + lng) % 10);
  return {
    temperature: temp,
    humidity: 55 + Math.round(lat % 20),
    condition: 'Partly Cloudy',
    location: 'Your Location',
    advice: getCareAdvice(temp, 'Partly Cloudy'),
    source: 'fallback',
  };
};

exports.getWeather = async (req, res, next) => {
  try {
    const lat = req.query.lat || '12.9716';
    const lng = req.query.lng || '77.5946';
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey || apiKey === 'your_openweather_api_key_here') {
      return res.status(200).json({
        success: true,
        weather: getMockWeather(parseFloat(lat), parseFloat(lng)),
        note: 'Using simulated weather data. Set OPENWEATHER_API_KEY in .env for live data.',
      });
    }

    try {
      const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
        params: {
          lat,
          lon: lng,
          appid: apiKey,
          units: 'metric',
        },
        timeout: 8000,
      });

      const data = response.data;
      const temp = Math.round(data.main.temp);
      const condition = data.weather[0]?.main || 'Clear';

      res.status(200).json({
        success: true,
        weather: {
          temperature: temp,
          humidity: data.main.humidity,
          condition,
          description: data.weather[0]?.description || '',
          location: data.name || 'Your Location',
          advice: getCareAdvice(temp, condition),
          source: 'openweather',
        },
      });
    } catch (apiError) {
      res.status(200).json({
        success: true,
        weather: getMockWeather(parseFloat(lat), parseFloat(lng)),
        note: 'Weather API unavailable. Using fallback data.',
      });
    }
  } catch (error) {
    next(error);
  }
};
