import { cloneDeep, isEqual } from 'lodash-unified';
import { Group, Text } from 'leafer-unified';
import { isBrowser } from '../utils/index.js';
import { splitBreakWordWithBracket } from './split-break-word.js';

export class CompressText extends Group {
  constructor(data = {}) {
    super();
    this.baseLineHeight = 1.15; // 基础行高
    this.noCompressText = ' ●①②③④⑤⑥⑦⑧⑨⑩'; // 不压缩的文本
    this.parseList = []; // 解析后的文本列表
    this.newlineList = []; // 根据换行符分割的文本列表
    this.currentX = 0; // 当前行的x坐标
    this.currentY = 0; // 当前行的y坐标
    this.currentLine = 0; // 当前行数
    this.textScale = 1; // 文本缩放比例
    this.firstLineTextScale = 1; // 首行文本缩放比例
    this.lineTextScales = []; // scaling of each text line
    this.autoSmallSize = false;
    this.justifyThreshold = 0.91; // bump up wordspacing of lines longer than threshold * minScale
    this.lineExtraWordSpacing = [];
    // ...existing code...
    this.group = null; // Leafer文本组
    this.needCompressTwice = false; // 是否需要二次压缩
    this.bounds = {}; // 宽高信息

    this.defaultData = {
      text: '',
      fontFamily: 'ygo-en',
      fontSize: 24,
      fontWeight: 'normal',
      lineHeight: this.baseLineHeight,
      letterSpacing: 0,
      wordSpacing: 0,
      firstLineCompress: false,
      compressAllLines: false,
      autoSmallSize: false,
      textAlign: 'justify',
      textJustifyLast: false,
      color: 'black',
      strokeWidth: 0,
      gradient: false,
      gradientColor1: '#999999',
      gradientColor2: '#ffffff',
      rtFontFamily: 'ygo-tip',
      rtFontSize: 13,
      rtFontWeight: 'bold',
      rtLineHeight: this.baseLineHeight,
      rtLetterSpacing: 0,
      rtTop: -9,
      rtColor: 'black',
      rtStrokeWidth: 0,
      rtFontScaleX: 1,
      fontScale: 1,
      // ...existing code...
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      zIndex: 0,
    };

    this.initData(data);

    if (isBrowser) {
      document.fonts.ready.then(() => {
        setTimeout(() => {
          this.compressText();
        }, 250);
      });
    }
  }

  set(data = {}) {
    data = cloneDeep(data);
    let needCompressText = false;
    Object.keys(data).forEach((key) => {
      const value = data[key] ?? this.defaultData[key];
      if (!isEqual(this[key], value)) {
        this[key] = value;
        needCompressText = true;
      }
    });
    if (needCompressText) {
      this.compressText();
    }
  }

  initData(data = {}) {
    this.set(Object.assign(this.defaultData, data));
  }

  // 获取解析后的文本列表
  getParseList() {
    const list = [];
    let bold = false;
    const text = String(this.text).trimEnd();
    // 正则的捕获圆括号不要随意修改
    text
      .split(new RegExp(`(<b>|</b>|\n|[${this.noCompressText}])`))
      .filter((value) => value)
      .forEach((value) => {
        if (value === '<b>') {
          bold = true;
          return;
        }
        if (value === '</b>') {
          bold = false;
          return;
        }
        const splitList = splitBreakWordWithBracket(value);
        splitList.forEach((value) => {
          const itemList = [];
          value
            .split(/(\[.*?\(.*?\)])/g)
            .filter((value) => value)
            .forEach((value) => {
              let rubyText = value;
              let rtText = '';
              if (/\[.*?\(.*?\)]/g.test(value)) {
                rubyText = value.replace(/\[(.*?)\((.*?)\)]/g, '$1');
                rtText = value.replace(/\[(.*?)\((.*?)\)]/g, '$2');
              }
              const item = {
                ruby: {
                  text: rubyText,
                  bold,
                },
                rt: {
                  text: rtText,
                },
              };
              itemList.push(item);
            });
          list.push(itemList);
        });
      });
    return list;
  }

  // 获取换行列表
  getNewlineList() {
    const list = [[]];
    let currentIndex = 0;
    this.parseList.forEach((itemList) => {
      const hasBreak = itemList.some((item) => item.ruby.text === '\n');
      list[currentIndex].push(itemList);
      if (hasBreak) {
        currentIndex++;
        list[currentIndex] = [];
      }
    });
    return list;
  }

