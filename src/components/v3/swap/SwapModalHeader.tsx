import React from 'react';
import { Currency, Percent, TradeType } from '@uniswap/sdk-core';
import { Trade as V2Trade } from '@uniswap/v2-sdk';
import { Trade as V3Trade } from 'lib/src/trade';
import { useContext, useState } from 'react';
import { AlertTriangle, ArrowDown } from 'react-feather';
import { Text } from 'rebass';
import { ThemeContext } from 'styled-components/macro';
import { TYPE } from 'theme/index';
import { ButtonPrimary } from '../Button';
import { FiatValue } from '../CurrencyInputPanel/FiatValue';

import { RowBetween, RowFixed } from '../Row';
import {
  SwapModalHeaderArrowWrapper,
  SwapShowAcceptChanges,
  TruncatedText,
} from './styled';
import { AdvancedSwapDetails } from './AdvancedSwapDetails';
import TradePrice from '../swap/TradePrice';
import { useUSDCValue } from 'hooks/v3/useUSDCPrice';
import { isAddress } from 'ethers/lib/utils';
import { shortenAddress } from 'utils';
import CurrencyLogo from 'components/CurrencyLogo';
import { computeFiatValuePriceImpact } from 'utils/v3/computeFiatValuePriceImpact';
import { WrappedCurrency } from 'models/types';
import { StyledFilledBox, StyledLabel } from '../Common/styledElements';
import { Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

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
  const theme = useContext(ThemeContext);

  const [showInverted, setShowInverted] = useState<boolean>(false);

  const fiatValueInput = useUSDCValue(trade.inputAmount);
  const fiatValueOutput = useUSDCValue(trade.outputAmount);

  return (
    <div>
      <StyledFilledBox>
        <Box padding={2} paddingTop={2}>
          <div className={'flex-s-between mb-1'}>
            <span className={'fs-085'}>{t('from')}</span>
            <FiatValue fiatValue={fiatValueInput} />
          </div>

          <div className={'flex-s-between'}>
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
            <RowFixed gap={'0px'}>
              <TruncatedText
                fontSize={16}
                fontWeight={600}
                color={
                  showAcceptChanges &&
                  trade.tradeType === TradeType.EXACT_OUTPUT
                    ? theme.primary1
                    : ''
                }
              >
                {trade.inputAmount.toSignificant(6)}
              </TruncatedText>
            </RowFixed>
          </div>
        </Box>
      </StyledFilledBox>
      <SwapModalHeaderArrowWrapper>
        <ArrowDown size='1rem' color={theme.text2} />
      </SwapModalHeaderArrowWrapper>
      <Box marginTop={1}>
        <StyledFilledBox>
          <Box padding={2}>
            <div className={'flex-s-between fs-08 mb-1'}>
              {t('to')}
              <FiatValue
                fiatValue={fiatValueOutput}
                priceImpact={computeFiatValuePriceImpact(
                  fiatValueInput,
                  fiatValueOutput,
                )}
              />
            </div>

            <div className={'flex-s-between'}>
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
              <RowFixed gap={'0px'}>
                <TruncatedText fontSize={16} fontWeight={600}>
                  {trade.outputAmount.toSignificant(6)}
                </TruncatedText>
              </RowFixed>
            </div>
          </Box>
        </StyledFilledBox>
      </Box>

      <StyledLabel className={'flex-s-between ph-05 mt-1 mb-1'}>
        {t('price')}
        <TradePrice
          price={trade.executionPrice}
          showInverted={showInverted}
          setShowInverted={setShowInverted}
        />
      </StyledLabel>

      <StyledFilledBox>
        <Box padding={1}>
          <AdvancedSwapDetails
            trade={trade}
            allowedSlippage={allowedSlippage}
          />
        </Box>
      </StyledFilledBox>

      {showAcceptChanges ? (
        <SwapShowAcceptChanges justify='flex-start' gap={'0px'}>
          <RowBetween>
            <RowFixed>
              <AlertTriangle
                size={20}
                style={{ marginRight: '8px', minWidth: 24 }}
              />
              <TYPE.main color={'var(--primary)'}>
                {t('priceUpdated')}
              </TYPE.main>
            </RowFixed>
            <ButtonPrimary
              style={{
                padding: '.5rem',
                width: 'fit-content',
                fontSize: '0.825rem',
                borderRadius: '12px',
              }}
              onClick={onAcceptChanges}
            >
              {t('accept')}
            </ButtonPrimary>
          </RowBetween>
        </SwapShowAcceptChanges>
      ) : null}

      <div>
        {trade.tradeType === TradeType.EXACT_INPUT ? (
          <div className={'l mt-1'}>
            {t('outputEstimated1', {
              amount: trade.minimumAmountOut(allowedSlippage).toSignificant(6),
              symbol: trade.outputAmount.currency.symbol,
            })}
          </div>
        ) : (
          <div className={'l mt-1'}>
            {t('inputEstimated', {
              amount: trade.maximumAmountIn(allowedSlippage).toSignificant(6),
              symbol: trade.inputAmount.currency.symbol,
            })}
          </div>
        )}
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
