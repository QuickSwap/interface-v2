import React from 'react';
import { Box } from '@material-ui/core';
import { ArrowDropUp, ArrowDropDown } from '@material-ui/icons';
import 'components/styles/SortColumns.scss';

export interface SortColumn {
  text: string;
  index: string;
  width: number;
  justify?: string;
  onClick: () => void;
}

interface SortColumnsProps {
  sortColumns: SortColumn[];
  selectedSort: string;
  sortDesc: boolean;
}

const SortColumns: React.FC<SortColumnsProps> = ({
  sortColumns,
  selectedSort,
  sortDesc,
}) => {
  return (
    <Box className='flex items-center'>
      {sortColumns.map((item) => (
        <Box
          key={item.index}
          width={item.width}
          className='flex items-center cursor-pointer'
          justifyContent={item.justify}
          onClick={item.onClick}
        >
          <small
            className={selectedSort === item.index ? '' : 'text-secondary'}
          >
            {item.text}
          </small>
          <Box className='sortArrows'>
            <Box
              className={
                selectedSort === item.index && !sortDesc
                  ? 'selectedSortArrow'
                  : ''
              }
            >
              <ArrowDropUp />
            </Box>
            <Box
              mt='-15px'
              className={
                selectedSort === item.index && sortDesc
                  ? 'selectedSortArrow'
                  : ''
              }
            >
              <ArrowDropDown />
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default SortColumns;
