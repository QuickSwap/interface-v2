import React from 'react';
import { Box } from 'theme/components';
import { ChevronUp, ChevronDown } from 'react-feather';
import 'components/styles/SortColumns.scss';

export interface SortColumn {
  text: string;
  index: string;
  width: string;
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
          <Box margin='0 0 0 3px' className='sortArrows'>
            <Box
              className={
                selectedSort === item.index && !sortDesc
                  ? 'selectedSortArrow'
                  : ''
              }
            >
              <ChevronUp />
            </Box>
            <Box
              margin='-10px 0 0'
              className={
                selectedSort === item.index && sortDesc
                  ? 'selectedSortArrow'
                  : ''
              }
            >
              <ChevronDown />
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default SortColumns;
