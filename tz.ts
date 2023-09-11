import { Context, Telegraf, session } from "telegraf";
import { utcToZonedTime, format } from "date-fns-tz";

import type { InlineQueryResultArticle, Update } from "telegraf/types";
import { bold, code, fmt } from "telegraf/format";

import {
	CountryTZ,
	countries,
	getMatches,
	searchSort,
	sortCountryTZPairs,
} from "./utils";

// Set the output to "04:35 (GMT+5:30) on Sep 12, 2023"
const pattern = "HH:mm (z) 'on' MMM dd, yyyy";

interface Session {
	recent: CountryTZ[];
}

interface MyCtx<U extends Update = Update> extends Context<U> {
	session: Session;
}

const bot = new Telegraf<MyCtx>(process.env.TOKEN);

bot.use(
	session({
		getSessionKey: ctx => (ctx.from?.id ? String(ctx.from.id) : undefined),
		defaultSession: () => ({ recent: [] }),
	}),
);

bot.on("inline_query", async ctx => {
	const query = ctx.inlineQuery.query.trim().toLowerCase();
	const date = new Date();
	const base = query
		? getMatches(query)
		: ctx.session.recent.length
		? ctx.session.recent
		: countries;

	await ctx.answerInlineQuery(
		base
			.sort(sortCountryTZPairs)
			.sort(searchSort(query))
			.slice(0, 50)
			.map(([country, tz]): InlineQueryResultArticle => {
				const title = `${country} (${tz})`;
				const description = format(utcToZonedTime(date, tz), pattern);
				const formatted = fmt`
${bold(title)}
${code(description)}
`;

				return {
					type: "article",
					id: `${country}:${tz}`,
					title,
					description,
					input_message_content: {
						message_text: formatted.text,
						entities: formatted.entities,
					},
				};
			}),
		{ cache_time: 0 },
	);
});

const clean = (czs: CountryTZ[], [c1, t1]: CountryTZ) =>
	czs.filter(([c2, t2]) => c1 !== c2 && t1 !== t2);

bot.on("chosen_inline_result", async ctx => {
	const countryTz = ctx.chosenInlineResult.result_id.split(":") as CountryTZ;
	ctx.session.recent = clean(ctx.session.recent, countryTz); // remove any existing instance
	ctx.session.recent.push(countryTz); // push latest chosen tz
	ctx.session.recent = ctx.session.recent.splice(-5); // only keep recent 5
});

bot.launch({ dropPendingUpdates: true });
