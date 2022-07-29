import React, { useMemo } from 'react'
import './index.scss'

interface CardProps {
    classes?: string
    children?: any
    isDark?: boolean
}

const Card = ({ classes, children, isDark }: CardProps) => {
    const theme = useMemo(() => isDark ? 'dark' : isDark === undefined ? '' : 'light', [isDark])
    return (
        <div className={`card-wrapper ${theme} ${classes}`}>
            {children}
        </div>
    )
}

export default Card