  // 获取平铺的ruby列表
  getRubyList() {
    return this.parseList
      .map((itemList) => itemList.map((item) => item.ruby))
      .flat();
  }

  // 获取压缩文本
  compressText() {
    this.textScale = 1;
    this.firstLineTextScale = 1;
    this.lineTextScales = [];
    this.isSmallSize = false;
    this.needCompressTwice = false;
    this.parseList = this.getParseList();
    this.newlineList = this.getNewlineList();
    if (this.group) {
      this.group.destroy();
    }
    this.group = new Group();
    // Step 1: Create ruby with original font size
    this.createRuby();
    // Step 2: If autoSmallSize, fit vertically first
    if (this.autoSmallSize && this.height && this.newlineList.length > 0) {
      const numberOfLines = this.newlineList.length;
      const maxFontSize = Math.floor(
        this.height / (numberOfLines * this.lineHeight * this.fontScale),
      );
      if (maxFontSize < this.fontSize) {
        // Update fontSize for all rubyLeafs except noCompressText
        const rubyList = this.getRubyList();
        rubyList.forEach((ruby) => {
          const rubyLeaf = ruby.rubyLeaf;
          if (this.noCompressText.includes(ruby.text)) {
            // Do not change fontSize for noCompressText
            rubyLeaf.fontSize = this.fontSize * this.fontScale;
          } else {
            rubyLeaf.fontSize = maxFontSize * this.fontScale;
          }
          // Never rescale the lineHeight, we set it statically in the style
          rubyLeaf.lineHeight =
            this.fontSize * this.lineHeight * this.fontScale;
          // Recalculate bounds
          const bounds = rubyLeaf.textDrawData.bounds;
          ruby.originalWidth = bounds.width;
          ruby.originalHeight = bounds.height;
          ruby.width = bounds.width;
          ruby.height = bounds.height;
        });
        // Rerun updateTextScale to reposition
        this.updateTextScale();
        // Set fontSize for future reference
        this.fontSize = maxFontSize;
      }
    }
    // Step 3: Compress horizontally only if autoSmallSize is true
    if (this.autoSmallSize) {
      this.compressRuby();
    }
    this.alignRuby();
    this.createRt();
    this.createGradient();
    this.createBounds();
    this.add(this.group);
  }

  // 创建文本
  createRuby() {
    const rubyList = this.getRubyList();
    rubyList.forEach((ruby) => {
      const rubyLeaf = new Text({
        text: ruby.text,
        fontFamily: this.fontFamily,
        fontSize: this.fontSize * this.fontScale,
        fontWeight: ruby.bold ? 'bold' : this.fontWeight,
        lineHeight: this.fontSize * this.lineHeight * this.fontScale,
        fill: this.color,
        stroke: this.strokeWidth ? this.color : null,
        strokeWidth: this.strokeWidth,
        strokeAlign: this.noCompressText.includes(ruby.text) ? 'top' : 'center',
        letterSpacing: this.letterSpacing,
      });
      const bounds = rubyLeaf.textDrawData.bounds;
      ruby.rubyLeaf = rubyLeaf;
      ruby.originalWidth = bounds.width;
      ruby.originalHeight = bounds.height;
      ruby.width = bounds.width;
      ruby.height = bounds.height;
      if (ruby.text === ' ') {
        ruby.originalWidth += this.wordSpacing;
        ruby.width += this.wordSpacing;
      }
      this.group.add(rubyLeaf);
    });
    this.updateTextScale();
  }

