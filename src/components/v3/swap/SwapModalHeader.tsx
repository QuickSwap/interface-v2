import React from 'react';
import { Currency, Percent, TradeType } from '@uniswap/sdk-core';
import { Trade as V2Trade } from '@uniswap/v2-sdk';
import { Trade as V3Trade } from 'lib/src/trade';
import { useState } from 'react';
import { AlertTriangle, ArrowDown } from 'react-feather';
import { Text } from 'rebass';
import { FiatValue } from '../CurrencyInputPanel/FiatValue';

import { AdvancedSwapDetails } from './AdvancedSwapDetails';
import TradePrice from '../swap/TradePrice';
import { useUSDCValue } from 'hooks/v3/useUSDCPrice';
import { isAddress } from 'ethers/lib/utils';
import { shortenAddress } from 'utils';
import CurrencyLogo from 'components/CurrencyLogo';
import { computeFiatValuePriceImpact } from 'utils/v3/computeFiatValuePriceImpact';
import { WrappedCurrency } from 'models/types';
import { Box, Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import 'components/styles/v3/swap.scss';

interface SwapModalHeaderProps {
  trade:
    | V2Trade<Currency, Currency, TradeType>
    | V3Trade<Currency, Currency, TradeType>;
  allowedSlippage: Percent;
  recipient: string | null;
  showAcceptChanges: boolean;
  onAcceptChanges: () => void;
}

export default function SwapModalHeader({
  trade,
  allowedSlippage,
  recipient,
  showAcceptChanges,
  onAcceptChanges,
}: SwapModalHeaderProps) {
  const { t } = useTranslation();

  const [showInverted, setShowInverted] = useState<boolean>(false);

  const fiatValueInput = useUSDCValue(trade.inputAmount);
  const fiatValueOutput = useUSDCValue(trade.outputAmount);

  return (
    <div>
      <Box
        className='bg-secondary1'
        borderRadius='6px'
        padding={2}
        paddingTop={2}
      >
        <Box className='flex justify-between'>
          <span className={'fs-085'}>{t('from')}</span>
          <FiatValue fiatValue={fiatValueInput} />
        </Box>

        <Box mt={1} className={'flex-s-between'}>
          <div className={'f f-ac'}>
            <span className={'mr-05'}>
              <CurrencyLogo
                currency={trade.inputAmount.currency as WrappedCurrency}
                size={'1.5rem'}
              />
            </span>
            <Text fontSize={16} fontWeight={600}>
              {trade.inputAmount.currency.symbol}
            </Text>
          </div>
          <p
            className={`truncatedText weight-600 ${
              showAcceptChanges && trade.tradeType === TradeType.EXACT_OUTPUT
                ? 'text-primary'
                : ''
            }`}
          >
            {trade.inputAmount.toSignificant(6)}
          </p>
        </Box>
      </Box>
      <Box className='swapModalHeaderArrowWrapper'>
        <ArrowDown size='1rem' />
      </Box>
      <Box className='bg-secondary1' borderRadius='6px' marginTop={1}>
        <Box padding={2}>
          <div className={'flex-s-between fs-08'}>
            {t('to')}
            <FiatValue
              fiatValue={fiatValueOutput}
              priceImpact={computeFiatValuePriceImpact(
                fiatValueInput,
                fiatValueOutput,
              )}
            />
          </div>

          <Box mt={1} className={'flex-s-between'}>
            <div className={'f f-ac'}>
              <span className={'mr-05'}>
                <CurrencyLogo
                  currency={trade.outputAmount.currency as WrappedCurrency}
                  size={'1.5rem'}
                />
              </span>
              <Text fontSize={16} fontWeight={600}>
                {trade.outputAmount.currency.symbol}
              </Text>
            </div>
            <p className='truncatedText weight-600'>
              {trade.outputAmount.toSignificant(6)}
            </p>
          </Box>
        </Box>
      </Box>

      <Box my={2} px={1} className='flex justify-between'>
        <small>{t('price')}</small>
        <TradePrice
          price={trade.executionPrice}
          showInverted={showInverted}
          setShowInverted={setShowInverted}
        />
      </Box>

      <Box className='bg-secondary1' borderRadius='6px' padding={1} mb={2}>
        <AdvancedSwapDetails trade={trade} allowedSlippage={allowedSlippage} />
      </Box>

      {showAcceptChanges ? (
        <Box
          mb={2}
          p={1}
          borderRadius='6px'
          className='flex items-center bg-primaryLight justify-between'
        >
          <Box className='flex text-primary'>
            <AlertTriangle
              size={20}
              style={{ marginRight: '8px', minWidth: 24 }}
            />
            <small>{t('priceUpdated')}</small>
          </Box>
          <Button
            style={{
              padding: '.5rem',
              width: 'fit-content',
              fontSize: '0.825rem',
              borderRadius: '12px',
            }}
            onClick={onAcceptChanges}
          >
            {t('accept')}
          </Button>
        </Box>
      ) : null}

      <div>
        {trade.tradeType === TradeType.EXACT_INPUT
          ? t('outputEstimated1', {
              amount: trade.minimumAmountOut(allowedSlippage).toSignificant(6),
              symbol: trade.outputAmount.currency.symbol,
            })
          : t('inputEstimated', {
              amount: trade.maximumAmountIn(allowedSlippage).toSignificant(6),
              symbol: trade.inputAmount.currency.symbol,
            })}
      </div>
      {recipient !== null ? (
        <div className={'c-p'}>
          {t('outputSentTo')}
          <b title={recipient}>
            {isAddress(recipient) ? shortenAddress(recipient) : recipient}
          </b>
        </div>
      ) : null}
    </div>
  );
}
