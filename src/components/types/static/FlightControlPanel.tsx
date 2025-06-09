import { useEffect } from 'react';
import { RefreshCcwDot, Rotate3d, ZoomIn } from 'lucide-react';

import Information from '@/components/common/Information';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ConnectionState, useOpenSpaceApiStore, usePropertyStore } from '@/store';
import { getCopy } from '@/utils/copyHelpers';
export const NavigationAnchorKey = 'NavigationHandler.OrbitalNavigator.Anchor';
export const NavigationAimKey = 'NavigationHandler.OrbitalNavigator.Aim';
export const RetargetAnchorKey = 'NavigationHandler.OrbitalNavigator.RetargetAnchor';
export const RetargetAimKey = 'NavigationHandler.OrbitalNavigator.RetargetAim';
export const RotationalFrictionKey =
  'NavigationHandler.OrbitalNavigator.Friction.RotationalFriction';
export const ZoomFrictionKey = 'NavigationHandler.OrbitalNavigator.Friction.ZoomFriction';
export const RollFrictionKey = 'NavigationHandler.OrbitalNavigator.Friction.RollFriction';
type InputState = {
  values: {
    orbitX?: number;
    orbitY?: number;
    panX?: number;
    panY?: number;
    zoomIn?: number;
    localRollX?: number;
  };
};
type InputStatePayload = {
  type: 'inputState';
  inputState: InputState;
};
const FlightControlPanel = () => {
  const connectionState = useOpenSpaceApiStore((state) => state.connectionState);
  const luaApi = useOpenSpaceApiStore((state) => state.luaApi);
  const rotationFriction = usePropertyStore(
    (state) => state.properties[RotationalFrictionKey]?.value || false
  );
  const zoomFriction = usePropertyStore(
    (state) => state.properties[ZoomFrictionKey]?.value || false
  );
  const rollFriction = usePropertyStore(
    (state) => state.properties[RollFrictionKey]?.value || false
  );
  // const camera = usePropertyStore(
  //   (state) => state.properties['camera'] || false,
  // );
  const flightControlTopic = usePropertyStore(
    (state) => state.topicSubscriptions['flightcontroller']?.subscription
  );
  const subscribeToProperty = usePropertyStore((state) => state.subscribeToProperty);
  // const subscribeToTopic = usePropertyStore((state) => state.subscribeToTopic);
  const unsubscribeFromProperty = usePropertyStore(
    (state) => state.unsubscribeFromProperty
  );
  const connectToTopic = usePropertyStore((state) => state.connectToTopic);
  const disconnectFromTopic = usePropertyStore((state) => state.disconnectFromTopic);
  // const dispatch = useDispatch();

  let touchStartX = 0;
  let touchStartY = 0;
  let mouseIsDown = false;
  useEffect(() => {
    if (connectionState != ConnectionState.CONNECTED) return;
    // console.log('Subscribing to flightcontroller');
    connectToTopic('flightcontroller');
    subscribeToProperty(RotationalFrictionKey);
    subscribeToProperty(ZoomFrictionKey);
    subscribeToProperty(RollFrictionKey);
    return () => {
      if (connectionState != ConnectionState.CONNECTED) return;

      disconnectFromTopic('flightcontroller');
      unsubscribeFromProperty(RotationalFrictionKey);
      unsubscribeFromProperty(ZoomFrictionKey);
      unsubscribeFromProperty(RollFrictionKey);
    };
    // subscribeToTopic('camera', 500);
  }, [connectionState]);
  function sendFlightControlInput(payload: InputStatePayload) {
    flightControlTopic && flightControlTopic.talk(payload);
  }
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
      const inputState: InputState = {
        values: {}
      };
      if (event.touches.length === 1) {
        inputState.values.orbitX = -deltaX;
        inputState.values.orbitY = -deltaY;
      } else if (event.touches.length === 2) {
        inputState.values.panX = -deltaX;
        inputState.values.panY = -deltaY;
      } else if (event.touches.length === 3) {
        inputState.values.zoomIn = -deltaY;
        inputState.values.localRollX = -deltaX;
      }
      sendFlightControlInput({
        type: 'inputState',
        inputState
      });
    }
  }
  function touchUp() {
    touchStartX = 0;
    sendFlightControlInput({
      type: 'inputState',
      inputState: {
        values: {
          zoomIn: 0.0,
          orbitX: 0.0,
          orbitY: 0.0,
          panX: 0.0,
          panY: 0.0,
          localRollX: 0.0
        }
      }
    });
  }
  function mouseUp() {
    if (!mouseIsDown) {
      return;
    }
    mouseIsDown = false;
    sendFlightControlInput({
      type: 'inputState',
      inputState: {
        values: {
          zoomIn: 0.0,
          orbitX: 0.0,
          orbitY: 0.0,
          panX: 0.0,
          panY: 0.0,
          localRollX: 0.0
        }
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
    const inputState: InputState = {
      values: {}
    };
    if (event.shiftKey) {
      inputState.values.panX = -deltaX;
      inputState.values.panY = deltaY;
    } else if (event.altKey) {
      inputState.values.zoomIn = deltaY;
      inputState.values.localRollX = -deltaX;
    } else {
      inputState.values.orbitX = -deltaX;
      inputState.values.orbitY = deltaY;
    }
    // console.log('Sending input state', inputState);

    sendFlightControlInput({
      type: 'inputState',
      inputState
    });
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
                <Button
                  size={'icon'}
                  onClick={toggleRotation}
                  variant={rotationFriction ? 'default' : 'outline'}
                  className={`${rotationFriction ? 'opacity-100' : 'opacity-60'}`}
                >
                  <Rotate3d />
                </Button>
              </TooltipTrigger>
            </Tooltip>
            <Tooltip>
              <TooltipContent>
                {getCopy('FlightControlPanel', 'zoom_friction')}
              </TooltipContent>
              <TooltipTrigger asChild>
                <Button
                  size={'icon'}
                  onClick={toggleZoom}
                  variant={zoomFriction ? 'default' : 'outline'}
                  className={`${zoomFriction ? 'opacity-100' : 'opacity-60'}`}
                >
                  <ZoomIn />
                </Button>
              </TooltipTrigger>
            </Tooltip>
            <Tooltip>
              <TooltipContent>
                {getCopy('FlightControlPanel', 'roll_friction')}
              </TooltipContent>
              <TooltipTrigger asChild>
                <Button
                  size={'icon'}
                  onClick={toggleRoll}
                  variant={rollFriction ? 'default' : 'outline'}
                  className={`${rollFriction ? 'opacity-100' : 'opacity-60'}`}
                >
                  <RefreshCcwDot />
                </Button>
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
