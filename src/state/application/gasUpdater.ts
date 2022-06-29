import { useEffect } from 'react'
import { useGasPrice } from '../../hooks/useGasPrice'
import { useActiveWeb3React } from 'hooks'

import { updateGasPrice } from './actions'
import { ChainId } from '@uniswap/sdk'
import { useAppDispatch, useAppSelector } from 'state'

export default function GasUpdater(): null {

    const dispatch = useAppDispatch()

    const { chainId } = useActiveWeb3React()

    const block = useAppSelector((state) => {
        return state.application.blockNumber[chainId ?? ChainId.MATIC]
    })

    const { fetchGasPrice, gasPrice, gasPriceLoading } = useGasPrice()

    useEffect(() => {
        fetchGasPrice()
    }, [dispatch, block])

    useEffect(() => {
        if (!gasPrice.fetched) return
        dispatch(updateGasPrice(gasPrice))
    }, [gasPrice, gasPriceLoading])

    return null
}
