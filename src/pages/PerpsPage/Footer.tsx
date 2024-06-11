import React, { useState } from 'react';
import './Layout.scss';
import {
  Box,
  MenuItem,
  Select,
  useMediaQuery,
  useTheme,
} from '@material-ui/core';
import CustomTabSwitch from 'components/v3/CustomTabSwitch';
import { PortfolioStatus } from './PortfolioStatus';
import { Check } from '@material-ui/icons';
import FooterOrdersTable from './FooterOrdersTable';
import FooterPositionsTable from './FooterPositionsTable';
import { FooterAssetHistoryTable } from './FooterAssetHistoryTable';
import FooterTPSLTable from './FooterTPSLTable';

export const Footer: React.FC<{
  token: string;
  setToken: (token: string) => void;
}> = ({ token, setToken }) => {
  const [selectedItem, setSelectedItem] = useState('Portfolio');
  const [selectedSide, setSelectedSide] = useState<string>('all');
  const [showAllInstrument, setShowAllInstrument] = useState(true);
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('sm'));

  const footerTabs = [
    {
      id: 'Portfolio',
      text: 'Portfolio',
    },
    {
      id: 'Pending',
      text: 'Pending',
    },
    {
      id: 'tpSL',
      text: 'TP/SL',
    },
    {
      id: 'Filled',
      text: 'Filled',
    },
    {
      id: 'Cancelled',
      text: 'Cancelled',
    },
    {
      id: 'Rejected',
      text: 'Rejected',
    },
    {
      id: 'OrderHistory',
      text: 'Order History',
    },
    {
      id: 'DepositWithdraw',
      text: 'Deposit/Withdraw',
    },
  ];

  return (
    <div>
      <Box
        className='flex items-center flex-wrap justify-between border-bottom'
        gridGap={12}
      >
        <Box flex={1} maxWidth='100%' pl={isMobile ? 2 : 0}>
          <CustomTabSwitch
            items={footerTabs}
            value={selectedItem}
            handleTabChange={setSelectedItem}
            height={45}
          />
        </Box>
        <Box
          className='flex items-center cursor-pointer'
          onClick={() => setShowAllInstrument(!showAllInstrument)}
          gridGap={5}
          p='12px'
        >
          <Box
            className={`checkbox-wrapper ${
              showAllInstrument ? 'checkbox-wrapper-filled' : ''
            }`}
          >
            {showAllInstrument && (
              <Check fontSize='small' className='text-bgColor' />
            )}
          </Box>
          Show All Instruments
        </Box>
      </Box>
      {selectedItem === 'DepositWithdraw' ? (
        <></>
      ) : selectedItem === 'Portfolio' ? (
        <PortfolioStatus token={showAllInstrument ? undefined : token} />
      ) : (
        <Box className='perpsBottomDropdown border-bottom' padding='16px 12px'>
          <Select
            defaultValue='all'
            value={selectedSide}
            onChange={(e) => {
              setSelectedSide(e.target.value as string);
            }}
          >
            <MenuItem value='all' className='perpsBottomDropdownItem'>
              All
            </MenuItem>
            <MenuItem value='buy' className='perpsBottomDropdownItem'>
              Buy
            </MenuItem>
            <MenuItem value='sell' className='perpsBottomDropdownItem'>
              Sell
            </MenuItem>
          </Select>
        </Box>
      )}
      {selectedItem === 'Portfolio' ? (
        <FooterPositionsTable
          token={showAllInstrument ? undefined : token}
          setToken={setToken}
        />
      ) : selectedItem === 'tpSL' ? (
        <FooterTPSLTable
          token={showAllInstrument ? undefined : token}
          selectedSide={selectedSide}
        />
      ) : selectedItem === 'DepositWithdraw' ? (
        <FooterAssetHistoryTable />
      ) : (
        <FooterOrdersTable
          token={showAllInstrument ? undefined : token}
          selectedItem={selectedItem}
          selectedSide={selectedSide}
          setToken={setToken}
        />
      )}
    </div>
  );
};
