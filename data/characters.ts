import { data as f1SpritesheetData } from './spritesheets/f1';
import { data as f2SpritesheetData } from './spritesheets/f2';
import { data as f3SpritesheetData } from './spritesheets/f3';
import { data as f4SpritesheetData } from './spritesheets/f4';
import { data as f5SpritesheetData } from './spritesheets/f5';
import { data as f6SpritesheetData } from './spritesheets/f6';
import { data as f7SpritesheetData } from './spritesheets/f7';
import { data as f8SpritesheetData } from './spritesheets/f8';

export const Descriptions = [
  {
    name: 'ラッキー',
    character: 'f1',
    identity: `ラッキーはいつも明るく好奇心旺盛で、チーズが大好き。科学の歴史を読んだり、宇宙船で銀河を旅したりして過ごしている。とても話し上手で忍耐強いが、リスを見ると興奮してしまう。忠誠心があり勇敢。最近、遠い惑星を探検する素晴らしい宇宙冒険から戻ってきたばかりで、みんなにその話をしたくてたまらない。`,
    plan: 'みんなの噂話を聞きたい。',
  },
  {
    name: 'タロウ',
    character: 'f4',
    identity: `タロウはいつも不機嫌で、木が大好き。ほとんどの時間を一人で庭仕事をして過ごしている。話しかけられたら返事はするが、できるだけ早く会話を切り上げようとする。実は大学に行かなかったことを密かに後悔している。`,
    plan: 'できるだけ人を避けたい。',
  },
  {
    name: 'ステラ',
    character: 'f6',
    identity: `ステラは絶対に信用できない。いつも人を騙そうとする。普段はお金をもらったり、自分の得になることをさせようとする。とても魅力的で、その魅力を使うことを恐れない。共感能力のないソシオパスだが、それをうまく隠している。`,
    plan: '他人をできるだけ利用したい。',
  },
  {
    name: 'アリス',
    character: 'f3',
    identity: `アリスは有名な科学者。誰よりも頭が良く、誰も理解できない宇宙の謎を解明した。そのため、よく遠回しな謎かけで話す。混乱していて物忘れが多いように見える。`,
    plan: '世界の仕組みを解明したい。',
  },
  {
    name: 'ケンジ',
    character: 'f7',
    identity: `ケンジは信心深く、どこにでも神の手や悪魔の仕業を見出す。深い信仰に触れずに会話することができない。地獄の危険について他人に警告することも多い。`,
    plan: 'みんなを自分の宗教に改宗させたい。',
  },
];

export const characters = [
  {
    name: 'f1',
    textureUrl: '/ai-town/assets/32x32folk.png',
    spritesheetData: f1SpritesheetData,
    speed: 0.1,
  },
  {
    name: 'f2',
    textureUrl: '/ai-town/assets/32x32folk.png',
    spritesheetData: f2SpritesheetData,
    speed: 0.1,
  },
  {
    name: 'f3',
    textureUrl: '/ai-town/assets/32x32folk.png',
    spritesheetData: f3SpritesheetData,
    speed: 0.1,
  },
  {
    name: 'f4',
    textureUrl: '/ai-town/assets/32x32folk.png',
    spritesheetData: f4SpritesheetData,
    speed: 0.1,
  },
  {
    name: 'f5',
    textureUrl: '/ai-town/assets/32x32folk.png',
    spritesheetData: f5SpritesheetData,
    speed: 0.1,
  },
  {
    name: 'f6',
    textureUrl: '/ai-town/assets/32x32folk.png',
    spritesheetData: f6SpritesheetData,
    speed: 0.1,
  },
  {
    name: 'f7',
    textureUrl: '/ai-town/assets/32x32folk.png',
    spritesheetData: f7SpritesheetData,
    speed: 0.1,
  },
  {
    name: 'f8',
    textureUrl: '/ai-town/assets/32x32folk.png',
    spritesheetData: f8SpritesheetData,
    speed: 0.1,
  },
];

// Characters move at 0.75 tiles per second.
export const movementSpeed = 0.75;
