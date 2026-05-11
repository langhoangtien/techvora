export type ToolComponentKey =
  | "json-formatter"
  | "uuid-generator"
  | "base64-encoder"
  | "timestamp-converter"

export const toolComponentOptions: { key: ToolComponentKey; label: string }[] = [
  { key: "json-formatter", label: "JSON Formatter" },
  { key: "uuid-generator", label: "UUID Generator" },
  { key: "base64-encoder", label: "Base64 Encoder / Decoder" },
  { key: "timestamp-converter", label: "Timestamp Converter" },
]

export const toolComponentKeys = toolComponentOptions.map((tool) => tool.key)
