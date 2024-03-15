import React from 'react';
import { useOrderEntry } from '@orderly.network/hooks';
import { OrderEntity, OrderSide, OrderType } from '@orderly.network/types';
import { Button, Flex, Heading, Select, TextField } from '@radix-ui/themes';
import { FC } from 'react';

export const CreateOrder: FC = () => {
  const { onSubmit } = useOrderEntry('PERP_DOGE_USDC', OrderSide.BUY, false);
  const {
    helper: { calculate, validator },
  } = useOrderEntry('PERP_DOGE_USDC', OrderSide.BUY, false);

  const onFormSubmit: React.FormEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    console.log('[Perps Page] formData', formData);
    const formValue = (Object.fromEntries(formData) as unknown) as OrderEntity;
    console.log('[Perps Page] formValue', formValue);
    const errors = validator(formValue);
    console.log('[Perps Page] errors', errors);
    await onSubmit(formValue);
  };

  return (
    <Flex
      style={{ margin: '1.5rem' }}
      gap='3'
      align='center'
      justify='center'
      direction='column'
    >
      <Heading>Create Order</Heading>

      <form onSubmit={onFormSubmit}>
        <Flex gap='2' align='stretch' justify='center' direction='column'>
          <label>
            Price (USDC):
            <TextField.Root style={{ gridArea: 'input' }}>
              <TextField.Input
                type='number'
                step='0.1'
                min='0'
                name='order_price'
              />
            </TextField.Root>
          </label>

          <label>
            Amount (DOGE):
            <TextField.Root style={{ gridArea: 'input' }}>
              <TextField.Input
                type='number'
                step='0.00001'
                min='0'
                name='order_quantity'
              />
            </TextField.Root>
          </label>

          <label>
            Order Type:
            <Select.Root defaultValue={OrderType.LIMIT} name='order_type'>
              <Select.Trigger style={{ width: '100%' }} />
              <Select.Content>
                <Select.Item value={OrderType.LIMIT}>
                  {OrderType.LIMIT}
                </Select.Item>
                <Select.Item value={OrderType.MARKET}>
                  {OrderType.MARKET}
                </Select.Item>
              </Select.Content>
            </Select.Root>
          </label>

          <label>
            Side:
            <Select.Root defaultValue={OrderSide.BUY} name='side'>
              <Select.Trigger style={{ width: '100%' }} />
              <Select.Content>
                <Select.Item value={OrderSide.BUY}>{OrderSide.BUY}</Select.Item>
                <Select.Item value={OrderSide.SELL}>
                  {OrderSide.SELL}
                </Select.Item>
              </Select.Content>
            </Select.Root>
          </label>

          <input
            type='text'
            name='symbol'
            defaultValue='PERP_DOGE_USDC'
            style={{ display: 'none' }}
          />

          <Button>Submit</Button>
        </Flex>
      </form>
    </Flex>
  );
};
