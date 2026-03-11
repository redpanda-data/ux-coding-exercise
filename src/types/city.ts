export interface City {
	admin1: string;
	admin1_id: number;
	admin2: string;
	admin2_id: number;
	admin3: string;
	admin3_id: number;
	country: string;
	country_code: string;
	country_id: number;
	elevation: number;
	feature_code: string;
	id: number;
	latitude: number;
	longitude: number;
	name: string;
	population: number;
	postcodes: string[];
	timezone: string;
}

export interface CityData {
	generationtime_ms: number;
	results: City[];
}
