'use client'

import { FiPlay, FiCode, FiSave, FiTrash2, FiPlus } from 'react-icons/fi'

import {
    Box,
    Flex,
    VStack,
    HStack,
    Select,
    Button,
    Tooltip,
    IconButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Text,
    Checkbox,
} from '@chakra-ui/react'
import type { UseDisclosureReturn } from '@chakra-ui/react'

import { CodeEditor } from '../../components/CodeEditor'
import { VariableInput } from '../../components/VariableInput'

import type { Collection, RequestItem } from '../../types'

interface RequestPanelProps {
    method: string
    setMethod: (v: string) => void
    url: string
    setUrl: (v: string) => void
    executeRequest: () => Promise<void> | void
    executing: boolean
    snippetModal: UseDisclosureReturn
    currentRequest: RequestItem | null
    updateRequest: (forceOverwrite?: boolean) => Promise<void> | void
    collections: Collection[]
    setSelectedCollectionId: (v: string) => void
    requestModal: UseDisclosureReturn
    headers: Array<{ key: string; value: string }>
    updateHeader: (index: number, field: 'key' | 'value', value: string) => void
    removeHeader: (index: number) => void
    addHeaderRow: () => void
    queryParams: Array<{ key: string; value: string; enabled: boolean }>
    setQueryParams: (v: Array<{ key: string; value: string; enabled: boolean }>) => void
    bodyType: 'json' | 'form-data'
    setBodyType: (v: 'json' | 'form-data') => void
    body: string
    setBody: (v: string) => void
    formData: Array<{ key: string; value: string; type: 'text' | 'file'; file: File | null }>
    updateFormData: (index: number, field: 'key' | 'value' | 'type', value: string) => void
    updateFormDataFile: (index: number, file: File | null) => void
    removeFormDataRow: (index: number) => void
    addFormDataRow: () => void
    inputBg: string
    borderColor: string
    cardBg: string
    hoverBg: string
    mutedText: string
    preRequestScript: string
    setPreRequestScript: (v: string) => void
    postRequestScript: string
    setPostRequestScript: (v: string) => void
    variables: Record<string, string>
}

const ParamsTable = ({
    queryParams,
    setQueryParams,
    cardBg,
    borderColor,
    variables,
}: {
    queryParams: RequestPanelProps['queryParams']
    setQueryParams: RequestPanelProps['setQueryParams']
    cardBg: string
    borderColor: string
    variables: Record<string, string>
}): JSX.Element => (
    <VStack align="stretch" spacing={2} overflowY="auto" flex="1">
        <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={1} textTransform="uppercase">Query Parameters</Text>
        {queryParams.map((param, index) => (
            <HStack key={index} w="full" spacing={2}>
                <Checkbox 
                    isChecked={param.enabled} 
                    onChange={(e): void => {
                        const next = [...queryParams]
                        next[index].enabled = e.target.checked
                        setQueryParams(next)
                    }}
                    colorScheme="purple"
                    size="sm"
                />
                <VariableInput
                    placeholder="Key"
                    value={param.key}
                    onChange={(val): void => {
                        const next = [...queryParams]
                        next[index].key = val
                        setQueryParams(next)
                    }}
                    size="sm"
                    flex="1"
                    bg={cardBg}
                    borderColor={borderColor}
                    variables={variables}
                />
                <VariableInput
                    placeholder="Value"
                    value={param.value}
                    onChange={(val): void => {
                        const next = [...queryParams]
                        next[index].value = val
                        setQueryParams(next)
                    }}
                    size="sm"
                    flex="1"
                    bg={cardBg}
                    borderColor={borderColor}
                    variables={variables}
                />
                <IconButton
                    aria-label="Remove"
                    icon={<FiTrash2 />}
                    size="sm"
                    variant="ghost"
                    onClick={(): void => {
                        if (queryParams.length > 1) {
                            setQueryParams(queryParams.filter((_, i) => i !== index))
                        }
                    }}
                    colorScheme="red"
                    flexShrink={0}
                />
            </HStack>
        ))}
        <Button size="sm" variant="ghost" leftIcon={<FiPlus />} onClick={(): void => setQueryParams([...queryParams, { key: '', value: '', enabled: true }])} alignSelf="flex-start" flexShrink={0}>
            Add Param
        </Button>
    </VStack>
)

