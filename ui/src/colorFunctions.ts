import { useEffect, useState } from "react";

export const getDominantColor = (imageUrl: string) =>
	new Promise<string>((resolve) => {
		const img = new Image();
		img.crossOrigin = "Anonymous";
		img.src = imageUrl;
		img.onload = () => {
			const canvas = document.createElement("canvas");
			const size = 50;
			canvas.width = size;
			canvas.height = size;
			const ctx = canvas.getContext("2d");
			if (!ctx) return resolve("black");
			ctx.drawImage(img, 0, 0, size, size);
			const imageData = ctx.getImageData(0, 0, size, size).data;

			const cx = size / 2;
			const cy = size / 2;
			const innerRadius = size / 4;

			let r = 0,
				g = 0,
				b = 0,
				count = 0;

			for (let y = 0; y < size; y++) {
				for (let x = 0; x < size; x++) {
					const dx = x - cx;
					const dy = y - cy;
					if (Math.sqrt(dx * dx + dy * dy) < innerRadius) continue;

					const i = (y * size + x) * 4;
					const a = imageData[i + 3];
					if (a < 128) continue;

					r += imageData[i];
					g += imageData[i + 1];
					b += imageData[i + 2];
					count++;
				}
			}

			if (count === 0) return resolve("black");
			resolve(
				`rgb(${Math.round(r / count)}, ${Math.round(g / count)}, ${Math.round(b / count)})`,
			);
		};
		img.onerror = () => resolve("black");
	});

export const isColorLight = (rgb: string) => {
	const match = rgb.match(/\d+/g);
	if (!match) return false;
	const [r, g, b] = match.map(Number);
	return (r * 299 + g * 587 + b * 114) / 1000 > 160;
};

export const useTrackColors = (cover?: string) => {
	const [bgColor, setBgColor] = useState("black");
	const [textColor, setTextColor] = useState("white");

	useEffect(() => {
		if (cover) {
			getDominantColor(cover).then((color) => {
				setBgColor(color);
				setTextColor(isColorLight(color) ? "black" : "white");
			});
		} else {
			setBgColor("black");
			setTextColor("white");
		}
	}, [cover]);

	return { bgColor, textColor };
};
