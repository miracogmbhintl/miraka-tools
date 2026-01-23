import React from 'react';
import { DevLinkProvider } from '../site-components/DevLinkProvider';
import { NotFound } from '../site-components/NotFound';

export default function NotFoundWrapper() {
  return (
    <DevLinkProvider>
      <NotFound />
    </DevLinkProvider>
  );
}
