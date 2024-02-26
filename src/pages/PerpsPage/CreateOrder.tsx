import React from 'react';
import { useOrderEntry } from '@orderly.network/hooks';
import { OrderEntity, OrderSide, OrderType } from '@orderly.network/types';
import { Button, Flex, Heading, Select, TextField } from '@radix-ui/themes';
import { FC } from 'react';

export const CreateOrder: FC = () => {
  const { onSubmit } = useOrderEntry('PERP_ETH_USDC', OrderSide.BUY, false);
  const {
    helper: { calculate },
  } = useOrderEntry('PERP_ETH_USDC', OrderSide.BUY, false);

  const onFormSubmit: React.FormEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const formValue = (Object.fromEntries(formData) as unknown) as OrderEntity;
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
                min='2000'
                name='order_price'
              />
            </TextField.Root>
          </label>

          <label>
            Amount (ETH):
            <TextField.Root style={{ gridArea: 'input' }}>
              <TextField.Input
                type='number'
                step='0.01'
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
            defaultValue='PERP_ETH_USDC'
            style={{ display: 'none' }}
          />

          <Button>Submit</Button>
        </Flex>
      </form>
    </Flex>
  );
};
