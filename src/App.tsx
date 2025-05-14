// App.jsx
// import React from 'react';
import { BrowserRouter as Router, Route,Routes } from 'react-router-dom';

import basePath from './utils/basePath';
import Editor from './Editor';
import { Hub } from './Hub';
function App() {
  return (
    <Router basename={basePath}>
      {/* <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/hub">Hub</Link>
          </li>
        </ul>
      </nav> */}
      <Routes>
        <Route path={"/"} element={<Editor />} />
        <Route path={"/hub"} element={<Hub />} />
      </Routes>
    </Router>
  );
}

export default App;
