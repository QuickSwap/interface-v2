import React, { useState } from 'react';
import { ReactComponent as SearchIcon } from 'assets/images/SearchIcon.svg';
import 'components/styles/SearchInput.scss';

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
  const [searchFocused, setSearchFocused] = useState(false);
  return (
    <div className={`searchInput${searchFocused ? ' focusedSearchInput' : ''}`}>
      <SearchIcon />
      <input
        placeholder={placeholder}
        onFocus={() => setSearchFocused(true)}
        onBlur={() => setSearchFocused(false)}
        value={value}
        onChange={(evt: any) => setValue(evt.target.value)}
      />
    </div>
  );
};

export default SearchInput;
