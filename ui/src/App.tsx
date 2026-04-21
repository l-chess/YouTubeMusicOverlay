import { useTrackColors } from "./colorFunctions";
import { useTrack } from "./useTrack";
import { useWakeLock } from "./useWakeLock";

export default function App() {
	const track = useTrack();
	const { bgColor, textColor } = useTrackColors(track?.cover);
	useWakeLock();
	console.log(track);

	return (
		<div
			className="flex flex-col items-center justify-center h-screen transition-colors duration-500"
			style={{
				backgroundImage: bgColor.startsWith("linear-gradient")
					? bgColor
					: "none",
				backgroundColor: bgColor.startsWith("linear-gradient")
					? "transparent"
					: bgColor,
				color: textColor,
			}}
		>
			{track?.cover ? (
				<img
					className="w-96 h-96 rounded-xl mb-5 object-cover shadow-lg"
					src={track.cover}
					alt={`${track.title} ${track.artist}`}
				/>
			) : (
				<div className="w-96 h-96 rounded-xl mb-5 bg-gray-950 flex items-center justify-center">
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
