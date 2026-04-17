import { useEffect, useState } from "react";

export const getDominantGradient = (imageUrl: string) =>
	new Promise<{ primary: string; secondary: string; primaryPercent: number }>(
		(resolve) => {
			const img = new Image();
			img.crossOrigin = "Anonymous";
			img.src = imageUrl;
			img.onload = () => {
				const canvas = document.createElement("canvas");
				const size = 50;
				canvas.width = size;
				canvas.height = size;
				const ctx = canvas.getContext("2d");
				if (!ctx)
					return resolve({
						primary: "black",
						secondary: "black",
						primaryPercent: 100,
					});
				ctx.drawImage(img, 0, 0, size, size);
				const imageData = ctx.getImageData(0, 0, size, size).data;

				const colorCount = new Map<string, number>();
				const quantize = (value: number) => Math.round(value / 32) * 32;

				for (let y = 0; y < size; y++) {
					for (let x = 0; x < size; x++) {
						const i = (y * size + x) * 4;
						const a = imageData[i + 3];
						if (a < 128) continue;

						const r = quantize(imageData[i]);
						const g = quantize(imageData[i + 1]);
						const b = quantize(imageData[i + 2]);
						const key = `${r},${g},${b}`;
						colorCount.set(key, (colorCount.get(key) || 0) + 1);
					}
				}

				const sorted = [...colorCount.entries()].sort((a, b) => b[1] - a[1]);
				const primary = sorted[0] ? `rgb(${sorted[0][0]})` : "black";
				const secondary = sorted[1] ? `rgb(${sorted[1][0]})` : primary;
				const total = (sorted[0]?.[1] ?? 0) + (sorted[1]?.[1] ?? 0);
				const primaryPercent = sorted[0]
					? Math.round((sorted[0][1] / total) * 100)
					: 100;

				resolve({ primary, secondary, primaryPercent });
			};
			img.onerror = () =>
				resolve({ primary: "black", secondary: "black", primaryPercent: 100 });
		},
	);

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
			getDominantGradient(cover).then(
				({ primary, secondary, primaryPercent }) => {
					if (primaryPercent >= 80) {
						setBgColor(primary);
					} else {
						const softenedPercent = Math.round(primaryPercent * 0.7);
						setBgColor(
							`linear-gradient(135deg, ${primary} ${softenedPercent}%, ${secondary})`,
						);
					}
					setTextColor(isColorLight(primary) ? "black" : "white");
				},
			);
		} else {
			setBgColor("black");
			setTextColor("white");
		}
	}, [cover]);

	return { bgColor, textColor };
};
