import { useEffect, useState } from "react";

interface Track {
	title: string;
	artist: string;
	cover: string;
}

export function useTrack() {
	const [track, setTrack] = useState<Track | null>(null);

	useEffect(() => {
		let browser: typeof import("webextension-polyfill") | null = null;

		function handleMessage(msg: unknown) {
			const message = msg as { type: string; data: Track };
			if (message.type === "TRACK_CHANGE") {
				setTrack(message.data);
			}
		}

		async function init() {
			if (typeof window === "undefined") return;
			try {
				browser = await import("webextension-polyfill");
				browser.runtime.onMessage.addListener(handleMessage);
				browser.runtime
					.sendMessage({ type: "GET_TRACK" })
					.then((response: unknown) => {
						const res = response as { data: Track } | null;
						if (res?.data) setTrack(res.data);
					})
					.catch(() => {});
			} catch {
				console.warn(
					"Not running inside a browser extension, ignoring messages.",
				);
			}
		}

		init();

		return () => {
			browser?.runtime.onMessage.removeListener(handleMessage);
		};
	}, []);

	return track;
}
