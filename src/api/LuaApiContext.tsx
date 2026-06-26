import { createContext } from 'react';
import { OpenSpaceLibrary } from 'openspace-api-js/types';

// Mirrors OpenSpace-WebGui's api/LuaApiContext. Holds the Lua API library (or undefined
// while disconnected) from the Zustand apiStore; components read it with useOpenSpaceApi().
export const LuaApiContext = createContext<OpenSpaceLibrary | undefined>(undefined);
