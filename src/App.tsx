import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';

import { cssVariablesResolver, theme } from '@/theme/mantineTheme';

import basePath from './utils/basePath';
import Editor from './Editor';
import { Hub } from './Hub';

function App() {
  return (
    <MantineProvider
      theme={theme}
      defaultColorScheme={'dark'}
      cssVariablesResolver={cssVariablesResolver}
    >
      <Router basename={basePath}>
        <Routes>
          <Route path={'/'} element={<Editor />} />
          <Route path={'/hub'} element={<Hub />} />
        </Routes>
      </Router>
    </MantineProvider>
  );
}

export default App;
