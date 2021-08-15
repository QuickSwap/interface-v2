import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  filterWrapper: {
    backgroundColor: 'white',
    color: palette.text.primary,
    border: `1px solid ${palette.divider}`,
    borderRadius: 8,
    width: 32,
    height: 32,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    '& p': {
      fontSize: 14,
      fontWeight: 500
    }
  }
}));

interface SortButtonProps {
  toggleSortOrder: () => void
  ascending: boolean
}

const SortButton: React.FC<SortButtonProps> = ({
  toggleSortOrder,
  ascending
}) => {
  const classes = useStyles();
  return (
    <Box className={classes.filterWrapper} onClick={toggleSortOrder}>
      <Typography>
        {ascending ? '↑' : '↓'}
      </Typography>
    </Box>
  )
}

export default SortButton;
