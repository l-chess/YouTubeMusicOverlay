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

		function handleMessage(msg: any) {
			if (msg.type === "TRACK_CHANGE") {
				setTrack(msg.data);
			}
		}

		async function init() {
			if (typeof window === "undefined") return;
			try {
				browser = await import("webextension-polyfill");
				browser.runtime.onMessage.addListener(handleMessage);
				browser.runtime
					.sendMessage({ type: "GET_TRACK" })
					.then((response: any) => {
						if (response?.data) setTrack(response.data);
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
