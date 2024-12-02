import clsx from 'clsx';

interface ComponentContainerProps {
  children: React.ReactNode;
  onClick?: () => void;
  backgroundImage?: string;
  className?: string;
  style?: React.CSSProperties;
}

const ComponentContainer: React.FC<ComponentContainerProps> = ({
  children,
  onClick,
  backgroundImage,
  className,
  style,
}) => {
  return (
    <div
      className={clsx(
        'absolute right-0 top-0 flex h-full w-full cursor-pointer items-center justify-center rounded-md',
        className,
      )}
      style={{
        //cover and center the background image
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundImage: `url(${backgroundImage})`,
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default ComponentContainer;
