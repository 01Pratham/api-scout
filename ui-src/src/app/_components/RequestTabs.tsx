'use client'

import { FiPlus, FiX } from 'react-icons/fi'

import {
    HStack,
    IconButton,
    Text,
    Badge,
    Tooltip
} from '@chakra-ui/react'

import type { RequestTab } from '../../types'

const METHOD_COLORS: Record<string, string> = {
    GET: 'green',
    POST: 'blue',
    PUT: 'orange',
    PATCH: 'purple',
    DELETE: 'red',
}

interface RequestTabsProps {
    tabs: RequestTab[]
    activeTabId: string
    setActiveTabId: (id: string) => void
    setTabs: (tabs: RequestTab[]) => void
    createNewTab: () => RequestTab
    cardBg: string
    hoverBg: string
    borderColor: string
}

export const RequestTabs = ({
    tabs,
    activeTabId,
    setActiveTabId,
    setTabs,
    createNewTab,
    cardBg,
    hoverBg,
    borderColor
}: RequestTabsProps): JSX.Element => {
    return (
        <HStack flex="1" overflowX="auto" spacing={1} sx={{
            '&::-webkit-scrollbar': { display: 'none' },
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
        }}>
            {tabs.map((tab) => (
                <HStack
                    key={tab.id}
                    px={3} py={2}
                    bg={tab.id === activeTabId ? cardBg : 'transparent'}
                    borderRadius="md"
                    cursor="pointer"
                    _hover={{ bg: tab.id === activeTabId ? cardBg : hoverBg }}
                    onClick={(): void => { setActiveTabId(tab.id) }}
                    minW="120px" maxW="200px"
                    position="relative"
                    border={tab.id === activeTabId ? '1px solid' : '1px solid transparent'}
                    borderColor={tab.id === activeTabId ? borderColor : 'transparent'}
                    transition="all 0.2s"
                >
                    <Badge colorScheme={METHOD_COLORS[tab.method] ?? 'gray'} fontSize="9px" variant="subtle">
                        {tab.method}
                    </Badge>
                    <Text fontSize="xs" noOfLines={1} flex="1" fontWeight={tab.id === activeTabId ? "semibold" : "normal"}>
                        {tab.url ? tab.url.replace(/^https?:\/\//, '').substring(0, 20) || tab.url : 'New Request'}
                    </Text>
                    {tabs.length > 1 && (
                        <IconButton
                            aria-label="Close tab"
                            icon={<FiX />}
                            size="xs"
                            variant="ghost"
                            onClick={(e): void => {
                                e.stopPropagation()
                                const newTabs = tabs.filter(t => t.id !== tab.id)
                                setTabs(newTabs)
                                if (tab.id === activeTabId && newTabs.length > 0) {
                                    setActiveTabId(newTabs[0].id)
                                }
                            }}
                            _hover={{ bg: 'red.400', color: 'white' }}
                        />
                    )}
                </HStack>
            ))}
            <Tooltip label="New tab">
                <IconButton
                    aria-label="New tab"
                    icon={<FiPlus />}
                    size="sm"
                    variant="ghost"
                    onClick={(): void => {
                        const newTab = createNewTab()
                        setTabs([...tabs, newTab])
                        setActiveTabId(newTab.id)
                    }}
                />
            </Tooltip>
        </HStack>
    )
}
