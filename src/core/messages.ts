import { MamaMood, MamaErrorExpression, Locale } from '../shared/types';

type MoodKey = MamaMood | MamaErrorExpression | 'fiveHourWarning';

const MESSAGE_POOLS: Record<Locale, Record<MoodKey, string[]>> = {
  ko: {
    angry: [
      '오늘 하나도 안 썼지?!',
      '엄마가 실망했어...',
      'Claude한테 미안하지도 않아?',
      '한도가 썩고 있잖아!',
      '밥은 남기면서 토큰은 아끼니?',
    ],
    worried: [
      '어머...좌보다 적네',
      '좀 더 써봐...',
      '이러다 한도 남겨요?',
      '엄마는 네가 걱정이야...',
      '다른 애들은 다 쓰던데...',
    ],
    happy: [
      '잘하고 있네~',
      '우리 아들/딸 역시!',
      '그래 이 맛이야~',
      '오늘 엄마가 기분 좋다~',
      '이 정도면 합격이야!',
    ],
    proud: [
      '엄마가 자랑스럽다!',
      '다 썼어?! 장하다!',
      '효도했네~',
      '이런 날엔 엄마가 치킨 사줄게~',
      '완벽해! 눈물 나온다...',
    ],
    confused: [
      '엄마가 확인을 못 하겠어...',
      '뭔가 잘못됐나봐...',
      '잠깐만 기다려봐...',
    ],
    sleeping: [
      '로그인부터 해!',
      'Claude Code 먼저 켜야지!',
    ],
    fiveHourWarning: [
      '잠깐 쉬어가자~ 5시간 한도 거의 다 찼어!',
      '좀 쉬엄쉬엄 해~',
    ],
  },
  en: {
    angry: [
      "You haven't used any today?!",
      "Mom is disappointed...",
      "Don't you feel bad for Claude?",
      "Your quota is rotting away!",
      "You waste food but save tokens?",
    ],
    worried: [
      "Hmm...less than yesterday",
      "Try using a bit more...",
      "Gonna leave your quota unused?",
      "Mom is worried about you...",
      "Everyone else is using theirs...",
    ],
    happy: [
      "Doing great~",
      "That's my kid!",
      "Now that's what I like~",
      "Mom's in a good mood today~",
      "That's a passing grade!",
    ],
    proud: [
      "Mom is so proud!",
      "Used it all?! Amazing!",
      "What a good child~",
      "Mom's buying chicken tonight~",
      "Perfect! I'm tearing up...",
    ],
    confused: [
      "Mom can't check right now...",
      "Something went wrong...",
      "Hold on a sec...",
    ],
    sleeping: [
      "Log in first!",
      "Start Claude Code first!",
    ],
    fiveHourWarning: [
      "Take a break~ 5-hour limit almost reached!",
      "Slow down a bit~",
    ],
  },
  ja: {
    angry: [
      '今日は全然使ってないでしょ？！',
      'ママがっかりだわ...',
      'Claudeに申し訳ないと思わないの？',
      '限度が腐ってるじゃない！',
      'ご飯は残すのにトークンはケチるの？',
    ],
    worried: [
      'あら...昨日より少ないわね',
      'もうちょっと使ってみて...',
      'このまま限度余らせるの？',
      'ママ、あなたが心配よ...',
      '他の子はみんな使ってるのに...',
    ],
    happy: [
      'いい調子ね〜',
      'さすがうちの子！',
      'そうそう、この調子〜',
      '今日はママ機嫌いいわ〜',
      'これなら合格よ！',
    ],
    proud: [
      'ママ誇らしいわ！',
      '全部使ったの？！偉い！',
      '親孝行ね〜',
      'こんな日はママがチキン奢るわ〜',
      '完璧！涙が出ちゃう...',
    ],
    confused: [
      'ママ確認できないわ...',
      '何かおかしいみたい...',
      'ちょっと待ってね...',
    ],
    sleeping: [
      'まずログインして！',
      'Claude Codeを先に起動して！',
    ],
    fiveHourWarning: [
      'ちょっと休もう〜5時間の限度がもうすぐよ！',
      'ゆっくりやりなさい〜',
    ],
  },
  zh: {
    angry: [
      '今天一点都没用？！',
      '妈妈好失望...',
      '你不觉得对不起Claude吗？',
      '额度都在发霉了！',
      '饭可以剩，token也要省？',
    ],
    worried: [
      '嗯...比昨天少呢',
      '再多用一点吧...',
      '这样下去额度要剩了哦',
      '妈妈担心你啊...',
      '别的孩子都在用呢...',
    ],
    happy: [
      '做得不错~',
      '不愧是我的孩子！',
      '对嘛，就要这样~',
      '今天妈妈心情好~',
      '这个程度算及格了！',
    ],
    proud: [
      '妈妈好骄傲！',
      '都用完了？！真棒！',
      '真孝顺~',
      '今天妈妈请你吃炸鸡~',
      '完美！要哭了...',
    ],
    confused: [
      '妈妈查不到了...',
      '好像出了什么问题...',
      '等一下下...',
    ],
    sleeping: [
      '先登录吧！',
      '先打开Claude Code！',
    ],
    fiveHourWarning: [
      '休息一下吧~5小时额度快满了！',
      '慢慢来~',
    ],
  },
};

/**
 * Returns a message for the given mood and locale, stable within the same 5-minute window.
 */
export function getMessage(mood: MoodKey, locale: Locale = 'ko'): string {
  const pool = MESSAGE_POOLS[locale]?.[mood] ?? MESSAGE_POOLS.ko[mood];
  const windowSeed = Math.floor(Date.now() / 300_000);
  const index = windowSeed % pool.length;
  return pool[index];
}

export { MESSAGE_POOLS };
