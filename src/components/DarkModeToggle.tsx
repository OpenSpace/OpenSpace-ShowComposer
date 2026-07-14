import { CheckIcon, Menu } from '@mantine/core';
import { Moon, Sun } from 'lucide-react';

import { useTheme } from '@/theme/ThemeProvider';
import { getCopy } from '@/utils/copyHelpers';
export function DarkModeToggle() {
  const { setTheme, theme } = useTheme();
  return (
    <Menu position={'bottom-end'}>
      <Menu.Target>
        <div className={'flex items-center justify-center'}>
          <Sun
            className={
              'h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0'
            }
          />
          <Moon
            className={
              'absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100'
            }
          />
        </div>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          leftSection={
            theme === 'light' ? <CheckIcon size={12} /> : <span style={{ width: 12 }} />
          }
          onClick={() => setTheme('light')}
        >
          {getCopy('DarkModeToggle', 'light')}
        </Menu.Item>
        <Menu.Item
          leftSection={
            theme === 'dark' ? <CheckIcon size={12} /> : <span style={{ width: 12 }} />
          }
          onClick={() => setTheme('dark')}
        >
          {getCopy('DarkModeToggle', 'dark')}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
