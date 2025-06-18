import type { LocationData } from "@/types/location";
import type { WeatherData } from "@/types/weather";

import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { parseAsFloat, useQueryState } from "nuqs";
import { useState } from "react";

export const Route = createFileRoute("/demo/weather")({
	component: WeatherDemo,
});

function WeatherDemo() {
	// London = 51.5072° N, 0.1276° W
	const [latitude, setLatitude] = useQueryState(
		"latitude",
		parseAsFloat.withDefault(51.5072),
	);
	const [longitude, setLongitude] = useQueryState(
		"longitude",
		parseAsFloat.withDefault(0.1276),
	);

	const [isGettingLocation, setIsGettingLocation] = useState(false);

	const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,relative_humidity_2m,apparent_temperature,is_day,weather_code,precipitation,cloud_cover,pressure_msl,visibility&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,apparent_temperature,precipitation_probability,precipitation,weather_code,cloud_cover,visibility,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_hours,precipitation_probability_max&timezone=auto`;

	const { data: weatherData } = useQuery<WeatherData, Error>({
		queryKey: ["weather", latitude, longitude],
		queryFn: () =>
			fetch(apiUrl)
				.then((res) => {
					if (!res.ok) {
						throw new Error(`HTTP error! status: ${res.status}`);
					}
					return res.json();
				})
				.then((d) => d as WeatherData),
		enabled: typeof latitude === "number" && typeof longitude === "number",
	});

	// Reverse geocoding query to get location name
	const { data: locationData } = useQuery<LocationData, Error>({
		queryKey: ["location", latitude, longitude],
		queryFn: async () => {
			const response = await fetch(
				`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
			);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return response.json();
		},
		enabled: typeof latitude === "number" && typeof longitude === "number",
	});

	// Get current location using browser geolocation API
	const getCurrentLocation = () => {
		if (!navigator.geolocation) {
			alert("Geolocation is not supported by this browser");
			return;
		}

		setIsGettingLocation(true);
		navigator.geolocation.getCurrentPosition(
			(position) => {
				setLatitude(position.coords.latitude);
				setLongitude(position.coords.longitude);
				setIsGettingLocation(false);
			},
			(error) => {
				console.error("Error getting location:", error);
				setIsGettingLocation(false);
			},
			{
				enableHighAccuracy: true,
				timeout: 10 * 1000, // 10 seconds
				maximumAge: 60 * 60 * 1000, // 1 hour
			},
		);
	};

	return (
		<div className="p-4">
			<div className="mb-4">
				<button
					type="button"
					onClick={getCurrentLocation}
					disabled={isGettingLocation}
					className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
				>
					{isGettingLocation ? "Getting Location..." : "Use Current Location"}
				</button>
			</div>

			<h1 className="text-2xl mb-4">
				Current Weather
				{locationData?.city || locationData?.locality
					? ` in ${locationData.city || locationData.locality}, ${locationData.countryName}`
					: ""}
			</h1>
			<p className="text-gray-600 mb-4">
				Coordinates: {latitude?.toFixed(2)}°, {longitude?.toFixed(2)}°
			</p>
			{weatherData && (
				<div>
					<p>
						Temperature: {weatherData.current.temperature_2m}
						{weatherData.current_units.temperature_2m}
					</p>
					<p>
						Wind Speed: {weatherData.current.wind_speed_10m}
						{weatherData.current_units.wind_speed_10m}
					</p>
					<p>Timezone: {weatherData.timezone}</p>
					<p>Elevation: {weatherData.elevation}m</p>
					<p>
						Fetched Time: {new Date(weatherData.current.time).toLocaleString()}
					</p>
					<h2 className="text-xl mt-4 mb-2">Hourly Forecast (next 3 hours)</h2>
					<ul>
						{weatherData.hourly.time.slice(0, 3).map((time, index) => (
							<li key={time}>
								{new Date(time).toLocaleTimeString()}:{" "}
								{weatherData.hourly.temperature_2m[index]}
								{weatherData.hourly_units.temperature_2m},{" "}
								{weatherData.hourly.wind_speed_10m[index]}
								{weatherData.hourly_units.wind_speed_10m}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}
