import React from 'react';
import { useState } from 'react';
import Tooltip from '../Tooltip';

interface HoverInlineTextProps {
  text?: string;
  maxCharacters?: number;
  margin?: boolean;
  fontSize?: string;
}

const HoverInlineText = ({
  text,
  maxCharacters = 20,
  margin = false,
  fontSize,
}: HoverInlineTextProps) => {
  const [showHover, setShowHover] = useState(false);

  if (!text) {
    return <span />;
  }

  if (text.length > maxCharacters) {
    return (
      <Tooltip text={text} show={showHover}>
        <span
          onMouseEnter={() => setShowHover(true)}
          onMouseLeave={() => setShowHover(false)}
          style={{
            marginLeft: margin ? '4px' : '0',
            fontSize: fontSize ?? 'inherit',
            color: 'white',
          }}
        >
          {' ' + text.slice(0, maxCharacters - 1) + '...'}
        </span>
      </Tooltip>
    );
  }

  return (
    <span
      style={{
        marginLeft: margin ? '4px' : '0',
        fontSize: fontSize ?? 'inherit',
        color: 'white',
      }}
    >
      {text}
    </span>
  );
};
export default HoverInlineText;
