import { Flex, Progress } from '@mantine/core';

interface Props {
  progress: number; // Float value between 0 and 1
}

export function StatusBarControlled({ progress }: Props) {
  return (
    <Flex
      pos={'absolute'}
      top={0}
      left={0}
      h={'100%'}
      w={'100%'}
      direction={'column'}
      justify={'flex-end'}
      p={'md'}
      style={{ borderRadius: 'var(--mantine-radius-lg)' }}
    >
      <Progress
        value={(Math.round(progress * 1000) / 1000) * 100}
        size={'xl'}
        radius={'xl'}
        transitionDuration={150}
        styles={{
          root: { backgroundColor: 'rgba(0, 0, 0, 0.4)' },
          section: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            transitionTimingFunction: 'linear'
          }
        }}
      />
    </Flex>
  );
}
