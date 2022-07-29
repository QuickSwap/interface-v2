import { Pair } from "@uniswap/v2-sdk";
import { Currency, CurrencyAmount, Percent, Token } from "@uniswap/sdk-core";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { useCurrencyBalance } from "../../state/wallet/hooks";
import CurrencySearchModal from "../SearchModal/CurrencySearchModal";
import CurrencyLogo from "../CurrencyLogo";
import DoubleCurrencyLogo from "../DoubleLogo";
import { RowBetween, RowFixed } from "../Row";
import { TYPE } from "../../theme";
import { useActiveWeb3React } from "../../hooks/web3";
import { Trans } from "@lingui/macro";
import { FiatValue } from "./FiatValue";
import Loader from "../Loader";
import useUSDCPrice from "../../hooks/useUSDCPrice";
import { Aligner, AutoColumnStyled, Container, CurrencySelect, FiatRow, FixedContainer, InputPanel, InputRow, MaxButton, NumericalInputStyled, StyledTokenName } from "./styled";
import { WrappedCurrency } from "../../models/types";

interface CurrencyInputPanelProps {
    value: string;
    onUserInput: (value: string) => void;
    onMax?: () => void;
    showMaxButton: boolean;
    label?: ReactNode;
    onCurrencySelect?: (currency: Currency) => void;
    currency?: WrappedCurrency | null;
    hideBalance?: boolean;
    pair?: Pair | null;
    hideInput?: boolean;
    otherCurrency?: Currency | null;
    fiatValue?: CurrencyAmount<Token> | null;
    priceImpact?: Percent;
    id: string;
    showCommonBases?: boolean;
    showCurrencyAmount?: boolean;
    disableNonToken?: boolean;
    showBalance?: boolean;
    renderBalance?: (amount: CurrencyAmount<Currency>) => ReactNode;
    locked?: boolean;
    hideCurrency?: boolean;
    centered?: boolean;
    disabled: boolean;
    shallow: boolean;
    swap: boolean;
    page?: string;
}

