import { getAllCountries } from "countries-and-timezones";

export type CountryTZ = [country: string, tz: string];

export const countries = Object.values(getAllCountries()).flatMap(country =>
	country.timezones.map((tz): CountryTZ => [country.name, tz]),
);

export const getMatches = (query: string): CountryTZ[] =>
	countries.filter(
		([c, t]) =>
			c.toLowerCase().includes(query) || t.toLowerCase().includes(query),
	);

export const sortCountryTZPairs = (
	[c1, tz1]: CountryTZ,
	[c2, tz2]: CountryTZ,
) => {
	const c = c1.localeCompare(c2);
	if (c) return c;
	return tz1.localeCompare(tz2);
};

export const searchSort =
	(search: string) =>
	([c1, tz1]: CountryTZ, [c2, tz2]: CountryTZ) => {
		// Sort results by matching results with search position
		const a = c1.toLowerCase().indexOf(search);
		const b = c2.toLowerCase().indexOf(search);
		if (a < 0) return 1;
		if (b < 0) return -1;
		if (a < b) return -1;
		if (a > b) return 1;

		const x = c1.toLowerCase().indexOf(search);
		const y = c2.toLowerCase().indexOf(search);
		if (x < 0) return 1;
		if (y < 0) return -1;
		if (x < y) return -1;
		if (x > y) return 1;
		return 0;
	};
