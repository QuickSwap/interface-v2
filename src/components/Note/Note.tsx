import { Box, Typography } from '@material-ui/core';
import React from 'react';

interface NoteProps {
  title: string;
  message: string;
}

const Note: React.FC<NoteProps> = ({ title, message }) => {
  return (
    <Box
      style={{
        padding: '16px',
        borderRadius: '12px',
        backgroundColor: '#e18d2f14',
        backdropFilter: 'blur(12px)',
      }}
    >
      <Typography
        style={{ color: '#e18d2f', fontSize: '14px', marginBottom: '4px' }}
      >
        {title}
      </Typography>
      <Typography
        style={{ color: '#e18d2f', fontSize: '12px', lineHeight: '1.33' }}
      >
        {message}
      </Typography>
    </Box>
  );
};
export default Note;
