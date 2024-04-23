import { Kiribi } from 'kiribi';
import { client } from 'kiribi/client';
import { rest } from 'kiribi/rest';
export { RssReader } from './services/rss-reader';
export { Scraper } from './services/scraper';
export { LogoCreator } from './services/logo-creator';
export { Calibrator } from './services/calibrator';
export { Absorber } from './services/absorber';
export { PlaylistMaker } from './services/playlist-maker';
export { PhrasesExtractor } from './services/phrases-extractor';

export default class extends Kiribi {
	client = client;
	rest = rest;
	async scheduled() {
		// テスト環境では /__scheduled?cron=*+*+*+*+* にアクセスで疑似起動できる
		await this.enqueue('ABSORBER', '');
	}
}
