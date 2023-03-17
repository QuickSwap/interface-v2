import React from 'react';
import { Box } from '@mui/material';
import { HelpCircle as Question, PlusCircle } from 'react-feather';
import { CustomTooltip } from 'components';
import styles from 'styles/components/QuestionHelper.module.scss';

const QuestionHelper: React.FC<{
  text: string;
  size?: number;
  className?: string;
}> = ({ text, size = 16, className }) => {
  return (
    <CustomTooltip title={text}>
      <Box className={`${styles.questionWrapper} ${className}`}>
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
      <Box className={styles.questionWrapper} color={color}>
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
      <Box className={styles.lightQuestionWrapper} color={color}>
        <span className='questionMark'>?</span>
      </Box>
    </CustomTooltip>
  );
};
