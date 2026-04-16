import { setColors } from "./colorFunctions";
import { useWakeLock } from "./useWakeLock";
import { useTrack } from "./useTrack";

export default function App() {
  const track = useTrack();
  const { bgColor, textColor } = setColors(track?.cover);
  useWakeLock();

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
        <div className="w-72 h-72 rounded-xl mb-5 bg-black flex items-center justify-center">
          No Cover
        </div>
      )}
      <h1 className="text-3xl">{track ? track.title : "Unknown Title"}</h1>
      <h2 className="text-xl opacity-80">
        {track ? track.artist : "Unknown Artist"}
      </h2>
    </div>
  );
}
