import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';

import { cn } from '@/lib/utils';

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      'relative h-4 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800',
      className,
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="  h-full w-full flex-1 bg-slate-900 transition-transform ease-linear dark:bg-slate-50"
      style={{
        // transition: 'transform 0.25s ease-linear',

        transform: `translateX(-${100 - (value || 0)}%)`,
        transition: 'transform 0.25s',
      }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
