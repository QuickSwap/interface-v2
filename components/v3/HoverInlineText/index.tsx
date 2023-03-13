import React from 'react';
import { useState } from 'react';
import Tooltip from '../Tooltip';
import { TextWrapper } from './styled';

interface HoverInlineTextProps {
  text?: string;
  maxCharacters?: number;
  margin?: boolean;
  adjustSize?: boolean;
  fontSize?: string;
  link?: boolean;
}

const HoverInlineText = ({
  text,
  maxCharacters = 20,
  margin = false,
  adjustSize = false,
  fontSize,
  link,
  ...rest
}: HoverInlineTextProps) => {
  const [showHover, setShowHover] = useState(false);

  if (!text) {
    return <span />;
  }

  if (text.length > maxCharacters) {
    return (
      <Tooltip text={text} show={showHover}>
        <TextWrapper
          onMouseEnter={() => setShowHover(true)}
          onMouseLeave={() => setShowHover(false)}
          margin={margin}
          adjustSize={adjustSize}
          link={link}
          fontSize={fontSize}
          {...rest}
        >
          {' ' + text.slice(0, maxCharacters - 1) + '...'}
        </TextWrapper>
      </Tooltip>
    );
  }

  return (
    <TextWrapper
      margin={margin}
      adjustSize={adjustSize}
      link={link}
      fontSize={fontSize}
      {...rest}
    >
      {text}
    </TextWrapper>
  );
};
export default HoverInlineText;
