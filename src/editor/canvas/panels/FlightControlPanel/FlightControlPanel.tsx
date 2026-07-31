import {
  ActionIcon,
  Box,
  Group,
  InputLabel,
  List,
  Stack,
  Text,
  Tooltip
} from '@mantine/core';
import { FlightControllerInputStateCommand } from 'openspace-api-js/types';

import { Information } from '@/components/Information';
import { useProperty } from '@/hooks/properties';
import { useFlightController } from '@/hooks/topicSubscriptions';
import { RefreshCcwDotIcon, Rotate3dIcon, ZoomInIcon } from '@/icons/icons';
import { getCopy } from '@/utils/copyHelpers';

// Sent on pointer/touch release to stop all camera motion.
const IDLE_INPUT_STATE_COMMAND: FlightControllerInputStateCommand = {
  event: 'inputState',
  inputState: {
    zoomIn: 0.0,
    orbitX: 0.0,
    orbitY: 0.0,
    panX: 0.0,
    panY: 0.0,
    localRollX: 0.0
  }
};

function InfoBox() {
  return (
    <>
      <Text>
        {getCopy('FlightControlPanel', 'interact_with_the_area_to_control_the_camera.')}
      </Text>
      <Text mt={'xs'} fw={700}>
        {getCopy('FlightControlPanel', 'mouse_controls:')}
      </Text>
      <Text>{getCopy('FlightControlPanel', 'click_and_drag_to_rotate._hold')}</Text>
      <List withPadding>
        <List.Item>{getCopy('FlightControlPanel', 'shift_to_pan')}</List.Item>
        <List.Item>{getCopy('FlightControlPanel', 'control_info')}</List.Item>
      </List>
      <Text mt={'xs'} fw={700}>
        {getCopy('FlightControlPanel', 'touch_controls:')}
      </Text>
      <List withPadding>
        <List.Item>{getCopy('FlightControlPanel', '1_finger_to_rotate')}</List.Item>
        <List.Item>{getCopy('FlightControlPanel', '2_fingers_to_pan')}</List.Item>
        <List.Item>
          {getCopy('FlightControlPanel', '3_fingers_to_zoom_(y-axis)_or_roll_(x-axis)')}
        </List.Item>
      </List>
    </>
  );
}

export function FlightControlPanel() {
  const [rotationFriction = false, setRotationFriction] = useProperty(
    'BoolProperty',
    'NavigationHandler.OrbitalNavigator.Friction.RotationalFriction'
  );
  const [zoomFriction = false, setZoomFriction] = useProperty(
    'BoolProperty',
    'NavigationHandler.OrbitalNavigator.Friction.ZoomFriction'
  );
  const [rollFriction = false, setRollFriction] = useProperty(
    'BoolProperty',
    'NavigationHandler.OrbitalNavigator.Friction.RollFriction'
  );
  const sendFlightControlInput = useFlightController();

  let touchStartX = 0;
  let touchStartY = 0;
  let mouseIsDown = false;

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
    sendFlightControlInput(input);
  }

  function touchUp() {
    touchStartX = 0;
    sendFlightControlInput(IDLE_INPUT_STATE_COMMAND);
  }

  function mouseUp() {
    if (!mouseIsDown) {
      return;
    }
    mouseIsDown = false;
    sendFlightControlInput(IDLE_INPUT_STATE_COMMAND);
  }

  return (
    <Stack
      id={'flightPanel'}
      pos={'absolute'}
      left={0}
      mt={'xs'}
      w={'100%'}
      align={'center'}
      gap={'md'}
      style={{ zIndex: 9 }}
    >
      <Stack w={'100%'} gap={'xs'} px={'md'}>
        <InputLabel>{getCopy('FlightControlPanel', 'camera_friction')}</InputLabel>
        <Group w={'100%'} justify={'center'} gap={'xs'}>
          <Group gap={'xs'}>
            <Tooltip label={getCopy('FlightControlPanel', 'rotation_friction')}>
              <ActionIcon
                size={'lg'}
                onClick={() => setRotationFriction(!rotationFriction)}
                variant={rotationFriction ? 'filled' : 'default'}
                style={{ opacity: rotationFriction ? 1 : 0.6 }}
              >
                <Rotate3dIcon size={20} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={getCopy('FlightControlPanel', 'zoom_friction')}>
              <ActionIcon
                size={'lg'}
                onClick={() => setZoomFriction(!zoomFriction)}
                variant={zoomFriction ? 'filled' : 'default'}
                style={{ opacity: zoomFriction ? 1 : 0.6 }}
              >
                <ZoomInIcon size={20} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={getCopy('FlightControlPanel', 'roll_friction')}>
              <ActionIcon
                size={'lg'}
                onClick={() => setRollFriction(!rollFriction)}
                variant={rollFriction ? 'filled' : 'default'}
                style={{ opacity: rollFriction ? 1 : 0.6 }}
              >
                <RefreshCcwDotIcon size={20} />
              </ActionIcon>
            </Tooltip>
          </Group>
          <Information
            content={'Controls to disable friction for different camera movements'}
          />
        </Group>
      </Stack>
      <Stack w={'100%'} align={'center'} gap={'xs'} px={'md'}>
        <Group w={'100%'} gap={'xs'}>
          <InputLabel>{getCopy('FlightControlPanel', 'control_area')}</InputLabel>
          <Information content={<InfoBox />} />
        </Group>
        <Box
          id={'controlArea'}
          bg={'dark.9'}
          bd={'2px solid dark.1'}
          style={{
            height: '180px',
            width: '180px',
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
        />
      </Stack>
    </Stack>
  );
}
