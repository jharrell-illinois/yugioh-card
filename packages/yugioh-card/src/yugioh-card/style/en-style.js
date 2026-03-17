import { inheritProp } from '../../utils/index.js';

export default inheritProp({
  fontFamily: 'ygo-en',
  name: {
    fontFamily: 'ygo-en-name',
    top: 52,
    fontSize: 158,
    letterSpacing: 1,
  },
  spellTrap: {
    fontFamily: 'ygo-en-race',
    top: 254,
    fontSize: 74,
    right: 145,
    letterSpacing: 1,
    icon: {
      marginTop: 10,
      marginLeft: 10,
    },
  },
  pendulumDescription: {
    top: 1282,
    fontSize: 42,
    lineHeight: 1.02,
  },
  effect: {
    fontFamily: 'ygoitcstoneserifboldsmallcaps',
    top: 1527,
    fontSize: 52,
    letterSpacing: 1,
    lineHeight: 1.02,
    wordSpacing: -13.5,
  },
  description: {
    fontSize: 42,
    lineHeight: 1.1,
    fontFamily: 'ygomatrixbook',
  },
  edition: {
    fontFamily: 'palatinolinotypebold',
    fontSize: 46,
    smallFontSize: 32,
    fontWeight: 'bold',
    top: 1930,
    left: 270,
  },
  copyright: {
    fontFamily: 'stoneserifregular',
    fontSize: 36,
    specFontFamily: 'ygomatrixbook',
    specFontSize: 45,
  },
});
