import styled from 'styled-components/macro';
import { RowBetween, RowFixed } from '../Row';
import { LightCard } from '../Card';
import { Link, NavLink } from 'react-router-dom';
import { ButtonPrimary } from '../Button';
import { Text } from 'rebass';
import { AutoColumn } from '../Column';

//index
export const RowFixedPrice = styled(RowFixed)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
        flex-direction: row;
        width: 100%;
        justify-content: space-between;
   `}
`;
export const FixedHeightRow = styled(RowBetween)`
  height: 24px;
`;
export const FixedHeightRowCurrency = styled(FixedHeightRow)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    align-items: self-start;
    height: 60px;
  `}
`;
export const RowFixedLogo = styled(RowFixed)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-left: 10px;
  `}
`;
export const StyledPositionCard = styled(LightCard)<{ bgColor: any }>`
  border: none;
  position: relative;
  overflow: hidden;
`;
export const MigrateShortcut = styled(Link)`
  text-decoration: none;
  color: white;
`;
export const ButtonPrimaryStyled = styled(ButtonPrimary)`
  width: unset;
  padding: 4px 8px;
  margin-left: auto;
  border-radius: 5px;
`;

//Sushi
export const StyledSushiPositionCard = styled(StyledPositionCard)<{
  bgColor: any;
}>`
  border: none;
  position: relative;
  overflow: hidden;
  @media screen and (min-width: 501px) {
    padding: 2rem;
  }
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    padding: 2rem;
    `};
`;
export const RowFixedStyled = styled(RowFixed)`
  min-height: 55px;
  justify-content: space-between;
  flex-direction: column;
  @media screen and (min-width: 501px) {
    justify-content: center;
  }
`;
export const TextStyled = styled(Text)`
  margin-left: 0 !important;
`;
export const ArrowBack = styled(NavLink)`
  z-index: 100;
  text-decoration: none;
  color: white;
  position: absolute;
  left: 3%;
  top: 5%;
`;

//V2
export const StyledV2PositionCard = styled(StyledPositionCard)<{
  bgColor: any;
}>`
  border: none;
  background: rgba(60, 97, 126, 0.5);
  position: relative;
  overflow: hidden;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 40px 20px;
  `}
`;
export const RowFixedMigrate = styled(RowFixed)`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin: -20px;
  `}
`;
export const AutoColumnInfo = styled(AutoColumn)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-top: 30px;
  `}
`;
