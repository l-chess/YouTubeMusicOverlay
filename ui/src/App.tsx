import { useEffect, useState } from "react";
import { getDominantColor } from "./getDominantColor";

interface Track {
    title: string;
    artist: string;
    cover: string;
}

export default function App() {
    const [track, setTrack] = useState<Track | null>(null);
    const [bgColor, setBgColor] = useState("black");
    const [textColor, setTextColor] = useState("white");

    // Decide if a color is light or dark
    const isColorLight = (rgb: string) => {
        const match = rgb.match(/\d+/g);
        if (!match) return false;
        const [r, g, b] = match.map(Number);
        // Perceived brightness formula
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 160; // threshold, tweak as needed
    };

    useEffect(() => {
        let browser: typeof import("webextension-polyfill") | null = null;

        async function init() {
            if (typeof window !== "undefined") {
                try {
                    browser = await import("webextension-polyfill");
                    browser.runtime.onMessage.addListener((msg: any) => {
                        if (msg.type === "TRACK_CHANGE") {
                            setTrack(msg.data);
                        }
                    });
                } catch {
                    console.warn("Not running inside a browser extension, ignoring messages.");
                }
            }
        }

        init();

        return () => {
            if (browser) {
                browser.runtime.onMessage.removeListener((msg: any) => {
                    if (msg.type === "TRACK_CHANGE") {
                        setTrack(msg.data);
                    }
                });
            }
        };
    }, []);

    useEffect(() => {
        if (track?.cover) {
            getDominantColor(track.cover).then((color) => {
                setBgColor(color);
                setTextColor(isColorLight(color) ? "black" : "white");
            });
        } else {
            setBgColor("black");
            setTextColor("white");
        }
    }, [track?.cover]);

    return (
        <div
            className="flex flex-col items-center justify-center h-screen transition-colors duration-500"
            style={{ backgroundColor: bgColor, color: textColor }}
        >
            {track?.cover ? (
                <img
                    className="w-72 h-72 rounded-xl mb-5 object-cover shadow-lg"
                    src={track.cover}
                    alt="Album Cover"
                />
            ) : (
                <div className="w-72 h-72 rounded-xl mb-5 object-cover bg-black flex items-center justify-center">
                    No Cover
                </div>
            )}
            <h1 className="text-3xl">{track ? track.title : "Unknown Title"}</h1>
            <h2 className="text-xl opacity-80">{track ? track.artist : "Unknown Artist"}</h2>
        </div>
    );
}
