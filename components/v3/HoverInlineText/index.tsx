import React from 'react';
import { CustomTooltip } from 'components';

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
  if (!text) {
    return <span />;
  }

  if (text.length > maxCharacters) {
    return (
      <CustomTooltip title={text}>
        <span
          style={{
            marginLeft: margin ? '4px' : '0',
            fontSize: fontSize ?? 'inherit',
            color: 'white',
          }}
        >
          {' ' + text.slice(0, maxCharacters - 1) + '...'}
        </span>
      </CustomTooltip>
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
