import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Box, Button } from '@material-ui/core';
import { Pair, JSBI, Percent } from '@uniswap/sdk';
import { useActiveWeb3React } from 'hooks';
import { unwrappedToken } from 'utils/wrappedCurrency';
import { useTokenBalance } from 'state/wallet/hooks';
import { useTotalSupply } from 'data/TotalSupply';
import { CurrencyLogo, RemoveLiquidityModal } from 'components';
import { currencyId, formatTokenAmount } from 'utils';
import { useTranslation } from 'react-i18next';
import {
  StyledBox,
  StyledDarkBox,
  StyledLabel,
  StyledNumber,
} from 'components/AddLiquidity/CommonStyledElements';

const PoolPositionCardDetailsV3: React.FC<{ pair: Pair }> = ({ pair }) => {
  const { t } = useTranslation();
  const history = useHistory();

  const { account } = useActiveWeb3React();
  const [openRemoveModal, setOpenRemoveModal] = useState(false);

  const currency0 = unwrappedToken(pair.token0);
  const currency1 = unwrappedToken(pair.token1);

  const userPoolBalance = useTokenBalance(
    account ?? undefined,
    pair.liquidityToken,
  );
  const totalPoolTokens = useTotalSupply(pair.liquidityToken);

  const poolTokenPercentage =
    !!userPoolBalance &&
    !!totalPoolTokens &&
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? new Percent(userPoolBalance.raw, totalPoolTokens.raw)
      : undefined;

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? [
          pair.getLiquidityValue(
            pair.token0,
            totalPoolTokens,
            userPoolBalance,
            false,
          ),
          pair.getLiquidityValue(
            pair.token1,
            totalPoolTokens,
            userPoolBalance,
            false,
          ),
        ]
      : [undefined, undefined];

  return (
    <>
      <Box className='flex flex-col' width='100%'>
        <Box className='flex justify-between' ml={2.5}>
          <StyledLabel fontSize='14px'>{t('Liquidity')}</StyledLabel>
          <Box></Box>
        </Box>
        <Box className='flex justify-between' ml={2.5} mt={1.5}>
          <StyledLabel fontSize='16px' color='#ebecf2'>
            ${formatTokenAmount(userPoolBalance)}
          </StyledLabel>
          <Box className='flex items-end' mr={2.5}>
            <Box
              bgcolor={'#448aff'}
              borderRadius={8}
              width={75}
              py={0.3}
              mr={0.5}
              textAlign='center'
              onClick={() => {
                history.push(
                  `/pools?currency0=${currencyId(
                    currency0,
                  )}&currency1=${currencyId(currency1)}`,
                );
              }}
            >
              <StyledLabel fontSize='14x' color='#ebecf2'>
                {t('add')}
              </StyledLabel>
            </Box>
            <Box
              bgcolor={'#448aff'}
              borderRadius={8}
              width={75}
              py={0.3}
              textAlign='center'
              onClick={() => {
                setOpenRemoveModal(true);
              }}
            >
              <StyledLabel fontSize='14x' color='#ebecf2'>
                {t('remove')}
              </StyledLabel>
            </Box>
          </Box>
        </Box>

        <StyledDarkBox
          className='flex flex-col items-center justify-evenly'
          alignSelf='center'
          justifySelf={'center'}
          height={100}
          width='94%'
          mt={2}
        >
          <Box className='flex justify-between' width='90%'>
            <Box className='flex items-center'>
              <CurrencyLogo currency={currency0} size={'28px'} />

              <StyledLabel fontSize='14px' style={{ marginLeft: 5 }}>
                {t(`${currency0?.symbol}`)}
              </StyledLabel>
            </Box>

            <Box>inputs</Box>
          </Box>
          <Box className='flex justify-between' width='90%'>
            <Box className='flex items-center'>
              <CurrencyLogo currency={currency1} size={'28px'} />
              <StyledLabel fontSize='14px' style={{ marginLeft: 5 }}>
                {t(`${currency1?.symbol}`)}
              </StyledLabel>
            </Box>

            <Box>inputs</Box>
          </Box>
        </StyledDarkBox>

        <Box className='flex justify-between' ml={2.5} mt={2.5}>
          <StyledLabel fontSize='14px'>{t('Unclaimed fee')}</StyledLabel>
          <Box></Box>
        </Box>
        <Box className='flex justify-between' ml={2.5} mt={1.5}>
          <StyledLabel fontSize='16px' color='#ebecf2'>
            ${0}
          </StyledLabel>
          <Box className='flex items-end' mr={2.5}>
            <Box
              bgcolor={'#448aff'}
              borderRadius={8}
              width={75}
              py={0.3}
              mr={0.5}
              textAlign='center'
              onClick={() => {
                history.push(
                  `/pools?currency0=${currencyId(
                    currency0,
                  )}&currency1=${currencyId(currency1)}`,
                );
              }}
            >
              <StyledLabel fontSize='14x' color='#ebecf2'>
                {t('Claim')}
              </StyledLabel>
            </Box>
          </Box>
        </Box>

        <StyledDarkBox
          className='flex flex-col items-center justify-evenly'
          alignSelf='center'
          justifySelf={'center'}
          height={100}
          width='94%'
          mt={2}
        >
          <Box className='flex justify-between' width='90%'>
            <Box className='flex items-center'>
              <CurrencyLogo currency={currency0} size={'28px'} />

              <StyledLabel fontSize='14px' style={{ marginLeft: 5 }}>
                {t(`${currency0?.symbol}`)}
              </StyledLabel>
            </Box>

            <Box>inputs</Box>
          </Box>
          <Box className='flex justify-between' width='90%'>
            <Box className='flex items-center'>
              <CurrencyLogo currency={currency1} size={'28px'} />
              <StyledLabel fontSize='14px' style={{ marginLeft: 5 }}>
                {t(`${currency1?.symbol}`)}
              </StyledLabel>
            </Box>

            <Box>inputs</Box>
          </Box>
        </StyledDarkBox>

        <Box
          className='flex justify-between'
          width='93%'
          alignSelf='center'
          justifySelf={'center'}
          mt={2.5}
        >
          <StyledLabel fontSize='14px'>{t('Selected range')}</StyledLabel>
          <Box>Toggle</Box>
        </Box>

        <Box
          className='flex justify-between'
          width='93%'
          alignSelf='center'
          justifySelf={'center'}
          mt={2.5}
        >
          <StyledDarkBox
            width='48%'
            height={120}
            className='flex flex-col justify-center items-center'
          >
            <StyledLabel color='#696c80'>Min price</StyledLabel>
            <StyledNumber fontSize='18px'>0.58</StyledNumber>
            <StyledLabel color='#696c80'>
              Your position will be 100%
            </StyledLabel>
            <StyledLabel color='#696c80'>
              Composed of MATIC at this price
            </StyledLabel>
          </StyledDarkBox>
          <StyledDarkBox
            width='48%'
            height={120}
            className='flex flex-col justify-center items-center'
          >
            <StyledLabel color='#696c80'>Max price</StyledLabel>
            <StyledNumber fontSize='18px'>0.59</StyledNumber>
            <StyledLabel color='#696c80'>
              Your position will be 100%
            </StyledLabel>
            <StyledLabel color='#696c80'>
              Composed of USDC at this price
            </StyledLabel>
          </StyledDarkBox>
        </Box>

        <Box
          justifySelf={'center'}
          alignSelf='center'
          width='94%'
          mt={2.5}
          mb={2.5}
        >
          <StyledDarkBox
            className='flex flex-col justify-center items-center'
            height={120}
          >
            <StyledLabel color='#696c80'>Max price</StyledLabel>
            <StyledNumber fontSize='18px'>0.59</StyledNumber>
            <StyledLabel color='#696c80'>
              Your position will be 100%
            </StyledLabel>
            <StyledLabel color='#696c80'>
              Composed of USDC at this price
            </StyledLabel>
          </StyledDarkBox>
        </Box>
      </Box>
      {/* <Box className='poolPositionCardDetails'>
        <Box className='cardRow'>
          <small>{t('yourPoolTokens')}:</small>
          <small>{formatTokenAmount(userPoolBalance)}</small>
        </Box>
        <Box className='cardRow'>
          <small>
            {t('pooled')} {currency0.symbol}:
          </small>
          <Box>
            <small>{formatTokenAmount(token0Deposited)}</small>
            <CurrencyLogo size='20px' currency={currency0} />
          </Box>
        </Box>

        <Box className='cardRow'>
          <small>
            {t('pooled')} {currency1.symbol}:
          </small>
          <Box>
            <small>{formatTokenAmount(token1Deposited)}</small>
            <CurrencyLogo size='20px' currency={currency1} />
          </Box>
        </Box>

        <Box className='cardRow'>
          <small>{t('yourPoolShare')}:</small>
          <small>
            {poolTokenPercentage
              ? poolTokenPercentage.toSignificant() + '%'
              : '-'}
          </small>
        </Box>

        <Box className='poolButtonRow'>
          <Button
            variant='outlined'
            onClick={() =>
              history.push(`/analytics/pair/${pair.liquidityToken.address}`)
            }
          >
            <small>{t('viewAnalytics')}</small>
          </Button>
          <Button
            variant='contained'
            onClick={() => {
              history.push(
                `/pools?currency0=${currencyId(
                  currency0,
                )}&currency1=${currencyId(currency1)}`,
              );
            }}
          >
            <small>{t('add')}</small>
          </Button>
          <Button
            variant='contained'
            onClick={() => {
              setOpenRemoveModal(true);
            }}
          >
            <small>{t('remove')}</small>
          </Button>
        </Box>
      </Box> */}
      {openRemoveModal && (
        <RemoveLiquidityModal
          currency0={currency0}
          currency1={currency1}
          open={openRemoveModal}
          onClose={() => setOpenRemoveModal(false)}
        />
      )}
    </>
  );
};

export default PoolPositionCardDetailsV3;
