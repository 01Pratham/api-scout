'use client'

import { FiPlay, FiCode, FiSave, FiTrash2, FiPlus } from 'react-icons/fi'

import {
    Box,
    VStack,
    HStack,
    Select,
    Input,
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
} from '@chakra-ui/react'
import type { UseDisclosureReturn } from '@chakra-ui/react'

import { CodeEditor } from '../../components/CodeEditor'

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
    variables: string[]
}

const HeaderTable = ({
    headers,
    updateHeader,
    removeHeader,
    addHeaderRow,
    cardBg,
    borderColor,
}: Pick<RequestPanelProps, 'headers' | 'updateHeader' | 'removeHeader' | 'addHeaderRow' | 'cardBg' | 'borderColor'>): JSX.Element => (
    <VStack align="stretch" spacing={2}>
        {headers.map((header, index) => {
            const rowId = `header-row-${index}`
            return (
                <HStack key={rowId}>
                    <Input
                        placeholder="Header name"
                        value={header.key}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>): void => updateHeader(index, 'key', e.target.value)}
                        size="sm"
                        bg={cardBg}
                        borderColor={borderColor}
                    />
                    <Input
                        placeholder="Value"
                        value={header.value}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>): void => updateHeader(index, 'value', e.target.value)}
                        size="sm"
                        bg={cardBg}
                        borderColor={borderColor}
                    />
                    <IconButton
                        aria-label="Remove"
                        icon={<FiTrash2 />}
                        size="sm"
                        variant="ghost"
                        onClick={(): void => removeHeader(index)}
                        colorScheme="red"
                    />
                </HStack>
            )
        })}
        <Button size="sm" variant="ghost" leftIcon={<FiPlus />} onClick={addHeaderRow} alignSelf="flex-start">
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
    <VStack align="stretch" spacing={4}>
        <HStack>
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

        {bodyType === 'json' ? (
            <CodeEditor
                value={body}
                onChange={(v: string | undefined): void => { setBody(v ?? '') }}
                language="json"
                height="300px"
                variables={variables}
            />
        ) : (
            <VStack align="stretch" spacing={2}>
                {formData.map((field, index) => {
                    const rowId = `formdata-row-${index}`
                    return (
                        <HStack key={rowId}>
                            <Input
                                placeholder="Key"
                                value={field.key}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => updateFormData(index, 'key', e.target.value)}
                                size="sm"
                                bg={cardBg}
                                borderColor={borderColor}
                                w="150px"
                            />
                            <Select
                                size="sm"
                                w="100px"
                                value={field.type}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => updateFormData(index, 'type', e.target.value)}
                                bg={inputBg}
                                borderColor={borderColor}
                            >
                                <option value="text">Text</option>
                                <option value="file">File</option>
                            </Select>
                            {field.type === 'text' ? (
                                <Input
                                    placeholder="Value"
                                    value={field.value}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>): void => updateFormData(index, 'value', e.target.value)}
                                    size="sm"
                                    flex="1"
                                    bg={cardBg}
                                    borderColor={borderColor}
                                />
                            ) : (
                                <Input
                                    type="file"
                                    size="sm"
                                    flex="1"
                                    p={1}
                                    bg={cardBg}
                                    borderColor={borderColor}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>): void => { updateFormDataFile(index, e.target.files?.[0] ?? null) }}
                                />
                            )}
                            <IconButton
                                aria-label="Remove"
                                icon={<FiTrash2 />}
                                size="sm"
                                variant="ghost"
                                onClick={(): void => removeFormDataRow(index)}
                                colorScheme="red"
                            />
                        </HStack>
                    )
                })}
                <Button size="sm" variant="ghost" leftIcon={<FiPlus />} onClick={addFormDataRow} alignSelf="flex-start">
                    Add Field
                </Button>
            </VStack>
        )}
    </VStack>
)

export const RequestPanel = (props: RequestPanelProps): JSX.Element => {
    const {
        method, setMethod, url, setUrl, executeRequest, executing,
        snippetModal, currentRequest, updateRequest, collections,
        setSelectedCollectionId, requestModal, headers, updateHeader,
        removeHeader, addHeaderRow, bodyType, setBodyType, body,
        setBody, formData, updateFormData, updateFormDataFile,
        removeFormDataRow, addFormDataRow, inputBg, borderColor,
        cardBg, hoverBg, mutedText, preRequestScript,
        setPreRequestScript, postRequestScript, setPostRequestScript,
        variables
    } = props

    return (
        <Box p={4} borderBottom="1px" borderColor={borderColor} bg="transparent">
            <VStack align="stretch" spacing={4}>
                <HStack>
                    <Select
                        w="130px"
                        value={method}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => setMethod(e.target.value)}
                        bg={inputBg}
                        borderColor={borderColor}
                        fontWeight="bold"
                        borderRadius="lg"
                        _focus={{ borderColor: 'purple.400' }}
                    >
                        {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => <option key={m} value={m}>{m}</option>)}
                    </Select>
                    <Input
                        flex="1"
                        placeholder="Enter URL or paste {{variable}}"
                        value={url}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setUrl(e.target.value)}
                        bg={inputBg}
                        borderColor={borderColor}
                        borderRadius="lg"
                        _focus={{ borderColor: 'purple.400', boxShadow: '0 0 0 1px var(--chakra-colors-purple-400)' }}
                    />
                    <HStack spacing={2}>
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

                <Tabs size="sm" variant="enclosed" colorScheme="purple">
                    <TabList borderBottomColor={borderColor}>
                        <Tab _selected={{ color: 'purple.400', borderColor, borderBottomColor: cardBg }}>Headers</Tab>
                        <Tab _selected={{ color: 'purple.400', borderColor, borderBottomColor: cardBg }}>Body</Tab>
                        <Tab _selected={{ color: 'purple.400', borderColor, borderBottomColor: cardBg }}>Pre-req</Tab>
                        <Tab _selected={{ color: 'purple.400', borderColor, borderBottomColor: cardBg }}>Tests</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel px={0} pt={4}>
                            <HeaderTable {...{ headers, updateHeader, removeHeader, addHeaderRow, cardBg, borderColor }} />
                        </TabPanel>
                        <TabPanel px={0} pt={4}>
                            <BodySection {...{
                                bodyType, setBodyType, body, setBody, formData,
                                updateFormData, updateFormDataFile, removeFormDataRow,
                                addFormDataRow, inputBg, borderColor, cardBg, mutedText, variables
                            }} />
                        </TabPanel>
                        <TabPanel px={0} pt={4}>
                            <VStack align="stretch" spacing={2}>
                                <Text fontSize="xs" color={mutedText}>Scripts to run before the request.</Text>
                                <CodeEditor value={preRequestScript} onChange={(v): void => setPreRequestScript(v ?? '')} language="javascript" height="300px" variables={variables} />
                            </VStack>
                        </TabPanel>
                        <TabPanel px={0} pt={4}>
                            <VStack align="stretch" spacing={2}>
                                <Text fontSize="xs" color={mutedText}>Scripts to run after the response.</Text>
                                <CodeEditor value={postRequestScript} onChange={(v): void => setPostRequestScript(v ?? '')} language="javascript" height="300px" variables={variables} />
                            </VStack>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </VStack>
        </Box>
    )
}
