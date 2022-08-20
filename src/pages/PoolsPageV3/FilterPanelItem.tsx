import React from 'react'
import { Trans } from '@lingui/macro'
import Toggle from '../../components/Toggle'

interface FilterPanelProps {
    item: {
        title: string
        method: (v: boolean) => void
        checkValue: boolean
    }
}

const FilterPanelItem = ({ item: { title, method, checkValue } }: FilterPanelProps) => {
    return (
        <div>
            <div className={'mb-05 mxs_ta-c'}>
                <Trans>{title}</Trans>
            </div>
            <Toggle
                isActive={!checkValue}
                toggle={() => method(!checkValue)}
                checked={<Trans>Show</Trans>}
                unchecked={<Trans>Hide</Trans>}
            />
        </div>
    )
}

export default FilterPanelItem
