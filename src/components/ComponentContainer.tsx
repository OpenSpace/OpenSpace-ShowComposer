import { Flex } from '@mantine/core';

interface Props {
  children: React.ReactNode;
  onClick?: () => void;
  backgroundImage?: string;
  backgroundColor?: string;
  style?: React.CSSProperties;
}

function ComponentContainer({
  children,
  onClick,
  backgroundImage,
  backgroundColor,
  style
}: Props) {
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
        ...style
      }}
    >
      {children}
    </Flex>
  );
}

export { ComponentContainer };
