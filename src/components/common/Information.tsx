import { Info } from 'lucide-react';
import { ReactNode } from 'react';
import {
  TooltipTrigger,
  Tooltip,
  TooltipContent,
} from '@/components/ui/tooltip';

const Information = ({ content }: { content: ReactNode | string }) => {
  return (
    <>
      {content ? (
        <Tooltip>
          <TooltipTrigger>
            <Info size={16} />
          </TooltipTrigger>
          <TooltipContent
            sticky="always"
            className="z-[999999] max-w-[200px] bg-white"
          >
            {content}
          </TooltipContent>
        </Tooltip>
      ) : null}
    </>
  );
};

export default Information;