  // 压缩文本
  compressRuby() {
    // compressAllLines: compress every line to fit width, but only if autoSmallSize is true
    if (this.autoSmallSize && this.compressAllLines && this.width) {
      // Calculate scale for each line
      let scales = [];
      this.newlineList.forEach((newline) => {
        const lineRubyList = newline
          .map((itemList) => itemList.map((item) => item.ruby))
          .flat();
        let compressibleWidth = 0;
        let maxWidth = this.width;
        let uncompressableWidth = 0;
        lineRubyList.forEach((ruby) => {
          const paddingLeft = ruby.paddingLeft || 0;
          const paddingRight = ruby.paddingRight || 0;
          if (this.noCompressText.includes(ruby.text)) {
            uncompressableWidth +=
              ruby.originalWidth + paddingLeft + paddingRight;
          } else {
            compressibleWidth += ruby.originalWidth;
            maxWidth -= paddingLeft + paddingRight;
          }
        });
        // Subtract uncompressable width from maxWidth
        maxWidth -= uncompressableWidth;
        const scale =
          compressibleWidth > 0
            ? Math.min(
                Math.floor((maxWidth / compressibleWidth) * 1000) / 1000,
                1,
              )
            : 1;
        scales.push(scale);
      });
      // Find the minimum scale needed for all lines
      const minScale = Math.min(...scales);
      this.lineTextScales = this.newlineList.map(() => minScale);
      this.updateTextScale();

      // stretch out lines if needed
      this.stretchRuby();
    } else if (this.firstLineCompress && this.width) {
      // 首行压缩
      const firstNewlineRubyList = this.newlineList[0]
        .map((itemList) => itemList.map((item) => item.ruby))
        .flat();
      let firstNewlineTotalWidth = 0;
      let maxWidth = this.width;
      firstNewlineRubyList.forEach((ruby) => {
        const paddingLeft = ruby.paddingLeft || 0;
        const paddingRight = ruby.paddingRight || 0;
        firstNewlineTotalWidth += ruby.originalWidth;
        maxWidth -= paddingLeft + paddingRight;
      });
      this.firstLineTextScale = Math.min(
        Math.floor((maxWidth / firstNewlineTotalWidth) * 1000) / 1000,
        1,
      );
      this.updateTextScale();
    }
    // ...existing code...
  }

  // custom function to stretch out lines by manipulating wordSpacing
  stretchRuby() {
    const mappedLines = this.newlineList
      .map((line) =>
        line.map((lineRubys) => lineRubys.map((word) => word.ruby)).flat(),
      )
      .slice(0, -1); // never stretch last line
    const originalWidths = mappedLines.map((line) => {
      let foundWidth = 0;
      line.forEach((ruby) => {
        foundWidth += ruby.width;
      });
      return foundWidth;
    });
    // need to calculate actual width of longest line since assuming this.width leads to overflow
    const maxWidth = originalWidths.reduce(
      (max, width) => (width > max ? width : max),
      0,
    );
    // set word spacing array, will be handled separately by updateTextScale()
    this.lineExtraWordSpacing = originalWidths
      .map((width, index) => {
        if (width > maxWidth * this.justifyThreshold) {
          //isolate whitespace rubys
          const whiteSpaceRubys = mappedLines[index].filter(
            (ruby) => ruby.text === ' ',
          );
          // calculate stretch ratio
          const whiteSpaceWidth = whiteSpaceRubys.reduce(
            (acc, ruby) => acc + ruby.width,
            0,
          );
          // (how much whitespace should be) / (how much whitespace is) > 1.0
          return (maxWidth - (width - whiteSpaceWidth)) / whiteSpaceWidth;
        }
        // if line shouldn't be stretched do nothing
        return 0;
      })
      .concat([0]); //add back in a 0 for the last element

    this.updateTextScale();
  }

  // 对齐ruby
  alignRuby() {
    const rubyList = this.getRubyList();
    const alignLine =
      this.textScale < 1 ||
      ['center', 'right'].includes(this.textAlign) ||
      this.textJustifyLast
        ? this.currentLine + 1
        : this.currentLine;
    for (let line = 0; line < alignLine; line++) {
      const lineList = rubyList.filter((item) => item.line === line);
      if (lineList.length) {
        const lastRuby = lineList[lineList.length - 1];
        const lastRubyLeaf = lastRuby.rubyLeaf;
        const lastPaddingRight = lastRuby.paddingRight || 0;
        const remainWidth =
          this.width - lastRubyLeaf.x - lastRuby.width - lastPaddingRight;
        if (remainWidth > 0) {
          if (this.textAlign === 'center') {
            const offset = remainWidth / 2;
            lineList.forEach((ruby) => {
              const rubyLeaf = ruby.rubyLeaf;
              rubyLeaf.x += offset;
            });
          } else if (this.textAlign === 'right') {
            const offset = remainWidth;
            lineList.forEach((ruby) => {
              const rubyLeaf = ruby.rubyLeaf;
              rubyLeaf.x += offset;
            });
          } else if (this.textAlign === 'justify') {
            if (lineList.length > 1 && lastRuby.text !== '\n') {
              const gap = remainWidth / (lineList.length - 1);
              lineList.forEach((ruby, index) => {
                const rubyLeaf = ruby.rubyLeaf;
                rubyLeaf.x += index * gap;
              });
            }
          }
        }
      }
    }
  }

