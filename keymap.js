// ─── AksharaFlow · Full Tamil Key Map v3 ───────────────────────────────────
//
// LETTER KEYS → consonants + short vowels
//   Q=ண  W=ற  E=எ  R=ர  T=த  Y=ய  U=உ  I=இ  O=ஒ  P=ப
//   A=அ  S=ஸ  D=ட  F=ந  G=ங  H=ஹ  J=ஞ  K=க  L=ல
//   Z=ழ  X=ள  C=ச  V=வ  B=ஜ  N=ன  M=ம
//
// NUMBER KEYS (no shift) → long vowels + aaytham
//   1=ஆ  2=ஈ  3=ஊ  4=ஏ  5=ஐ  6=ஓ  7=ஔ  8=ஃ
//
// SHIFT + NUMBER → matras (append to consonant)
//   Shift+1(!)=ா  Shift+2(@)=ி  Shift+3(#)=ீ  Shift+4($)=ு
//   Shift+5(%)=ூ  Shift+6(^)=ெ  Shift+7(&)=ே  Shift+8(*)=ை
//   Shift+9(()=ொ  Shift+0())=ோ  Shift+-(_)=ௌ  Shift+=(+)=்
//
// Tamil vowels (உயிர்):   அ ஆ இ ஈ உ ஊ எ ஏ ஐ ஒ ஓ ஔ  → 12 total
// Tamil consonants (மெய்): க ங ச ஞ ட ண த ந ப ம ய ர ல வ ழ ள ற ன → 18 total
// Grantha letters:         ஸ ஹ ஜ → 3 total
// Aaytham:                 ஃ → 1 total
// Total base characters:   34

const LETTER_MAP = {
  q:'ண', w:'ற', e:'எ', r:'ர', t:'த', y:'ய', u:'உ', i:'இ', o:'ஒ', p:'ப',
  a:'அ', s:'ஸ', d:'ட', f:'ந', g:'ங', h:'ஹ', j:'ஞ', k:'க', l:'ல',
  z:'ழ', x:'ள', c:'ச', v:'வ', b:'ஜ', n:'ன', m:'ம',
};

const NUMBER_MAP = {
  '1':'ஆ', '2':'ஈ', '3':'ஊ', '4':'ஏ',
  '5':'ஐ', '6':'ஓ', '7':'ஔ', '8':'ஃ',
};

const MATRA_MAP = {
  '!':'\u0BBE', '@':'\u0BBF', '#':'\u0BC0', '$':'\u0BC1',
  '%':'\u0BC2', '^':'\u0BC6', '&':'\u0BC7', '*':'\u0BC8',
  '(':'\u0BCA', ')':'\u0BCB', '_':'\u0BCC', '+':'\u0BCD',
};

if (typeof module !== 'undefined') {
  module.exports = { LETTER_MAP, NUMBER_MAP, MATRA_MAP };
}
