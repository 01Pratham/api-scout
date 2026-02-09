'use client'

import {
    FiFolder,
    FiSettings,
    FiX,
    FiGlobe,
    FiEdit2,
    FiLayers,
    FiClock,
    FiDownload,
    FiTrash2,
    FiZap,
    FiChevronRight,
    FiChevronDown,
    FiMoreVertical,
} from 'react-icons/fi'

import type { UseDisclosureReturn } from '@chakra-ui/react';
import {
    Box,
    Flex,
    VStack,
    HStack,
    Heading,
    Button,
    IconButton,
    Text,
    Badge,
    Spinner,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Divider,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    useColorModeValue,
    Tooltip,
    Collapse,
    useDisclosure,
} from '@chakra-ui/react'


import type {
    Collection,
    Environment,
    HistoryItem,
    RequestItem,
    RequestTab,
    Folder,
} from '../types'

const METHOD_COLORS: Record<string, string> = {
    GET: 'green',
    POST: 'blue',
    PUT: 'orange',
    PATCH: 'purple',
    DELETE: 'red',
}

interface SidebarContentProps {
    sidebarBg: string
    borderColor: string
    hoverBg: string
    activeTab: RequestTab | undefined
    collections: Collection[]
    loadingCollections: boolean
    environments: Environment[]
    selectedEnvId: string
    history: HistoryItem[]
    showHistory: boolean
    setShowHistory: (show: boolean) => void
    openApiViewerModal: UseDisclosureReturn
    settingsModal: UseDisclosureReturn
    envModal: UseDisclosureReturn
    importModal: UseDisclosureReturn
    collectionModal: UseDisclosureReturn
    setEditingEnvId: (id: string | null) => void
    setNewEnvName: (name: string) => void
    setNewEnvVariables: (vars: string) => void
    loadRequest: (request: RequestItem) => void
    deleteRequest: (id: string) => Promise<void>
    setSelectedEnvId: (id: string) => void
    exportOpenApi: (collectionId: string, collectionName: string) => Promise<void>
    exportPostman: (collectionId: string, collectionName: string) => Promise<void>
    loadHistoryItem: (item: HistoryItem) => void
    clearHistory: () => Promise<void>
    deleteHistoryItem: (id: string) => Promise<void>
    onCloseSidebar?: () => void
    editCollectionModal: UseDisclosureReturn
    setEditingCollection: (c: Collection) => void
}

/**
 * Automatically groups requests into folders based on their URL paths.
 */
const organizeIntoFolders = (requests: RequestItem[]): Folder[] => {
    const rootFolders: Record<string, Folder> = {}

    requests.forEach(req => {
        // Try to identify folder from request name or URL
        // Example: "POST /__api__/v1/users/login" -> Folder "users"
        const nameParts = req.name.split(' ')
        const path = nameParts.length > 1 ? nameParts[1] : req.url

        const segments = path.split('/').filter(s =>
            s && s !== 'api' && s !== 'v1' && !s.startsWith(':') && !s.startsWith('{{')
        )

        if (segments.length > 0) {
            const folderName = segments[0]
            if (!rootFolders[folderName]) {
                rootFolders[folderName] = {
                    id: `folder-${folderName}`,
                    name: folderName.charAt(0).toUpperCase() + folderName.slice(1),
                    requests: [],
                    folders: []
                }
            }
            rootFolders[folderName].requests.push(req)
        }
    })

    return Object.values(rootFolders)
}

interface RequestItemRowProps {
    req: RequestItem
    activeTab: RequestTab | undefined
    hoverBg: string
    loadRequest: (request: RequestItem) => void
    deleteRequest: (id: string) => Promise<void>
    onCloseSidebar?: () => void
}

const RequestItemRow = ({ req, activeTab, hoverBg, loadRequest, deleteRequest, onCloseSidebar }: RequestItemRowProps): JSX.Element => {
    return (
        <HStack
            p={2}
            cursor="pointer"
            className="group"
            borderRadius="md"
            bg={activeTab?.savedRequestId === req.id ? hoverBg : 'transparent'}
            _hover={{ bg: hoverBg }}
            onClick={(): void => {
                loadRequest(req)
                if (onCloseSidebar) { onCloseSidebar() }
            }}
            spacing={2}
        >
            <Text
                fontSize="10px"
                fontWeight="bold"
                color={METHOD_COLORS[req.method] ?? 'gray.500'}
                w="35px"
            >
                {req.method}
            </Text>
            <Text fontSize="xs" noOfLines={1} flex="1">
                {req.name.split(' ').slice(1).join(' ') || req.name}
            </Text>
            <IconButton
                aria-label="Delete"
                icon={<FiTrash2 />}
                size="xs"
                variant="ghost"
                opacity={0}
                _groupHover={{ opacity: 1 }}
                onClick={(e: React.MouseEvent): void => {
                    e.stopPropagation()
                    // eslint-disable-next-line no-alert
                    if (window.confirm('Delete this request?')) {
                        void deleteRequest(req.id)
                    }
                }}
            />
        </HStack>
    )
}

