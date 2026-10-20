import ReactDOM from 'react-dom/client';

import './localization/config';

import { App } from './App';

import './index.css';

const rootElement = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