  // 创建注音
  createRt() {
    const itemList = this.parseList.flat();
    itemList.forEach((item) => {
      const rt = item.rt;
      if (rt.text) {
        const rtLeaf = new Text({
          text: rt.text,
          fontFamily: this.rtFontFamily,
          fontSize: this.rtFontSize * this.fontScale,
          fontWeight: this.rtFontWeight,
          lineHeight: this.rtFontSize * this.rtLineHeight * this.fontScale,
          fill: this.rtColor,
          stroke: this.rtStrokeWidth ? this.color : null,
          strokeWidth: this.rtStrokeWidth,
          strokeAlign: 'center',
          letterSpacing: this.rtLetterSpacing,
        });
        const bounds = rtLeaf.textDrawData.bounds;
        rt.rtLeaf = rtLeaf;
        rt.originalWidth = bounds.width;
        rt.originalHeight = bounds.height;
        rt.width = bounds.width;
        rt.height = bounds.height;
        this.positionRt(item);
        this.group.add(rtLeaf);
      }
    });
    // 如果需要再次压缩
    if (this.needCompressTwice) {
      this.updateTextScale();
      this.compressRuby();
      this.alignRuby();
      itemList.forEach((item) => {
        this.positionRt(item);
      });
    }
  }

  // 更新文本压缩
  updateTextScale() {
    this.currentX = 0;
    this.currentY = 0;
    this.currentLine = 0;

    this.newlineList.forEach((newline, newlineIndex) => {
      const lastNewline = newlineIndex === this.newlineList.length - 1;
      let lineScale = 1;
      let extraWordSpacing = 0;
      if (
        this.compressAllLines &&
        this.lineTextScales &&
        this.lineTextScales.length > 0
      ) {
        lineScale = this.lineTextScales[newlineIndex] || 1;
        extraWordSpacing = this.lineExtraWordSpacing[newlineIndex] || 0;
      }
      newline.forEach((itemList) => {
        let itemWidth = 0;
        itemList.forEach((item) => {
          const ruby = item.ruby;
          const rubyLeaf = ruby.rubyLeaf;
          if (this.compressAllLines && this.width) {
            if (this.noCompressText.includes(ruby.text)) {
              // special handling for spaces
              if (extraWordSpacing !== 0 && ruby.text === ' ') {
                rubyLeaf.scaleX = extraWordSpacing;
                ruby.width = ruby.originalWidth * extraWordSpacing;
              } else {
                rubyLeaf.scaleX = 1;
                ruby.width = ruby.originalWidth;
              }
            } else {
              rubyLeaf.scaleX = lineScale;
              ruby.width = ruby.originalWidth * lineScale;
            }
          } else if (this.firstLineCompress && newlineIndex === 0) {
            // 首行压缩到一行
            rubyLeaf.scaleX = this.firstLineTextScale;
            ruby.width = ruby.originalWidth * this.firstLineTextScale;
          } else if (!this.noCompressText.includes(ruby.text) && lastNewline) {
            // 只压缩最后一行
            rubyLeaf.scaleX = this.textScale;
            ruby.width = ruby.originalWidth * this.textScale;
          }
          const paddingLeft = ruby.paddingLeft || 0;
          const paddingRight = ruby.paddingRight || 0;
          itemWidth += ruby.width + paddingLeft + paddingRight;
        });
        const hasBreak = itemList.some((item) => item.ruby.text === '\n');
        const isOverWidth =
          this.width && this.currentX && this.currentX + itemWidth > this.width;
        if (hasBreak || isOverWidth) {
          this.addLine();
        }
        itemList.forEach((item) => {
          const ruby = item.ruby;
          this.positionRuby(ruby);
        });
      });
    });
  }

  // 更新文本大小
  updateFontSize() {
    // ...existing code...
  }

  // 定位Ruby
  positionRuby(ruby) {
    const paddingLeft = ruby.paddingLeft || 0;
    const paddingRight = ruby.paddingRight || 0;
    const rubyLeaf = ruby.rubyLeaf;
    rubyLeaf.x = this.currentX + paddingLeft;
    rubyLeaf.y = this.currentY;
    this.currentX += ruby.width + paddingLeft + paddingRight;
    ruby.line = ruby.text === '\n' ? this.currentLine - 1 : this.currentLine;
  }

  // 添加行
  addLine() {
    this.removeLineLastSpace(this.currentLine);
    this.currentX = 0;
    this.currentY += this.fontSize * this.lineHeight * this.fontScale;
    this.currentLine++;
  }

