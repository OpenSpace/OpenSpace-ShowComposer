import React, { useEffect, useState } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VideoComponent } from '@/store';
import { getCopy } from '@/utils/copyHelpers';
const getVideoContent = (url: string) => {
  // const youtubePattern =
  //   /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  // const vimeoPattern =
  //   /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/\d+\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
  const youtubePattern =
    /(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const vimeoPattern =
    /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^/]*\/videos\/|album\/\d+\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
  const youtubeMatch = url.match(youtubePattern);
  const vimeoMatch = url.match(vimeoPattern);
  if (youtubeMatch) {
    return (
      <iframe
        title={"YouTube video player"}
        src={`https://www.youtube.com/embed/${youtubeMatch[1]}`}
        frameBorder={"0"}
        allow={"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"}
        allowFullScreen
        className={"h-full w-full"}
      ></iframe>
    );
  } else if (vimeoMatch) {
    return (
      <iframe
        title={"Vimeo video player"}
        src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
        frameBorder={"0"}
        allow={"autoplay; fullscreen; picture-in-picture"}
        allowFullScreen
        className={"h-full w-full"}
      ></iframe>
    );
  } else if (url) {
    return <video src={url} controls className={"h-full w-full"} />;
  }
  return null;
};
interface VideoGUIProps {
  component: VideoComponent;
}
const VideoGUIComponent: React.FC<VideoGUIProps> = ({ component }) => {
  return (
    <div className={"absolute right-0 top-0 flex h-full w-full items-center justify-center"}>
      {getVideoContent(component.url)}
    </div>
  );
};
interface VideoModalProps {
  component: VideoComponent | null;
  handleComponentData: (data: Partial<VideoComponent>) => void;
}
const VideoModal: React.FC<VideoModalProps> = ({ component, handleComponentData }) => {
  const [url, setUrl] = useState(component?.url || '');
  useEffect(() => {
    handleComponentData({
      url
    });
  }, [url, handleComponentData]);
  return (
    <>
      <div>
        <div className={"grid grid-cols-1 gap-4"}>
          {/* <div className="flex flex-row items-center justify-between"> */}
          <Label>{getCopy('Video', 'video')}</Label>
          <Input
            placeholder={"URL"}
            type={"text"}
            value={url}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
          />
        </div>
        <div className={"mb-4 mt-2 text-sm text-slate-500 dark:text-slate-400"}>
          {getCopy('Video', 'video_helper_text')}
        </div>
        {url && getVideoContent(url)}
      </div>
    </>
  );
};
export { VideoGUIComponent,VideoModal };
