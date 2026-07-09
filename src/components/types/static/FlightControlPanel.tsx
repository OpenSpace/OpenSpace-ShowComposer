import { ActionIcon } from '@mantine/core';
import { RefreshCcwDot, Rotate3d, ZoomIn } from 'lucide-react';
import { FlightControllerInputStateCommand } from 'openspace-api-js/types';

import { useOpenSpaceApi } from '@/api/hooks';
import { Information } from '@/components/common/Information';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useProperty } from '@/hooks/properties';
import { useFlightController } from '@/hooks/topicSubscriptions';
import { getCopy } from '@/utils/copyHelpers';
export const NavigationAnchorKey = 'NavigationHandler.OrbitalNavigator.Anchor';
export const NavigationAimKey = 'NavigationHandler.OrbitalNavigator.Aim';
export const RetargetAnchorKey = 'NavigationHandler.OrbitalNavigator.RetargetAnchor';
export const RetargetAimKey = 'NavigationHandler.OrbitalNavigator.RetargetAim';
export const RotationalFrictionKey =
  'NavigationHandler.OrbitalNavigator.Friction.RotationalFriction';
export const ZoomFrictionKey = 'NavigationHandler.OrbitalNavigator.Friction.ZoomFriction';
export const RollFrictionKey = 'NavigationHandler.OrbitalNavigator.Friction.RollFriction';

