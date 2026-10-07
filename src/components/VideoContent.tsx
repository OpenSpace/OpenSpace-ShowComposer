const YOUTUBE_PATTERN =
  /(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
const VIMEO_PATTERN =
  /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^/]*\/videos\/|album\/\d+\/video\/|video\/|)(\d+)(?:$|\/|\?)/;

interface Props {
  url: string;
}

// Renders a YouTube/Vimeo embed for a matching URL, a raw <video> for any other
// non-empty URL, or nothing when the URL is empty
function VideoContent({ url }: Props) {
  const youtubeMatch = url.match(YOUTUBE_PATTERN);
  const vimeoMatch = url.match(VIMEO_PATTERN);

  if (youtubeMatch) {
    return (
      <iframe
        title={'YouTube video player'}
        src={`https://www.youtube.com/embed/${youtubeMatch[1]}`}
        frameBorder={'0'}
        allow={
          'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
        }
        allowFullScreen
        style={{ height: '100%', width: '100%' }}
      ></iframe>
    );
  } else if (vimeoMatch) {
    return (
      <iframe
        title={'Vimeo video player'}
        src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
        frameBorder={'0'}
        allow={'autoplay; fullscreen; picture-in-picture'}
        allowFullScreen
        style={{ height: '100%', width: '100%' }}
      ></iframe>
    );
  } else if (url) {
    return <video src={url} controls style={{ height: '100%', width: '100%' }} />;
  }

  return null;
}

export { VideoContent };
