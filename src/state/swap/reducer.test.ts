import { createStore, Store } from 'redux';
import { Field, selectCurrency } from './actions';
import reducer, { SwapState } from './reducer';

describe('swap reducer', () => {
  let store: Store<SwapState>;

  describe('selectToken', () => {
    it('changes token', () => {
      store.dispatch(
        selectCurrency({
          field: Field.OUTPUT,
          currencyId: '0x0000',
        }),
      );

      expect(store.getState()).toEqual({
        [Field.OUTPUT]: { currencyId: '0x0000' },
        [Field.INPUT]: { currencyId: '' },
        typedValue: '',
        independentField: Field.INPUT,
        recipient: null,
      });
    });
  });
});