const FlightControlPanel = () => {
  const luaApi = useOpenSpaceApi();
  const [rotationFriction = false] = useProperty('BoolProperty', RotationalFrictionKey);
  const [zoomFriction = false] = useProperty('BoolProperty', ZoomFrictionKey);
  const [rollFriction = false] = useProperty('BoolProperty', RollFrictionKey);
  const sendFlightControlInput = useFlightController();

  let touchStartX = 0;
  let touchStartY = 0;
  let mouseIsDown = false;
  function toggleRotation() {
    luaApi?.setPropertyValue(RotationalFrictionKey, !rotationFriction);
  }
  function toggleZoom() {
    luaApi?.setPropertyValue(ZoomFrictionKey, !zoomFriction);
  }
  function toggleRoll() {
    luaApi?.setPropertyValue(RollFrictionKey, !rollFriction);
  }
  const infoBoxContent = (
    <>
      <p>
        {getCopy('FlightControlPanel', 'interact_with_the_area_to_control_the_camera.')}
      </p>
      <br />
      <p>
        <b>{getCopy('FlightControlPanel', 'mouse_controls:')}</b>
      </p>
      <p>{getCopy('FlightControlPanel', 'click_and_drag_to_rotate._hold')}</p>
      <ul className={'list-inside'}>
        <li>{getCopy('FlightControlPanel', 'shift_to_pan')}</li>
        <li>{getCopy('FlightControlPanel', 'control_info')}</li>
      </ul>
      <br />
      <p>
        <b>{getCopy('FlightControlPanel', 'touch_controls:')}</b>
      </p>
      <ul className={'list-inside'}>
        <li>{getCopy('FlightControlPanel', '1_finger_to_rotate')}</li>
        <li>{getCopy('FlightControlPanel', '2_fingers_to_pan')}</li>
        <li>
          {getCopy('FlightControlPanel', '3_fingers_to_zoom_(y-axis)_or_roll_(x-axis)')}
        </li>
      </ul>
    </>
  );
  function touchDown(event: React.TouchEvent) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  }
  function mouseDown() {
    mouseIsDown = true;
  }
  function touchMove(event: React.TouchEvent) {
    const touchX = event.touches[0].clientX;
    const touchY = event.touches[0].clientY;
    if (touchStartX !== 0) {
      let deltaX = touchX - touchStartX;
      let deltaY = touchY - touchStartY;
      const scaleFactor = 300;
      deltaX /= scaleFactor;
      deltaY /= scaleFactor;
      const input: FlightControllerInputStateCommand = {
        event: 'inputState',
        inputState: {}
      };
      if (event.touches.length === 1) {
        input.inputState.orbitX = -deltaX;
        input.inputState.orbitY = -deltaY;
      } else if (event.touches.length === 2) {
        input.inputState.panX = -deltaX;
        input.inputState.panY = -deltaY;
      } else if (event.touches.length === 3) {
        input.inputState.zoomIn = -deltaY;
        input.inputState.localRollX = -deltaX;
      }
      sendFlightControlInput(input);
    }
  }
  function touchUp() {
    touchStartX = 0;
    sendFlightControlInput({
      event: 'inputState',
      inputState: {
        zoomIn: 0.0,
        orbitX: 0.0,
        orbitY: 0.0,
        panX: 0.0,
        panY: 0.0,
        localRollX: 0.0
      }
    });
  }
  function mouseUp() {
    if (!mouseIsDown) {
      return;
    }
    mouseIsDown = false;
    sendFlightControlInput({
      event: 'inputState',
      inputState: {
        zoomIn: 0.0,
        orbitX: 0.0,
        orbitY: 0.0,
        panX: 0.0,
        panY: 0.0,
        localRollX: 0.0
      }
    });
  }
  function mouseMove(event: React.MouseEvent) {
    event.preventDefault();
    if (!mouseIsDown) {
      return;
    }
    const deltaX = event.movementX / 20;
    const deltaY = -event.movementY / 20;
    const input: FlightControllerInputStateCommand = {
      event: 'inputState',
      inputState: {}
    };
    if (event.shiftKey) {
      input.inputState.panX = -deltaX;
      input.inputState.panY = deltaY;
    } else if (event.altKey) {
      input.inputState.zoomIn = deltaY;
      input.inputState.localRollX = -deltaX;
    } else {
      input.inputState.orbitX = -deltaX;
      input.inputState.orbitY = deltaY;
    }
    // console.log('Sending input state', inputState);

    sendFlightControlInput(input);
  }
  return (
    <div
      id={'flightPanel'}
      className={
        'z-9 absolute left-0 mt-2 flex w-full flex-col items-center justify-center gap-4'
      }
    >
      <div className={'flex w-full flex-col gap-2 px-4'}>
        {/* <div className="flex w-full flex-row justify-start"></div> */}
        <Label className={'flex w-full justify-start'}>
          {getCopy('FlightControlPanel', 'camera_friction')}
        </Label>
        <div className={'flex w-full flex-row justify-center gap-2'}>
          <div className={'grid grid-cols-3 gap-2'}>
            <Tooltip>
              <TooltipContent>
                {getCopy('FlightControlPanel', 'rotation_friction')}
              </TooltipContent>
              <TooltipTrigger asChild>
                <ActionIcon
                  size={'lg'}
                  onClick={toggleRotation}
                  variant={rotationFriction ? 'filled' : 'default'}
                  className={`${rotationFriction ? 'opacity-100' : 'opacity-60'}`}
                >
                  <Rotate3d />
                </ActionIcon>
              </TooltipTrigger>
            </Tooltip>
            <Tooltip>
              <TooltipContent>
                {getCopy('FlightControlPanel', 'zoom_friction')}
              </TooltipContent>
              <TooltipTrigger asChild>
                <ActionIcon
                  size={'lg'}
                  onClick={toggleZoom}
                  variant={zoomFriction ? 'filled' : 'default'}
                  className={`${zoomFriction ? 'opacity-100' : 'opacity-60'}`}
                >
                  <ZoomIn />
                </ActionIcon>
              </TooltipTrigger>
            </Tooltip>
            <Tooltip>
              <TooltipContent>
                {getCopy('FlightControlPanel', 'roll_friction')}
              </TooltipContent>
              <TooltipTrigger asChild>
                <ActionIcon
                  size={'lg'}
                  onClick={toggleRoll}
                  variant={rollFriction ? 'filled' : 'default'}
                  className={`${rollFriction ? 'opacity-100' : 'opacity-60'}`}
                >
                  <RefreshCcwDot />
                </ActionIcon>
              </TooltipTrigger>
            </Tooltip>
          </div>
          <Information
            content={'Controls to disable friction for different camera movements'}
          />
        </div>
        {/* </div> */}
      </div>
      <div className={'flex w-full flex-col items-center gap-2 px-4'}>
        <div className={'flex w-full flex-row justify-start gap-2'}>
          <Label>{getCopy('FlightControlPanel', 'control_area')}</Label>
          <Information content={infoBoxContent} />
        </div>
        <div
          className={'bg-slate-800/40'}
          style={{
            height: '180px',
            width: '180px',
            outline: '2px solid gray',
            userSelect: 'none',
            cursor: 'crosshair',
            zIndex: 9999
          }}
          onPointerDown={mouseDown}
          onPointerUp={mouseUp}
          onPointerCancel={mouseUp}
          onPointerLeave={mouseUp}
          onLostPointerCapture={mouseUp}
          onPointerMove={mouseMove}
          onTouchStart={touchDown}
          onTouchEnd={touchUp}
          onTouchCancel={touchUp}
          onTouchMove={touchMove}
          id={'controlArea'}
        />
      </div>
    </div>
  );
};
export default FlightControlPanel;
