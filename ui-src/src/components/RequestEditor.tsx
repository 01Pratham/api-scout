'use client'

import {
    FiPlus,
    FiTrash2,
    FiSend,
    FiSave,
} from 'react-icons/fi'

import {
    Box,
    VStack,
    HStack,
    Button,
    Input,
    Select,
    Textarea,
    Text,
    IconButton,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    useColorModeValue,
    Badge,
} from '@chakra-ui/react'

import { METHOD_COLORS } from '../types'


import type { RequestTab } from '../types'

export type FormDataItem = {
    key: string
    value: string
    type: 'text' | 'file'
    file: File | null
}


interface RequestEditorProps {
    activeTab: RequestTab
    updateActiveTab: (updates: Partial<RequestTab>) => void
    executeRequest: () => Promise<void>
    saveRequest: () => Promise<void>
    inputBg: string
    borderColor: string
}

interface HeadersPanelProps {
    headers: { key: string; value: string }[]
    updateActiveTab: (updates: Partial<RequestTab>) => void
    inputBg: string
    borderColor: string
}

const HeadersPanel = ({ headers, updateActiveTab, inputBg, borderColor }: HeadersPanelProps): JSX.Element => {
    const addHeader = (): void => {
        updateActiveTab({ headers: [...headers, { key: '', value: '' }] })
    }

    const removeHeader = (index: number): void => {
        const newHeaders = [...headers]
        newHeaders.splice(index, 1)
        updateActiveTab({ headers: newHeaders.length ? newHeaders : [{ key: '', value: '' }] })
    }

    const updateHeader = (index: number, key: string, value: string): void => {
        const newHeaders = [...headers]
        newHeaders[index] = { key, value }
        updateActiveTab({ headers: newHeaders })
    }

    return (
        <VStack align="stretch" spacing={2}>
            {headers.map((header, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <HStack key={`${index}-${header.key}`} spacing={2}>
                    <Input
                        placeholder="Key"
                        size="xs"
                        value={header.key}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>): void => updateHeader(index, e.target.value, header.value)}
                        bg={inputBg}
                        borderColor={borderColor}
                    />
                    <Input
                        placeholder="Value"
                        size="xs"
                        value={header.value}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>): void => updateHeader(index, header.key, e.target.value)}
                        bg={inputBg}
                        borderColor={borderColor}
                    />
                    <IconButton
                        aria-label="Remove"
                        icon={<FiTrash2 />}
                        size="xs"
                        variant="ghost"
                        onClick={(): void => removeHeader(index)}
                    />
                </HStack>
            ))}
            <Button
                size="xs"
                variant="ghost"
                leftIcon={<FiPlus />}
                onClick={addHeader}
                alignSelf="start"
            >
                Add Header
            </Button>
        </VStack>
    )
}

interface BodyPanelProps {
    body: string
    bodyType: string
    formData: FormDataItem[]
    updateActiveTab: (updates: Partial<RequestTab>) => void
    inputBg: string
    borderColor: string
}