const HeaderTable = ({
    headers,
    updateHeader,
    removeHeader,
    addHeaderRow,
    cardBg,
    borderColor,
    variables,
}: Pick<RequestPanelProps, 'headers' | 'updateHeader' | 'removeHeader' | 'addHeaderRow' | 'cardBg' | 'borderColor' | 'variables'>): JSX.Element => (
    <VStack align="stretch" spacing={2} overflowY="auto" flex="1">
        <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={1} textTransform="uppercase">Headers</Text>
        {headers.map((header, index) => {
            const rowId = `header-row-${index}`
            return (
                <HStack key={rowId} w="full" spacing={2}>
                    <VariableInput
                        placeholder="Header Key"
                        value={header.key}
                        onChange={(val): void => updateHeader(index, 'key', val)}
                        size="sm"
                        flex="1"
                        bg={cardBg}
                        borderColor={borderColor}
                        variables={variables}
                    />
                    <VariableInput
                        placeholder="Value"
                        value={header.value}
                        onChange={(val): void => updateHeader(index, 'value', val)}
                        size="sm"
                        flex="1"
                        bg={cardBg}
                        borderColor={borderColor}
                        variables={variables}
                    />
                    <IconButton
                        aria-label="Remove"
                        icon={<FiTrash2 />}
                        size="sm"
                        variant="ghost"
                        onClick={(): void => removeHeader(index)}
                        colorScheme="red"
                        flexShrink={0}
                    />
                </HStack>
            )
        })}
        <Button size="sm" variant="ghost" leftIcon={<FiPlus />} onClick={addHeaderRow} alignSelf="flex-start" flexShrink={0}>
            Add Header
        </Button>
    </VStack>
)

const BodySection = ({
    bodyType,
    setBodyType,
    body,
    setBody,
    formData,
    updateFormData,
    updateFormDataFile,
    removeFormDataRow,
    addFormDataRow,
    inputBg,
    borderColor,
    cardBg,
    mutedText,
    variables,
}: Pick<RequestPanelProps, 'bodyType' | 'setBodyType' | 'body' | 'setBody' | 'formData' | 'updateFormData' | 'updateFormDataFile' | 'removeFormDataRow' | 'addFormDataRow' | 'inputBg' | 'borderColor' | 'cardBg' | 'mutedText' | 'variables'>): JSX.Element => (
    <Flex direction="column" h="full" w="full" gap={4}>
        <HStack flexShrink={0}>
            <Text fontSize="xs" fontWeight="bold" color={mutedText} textTransform="uppercase">Body Type:</Text>
            <Select
                size="sm"
                w="150px"
                value={bodyType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => setBodyType(e.target.value as 'json' | 'form-data')}
                bg={inputBg}
                borderColor={borderColor}
            >
                <option value="json">JSON</option>
                <option value="form-data">form-data</option>
            </Select>
        </HStack>

        <Box flex="1" overflow="hidden">
            {bodyType === 'json' ? (
                <CodeEditor
                    value={body}
                    onChange={(v: string | undefined): void => { setBody(v ?? '') }}
                    language="json"
                    height="100%"
                    variables={variables}
                />
            ) : (
                <VStack align="stretch" spacing={2} overflowY="auto" h="full" w="full">
                    {formData.map((field, index) => {
                        const rowId = `formdata-row-${index}`
                        return (
                            <HStack key={rowId} w="full" spacing={2}>
                                <VariableInput
                                    placeholder="Key"
                                    value={field.key}
                                    onChange={(val): void => updateFormData(index, 'key', val)}
                                    size="sm"
                                    flex="1"
                                    bg={cardBg}
                                    borderColor={borderColor}
                                    variables={variables}
                                />
                                <Select
                                    size="sm"
                                    w="90px"
                                    value={field.type}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => updateFormData(index, 'type', e.target.value)}
                                    bg={inputBg}
                                    borderColor={borderColor}
                                    flexShrink={0}
                                >
                                    <option value="text">TEXT</option>
                                    <option value="file">FILE</option>
                                </Select>
                                {field.type === 'text' ? (
                                    <VariableInput
                                        placeholder="Value"
                                        value={field.value}
                                        onChange={(val): void => updateFormData(index, 'value', val)}
                                        size="sm"
                                        flex="1"
                                        bg={cardBg}
                                        borderColor={borderColor}
                                        variables={variables}
                                    />
                                ) : (
                                    <Box flex="1">
                                        <VariableInput
                                            type="file"
                                            size="sm"
                                            w="full"
                                            px={1}
                                            py={0.5}
                                            bg={cardBg}
                                            borderColor={borderColor}
                                            value={""} 
                                            onChange={(): void => {}} 
                                            onInput={(e: any): void => { updateFormDataFile(index, e.target.files?.[0] ?? null) }}
                                        />
                                    </Box>
                                )}
                                <IconButton
                                    aria-label="Remove"
                                    icon={<FiTrash2 />}
                                    size="sm"
                                    variant="ghost"
                                    onClick={(): void => removeFormDataRow(index)}
                                    colorScheme="red"
                                    flexShrink={0}
                                />
                            </HStack>
                        )
                    })}
                    <Button size="sm" variant="ghost" leftIcon={<FiPlus />} onClick={addFormDataRow} alignSelf="flex-start" flexShrink={0}>
                        Add Field
                    </Button>
                </VStack>
            )}
        </Box>
    </Flex>
)

