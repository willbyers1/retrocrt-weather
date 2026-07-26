import React, { useState, useEffect, useRef } from 'react';
import { WeatherService } from '../weather-service';
import { WeatherData, ForecastData } from '../types';
import SpecularButton from './SpecularButton/SpecularButton';

const getWeatherAscii = (icon: string) => {
  const map: Record<string, string[]> = {
    '01d': [' \\   / ', '  .-.  ', '-(   )-', '  `-`  ', ' /   \\ '],
    '01n': ['   .   ', '  . *. ', ' *  .  ', '  .   *', '   *  .'],
    '02d': [' \\  /  ', '_ /""._', ' (   ).', '  `-"` '],
    '02n': ['      .', '_ /""._', ' (   ).', '  `-"` '],
    '03d': ['       ', '  .--. ', '-(   ).', ' `---` '],
    '03n': ['       ', '  .--. ', '-(   ).', ' `---` '],
    '04d': ['       ', '  .--. ', '-(   ).', ' `---` '],
    '04n': ['       ', '  .--. ', '-(   ).', ' `---` '],
    '09d': ['  .--. ', '-(   ).', ' `---` ', '  / / /'],
    '09n': ['  .--. ', '-(   ).', ' `---` ', '  / / /'],
    '10d': [' _/""_ ', ' (   ).', ' `---` ', '  / / /'],
    '10n': [' _/""_ ', ' (   ).', ' `---` ', '  / / /'],
    '11d': ['  .--. ', '-(   ).', ' `---` ', '   /_  ', '  /    '],
    '11n': ['  .--. ', '-(   ).', ' `---` ', '   /_  ', '  /    '],
    '13d': ['  .--. ', '-(   ).', ' `---` ', '  * * *'],
    '13n': ['  .--. ', '-(   ).', ' `---` ', '  * * *'],
    '50d': [' ~ ~ ~ ', '  ~ ~ ~', ' ~ ~ ~ '],
    '50n': [' ~ ~ ~ ', '  ~ ~ ~', ' ~ ~ ~ ']
  };
  return (map[icon] || map['01d']).join('\n');
};

const TypewriterText: React.FC<{ text: string, speed?: number, onComplete?: () => void }> = ({ text, speed = 30, onComplete }) => {
  const [displayed, setDisplayed] = useState('');
  
  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.substring(0, i));
      i++;
      if (i > text.length) {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return <span>{displayed}</span>;
};

interface WeatherTerminalProps {
  themeColor: string;
}

