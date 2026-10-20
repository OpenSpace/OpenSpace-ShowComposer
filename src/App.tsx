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
      <LuaApiProvider>
        <Router basename={basePath}>
          {/* Inside the providers above, so that the content of the modals gets them too */}
          <ModalsProvider modalProps={{ centered: true }}>
            <Routes>
              <Route index element={<Editor />} />
              <Route path={'/hub'} element={<Hub />} />
            </Routes>
          </ModalsProvider>
        </Router>
      </LuaApiProvider>
    </MantineProvider>
  );
}
