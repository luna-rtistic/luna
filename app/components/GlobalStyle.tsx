import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  html, body {
    min-height: 100vh;
    margin: 0;
    padding: 0;
    font-family: 'Plus Jakarta Sans', 'sans-serif';
    background: linear-gradient(180deg, #000 0%, #23244d 40%, #a855f7 100%);
    box-sizing: border-box;
  }
  *, *::before, *::after {
    box-sizing: inherit;
  }
`;

export default GlobalStyle; 