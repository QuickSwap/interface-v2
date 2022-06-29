import styled from 'styled-components/macro'

export const PageWrapper = styled.div`
    width: 100%;
`
export const EmptyMock = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 400px;

    & > * {
        margin-bottom: 1rem;
    }
`
export const EventsCards = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
`
export const EventsCardsRow = styled.div`
    display: grid;
    width: 100%;
    margin-bottom: 1rem;
    grid-template-columns: repeat(3, 1fr);
    column-gap: 1rem;
    row-gap: 1rem;


    ${({ theme }) => theme.mediaWidth.upToMedium`
     grid-template-columns: repeat(2, 1fr);

  `}

    ${({ theme }) => theme.mediaWidth.upToSmall`
     grid-template-columns: repeat(1, 1fr);
  `}
`
