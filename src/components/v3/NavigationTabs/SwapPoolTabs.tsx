import React from 'react';
import { StyledNavLink, Tabs } from './styled'

interface SwapPoolTabs {
    active: 'swap' | 'pool'
}

export function SwapPoolTabs({ active }: SwapPoolTabs) {
    return (
        <Tabs style={{ marginBottom: '20px', display: 'none', padding: '1rem 1rem 0 1rem' }}>
            <StyledNavLink id={`swap-nav-link`} to={'/swap'} isActive={() => active === 'swap'}>
                Swap
            </StyledNavLink>
            <StyledNavLink id={`pool-nav-link`} to={'/pool'} isActive={() => active === 'pool'}>
                Pool
            </StyledNavLink>
        </Tabs>
    )
}
