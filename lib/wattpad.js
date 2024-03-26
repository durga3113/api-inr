
const axios = require("axios");
const cheerio = require("cheerio");

class Wattpad {
	constructor() {
		this.baseURL = "https://www.wattpad.com";
		this.headers = {
			"upgrade-insecure-requests": 1,
			"user-agent": "Mozilla/5.0 (Linux; Android 9; CPH1923) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.62 Mobile Safari/537.36",
			"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
			"sec-ch-ua": '"Google Chrome";v="93", " Not;A Brand";v="99", "Chromium";v="93"',
			"accept-language": "en-US,en;q=0.9",
			"cookie": 'X-Time-Zone=Africa%2FLagos;nextUrl=https://www.wattpad.com/home;AMP_TOKEN=%24NOT_FOUND;dpr=1;lang=1;isStaff=1;_col_uuid=9a607908-d99f-40b8-985d-002968065c48-1o9tc;_fbp=fb.1.1711420434128.1434537464;_ga=GA1.1.2004197727.1711420434;_ga_FNDTZ0MZDQ=GS1.1.1711420434.1.1.1711420823.0.0.0;_gid=GA1.2.1284160341.1711420435;ff=1;hc=2024-03-26T02%3A36%3A08.663Z;locale=en_US;RT=;sn__time=null;te_session_id=1711420432613;token=469107253%3A2%3A1711420533%3A3iH6c3TJoTExNpqE0jcZdrmFBl9iu5PhxNPs-aDKqeEQaA3ADP8LXnVm8G0F9Cwv;tz=-1;wp_id=7e3b9938-adea-453c-bd87-8fd03b5a5c80'
		};
	}
	search(query) {
		return new Promise(async (resolve, reject) => {
			await axios.request({
				method: "GET",
				url: `https://www.wattpad.com/v4/search/stories/?query=${encodeURIComponent(query)}&limit=10&fields=stories(title%2CvoteCount%2CreadCount%2CcommentCount%2Cdescription%2Ccover%2Curl%2CnumParts%2Cuser(name)%2ClastPublishedPart(createDate)%2Cpromoted%2Csponsor(name%2Cavatar)%2Ctracking(clickUrl%2CimpressionUrl%2CthirdParty(impressionUrls%2CclickUrls))%2Ccontest(endDate%2CctaLabel%2CctaURL))%2Ctotal`,
				headers: this.headers
			}).then(anu => resolve({
				total_result: anu.data.total,
				data: anu.data.stories
			})).catch(reject);
		});
	}
	story(url) {
		return new Promise(async (resolve, reject) => {
			if (!url.match(/^(?:http?s:\/\/)?(?:www\.|)?(wattpad\.com)?(\/)?(?:story\/)?([\d]+\-)/gi)) return reject("invalid url");
			const link = new URL(url);
			await axios.request({
				method: "GET",
				url: link.href,
				headers: this.headers
			}).then(async ({ data }) => {
				const $ = cheerio.load(data);
				const result = new Array();
				const contents = new Array();
				const title = $("html > head > title").text();
				const description = $("pre.description-text").text().trim();
				const keywords = $("meta[name='keywords']").attr("content");
				let thumbnail, author_name, author_url;
				$("div.component-wrapper").get().map(m => {
					thumbnail = $(m).find("div.story-cover > img").attr("src");
					author_name = $(m).find("div.author-info__username > a").text();
					author_url = (this.baseURL + $(m).find("div.author-info__username > a").attr("href"));
				});
				$("div.tool-tip").get().map(m => {
					contents.push($(m).attr("data-tip"));
				});
				$("a.story-parts__part").get().map(m => {
					result.push({
						title: $(m).text(),
						url: (this.baseURL + $(m).attr("href")),
					});
				});
				resolve({
					title,
					keywords,
					thumbnail,
					author_name,
					author_url,
					reading: contents[0],
					vote: contents[1],
					bab: contents[2],
					description,
					result
				});
			}).catch(reject);
		});
	}
	read(url) {
		return new Promise(async (resolve, reject) => {
			const link = new URL(url);
			await axios.request({
				method: "GET",
				url: link.href,
				headers: this.headers
			}).then(async ({ data }) => {
				const $ = cheerio.load(data);
				const aliases = $("script[type='text/javascript']").eq(12).get().map(m => {
					if ((m.children && m.children[0] && m.children[0].data) !== undefined) {
						const parse = m.children[0].data;
						const comment = /"commentCount":(.*?),/g.exec(parse)[1];
						const vote = /"voteCount":(.*?),/g.exec(parse)[1] + " vote";
						const reading = /"readCount":(.*?),/g.exec(parse)[1] + " kali dibaca";
						return { comment, vote, reading };
					} else {
						reject(undefined);
					}
				});
				let reading, vote, comment;
				const story = $("pre").get().map(m => $(m).find("p").text());
				$("div.story-stats").get().map(m => {
					reading = $(m).find("span.reads").attr("title");
					vote = $(m).find("span.votes").attr("title");
					comment = $(m).find("span.comments > a").text().trim();
				});
				const nextPage = $("link[rel=\"next\"]").attr("href");
				const result = {
					title: $("html > head > title").text(),
					thumb: $("span.cover > img").attr("src"),
					author_name: $("span.author").text().split(" ")[1],
					reading: reading ? reading : aliases[0].reading,
					vote: vote ? vote : aliases[0].vote,
					comment: comment ? comment : aliases[0].comment,
					next_page: nextPage ? nextPage : "End Page",
					story: story[0].trim()
				};
				resolve(result);
			}).catch(reject);
		});
	}
}

module.exports = { Wattpad };
