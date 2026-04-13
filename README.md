# CC 宠物系统搜索系统

![Dragon Legendary Companion](dragon.png)

## 原理

### 参数来源

| 参数 | 来源 | 说明 |
|------|------|------|
| `userId` | userID": "xxx" | `config.userID` |
| `SALT` | 固定值 `'friend-2026-401'` | 用于计算哈希 key |
| `哈希函数` | `Bun.hash` | Bun 运行时使用，其他环境用 FNV |

### 生成流程

```
userId + SALT → hashString() → mulberry32() → rollRarity() + pick(species/eye/hat)
```

### 物种与稀有度

**稀有度权重**：

- common (60%): rabbit, goose, blob, cat, dragon, octopus, owl, penguin, turtle, snail, ghost
- uncommon (25%): duck, axolotl
- rare (10%): capybara, cactus
- epic (4%): robot
- legendary (1%): mushroom, chonk

**眼睛** (6种): · ✦ × ◉ @ °

**帽子** (8种): none, crown, tophat, propeller, halo, wizard, beanie, tinyduck

### 关键代码

- `buddy/companion.ts:121` — `companionUserId()` 获取 userId
- `buddy/companion.ts:16-30` — `hashString()` 哈希函数
- `buddy/types.ts` — 物种和稀有度定义

---

## 搜索脚本用法

### 1. 搜索传说宠物

```bash
# 从指定 userId 开始搜索传说宠物
bun run find-legendary.ts <userId> [maxAttempts]

# 示例
bun run find-legendary.ts e4bb7ea8c6d1030a737ba46779efdb890ec959a5a000518c6b58cc5d8fcacff6b 1000
```

**参数说明**：
- `userId` - 起始 userId（可以任意给定）
- `maxAttempts` - 最大尝试次数（默认 100000）

**输出示例**：
```
起始 userId: e4bb7ea8c6d1030a737ba46779efdb890ec959a5a000518c6b58cc5d8fcacff6b

=== 搜索传说宠物 (使用 Bun.hash) ===
✓ 共找到 12 只传说宠物:

#1 userId: e4bb7ea8c6d1030a737ba46779efdb890ec959a5a000518c6b58cc5d8fcacff93
   物种: mushroom | 稀有度: legendary | 眼睛: ° | 帽子: beanie

#2 userId: e4bb7ea8c6d1030a737ba46779efdb890ec959a5a000518c6b58cc5d8fcacffe5
   物种: rabbit | 稀有度: legendary | 眼睛: ✦ | 帽子: none

#3 userId: e4bb7ea8c6d1030a737ba46779efdb890ec959a5a000518c6b58cc5d8fcacffea
   物种: goose | 稀有度: legendary | 眼睛: ◉ | 帽子: none

#4 userId: e4bb7ea8c6d1030a737ba46779efdb890ec959a5a000518c6b58cc5d8fcad0068
   物种: ghost | 稀有度: legendary | 眼睛: ✦ | 帽子: beanie

#5 userId: e4bb7ea8c6d1030a737ba46779efdb890ec959a5a000518c6b58cc5d8fcad00bd
   物种: duck | 稀有度: legendary | 眼睛: ° | 帽子: propeller

#6 userId: e4bb7ea8c6d1030a737ba46779efdb890ec959a5a000518c6b58cc5d8fcad0114
   物种: capybara | 稀有度: legendary | 眼睛: ◉ | 帽子: halo

#7 userId: e4bb7ea8c6d1030a737ba46779efdb890ec959a5a000518c6b58cc5d8fcad016d
   物种: axolotl | 稀有度: legendary | 眼睛: ◉ | 帽子: wizard

#8 userId: e4bb7ea8c6d1030a737ba46779efdb890ec959a5a000518c6b58cc5d8fcad0175
   物种: turtle | 稀有度: legendary | 眼睛: @ | 帽子: tophat

#9 userId: e4bb7ea8c6d1030a737ba46779efdb890ec959a5a000518c6b58cc5d8fcad01a8
   物种: owl | 稀有度: legendary | 眼睛: ✦ | 帽子: tophat

#10 userId: e4bb7ea8c6d1030a737ba46779efdb890ec959a5a000518c6b58cc5d8fcad02a2
   物种: ghost | 稀有度: legendary | 眼睛: ✦ | 帽子: halo

#11 userId: e4bb7ea8c6d1030a737ba46779efdb890ec959a5a000518c6b58cc5d8fcad02b8
   物种: ghost | 稀有度: legendary | 眼睛: ◉ | 帽子: crown

#12 userId: e4bb7ea8c6d1030a737ba46779efdb890ec959a5a000518c6b58cc5d8fcad030c
   物种: turtle | 稀有度: legendary | 眼睛: ◉ | 帽子: halo
```

### 2. 搜索指定物种

```bash
# 搜索特定物种和稀有度
bun run find-species.ts <species> <rarity> [baseId] [maxAttempts]

# 示例：搜索 duck (uncommon)
bun run find-species.ts dragon legendary 518c6b58cc5d8fcacff6be4bb7ea8c6d1030a737ba46779efdb890ec959a5a022 100000
```

**参数说明**：
- `species` - 物种名称（duck, rabbit, cat, dragon 等）
- `rarity` - 稀有度（common, uncommon, rare, epic, legendary）
- `baseId` - 起始 userId（可选）
- `maxAttempts` - 最大尝试次数（可选，默认 100000）

---

## 如何找到你的宠物

1. 打开 Claude Code 配置，找到  "userID": "xxx",
2. 用该 UUID 运行脚本查看宠物
3. 或者任意给一个 UUID，通过偏移找到传说宠物

## 测试结果

从不同起始 userId 搜索传说宠物：

| 起始 ID | 偏移次数 | 传说物种 | 眼睛 | 帽子 |
|---------|---------|---------|------|------|
| a000 | 70 | mushroom | ◉ | wizard |
| a022 | 36 | mushroom | ◉ | wizard |
| a100 | 82 | ghost | × | crown |
| a200 | 176 | cat | · | beanie |
| a300 | 228 | turtle | ° | crown |
| a400 | 26 | chonk | @ | none |
| a600 | 48 | rabbit | ✦ | beanie |
| a700 | 94 | cat | ✦ | tinyduck |
| a800 | 84 | blob | · | none |
| a900 | 75 | dragon | ✦ | crown |
| aa00 | 9 | snail | × | crown |
| ab00 | 10 | rabbit | @ | crown |
| ac00 | 33 | chonk | ° | tophat |