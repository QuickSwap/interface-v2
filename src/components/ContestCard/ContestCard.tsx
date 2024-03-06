import React, { useState } from 'react';
import { Box, useMediaQuery } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { formatNumber, shortenAddress } from '~/utils';
import { KeyboardArrowDown, KeyboardArrowUp } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import '~/components/styles/ContestCard.scss';
import { ContestLeaderBoard } from '~/models/interfaces/contest';

const ContestCard: React.FC<{
  contestantData: ContestLeaderBoard;
  index: number;
}> = ({ index, contestantData }) => {
  const { t } = useTranslation();
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('sm'));
  const [isExpandCard, setExpandCard] = useState(false);

  return (
    <Box className={`contestCard ${isExpandCard ? 'highlightedCard' : ''}`}>
      <Box
        className='contestCardUp'
        onClick={() => setExpandCard(!isExpandCard)}
      >
        {isMobile ? (
          <>
            <Box width={0.1} textAlign='start'>
              <small>{index + 1}</small>
            </Box>
            <Box width={0.5} textAlign='center'>
              <small>{shortenAddress(contestantData['origin'])}</small>
            </Box>
            <Box width={0.4} textAlign='end' className='text-success'>
              <small>{formatNumber(contestantData['amountUSD'])}</small>
            </Box>
            <Box width={0.05} className='flex justify-end text-primary'>
              {isExpandCard ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </Box>
          </>
        ) : (
          <>
            <Box width={0.1} textAlign='start'>
              <small>{index + 1}</small>
            </Box>

            <Box width={0.4} textAlign='center'>
              <small>{contestantData['origin']}</small>
            </Box>
            <Box width={0.2} textAlign='center'>
              <small>{contestantData['txCount']}</small>
            </Box>

            <Box width={0.3} textAlign='end' className='text-success'>
              <small>{formatNumber(contestantData['amountUSD'])}</small>
            </Box>
          </>
        )}
      </Box>

      {isExpandCard && isMobile && (
        <Box className={`contestCardDetails justify-end`}>
          <Box className='contestCardMobileRow'>
            <small className='text-secondary'>{t('tradesTitleCase')}</small>
            <small>{contestantData['txCount']}</small>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ContestCard;
