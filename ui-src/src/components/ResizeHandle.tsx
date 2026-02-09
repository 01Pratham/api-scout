'use client'

import { Separator as PanelResizeHandle } from "react-resizable-panels";

import { Box, useColorModeValue } from "@chakra-ui/react";

interface ResizeHandleProps {
    direction?: "horizontal" | "vertical";
    [key: string]: unknown;
}

export const ResizeHandle = ({
    direction = "horizontal",
    ...props
}: ResizeHandleProps): JSX.Element => {
    const dividerColor = useColorModeValue("gray.200", "gray.700");
    const hoverColor = useColorModeValue("blue.400", "blue.500");

    const style = (props.style as React.CSSProperties) ?? {};

    return (
        <PanelResizeHandle
            {...props}
            style={{
                width: direction === "horizontal" ? "1px" : "100%",
                height: direction === "vertical" ? "1px" : "100%",
                background: "transparent",
                outline: "none",
                zIndex: 10,
                cursor: direction === "horizontal" ? "col-resize" : "row-resize",
                ...style,
            }}
        >
            <Box
                h="full"
                w="full"
                bg={dividerColor}
                _hover={{ bg: hoverColor }}
                _active={{ bg: hoverColor }}
                transition="background-color 0.2s"
            />
        </PanelResizeHandle>
    );
}