  // 删除行尾空格
  removeLineLastSpace(line) {
    const rubyList = this.getRubyList();
    const lineList = rubyList.filter((item) => item.line === line);
    if (lineList.length) {
      const lastRuby = lineList[lineList.length - 1];
      if (lastRuby.text === ' ') {
        const lastRubyLeaf = lastRuby.rubyLeaf;
        const lastPaddingLeft = lastRuby.paddingLeft || 0;
        const lastPaddingRight = lastRuby.paddingRight || 0;
        this.currentX -= lastRuby.width + lastPaddingLeft + lastPaddingRight;
        lastRubyLeaf.destroy();
        lastRuby.line = -1;
        this.removeLineLastSpace(line);
      }
    }
  }

  // 定位rt
  positionRt(item) {
    const rtStretchRate = 0.9;
    const rtCompressRate = 0.6;
    const ruby = item.ruby;
    const rt = item.rt;
    const rtLeaf = rt.rtLeaf;
    if (rtLeaf) {
      const rubyLeaf = ruby.rubyLeaf;
      const paddingLeft = ruby.paddingLeft || 0;
      const paddingRight = ruby.paddingRight || 0;
      const rubyWidth = ruby.width + paddingLeft + paddingRight;

      rtLeaf.around = { type: 'percent', x: 0.5, y: 0 };
      rtLeaf.x = rubyLeaf.x + rubyWidth / 2 - paddingLeft;
      rtLeaf.y = rubyLeaf.y + this.rtTop * this.fontScale;

      if (this.rtFontScaleX !== 1) {
        // 特殊情况不做压缩，只居中对齐
        rtLeaf.scaleX = this.rtFontScaleX;
      } else if (rt.width / rubyWidth < rtStretchRate && ruby.text.length > 1) {
        // 拉伸两端对齐
        const maxLetterSpacing = this.fontSize - this.rtFontSize / 2;
        const newLetterSpacing =
          (rubyWidth * rtStretchRate - rt.width) / (rt.text.length - 1);
        rtLeaf.letterSpacing = Math.min(newLetterSpacing, maxLetterSpacing);
        rtLeaf.x += rtLeaf.letterSpacing / 2;
      } else if (rt.width > rubyWidth) {
        // 压缩
        if (rubyWidth / rt.width < rtCompressRate) {
          // 防止过度压缩，加宽ruby
          // 公式：(rubyWidth + widen) / rtWidth = rtCompressRate
          const widen = rtCompressRate * rt.width - rubyWidth;
          rtLeaf.scaleX = rtCompressRate;
          ruby.paddingLeft = Math.min(widen / 2, 5);
          ruby.paddingRight = Math.min(widen / 2, 5);
          this.needCompressTwice = true;
        } else {
          rtLeaf.scaleX = rubyWidth / rt.width;
        }
      }
    }
  }

  // 创建渐变
  createGradient() {
    if (this.gradient) {
      const rubyList = this.getRubyList();
      const fontSize = this.fontSize;
      rubyList.forEach((ruby) => {
        const rubyLeaf = ruby.rubyLeaf;
        rubyLeaf.set({
          fill: {
            type: 'linear',
            stops: [
              { offset: 0, color: this.gradientColor1 },
              { offset: 0.4, color: this.gradientColor2 },
              { offset: 0.55, color: this.gradientColor2 },
              { offset: 0.6, color: this.gradientColor1 },
              { offset: 0.75, color: this.gradientColor2 },
            ],
          },
          stroke: 'rgba(0, 0, 0, 0.6)',
          strokeWidth: fontSize * 0.025 * this.fontScale,
          strokeAlign: 'outside',
          shadow: {
            blur: fontSize * 0.015 * this.fontScale,
            x: 0,
            y: fontSize * 0.025 * this.fontScale,
            color: 'rgba(0, 0, 0, 0.6)',
          },
        });
      });
    }
  }

  // 创建元素信息
  createBounds() {
    this.bounds = {
      width: 0,
      height: 0,
    };
    const rubyList = this.getRubyList();
    for (let line = 0; line < this.currentLine + 1; line++) {
      const lineList = rubyList.filter((item) => item.line === line);
      if (lineList.length) {
        const lastRuby = lineList[lineList.length - 1];
        const lastRubyLeaf = lastRuby.rubyLeaf;
        const lastPaddingRight = lastRuby.paddingRight || 0;
        this.bounds.width =
          Math.max(
            this.bounds.width,
            lastRubyLeaf.x + lastRuby.width + lastPaddingRight,
          ) * this.scaleX;
        this.bounds.height =
          Math.max(this.bounds.height, lastRubyLeaf.y + lastRuby.height) *
          this.scaleY;
      }
    }
  }
}
