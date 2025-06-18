import { getWeatherDescription, getWeatherIcon } from "@/lib/weather-utils";
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

	const currentDate = new Date();

	return (
		<div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-500 to-purple-600 text-white min-h-screen">
			<div className="p-6 flex justify-between items-center">
				<div>
					<h1 className="text-sm opacity-80">Results for</h1>
					<h2 className="text-xl font-medium">
						{locationData?.city || locationData?.locality || "Current Location"}
						{locationData?.principalSubdivision &&
							`, ${locationData.principalSubdivision}`}
					</h2>
				</div>
				<button
					type="button"
					onClick={getCurrentLocation}
					disabled={isGettingLocation}
					className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
				>
					<span className="text-xs">📍</span>
					{isGettingLocation ? "Getting Location..." : "Use precise location"}
				</button>
			</div>

			{weatherData && (
				<div className="px-6">
					<div className="flex items-center justify-between mb-8">
						<div className="flex items-center gap-6">
							<div className="text-8xl">
								{getWeatherIcon(
									weatherData.current.weather_code || 0,
									weatherData.current.is_day === 1,
								)}
							</div>
							<div>
								<div className="text-8xl font-light">
									{Math.round(weatherData.current.temperature_2m)}
									<span className="text-4xl">
										°{weatherData.current_units.temperature_2m.replace("°", "")}
									</span>
								</div>
								<div className="text-sm opacity-80 mt-2">
									<div>
										Precipitation: {weatherData.current.precipitation || 0}%
									</div>
									<div>
										Humidity: {weatherData.current.relative_humidity_2m || 0}%
									</div>
									<div>
										Wind: {weatherData.current.wind_speed_10m}{" "}
										{weatherData.current_units.wind_speed_10m}
									</div>
								</div>
							</div>
						</div>
						<div className="text-right">
							<div className="text-3xl font-light">Weather</div>
							<div className="text-sm opacity-80">
								{currentDate.toLocaleDateString([], {
									weekday: "long",
									hour: "2-digit",
									minute: "2-digit",
								})}
							</div>
							<div className="text-sm opacity-80">
								{getWeatherDescription(weatherData.current.weather_code || 0)}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
