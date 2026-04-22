import { useEffect, useState } from "react";

// finds the most common two colours in an image and the percentage by which primary dominates
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

// determines average rgb value across the outer half of the image
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
			getDominantGradient(cover).then(
				({ primary, secondary, primaryPercent }) => {
					const primaryRGB = primary
						.substring(4, primary.length - 1)
						.split(",");
					const secondaryRGB = secondary
						.substring(4, secondary.length - 1)
						.split(",");

					if (
						// if primary and secondary are on the grayscale, primary is set as background
						primaryRGB.every((e) => e === primaryRGB[0]) &&
						secondaryRGB.every((e) => e === secondaryRGB[0])
					) {
						setBgColor(primary);
						setTextColor(isColorLight(primary) ? "black" : "white");
					} else if (
						// if primary doesn't dominate too much and is on grayscale, while secondary isn't, secondary is background
						primaryRGB.every((e) => e === primaryRGB[0]) &&
						!secondaryRGB.every((e) => e === secondaryRGB[0]) &&
						primaryPercent < 70
					) {
						setBgColor(secondary);
						setTextColor(isColorLight(secondary) ? "black" : "white");
					} else if (
						// set primary if primary isn't grayscale, but secondary is
						!primaryRGB.every((e) => e === primaryRGB[0]) &&
						secondaryRGB.every((e) => e === secondaryRGB[0])
					) {
						setBgColor(primary);
						setTextColor(isColorLight(primary) ? "black" : "white");
					} else if (primaryPercent >= 85) {
						getDominantColor(cover).then((color) => {
							setBgColor(color);
							setTextColor(isColorLight(color) ? "black" : "white");
						});
					} else {
						const softenedPercent = Math.round(primaryPercent * 0.7);
						setBgColor(
							`linear-gradient(135deg, ${primary} ${softenedPercent}%, ${secondary})`,
						);
						setTextColor(isColorLight(primary) ? "black" : "white");
					}
				},
			);
		} else {
			setBgColor("black");
			setTextColor("white");
		}
	}, [cover]);

	return { bgColor, textColor };
};
