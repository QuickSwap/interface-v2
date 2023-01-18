import React from 'react';
import { Box } from 'theme/components';
import { HelpCircle as Question, PlusCircle } from 'react-feather';
import 'components/styles/QuestionHelper.scss';
import { TooltipOnHover } from 'components/v3/Tooltip';

const QuestionHelper: React.FC<{
  text: string;
  size?: number;
  className?: string;
}> = ({ text, size = 16, className }) => {
  return (
    <TooltipOnHover text={text}>
      <Box className={`questionWrapper ${className}`}>
        <Question size={size} />
      </Box>
    </TooltipOnHover>
  );
};

export default QuestionHelper;

export const PlusHelper: React.FC<{ text: string; color?: string }> = ({
  text,
  color,
}) => {
  return (
    <TooltipOnHover text={text}>
      <Box className='questionWrapper' color={color}>
        <PlusCircle size={16} />
      </Box>
    </TooltipOnHover>
  );
};

export const LightQuestionHelper: React.FC<{ text: string; color: string }> = ({
  text,
  color,
}) => {
  return (
    <TooltipOnHover text={text}>
      <Box className='lightQuestionWrapper' color={color}>
        <span className='questionMark'>?</span>
      </Box>
    </TooltipOnHover>
  );
};
