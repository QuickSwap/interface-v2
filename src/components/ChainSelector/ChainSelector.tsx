import { Box, ButtonBase, Typography } from '@material-ui/core';
import CustomModal from 'components/CustomModal';
import { getConfig } from 'config/index';
import { SUPPORTED_CHAINIDS } from 'constants/index';
import React, { useMemo, useState } from 'react';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { Close } from '@material-ui/icons';

interface ChainSelectorProps {
  onSelect: (chain: any) => void;
}

const ChainSelector: React.FC<ChainSelectorProps> = ({ onSelect }) => {
  const supportedChains = SUPPORTED_CHAINIDS.filter((chain: any) => {
    const config = getConfig(chain);
    return config && config.visible;
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedChain, setSelectedChain] = useState(supportedChains[0]);

  const currentChainConfig = useMemo(() => {
    const config = getConfig(selectedChain);
    return config;
  }, [selectedChain]);

  return (
    <>
      <Box
        id='web3-status-connected'
        className='accountDetails'
        onClick={() => {
          setModalVisible(true);
        }}
        style={{ gap: '8px' }}
      >
        <img
          src={currentChainConfig['nativeCurrencyImage']}
          width={24}
          alt='wallet icon'
        />
        <KeyboardArrowDownIcon />
      </Box>
      <CustomModal
        modalWrapper='walletModalWrapper'
        open={modalVisible}
        onClose={() => {
          setModalVisible(false);
        }}
      >
        <Box
          style={{
            padding: '16px',
          }}
        >
          <Box
            style={{
              paddingBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #282d3d',
            }}
          >
            <Typography
              style={{
                fontSize: ' 16px',
                fontWeight: 500,
              }}
            >
              Select Network
            </Typography>
            <ButtonBase onClick={() => setModalVisible(false)}>
              <Close />
              {/* <IoMdClose style={{ color: '#696c80' }} /> */}
            </ButtonBase>
          </Box>
          <Box sx={{ padding: '16px 0' }}>
            {supportedChains.map((item, index) => {
              const config = getConfig(item);
              const isActive = selectedChain === item;
              if (!config.isMainnet) return;
              return (
                <Box
                  onClick={() => {
                    setSelectedChain(item);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    backgroundColor: isActive ? '#282d3d' : 'inherit',
                  }}
                  key={index}
                >
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                    }}
                  >
                    <img
                      src={config['nativeCurrencyImage']}
                      width={24}
                      alt='wallet icon'
                    />
                    <small className='weight-600'>
                      {config['networkName']}
                    </small>
                  </Box>
                  {/* {isActive && <GoDotFill style={{ color: '#0fc679' }} />} */}
                  {isActive && (
                    <Box
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#0fc679',
                      }}
                    />
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      </CustomModal>
    </>
  );
};
export default ChainSelector;
