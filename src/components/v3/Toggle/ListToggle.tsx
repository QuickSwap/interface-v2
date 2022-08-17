import { Trans } from '@lingui/macro'
import { ListToggleElement, StatusText, Wrapper } from './styled'

interface ToggleProps {
    id?: string
    isActive: boolean
    bgColor: string
    toggle: () => void
}

export default function ListToggle({ id, isActive, bgColor, toggle }: ToggleProps) {
    return (
        <Wrapper id={id} isActive={isActive} onClick={toggle}>
            {isActive && (
                <StatusText fontWeight='600' margin='0 6px' isActive={true}>
                    <Trans>ON</Trans>
                </StatusText>
            )}
            <ListToggleElement isActive={isActive} bgColor={bgColor} />
            {!isActive && (
                <StatusText fontWeight='600' margin='0 6px' isActive={false}>
                    <Trans>OFF</Trans>
                </StatusText>
            )}
        </Wrapper>
    )
}
