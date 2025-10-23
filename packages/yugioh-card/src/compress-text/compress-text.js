import { cloneDeep, isEqual } from 'lodash-es';
import { Group, Text } from 'leafer';
import { isBrowser } from '../utils/index.js';
import { splitBreakWord } from './split-break-word.js';

export class CompressText extends Group {
  constructor(data = {}) {
    super();
    this.baseLineHeight = 1.15;
    this.noCompressText = '●①②③④⑤⑥⑦⑧⑨⑩'; // prevent compression on special symbols
    this.parseList = [];
    this.newlineList = [];
    this.currentX = 0; // current row X coord
    this.currentY = 0; // current row Y coord
    this.currentLine = 0; // current row index
    this.textScale = 1;
    this.firstLineTextScale = 1; // for first line compression
    this.isSmallSize = false;
    this.group = null; // Leafer Text Group
    this.needCompressTwice = false; // secondary compression
    this.bounds = {}; // text box height & width

    /* default data for chinese
    this.defaultData = {
      text: '',
      fontFamily: 'ygo-sc, 楷体, serif',
      fontSize: 24,
      fontWeight: 'normal',
      lineHeight: this.baseLineHeight,
      letterSpacing: 0,
      wordSpacing: 0,
      firstLineCompress: false,
      textAlign: 'justify',
      textJustifyLast: false,
      color: 'black',
      strokeWidth: 0,
      gradient: false,
      gradientColor1: '#999999',
      gradientColor2: '#ffffff',
      rtFontFamily: 'ygo-tip, sans-serif',
      rtFontSize: 13,
      rtFontWeight: 'bold',
      rtLineHeight: this.baseLineHeight,
      rtLetterSpacing: 0,
      rtTop: -9,
      rtColor: 'black',
      rtStrokeWidth: 0,
      rtFontScaleX: 1,
      fontScale: 1,
      autoSmallSize: false,
      smallFontSize: 18,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      zIndex: 0,
    };
    */

    // default data for Eng
    this.defaultData = {
      text: '',
      fontFamily: 'ygo-en, serif',
      fontSize: 24,
      fontWeight: 'normal',
      lineHeight: this.baseLineHeight,
      letterSpacing: 0,
      wordSpacing: 0,
      firstLineCompress: false,
      textAlign: 'justify',
      textJustifyLast: false,
      color: 'black',
      strokeWidth: 0,
      gradient: false,
      gradientColor1: '#999999',
      gradientColor2: '#ffffff',
      rtFontFamily: 'ygo-tip, sans-serif',
      rtFontSize: 13,
      rtFontWeight: 'bold',
      rtLineHeight: this.baseLineHeight,
      rtLetterSpacing: 0,
      rtTop: -9,
      rtColor: 'black',
      rtStrokeWidth: 0,
      rtFontScaleX: 1,
      fontScale: 1,
      autoSmallSize: false,
      smallFontSize: 18,
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

  // get parsed text list
  getParseList() {
    let bold = false;
    // do not modify regex capture groups
    return String(this.text)
      .trimEnd()
      .split(
        new RegExp(`(\\[.*?\\(.*?\\)]|<b>|</b>|\n|[${this.noCompressText}])`)
      )
      .filter((value) => value)
      .map((value) => {
        let rubyText = value;
        let rtText = '';
        if (/\[.*?\(.*?\)]/g.test(value)) {
          rubyText = value.replace(/\[(.*?)\((.*?)\)]/g, '$1');
          rtText = value.replace(/\[(.*?)\((.*?)\)]/g, '$2');
        }
        if (value === '<b>') {
          bold = true;
          return null;
        }
        if (value === '</b>') {
          bold = false;
          return null;
        }
        return {
          ruby: {
            text: rubyText,
            bold,
            charList: splitBreakWord(rubyText).map((char) => ({ text: char })),
          },
          rt: {
            text: rtText,
          },
        };
      })
      .filter((value) => value);
  }

  // get list of line breaks
  getNewlineList() {
    const list = [[]];
    let currentIndex = 0;
    this.parseList.forEach((item) => {
      const ruby = item.ruby;
      list[currentIndex].push(item);
      if (ruby.text === '\n') {
        currentIndex++;
        list[currentIndex] = [];
      }
    });
    return list;
  }

  // get compressed text
  compressText() {
    this.textScale = 1;
    this.firstLineTextScale = 1;
    this.isSmallSize = false;
    this.needCompressTwice = false;
    this.parseList = this.getParseList();
    this.newlineList = this.getNewlineList();
    if (this.group) {
      this.group.destroy();
    }
    this.group = new Group();
    this.createRuby();
    this.compressRuby();
    this.alignRuby();
    this.createRt();
    this.createGradient();
    this.createBounds();
    this.add(this.group);
  }

  // create text (t/n: they call this a ruby for some reason?)
  createRuby() {
    this.parseList.forEach((item) => {
      const ruby = item.ruby;
      const charList = ruby.charList;
      charList.forEach((char) => {
        const charLeaf = new Text({
          text: char.text,
          fontFamily: this.fontFamily,
          fontSize: this.fontSize * this.fontScale,
          fontWeight: ruby.bold ? 'bold' : this.fontWeight,
          lineHeight: this.fontSize * this.lineHeight * this.fontScale,
          fill: this.color,
          stroke: this.strokeWidth ? this.color : null,
          strokeWidth: this.strokeWidth,
          strokeAlign: 'center',
          letterSpacing: this.letterSpacing,
        });
        const bounds = charLeaf.textDrawData.bounds;
        char.charLeaf = charLeaf;
        char.originalWidth = bounds.width;
        char.originalHeight = bounds.height;
        char.width = bounds.width;
        char.height = bounds.height;
        if (char.text === ' ') {
          char.originalWidth += this.wordSpacing;
          char.width += this.wordSpacing;
        }
        this.group.add(charLeaf);
      });
    });
    this.updateTextScale();
  }

  // compressed text
  compressRuby() {
    if (this.firstLineCompress && this.width) {
      // first row compression
      const firstNewlineCharList = this.newlineList[0]
        .map((item) => item.ruby.charList)
        .flat();
      let firstNewlineTotalWidth = 0;
      let maxWidth = this.width;
      firstNewlineCharList.forEach((char) => {
        const paddingLeft = char.paddingLeft || 0;
        const paddingRight = char.paddingRight || 0;
        firstNewlineTotalWidth += char.originalWidth;
        maxWidth -= paddingLeft + paddingRight;
      });
      this.firstLineTextScale = Math.min(
        Math.floor((maxWidth / firstNewlineTotalWidth) * 1000) / 1000,
        1
      );
      this.updateTextScale();
    }
    const charList = this.parseList.map((item) => item.ruby.charList).flat();
    const lastChar = charList[charList.length - 1];
    if (
      this.height &&
      lastChar &&
      this.currentY + lastChar.height > this.height
    ) {
      // use binary search to get maximum scale with 0.01 accuracy
      let scale = 0.5;
      let start = 0;
      let end = this.textScale;
      while (scale > 0) {
        scale = (start + end) / 2;
        this.textScale = scale;
        this.updateTextScale();
        this.currentY + lastChar.height > this.height
          ? (end = scale)
          : (start = scale);
        if (
          this.currentY + lastChar.height <= this.height &&
          end - start <= 0.01
        ) {
          // if autoSmallSize, reduce font size, will not execute if font size > 1
          if (
            this.autoSmallSize &&
            scale < 0.7 &&
            this.fontScale <= 1 &&
            !this.isSmallSize
          ) {
            this.isSmallSize = true;
            this.updateFontSize();
            scale = 0.5;
            start = 0;
            end = 1;
          } else {
            break;
          }
        }
      }
    }
  }

  // align ruby
  alignRuby() {
    const charList = this.parseList.map((item) => item.ruby.charList).flat();
    const alignLine =
      this.textScale < 1 ||
      ['center', 'right'].includes(this.textAlign) ||
      this.textJustifyLast
        ? this.currentLine + 1
        : this.currentLine;
    for (let line = 0; line < alignLine; line++) {
      const lineList = charList.filter((item) => item.line === line);
      if (lineList.length) {
        const lastChar = lineList[lineList.length - 1];
        const lastCharLeaf = lastChar.charLeaf;
        const lastPaddingRight = lastChar.paddingRight || 0;
        const remainWidth =
          this.width - lastCharLeaf.x - lastChar.width - lastPaddingRight;
        if (remainWidth > 0) {
          if (this.textAlign === 'center') {
            const offset = remainWidth / 2;
            lineList.forEach((char) => {
              const charLeaf = char.charLeaf;
              charLeaf.x += offset;
            });
          } else if (this.textAlign === 'right') {
            const offset = remainWidth;
            lineList.forEach((char) => {
              const charLeaf = char.charLeaf;
              charLeaf.x += offset;
            });
          } else if (this.textAlign === 'justify') {
            if (lineList.length > 1 && lastChar.text !== '\n') {
              const gap = remainWidth / (lineList.length - 1);
              lineList.forEach((char, index) => {
                const charLeaf = char.charLeaf;
                charLeaf.x += index * gap;
              });
            }
          }
        }
      }
    }
  }

  // create phoenetic symbols? (t/n translation is weird)
  createRt() {
    this.parseList.forEach((item) => {
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
    // compress again
    if (this.needCompressTwice) {
      this.updateTextScale();
      this.compressRuby();
      this.alignRuby();
      this.parseList.forEach((item) => {
        this.positionRt(item);
      });
    }
  }

  // update text compression
  updateTextScale() {
    this.currentX = 0;
    this.currentY = 0;
    this.currentLine = 0;

    let noBreakCharList = [];
    let noBreakTotalWidth = 0;

    this.newlineList.forEach((newline, newlineIndex) => {
      const lastNewline = newlineIndex === this.newlineList.length - 1;
      newline.forEach((item) => {
        const ruby = item.ruby;
        const rt = item.rt;
        const charList = ruby.charList;
        charList.forEach((char) => {
          const charLeaf = char.charLeaf;
          const paddingLeft = char.paddingLeft || 0;
          const paddingRight = char.paddingRight || 0;
          if (this.firstLineCompress && newlineIndex === 0) {
            // compress first line to one line of total space
            charLeaf.scaleX = this.firstLineTextScale;
            char.width = char.originalWidth * this.firstLineTextScale;
          } else if (!this.noCompressText.includes(char.text) && lastNewline) {
            // compress only last line
            charLeaf.scaleX = this.textScale;
            char.width = char.originalWidth * this.textScale;
          }
          if (rt.text) {
            noBreakCharList.push(char);
            noBreakTotalWidth += char.width + paddingLeft + paddingRight;
          } else {
            const totalWidth = char.width + paddingLeft + paddingRight;
            if (
              this.width &&
              char.text !== '\n' &&
              this.currentX &&
              this.currentX + totalWidth > this.width
            ) {
              this.addRow();
            }
            this.positionChar(char);
            if (char.text === '\n') {
              this.addRow();
            }
          }
        });

        if (noBreakCharList.length) {
          if (this.width && this.currentX + noBreakTotalWidth > this.width) {
            this.addRow();
          }
          noBreakCharList.forEach((char) => {
            this.positionChar(char);
          });

          noBreakCharList = [];
          noBreakTotalWidth = 0;
        }
      });
    });
  }

  // update text size
  updateFontSize() {
    this.textScale = 1;
    const fontSize = this.isSmallSize ? this.smallFontSize : this.fontSize;
    const sizePercent = fontSize / this.fontSize;
    const charList = this.parseList.map((item) => item.ruby.charList).flat();
    charList.forEach((char) => {
      const charLeaf = char.charLeaf;
      charLeaf.fontSize = fontSize * this.fontScale;
      charLeaf.lineHeight = fontSize * this.lineHeight * this.fontScale;
      char.originalWidth *= sizePercent;
      char.originalHeight *= sizePercent;
      char.width *= sizePercent;
      char.height *= sizePercent;
    });
    this.updateTextScale();
  }

  // positioning character
  positionChar(char) {
    const paddingLeft = char.paddingLeft || 0;
    const paddingRight = char.paddingRight || 0;
    const charLeaf = char.charLeaf;
    charLeaf.x = this.currentX + paddingLeft;
    charLeaf.y = this.currentY;
    this.currentX += char.width + paddingLeft + paddingRight;
    char.line = this.currentLine;
  }

  // add a row
  addRow() {
    this.removeLineLastSpace(this.currentLine);
    const fontSize = this.isSmallSize ? this.smallFontSize : this.fontSize;
    this.currentX = 0;
    this.currentY += fontSize * this.lineHeight * this.fontScale;
    this.currentLine++;
  }

  // remove trailing whitespace
  removeLineLastSpace(line) {
    const charList = this.parseList.map((item) => item.ruby.charList).flat();
    const lineList = charList.filter((item) => item.line === line);
    if (lineList.length) {
      const lastChar = lineList[lineList.length - 1];
      if (lastChar.text === ' ') {
        const lastCharLeaf = lastChar.charLeaf;
        const lastPaddingLeft = lastChar.paddingLeft || 0;
        const lastPaddingRight = lastChar.paddingRight || 0;
        this.currentX -= lastChar.width + lastPaddingLeft + lastPaddingRight;
        lastCharLeaf.destroy();
        lastChar.line = -1;
        this.removeLineLastSpace(line);
      }
    }
  }

  // positioning phoenetic char?
  positionRt(item) {
    const ruby = item.ruby;
    const rt = item.rt;
    const rtLeaf = rt.rtLeaf;
    if (rtLeaf) {
      const firstChar = ruby.charList[0];
      const lastChar = ruby.charList[ruby.charList.length - 1];
      const firstCharLeaf = firstChar.charLeaf;
      const lastCharLeaf = lastChar.charLeaf;
      const firstPaddingLeft = firstChar.paddingLeft || 0;
      const lastPaddingRight = lastChar.paddingRight || 0;
      const rubyWidth =
        lastCharLeaf.x -
        firstCharLeaf.x +
        lastChar.width +
        firstPaddingLeft +
        lastPaddingRight;

      rtLeaf.around = { type: 'percent', x: 0.5, y: 0 };
      rtLeaf.x = firstCharLeaf.x + rubyWidth / 2 - firstPaddingLeft;
      rtLeaf.y = firstCharLeaf.y + this.rtTop * this.fontScale;

      if (this.rtFontScaleX !== 1) {
        // in special cases, no compression is performed, only center alignment
        rtLeaf.scaleX = this.rtFontScaleX;
      } else if (rt.width / rubyWidth < 0.95 && ruby.text.length > 1) {
        // stretch justify
        const maxLetterSpacing = this.rtFontSize * this.fontScale * 3;
        const newLetterSpacing =
          (rubyWidth * 0.95 - rt.width) / (rt.text.length - 1);
        rtLeaf.letterSpacing = Math.min(newLetterSpacing, maxLetterSpacing);
        rtLeaf.x += rtLeaf.letterSpacing / 2;
      } else if (rt.width > rubyWidth) {
        // compression
        if (rubyWidth / rt.width < 0.6) {
          // to prevent over-compression, widen the ruby
          // formula: (rubyWidth + widen) / rtWidth = 0.6
          const widen = 0.6 * rt.width - rubyWidth;
          rtLeaf.scaleX = 0.6;
          firstChar.paddingLeft = widen / 2;
          lastChar.paddingRight = widen / 2;
          this.needCompressTwice = true;
        } else {
          rtLeaf.scaleX = rubyWidth / rt.width;
        }
      }
    }
  }

  // creating color gradient
  createGradient() {
    if (this.gradient) {
      const fontSize = this.isSmallSize ? this.smallFontSize : this.fontSize;
      this.parseList.forEach((item) => {
        const ruby = item.ruby;
        const charList = ruby.charList;
        charList.forEach((char) => {
          const charLeaf = char.charLeaf;
          charLeaf.set({
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
      });
    }
  }

  // create element bounds
  createBounds() {
    this.bounds = {
      width: 0,
      height: 0,
    };
    const charList = this.parseList.map((item) => item.ruby.charList).flat();
    for (let line = 0; line < this.currentLine + 1; line++) {
      const lineList = charList.filter((item) => item.line === line);
      if (lineList.length) {
        const lastChar = lineList[lineList.length - 1];
        const lastCharLeaf = lastChar.charLeaf;
        const lastPaddingRight = lastChar.paddingRight || 0;
        this.bounds.width =
          Math.max(
            this.bounds.width,
            lastCharLeaf.x + lastChar.width + lastPaddingRight
          ) * this.scaleX;
        this.bounds.height =
          Math.max(this.bounds.height, lastCharLeaf.y + lastChar.height) *
          this.scaleY;
      }
    }
  }
}
