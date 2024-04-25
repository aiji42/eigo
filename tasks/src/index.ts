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
	async scheduled(controller: ScheduledController) {
		// every 2 hours
		// テスト環境では /__scheduled?cron=0+*/2+*+*+* にアクセスで疑似起動できる
		if (controller.cron === '0 */2 * * *') await this.enqueue('ABSORBER', '');

		// every day at 00:00 UTC
		// テスト環境では /__scheduled?cron=0+0+*+*+* にアクセスで疑似起動できる
		if (controller.cron === '0 0 * * *') await this.sweep();

		// every 5 minutes
		// テスト環境では /__scheduled?cron=*/5+*+*+*+* にアクセスで疑似起動できる
		if (controller.cron === '*/5 * * * *') await this.recover();
	}
}
