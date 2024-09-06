import { Moon, Sun } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/components/ThemeProvider';
import { getCopy } from '@/utils/copyHelpers';
export function DarkModeToggle() {
  const { setTheme, theme } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center justify-center">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuCheckboxItem
          checked={theme == 'light'}
          onCheckedChange={() => setTheme('light')}
        >
          {getCopy('DarkModeToggle', 'light')}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={theme == 'dark'}
          onCheckedChange={() => setTheme('dark')}
        >
          {getCopy('DarkModeToggle', 'dark')}
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
