// Define the interface for the weather data structure
interface WeatherUnits {
	time: string;
	interval?: string; // Optional for hourly
	temperature_2m: string;
	wind_speed_10m: string;
	relative_humidity_2m?: string; // Optional for current
	apparent_temperature?: string;
	weather_code?: string;
	precipitation?: string;
	cloud_cover?: string;
	pressure_msl?: string;
	visibility?: string;
	is_day?: string;
	uv_index?: string;
	precipitation_probability?: string;
	temperature_2m_max?: string;
	temperature_2m_min?: string;
	sunrise?: string;
	sunset?: string;
	uv_index_max?: string;
	precipitation_sum?: string;
	precipitation_hours?: string;
	precipitation_probability_max?: string;
}

interface CurrentWeather {
	time: string;
	interval: number;
	temperature_2m: number;
	wind_speed_10m: number;
	relative_humidity_2m?: number;
	apparent_temperature?: number;
	weather_code?: number;
	precipitation?: number;
	cloud_cover?: number;
	pressure_msl?: number;
	visibility?: number;
	is_day?: number;
}

interface HourlyWeather {
	time: string[];
	temperature_2m: number[];
	relative_humidity_2m: number[];
	wind_speed_10m: number[];
	apparent_temperature?: number[];
	precipitation_probability?: number[];
	precipitation?: number[];
	weather_code?: number[];
	cloud_cover?: number[];
	visibility?: number[];
	uv_index?: number[];
}

interface DailyWeather {
	time: string[];
	weather_code: number[];
	temperature_2m_max: number[];
	temperature_2m_min: number[];
	sunrise: string[];
	sunset: string[];
	uv_index_max: number[];
	precipitation_sum: number[];
	precipitation_hours: number[];
	precipitation_probability_max: number[];
}

export interface WeatherData {
	latitude: number;
	longitude: number;
	generationtime_ms: number;
	utc_offset_seconds: number;
	timezone: string;
	timezone_abbreviation: string;
	elevation: number;
	current_units: WeatherUnits;
	current: CurrentWeather;
	hourly_units: WeatherUnits;
	hourly: HourlyWeather;
	daily_units?: WeatherUnits;
	daily?: DailyWeather;
}
