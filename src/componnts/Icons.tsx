export const PrevIcon = () => {
	return (
		<svg width="24" height="24" fill="none">
			<path
				d="m10 12 8-6v12l-8-6Z"
				fill="currentColor"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path d="M6 6v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
};

export const RewindIcon = () => {
	return (
		<svg width="24" height="24" fill="none">
			<path
				d="M6.492 16.95c2.861 2.733 7.5 2.733 10.362 0 2.861-2.734 2.861-7.166 0-9.9-2.862-2.733-7.501-2.733-10.362 0A7.096 7.096 0 0 0 5.5 8.226"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path d="M5 5v3.111c0 .491.398.889.889.889H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
};

export const SkipIcon = () => {
	return (
		<svg width="24" height="24" fill="none">
			<path
				d="M17.509 16.95c-2.862 2.733-7.501 2.733-10.363 0-2.861-2.734-2.861-7.166 0-9.9 2.862-2.733 7.501-2.733 10.363 0 .38.365.711.759.991 1.176"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M19 5v3.111c0 .491-.398.889-.889.889H15"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
};

export const PlayIcon = () => {
	return (
		<svg width="30" height="32" fill="currentColor" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
			<path d="M 9,5 L 26,16 L 9,27 Z" />
		</svg>
	);
};

export const PauseIcon = () => {
	return (
		<svg width="30" height="32" fill="currentColor">
			<rect x="3" y="4" width="8" height="24" rx="2" />
			<rect x="19" y="4" width="8" height="24" rx="2" />
		</svg>
	);
};

export const NextTrack = () => {
	return (
		<svg width="30" height="32" fill="currentColor" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
			<path d="M 6,5 L 16,16 L 6,27 Z" />
			<path d="M 17,5 L 27,16 L 17,27 Z" />
		</svg>
	);
};

export const LoadingSpinnerIcon = () => {
	return (
		<div className="absolute inset-0 flex items-center justify-center">
			<svg aria-hidden="true" className="size-12 animate-spin fill-slate-300 text-slate-700" viewBox="0 0 100 101" fill="none">
				<path
					d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
					fill="currentColor"
				/>
				<path
					d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
					fill="currentFill"
				/>
			</svg>
		</div>
	);
};

export const LoadingIcon = ({ size = 64 }: { size?: number }) => {
	return (
		<picture className="absolute inset-0 flex items-center justify-center">
			<source srcSet="https://fonts.gstatic.com/s/e/notoemoji/latest/1f30e/512.webp" type="image/webp" />
			<img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f30e/512.gif" alt="🌎" width={size} height={size} />
		</picture>
	);
};

export const ArrowIcon = () => {
	return (
		<svg width="24" height="24" fill="none">
			<path d="M8 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
};
