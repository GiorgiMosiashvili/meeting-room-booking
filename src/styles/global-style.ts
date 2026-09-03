"use client";

// გლობალური სტილები, თემის ფერებით. საბაზისო reset რჩება globals.css-ში.
import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  body {
    background: ${({ theme }) => theme.color.bg};
    color: ${({ theme }) => theme.color.text};
    font-family: ${({ theme }) => theme.font.sans};
  }

  a {
    color: ${({ theme }) => theme.color.primary};
  }

  :focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.focus};
    outline-offset: 2px;
  }
`;
