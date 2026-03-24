'use client'

import React, { useRef, useEffect, useState, useMemo } from 'react'
import { Box, useColorModeValue, InputProps, List, ListItem, Portal } from '@chakra-ui/react'

interface VariableInputProps extends Omit<InputProps, 'onChange'> {
    value: string
    onChange: (value: string) => void
    variables?: Record<string, string>
    placeholder?: string
}

function escapeHTML(str: string): string {
    return str.replace(/[&<>"']/g, (m) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }[m] || m))
}

export function VariableInput({
    value,
    onChange,
    variables = {},
    placeholder,
    ...rest
}: VariableInputProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [suggestionFilter, setSuggestionFilter] = useState('')
    const [cursorCoords, setCursorCoords] = useState({ top: 0, left: 0 })
    const [selectedIndex, setSelectedIndex] = useState(0)

    const inputColor = useColorModeValue('gray.800', 'white')
    const placeholderColor = useColorModeValue('gray.400', 'gray.600')
    const suggestionBg = useColorModeValue('white', 'gray.800')
    const suggestionHover = useColorModeValue('purple.50', 'purple.900')
    const suggestionBorder = useColorModeValue('gray.200', 'gray.600')

    const availableVars = useMemo(() => Object.keys(variables), [variables])
    const filteredVars = useMemo(() => {
        if (!suggestionFilter) return availableVars
        return availableVars.filter(v => v.toLowerCase().includes(suggestionFilter.toLowerCase()))
    }, [availableVars, suggestionFilter])

    const getDesiredHTML = (text: string, vars: Record<string, string>): string => {
        const regex = /\{\{([^}]+)\}\}/g
        let html = ''
        let lastIndex = 0
        let match
        while ((match = regex.exec(text)) !== null) {
            html += escapeHTML(text.slice(lastIndex, match.index))
            const varName = match[1]
            const isValid = !!vars[varName]
            const color = isValid ? '#3182ce' : '#e53e3e'
            const bg = isValid ? 'rgba(49,130,206,0.15)' : 'rgba(229,62,62,0.15)'
            html += `<span contenteditable="false" style="font-weight: 600; padding: 0px 2px; margin: 0px 1px; border-radius: 3px; color: ${color}; background: ${bg};">${escapeHTML(`{{${varName}}}`)}</span>`
            lastIndex = regex.lastIndex
        }
        html += escapeHTML(text.slice(lastIndex))
        return html
    }

    useEffect(() => {
        const el = ref.current
        if (!el) return

        const desiredHTML = getDesiredHTML(value, variables)
        
        // Use textContent check for plain text cases to avoid jitter
        if (!value.includes('{{')) {
            if (el.textContent === value) return
            el.textContent = value
            return
        }

        // For cases with variables, only update if the HTML actually changes
        // This is still slightly risky for cursor position but necessary for highlighting
        if (el.innerHTML === desiredHTML) return

        const selection = window.getSelection()
        let cursorOffset = 0

        if (selection && selection.rangeCount > 0) {
            try {
                const range = selection.getRangeAt(0)
                if (el.contains(range.endContainer)) {
                    const preRange = range.cloneRange()
                    preRange.selectNodeContents(el)
                    preRange.setEnd(range.endContainer, range.endOffset)
                    cursorOffset = preRange.toString().length
                }
            } catch (e) { /* ignore */ }
        }

        el.innerHTML = desiredHTML

        if (selection && cursorOffset > 0) {
            const range = document.createRange()
            let currentOffset = 0
            const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null)

            let found = false
            while (walker.nextNode()) {
                const node = walker.currentNode as Text
                const nextOffset = currentOffset + node.length
                if (cursorOffset <= nextOffset) {
                    range.setStart(node, Math.max(0, cursorOffset - currentOffset))
                    range.collapse(true)
                    found = true
                    break
                }
                currentOffset = nextOffset
            }

            if (found) {
                selection.removeAllRanges()
                selection.addRange(range)
            }
        }
    }, [value, variables])

    const handleInput = () => {
        if (!ref.current) return
        const text = ref.current.textContent || ''
        onChange(text)

        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0)
            const preRange = range.cloneRange()
            preRange.selectNodeContents(ref.current)
            preRange.setEnd(range.endContainer, range.endOffset)
            const textBeforeCursor = preRange.toString()

            const match = textBeforeCursor.match(/\{\{([^}]*)$/)
            if (match) {
                const rect = range.getBoundingClientRect()
                // If rect is 0,0 (not rendered yet), fall back to getting parent rect
                if (rect.width === 0) {
                    const parentRect = ref.current.getBoundingClientRect()
                    setCursorCoords({ top: parentRect.bottom + window.scrollY, left: parentRect.left + window.scrollX })
                } else {
                    setCursorCoords({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX })
                }
                setSuggestionFilter(match[1])
                setShowSuggestions(true)
                setSelectedIndex(0)
            } else {
                setShowSuggestions(false)
            }
        }
    }

    const insertVariable = (varName: string) => {
        const selection = window.getSelection()
        if (!selection || selection.rangeCount === 0 || !ref.current) return

        const range = selection.getRangeAt(0)
        const preRange = range.cloneRange()
        preRange.selectNodeContents(ref.current)
        preRange.setEnd(range.endContainer, range.endOffset)
        const textBefore = preRange.toString()
        const fullText = ref.current.textContent || ''
        
        const lastOpen = textBefore.lastIndexOf('{{')
        if (lastOpen === -1) return

        const before = fullText.slice(0, lastOpen)
        const after = fullText.slice(textBefore.length)

        onChange(`${before}{{${varName}}}${after}`)
        setShowSuggestions(false)
        
        // Re-focus after state update
        setTimeout(() => ref.current?.focus(), 10)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (showSuggestions) {
            if (e.key === 'ArrowDown') {
                e.preventDefault()
                setSelectedIndex(prev => (prev + 1) % filteredVars.length)
            } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setSelectedIndex(prev => (prev - 1 + filteredVars.length) % filteredVars.length)
            } else if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault()
                if (filteredVars[selectedIndex]) {
                    insertVariable(filteredVars[selectedIndex])
                }
            } else if (e.key === 'Escape') {
                setShowSuggestions(false)
            }
        }
        if (rest.onKeyDown) rest.onKeyDown(e as any)
    }

    return (
        <Box position="relative" w="full">
            <Box
                ref={ref}
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                whiteSpace="pre-wrap"
                outline="none"
                px={3}
                py={2}
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                color={inputColor}
                minH="40px"
                _focus={{
                    borderColor: 'purple.500',
                    boxShadow: '0 0 0 1px purple'
                }}
                sx={{
                    '&:empty:before': {
                        content: `"${placeholder || ''}"`,
                        color: placeholderColor
                    }
                }}
                {...rest}
            />

            {showSuggestions && filteredVars.length > 0 && (
                <Portal>
                    <List
                        position="absolute"
                        top={`${cursorCoords.top}px`}
                        left={`${cursorCoords.left}px`}
                        bg={suggestionBg}
                        border="1px solid"
                        borderColor={suggestionBorder}
                        borderRadius="md"
                        boxShadow="2xl"
                        zIndex={9999}
                        maxH="200px"
                        overflowY="auto"
                        minW="200px"
                        py={1}
                    >
                        {filteredVars.map((v, i) => (
                            <ListItem
                                key={v}
                                px={4}
                                py={2}
                                cursor="pointer"
                                bg={i === selectedIndex ? suggestionHover : 'transparent'}
                                _hover={{ bg: suggestionHover }}
                                onMouseDown={(e) => {
                                    e.preventDefault()
                                    insertVariable(v)
                                }}
                                fontSize="xs"
                                fontWeight="bold"
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                <Box as="span">{v}</Box>
                                <Box as="span" opacity={0.5} fontSize="10px" fontWeight="normal">Var</Box>
                            </ListItem>
                        ))}
                    </List>
                </Portal>
            )}
        </Box>
    )
}