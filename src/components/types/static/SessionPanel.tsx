import { useCallback, useMemo, useState } from 'react';
import { Button, InputLabel, TextInput } from '@mantine/core';
import { Circle, Pause, Play, Square } from 'lucide-react';

import { useOpenSpaceApi } from '@/api/hooks';
import SelectableDropdown from '@/components/common/SelectableDropdown';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useSubscribeToSessionRecording } from '@/hooks/topicSubscriptions';
import { getCopy } from '@/utils/copyHelpers';

//set up recording state
export const SessionStateIdle = 'idle';
export const SessionStateRecording = 'recording';
export const SessionStatePlaying = 'playing';
export const SessionStatePaused = 'playing-paused';
import { RecordingsFolderKey } from '@/types/types';

//flush out recordingSessionState

const SessionPanel = () => {
  const [useTextFormat, _setUseTextFormat] = useState(false);
  const [filenameRecording, setFilenameRecording] = useState('');
  const [filenamePlayback, setFilenamePlayback] = useState<string>('');
  const [shouldOutputFrames, setShouldOutputFrames] = useState(false);
  const [outputFramerate, _setOutputFramerate] = useState(60);
  const [loopPlayback, setLoopPlayback] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false); // State to track input focus

  //   const [nameIsTaken, setNameIsTaken] = useState(false);
  const sessionRecording = useSubscribeToSessionRecording();
  const fileList = sessionRecording.files || [];
  const recordingState = sessionRecording.state || SessionStateIdle;

  const nameIsTaken = useMemo(() => {
    return fileList.map((v: string) => v.split('.')[0]).includes(filenameRecording);
  }, [fileList, filenameRecording]);

  const luaApi = useOpenSpaceApi();

  const isIdle = useMemo(() => recordingState === SessionStateIdle, [recordingState]);

  function onLoopPlaybackChange(newLoopPlayback: boolean) {
    if (newLoopPlayback) {
      setLoopPlayback(true);
      setShouldOutputFrames(false);
    } else {
      setLoopPlayback(newLoopPlayback);
    }
  }

  function onShouldUpdateFramesChange(newValue: boolean) {
    if (newValue) {
      setLoopPlayback(false);
      setShouldOutputFrames(true);
    } else {
      setShouldOutputFrames(newValue);
    }
  }

  function updateRecordingFilename(evt: React.ChangeEvent<HTMLInputElement>) {
    setFilenameRecording(evt.target.value);
  }

  function startRecording() {
    luaApi?.sessionRecording.startRecording();
  }

  function toggleRecording() {
    if (isIdle) {
      startRecording();
    } else {
      const format = useTextFormat ? 'Ascii' : 'Binary';
      // luaApi?.sessionRecording.stopRecording(filenameRecording, format);
      luaApi?.absPath(`${RecordingsFolderKey}${filenameRecording}`).then((value) => {
        luaApi?.sessionRecording.stopRecording(value, format);
      });
    }
  }

  function startPlayback() {
    if (shouldOutputFrames) {
      luaApi?.absPath(`${RecordingsFolderKey}${filenamePlayback}`).then((value) => {
        luaApi?.sessionRecording.startPlayback(
          value,
          loopPlayback,
          true,
          outputFramerate
        );
      });
    } else {
      luaApi?.absPath(`${RecordingsFolderKey}${filenamePlayback}`).then((value) => {
        luaApi?.sessionRecording.startPlayback(value, loopPlayback);
      });
    }
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
  //   function refreshPlaybackFilesList() {
  //     refreshTopic('sessionRecording', ['state', 'files']);
  //   }
  const fileNameLabel = <span>{getCopy('SessionPanel', 'name_of_recording')}</span>;
  //   const fpsLabel = <span>{getCopy('SessionPanel', 'fps')}</span>;
  const textFormatLabel = <span>{getCopy('SessionPanel', 'text_file_format')}</span>;

  const playbackSwitch = useCallback(() => {
    switch (recordingState) {
      case SessionStateIdle:
        return filenamePlayback ? (
          <Button
            //   size={'sm'}
            //   disabled={(isIdle && nameIsTaken) || !filenameRecording}
            leftSection={<Play size={16} />}
            onClick={() => togglePlayback()}
          >
            {getCopy('SessionPanel', 'play')}
          </Button>
        ) : null;
      case SessionStateRecording:
        return (
          <Button
            //   size={'sm'}
            //   disabled={(isIdle && nameIsTaken) || !filenameRecording}
            leftSection={<Square size={16} />}
            onClick={() => toggleRecording()}
          >
            {getCopy('SessionPanel', 'stop_recording')}
          </Button>
        );
      case SessionStatePlaying:
        return (
          <div className={'grid grid-cols-2 gap-2'}>
            <Button
              //   size={'sm'}
              // disabled={!filenamePlayback}
              leftSection={<Pause size={16} />}
              onClick={togglePlaybackPaused}
            >
              {getCopy('SessionPanel', 'pause')}
            </Button>
            <Button
              //   size={'sm'}
              // disabled={(isIdle && nameIsTaken) || !filenameRecording}
              leftSection={<Square size={16} />}
              onClick={() => togglePlayback()}
            >
              {getCopy('SessionPanel', 'stop')}
            </Button>
          </div>
        );
      case SessionStatePaused:
        return (
          <div className={'grid grid-cols-2 gap-2'}>
            <Button
              //   size={'sm'}
              // disabled={!filenamePlayback}
              leftSection={<Play size={16} />}
              onClick={togglePlaybackPaused}
            >
              {getCopy('SessionPanel', 'resume')}
            </Button>
            <Button
              //   size={'sm'}
              // disabled={(isIdle && nameIsTaken) || !filenameRecording}
              leftSection={<Square size={16} />}
              onClick={() => togglePlayback()}
            >
              {getCopy('SessionPanel', 'stop')}
            </Button>
          </div>
        );
      default:
        return null;
    }
  }, [recordingState, filenameRecording, filenamePlayback]);

  return (
    <div className={'m-2 flex'}>
      <div className={'grid-rows grid gap-3'}>
        <div className={'grid  gap-3'}>
          <InputLabel className={'flex items-center justify-start gap-2'}>
            {getCopy('SessionPanel', 'record_session')}
          </InputLabel>
          <div className={'flex items-center space-x-2'}>
            <Checkbox id={'textformat'} />
            <InputLabel htmlFor={'textformat'}>{textFormatLabel}</InputLabel>
          </div>
          <div className={'grid grid-cols-1 gap-4'}>
            <div className={'grid w-full gap-2'}>
              <InputLabel htmlFor={'guiname'}>{fileNameLabel}</InputLabel>
              <div className={'flex w-full flex-row gap-2'}>
                <TextInput
                  className={'grow'}
                  value={filenameRecording}
                  placeholder={'Enter recording filename...'}
                  onChange={(evt) => updateRecordingFilename(evt)}
                  onFocus={() => setIsInputFocused(true)} // Set focus state to true
                  onBlur={() => setIsInputFocused(false)} // Set focus state to false
                />
                <Button
                  disabled={(isIdle && nameIsTaken) || !filenameRecording}
                  leftSection={<Circle size={12} fill={'red'} color={'red'} />}
                  flex={'0 0 auto'}
                  onClick={() => toggleRecording()}
                >
                  {getCopy('SessionPanel', 'record')}
                </Button>
              </div>
              {nameIsTaken && isInputFocused && (
                <InputLabel className={'text-red-500'}>
                  {getCopy('SessionPanel', 'name_is_already_taken.')}
                </InputLabel>
              )}
            </div>
          </div>
        </div>
        <Separator />

        <div className={'grid  gap-3'}>
          <InputLabel className={'flex items-center justify-start gap-2'}>
            {getCopy('SessionPanel', 'play_session')}
          </InputLabel>
          <div className={'grid gap-2'}>
            <div className={'flex items-center space-x-2'}>
              <Checkbox
                id={'loop'}
                checked={loopPlayback}
                onCheckedChange={(checked: boolean | 'indeterminate') => {
                  if (checked !== 'indeterminate') onLoopPlaybackChange(checked);
                }}
              />
              <InputLabel htmlFor={'loop'}>
                {getCopy('SessionPanel', 'loop_playback')}
              </InputLabel>
            </div>
            <div className={'flex items-center space-x-2'}>
              <Checkbox
                id={'frames'}
                checked={shouldOutputFrames}
                onCheckedChange={(checked: boolean | 'indeterminate') => {
                  if (checked !== 'indeterminate') onShouldUpdateFramesChange(checked);
                }}
              />
              <InputLabel htmlFor={'frames'}>
                {getCopy('SessionPanel', 'output_frames')}
              </InputLabel>
            </div>
          </div>
          <div className={'grid grid-cols-1 gap-2'}>
            <InputLabel htmlFor={'playback'}>
              {getCopy('SessionPanel', 'playback_file')}
            </InputLabel>
            <div className={'flex w-full flex-col gap-2'}>
              {/* <div className="grow"> */}
              <SelectableDropdown
                placeholder={'Select playback file...'}
                options={fileList}
                setSelected={(value: string) => setFilenamePlayback(value)}
                selected={filenamePlayback}
              />
              {playbackSwitch()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionPanel;
