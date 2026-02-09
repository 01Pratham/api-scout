'use client'

import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    HStack,
    Text,
    Badge,
    Select,
    Button,
    Spinner,
    VStack,
    Box,
    Code,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon
} from '@chakra-ui/react'
import type { UseToastOptions } from '@chakra-ui/react'

import type { Collection, RequestTab, OpenApiSpec, OpenApiOperation, OpenApiServer } from '../../types'

interface OpenApiDocsViewerProps {
    isOpen: boolean
    onClose: () => void
    openApiSpec: OpenApiSpec | null
    viewerCollectionId: string
    setViewerCollectionId: (v: string) => void
    collections: Collection[]
    loadCollectionDocs: (id: string) => void
    loadingOpenApi: boolean
    createNewTab: () => RequestTab
    setTabs: React.Dispatch<React.SetStateAction<RequestTab[]>>
    setActiveTabId: (v: string) => void
    cardBg: string
    inputBg: string
    borderColor: string
    mutedText: string
    methodColors: Record<string, string>
    toast: (options: UseToastOptions) => string | number | undefined
}

export const OpenApiDocsViewer = ({
    isOpen,
    onClose,
    openApiSpec,
    viewerCollectionId,
    setViewerCollectionId,
    collections,
    loadCollectionDocs,
    loadingOpenApi,
    createNewTab,
    setTabs,
    setActiveTabId,
    cardBg,
    inputBg,
    borderColor,
    mutedText,
    methodColors,
    toast
}: OpenApiDocsViewerProps): JSX.Element => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="6xl">
            <ModalOverlay />
            <ModalContent bg={cardBg} maxH="90vh">
                <ModalHeader>
                    <HStack>
                        <Text>📖 API Documentation</Text>
                        {openApiSpec && (
                            <Badge colorScheme="green" ml={2}>
                                OpenAPI {String(openApiSpec.openapi ?? '3.0')}
                            </Badge>
                        )}
                    </HStack>
                    {(openApiSpec?.info) && (
                        <Text fontSize="sm" fontWeight="normal" color={mutedText} mt={1}>
                            {openApiSpec.info.title} v{openApiSpec.info.version}
                        </Text>
                    )}
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody overflowY="auto" pb={6}>
                    <HStack mb={4} spacing={3}>
                        <Select
                            placeholder="Select a collection..."
                            value={viewerCollectionId}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => { setViewerCollectionId(e.target.value) }}
                            bg={inputBg}
                            borderColor={borderColor}
                            flex="1"
                        >
                            {collections.map((col) => (
                                <option key={col.id} value={col.id}>
                                    {col.name} ({col.requests.length ?? 0} requests)
                                </option>
                            ))}
                        </Select>
                        <Button
                            colorScheme="purple"
                            onClick={(): void => { loadCollectionDocs(viewerCollectionId) }}
                            isLoading={loadingOpenApi}
                            isDisabled={!viewerCollectionId}
                        >
                            Load Docs
                        </Button>
                    </HStack>

                    {loadingOpenApi ? (
                        <VStack py={8} spacing={4}>
                            <Spinner color="purple.500" />
                            <Text fontSize="sm">Loading API documentation...</Text>
                        </VStack>
                    ) : openApiSpec?.paths ? (
                        <VStack align="stretch" spacing={4}>
                            {openApiSpec.servers && (
                                <Box>
                                    <Text fontWeight="bold" fontSize="sm" mb={2}>Servers</Text>
                                    <VStack align="stretch" spacing={2}>
                                        {openApiSpec.servers.map((server: OpenApiServer) => (
                                            <HStack key={server.url} bg={inputBg} p={2} borderRadius="md" border="1px solid" borderColor={borderColor}>
                                                <Code fontSize="xs" bg="transparent" color="purple.500">{server.url}</Code>
                                                {server.description && <Text fontSize="xs" color={mutedText}>- {server.description}</Text>}
                                            </HStack>
                                        ))}
                                    </VStack>
                                </Box>
                            )}

                            <Box>
                                <Text fontWeight="bold" fontSize="sm" mb={2}>Endpoints</Text>
                                <Accordion allowMultiple>
                                    {Object.entries(openApiSpec.paths).map(([path, methods]) => (
                                        <AccordionItem key={path} border="1px solid" borderColor={borderColor} borderRadius="md" mb={2} overflow="hidden">
                                            <AccordionButton _hover={{ bg: inputBg }}>
                                                <HStack flex="1" spacing={3}>
                                                    {Object.keys(methods).filter(m => m !== 'parameters').map(m => (
                                                        <Badge key={m} colorScheme={methodColors[m.toUpperCase()] ?? 'gray'}>
                                                            {m.toUpperCase()}
                                                        </Badge>
                                                    ))}
                                                    <Code fontSize="xs" bg="transparent" fontWeight="bold">{path}</Code>
                                                </HStack>
                                                <AccordionIcon />
                                            </AccordionButton>
                                            <AccordionPanel pb={4}>
                                                <VStack align="stretch" spacing={3}>
                                                    {Object.entries(methods).filter(([m]) => m !== 'parameters').map(([method, operation]: [string, OpenApiOperation]) => (
                                                        <Box key={method} bg={inputBg} p={3} borderRadius="md" border="1px solid" borderColor={borderColor}>
                                                            <HStack mb={2} justify="space-between">
                                                                <HStack>
                                                                    <Badge colorScheme={methodColors[method.toUpperCase()] ?? 'gray'}>{method.toUpperCase()}</Badge>
                                                                    <Text fontWeight="bold" fontSize="sm">{operation.summary ?? 'Untitled Operation'}</Text>
                                                                </HStack>
                                                                <Button
                                                                    size="xs"
                                                                    colorScheme="purple"
                                                                    onClick={(): void => {
                                                                        const baseUrl = openApiSpec.servers?.[0]?.url ?? ''
                                                                        const newTab = createNewTab()
                                                                        newTab.method = method.toUpperCase()
                                                                        newTab.url = baseUrl + path
                                                                        newTab.name = operation.summary ?? path

                                                                        const reqBody = operation.requestBody?.content?.['application/json']
                                                                        if (reqBody?.example) {
                                                                            newTab.body = JSON.stringify(reqBody.example, null, 2)
                                                                        } else if (reqBody?.schema) {
                                                                            newTab.body = JSON.stringify(reqBody.schema, null, 2)
                                                                        }

                                                                        setTabs((prev: RequestTab[]) => [...prev, newTab])
                                                                        setActiveTabId(newTab.id)
                                                                        onClose()
                                                                        toast({ title: 'Added to new tab', status: 'success', duration: 2000 })
                                                                    }}
                                                                >
                                                                    Try it
                                                                </Button>
                                                            </HStack>
                                                            {operation.description && <Text fontSize="xs" color={mutedText} mb={2}>{operation.description}</Text>}
                                                        </Box>
                                                    ))}
                                                </VStack>
                                            </AccordionPanel>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </Box>
                        </VStack>
                    ) : (
                        <VStack py={12} color={mutedText}>
                            <Text fontSize="sm">No documentation available for this collection.</Text>
                        </VStack>
                    )}
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}
