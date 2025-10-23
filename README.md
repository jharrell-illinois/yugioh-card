<h1 align="center">🎉 Yugioh Card - Translation & TCG Optimization Project 🎉</h1>
<p align="center">
  <a href="https://www.npmjs.org/package/yugioh-card">
    <img src="https://img.shields.io/npm/v/yugioh-card.svg">
  </a>
  <a href="https://www.npmjs.org/package/yugioh-card">
    <img src="https://img.shields.io/npm/dt/yugioh-card.svg">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg">
  </a>
</p>

<p align="center">A tool to use HTML Canvas to render YuGiOh cards</p>

<p align="center">
  <img src="src/assets/image/banner.jpg">
</p>

<s>5</s> 3 Supported Card Types：🚀🚀🚀

- 1️⃣ YuGiOh TCG
- <s>2️⃣ Speed Duel</s> - not supporting this, sorry
- 3️⃣ YuGiOh TCG - Card Back
- 4️⃣ Field Center Card
- <s>5️⃣ Anime OCG Style</s> - also not supporting this, sorry

## 🚩 Online Demo

[Original Chinese Language Demo](https://kooriookami.github.io/yugioh-card/)

TCG-En Demo Coming Soon

## ⚡ Quick Start

These instructions only apply to the original package [by kooriookami](https://www.npmjs.org/package/yugioh-card)

`npm i yugioh-card`

```js
// Module exports: YugiohCard, RushDuelCard, YugiohBackCard, FieldCenterCard, YugiohSeries2Card
import { YugiohCard } from 'yugioh-card';

const card = new YugiohCard({
  view: 'xxx', // div container
  data: {
    ..., // See Data Properties below
  },
  resourcePath: 'xxx', // Static resource path, copy the src/assets/yugioh-card folder to your project or server
});

// For more export parameters, please refer to https://www.leaferjs.com/ui/guide/basic/export.html
// T/N: Documentation for leaferjs is entirely in Chinese, no idea when English documentation is coming
card.leafer.export('xxx.png', {
  screenshot: true,
  pixelRatio: devicePixelRatio,
});
```

## 🔎 Example Code

[Interactive Vue App](src/components/YugiohCard.vue)

## 📖 Data Properties

### YuGiOh

|         Key         |            Description             |      Type      |                                                   Optional Values                                                   |                                                     Remarks                                                      |   Default Value   |
| :-----------------: | :--------------------------------: | :------------: | :-----------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------: | :---------------: |
|      language       |           Card Language            |      Enum      |                                     'sc' / 'tc' / 'jp' / 'kr' / 'en' / 'astral'                                     |                         Simp. Chinese, Trad. Chinese, Japanese, Korean, English, Astral                          | <s>'sc'</s> 'en'  |
|        font         |           Font Override            |      Enum      |                                           (empty) / 'custom1' / 'custom2'                                           |                             Default / (T/N: these are CN fonts don't bother with it)                             |      (empty)      |
|        name         |             Card Name              |     String     |                                                          —                                                          |                                                        —                                                         |      (empty)      |
|        color        |          Card Name color           |     String     |                                                any css color String                                                 |                      (T/N: don't use this field unless you want transparent name for holos)                      |      (empty)      |
|        align        |        Card Name alignment         |      Enum      |                                             'left' / 'center' / 'right'                                             |                                      Left Align, Center Align, Right Align                                       |      'left'       |
|      gradient       |      Card Name color gradient      |    boolean     |                                                    True / False                                                     |                                                        —                                                         |       false       |
|   gradientColor1    |          Gradient color 1          |     string     |                                                 rgb hex color code                                                  |                                                        —                                                         |     '#999999'     |
|   gradientColor2    |          Gradient color 2          |     string     |                                                 rgb hex color code                                                  |                                                        —                                                         |     '#ffffff'     |
|        type         |           Card Supertype           |      Enum      |                                      'monster' / 'spell' / 'trap' / 'pendulum'                                      |                                    Monster / Spell / Trap / Pendulum Monster                                     |     'monster'     |
|      attribute      |         Monster Attribute          |      Enum      |                     'dark' / 'light' / 'earth' / 'water' / 'fire' / 'wind' / 'divine' / (empty)                     |                                                        —                                                         |      'dark'       |
|        icon         |         Spell/Trap Subtype         |      Enum      |                       'equip' / 'field' / 'quick-play' / 'ritual' / 'continuous' / 'counter'                        |                                      (T/N: spell and trap share continuous)                                      |      (empty)      |
|        image        |            Card artwork            |     String     |                                                     url string                                                      |                                (T/N: YgoProDeck card db has cropped card images)                                 |      (empty)      |
|      cardType       |        Monster Primary Type        |      Enum      |                  'normal' / 'effect' / 'ritual' / 'fusion' / 'synchro' / 'xyz' / 'link' / 'token'                   |                                                        —                                                         |     'normal'      |
|    pendulumType     |   Pendulum Monster Primary Type    |      Enum      | 'normal-pendulum' / 'effect-pendulum' / 'ritual-pendulum' / 'fusion-pendulum' / 'synchro-pendulum' / 'xyz-pendulum' |                                                        —                                                         | 'normal-pendulum' |
|        level        |          Monster's Level           |     Number     |                                                          —                                                          |                                                        —                                                         |         0         |
|        rank         |         XYZ Monster's Rank         |     Number     |                                                          —                                                          |                                                        —                                                         |         0         |
|    pendulumScale    |           Pendulum Scale           |     Number     |                                                          —                                                          |                                                        —                                                         |         0         |
| pendulumDescription |     Pendulum Scale effect text     |     String     |                                                          —                                                          |                                                        —                                                         |      (empty)      |
|     monsterType     |         Monster Type/race          |     String     |                                                          —                                                          |                                                        —                                                         |      (empty)      |
|       atkBar        |    Show ATK/DEF/Link Rating bar    |    Boolean     |                                                          —                                                          |                                   (T/N: this is ignored for non-monster cards)                                   |       True        |
|         atk         |              ATK stat              |     Number     |                                                          —                                                          |                                              Use -1 for ?，-2 for ∞                                              |         0         |
|         def         |              DEF stat              |     Number     |                                                          —                                                          |                                              Use -1 for ?，-2 for ∞                                              |         0         |
|      arrowList      |       Link Arrows to display       |     Array      |                                              [1, 2, 3, 4, 5, 6, 7, 8]                                               | [Top, Top-Right, Right, Bottom-Right, Bottom, Bottom-Left, Left, Top-Left] (T/N: Decode Talker would be [1,4,6]) | [] (empty array)  |
|     description     |        Monster Effect Text         |     String     |                                                          —                                                          |                                                        —                                                         |      (empty)      |
|  firstLineCompress  | Compress first line of effect text |    Boolean     |                                                          —                                                          |                               (T/N: for things like extra deck monster materials)                                |       false       |
|  descriptionAlign   |      Center align effect text      |    Boolean     |                                                          —                                                          |                                        (T/N: I wouldn't ever change this)                                        |       false       |
|   descriptionZoom   |  Scale Effect box size / spacing   | Number (float) |                                                          —                                                          |                                          (T/N: best to stay at default)                                          |         1         |
|  descriptionWeight  |      Effect text font weight       |     Number     |                                                          —                                                          |                                  (T/N: adjust this if you want text more bold)                                   |         0         |
|       package       |        Set ID (MP25-EN001)         |     String     |                                                          —                                                          |                                                        —                                                         |        ''         |
|      password       |              Passcode              |     String     |                                                          —                                                          |                                  (T/N: the number in the bottom left of a card)                                  |        ''         |
|      copyright      |           Copyright text           |      Enum      |                                             'sc' / 'jp' / 'en' / 'en2'                                              |                             Simp. Chinese, Japanese, English (1996), English (2020)                              |        ''         |
|        laser        |         Eye of Anubis type         |      Enum      |                                    '', 'laser1' / 'laser2' / 'laser3' / 'laser4'                                    |                                   (T/N: None of these seem to match TCG seals)                                   |        ''         |
|        rare         |            Card Rarity             |      Enum      |                                 'dt' / 'ur' / 'gr' / 'hr' / 'ser' / 'gser' / 'pser'                                 |                   DuelTerminal / Ultra / Gold / OCG Ghost / Secret / Gold Secret / Starlight.                    |        ''         |
|      twentieth      |     OCG 20th Anniversary seal      |    Boolean     |                                                          —                                                          |                                       (T/N: there is no tcg 25th QC seal)}                                       |       false       |
|       radius        |           Round corners            |    Boolean     |                                                          —                                                          |                                                        —                                                         | <s>true</s> false |
|        scale        |  Zoom level of Canvas and export   |     Number     |                                                          —                                                          |                              (T/N: 0.5 for preview, Change back to 1.0 for export)                               |         1         |

### Speed Duel - Untranslated

T/N: Not bothering to support speed duel

|      属性名       |       说明       |  类型   |                                 可选值                                 |                  备注                   |  默认值   |
| :---------------: | :--------------: | :-----: | :--------------------------------------------------------------------: | :-------------------------------------: | :-------: |
|     language      |       语言       |  enum   |                              'sc' / 'jp'                               |             简体中文 / 日文             |   'sc'    |
|       name        |       卡名       | string  |                                   —                                    |                    —                    |    ''     |
|       color       |     卡名颜色     | string  |                                   —                                    |                    —                    |    ''     |
|       type        |       类型       |  enum   |                      'monster' / 'spell' / 'trap'                      |           怪兽 / 魔法 / 陷阱            | 'monster' |
|     attribute     |       属性       |  enum   | 'dark' / 'light' / 'earth' / 'water' / 'fire' / 'wind' / 'divine' / '' |  暗 / 光 / 地 / 水 / 炎 / 风 / 神 / 无  |  'dark'   |
|       icon        |     魔陷图标     |  enum   | 'equip' / 'field' / 'quick-play' / 'ritual' / 'continuous' / 'counter' | 装备 / 场地 / 速攻 / 仪式 / 永续 / 反击 |    ''     |
|       image       |     中间卡图     | string  |                                   —                                    |                    —                    |    ''     |
|     cardType      |     卡片类型     |  enum   |               'normal' / 'effect' / 'ritual' / 'fusion'                |        通常 / 效果 / 仪式 / 融合        | 'normal'  |
|       level       |       星级       | number  |                                   —                                    |                    —                    |     0     |
|    monsterType    |     怪兽类型     | string  |                                   —                                    |                    —                    |    ''     |
|    maximumAtk     |    极限攻击力    | number  |                                   —                                    |                    —                    |     0     |
|        atk        |      攻击力      | number  |                                   —                                    |                  ?：-1                  |     0     |
|        def        |      防御力      | number  |                                   —                                    |                  ?：-1                  |     0     |
|    description    |     效果描述     | string  |                                   —                                    |                    —                    |    ''     |
| firstLineCompress |   是否首行压缩   | boolean |                                   —                                    |                    —                    |   false   |
| descriptionAlign  | 是否效果描述居中 | boolean |                                   —                                    |                    —                    |   false   |
|  descriptionZoom  |   效果描述缩放   | number  |                                   —                                    |                    —                    |     1     |
| descriptionWeight |   效果描述字重   | number  |                                   —                                    |                    —                    |     0     |
|      package      |       卡包       | string  |                                   —                                    |                    —                    |    ''     |
|     password      |     卡片密码     | string  |                                   —                                    |                    —                    |    ''     |
|      legend       |    是否是传说    | boolean |                                   —                                    |                    —                    |   false   |
|       laser       |       角标       |  enum   |               'laser1' / 'laser2' / 'laser3' / 'laser4'                |    样式一 / 样式二 / 样式三 / 样式四    |    ''     |
|       rare        |       罕贵       |  enum   |                          'sr' / 'rr' / 'pser'                          |             SR / RR / PSER              |    ''     |
|      radius       |    是否是圆角    | boolean |                                   —                                    |                    —                    |   true    |
|       scale       |     卡片缩放     | number  |                                   —                                    |                    —                    |     1     |

### YuGiOh Card Back

|   Key    |           Description           |  Type   |                     Optional Values                     |                     Remarks                     |   Default Value    |
| :------: | :-----------------------------: | :-----: | :-----------------------------------------------------: | :---------------------------------------------: | :----------------: |
|   type   |          Backing Type           |  enum   | 'normal' / 'tormentor' / 'sky-dragon' / 'winged-dragon' | Regular / obelisk blue / slifer red / ra yellow |      'normal'      |
|   logo   |           Region Logo           |  enum   |                  'ocg' / 'tcg' / 'rd'                   |           OCG / TCG / Rush Duel (JP)            | <s>'ocg'</s> 'tcg' |
|  konami  |           Show Konami           | boolean |                            —                            |                        —                        |        true        |
| register |        Show &reg; symbol        | boolean |                            —                            |                        —                        |        true        |
|  radius  |          Round corners          | boolean |                            —                            |                        —                        |        true        |
|  scale   | Zoom level of Canvas and export | number  |                            —                            |                        —                        |         1          |

### Field Center Card

|   Key    |           Description           |  Type   | Optional Values |                                Remarks                                 | Default Value |
| :------: | :-----------------------------: | :-----: | :-------------: | :--------------------------------------------------------------------: | :-----------: |
|  image   |         Background Art          | String  |        —        |                               image URL                                |      ''       |
| cardBack |          Back of Card           | boolean |        —        | (T/N: replaces your art with a standard OCG field center reverse side) |     false     |
|  radius  |          Round corners          | boolean |        —        |                                   —                                    |     true      |
|  scale   | Zoom level of Canvas and export | number  |        —        |                                   —                                    |       1       |

### Anime OCG Style - Untranslated

T/N: Not bothering to support this either

|      属性名       |       说明       |  类型   |                                          可选值                                          |                         备注                         |  默认值   |
| :---------------: | :--------------: | :-----: | :--------------------------------------------------------------------------------------: | :--------------------------------------------------: | :-------: |
|     language      |       语言       |  enum   |                                           'jp'                                           |                         日文                         |   'jp'    |
|       font        |       字体       |  enum   |                                '' / 'custom1' / 'custom2'                                |          默认 / 华康隶书体 / 文鼎中粗隶简繁          |    ''     |
|       name        |       卡名       | string  |                                            —                                             |                          —                           |    ''     |
|       color       |     卡名颜色     | string  |                                            —                                             |                          —                           |    ''     |
|       align       |     卡名对齐     |  enum   |                               'left' / 'center' / 'right'                                |                左对齐 / 居中 / 右对齐                |  'left'   |
|     gradient      |  卡名是否渐变色  | boolean |                                            —                                             |                          —                           |   false   |
|  gradientColor1   |     渐变色 1     | string  |                                            —                                             |                          —                           | '#999999' |
|  gradientColor2   |     渐变色 2     | string  |                                            —                                             |                          —                           | '#ffffff' |
|       type        |       类型       |  enum   |                               'monster' / 'spell' / 'trap'                               |                  怪兽 / 魔法 / 陷阱                  | 'monster' |
|     attribute     |       属性       |  enum   |          'dark' / 'light' / 'earth' / 'water' / 'fire' / 'wind' / 'divine' / ''          |        暗 / 光 / 地 / 水 / 炎 / 风 / 神 / 无         |  'dark'   |
|       icon        |     魔陷图标     |  enum   |          'equip' / 'field' / 'quick-play' / 'ritual' / 'continuous' / 'counter'          |       装备 / 场地 / 速攻 / 仪式 / 永续 / 反击        |    ''     |
|       image       |     中间卡图     | string  |                                            —                                             |                          —                           |    ''     |
|     cardType      |     卡片类型     |  enum   | 'normal' / 'effect' / 'ritual' / 'fusion' / 'tormentor' / 'sky-dragon' / 'winged-dragon' | 通常 / 效果 / 仪式 / 融合 / 巨神兵 / 天空龙 / 翼神龙 | 'normal'  |
|       level       |       星级       | number  |                                            —                                             |                          —                           |     0     |
|    monsterType    |     怪兽类型     | string  |                                            —                                             |                          —                           |    ''     |
|        atk        |      攻击力      | number  |                                            —                                             |                  ????：-1，X000：-2                  |     0     |
|        def        |      防御力      | number  |                                            —                                             |                  ????：-1，X000：-2                  |     0     |
|    description    |     效果描述     | string  |                                            —                                             |                          —                           |    ''     |
| firstLineCompress |   是否首行压缩   | boolean |                                            —                                             |                          —                           |   false   |
| descriptionAlign  | 是否效果描述居中 | boolean |                                            —                                             |                          —                           |   false   |
|  descriptionZoom  |   效果描述缩放   | number  |                                            —                                             |                          —                           |     1     |
| descriptionWeight |   效果描述字重   | number  |                                            —                                             |                          —                           |     0     |
|      package      |       卡包       | string  |                                            —                                             |                          —                           |    ''     |
|     password      |     卡片密码     | string  |                                            —                                             |                          —                           |    ''     |
|     copyright     |       版权       |  enum   |                                           'jp'                                           |                         日文                         |    ''     |
|       laser       |       角标       |  enum   |                        'laser1' / 'laser2' / 'laser3' / 'laser4'                         |          样式一 / 样式二 / 样式三 / 样式四           |    ''     |
|      radius       |    是否是圆角    | boolean |                                            —                                             |                          —                           |   true    |
|       scale       |     卡片缩放     | number  |                                            —                                             |                          —                           |     1     |
