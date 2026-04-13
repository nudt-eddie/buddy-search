/**
 * 搜索算法：使用 Bun.hash (与实际代码一致)
 * 运行方式: bun run scripts/find-legendary.ts [起始userId] [最大搜索数]
 */

const SALT = 'friend-2026-401'

// 使用 Bun.hash，与实际代码一致
function hashString(s: string): number {
  if (typeof Bun !== 'undefined') {
    return Number(BigInt(Bun.hash(s)) & 0xffffffffn)
  }
  // 回退到 FNV
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'] as const
const RARITY_WEIGHTS = { common: 60, uncommon: 25, rare: 10, epic: 4, legendary: 1 } as const
const SPECIES = ['duck', 'goose', 'blob', 'cat', 'dragon', 'octopus', 'owl', 'penguin', 'turtle', 'snail', 'ghost', 'axolotl', 'capybara', 'cactus', 'robot', 'rabbit', 'mushroom', 'chonk'] as const
const EYES = ['·', '✦', '×', '◉', '@', '°'] as const
const HATS = ['none', 'crown', 'tophat', 'propeller', 'halo', 'wizard', 'beanie', 'tinyduck'] as const

function rollRarity(rng: () => number): string {
  const total = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0)
  let roll = rng() * total
  for (const rarity of RARITIES) {
    roll -= RARITY_WEIGHTS[rarity]
    if (roll < 0) return rarity
  }
  return 'common'
}

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]!
}

interface CompanionResult {
  rarity: string
  species: string
  eye: string
  hat: string
  userId: string
}

function generateCompanion(userId: string): CompanionResult {
  const key = userId + SALT
  const rng = mulberry32(hashString(key))
  return {
    rarity: rollRarity(rng),
    species: pick(rng, SPECIES),
    eye: pick(rng, EYES),
    hat: pick(rng, HATS),
    userId
  }
}

function searchByLast8Chars(startUserId: string, maxAttempts = 500): CompanionResult[] {
  const results: CompanionResult[] = []
  for (let i = 0; i < maxAttempts; i++) {
    const newLast8 = (parseInt(startUserId.slice(-8), 16) + i).toString(16).padStart(8, '0')
    const candidateId = startUserId.slice(0, -8) + newLast8
    const result = generateCompanion(candidateId)

    if (result.rarity === 'legendary') {
      results.push(result)
    }
  }
  return results
}

const startUserId = process.argv[2] || '518c6b58cc5d8fcacff6be4bb7ea8c6d1030a737ba46779efdb890ec959a5a022'
const maxAttempts = parseInt(process.argv[3] || '500', 10)

console.log(`起始 userId: ${startUserId}`)
console.log('')

// 显示起始位置的宠物
const startResult = generateCompanion(startUserId)
console.log(`起始宠物: ${startResult.species} (${startResult.rarity})`)
console.log('')

console.log('=== 搜索传说宠物 (使用 Bun.hash) ===')
const results = searchByLast8Chars(startUserId, maxAttempts)
if (results.length > 0) {
  console.log(`✓ 共找到 ${results.length} 只传说宠物:\n`)
  results.forEach((result, index) => {
    console.log(`#${index + 1} userId: ${result.userId}`)
    console.log(`   物种: ${result.species} | 稀有度: ${result.rarity} | 眼睛: ${result.eye} | 帽子: ${result.hat}`)
    console.log('')
  })
} else {
  console.log('未找到')
}