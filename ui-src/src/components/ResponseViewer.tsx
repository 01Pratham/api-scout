'use client'

import {
    Box,
    Flex,
    VStack,
    HStack,
    Text,
    Badge,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    useColorModeValue,
} from '@chakra-ui/react'

import type { ExecuteResponse } from '../types'

interface ResponseViewerProps {
    response: ExecuteResponse | null
    borderColor: string
    codeBg: string
}

export const ResponseViewer = ({
    response,
    borderColor,
    codeBg,
}: ResponseViewerProps): JSX.Element => {
    const mutedText = useColorModeValue('gray.500', 'gray.400')
    const headerBg = useColorModeValue('white', 'gray.800')

    if (!response) {
        return (
            <Flex h="full" align="center" justify="center" p={8}>
                <VStack spacing={2} opacity={0.5}>
                    <Text fontSize="lg" fontWeight="bold">No Response</Text>
                    <Text fontSize="sm">Send a request to see the response here</Text>
                </VStack>
            </Flex>
        )
    }

    const { success, status, statusText, time, body, headers, error } = response

    return (
        <VStack align="stretch" spacing={0} h="full">
            {/* Response Status Bar */}
            <HStack px={4} py={3} justify="space-between" bg={headerBg} borderBottom="1px" borderColor={borderColor}>
                <HStack spacing={4}>
                    <HStack spacing={2}>
                        <Text fontSize="xs" fontWeight="bold" color={mutedText}>STATUS:</Text>
                        <Badge
                            colorScheme={(status ?? 0) < 400 ? 'green' : 'red'}
                            fontSize="sm"
                            px={2}
                            py={0.5}
                            borderRadius="md"
                        >
                            {status ?? (error ? 'ERROR' : '???')} {statusText}
                        </Badge>
                    </HStack>
                    <HStack spacing={2}>
                        <Text fontSize="xs" fontWeight="bold" color={mutedText}>TIME:</Text>
                        <Text fontSize="sm" fontWeight="semibold">{time ?? 0} ms</Text>
                    </HStack>
                </HStack>
                {!success && error && (
                    <Badge colorScheme="red" variant="solid">Failed</Badge>
                )}
            </HStack>

            {/* Response Content */}
            <Box flex="1" overflow="hidden">
                <Tabs colorScheme="purple" size="sm" h="full" display="flex" flexDirection="column">
                    <TabList px={4} pt={2} borderColor={borderColor}>
                        <Tab fontWeight="semibold">Body</Tab>
                        <Tab fontWeight="semibold">Headers</Tab>
                    </TabList>

                    <TabPanels flex="1" overflowY="auto">
                        <TabPanel p={0} h="full">
                            {error ? (
                                <Box p={4}>
                                    <Text color="red.500" fontWeight="bold">Error:</Text>
                                    <Box mt={2} p={4} bg="red.50" _dark={{ bg: 'red.900' }} borderRadius="md" border="1px" borderColor="red.200">
                                        <Text fontFamily="monospace" fontSize="sm">{error}</Text>
                                    </Box>
                                </Box>
                            ) : (
                                <Box p={4} h="full">
                                    <Box
                                        bg={codeBg}
                                        p={4}
                                        borderRadius="md"
                                        border="1px"
                                        borderColor={borderColor}
                                        overflow="auto"
                                        maxH="full"
                                    >
                                        <pre style={{ margin: 0, fontSize: '13px', fontFamily: 'var(--chakra-fonts-mono)' }}>
                                            {typeof body === 'string' ? body : JSON.stringify(body, null, 2)}
                                        </pre>
                                    </Box>
                                </Box>
                            )}
                        </TabPanel>

                        <TabPanel p={4}>
                            <VStack align="stretch" spacing={2}>
                                {headers && Object.entries(headers).map(([key, value]) => (
                                    <HStack key={key} justify="space-between" borderBottom="1px" borderColor={borderColor} py={1}>
                                        <Text fontSize="xs" fontWeight="bold" color="purple.500">{key}</Text>
                                        <Text fontSize="xs" fontFamily="monospace" textAlign="right">{value}</Text>
                                    </HStack>
                                ))}
                            </VStack>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Box>
        </VStack>
    )
}
