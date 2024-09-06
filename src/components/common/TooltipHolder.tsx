import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

interface TooltipHolderProps {
  children: React.ReactNode;
  content: string;
}

const TooltipHolder: React.FC<TooltipHolderProps> = ({ children, content }) => (
  <Tooltip>
    <TooltipTrigger asChild>{children}</TooltipTrigger>
    <TooltipContent className="bg-white">{content}</TooltipContent>
  </Tooltip>
);

export default TooltipHolder;
