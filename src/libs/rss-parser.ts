import { XMLParser } from 'fast-xml-parser';

export interface RSSChannel {
	title: string;
	link: string;
	description: string;
	language?: string;
	pubDate?: string;
	lastBuildDate?: string;
	docs?: string;
	generator?: string;
	webMaster?: string;
	[key: string]: any; // その他のチャンネル情報
}

export interface RSSItem {
	title: string;
	link: string;
	description?: string;
	author?: string;
	category?: string[];
	pubDate?: string;
	enclosure?: { url: string; type?: string; length?: number };
	[key: string]: any; // その他のアイテム情報
}

export interface RSSFeed {
	channel: RSSChannel;
	items: RSSItem[];
}

export const fetchAndParseRSS = async (url: string): Promise<RSSFeed> => {
	const response = await fetch(url);
	const rssText = await response.text();
	const options = {
		ignoreAttributes: false,
		attributeNamePrefix: '',
		parseNodeValue: true,
		parseAttributeValue: true,
	};
	const parser = new XMLParser(options);
	const jsonObj = parser.parse(rssText);

	const { item: _items, ...channel } = jsonObj.rss.channel;
	const channelInfo: RSSChannel = {
		title: channel.title,
		link: channel.link,
		description: channel.description,
		language: channel.language,
		pubDate: channel.pubDate,
		lastBuildDate: channel.lastBuildDate,
		docs: channel.docs,
		generator: channel.generator,
		webMaster: channel.webMaster,
		...channel, // その他のチャンネル情報を含める
	};

	const items: RSSItem[] = _items.map((item: any) => ({
		title: item.title,
		link: item.link,
		description: item.description,
		author: item.author,
		category: Array.isArray(item.category) ? item.category : [item.category].filter(Boolean),
		pubDate: item.pubDate,
		enclosure: item.enclosure
			? {
					url: item.enclosure.url,
					type: item.enclosure.type,
					length: item.enclosure.length,
				}
			: undefined,
		...item, // その他のアイテム情報を含める
	}));

	return { channel: channelInfo, items };
};
