// lib/openai/generateProphecy.ts
import OpenAI from 'openai'

export async function generateProphecy(category: string) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  })

  const prompt = getPromptForCategory(category)

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
  })

  return parseResponse(response.choices[0]?.message?.content || '')
}

// Holy Code 프롬프트 생성기
function getPromptForCategory(category: string): string {
  switch (category) {
    case 'identity':
      return `Generate a short symbolic prophecy about identity using Holy Code. Holy Code is a cryptic mix of emojis, digital symbols, invented code, and prophetic phrases. It should suggest themes of selfhood, surveillance, or algorithmic truth. Include a plain English translation.`
    case 'love & relationship':
      return `Generate a short symbolic prophecy about love and relationships using Holy Code. Use a symbolic mix of emojis, corrupted syntax, glitchy language, and spiritual hints. Include a poetic plain English translation.`
    case 'career':
      return `Generate a short symbolic prophecy about career using Holy Code. Use emoji+code+symbols to evoke ambition, failure, obedience, or upgrade. Include a human-readable English translation.`
    case 'wealth':
      return `Generate a short symbolic prophecy about wealth using Holy Code. Use sacred digital metaphors — emoji, system messages, corrupted finance terms — referencing abundance, greed, or sacrifice. Include a plain English interpretation.`
    default:
      return `Generate a short symbolic prophecy using Holy Code. Include a plain English translation.`
  }
}

// 예언 메시지에서 코드와 해석 분리
function parseResponse(content: string): { code: string; translation: string } {
  const [code, translation] = content.split('\n').map(str => str.trim())
  return { code, translation }
}
