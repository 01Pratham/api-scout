'use client'

import { Box, useColorModeValue } from '@chakra-ui/react'

interface JsonHighlighterProps {
    json: string
}

export const JsonHighlighter = ({ json }: JsonHighlighterProps): JSX.Element | null => {
    // Theme colors
    const colors = {
        key: useColorModeValue('purple.600', 'purple.300'),
        string: useColorModeValue('green.600', 'green.300'),
        number: useColorModeValue('orange.600', 'orange.300'),
        boolean: useColorModeValue('red.600', 'red.300'),
        null: useColorModeValue('gray.500', 'gray.400'),
    }

    if (!json) { return null }

    // Simple regex-based syntax highlighting using React components
    const highlight = (jsonStr: string): (JSX.Element | string)[] => {
        const regex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g
        const elements: (JSX.Element | string)[] = []
        let lastIndex = 0
        let match

        while ((match = regex.exec(jsonStr)) !== null) {
            // Add text before match
            if (match.index > lastIndex) {
                elements.push(jsonStr.substring(lastIndex, match.index))
            }

            const matchedText = match[0]
            let cls: keyof typeof colors = 'number'

            if (/^"/.test(matchedText)) {
                if (/:$/.test(matchedText)) {
                    cls = 'key'
                } else {
                    cls = 'string'
                }
            } else if (/true|false/.test(matchedText)) {
                cls = 'boolean'
            } else if (/null/.test(matchedText)) {
                cls = 'null'
            }

            elements.push(
                <Box as="span" key={match.index} color={colors[cls]}>
                    {matchedText}
                </Box>
            )

            lastIndex = regex.lastIndex
        }

        // Add remaining text
        if (lastIndex < jsonStr.length) {
            elements.push(jsonStr.substring(lastIndex))
        }

        return elements
    }

    return (
        <Box
            as="pre"
            m={0}
            whiteSpace="pre-wrap"
            fontFamily="monospace"
        >
            {highlight(json)}
        </Box>
    )
}

