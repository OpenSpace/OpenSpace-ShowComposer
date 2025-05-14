import {
  ConnectionState,
  useOpenSpaceApiStore,
  usePropertyStore,
} from '@/store';
import { getCopy } from '@/utils/copyHelpers';
import { Label } from '@/components/ui/label';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Circle, Pause, Play, Square } from 'lucide-react';
import SelectableDropdown from '@/components/common/SelectableDropdown';
import { Separator } from '@/components/ui/separator';

//set up recording state
export const SessionStateIdle = 'idle';
export const SessionStateRecording = 'recording';
export const SessionStatePlaying = 'playing';
export const SessionStatePaused = 'playing-paused';

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
  const fileList = usePropertyStore(
    (state) => state.sessionRecording.files || [],
  );
  const recordingState = usePropertyStore(
    (state) => state.sessionRecording.state || SessionStateIdle,
  );

  const nameIsTaken = useMemo(() => {
    return fileList
      .map((v: string) => v.split('.')[0])
      .includes(filenameRecording);
  }, [fileList, filenameRecording]);

  const connectionState = useOpenSpaceApiStore(
    (state) => state.connectionState,
  );

  const luaApi = useOpenSpaceApiStore((state) => state.luaApi);
  const subscribeToTopic = usePropertyStore((state) => state.subscribeToTopic);
  //   const refreshTopic = usePropertyStore(state => state.refreshTopic);
  const unsubscribeFromTopic = usePropertyStore(
    (state) => state.unsubscribeFromTopic,
  );

  useEffect(() => {
    if (connectionState != ConnectionState.CONNECTED) return;
    subscribeToTopic('sessionRecording', 0, ['state', 'files']);
    return () => {
      unsubscribeFromTopic('sessionRecording');
    };
  }, [connectionState]);

  const isIdle = useMemo(
    () => recordingState === SessionStateIdle,
    [recordingState],
  );

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
      luaApi?.sessionRecording.stopRecording(filenameRecording, format);
    }
  }

  function startPlayback() {
    if (shouldOutputFrames) {
      luaApi?.sessionRecording.startPlayback(
        filenamePlayback,
        loopPlayback,
        true,
        outputFramerate,
      );
    } else {
      luaApi?.sessionRecording.startPlayback(filenamePlayback, loopPlayback);
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
  const fileNameLabel = (
    <span>{getCopy('SessionPanel', 'name_of_recording')}</span>
  );
  //   const fpsLabel = <span>{getCopy('SessionPanel', 'fps')}</span>;
  const textFormatLabel = (
    <span>{getCopy('SessionPanel', 'text_file_format')}</span>
  );

  const playbackSwitch = useCallback(() => {
    switch (recordingState) {
      case SessionStateIdle:
        return filenamePlayback ? (
          <Button
            variant="outline"
            //   size={'sm'}
            //   disabled={(isIdle && nameIsTaken) || !filenameRecording}
            className="gap-2"
            onClick={() => togglePlayback()}
          >
            <Play />
            {getCopy('SessionPanel', 'play')}
          </Button>
        ) : null;
      case SessionStateRecording:
        return (
          <Button
            variant="outline"
            //   size={'sm'}
            //   disabled={(isIdle && nameIsTaken) || !filenameRecording}
            className="gap-2"
            onClick={() => toggleRecording()}
          >
            <Square />
            {getCopy('SessionPanel', 'stop_recording')}
          </Button>
        );
      case SessionStatePlaying:
        return (
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              //   size={'sm'}
              // disabled={!filenamePlayback}
              className="gap-2"
              onClick={togglePlaybackPaused}
            >
              <Pause />
              {getCopy('SessionPanel', 'pause')}
            </Button>
            <Button
              variant="outline"
              //   size={'sm'}
              // disabled={(isIdle && nameIsTaken) || !filenameRecording}
              className="gap-2"
              onClick={() => togglePlayback()}
            >
              <Square />
              {getCopy('SessionPanel', 'stop')}
            </Button>
          </div>
        );
      case SessionStatePaused:
        return (
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              //   size={'sm'}
              // disabled={!filenamePlayback}
              className="gap-2"
              onClick={togglePlaybackPaused}
            >
              <Play />
              {getCopy('SessionPanel', 'resume')}
            </Button>
            <Button
              variant="outline"
              //   size={'sm'}
              // disabled={(isIdle && nameIsTaken) || !filenameRecording}
              className="gap-2"
              onClick={() => togglePlayback()}
            >
              <Square />
              {getCopy('SessionPanel', 'stop')}
            </Button>
          </div>
        );
      default:
        return null;
    }
  }, [recordingState, filenameRecording, filenamePlayback]);

  return (
    <div className="m-2 flex">
      <div className="grid-rows grid gap-3">
        <div className="grid  gap-3">
          <Label className="flex items-center justify-start gap-2">
            {getCopy('SessionPanel', 'record_session')}
          </Label>
          <div className="flex items-center space-x-2">
            <Checkbox id="textformat" />
            <Label htmlFor="textformat">{textFormatLabel}</Label>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="grid w-full gap-2">
              <Label htmlFor="guiname">{fileNameLabel}</Label>
              <div className="flex w-full flex-row gap-2">
                <Input
                  className="grow"
                  value={filenameRecording}
                  placeholder="Enter recording filename..."
                  onChange={(evt: React.ChangeEvent<HTMLInputElement>) =>
                    updateRecordingFilename(evt)
                  }
                  onFocus={() => setIsInputFocused(true)} // Set focus state to true
                  onBlur={() => setIsInputFocused(false)} // Set focus state to false
                />
                <Button
                  variant="outline"
                  disabled={(isIdle && nameIsTaken) || !filenameRecording}
                  className="gap-2"
                  onClick={() => toggleRecording()}
                >
                  <Circle size="12" />
                  {getCopy('SessionPanel', 'record')}
                </Button>
              </div>
              {nameIsTaken && isInputFocused && (
                <Label className="text-red-500">
                  {getCopy('SessionPanel', 'name_is_already_taken.')}
                </Label>
              )}
            </div>
          </div>
        </div>
        <Separator />

        <div className="grid  gap-3">
          <Label className="flex items-center justify-start gap-2">
            {getCopy('SessionPanel', 'play_session')}
          </Label>
          <div className="grid gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="loop"
                checked={loopPlayback}
                onCheckedChange={(checked: boolean | 'indeterminate') => {
                  if (checked !== 'indeterminate')
                    onLoopPlaybackChange(checked);
                }}
              />
              <Label htmlFor="loop">
                {getCopy('SessionPanel', 'loop_playback')}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="frames"
                checked={shouldOutputFrames}
                onCheckedChange={(checked: boolean | 'indeterminate') => {
                  if (checked !== 'indeterminate')
                    onShouldUpdateFramesChange(checked);
                }}
              />
              <Label htmlFor="frames">
                {getCopy('SessionPanel', 'output_frames')}
              </Label>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="playback">
              {getCopy('SessionPanel', 'playback_file')}
            </Label>
            <div className="flex w-full flex-col gap-2">
              {/* <div className="grow"> */}
              <SelectableDropdown
                placeholder="Select playback file..."
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
