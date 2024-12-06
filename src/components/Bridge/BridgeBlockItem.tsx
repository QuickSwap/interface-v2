import React from 'react';
import { Box, ButtonBase, Typography } from '@material-ui/core';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import '../styles/BridgeBlockItem.scss';

interface BridgeBlockItemProps {
  image: string;
  chains: any[];
  isSmallImage?: boolean;
  onClick?: () => void;
}

const BridgeBlockItem: React.FC<BridgeBlockItemProps> = ({
  image,
  chains,
  onClick,
  isSmallImage,
}) => {
  return (
    <Box
      className='bridge_block_item'
      onClick={onClick}
      style={{
        backgroundColor: '#22314d',
        borderRadius: '10px',
        padding: '16px 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        position: 'relative',
        height: '150px',
        cursor: 'pointer',
        transition: '.3s ease-in-out',
      }}
    >
      <img
        src={image}
        alt='image'
        style={{ width: '40%', marginBottom: '20px' }}
      />
      <Box
        style={{ position: 'absolute', left: 0, bottom: '16px', right: 0 }}
        className='flex items-center justify-center'
      >
        {chains.map((item, index) => {
          return (
            <img
              key={index}
              src={item}
              alt='item'
              width={16}
              height={16}
              style={{ marginLeft: '-2px', borderRadius: '8px' }}
            />
          );
        })}
      </Box>
      <ButtonBase
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          color: '#448aff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px',
        }}
      >
        <ArrowForwardIcon style={{ fontSize: '14px' }} />
      </ButtonBase>
    </Box>
  );
};
export default BridgeBlockItem;
