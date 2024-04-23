import { Kiribi } from 'kiribi';
import { Absorber } from './services/absorber';
import { RssReader } from './services/rss-reader';
import { Scraper } from './services/scraper';
import { LogoCreator } from './services/logo-creator';
import { Calibrator } from './services/calibrator';

type Bindings = {
	ABSORBER: Absorber;
	RSS_READER: RssReader;
	SCRAPER: Scraper;
	LOGO_CREATOR: LogoCreator;
	CALIBRATOR: Calibrator;
};

export type Env = {
	CACHE: KVNamespace;
	DB: D1Database;
	BUCKET: R2Bucket;
	KIRIBI: Service<Kiribi<Bindings>>;
	OPEN_AI_API_KEY: string;
	IMAGE_HOST_PREFIX: string;
	VOICE_HOST_PREFIX: string;
	GOOGLE_AUTH: string;
};
