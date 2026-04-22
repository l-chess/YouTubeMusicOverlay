import { useEffect } from "react";

export function useCursor(idleMs = 2000) {
	useEffect(() => {
		let timeout: ReturnType<typeof setTimeout>;

		const hide = () => {
			document.body.style.cursor = "none";
		};

		const show = () => {
			document.body.style.cursor = "default";
			clearTimeout(timeout);
			timeout = setTimeout(hide, idleMs);
		};

		timeout = setTimeout(hide, idleMs);
		document.addEventListener("mousemove", show);

		return () => {
			clearTimeout(timeout);
			document.removeEventListener("mousemove", show);
			document.body.style.cursor = "default";
		};
	}, [idleMs]);
}