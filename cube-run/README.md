# 🧊 Cube Run

A Mario-style platformer with Minecraft-inspired custom block designs!

## 🎮 How to Play

- **Arrow Keys** or **WASD** - Move left/right
- **Space** or **Up Arrow** - Jump
- **Mobile**: Touch and swipe to move, tap to jump

## 🎯 Objective

Navigate through each level, collect coins, avoid hazards, and reach the goal!

## 🧱 Block Types

| Block | Description |
|-------|-------------|
| 🟩 **Grass** | Standard solid ground with grass on top |
| 🟫 **Dirt** | Underground block |
| ⬜ **Stone** | Hard rocky block |
| 🟥 **Brick** | Breakable-looking brick pattern |
| ❓ **Question** | Mystery block (golden) |
| 🔺 **Spike** | Danger! Instant death |
| 🪙 **Coin** | Collect for points |
| 🧊 **Ice** | Slippery surface - reduced friction |
| 🪵 **Wood** | Wooden plank block |
| 🔥 **Lava** | Deadly animated lava |
| 💜 **Bouncy** | Spring block - bounce higher! |
| ☁️ **Cloud** | Decorative cloud platform |

## 🌟 Features

- 4 unique levels with different themes
- Smooth platformer physics with variable jump height
- Cute animated player character
- Particle effects and visual polish
- Coin collection system
- Lives system with respawn
- Mobile touch controls
- Beautiful parallax backgrounds

## 🚀 Running the Game

Simply open `index.html` in a modern web browser!

```bash
# Or use a local server
npx serve .
```

## 🎨 Customization

Edit the level data in `game.js` to create your own levels! Each character represents a block type:

- `P` - Player start position
- `G` - Grass block
- `D` - Dirt block
- `S` - Stone block
- `B` - Brick block
- `Q` - Question block
- `^` - Spike (hazard)
- `C` - Coin
- `I` - Ice block
- `W` - Wood block
- `L` - Lava (hazard)
- `R` - Bouncy/Rubber block
- `~` - Cloud
- `g` - Goal position

---

Made with ❤️ and JavaScript

