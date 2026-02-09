'use client'

import { Box, useColorModeValue } from '@chakra-ui/react'

import type { Cookie } from '../../types'

interface CookieTableProps {
    cookies: string[]
}

// Cookie parser helper
const parseCookie = (str: string): Cookie => {
    const parts = str.split(';')
    const [nameVal, ...attrs] = parts
    const [name, ...valParts] = nameVal.trim().split('=')
    const value = valParts.join('=')

    const cookie: Cookie = { name, value }

    attrs.forEach(attr => {
        const [key, ...v] = attr.trim().split('=')
        const val = v.join('=')
        const k = key.toLowerCase()

        if (k === 'domain') { cookie.domain = val }
        if (k === 'path') { cookie.path = val }
        if (k === 'expires') { cookie.expires = val }
        if (k === 'httponly') { cookie.httpOnly = true }
        if (k === 'secure') { cookie.secure = true }
    })

    return cookie
}

export const CookieTable = ({ cookies }: CookieTableProps): JSX.Element => {
    const parsedCookies = cookies.map(parseCookie)
    const borderColor = useColorModeValue('gray.200', 'gray.700')
    const headerBg = useColorModeValue('gray.50', 'gray.800')

    return (
        <Box overflowX="auto">
            <Box as="table" w="full" fontSize="sm" style={{ borderCollapse: 'collapse' }}>
                <Box as="thead" bg={headerBg}>
                    <Box as="tr">
                        <Box as="th" textAlign="left" p={2} borderBottom="1px" borderColor={borderColor}>Name</Box>
                        <Box as="th" textAlign="left" p={2} borderBottom="1px" borderColor={borderColor}>Value</Box>
                        <Box as="th" textAlign="left" p={2} borderBottom="1px" borderColor={borderColor}>Domain</Box>
                        <Box as="th" textAlign="left" p={2} borderBottom="1px" borderColor={borderColor}>Path</Box>
                        <Box as="th" textAlign="left" p={2} borderBottom="1px" borderColor={borderColor}>Expires</Box>
                        <Box as="th" textAlign="center" p={2} borderBottom="1px" borderColor={borderColor}>HttpOnly</Box>
                        <Box as="th" textAlign="center" p={2} borderBottom="1px" borderColor={borderColor}>Secure</Box>
                    </Box>
                </Box>
                <Box as="tbody">
                    {parsedCookies.map((cookie) => (
                        <Box as="tr" key={`${cookie.name}-${cookie.value}`} borderBottom="1px" borderColor={borderColor}>
                            <Box as="td" p={2} fontWeight="bold">{cookie.name}</Box>
                            <Box as="td" p={2} style={{ wordBreak: 'break-all' }} maxW="200px">{cookie.value}</Box>
                            <Box as="td" p={2}>{cookie.domain ?? '-'}</Box>
                            <Box as="td" p={2}>{cookie.path ?? '-'}</Box>
                            <Box as="td" p={2}>{cookie.expires ?? 'Session'}</Box>
                            <Box as="td" p={2} textAlign="center">{cookie.httpOnly ? '✅' : '-'}</Box>
                            <Box as="td" p={2} textAlign="center">{cookie.secure ? '✅' : '-'}</Box>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    )
}
