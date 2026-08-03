import { useEffect, useMemo } from 'react';
import { Stack } from '@mantine/core';

import { useOpenSpaceApi } from '@/api/hooks';
import ComponentContainer from '@/components/ComponentContainer';
import DisplayLabel from '@/components/DisplayLabel';
import { Information } from '@/components/Information';
import { PlaybackControls } from '@/components/PlaybackControls';
import { useSubscribeToSessionRecording } from '@/hooks/topicSubscriptions';
import { useBoundStore } from '@/store/boundStore';
import { SessionPlaybackComponent } from '@/types/components';
import { RecordingState } from '@/types/enums';
import { RecordingsFolderKey } from '@/types/types';

interface Props {
  component: SessionPlaybackComponent;
  shouldRender?: boolean;
}

function SessionPlaybackWidget({ component, shouldRender = true }: Props) {
  const { file, loop, gui_name, gui_description } = component;
  const recordingState = useSubscribeToSessionRecording().state || RecordingState.Idle;
  const luaApi = useOpenSpaceApi();
  const updateComponent = useBoundStore((state) => state.updateComponent);
  const isIdle = useMemo(() => recordingState === RecordingState.Idle, [recordingState]);

  function startPlayback() {
    luaApi?.absPath(`${RecordingsFolderKey}${file}`).then((value) => {
      luaApi?.sessionRecording.startPlayback(value, loop);
    });
  }

  function stopPlayback() {
    luaApi?.sessionRecording.stopPlayback();
  }

  function togglePlayback() {
    if (isIdle) {
      startPlayback();
    } else {
      stopPlayback();
    }
  }

  function togglePlaybackPaused() {
    luaApi?.sessionRecording.togglePlaybackPause();
  }

  useEffect(() => {
    if (luaApi) {
      updateComponent(component.id, {
        triggerAction: () => {
          togglePlayback();
        },
        isDisabled: false
      });
    } else {
      updateComponent(component.id, {
        isDisabled: true
      });
    }
  }, [luaApi, file, loop, isIdle]);

  if (!shouldRender) {
    return null;
  }

  return (
    <ComponentContainer
      backgroundImage={component.backgroundImage}
      backgroundColor={component.color}
    >
      <Stack align={'center'} gap={'xs'}>
        {gui_name || gui_description ? (
          <DisplayLabel>
            {gui_name}
            <Information content={gui_description} />
          </DisplayLabel>
        ) : null}
        <PlaybackControls
          recordingState={recordingState}
          file={file}
          onTogglePlayback={togglePlayback}
          onTogglePlaybackPaused={togglePlaybackPaused}
        />
      </Stack>
    </ComponentContainer>
  );
}

export { SessionPlaybackWidget };