const FolderRow = ({ folder, children }: { folder: Folder, children: React.ReactNode }): JSX.Element => {
    const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true })

    return (
        <Box>
            <HStack
                mb={1}
                spacing={1}
                onClick={onToggle}
                cursor="pointer"
                userSelect="none"
                _hover={{ opacity: 0.8 }}
            >
                {isOpen ? <FiChevronDown size={12} color="gray.400" /> : <FiChevronRight size={12} color="gray.400" />}
                <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                    {folder.name}
                </Text>
            </HStack>
            <Collapse in={isOpen}>
                <VStack align="stretch" spacing={1} pl={2}>
                    {children}
                </VStack>
            </Collapse>
        </Box>
    )
}

const CollectionsList = ({
    collections,
    loadingCollections,
    hoverBg,
    editCollectionModal,
    setEditingCollection,
    exportOpenApi,
    exportPostman,
    activeTab,
    loadRequest,
    deleteRequest,
    onCloseSidebar
}: Pick<SidebarContentProps, 'collections' | 'loadingCollections' | 'hoverBg' | 'editCollectionModal' | 'setEditingCollection' | 'exportOpenApi' | 'exportPostman' | 'activeTab' | 'loadRequest' | 'deleteRequest' | 'onCloseSidebar'>): JSX.Element => {
    if (loadingCollections) {
        return <Flex justify="center" py={8}><Spinner size="sm" color="purple.500" /></Flex>
    }

    if (collections.length === 0) {
        return (
            <Text fontSize="sm" color="gray.500" textAlign="center" py={8}>
                No collections yet
            </Text>
        )
    }

    return (
        <Accordion allowMultiple defaultIndex={[0]}>
            {collections.map((collection) => {
                const organizedFolders = organizeIntoFolders(collection.requests ?? [])

                return (
                    <AccordionItem key={collection.id} border="none" mb={2}>
                        <HStack
                            px={2}
                            py={2}
                            borderRadius="md"
                            _hover={{ bg: hoverBg }}
                            justify="space-between"
                            role="group"
                        >
                            <AccordionButton p={0} flex="1" _hover={{ bg: 'transparent' }}>
                                <HStack flex="1">
                                    <FiFolder size={16} color="var(--chakra-colors-purple-500)" />
                                    <Text fontSize="sm" fontWeight="semibold" noOfLines={1}>
                                        {collection.name}
                                    </Text>
                                </HStack>
                                <AccordionIcon color="gray.400" />
                            </AccordionButton>
                            <Menu>
                                <MenuButton
                                    as={IconButton}
                                    icon={<FiMoreVertical size={14} />}
                                    size="xs"
                                    variant="ghost"
                                    opacity={0}
                                    _groupHover={{ opacity: 1 }}
                                    onClick={(e: React.MouseEvent): void => e.stopPropagation()}
                                />
                                <MenuList zIndex={20}>
                                    <MenuItem icon={<FiEdit2 />} onClick={(): void => {
                                        setEditingCollection(collection)
                                        editCollectionModal.onOpen()
                                    }}>
                                        Edit Collection
                                    </MenuItem>
                                    <MenuItem icon={<FiDownload />} onClick={(): void => { void exportOpenApi(collection.id, collection.name) }}>
                                        Export OpenAPI
                                    </MenuItem>
                                    <MenuItem icon={<FiDownload />} onClick={(): void => { void exportPostman(collection.id, collection.name) }}>
                                        Export to Postman
                                    </MenuItem>
                                </MenuList>
                            </Menu>
                        </HStack>
                        <AccordionPanel pb={2} pl={4} pr={0}>
                            <VStack align="stretch" spacing={2}>
                                {/* Render Folders */}
                                {organizedFolders.map(folder => (
                                    <FolderRow key={folder.id} folder={folder}>
                                        {folder.requests.map(req => (
                                            <RequestItemRow
                                                key={req.id}
                                                req={req}
                                                activeTab={activeTab}
                                                hoverBg={hoverBg}
                                                loadRequest={loadRequest}
                                                deleteRequest={deleteRequest}
                                                onCloseSidebar={onCloseSidebar}
                                            />
                                        ))}
                                    </FolderRow>
                                ))}

                                {/* Leftover requests not in folders */}
                                {(collection.requests ?? []).filter(r => !organizedFolders.some(f => f.requests.includes(r))).map(req => (
                                    <RequestItemRow
                                        key={req.id}
                                        req={req}
                                        activeTab={activeTab}
                                        hoverBg={hoverBg}
                                        loadRequest={loadRequest}
                                        deleteRequest={deleteRequest}
                                        onCloseSidebar={onCloseSidebar}
                                    />
                                ))}
                            </VStack>
                        </AccordionPanel>
                    </AccordionItem>
                )
            })}
        </Accordion>
    )
}

