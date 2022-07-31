import styled from 'styled-components/macro';
import { darken } from 'polished';

const FancyButton = styled.button`
  align-items: center;
  color: white;
  height: 2rem;
  border-radius: 36px;
  font-size: 1rem;
  width: auto;
  min-width: 3.5rem;
  border: 1px solid var(--primary);
  outline: none;
  background: transparent;
  :focus {
    border: 1px solid var(--primary);
  }
`;
export const Option = styled(FancyButton)<{ active: boolean }>`
  margin-right: 8px;
  background-color: var(--primary);
  border-radius: 12px;
  border: 1px solid var(--primary);

  :hover {
    background-color: var(--primary-hover);
    border: 1px solid var(--primary-hover);
    cursor: pointer;
  }
  color: white;
`;
export const Input = styled.input`
  background: transparent;
  font-size: 16px;
  width: auto;
  outline: none;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }

  color: ${({ theme, color }) => (color === 'red' ? theme.red1 : theme.white)};
  text-align: right;
`;
export const OptionCustom = styled(FancyButton)<{
  active?: boolean;
  warning?: boolean;
}>`
  height: 2rem;
  position: relative;
  padding: 0 0.75rem;
  flex: 1;
  border: ${({ theme, active, warning }) =>
    active
      ? `1px solid ${warning ? theme.red1 : 'var(--primary)'}`
      : warning && `1px solid ${theme.red1}`};

  input {
    width: 100%;
    height: 100%;
    border: 0;
    background: transparent;
    border-radius: 2rem;
  }
`;
export const SlippageEmojiContainer = styled.span`
  color: #f3841e;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `}
`;
