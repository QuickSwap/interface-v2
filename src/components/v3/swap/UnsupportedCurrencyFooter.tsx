import { useState } from 'react';
import { TYPE } from 'theme/index';
import Modal from 'components/Modal';
import { Currency } from '@uniswap/sdk-core';
import { DetailsFooter } from './styled';
import { useActiveWeb3React } from 'hooks';
import { RowBetween } from '../Row';
import { AutoColumn } from '../Column';
import Card from '../Card';
import { ButtonEmpty } from '../Button';
import { CloseIcon } from 'theme/components';

export default function UnsupportedCurrencyFooter({
  show,
  currencies,
}: {
  show: boolean;
  currencies: (Currency | undefined)[];
}) {
  const { chainId } = useActiveWeb3React();
  const [showDetails, setShowDetails] = useState(false);

  const tokens =
    chainId && currencies
      ? currencies.map((currency) => {
          return currency?.wrapped;
        })
      : [];

  return (
    <DetailsFooter show={show}>
      <Modal isOpen={showDetails} onDismiss={() => setShowDetails(false)}>
        <Card padding='2rem'>
          <AutoColumn gap='lg'>
            <RowBetween>
              <TYPE.mediumHeader>{'Unsupported Assets'}</TYPE.mediumHeader>
              <CloseIcon onClick={() => setShowDetails(false)} />
            </RowBetween>
            <AutoColumn gap='lg'>
              <TYPE.body fontWeight={500}>
                {`Some assets are not available through this interface because
                                    they may not work well with the smart
                                    contracts or we are unable to allow trading for legal reasons.`}
              </TYPE.body>
            </AutoColumn>
          </AutoColumn>
        </Card>
      </Modal>
      <ButtonEmpty padding={'0'} onClick={() => setShowDetails(true)}>
        <TYPE.blue>{'Read more about unsupported assets'}</TYPE.blue>
      </ButtonEmpty>
    </DetailsFooter>
  );
}
