import * as cheerio from 'cheerio';

export const scrapeContent = async (url: string, selector: string): Promise<string> => {
	const res = await fetch(url);
	const text = await res.text();
	const $ = cheerio.load(text);

	const paragraphs: string[] = [];
	$(selector).each((i, elem) => {
		const paragraph = $(elem).text();
		paragraph.split('\n').forEach((p) => paragraphs.push(p));
	});

	// ピリオドで終わらず、数単語で構成されているparagraphはただの小タイトルとみなして除外
	return paragraphs.filter((p) => p.endsWith('.') && p.split(' ').length > 5).join('\n');
};
