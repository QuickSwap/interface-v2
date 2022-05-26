import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import { ReactComponent as SearchIcon } from 'assets/images/SearchIcon.svg';
import { makeStyles } from '@material-ui/core/styles';
import cx from 'classnames';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  searchInput: {
    height: 40,
    border: `1px solid ${palette.secondary.dark}`,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    padding: '0 10px',
    '& input': {
      background: 'transparent',
      border: 'none',
      boxShadow: 'none',
      outline: 'none',
      marginLeft: 8,
      fontSize: 14,
      fontWeight: 500,
      color: palette.text.primary,
      flex: 1,
    },
    [breakpoints.down('xs')]: {
      minWidth: 'unset',
      marginRight: 0,
    },
  },
  focusedSearchInput: {
    border: `1px solid ${palette.primary.main}`,
    '& svg path': {
      fill: `${palette.text.primary} !important`,
    },
  },
}));

interface SearchInputProps {
  placeholder: string;
  value: string;
  setValue: (val: string) => void;
  [index: string]: any;
}

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder,
  value,
  setValue,
  ...props
}) => {
  const classes = useStyles();
  const [searchFocused, setSearchFocused] = useState(false);
  return (
    <Box
      className={cx(
        classes.searchInput,
        searchFocused && classes.focusedSearchInput,
      )}
      {...props}
    >
      <SearchIcon />
      <input
        placeholder={placeholder}
        onFocus={() => setSearchFocused(true)}
        onBlur={() => setSearchFocused(false)}
        value={value}
        onChange={(evt: any) => setValue(evt.target.value)}
      />
    </Box>
  );
};

export default SearchInput;
