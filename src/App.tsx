import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';

import { Editor } from '@/pages/Editor';
import { Hub } from '@/pages/Hub';
import { cssVariablesResolver, theme } from '@/theme/mantineTheme';

import { LuaApiProvider } from './api/LuaApiProvider';
import { basePath } from './utils/basePath';

export function App() {
  return (
    <MantineProvider
      theme={theme}
      defaultColorScheme={'dark'}
      cssVariablesResolver={cssVariablesResolver}
    >
      <ModalsProvider>
        <LuaApiProvider>
          <Router basename={basePath}>
            <Routes>
              <Route index element={<Editor />} />
              <Route path={'/hub'} element={<Hub />} />
            </Routes>
          </Router>
        </LuaApiProvider>
      </ModalsProvider>
    </MantineProvider>
  );
}
