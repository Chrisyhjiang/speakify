type AudioPlayerProps = {
  url: string;
};

export default function AudioPlayer({ url }: AudioPlayerProps) {
  return (
    <div className="flex items-center justify-center">
      <audio
        controls
        className="w-64 rounded-full shadow-md bg-gray-100"
        preload="metadata"
      >
        <source src={url} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}
