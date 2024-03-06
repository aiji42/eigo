import { Config } from 'tailwindcss';
// @ts-ignore
import safeArea from 'tailwindcss-safe-area';

export default {
	content: ['./src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {},
	},
	plugins: [safeArea],
} satisfies Config;
