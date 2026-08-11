import { Flex } from '@mantine/core';

import { useSettingsStore } from '@/store';

interface Props {
  children: React.ReactNode;
  onClick?: () => void;
  backgroundImage?: string;
  backgroundColor?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}

function ComponentContainer({
  children,
  onClick,
  backgroundImage,
  backgroundColor,
  style,
  disabled = false
}: Props) {
  const isPresentMode = useSettingsStore((state) => state.presentMode);

  // A disabled widget is hidden outright in present mode; in edit mode it dims and stops
  // responding to clicks.
  const disabledStyle: React.CSSProperties = disabled
    ? isPresentMode
      ? { display: 'none' }
      : { opacity: 0.25, pointerEvents: 'none' }
    : {};

  return (
    <Flex
      pos={'absolute'}
      top={0}
      right={0}
      h={'100%'}
      w={'100%'}
      align={'center'}
      justify={'center'}
      onClick={onClick}
      style={{
        cursor: 'pointer',
        borderRadius: 'var(--mantine-radius-md)',
        // cover and center the background image
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundImage: `url(${backgroundImage})`,
        backgroundColor: backgroundColor,
        ...style,
        ...disabledStyle
      }}
    >
      {children}
    </Flex>
  );
}

export { ComponentContainer };
