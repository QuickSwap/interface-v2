import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchGasPrice } from 'utils/prices';

interface IGasPriceContext {
  gasPrice: number | undefined;
}

const GasPriceContext = createContext<IGasPriceContext | null>(null);

const GasPriceProvider: React.FC = (props) => {
  const [gasPrice, setGasPrice] = useState<number>();

  const fetchAndSetGasPrice = () => {
    (async () => {
      const gasPrice = await fetchGasPrice();
      setGasPrice(parseFloat(gasPrice.gasPrice.value));
    })();
  };

  useEffect(() => {
    fetchAndSetGasPrice();
    const keepFetchingGasPrice = setInterval(fetchAndSetGasPrice, 5000);
    return () => {
      clearInterval(keepFetchingGasPrice);
    };
  }, []);

  return (
    <GasPriceContext.Provider
      value={{
        gasPrice,
      }}
      {...props}
    />
  );
};

const useGasPrice = () => {
  const gasPrice = useContext(GasPriceContext);
  if (!gasPrice) throw new Error('Hook used without provider');
  else return gasPrice;
};
export { GasPriceProvider, useGasPrice };
