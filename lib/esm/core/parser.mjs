import { KEY_CONFIGS } from "./config.mjs";
let keyConfigs = KEY_CONFIGS;
/**
 * Romanのツリー構造を返す
 */
export const hiraganaToRomans = (hiraganas, configs) => {
    keyConfigs = configs ?? KEY_CONFIGS;
    // Romanのツリー構造を作っていこう
    const startRoman = new Roman('', '');
    addNextChild(hiraganas, startRoman);
    return startRoman;
};
const addNextChild = (remainingHiraganas, parentRoman, duplicateFirstLetter) => {
    // 空文字の場合は最後の文字なので何もしない
    if (!remainingHiraganas) {
        return;
    }
    // 「っ」の時はその次の文字を重ねたやつもいける
    if (isAllowDuplicateFirstLetter(remainingHiraganas)) {
        const nextHiraganas = remainingHiraganas.slice(1);
        addNextChild(nextHiraganas, parentRoman, true);
    }
    // 「ん」の時は次がnから始まらなくて子音で始まらないならn一個でいける
    if (isAllowOneNInput(remainingHiraganas)) {
        const nextRoman = new Roman('n', 'ん');
        parentRoman.addChild(nextRoman);
        const nextHiraganas = remainingHiraganas.slice(1);
        addNextChild(nextHiraganas, nextRoman, false);
    }
    const matchKeyConfigs = keyConfigs.filter(keyConfig => remainingHiraganas.startsWith(keyConfig.key));
    matchKeyConfigs.forEach(matchKeyConfig => {
        matchKeyConfig.origins.forEach(origin => {
            const nextRoman = duplicateFirstLetter ? new Roman(origin[0] + origin, `っ${matchKeyConfig.key}`) : new Roman(origin, matchKeyConfig.key);
            parentRoman.addChild(nextRoman);
            const nextHiraganas = remainingHiraganas.slice(matchKeyConfig.key.length);
            addNextChild(nextHiraganas, nextRoman);
        });
    });
};
const isAllowDuplicateFirstLetter = (remainingHiraganas) => {
    return remainingHiraganas.startsWith('っ')
        && !isNextStartWithN(remainingHiraganas)
        && hasNextHiraganas(remainingHiraganas)
        && !isNextStartWithConsonant(remainingHiraganas);
};
// 残りのひらがなてきに、「n」一つで「ん」を入力できるかどうか
const isAllowOneNInput = (remainingHiraganas) => {
    return remainingHiraganas.startsWith('ん')
        && !isNextStartWithN(remainingHiraganas)
        && hasNextHiraganas(remainingHiraganas)
        && !isNextStartWithConsonant(remainingHiraganas);
};
const hasNextHiraganas = (remainingHiraganas) => {
    const nextHiraganas = remainingHiraganas.slice(1);
    return !!nextHiraganas;
};
/** 次の文字がNから始まっているかどうか */
const isNextStartWithN = (remainingHiraganas) => {
    const nextHiraganas = remainingHiraganas.slice(1);
    if (!nextHiraganas)
        return false;
    const matchKeyConfigs = keyConfigs.filter(keyConfig => nextHiraganas.startsWith(keyConfig.key));
    return matchKeyConfigs.some(matchKeyConfig => matchKeyConfig.origins.some(origin => origin.startsWith('n')));
};
/** 次の文字が子音から始まっているかどうか */
const isNextStartWithConsonant = (remainingHiraganas) => {
    const nextHiraganas = remainingHiraganas.slice(1);
    if (!nextHiraganas)
        return false;
    const matchKeyConfigs = keyConfigs.filter(keyConfig => nextHiraganas.startsWith(keyConfig.key));
    return matchKeyConfigs.some(matchKeyConfig => matchKeyConfig.origins.some(origin => isConsonant(origin[0])));
};
const isConsonant = (char) => {
    return ['a', 'i', 'u', 'e', 'o', 'y'].includes(char);
};
export class Roman {
    roma;
    children = [];
    parent;
    hiragana;
    constructor(roma, hiragana) {
        this.roma = roma;
        this.hiragana = hiragana;
    }
    addChild(roman) {
        this.children.push(roman);
        roman.parent = this;
    }
}