export const RequestPanel = (props: RequestPanelProps): JSX.Element => {
    const {
        method, setMethod, url, setUrl, executeRequest, executing,
        snippetModal, currentRequest, updateRequest, collections,
        setSelectedCollectionId, requestModal, headers, updateHeader,
        removeHeader, addHeaderRow, queryParams, setQueryParams,
        bodyType, setBodyType, body, setBody, formData, updateFormData,
        updateFormDataFile, removeFormDataRow, addFormDataRow, inputBg,
        borderColor, cardBg, hoverBg, mutedText, preRequestScript,
        setPreRequestScript, postRequestScript, setPostRequestScript,
        variables
    } = props

    return (
        <Flex direction="column" h="full" w="full" overflow="hidden">
            {/* Action Bar (Method + URL + Buttons) */}
            <Box p={4} borderBottom="1px" borderColor={borderColor} bg="transparent" flexShrink={0}>
                <VStack align="stretch" spacing={4}>
                    <HStack w="full">
                        <Select
                            w="130px"
                            value={method}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => setMethod(e.target.value)}
                            bg={inputBg}
                            borderColor={borderColor}
                            fontWeight="bold"
                            borderRadius="lg"
                            _focus={{ borderColor: 'purple.400' }}
                            flexShrink={0}
                        >
                            {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => <option key={m} value={m}>{m}</option>)}
                        </Select>
                        <VariableInput
                            flex="1"
                            placeholder="Enter URL or paste {{variable}}"
                            value={url}
                            onChange={(val): void => setUrl(val)}
                            bg={inputBg}
                            borderColor={borderColor}
                            borderRadius="lg"
                            _focus={{ borderColor: 'purple.400', boxShadow: '0 0 0 1px var(--chakra-colors-purple-400)' }}
                            variables={variables}
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>): void => { if (e.key === 'Enter') { void executeRequest() } }}
                        />
                        <HStack spacing={2} flexShrink={0}>
                            <Button
                                leftIcon={<FiPlay />}
                                onClick={(): void => { void executeRequest() }}
                                isLoading={executing}
                                loadingText="Sending"
                                bgGradient="linear(to-r, purple.500, blue.500)"
                                color="white"
                                _hover={{ bgGradient: 'linear(to-r, purple.600, blue.600)', transform: 'translateY(-1px)', boxShadow: 'lg' }}
                                transition="all 0.2s"
                                px={6}
                            >
                                Send
                            </Button>
                            <Tooltip label="Code Snippet">
                                <IconButton aria-label="Code snippet" icon={<FiCode />} variant="outline" onClick={snippetModal.onOpen} borderColor={borderColor} />
                            </Tooltip>
                            {currentRequest ? (
                                <Button leftIcon={<FiSave />} variant="outline" onClick={(): void => { void updateRequest() }} borderColor={borderColor}>Update</Button>
                            ) : (
                                <Menu>
                                    <MenuButton as={Button} leftIcon={<FiSave />} variant="outline" borderColor={borderColor}>Save</MenuButton>
                                    <MenuList bg={cardBg} borderColor={borderColor}>
                                        {collections.map((col) => (
                                            <MenuItem
                                                key={col.id}
                                                bg={cardBg}
                                                _hover={{ bg: hoverBg }}
                                                onClick={(): void => {
                                                    setSelectedCollectionId(col.id)
                                                    requestModal.onOpen()
                                                }}
                                            >
                                                {col.name}
                                            </MenuItem>
                                        ))}
                                    </MenuList>
                                </Menu>
                            )}
                        </HStack>
                    </HStack>
                </VStack>
            </Box>

            {/* Config Tabs (Params, Headers, Body, Scripts) */}
            <Flex flex="1" direction="column" overflow="hidden">
                <Tabs size="sm" variant="enclosed" colorScheme="purple" display="flex" flexDirection="column" h="full">
                    <TabList borderBottomColor={borderColor} px={4} pt={2} flexShrink={0}>
                        <Tab _selected={{ color: 'purple.400', borderColor, borderBottomColor: cardBg }}>Params</Tab>
                        <Tab _selected={{ color: 'purple.400', borderColor, borderBottomColor: cardBg }}>Headers</Tab>
                        <Tab _selected={{ color: 'purple.400', borderColor, borderBottomColor: cardBg }}>Body</Tab>
                        <Tab _selected={{ color: 'purple.400', borderColor, borderBottomColor: cardBg }}>Pre-req</Tab>
                        <Tab _selected={{ color: 'purple.400', borderColor, borderBottomColor: cardBg }}>Tests</Tab>
                    </TabList>
                    
                    <TabPanels flex="1" overflow="hidden">
                        {/* Params */}
                        <TabPanel px={4} py={4} h="full">
                            <ParamsTable {...{ queryParams, setQueryParams, cardBg, borderColor, variables }} />
                        </TabPanel>

                        {/* Headers */}
                        <TabPanel px={4} py={4} h="full">
                            <HeaderTable {...{ headers, updateHeader, removeHeader, addHeaderRow, cardBg, borderColor, variables }} />
                        </TabPanel>
                        
                        {/* Body */}
                        <TabPanel px={4} py={4} h="full">
                            <BodySection {...{
                                bodyType, setBodyType, body, setBody, formData,
                                updateFormData, updateFormDataFile, removeFormDataRow,
                                addFormDataRow, inputBg, borderColor, cardBg, mutedText, variables
                            }} />
                        </TabPanel>
                        
                        {/* Pre-req */}
                        <TabPanel px={4} py={4} h="full">
                            <Flex direction="column" h="full" gap={2}>
                                <Text fontSize="xs" color={mutedText} flexShrink={0}>Scripts to run before the request.</Text>
                                <Box flex="1" overflow="hidden">
                                    <CodeEditor value={preRequestScript} onChange={(v): void => setPreRequestScript(v ?? '')} language="javascript" height="100%" variables={variables} />
                                </Box>
                            </Flex>
                        </TabPanel>
                        
                        {/* Tests */}
                        <TabPanel px={4} py={4} h="full">
                            <Flex direction="column" h="full" gap={2}>
                                <Text fontSize="xs" color={mutedText} flexShrink={0}>Scripts to run after the response.</Text>
                                <Box flex="1" overflow="hidden">
                                    <CodeEditor value={postRequestScript} onChange={(v): void => setPostRequestScript(v ?? '')} language="javascript" height="100%" variables={variables} />
                                </Box>
                            </Flex>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Flex>
        </Flex>
    )
}