export const WeatherTerminal: React.FC<WeatherTerminalProps> = ({ themeColor }) => {
  const [booting, setBooting] = useState(true);
  const [bootLog, setBootLog] = useState<string[]>([]);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('owm_api_key') || '');
  const [inputKey, setInputKey] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [weatherService, setWeatherService] = useState<WeatherService | null>(null);
  
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');

  useEffect(() => {
    const logs = [
      "INITIALIZING WEATHER TERMINAL v1.0...",
      "CALIBRATING SENSORS...",
      "ESTABLISHING SATELLITE LINK...",
      "READY."
    ];
    let i = 0;
    const int = setInterval(() => {
      setBootLog(prev => [...prev, logs[i]]);
      i++;
      if (i >= logs.length) {
        clearInterval(int);
        setTimeout(() => setBooting(false), 500);
      }
    }, 400);
    return () => clearInterval(int);
  }, []);

  useEffect(() => {
    if (apiKey) {
      setWeatherService(new WeatherService(apiKey, unit));
    }
  }, [apiKey, unit]);

  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputKey.trim()) {
      localStorage.setItem('owm_api_key', inputKey.trim());
      setApiKey(inputKey.trim());
      setInputKey('');
    }
  };

  const handleClearKey = () => {
    localStorage.removeItem('owm_api_key');
    setApiKey('');
    setWeatherData(null);
    setForecastData(null);
    setError('');
  };

  const fetchWeather = async (fetchFn: () => Promise<WeatherData>, forecastFetchFn: () => Promise<ForecastData[]>) => {
    setLoading(true);
    setError('');
    setWeatherData(null);
    setForecastData(null);
    try {
      const wData = await fetchFn();
      setWeatherData(wData);
      
      const fData = await forecastFetchFn();
      setForecastData(fData);
    } catch (err: any) {
      setError(err.message || 'ERR_UNKNOWN: COMMUNICATION FAILURE');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityInput.trim() || !weatherService) return;
    fetchWeather(
      () => weatherService.getWeatherByCity(cityInput.trim()),
      () => weatherService.getForecastByCity(cityInput.trim())
    );
  };

  const handleGeoLocate = () => {
    if (!weatherService) return;
    if (!navigator.geolocation) {
      setError("ERR_GEO: GEOLOCATION NOT SUPPORTED BY BROWSER");
      return;
    }
    
    setLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeather(
          () => weatherService.getWeatherByCoords(latitude, longitude),
          () => weatherService.getForecastByCoords(latitude, longitude)
        );
      },
      (err) => {
        setLoading(false);
        setError(`ERR_GEO: ${err.message.toUpperCase()}`);
      }
    );
  };

  const toggleUnit = () => {
    setUnit(prev => prev === 'metric' ? 'imperial' : 'metric');
    if (weatherData && cityInput) {
      // Re-fetch with new unit
      setTimeout(() => {
        // We need to trigger form submit essentially, but cityInput might not match if they used geo.
        // If weatherData exists, we can use the city name from weatherData
        if (weatherService) {
           weatherService.setUnit(unit === 'metric' ? 'imperial' : 'metric');
           fetchWeather(
            () => weatherService!.getWeatherByCity(weatherData.city),
            () => weatherService!.getForecastByCity(weatherData.city)
           );
        }
      }, 0);
    }
  };

  // Convert theme color to a darker variant for button base
  // We'll just rely on CSS opacity for now, or use a fixed dark gray if we can't easily parse hex here.
  const baseColor = themeColor === '#33ff33' ? '#0a220a' : 
                    themeColor === '#ffb000' ? '#2b1d00' : '#0a1222';

  if (booting) {
    return (
      <div className="p-8 h-full flex flex-col crt-text chromatic">
        {bootLog.map((log, i) => (
          <div key={i} className="mb-2"><TypewriterText text={log} speed={20} /></div>
        ))}
        <div className="mt-2"><span className="blinking-cursor">█</span></div>
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div className="p-8 h-full flex flex-col justify-center max-w-2xl mx-auto crt-text chromatic">
        <h1 className="text-2xl mb-8">SYS_HALT: API KEY REQUIRED</h1>
        <p className="mb-4">PLEASE PROVIDE AN OPENWEATHERMAP API KEY TO ESTABLISH LINK.</p>
        <p className="mb-8 opacity-80 text-sm">KEY IS STORED LOCALLY AND NEVER TRANSMITTED TO THIRD PARTIES.</p>
        
        <form onSubmit={handleKeySubmit} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center flex-grow bg-transparent border-b-2 border-[var(--crt-fg)] pb-1">
            <span className="mr-2">KEY&gt;</span>
            <input 
              type="password" 
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              className="bg-transparent outline-none flex-grow text-[var(--crt-fg)] font-mono"
              autoFocus
            />
            <span className="blinking-cursor">█</span>
          </div>
          <SpecularButton
            size="sm"
            radius={2}
            tintOpacity={0}
            textColor={themeColor}
            lineColor={themeColor}
            baseColor={baseColor}
            type="submit"
          >
            INITIALIZE
          </SpecularButton>
        </form>
      </div>
    );
  }

  const tempUnit = unit === 'metric' ? '°C' : '°F';
  const speedUnit = unit === 'metric' ? 'm/s' : 'mph';

  return (
    <div className="p-6 md:p-10 h-full flex flex-col crt-text chromatic overflow-y-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b-2 border-[var(--crt-fg)] pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-widest">WTHR_TERM</h1>
          <div className="text-sm opacity-80">STATUS: ONLINE | UPLINK: SECURE</div>
        </div>
        <div className="flex flex-wrap gap-3">
          <SpecularButton size="sm" radius={4} tintOpacity={0} textColor={themeColor} lineColor={themeColor} baseColor={baseColor} onClick={toggleUnit}>
            {`UNIT: ${tempUnit}`}
          </SpecularButton>
          <SpecularButton size="sm" radius={4} tintOpacity={0} textColor={themeColor} lineColor={themeColor} baseColor={baseColor} onClick={handleGeoLocate}>
            GEO_LOCATE
          </SpecularButton>
          <SpecularButton size="sm" radius={4} tintOpacity={0} textColor={themeColor} lineColor={themeColor} baseColor={baseColor} onClick={handleClearKey}>
            CLEAR_KEY
          </SpecularButton>
        </div>
      </header>

      <form onSubmit={handleSearch} className="mb-8 flex items-center">
        <span className="mr-2 text-xl">SEARCH&gt;</span>
        <input 
          type="text" 
          value={cityInput}
          onChange={(e) => setCityInput(e.target.value)}
          className="bg-transparent outline-none border-b-2 border-transparent focus:border-[var(--crt-fg)] flex-grow text-xl font-mono text-[var(--crt-fg)] uppercase"
          placeholder="ENTER LOCATION..."
        />
        {!cityInput && <span className="blinking-cursor text-xl -ml-2">█</span>}
        <div className="ml-4 hidden sm:block">
           <SpecularButton size="sm" radius={4} tintOpacity={0} textColor={themeColor} lineColor={themeColor} baseColor={baseColor} type="submit">
             EXECUTE
           </SpecularButton>
        </div>
      </form>

      <div aria-live="polite" className="flex-grow">
        {loading && (
          <div className="mt-8">
            <TypewriterText text="CONNECTING TO SATELLITE UPLINK........." />
            <span className="blinking-cursor">█</span>
          </div>
        )}

        {error && (
          <div className="mt-8 border-2 border-[var(--crt-fg)] p-4 max-w-2xl crt-flicker bg-[#ff000020]">
            <h2 className="text-xl font-bold mb-2">CRITICAL ERROR</h2>
            <p><TypewriterText text={error} /></p>
          </div>
        )}

        {weatherData && !loading && !error && (
          <div className="animate-[boot-on_0.3s_ease-out_forwards]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="border-2 border-[var(--crt-fg)] p-6 bg-[var(--crt-bg)] bg-opacity-80">
                <h2 className="text-2xl mb-4 border-b border-[var(--crt-fg)] pb-2 uppercase">{weatherData.city}</h2>
                <div className="flex items-center gap-8">
                  <pre className="text-xs sm:text-sm font-mono leading-tight whitespace-pre">
                    {getWeatherAscii(weatherData.iconId)}
                  </pre>
                  <div>
                    <div className="text-5xl font-bold mb-2">{Math.round(weatherData.temp)}{tempUnit}</div>
                    <div className="text-lg uppercase">{weatherData.description}</div>
                  </div>
                </div>
              </div>
              
              <div className="border-2 border-[var(--crt-fg)] p-6 bg-[var(--crt-bg)] bg-opacity-80 flex flex-col justify-center">
                <table className="w-full text-lg">
                  <tbody>
                    <tr>
                      <td className="py-2 opacity-80">FEELS LIKE:</td>
                      <td className="text-right">{Math.round(weatherData.feelsLike)}{tempUnit}</td>
                    </tr>
                    <tr>
                      <td className="py-2 opacity-80">HUMIDITY:</td>
                      <td className="text-right">{weatherData.humidity}%</td>
                    </tr>
                    <tr>
                      <td className="py-2 opacity-80">WIND:</td>
                      <td className="text-right">{weatherData.windSpeed} {speedUnit}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {forecastData && forecastData.length > 0 && (
              <div>
                <h3 className="text-xl mb-4 uppercase">/// 5-DAY FORECAST</h3>
                <div className="border-2 border-[var(--crt-fg)] p-1 overflow-x-auto bg-[var(--crt-bg)] bg-opacity-80">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b-2 border-[var(--crt-fg)]">
                        <th className="p-3 text-left">DATE</th>
                        <th className="p-3 text-left">CONDITIONS</th>
                        <th className="p-3 text-right">HIGH</th>
                        <th className="p-3 text-right">LOW</th>
                      </tr>
                    </thead>
                    <tbody>
                      {forecastData.map((day, idx) => (
                        <tr key={idx} className="border-b border-[var(--crt-fg)] border-opacity-30 last:border-0 hover:bg-[var(--crt-fg)] hover:text-[var(--crt-bg)] transition-colors cursor-default">
                          <td className="p-3">{day.date}</td>
                          <td className="p-3 uppercase">{day.description}</td>
                          <td className="p-3 text-right">{Math.round(day.tempMax)}{tempUnit}</td>
                          <td className="p-3 text-right">{Math.round(day.tempMin)}{tempUnit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
