import React from 'react';
import { DevLinkProvider } from '../site-components/DevLinkProvider';
import Block from '../site-components/_Builtin/Block';
import Heading from '../site-components/_Builtin/Heading';
import { baseUrl } from '../lib/base-url';

export default function NotFoundWrapper() {
  const handleGoBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // If no history, go to home
      window.location.href = baseUrl + '/';
    }
  };

  return (
    <DevLinkProvider>
      <Block className="utility-page-wrap" tag="div">
        <Block className="utility-page-content" tag="div">
          <Heading className="text---heading" tag="h2">
            404
          </Heading>
          <Block tag="div">
            Oops! Nothing is here.
          </Block>
          <button
            onClick={handleGoBack}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              font: 'inherit',
              display: 'inline-block',
              marginTop: '20px'
            }}
          >
            <Block className="back-to-home-button" tag="div">
              {'<-- Back to Previous Page'}
            </Block>
          </button>
        </Block>
      </Block>
    </DevLinkProvider>
  );
}
