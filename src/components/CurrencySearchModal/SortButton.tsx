import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  filterWrapper: {
    padding: 8,
    backgroundColor: palette.background.default,
    color: palette.text.primary,
    borderRadius: 8,
    userSelect: 'none',
    '& > *': {
      userSelect: 'none'
    },
    '&:hover': {
      cursor: 'pointer'
    },
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
