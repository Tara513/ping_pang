export const OPENAI_API_KEY_ENV = "OPENAI_API_KEY"
export const OPENAI_MODEL_ENV = "OPENAI_MODEL"
export const DEFAULT_OPENAI_MODEL = "gpt-4o-mini"

export interface OpenAiChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface OpenAiChatCompletionOptions {
  messages: OpenAiChatMessage[]
  json?: boolean
  maxCompletionTokens?: number
  temperature?: number
}

export function getOpenAiApiKey() {
  const apiKey = process.env[OPENAI_API_KEY_ENV]
  return typeof apiKey === "string" && apiKey.trim() !== "" ? apiKey.trim() : null
}

export function getOpenAiModel() {
  const model = process.env[OPENAI_MODEL_ENV]
  return typeof model === "string" && model.trim() !== "" ? model.trim() : DEFAULT_OPENAI_MODEL
}

export function getAiNotConfiguredPayload() {
  return {
    error: "IA non configurée",
    configured: false,
    missing_env: OPENAI_API_KEY_ENV,
  }
}

function extractOpenAiContent(payload: unknown) {
  const record = payload as {
    choices?: Array<{
      message?: {
        content?: unknown
      }
    }>
  }
  const content = record.choices?.[0]?.message?.content

  if (typeof content === "string") return content
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part
        if (typeof part === "object" && part !== null && "text" in part) {
          const text = (part as { text?: unknown }).text
          return typeof text === "string" ? text : ""
        }
        return ""
      })
      .join("")
  }

  return null
}

export async function createOpenAiChatCompletion({
  messages,
  json = false,
  maxCompletionTokens,
  temperature,
}: OpenAiChatCompletionOptions) {
  const apiKey = getOpenAiApiKey()
  if (!apiKey) return { configured: false as const, content: null, model: getOpenAiModel() }

  const model = getOpenAiModel()
  const body: Record<string, unknown> = {
    model,
    messages,
  }

  if (json) body.response_format = { type: "json_object" }
  if (typeof maxCompletionTokens === "number") body.max_completion_tokens = maxCompletionTokens
  if (typeof temperature === "number") body.temperature = temperature

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null)
    const message =
      typeof errorPayload?.error?.message === "string"
        ? errorPayload.error.message
        : "Erreur API OpenAI"
    throw new Error(message)
  }

  const payload = await response.json()
  const content = extractOpenAiContent(payload)
  if (!content) throw new Error("Réponse IA invalide")

  return { configured: true as const, content, model }
}
