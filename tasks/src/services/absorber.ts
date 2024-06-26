import { Service } from './service';

export class Absorber extends Service {
	async perform(payload?: never) {
		const rules = await this.db.query.absorbRules.findMany({ where: (record, { eq }) => eq(record.isActive, true) });
		await Promise.all(rules.map((rule) => this.env.KIRIBI.enqueue('RSS_READER', rule.id)));
	}
}
