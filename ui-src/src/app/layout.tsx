import { Providers } from './providers'

import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Vibe Test',
    description: 'Internal API Testing & Traffic Capture Tool',
}

const RootLayout = ({
    children,
}: {
    children: React.ReactNode
}): JSX.Element => {
    return (
        <html lang="en">
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}

export default RootLayout
