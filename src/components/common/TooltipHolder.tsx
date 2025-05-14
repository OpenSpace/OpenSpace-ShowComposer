import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

interface TooltipHolderProps {
  children: React.ReactNode;
  content: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

const TooltipHolder: React.FC<TooltipHolderProps> = ({ children, content, side }) => (
  <Tooltip>
    <TooltipTrigger asChild>{children}</TooltipTrigger>
    <TooltipContent className={'bg-white'} side={side}>
      {content}
    </TooltipContent>
  </Tooltip>
);

export default TooltipHolder;
