import React, { useState, useEffect } from 'react';
import { Cloud, CloudSun, Sun, CloudRain, Thermometer, MapPin, Clock } from 'lucide-react';

interface WeatherWidgetProps {
  locationName?: string;
  countryCode?: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  locationName = 'India',
  countryCode = 'IN',
}) => {
  const [temp, setTemp] = useState<number>(29);
  const [condition, setCondition] = useState<string>('Clear Sky');
  const [loading, setLoading] = useState(false);
  const [istTime, setIstTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setIstTime(
        now.toLocaleTimeString('en-US', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const timeTimer = setInterval(updateTime, 1000);

    // Fetch India weather (New Delhi coordinates: Lat 28.6139, Long 77.2090)
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=28.6139&longitude=77.2090&current=temperature_2m,weather_code&timezone=Asia%2FKolkata'
        );
        if (res.ok) {
          const data = await res.json();
          if (data?.current?.temperature_2m !== undefined) {
            setTemp(Math.round(data.current.temperature_2m));
            const code = data.current.weather_code;
            if (code === 0) setCondition('Clear Sky');
            else if (code <= 3) setCondition('Partly Cloudy');
            else if (code <= 48) setCondition('Hazy / Foggy');
            else if (code <= 67) setCondition('Monsoon Rain');
            else if (code <= 77) setCondition('Rain Showers');
            else setCondition('Cloudy');
          }
        }
      } catch {
        // Fallback default
        setTemp(28);
        setCondition('Pleasant');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    const weatherInterval = setInterval(fetchWeather, 600000); // 10 minutes

    return () => {
      clearInterval(timeTimer);
      clearInterval(weatherInterval);
    };
  }, []);

  const getWeatherIcon = () => {
    switch (condition) {
      case 'Clear Sky':
        return <Sun size={20} className="text-amber-300 animate-spin-slow" />;
      case 'Monsoon Rain':
      case 'Rain Showers':
        return <CloudRain size={20} className="text-sky-400" />;
      default:
        return <CloudSun size={20} className="text-amber-200" />;
    }
  };

  return (
    <div
      id="weather-widget"
      className="w-full rounded-xl p-3 sm:p-3.5 flex items-center justify-between bg-black/30 border border-white/10 backdrop-blur-md transition-all duration-300 hover:border-amber-400/40 hover:bg-amber-400/5 text-left"
      style={{
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-amber-300">
          {getWeatherIcon()}
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-xs text-stone-300">
            <MapPin size={12} className="text-rose-400" />
            <span className="font-semibold text-white">{locationName}</span>
            <span className="text-[10px] text-amber-300 font-mono">🇮🇳 {countryCode}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-0.5 font-mono">
            <span>{loading ? 'Updating...' : condition}</span>
            <span>•</span>
            <span className="text-sky-300 flex items-center gap-1">
              <Clock size={10} />
              {istTime} IST
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Thermometer size={16} className="text-sky-300" />
        <span className="text-xl font-bold font-mono text-white tracking-tight">
          {temp}°C
        </span>
      </div>
    </div>
  );
};
