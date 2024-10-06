import React from 'react';
import { Box } from '@material-ui/core';
import { HelpCircle as Question, PlusCircle } from 'react-feather';
import { CustomTooltip } from 'components';
import infoIcon from 'assets/images/icons/info-icon.svg';
import 'components/styles/QuestionHelper.scss';
import { StringDecoder } from 'string_decoder';

const QuestionHelper: React.FC<{
  text: string;
  size?: number;
  className?: string;
}> = ({ text, size = 16, className }) => {
  return (
    <CustomTooltip title={text}>
      <Box className={`questionWrapper ${className}`}>
        <Question size={size} />
      </Box>
    </CustomTooltip>
  );
};

export default QuestionHelper;

export const PlusHelper: React.FC<{ text: string; color?: string }> = ({
  text,
  color,
}) => {
  return (
    <CustomTooltip title={text}>
      <Box className='questionWrapper' color={color}>
        <PlusCircle size={16} />
      </Box>
    </CustomTooltip>
  );
};

export const LightQuestionHelper: React.FC<{ text: string; color: string }> = ({
  text,
  color,
}) => {
  return (
    <CustomTooltip title={text}>
      <Box className='lightQuestionWrapper' color={color}>
        <span className='questionMark'>?</span>
      </Box>
    </CustomTooltip>
  );
};

export const InfomationHelper: React.FC<{ text: string }> = ({ text }) => {
  return (
    <CustomTooltip title={text}>
      <Box sx={{ marginRight: '4px' }}>
        <img src={infoIcon} alt='info' />
      </Box>
    </CustomTooltip>
  );
};
