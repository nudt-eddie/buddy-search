/**
 * 反向搜索：找到能生成指定宠物的 userId
 */

const SALT = 'friend-2026-401'

function hashString(s: string): number {
  if (typeof Bun !== 'undefined') {
    return Number(BigInt(Bun.hash(s)) & 0xffffffffn)
  }
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

function generateCompanion(userId: string) {
  const key = userId + SALT
  const rng = mulberry32(hashString(key))
  return {
    rarity: rollRarity(rng),
    species: pick(rng, SPECIES),
    eye: pick(rng, EYES),
    hat: pick(rng, HATS),
  }
}

// 从给定的 userId 开始搜索
const TARGET_SPECIES = process.argv[2] || 'duck'
const TARGET_RARITY = process.argv[3] || 'uncommon'
const BASE_ID = process.argv[4] || '518c6b58cc5d8fcacff6be4bb7ea8c6d1030a737ba46779efdb890ec959a5a022'
const MAX = parseInt(process.argv[5] || '100000', 10)

console.log(`搜索目标: ${TARGET_SPECIES} (${TARGET_RARITY})`)
console.log(`起始 ID: ${BASE_ID}`)
console.log(`最大尝试: ${MAX}`)
console.log('')

// 首先显示起始宠物
const startResult = generateCompanion(BASE_ID)
console.log(`起始宠物: ${startResult.species} (${startResult.rarity})`)
console.log('')

console.log('=== 开始搜索 ===')

for (let i = 0; i < MAX; i++) {
  const newLast8 = (parseInt(BASE_ID.slice(-8), 16) + i).toString(16).padStart(8, '0')
  const candidateId = BASE_ID.slice(0, -8) + newLast8
  const result = generateCompanion(candidateId)

  if (result.species === TARGET_SPECIES && result.rarity === TARGET_RARITY) {
    console.log(`✓ 找到! 尝试次数: ${i + 1}`)
    console.log(`  userId: ${candidateId}`)
    console.log(`  物种: ${result.species}`)
    console.log(`  稀有度: ${result.rarity}`)
    console.log(`  眼睛: ${result.eye}`)
    console.log(`  帽子: ${result.hat}`)
    break
  }

  if ((i + 1) % 10000 === 0) {
    console.log(`进度: ${i + 1}...`)
  }
}