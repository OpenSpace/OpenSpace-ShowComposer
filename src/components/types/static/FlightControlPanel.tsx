import Information from '@/components/common/Information';
import {
  ConnectionState,
  useOpenSpaceApiStore,
  usePropertyStore,
} from '@/store';
import { useEffect } from 'react';
export const NavigationAnchorKey = 'NavigationHandler.OrbitalNavigator.Anchor';
export const NavigationAimKey = 'NavigationHandler.OrbitalNavigator.Aim';
export const RetargetAnchorKey =
  'NavigationHandler.OrbitalNavigator.RetargetAnchor';
export const RetargetAimKey = 'NavigationHandler.OrbitalNavigator.RetargetAim';
export const RotationalFrictionKey =
  'NavigationHandler.OrbitalNavigator.Friction.RotationalFriction';
export const ZoomFrictionKey =
  'NavigationHandler.OrbitalNavigator.Friction.ZoomFriction';
export const RollFrictionKey =
  'NavigationHandler.OrbitalNavigator.Friction.RollFriction';

const FlightControlPanel = () => {
  const connectionState = useOpenSpaceApiStore(
    (state) => state.connectionState,
  );
  const luaApi = useOpenSpaceApiStore((state) => state.luaApi);

  const rotationFriction = usePropertyStore(
    (state) => state.properties[RotationalFrictionKey]?.Value || false,
  );

  const zoomFriction = usePropertyStore(
    (state) => state.properties[ZoomFrictionKey]?.Value || false,
  );

  const rollFriction = usePropertyStore(
    (state) => state.properties[RollFrictionKey]?.Value || false,
  );
  const camera = usePropertyStore(
    (state) => state.properties['camera'] || false,
  );
  const flightControlTopic = usePropertyStore(
    (state) => state.topicSubscriptions['flightcontroller']?.subscription,
  );
  const subscribeToProperty = usePropertyStore(
    (state) => state.subscribeToProperty,
  );
  const subscribeToTopic = usePropertyStore((state) => state.subscribeToTopic);
  const unsubscribeFromProperty = usePropertyStore(
    (state) => state.unsubscribeFromProperty,
  );

  const connectToTopic = usePropertyStore((state) => state.connectToTopic);
  const unsubscribeFromTopic = usePropertyStore(
    (state) => state.unsubscribeFromTopic,
  );
  // const dispatch = useDispatch();

  let touchStartX = 0;
  let touchStartY = 0;
  let mouseIsDown = false;

  useEffect(() => {
    if (connectionState != ConnectionState.CONNECTED) return;
    connectToTopic('flightcontroller');
    subscribeToProperty(RotationalFrictionKey);
    subscribeToProperty(ZoomFrictionKey);
    subscribeToProperty(RollFrictionKey);
    subscribeToTopic('camera', 500);
  }, [connectionState]);

  useEffect(() => {
    (async () => {
      const post = await luaApi.globebrowsing.getGflightcoeoPositionForCamera();
      console.log(post);
    })();
  }, [luaApi]);
  useEffect(() => {
    return () => {
      unsubscribeFromTopic('flightcontroller');
      unsubscribeFromProperty(RotationalFrictionKey);
      unsubscribeFromProperty(ZoomFrictionKey);
      unsubscribeFromProperty(RollFrictionKey);
      unsubscribeFromTopic('camera');
    };
  }, []);

  useEffect(() => {
    console.log('CAMERA:', camera);
  }, [camera]);

  function sendFlightControlInput(payload: any) {
    flightControlTopic && flightControlTopic.talk(payload);
  }

  function toggleRotation() {
    // console.log('IS THIS HAPPENING? ');
    luaApi.setPropertyValue(RotationalFrictionKey, !rotationFriction);
  }

  function toggleZoom() {
    luaApi.setPropertyValue(ZoomFrictionKey, !zoomFriction);
  }

  function toggleRoll() {
    luaApi.setPropertyValue(RollFrictionKey, !rollFriction);
  }

  //   function popover() {

  const infoBoxContent = (
    <>
      <p>Interact with the area to control the camera. </p> <br />
      <p>
        <b>Mouse controls:</b>
      </p>
      <p>Click and drag to rotate. Hold</p>
      <ul className="list-inside">
        <li>SHIFT to pan</li>
        <li>CTRL to zoom (y-axis) or roll (x-axis)</li>
      </ul>
      <br />
      <p>
        <b>Touch controls:</b>
      </p>
      <ul className="list-inside">
        <li>1 finger to rotate</li>
        <li>2 fingers to pan</li>
        <li>3 fingers to zoom (y-axis) or roll (x-axis)</li>
      </ul>
    </>
  );

  function touchDown(event: any) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  }

  function mouseDown() {
    mouseIsDown = true;
  }

  function touchMove(event: any) {
    const touchX = event.touches[0].clientX;
    const touchY = event.touches[0].clientY;

    if (touchStartX !== 0) {
      let deltaX = touchX - touchStartX;
      let deltaY = touchY - touchStartY;
      const scaleFactor = 300;
      deltaX /= scaleFactor;
      deltaY /= scaleFactor;

      const inputState = { values: {} };

      if (event.touches.length === 1) {
        //@ts-ignore
        inputState.values.orbitX = -deltaX;
        //@ts-ignore
        inputState.values.orbitY = -deltaY;
      } else if (event.touches.length === 2) {
        //@ts-ignore
        inputState.values.panX = -deltaX;
        //@ts-ignore
        inputState.values.panY = -deltaY;
      } else if (event.touches.length === 3) {
        //@ts-ignore
        inputState.values.zoomIn = -deltaY;
        //@ts-ignore
        inputState.values.localRollX = -deltaX;
      }

      sendFlightControlInput({
        type: 'inputState',
        inputState,
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
          localRollX: 0.0,
        },
      },
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
          localRollX: 0.0,
        },
      },
    });
  }

  function mouseMove(event: any) {
    if (!mouseIsDown) {
      return;
    }

    const deltaX = event.movementX / 20;
    const deltaY = -event.movementY / 20;
    const inputState = { values: {} };

    if (event.shiftKey) {
      //@ts-ignore
      inputState.values.panX = -deltaX;
      //@ts-ignore
      inputState.values.panY = deltaY;
    } else if (event.ctrlKey) {
      //@ts-ignore
      inputState.values.zoomIn = deltaY;
      //@ts-ignore
      inputState.values.localRollX = -deltaX;
    } else {
      //@ts-ignore
      inputState.values.orbitX = -deltaX;
      //@ts-ignore
      inputState.values.orbitY = deltaY;
    }

    sendFlightControlInput({
      type: 'inputState',
      inputState,
    });
  }

  // return (

  //   </Popover>
  // );
  //   }

  //   const rotationButtonColor = rotationFriction ? '#222' : '#888';
  //   const zoomButtonColor = zoomFriction ? '#222' : '#888';
  //   const rollButtonColor = rollFriction ? '#222' : '#888';

  return (
    <div className="z-9 absolute left-0 top-[60px] flex flex-col">
      <div>
        <div className="flex flex-row gap-2">
          <button
            onClick={toggleRotation}
            //   title="Rotation friction"
            style={{
              width: 133,
              background: rotationFriction ? '#222' : '#888',
            }}
            //   disabled={false}
          >
            <span style={{ marginLeft: 5 }}>Rotation</span>
          </button>
          <button
            onClick={toggleZoom}
            //   title="Zoom friction"
            style={{ width: 133, background: zoomFriction ? '#222' : '#888' }}
            //   disabled={false}
          >
            <span style={{ marginLeft: 5 }}>Zoom</span>
          </button>
          <button
            onClick={toggleRoll}
            title="Roll friction"
            style={{ width: 133, background: rollFriction ? '#222' : '#888' }}
            disabled={false}
          >
            <span style={{ marginLeft: 5 }}>Roll</span>
          </button>
          <Information content="Controls to disable friction for different camera movements" />
        </div>
      </div>
      <div className="flex flex-row gap-2">
        <div>Control Area</div>
        <Information content={infoBoxContent} />
      </div>
      <div
        //   className={styles.control_area}
        style={{
          float: 'left',
          height: '400px',
          width: '400px',
          outline: '2px solid gray',
          outlineOffset: '-10px',
          paddingTop: '2px',
          cursor: 'crosshair',
          zIndex: 9999,
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
        id="controlArea"
      />
      <div>
        {Object.keys(camera).map((key) => (
          <div key={key}>
            <b>{key}</b>: {camera[key]}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlightControlPanel;
