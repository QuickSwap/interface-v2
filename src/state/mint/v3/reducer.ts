import { createReducer } from '@reduxjs/toolkit'
import { Field, resetMintState, setAddLiquidityTxHash, updateCurrentStep, setFullRange, setInitialTokenPrice, setInitialUSDPrices, setShowNewestPosition, typeInput, typeLeftRangeInput, typeRightRangeInput, typeStartPriceInput, updateDynamicFee, updateSelectedPreset } from './actions'

export type FullRange = true

export enum Presets {
    SAFE,
    RISK,
    NORMAL,
    FULL,
    STABLE,
}

interface MintState {
    readonly independentField: Field
    readonly typedValue: string
    readonly startPriceTypedValue: string // for the case when there's no liquidity
    readonly leftRangeTypedValue: string | FullRange
    readonly rightRangeTypedValue: string | FullRange
    readonly dynamicFee: number
    readonly preset: Presets | null
    readonly txHash: string
    readonly showNewestPosition: boolean
    readonly initialUSDPrices: { [Field.CURRENCY_A]: string, [Field.CURRENCY_B]: string }
    readonly initialTokenPrice: string
    readonly currentStep: number
}

const initialState: MintState = {
    independentField: Field.CURRENCY_A,
    typedValue: '',
    startPriceTypedValue: '',
    leftRangeTypedValue: '',
    rightRangeTypedValue: '',
    dynamicFee: 0,
    preset: null,
    txHash: '',
    showNewestPosition: false,
    initialUSDPrices: { [Field.CURRENCY_A]: '', [Field.CURRENCY_B]: '' },
    initialTokenPrice: '',
    currentStep: 0
}

export default createReducer<MintState>(initialState, (builder) =>
    builder
        .addCase(updateDynamicFee, (state, { payload: { dynamicFee } }) => {
            return {
                ...state,
                dynamicFee
            }
        })
        .addCase(resetMintState, () => initialState)
        .addCase(setFullRange, (state) => {
            return {
                ...state,
                leftRangeTypedValue: true,
                rightRangeTypedValue: true
            }
        })
        .addCase(typeStartPriceInput, (state, { payload: { typedValue } }) => {
            return {
                ...state,
                startPriceTypedValue: typedValue
            }
        })
        .addCase(typeLeftRangeInput, (state, { payload: { typedValue } }) => {
            return {
                ...state,
                leftRangeTypedValue: typedValue
            }
        })
        .addCase(typeRightRangeInput, (state, { payload: { typedValue } }) => {
            return {
                ...state,
                rightRangeTypedValue: typedValue
            }
        })
        .addCase(typeInput, (state, { payload: { field, typedValue, noLiquidity } }) => {
            if (noLiquidity) {
                // they're typing into the field they've last typed in
                if (field === state.independentField) {
                    return {
                        ...state,
                        independentField: field,
                        typedValue
                    }
                }
                // they're typing into a new field, store the other value
                else {
                    return {
                        ...state,
                        independentField: field,
                        typedValue
                    }
                }
            } else {
                return {
                    ...state,
                    independentField: field,
                    typedValue
                }
            }
        })
        .addCase(updateSelectedPreset, (state, { payload: { preset } }) => {
            return {
                ...state,
                preset
            }
        })
        .addCase(setAddLiquidityTxHash, (state, { payload: { txHash } }) => {
            return {
                ...state,
                txHash
            }
        })
        .addCase(setShowNewestPosition, (state, { payload: { showNewestPosition } }) => {
            return {
                ...state,
                showNewestPosition
            }
        })
        .addCase(setInitialUSDPrices, (state, { payload: { field, typedValue } }) => {
            return {
                ...state,
                initialUSDPrices: {
                    ...state.initialUSDPrices,
                    [field]: typedValue
                }
            }
        })
        .addCase(setInitialTokenPrice, (state, { payload: { typedValue } }) => {
            return {
                ...state,
                initialTokenPrice: typedValue
            }
        })
        .addCase(updateCurrentStep, (state, { payload: { currentStep } }) => {
            return {
                ...state,
                currentStep
            }
        })
)
