'use client';
import React from 'react';
import { InteractionsProvider } from './webflow_modules/interactions';
import { createIX2Engine } from './webflow_modules/devlink';
export const DevLinkContext = React.createContext({});
export const DevLinkProvider = ({ children, ...context }) => (React.createElement(DevLinkContext.Provider, { value: context },
    React.createElement(InteractionsProvider, { createEngine: createIX2Engine }, children)));
