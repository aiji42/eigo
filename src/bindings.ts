import { Calibrator, PlaylistMaker, PhrasesExtractor } from '../tasks/src';

export type Bindings = {
	DB: D1Database;
	Calibrate: Service<Calibrator>;
	Playlist: Service<PlaylistMaker>;
	PhrasesExtractor: Service<PhrasesExtractor>;
	BUCKET: R2Bucket;
};
