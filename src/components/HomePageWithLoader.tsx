import React, { useState, useEffect } from 'react';
import { DevLinkProvider } from '../site-components/DevLinkProvider';
import { LoadInScreen } from '../site-components/LoadInScreen';
import HomePage from './HomePage';

export default function HomePageWithLoader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate the load-in animation duration
    // Based on the interactions, the total animation is about 3.5 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <DevLinkProvider>
      {isLoading && <LoadInScreen />}
      <HomePage />
    </DevLinkProvider>
  );
}
