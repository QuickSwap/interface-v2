//@ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { useIsDarkMode } from 'state/user/hooks';
import styled from 'styled-components';

const FrameWrapper = styled.iframe`
  min-height: 500px;
  width: 100%;
  max-width: 420px;
  display: flex;
  justify-content: center;
  border: none;
  border-radius: 11px;
  // box-shadow: 3px 3px 10px 4px rgba(0, 0, 0, 0.05);
  margin: auto;
`;
export default function SwapCrossChain() {
  const darkMode = useIsDarkMode();
  const [reload, setReload] = useState(darkMode);
  const baseUrl = 'https://app.routernitro.com/swap';
  const configuration = {
    isWidget: true,
    widgetId: 75,
    fromChain: '137',
    toChain: '42161',
    fromToken: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
    toToken: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    ctaColor: '#448aff',
    textColor: '#FFFFFF',
    backgroundColor: '#12131a',
    logoURI:
      'https://altcoinsbox.com/wp-content/uploads/2023/04/quickswap-logo.png',
    slippageTolerance: '1',
    display: 'vertical',
    isFromSelLocked: '0',
    isToSelLocked: '0',
  };

  const paramString = new URLSearchParams(configuration).toString();
  const srcWidget = useRef(`${baseUrl}?${paramString}`);
  console.log('srcWidget', srcWidget.current);
  useEffect(() => {
    if (reload !== darkMode) {
      window.location.reload();
      setReload(darkMode);
    }
  }, [darkMode, reload]);
  return (
    <>
      <FrameWrapper src={`${srcWidget.current}`}></FrameWrapper>
    </>
  );
}
