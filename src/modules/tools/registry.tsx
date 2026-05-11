import type { ComponentType } from "react"

import { Base64EncoderTool } from "@/components/tools/widgets/base64-encoder-tool"
import { JsonFormatterTool } from "@/components/tools/widgets/json-formatter-tool"
import { TimestampConverterTool } from "@/components/tools/widgets/timestamp-converter-tool"
import { UuidGeneratorTool } from "@/components/tools/widgets/uuid-generator-tool"
import {
  toolComponentOptions,
  type ToolComponentKey,
} from "@/modules/tools/definitions"

type ToolRegistryItem = {
  key: ToolComponentKey
  label: string
  component: ComponentType
}

export const toolRegistry: ToolRegistryItem[] = [
  { ...toolComponentOptions[0], component: JsonFormatterTool },
  { ...toolComponentOptions[1], component: UuidGeneratorTool },
  { ...toolComponentOptions[2], component: Base64EncoderTool },
  { ...toolComponentOptions[3], component: TimestampConverterTool },
]

export function getToolRegistryItem(key: string | null | undefined) {
  return toolRegistry.find((tool) => tool.key === key) ?? null
}
