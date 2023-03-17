import React, { useState } from 'react';
import { Box } from '@mui/material';
import { Search } from '@mui/icons-material';
import 'components/styles/SearchInput.scss';

interface SearchInputProps {
  placeholder: string;
  value: string;
  setValue: (val: string) => void;
  isIconAfter?: boolean;
  [index: string]: any;
}

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder,
  value,
  setValue,
  isIconAfter,
}) => {
  const [searchFocused, setSearchFocused] = useState(false);
  return (
    <Box className={`searchInput${searchFocused ? ' focusedSearchInput' : ''}`}>
      {!isIconAfter && <Search />}
      <Box flex={1} margin={isIconAfter ? '0 8px 0 0' : '0 0 0 8px'}>
        <input
          placeholder={placeholder}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          value={value}
          onChange={(evt: any) => setValue(evt.target.value)}
        />
      </Box>
      {isIconAfter && <Search />}
    </Box>
  );
};

export default SearchInput;
