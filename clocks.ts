const clocks = [
	["🕛", "🕧"],
	["🕐", "🕜"],
	["🕑", "🕝"],
	["🕒", "🕞"],
	["🕓", "🕟"],
	["🕔", "🕠"],
	["🕕", "🕡"],
	["🕖", "🕢"],
	["🕗", "🕣"],
	["🕘", "🕤"],
	["🕙", "🕥"],
	["🕚", "🕦"],
];

export const getClock = (time: Date) =>
	clocks[time.getHours() % 12][Math.floor(time.getMinutes() / 30)];