export default function CurrencyInputPanel({
    value,
    onUserInput,
    onMax,
    showMaxButton,
    onCurrencySelect,
    currency,
    otherCurrency,
    id,
    showCommonBases,
    showCurrencyAmount,
    disableNonToken,
    fiatValue,
    priceImpact,
    hideBalance = false,
    pair = null, // used for double token logo
    hideInput = false,
    locked = false,
    showBalance,
    hideCurrency = false,
    centered = false,
    disabled,
    shallow = false,
    swap = false,
    page,
    ...rest
}: CurrencyInputPanelProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const { account } = useActiveWeb3React();

    const balance = useCurrencyBalance(account ?? undefined, currency ?? undefined);

    const currentPrice = useUSDCPrice(currency ?? undefined);

    const handleDismissSearch = useCallback(() => {
        setModalOpen(false);
    }, [setModalOpen]);

    const balanceString = useMemo(() => {
        if (!balance) return "Loading...";

        const _balance = balance.toFixed();

        if (_balance.split(".")[0].length > 10) {
            return _balance.slice(0, 7) + "...";
        }

        if (+balance.toFixed() === 0) {
            return "0";
        }
        if (+balance.toFixed() < 0.0001) {
            return "< 0.0001";
        }

        return +balance.toFixed(3);
    }, [balance]);

    return (
        <InputPanel id={id} hideInput={hideInput} {...rest}>
            {locked && (
                <FixedContainer style={{ height: `${page === "pool" ? "40px" : "80px"}` }}>
                    <AutoColumnStyled
                        gap="sm"
                        justify="center"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                            marginTop: "18px",
                            position: "absolute",
                            bottom: "10%",
                        }}
                    >
                        {/* <Lock /> */}
                        <TYPE.label fontSize="14px">
                            <Trans>Price is outside specified price range. Single-asset deposit only.</Trans>
                        </TYPE.label>
                    </AutoColumnStyled>
                </FixedContainer>
            )}

            <Container hideInput={hideInput}>
                <InputRow
                    hideCurrency={hideCurrency}
                    style={hideInput ? { borderRadius: "8px", padding: `${page === "pool" ? "0" : ""}` } : { padding: `${page === "pool" ? "0" : ""}` }}
                    selected={!onCurrencySelect}
                >
                    {!hideCurrency && (
                        <CurrencySelect
                            page={page}
                            selected={!!currency}
                            hideInput={hideInput}
                            className="open-currency-select-button"
                            shallow={shallow}
                            swap={swap}
                            disabled={shallow && page !== "addLiq"}
                            onClick={() => {
                                if (onCurrencySelect) {
                                    setModalOpen(true);
                                }
                            }}
                        >
                            <Aligner centered={centered} title={balance ? balance.toSignificant(4) : ""}>
                                <RowFixed>
                                    {pair ? (
                                        <span style={{ marginRight: "0.5rem" }}>
                                            <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={24} margin={true} />
                                        </span>
                                    ) : currency ? (
                                        <CurrencyLogo style={{ marginRight: "0.5rem" }} currency={currency} size={"24px"} />
                                    ) : null}
                                    {pair ? (
                                        <StyledTokenName className="pair-name-container">
                                            {pair?.token0.symbol}:{pair?.token1.symbol}
                                        </StyledTokenName>
                                    ) : (
                                        <StyledTokenName className="token-symbol-container" active={Boolean(currency && currency.symbol)}>
                                            {(currency && currency.symbol && currency.symbol.length > 20 ? (
                                                currency.symbol.slice(0, 4) + "..." + currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
                                            ) : currency ? (
                                                <div style={{ display: "flex", alignItems: "center" }}>
                                                    <span>
                                                        {shallow && showBalance && balance && page === "addLiq" && +balance.toSignificant(4) < 0.0001 ? (
                                                            <Trans>{`Balance: < 0.0001 ${currency.symbol}`}</Trans>
                                                        ) : shallow && showBalance && balance ? (
                                                            <Trans>{`Balance: ${balanceString} ${currency.symbol}`}</Trans>
                                                        ) : (
                                                            currency.symbol
                                                        )}
                                                    </span>
                                                    {showBalance && balance && !shallow ? (
                                                        <span style={{ position: "absolute", right: 0, fontSize: "13px" }} title={balance.toExact()}>
                                                            {balanceString}
                                                        </span>
                                                    ) : (
                                                        showBalance &&
                                                        !balance &&
                                                        account && (
                                                            <span style={{ position: "absolute", right: 0 }}>
                                                                <Loader />
                                                            </span>
                                                        )
                                                    )}
                                                </div>
                                            ) : null) || <Trans>Select a token</Trans>}
                                        </StyledTokenName>
                                    )}
                                </RowFixed>
                            </Aligner>
                        </CurrencySelect>
                    )}
                    {(swap || page === "addLiq") && !locked && currency && showMaxButton && (
                        <MaxButton page={page} onClick={onMax}>
                            Max
                        </MaxButton>
                    )}
                    {!hideInput && (
                        <>
                            <NumericalInputStyled
                                style={{
                                    backgroundColor: "transparent",
                                    textAlign: hideCurrency ? "left" : "right",
                                    fontSize: "20px",
                                    marginTop: page === "pool" ? "1rem" : "0",
                                }}
                                className="token-amount-input"
                                value={value}
                                disabled={disabled}
                                onUserInput={(val) => {
                                    if (val === ".") val = "0.";
                                    onUserInput(val);
                                }}
                            />
                        </>
                    )}
                </InputRow>
                {!hideInput && !hideBalance && !locked && value ? (
                    <FiatRow shallow={shallow} page={page}>
                        <RowBetween>
                            <FiatValue fiatValue={fiatValue} priceImpact={priceImpact} />
                        </RowBetween>
                    </FiatRow>
                ) : currency && swap && currentPrice ? (
                    <FiatRow page={page}>
                        <RowBetween>{`1 ${currency.symbol} = $${currentPrice.toFixed()}`}</RowBetween>
                    </FiatRow>
                ) : (
                    currency &&
                    swap && (
                        <FiatRow page={page}>
                            <RowBetween>
                                <Trans>Updating...</Trans>
                            </RowBetween>
                        </FiatRow>
                    )
                )}
            </Container>
            {onCurrencySelect && (
                <CurrencySearchModal
                    isOpen={modalOpen}
                    onDismiss={handleDismissSearch}
                    onCurrencySelect={onCurrencySelect}
                    selectedCurrency={currency}
                    otherSelectedCurrency={otherCurrency}
                    showCommonBases={showCommonBases}
                    showCurrencyAmount={showCurrencyAmount}
                    disableNonToken={disableNonToken}
                />
            )}
        </InputPanel>
    );
}
