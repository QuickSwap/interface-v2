import React from 'react';
import { ChainId, Currency, currencyEquals, ETHER, Token } from '@uniswap/sdk';
import { Box } from 'theme/components';
import { GlobalData } from 'constants/index';
import { CurrencyLogo, QuestionHelper } from 'components';
import { useTranslation } from 'react-i18next';

interface CommonBasesProps {
  chainId?: ChainId;
  selectedCurrency?: Currency | null;
  onSelect: (currency: Currency) => void;
}

const CommonBases: React.FC<CommonBasesProps> = ({
  chainId,
  onSelect,
  selectedCurrency,
}) => {
  const { t } = useTranslation();
  return (
    <Box margin='0 0 16px'>
      <Box margin='12px 0' className='flex'>
        <Box margin='0 6px 0 0'>
          <span>{t('commonBase')}</span>
        </Box>
        <QuestionHelper text={t('commonBaseHelper')} />
      </Box>
      <Box className='flex flex-wrap'>
        <Box
          className='baseWrapper'
          onClick={() => {
            if (!selectedCurrency || !currencyEquals(selectedCurrency, ETHER)) {
              onSelect(ETHER);
            }
          }}
        >
          <CurrencyLogo currency={ETHER} size='24px' />
          <small>MATIC</small>
        </Box>
        {(chainId ? GlobalData.bases.SUGGESTED_BASES[chainId] : []).map(
          (token: Token) => {
            const selected = Boolean(
              selectedCurrency && currencyEquals(selectedCurrency, token),
            );
            return (
              <Box
                className='baseWrapper'
                key={token.address}
                onClick={() => {
                  if (!selected) {
                    onSelect(token);
                  }
                }}
              >
                <CurrencyLogo currency={token} size='24px' />
                <small>{token.symbol}</small>
              </Box>
            );
          },
        )}
      </Box>
    </Box>
  );
};

export default CommonBases;
