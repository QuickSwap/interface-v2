import React from 'react';
import { Box, Checkbox } from '@material-ui/core';
import { Replay } from '@material-ui/icons';
import { CustomSwitch } from 'components';

interface SwapProFilterProps {
  infoPos: string;
  setInfoPos: (pos: string) => void;
  showChart: boolean;
  setShowChart: (value: boolean) => void;
  showTrades: boolean;
  setShowTrades: (value: boolean) => void;
}

const SwapProFilter: React.FC<SwapProFilterProps> = ({
  infoPos,
  setInfoPos,
  showChart,
  setShowChart,
  showTrades,
  setShowTrades,
}) => {
  const swapPositions = ['left', 'right', 'none'];

  const infoPosItems = swapPositions.map((pos) => {
    return {
      text: pos,
      onClick: () => setInfoPos(pos),
      condition: infoPos === pos,
    };
  });

  return (
    <Box className='swapFilter'>
      <Box className='checkWrapper'>
        <Checkbox
          checked={showChart}
          disabled={!showTrades}
          onChange={(evt) => setShowChart(evt.target.checked)}
        />
        <small>chart</small>
      </Box>
      <Box className='checkWrapper'>
        <Checkbox
          checked={showTrades}
          disabled={!showChart}
          onChange={(evt) => setShowTrades(evt.target.checked)}
        />
        <small>trades</small>
      </Box>
      <Box display='flex' alignItems='center'>
        <small>INFO:</small>
        <Box ml={1}>
          <CustomSwitch width={190} height={30} items={infoPosItems} />
        </Box>
      </Box>
      <Box
        className='replayButton'
        onClick={() => {
          setInfoPos('right');
          setShowChart(true);
          setShowTrades(true);
        }}
      >
        <Replay />
      </Box>
    </Box>
  );
};

export default SwapProFilter;
