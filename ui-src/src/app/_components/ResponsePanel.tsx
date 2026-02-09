'use client'

import { FiBookmark, FiCopy, FiServer } from 'react-icons/fi'

import {
    Box,
    Flex,
    VStack,
    HStack,
    Badge,
    Text,
    Tooltip,
    Button,
    Spinner,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    IconButton,
    Heading,
    useToast
} from '@chakra-ui/react'

import { CookieTable } from './CookieTable'
import { JsonHighlighter } from './JsonHighlighter'

import type { ExecuteResponse, JsonValue } from '../../types'

interface ResponsePanelProps {
    executing: boolean
    response: ExecuteResponse | null
    saveToHistory: () => void
    formatResponseBody: (body: string | JsonValue | null | undefined) => string
    isHtmlResponse: () => boolean
    isJsonResponse: () => boolean
    cardBg: string
    mutedText: string
    headingColor: string
}

export const ResponsePanel = ({
    executing,
    response,
    saveToHistory,
    formatResponseBody,
    isHtmlResponse,
    isJsonResponse,
    cardBg,
    mutedText,
    headingColor
}: ResponsePanelProps): JSX.Element | null => {
    const toast = useToast()

    if (executing) {
        return (
            <Flex justify="center" align="center" h="md">
                <Spinner size="xl" color="purple.500" thickness="4px" />
            </Flex>
        )
    }

    if (!response) {
        return (
            <Flex direction="column" align="center" justify="center" h="md" color={mutedText} opacity={0.6}>
                <FiServer size={48} style={{ marginBottom: '16px' }} />
                <Heading size="md" mb={2} color={headingColor}>
                    Ready to Test
                </Heading>
                <Text fontSize="sm" textAlign="center" maxW="300px">
                    Enter a URL and send a request to inspect the response details here.
                </Text>
            </Flex>
        )
    }

    return (
        <VStack align="stretch" spacing={4} p={4} h="md" overflow="auto">
            <HStack justify="space-between">
                <HStack spacing={3}>
                    <Badge
                        colorScheme={
                            response.success && response.status
                                ? response.status < 300
                                    ? 'green'
                                    : response.status < 400
                                        ? 'yellow'
                                        : 'red'
                                : 'red'
                        }
                        fontSize="md"
                        px={3}
                        py={1}
                        borderRadius="md"
                    >
                        {response.success ? `${response.status} ${response.statusText}` : 'Error'}
                    </Badge>
                    {response.time && (
                        <Text fontSize="sm" color={mutedText} fontWeight="medium">
                            {response.time}ms
                        </Text>
                    )}
                </HStack>
                <Tooltip label="Save to History">
                    <Button
                        size="sm"
                        leftIcon={<FiBookmark />}
                        variant="ghost"
                        onClick={saveToHistory}
                        _hover={{ bg: 'purple.50', color: 'purple.600' }}
                    >
                        Save Result
                    </Button>
                </Tooltip>
            </HStack>

            {response.error && (
                <Box bg="red.900" p={4} borderRadius="md" borderLeft="4px solid" borderColor="red.400">
                    <Text color="red.200" fontSize="sm">{response.error}</Text>
                </Box>
            )}

            {response.success && (
                <Tabs size="sm" variant="enclosed" colorScheme="purple">
                    <TabList>
                        <Tab>Body</Tab>
                        {isHtmlResponse() && <Tab>Preview</Tab>}
                        {isJsonResponse() && <Tab>Cookies</Tab>}
                        <Tab>Headers</Tab>
                    </TabList>
                    <TabPanels>
                        {/* JSON/Text Body */}
                        <TabPanel px={0} pt={4}>
                            <Box bg={cardBg} p={4} borderRadius="md" overflow="auto" maxH="500px" position="relative" border="1px solid" borderColor="gray.100">
                                <IconButton
                                    aria-label="Copy response"
                                    icon={<FiCopy />}
                                    size="sm"
                                    position="absolute"
                                    top={2}
                                    right={2}
                                    variant="ghost"
                                    onClick={(): void => {
                                        const text = formatResponseBody(response.body)
                                        void navigator.clipboard.writeText(text)
                                        toast({ title: 'Response copied!', status: 'success', duration: 1500, position: 'bottom-right' })
                                    }}
                                />
                                <JsonHighlighter json={formatResponseBody(response.body)} />
                            </Box>
                        </TabPanel>

                        {/* HTML Preview */}
                        {isHtmlResponse() && (
                            <TabPanel px={0} pt={4}>
                                <Box
                                    bg="white"
                                    borderRadius="md"
                                    overflow="hidden"
                                    h="500px"
                                    border="1px solid"
                                    borderColor="gray.100"
                                >
                                    <iframe
                                        srcDoc={typeof response.body === 'string' ? response.body : ''}
                                        style={{ width: '100%', height: '100%', border: 'none' }}
                                        title="HTML Preview"
                                        sandbox="allow-same-origin"
                                    />
                                </Box>
                            </TabPanel>
                        )}

                        {/* Cookies */}
                        <TabPanel px={0} pt={4}>
                            {response.cookies && response.cookies.length > 0 ? (
                                <CookieTable cookies={response.cookies} />
                            ) : (
                                <Flex direction="column" align="center" justify="center" h="200px" color={mutedText}>
                                    <Text fontSize="sm">No cookies received in this response</Text>
                                </Flex>
                            )}
                        </TabPanel>

                        {/* Response Headers */}
                        <TabPanel px={0} pt={4}>
                            <VStack align="stretch" spacing={1}>
                                {response.headers &&
                                    Object.entries(response.headers).map(([key, value]) => (
                                        <HStack key={key} fontSize="sm" p={2} borderRadius="md" _hover={{ bg: 'gray.50' }}>
                                            <Text fontWeight="bold" color={mutedText} minW="150px">
                                                {key}:
                                            </Text>
                                            <Text wordBreak="break-all">{String(value)}</Text>
                                        </HStack>
                                    ))}
                            </VStack>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            )}
        </VStack>
    )
}