const HistoryList = ({
    history,
    hoverBg,
    clearHistory,
    loadHistoryItem,
    deleteHistoryItem,
    onCloseSidebar
}: Pick<SidebarContentProps, 'history' | 'hoverBg' | 'clearHistory' | 'loadHistoryItem' | 'deleteHistoryItem' | 'onCloseSidebar'>): JSX.Element => {
    return (
        <VStack align="stretch" spacing={2}>
            <HStack justify="space-between" px={2}>
                <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">Recent</Text>
                <Button size="xs" variant="link" colorScheme="red" onClick={(): void => { void clearHistory() }} fontSize="10px">
                    Clear
                </Button>
            </HStack>
            {history.length === 0 ? (
                <Text fontSize="sm" color="gray.500" textAlign="center" py={8}>
                    No history yet
                </Text>
            ) : (
                history.map((item) => (
                    <HStack
                        key={item.id}
                        p={2}
                        borderRadius="md"
                        cursor="pointer"
                        _hover={{ bg: hoverBg }}
                        className="group"
                        onClick={(): void => {
                            loadHistoryItem(item)
                            if (onCloseSidebar) { onCloseSidebar() }
                        }}
                        align="center"
                        spacing={3}
                    >
                        <Badge
                            colorScheme={item.status && item.status < 400 ? 'green' : 'red'}
                            fontSize="9px"
                            minW="32px"
                            textAlign="center"
                            variant="subtle"
                            borderRadius="full"
                        >
                            {item.status ?? 'ERR'}
                        </Badge>
                        <VStack align="start" spacing={0} flex="1" overflow="hidden">
                            <Text fontSize="xs" fontWeight="medium" noOfLines={1} color={item.error ? 'red.400' : 'inherit'}>
                                {item.method} {item.url.replace(/^https?:\/\//, '')}
                            </Text>
                            <Text fontSize="10px" color="gray.500">
                                {item.duration ?? 0}ms • {new Date(item.createdAt).toLocaleTimeString()}
                            </Text>
                        </VStack>
                        <IconButton
                            aria-label="Delete"
                            icon={<FiX />}
                            size="xs"
                            variant="ghost"
                            opacity={0}
                            _groupHover={{ opacity: 1 }}
                            onClick={(e: React.MouseEvent): void => {
                                e.stopPropagation()
                                void deleteHistoryItem(item.id)
                            }}
                        />
                    </HStack>
                ))
            )}
        </VStack>
    )
}

export const Sidebar = ({
    sidebarBg,
    borderColor,
    hoverBg,
    activeTab,
    collections,
    loadingCollections,
    environments,
    selectedEnvId,
    history,
    showHistory,
    setShowHistory,
    settingsModal,
    envModal,
    setEditingEnvId,
    setNewEnvName,
    setNewEnvVariables,
    loadRequest,
    deleteRequest,
    setSelectedEnvId,
    exportOpenApi,
    exportPostman,
    loadHistoryItem,
    clearHistory,
    deleteHistoryItem,
    onCloseSidebar,
    editCollectionModal,
    setEditingCollection,
}: SidebarContentProps): JSX.Element => {
    const tabBg = useColorModeValue('gray.100', 'gray.700')
    const activeTabColor = useColorModeValue('gray.800', 'white')
    const inactiveTabColor = useColorModeValue('gray.500', 'gray.400')
    const activeTabBg = useColorModeValue('white', 'gray.600')

    return (
        <VStack align="stretch" h="full" spacing={4} p={4} bg={sidebarBg} borderRight="1px" borderColor={borderColor}>
            <HStack justify="space-between">
                <HStack spacing={3}>
                    <Box
                        w={10}
                        h={10}
                        bgGradient="linear(to-br, purple.400, blue.500)"
                        borderRadius="xl"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        boxShadow="lg"
                    >
                        <FiZap color="white" size={20} fill="white" />
                    </Box>
                    <Heading size="md" bgGradient="linear(to-r, purple.500, blue.500)" bgClip="text" letterSpacing="tight">
                        Vibe Test
                    </Heading>
                </HStack>
                <HStack spacing={1}>
                    <Tooltip label="Settings">
                        <IconButton
                            aria-label="Settings"
                            icon={<FiSettings />}
                            size="sm"
                            variant="ghost"
                            onClick={settingsModal.onOpen}
                        />
                    </Tooltip>
                    {onCloseSidebar && (
                        <IconButton
                            aria-label="Close Sidebar"
                            icon={<FiX />}
                            size="sm"
                            variant="ghost"
                            display={{ base: 'flex', md: 'none' }}
                            onClick={onCloseSidebar}
                        />
                    )}
                </HStack>
            </HStack>

            <Divider borderColor={borderColor} />

            {/* Environments Selector */}
            <Box>
                <HStack justify="space-between" mb={2}>
                    <HStack spacing={2}>
                        <FiGlobe size={14} color="var(--chakra-colors-blue-400)" />
                        <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color="gray.500" letterSpacing="wider">
                            Environment
                        </Text>
                    </HStack>
                    {selectedEnvId && (
                        <IconButton
                            aria-label="Edit environment"
                            icon={<FiEdit2 />}
                            size="xs"
                            variant="ghost"
                            onClick={(): void => {
                                const env = environments.find(e => e.id === selectedEnvId)
                                if (env) {
                                    setEditingEnvId(env.id)
                                    setNewEnvName(env.name)
                                    setNewEnvVariables(env.variables)
                                    envModal.onOpen()
                                }
                            }}
                        />
                    )}
                </HStack>
                <Box
                    as="select"
                    w="full"
                    fontSize="sm"
                    p={2}
                    bg={useColorModeValue('gray.50', 'gray.900')}
                    border="1px"
                    borderColor={borderColor}
                    borderRadius="md"
                    value={selectedEnvId}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => setSelectedEnvId(e.target.value)}
                    sx={{ outline: 'none' }}
                >
                    <option value="">No environment</option>
                    {environments.map((env) => (
                        <option key={env.id} value={env.id}>
                            {env.name}
                        </option>
                    ))}
                </Box>
            </Box>

            {/* Navigation Tabs */}
            <HStack spacing={1} p={1} bg={tabBg} borderRadius="lg">
                <Button
                    size="sm"
                    flex="1"
                    variant="ghost"
                    bg={!showHistory ? activeTabBg : 'transparent'}
                    color={!showHistory ? activeTabColor : inactiveTabColor}
                    shadow={!showHistory ? 'sm' : 'none'}
                    onClick={(): void => setShowHistory(false)}
                    leftIcon={<FiLayers />}
                    fontSize="xs"
                >
                    Collections
                </Button>
                <Button
                    size="sm"
                    flex="1"
                    variant="ghost"
                    bg={showHistory ? activeTabBg : 'transparent'}
                    color={showHistory ? activeTabColor : inactiveTabColor}
                    shadow={showHistory ? 'sm' : 'none'}
                    onClick={(): void => setShowHistory(true)}
                    leftIcon={<FiClock />}
                    fontSize="xs"
                >
                    History
                </Button>
            </HStack>

            <Box flex="1" overflowY="auto" mx={-2} px={2}>
                {!showHistory ? (
                    <CollectionsList
                        collections={collections}
                        loadingCollections={loadingCollections}
                        hoverBg={hoverBg}
                        editCollectionModal={editCollectionModal}
                        setEditingCollection={setEditingCollection}
                        exportOpenApi={exportOpenApi}
                        exportPostman={exportPostman}
                        activeTab={activeTab}
                        loadRequest={loadRequest}
                        deleteRequest={deleteRequest}
                        onCloseSidebar={onCloseSidebar}
                    />
                ) : (
                    <HistoryList
                        history={history}
                        hoverBg={hoverBg}
                        clearHistory={clearHistory}
                        loadHistoryItem={loadHistoryItem}
                        deleteHistoryItem={deleteHistoryItem}
                        onCloseSidebar={onCloseSidebar}
                    />
                )}
            </Box>
        </VStack>
    )
}