const BodyPanel = ({ body, bodyType, formData, updateActiveTab, inputBg, borderColor }: BodyPanelProps): JSX.Element => {
    const addFormData = (): void => {
        updateActiveTab({ formData: [...formData, { key: '', value: '', type: 'text', file: null }] })
    }

    const removeFormData = (index: number): void => {
        const newFormData = [...formData]
        newFormData.splice(index, 1)
        updateActiveTab({ formData: newFormData.length ? newFormData : [{ key: '', value: '', type: 'text', file: null }] })
    }

    const updateFormDataItem = (index: number, updates: Partial<{ key: string; value: string; type: 'text' | 'file'; file: File | null }>): void => {
        const newFormData = [...formData]
        newFormData[index] = { ...newFormData[index], ...updates }
        updateActiveTab({ formData: newFormData })
    }

    return (
        <VStack align="stretch" spacing={4}>
            <HStack>
                <Select
                    size="xs"
                    w="150px"
                    value={bodyType}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => updateActiveTab({ bodyType: e.target.value as 'json' | 'form-data' })}
                    bg={inputBg}
                    borderColor={borderColor}
                >
                    <option value="json">JSON</option>
                    <option value="form-data">Multipart Form-data</option>
                </Select>
                {bodyType === 'json' && (
                    <Badge colorScheme="purple" variant="subtle" fontSize="10px">JSON-IDENTIFIED</Badge>
                )}
                {bodyType === 'form-data' && (
                    <Badge colorScheme="blue" variant="subtle" fontSize="10px">FORM-DATA-IDENTIFIED</Badge>
                )}
            </HStack>

            {bodyType === 'json' ? (
                <Box borderRadius="md" border="1px" borderColor={borderColor} overflow="hidden">
                    <Textarea
                        value={body}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>): void => updateActiveTab({ body: e.target.value })}
                        placeholder='{ "key": "value" }'
                        fontFamily="monospace"
                        size="sm"
                        rows={10}
                        bg={inputBg}
                        border="none"
                        _focus={{ ring: 0 }}
                    />
                </Box>
            ) : (
                <VStack align="stretch" spacing={2}>
                    {formData.map((field, index) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <HStack key={`${index}-${field.key}`} spacing={2}>
                            <Input
                                placeholder="Key"
                                size="xs"
                                value={field.key}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => updateFormDataItem(index, { key: e.target.value })}
                                bg={inputBg}
                                borderColor={borderColor}
                            />
                            <Select
                                size="xs"
                                w="100px"
                                value={field.type}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => updateFormDataItem(index, { type: e.target.value as 'text' | 'file', value: '', file: null })}
                                bg={inputBg}
                                borderColor={borderColor}
                            >
                                <option value="text">Text</option>
                                <option value="file">File</option>
                            </Select>
                            {field.type === 'text' ? (
                                <Input
                                    placeholder="Value"
                                    size="xs"
                                    value={field.value}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>): void => updateFormDataItem(index, { value: e.target.value })}
                                    bg={inputBg}
                                    borderColor={borderColor}
                                />
                            ) : (
                                <Input
                                    type="file"
                                    size="xs"
                                    p={0}
                                    border="none"
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>): void => updateFormDataItem(index, { file: e.target.files?.[0] ?? null })}
                                />
                            )}
                            <IconButton
                                aria-label="Remove"
                                icon={<FiTrash2 />}
                                size="xs"
                                variant="ghost"
                                onClick={(): void => removeFormData(index)}
                            />
                        </HStack>
                    ))}
                    <Button
                        size="xs"
                        variant="ghost"
                        leftIcon={<FiPlus />}
                        onClick={addFormData}
                        alignSelf="start"
                    >
                        Add Form Field
                    </Button>
                </VStack>
            )}
        </VStack>
    )
}

export const RequestEditor = ({
    activeTab,
    updateActiveTab,
    executeRequest,
    saveRequest,
    inputBg,
    borderColor,
}: RequestEditorProps): JSX.Element => {
    const {
        method,
        url,
        headers,
        body,
        bodyType,
        executing,
    } = activeTab

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    const formData = (activeTab.formData || []) as FormDataItem[]

    const mutedText = useColorModeValue('gray.500', 'gray.400')

    return (
        <VStack align="stretch" spacing={4} h="full" p={4} overflowY="auto">
            {/* URL Bar */}
            <HStack spacing={2}>
                <Select
                    w="120px"
                    fontWeight="bold"
                    value={method}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => updateActiveTab({ method: e.target.value })}
                    bg={inputBg}
                    borderColor={borderColor}
                >
                    {Object.keys(METHOD_COLORS).map((m) => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                    <option value="HEAD">HEAD</option>
                    <option value="OPTIONS">OPTIONS</option>
                </Select>
                <Input
                    placeholder="Enter request URL"
                    value={url}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>): void => updateActiveTab({ url: e.target.value })}
                    bg={inputBg}
                    borderColor={borderColor}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>): void => { if (e.key === 'Enter') { void executeRequest() } }}
                />
                <Button
                    colorScheme="blue"
                    leftIcon={<FiSend />}
                    onClick={(): void => { void executeRequest() }}
                    isLoading={executing}
                    px={8}
                >
                    Send
                </Button>
                <IconButton
                    aria-label="Save"
                    icon={<FiSave />}
                    onClick={(): void => { void saveRequest() }}
                    variant="ghost"
                />
            </HStack>

            {/* Request Configuration */}
            <Tabs colorScheme="purple" size="sm" isLazy variant="line">
                <TabList borderColor={borderColor}>
                    <Tab fontWeight="semibold">Params</Tab>
                    <Tab fontWeight="semibold">Headers <Badge ml={1} borderRadius="full" colorScheme="gray">{headers.filter(h => h.key).length}</Badge></Tab>
                    <Tab fontWeight="semibold">Body</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel px={0} py={4}>
                        <Text color={mutedText} fontSize="xs">URL Parameters will be extracted from the URL automatically.</Text>
                    </TabPanel>

                    <TabPanel px={0} py={4}>
                        <HeadersPanel headers={headers} updateActiveTab={updateActiveTab} inputBg={inputBg} borderColor={borderColor} />
                    </TabPanel>

                    <TabPanel px={0} py={4}>
                        <BodyPanel body={body} bodyType={bodyType} formData={formData} updateActiveTab={updateActiveTab} inputBg={inputBg} borderColor={borderColor} />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </VStack>
    )
}
