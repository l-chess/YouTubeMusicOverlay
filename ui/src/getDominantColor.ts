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

            const ctx = canvas.getContext("2d")!;
            ctx.drawImage(img, 0, 0, size, size);

            const imageData = ctx.getImageData(0, 0, size, size).data;
            const colorCount = new Map<string, number>();

            const quantize = (value: number) => Math.round(value / 32) * 32;

            for (let i = 0; i < imageData.length; i += 4) {
                const r = quantize(imageData[i]);
                const g = quantize(imageData[i + 1]);
                const b = quantize(imageData[i + 2]);
                const a = imageData[i + 3];

                // Skip transparent pixels
                if (a < 128) continue;

                const key = `${r},${g},${b}`;
                colorCount.set(key, (colorCount.get(key) || 0) + 1);
            }

            let dominant = "0,0,0";
            let max = 0;

            for (const [color, count] of colorCount) {
                if (count > max) {
                    max = count;
                    dominant = color;
                }
            }

            resolve(`rgb(${dominant})`);
        };

        img.onerror = () => resolve("black");
    });
