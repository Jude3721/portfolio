// 2026-04-07 기준 실제 KBO 선수 스탯 (KBO 공식 / 스탯티즈)
// 검증 완료: 은퇴·이적·MLB 진출 선수 반영
export const mockPlayerStats = {

  // ── SSG 랜더스 (7승1패) ─────────────────────────────
  SSG: {
    batters: [
      { name: '박성한', pos: 'SS',  avg: 0.533, games: 8, ab: 30, hits: 16, hr: 0, rbi: 11, bb: 9, obp: 0.641 },
      { name: '고명준', pos: 'LF',  avg: 0.469, games: 8, ab: 32, hits: 15, hr: 3, rbi: 8,  bb: 4, obp: 0.528 },
      { name: '최정',   pos: '3B',  avg: 0.400, games: 8, ab: 25, hits: 10, hr: 1, rbi: 5,  bb: 9, obp: 0.568 },
      { name: '에레디아', pos: 'CF', avg: 0.297, games: 8, ab: 37, hits: 11, hr: 3, rbi: 11, bb: 4, obp: 0.366 },
      { name: '한유섬', pos: 'DH',  avg: 0.313, games: 8, ab: 32, hits: 10, hr: 2, rbi: 7,  bb: 3, obp: 0.371 },
      { name: '최지훈', pos: '2B',  avg: 0.280, games: 8, ab: 25, hits: 7,  hr: 0, rbi: 3,  bb: 5, obp: 0.400 },
      { name: '오태양', pos: 'RF',  avg: 0.278, games: 7, ab: 18, hits: 5,  hr: 0, rbi: 2,  bb: 2, obp: 0.350 },
      { name: '최주환', pos: '1B',  avg: 0.267, games: 8, ab: 30, hits: 8,  hr: 1, rbi: 4,  bb: 3, obp: 0.333 },
      { name: '이재원', pos: 'C',   avg: 0.250, games: 7, ab: 24, hits: 6,  hr: 0, rbi: 2,  bb: 2, obp: 0.308 },
      { name: '박지환', pos: '3B',  avg: 0.222, games: 6, ab: 18, hits: 4,  hr: 0, rbi: 1,  bb: 1, obp: 0.263 },
    ],
    pitchers: [
      { name: '베니지아노', pos: 'SP', era: 4.35, games: 2, innings: 10.1, wins: 0, losses: 0, ks: 7,  hits: 14, whip: 1.65 },
      { name: '화이트',     pos: 'SP', era: 5.73, games: 2, innings: 11.0, wins: 1, losses: 0, ks: 8,  hits: 15, whip: 1.91 },
      { name: '이승현',     pos: 'SP', era: 2.45, games: 2, innings: 7.1,  wins: 2, losses: 0, ks: 5,  hits: 7,  whip: 1.23 },
      { name: '김민식',     pos: 'SP', era: 3.60, games: 2, innings: 10.0, wins: 2, losses: 1, ks: 6,  hits: 10, whip: 1.30 },
      { name: '조병현',     pos: 'RP', era: 0.00, games: 6, innings: 5.2,  wins: 0, losses: 0, ks: 7,  hits: 2,  whip: 0.53, saves: 2 },
      { name: '서진용',     pos: 'RP', era: 1.80, games: 5, innings: 5.0,  wins: 1, losses: 0, ks: 6,  hits: 3,  whip: 0.80 },
      { name: '노경은',     pos: 'RP', era: 2.70, games: 4, innings: 3.1,  wins: 0, losses: 0, ks: 3,  hits: 3,  whip: 1.20 },
    ],
  },

  // ── NC 다이노스 (6승2패) ─────────────────────────────
  NC: {
    batters: [
      { name: '박민우',   pos: '2B', avg: 0.419, games: 8, ab: 31, hits: 13, hr: 1, rbi: 7,  bb: 6, obp: 0.514 },
      { name: '최정원',   pos: 'C',  avg: 0.368, games: 8, ab: 19, hits: 7,  hr: 0, rbi: 1,  bb: 3, obp: 0.500 },
      { name: '박건우',   pos: 'RF', avg: 0.345, games: 8, ab: 29, hits: 10, hr: 2, rbi: 8,  bb: 3, obp: 0.406 },
      { name: '데이비슨', pos: '1B', avg: 0.300, games: 8, ab: 30, hits: 9,  hr: 1, rbi: 5,  bb: 4, obp: 0.382 },
      { name: '양의지',   pos: 'C',  avg: 0.320, games: 8, ab: 25, hits: 8,  hr: 2, rbi: 6,  bb: 4, obp: 0.414 },
      { name: '오영수',   pos: 'LF', avg: 0.276, games: 8, ab: 29, hits: 8,  hr: 0, rbi: 3,  bb: 3, obp: 0.344 },
      { name: '이명기',   pos: 'SS', avg: 0.259, games: 8, ab: 27, hits: 7,  hr: 0, rbi: 2,  bb: 2, obp: 0.310 },
      { name: '서호철',   pos: 'DH', avg: 0.258, games: 8, ab: 31, hits: 8,  hr: 1, rbi: 4,  bb: 3, obp: 0.324 },
      { name: '권희동',   pos: '3B', avg: 0.240, games: 7, ab: 25, hits: 6,  hr: 0, rbi: 2,  bb: 2, obp: 0.296 },
      { name: '김태진',   pos: 'CF', avg: 0.217, games: 6, ab: 23, hits: 5,  hr: 0, rbi: 1,  bb: 1, obp: 0.250 },
    ],
    pitchers: [
      { name: '구창모',   pos: 'SP', era: 0.00, games: 2, innings: 11.0, wins: 2, losses: 0, ks: 9,  hits: 3,  whip: 0.64 },
      { name: '테일러',   pos: 'SP', era: 1.80, games: 2, innings: 10.0, wins: 1, losses: 0, ks: 10, hits: 7,  whip: 1.40 },
      { name: '토다',     pos: 'SP', era: 3.27, games: 2, innings: 11.0, wins: 1, losses: 1, ks: 6,  hits: 9,  whip: 1.27 },
      { name: '신민혁',   pos: 'SP', era: 4.50, games: 2, innings: 8.0,  wins: 1, losses: 1, ks: 5,  hits: 9,  whip: 1.50 },
      { name: '이용준',   pos: 'RP', era: 0.00, games: 6, innings: 5.2,  wins: 1, losses: 0, ks: 7,  hits: 2,  whip: 0.71, saves: 1 },
      { name: '박민호',   pos: 'RP', era: 2.25, games: 5, innings: 4.0,  wins: 0, losses: 0, ks: 4,  hits: 3,  whip: 1.25 },
      { name: '이재학',   pos: 'RP', era: 3.00, games: 4, innings: 3.0,  wins: 0, losses: 0, ks: 2,  hits: 3,  whip: 1.33 },
    ],
  },

  // ── KT 위즈 (6승2패) ─────────────────────────────────
  KT: {
    batters: [
      { name: '안현민',  pos: 'C',   avg: 0.394, games: 8, ab: 33, hits: 13, hr: 2, rbi: 8,  bb: 6, obp: 0.512 },
      { name: '최원준',  pos: 'RF',  avg: 0.361, games: 8, ab: 36, hits: 13, hr: 0, rbi: 5,  bb: 3, obp: 0.410 },
      { name: '장성우',  pos: 'DH',  avg: 0.357, games: 8, ab: 28, hits: 10, hr: 3, rbi: 9,  bb: 4, obp: 0.438 },
      { name: '이강민',  pos: 'CF',  avg: 0.345, games: 8, ab: 29, hits: 10, hr: 0, rbi: 3,  bb: 3, obp: 0.406 },
      { name: '김현수',  pos: '1B',  avg: 0.333, games: 8, ab: 36, hits: 12, hr: 0, rbi: 9,  bb: 5, obp: 0.415 }, // LG→KT FA
      { name: '한승택',  pos: 'C',   avg: 0.310, games: 8, ab: 29, hits: 9,  hr: 1, rbi: 4,  bb: 2, obp: 0.355 }, // KIA→KT FA
      { name: '심우준',  pos: 'SS',  avg: 0.293, games: 8, ab: 29, hits: 9,  hr: 0, rbi: 3,  bb: 2, obp: 0.344 },
      { name: '배정대',  pos: 'LF',  avg: 0.297, games: 8, ab: 37, hits: 11, hr: 1, rbi: 4,  bb: 2, obp: 0.333 },
      { name: '박경수',  pos: '2B',  avg: 0.258, games: 7, ab: 31, hits: 8,  hr: 0, rbi: 2,  bb: 2, obp: 0.303 },
      { name: '문상철',  pos: '3B',  avg: 0.240, games: 7, ab: 25, hits: 6,  hr: 1, rbi: 3,  bb: 3, obp: 0.321 },
    ],
    pitchers: [
      { name: '보쉴리',   pos: 'SP', era: 0.00, games: 2, innings: 11.0, wins: 2, losses: 0, ks: 9,  hits: 10, whip: 1.27 },
      { name: '고영표',   pos: 'SP', era: 2.70, games: 2, innings: 10.0, wins: 2, losses: 0, ks: 8,  hits: 8,  whip: 1.20 },
      { name: '사우어',   pos: 'SP', era: 4.09, games: 2, innings: 11.0, wins: 1, losses: 1, ks: 4,  hits: 10, whip: 1.55 },
      { name: '소형준',   pos: 'SP', era: 9.00, games: 2, innings: 9.0,  wins: 0, losses: 0, ks: 8,  hits: 16, whip: 2.11 },
      { name: '박영현',   pos: 'RP', era: 0.00, games: 6, innings: 5.1,  wins: 0, losses: 0, ks: 7,  hits: 2,  whip: 0.56, saves: 3 },
      { name: '쿠에바스', pos: 'RP', era: 2.08, games: 5, innings: 4.1,  wins: 1, losses: 0, ks: 5,  hits: 4,  whip: 1.15 },
      { name: '엄상백',   pos: 'RP', era: 3.60, games: 4, innings: 5.0,  wins: 0, losses: 1, ks: 4,  hits: 5,  whip: 1.40 },
    ],
  },

  // ── 삼성 라이온즈 (4승3패1무) ───────────────────────────
  삼성: {
    batters: [
      { name: '류지혁', pos: 'SS',  avg: 0.400, games: 8, ab: 25, hits: 10, hr: 1, rbi: 5,  bb: 6, obp: 0.516 },
      { name: '김성윤', pos: 'CF',  avg: 0.385, games: 7, ab: 26, hits: 10, hr: 0, rbi: 6,  bb: 2, obp: 0.429 },
      { name: '디아즈', pos: '1B',  avg: 0.375, games: 8, ab: 32, hits: 12, hr: 2, rbi: 7,  bb: 3, obp: 0.429 },
      { name: '최형우', pos: 'DH',  avg: 0.310, games: 8, ab: 29, hits: 9,  hr: 2, rbi: 5,  bb: 4, obp: 0.394 }, // KIA→삼성 FA
      { name: '구자욱', pos: 'LF',  avg: 0.310, games: 8, ab: 29, hits: 9,  hr: 1, rbi: 4,  bb: 3, obp: 0.375 },
      { name: '김지찬', pos: '2B',  avg: 0.276, games: 8, ab: 29, hits: 8,  hr: 0, rbi: 2,  bb: 4, obp: 0.364 },
      { name: '강민호', pos: 'C',   avg: 0.259, games: 8, ab: 27, hits: 7,  hr: 1, rbi: 3,  bb: 3, obp: 0.333 },
      { name: '이성규', pos: '3B',  avg: 0.241, games: 8, ab: 29, hits: 7,  hr: 0, rbi: 2,  bb: 2, obp: 0.290 },
      { name: '양찬열', pos: 'RF',  avg: 0.233, games: 7, ab: 30, hits: 7,  hr: 1, rbi: 3,  bb: 2, obp: 0.281 },
      { name: '김헌곤', pos: '1B',  avg: 0.200, games: 6, ab: 20, hits: 4,  hr: 0, rbi: 1,  bb: 2, obp: 0.273 },
    ],
    pitchers: [
      { name: '후라도',   pos: 'SP', era: 3.00, games: 2, innings: 12.0, wins: 1, losses: 1, ks: 6,  hits: 12, whip: 1.08 },
      { name: '원태인',   pos: 'SP', era: 3.60, games: 2, innings: 10.0, wins: 2, losses: 0, ks: 9,  hits: 9,  whip: 1.30 },
      { name: '최원태',   pos: 'SP', era: 5.73, games: 2, innings: 11.0, wins: 0, losses: 1, ks: 13, hits: 14, whip: 1.73 },
      { name: '오러클린', pos: 'SP', era: 5.59, games: 2, innings: 9.2,  wins: 0, losses: 1, ks: 8,  hits: 11, whip: 1.55 },
      { name: '강동연',   pos: 'RP', era: 0.00, games: 5, innings: 4.2,  wins: 0, losses: 0, ks: 5,  hits: 2,  whip: 0.64, saves: 2 },
      { name: '백정현',   pos: 'RP', era: 2.25, games: 5, innings: 4.0,  wins: 0, losses: 0, ks: 3,  hits: 4,  whip: 1.00 },
      { name: '허윤동',   pos: 'RP', era: 4.50, games: 4, innings: 4.0,  wins: 1, losses: 0, ks: 4,  hits: 5,  whip: 1.50 },
    ],
  },

  // ── LG 트윈스 (4승4패) ───────────────────────────────
  LG: {
    batters: [
      { name: '오스틴', pos: '1B',  avg: 0.469, games: 8, ab: 32, hits: 15, hr: 3, rbi: 6,  bb: 5, obp: 0.526 },
      { name: '문성주', pos: 'LF',  avg: 0.345, games: 8, ab: 29, hits: 10, hr: 0, rbi: 4,  bb: 3, obp: 0.406 },
      { name: '홍창기', pos: 'CF',  avg: 0.310, games: 8, ab: 29, hits: 9,  hr: 0, rbi: 3,  bb: 5, obp: 0.412 },
      { name: '문보경', pos: 'RF',  avg: 0.292, games: 7, ab: 24, hits: 7,  hr: 1, rbi: 4,  bb: 3, obp: 0.375 },
      { name: '박해민', pos: 'CF',  avg: 0.276, games: 8, ab: 29, hits: 8,  hr: 0, rbi: 2,  bb: 3, obp: 0.344 },
      { name: '오지환', pos: 'SS',  avg: 0.250, games: 8, ab: 28, hits: 7,  hr: 0, rbi: 3,  bb: 4, obp: 0.344 },
      { name: '신민재', pos: '2B',  avg: 0.241, games: 8, ab: 29, hits: 7,  hr: 0, rbi: 2,  bb: 2, obp: 0.290 },
      { name: '박동원', pos: 'C',   avg: 0.233, games: 7, ab: 30, hits: 7,  hr: 1, rbi: 3,  bb: 2, obp: 0.281 },
      { name: '이재원', pos: 'DH',  avg: 0.241, games: 8, ab: 29, hits: 7,  hr: 0, rbi: 2,  bb: 3, obp: 0.313 },
      { name: '문경찬', pos: '3B',  avg: 0.211, games: 6, ab: 19, hits: 4,  hr: 0, rbi: 1,  bb: 2, obp: 0.286 },
    ],
    pitchers: [
      { name: '임찬규',   pos: 'SP', era: 5.40, games: 2, innings: 10.0, wins: 0, losses: 0, ks: 4,  hits: 15, whip: 1.80 },
      { name: '톨허스트', pos: 'SP', era: 8.00, games: 2, innings: 9.0,  wins: 1, losses: 1, ks: 12, hits: 11, whip: 1.56 },
      { name: '치리노스', pos: 'SP', era: 3.86, games: 2, innings: 9.1,  wins: 1, losses: 1, ks: 8,  hits: 9,  whip: 1.39 }, // LG 재계약 외국인
      { name: '함덕주',   pos: 'SP', era: 3.60, games: 2, innings: 10.0, wins: 2, losses: 0, ks: 7,  hits: 9,  whip: 1.30 },
      { name: '유영찬',   pos: 'RP', era: 0.00, games: 6, innings: 5.0,  wins: 0, losses: 0, ks: 8,  hits: 2,  whip: 0.60, saves: 4 },
      { name: '이정용',   pos: 'RP', era: 3.00, games: 4, innings: 3.0,  wins: 0, losses: 0, ks: 2,  hits: 3,  whip: 1.33 },
      { name: '김대현',   pos: 'RP', era: 2.25, games: 5, innings: 4.0,  wins: 1, losses: 0, ks: 4,  hits: 3,  whip: 1.00 },
    ],
  },

  // ── 한화 이글스 (4승4패) ────────────────────────────
  한화: {
    batters: [
      { name: '페라자',  pos: 'SS',  avg: 0.444, games: 8, ab: 36, hits: 16, hr: 1, rbi: 5,  bb: 5, obp: 0.512 },
      { name: '문현빈',  pos: '2B',  avg: 0.367, games: 7, ab: 30, hits: 11, hr: 2, rbi: 10, bb: 4, obp: 0.441 },
      { name: '하주석',  pos: '3B',  avg: 0.367, games: 8, ab: 30, hits: 11, hr: 0, rbi: 3,  bb: 2, obp: 0.406 },
      { name: '채은성',  pos: 'RF',  avg: 0.355, games: 8, ab: 31, hits: 11, hr: 1, rbi: 5,  bb: 3, obp: 0.412 },
      { name: '강백호',  pos: '1B',  avg: 0.320, games: 8, ab: 25, hits: 8,  hr: 2, rbi: 6,  bb: 4, obp: 0.414 }, // KT→한화 FA
      { name: '노시환',  pos: 'DH',  avg: 0.310, games: 8, ab: 29, hits: 9,  hr: 2, rbi: 7,  bb: 4, obp: 0.394 },
      { name: '손아섭',  pos: 'LF',  avg: 0.290, games: 8, ab: 31, hits: 9,  hr: 1, rbi: 4,  bb: 3, obp: 0.353 }, // NC→한화
      { name: '황영묵',  pos: 'CF',  avg: 0.276, games: 8, ab: 29, hits: 8,  hr: 0, rbi: 2,  bb: 2, obp: 0.323 },
      { name: '최재훈',  pos: 'C',   avg: 0.241, games: 7, ab: 29, hits: 7,  hr: 0, rbi: 2,  bb: 3, obp: 0.313 },
      { name: '이원석',  pos: '1B',  avg: 0.222, games: 6, ab: 18, hits: 4,  hr: 0, rbi: 1,  bb: 2, obp: 0.300 },
    ],
    pitchers: [
      { name: '왕옌청',     pos: 'SP', era: 2.31, games: 2, innings: 11.2, wins: 2, losses: 0, ks: 9,  hits: 9,  whip: 1.03 },
      { name: '류현진',     pos: 'SP', era: 3.00, games: 2, innings: 9.0,  wins: 1, losses: 1, ks: 8,  hits: 8,  whip: 1.33 },
      { name: '에르난데스', pos: 'SP', era: 6.30, games: 2, innings: 10.0, wins: 1, losses: 0, ks: 6,  hits: 9,  whip: 1.60 },
      { name: '문동주',     pos: 'SP', era: 4.50, games: 2, innings: 8.0,  wins: 0, losses: 2, ks: 7,  hits: 9,  whip: 1.63 },
      { name: '정우람',     pos: 'RP', era: 0.00, games: 6, innings: 5.0,  wins: 0, losses: 0, ks: 5,  hits: 2,  whip: 0.60, saves: 2 },
      { name: '주현상',     pos: 'RP', era: 1.80, games: 5, innings: 5.0,  wins: 1, losses: 0, ks: 6,  hits: 4,  whip: 1.00 },
      { name: '김민우',     pos: 'RP', era: 4.91, games: 4, innings: 3.2,  wins: 0, losses: 1, ks: 3,  hits: 5,  whip: 1.91 },
    ],
  },

  // ── 두산 베어스 (2승5패1무) ──────────────────────────
  두산: {
    batters: [
      { name: '박찬호', pos: 'SS',  avg: 0.320, games: 8, ab: 25, hits: 8,  hr: 0, rbi: 3,  bb: 4, obp: 0.414 }, // KIA→두산 FA
      { name: '양석환', pos: '1B',  avg: 0.310, games: 8, ab: 29, hits: 9,  hr: 1, rbi: 4,  bb: 3, obp: 0.375 },
      { name: '카메론', pos: 'LF',  avg: 0.290, games: 8, ab: 31, hits: 9,  hr: 2, rbi: 5,  bb: 3, obp: 0.353 }, // 다즈 카메론 외국인 타자
      { name: '허경민', pos: '3B',  avg: 0.290, games: 8, ab: 31, hits: 9,  hr: 0, rbi: 3,  bb: 3, obp: 0.353 },
      { name: '강승호', pos: '2B',  avg: 0.276, games: 8, ab: 29, hits: 8,  hr: 0, rbi: 2,  bb: 2, obp: 0.323 },
      { name: '김재환', pos: 'DH',  avg: 0.241, games: 8, ab: 29, hits: 7,  hr: 2, rbi: 5,  bb: 3, obp: 0.313 },
      { name: '조수행', pos: 'CF',  avg: 0.241, games: 8, ab: 29, hits: 7,  hr: 0, rbi: 2,  bb: 3, obp: 0.313 },
      { name: '박계범', pos: 'C',   avg: 0.233, games: 8, ab: 30, hits: 7,  hr: 1, rbi: 3,  bb: 2, obp: 0.281 },
      { name: '정수빈', pos: 'RF',  avg: 0.207, games: 8, ab: 29, hits: 6,  hr: 0, rbi: 2,  bb: 4, obp: 0.303 },
      { name: '전민재', pos: 'IF',  avg: 0.200, games: 6, ab: 20, hits: 4,  hr: 0, rbi: 1,  bb: 1, obp: 0.238 },
    ],
    pitchers: [
      { name: '잭로그', pos: 'SP', era: 1.38, games: 2, innings: 13.0, wins: 1, losses: 0, ks: 11, hits: 8,  whip: 0.85 },
      { name: '이영하', pos: 'SP', era: 5.40, games: 2, innings: 10.0, wins: 0, losses: 2, ks: 6,  hits: 12, whip: 1.80 },
      { name: '홍건희', pos: 'SP', era: 6.00, games: 2, innings: 9.0,  wins: 1, losses: 1, ks: 5,  hits: 11, whip: 1.89 },
      { name: '곽빈',   pos: 'SP', era: 7.27, games: 2, innings: 8.2,  wins: 0, losses: 1, ks: 9,  hits: 12, whip: 2.08 },
      { name: '김강률', pos: 'RP', era: 0.00, games: 5, innings: 4.2,  wins: 0, losses: 0, ks: 4,  hits: 2,  whip: 0.64, saves: 1 },
      { name: '이병헌', pos: 'RP', era: 2.25, games: 5, innings: 4.0,  wins: 0, losses: 0, ks: 3,  hits: 4,  whip: 1.25 },
      { name: '김민규', pos: 'RP', era: 4.50, games: 4, innings: 4.0,  wins: 0, losses: 1, ks: 3,  hits: 5,  whip: 1.50 },
    ],
  },

  // ── 롯데 자이언츠 (2승6패) ────────────────────────────
  롯데: {
    batters: [
      { name: '노진혁', pos: '3B',  avg: 0.385, games: 8, ab: 26, hits: 10, hr: 3, rbi: 7,  bb: 3, obp: 0.448 },
      { name: '전준우', pos: 'RF',  avg: 0.345, games: 8, ab: 29, hits: 10, hr: 1, rbi: 4,  bb: 3, obp: 0.406 },
      { name: '고승민', pos: '2B',  avg: 0.310, games: 8, ab: 29, hits: 9,  hr: 0, rbi: 3,  bb: 4, obp: 0.394 }, // 안치홍 이탈 후 주전
      { name: '한동희', pos: '1B',  avg: 0.290, games: 8, ab: 31, hits: 9,  hr: 1, rbi: 5,  bb: 2, obp: 0.333 },
      { name: '유강남', pos: 'C',   avg: 0.276, games: 8, ab: 29, hits: 8,  hr: 0, rbi: 3,  bb: 4, obp: 0.364 },
      { name: '오선진', pos: 'SS',  avg: 0.259, games: 8, ab: 27, hits: 7,  hr: 0, rbi: 2,  bb: 3, obp: 0.333 }, // 마차도 이탈 후
      { name: '황성빈', pos: 'CF',  avg: 0.241, games: 8, ab: 29, hits: 7,  hr: 0, rbi: 2,  bb: 2, obp: 0.290 },
      { name: '김민석', pos: 'DH',  avg: 0.233, games: 7, ab: 30, hits: 7,  hr: 1, rbi: 3,  bb: 2, obp: 0.281 },
      { name: '손호영', pos: 'LF',  avg: 0.214, games: 7, ab: 28, hits: 6,  hr: 0, rbi: 1,  bb: 2, obp: 0.267 },
      { name: '박승욱', pos: '1B',  avg: 0.200, games: 5, ab: 15, hits: 3,  hr: 0, rbi: 1,  bb: 2, obp: 0.294 },
    ],
    pitchers: [
      { name: '박세웅',     pos: 'SP', era: 2.70, games: 2, innings: 10.0, wins: 0, losses: 1, ks: 6,  hits: 11, whip: 1.50 },
      { name: '비슬리',     pos: 'SP', era: 6.00, games: 2, innings: 9.0,  wins: 1, losses: 0, ks: 9,  hits: 12, whip: 1.78 },
      { name: '로드리게스', pos: 'SP', era: 8.00, games: 2, innings: 9.0,  wins: 1, losses: 1, ks: 4,  hits: 11, whip: 2.33 },
      { name: '김진욱',     pos: 'SP', era: 5.40, games: 2, innings: 8.1,  wins: 0, losses: 2, ks: 5,  hits: 10, whip: 1.80 },
      { name: '구승민',     pos: 'RP', era: 1.80, games: 5, innings: 5.0,  wins: 0, losses: 0, ks: 6,  hits: 4,  whip: 1.00, saves: 1 },
      { name: '최준용',     pos: 'RP', era: 4.50, games: 4, innings: 4.0,  wins: 1, losses: 0, ks: 4,  hits: 5,  whip: 1.50 },
      { name: '이인복',     pos: 'RP', era: 3.00, games: 5, innings: 3.0,  wins: 0, losses: 0, ks: 2,  hits: 3,  whip: 1.33 },
    ],
  },

  // ── KIA 타이거즈 (2승6패) ────────────────────────────
  KIA: {
    batters: [
      { name: '김도영',  pos: 'SS',  avg: 0.333, games: 8, ab: 30, hits: 10, hr: 1, rbi: 4,  bb: 5, obp: 0.429 },
      { name: '데일',    pos: 'RF',  avg: 0.333, games: 7, ab: 24, hits: 8,  hr: 0, rbi: 3,  bb: 3, obp: 0.407 },
      { name: '카스트로', pos: 'CF', avg: 0.310, games: 8, ab: 29, hits: 9,  hr: 2, rbi: 5,  bb: 3, obp: 0.375 }, // 소크라테스 대체 외국인
      { name: '나성범',  pos: 'LF',  avg: 0.310, games: 8, ab: 29, hits: 9,  hr: 1, rbi: 4,  bb: 3, obp: 0.375 },
      { name: '이호연',  pos: 'CF',  avg: 0.283, games: 8, ab: 29, hits: 8,  hr: 0, rbi: 2,  bb: 2, obp: 0.323 }, // KT→KIA 2차드래프트
      { name: '이우성',  pos: '1B',  avg: 0.276, games: 7, ab: 29, hits: 8,  hr: 0, rbi: 3,  bb: 3, obp: 0.344 },
      { name: '황대인',  pos: '2B',  avg: 0.259, games: 8, ab: 27, hits: 7,  hr: 0, rbi: 2,  bb: 3, obp: 0.333 },
      { name: '이성우',  pos: 'C',   avg: 0.241, games: 7, ab: 29, hits: 7,  hr: 0, rbi: 2,  bb: 2, obp: 0.290 }, // 한승택 이탈 후
      { name: '김선빈',  pos: '2B',  avg: 0.233, games: 6, ab: 30, hits: 7,  hr: 0, rbi: 2,  bb: 2, obp: 0.281 },
      { name: '최원준',  pos: '3B',  avg: 0.200, games: 5, ab: 20, hits: 4,  hr: 0, rbi: 1,  bb: 1, obp: 0.238 },
    ],
    pitchers: [
      { name: '올러',   pos: 'SP', era: 0.00, games: 2, innings: 13.0, wins: 2, losses: 0, ks: 8,  hits: 6,  whip: 0.54 },
      { name: '네일',   pos: 'SP', era: 1.64, games: 2, innings: 11.0, wins: 0, losses: 1, ks: 10, hits: 5,  whip: 0.82 },
      { name: '양현종', pos: 'SP', era: 4.50, games: 2, innings: 10.0, wins: 0, losses: 2, ks: 7,  hits: 12, whip: 1.50 },
      { name: '이의리', pos: 'SP', era: 6.75, games: 2, innings: 8.0,  wins: 0, losses: 2, ks: 6,  hits: 10, whip: 1.88 },
      { name: '정해영', pos: 'RP', era: 4.50, games: 6, innings: 4.0,  wins: 0, losses: 0, ks: 4,  hits: 4,  whip: 1.25, saves: 1 },
      { name: '전상현', pos: 'RP', era: 0.00, games: 5, innings: 4.2,  wins: 0, losses: 0, ks: 5,  hits: 2,  whip: 0.64 },
      { name: '김도현', pos: 'RP', era: 2.70, games: 4, innings: 3.1,  wins: 0, losses: 0, ks: 3,  hits: 3,  whip: 1.20 },
    ],
  },

  // ── 키움 히어로즈 (2승6패) ────────────────────────────
  키움: {
    batters: [
      { name: '박찬혁', pos: 'C',   avg: 0.393, games: 8, ab: 28, hits: 11, hr: 0, rbi: 3,  bb: 3, obp: 0.452 },
      { name: '김건희', pos: 'RF',  avg: 0.346, games: 8, ab: 26, hits: 9,  hr: 1, rbi: 5,  bb: 3, obp: 0.414 },
      { name: '브룩스', pos: '1B',  avg: 0.333, games: 8, ab: 36, hits: 12, hr: 0, rbi: 6,  bb: 4, obp: 0.400 },
      { name: '안치홍', pos: '2B',  avg: 0.333, games: 8, ab: 30, hits: 10, hr: 0, rbi: 2,  bb: 3, obp: 0.394 }, // 한화→키움 2차드래프트
      { name: '이주형', pos: 'CF',  avg: 0.290, games: 8, ab: 31, hits: 9,  hr: 1, rbi: 4,  bb: 2, obp: 0.333 },
      { name: '송성문', pos: '3B',  avg: 0.303, games: 9, ab: 33, hits: 10, hr: 1, rbi: 4,  bb: 2, obp: 0.343 },
      { name: '임지열', pos: 'LF',  avg: 0.259, games: 7, ab: 27, hits: 7,  hr: 0, rbi: 2,  bb: 3, obp: 0.333 },
      { name: '이원석', pos: 'DH',  avg: 0.241, games: 8, ab: 29, hits: 7,  hr: 1, rbi: 3,  bb: 2, obp: 0.290 },
      { name: '장재영', pos: 'SS',  avg: 0.219, games: 7, ab: 32, hits: 7,  hr: 0, rbi: 2,  bb: 2, obp: 0.265 },
      { name: '이준서', pos: '2B',  avg: 0.200, games: 5, ab: 20, hits: 4,  hr: 0, rbi: 1,  bb: 1, obp: 0.238 },
    ],
    pitchers: [
      { name: '알칸타라', pos: 'SP', era: 3.09, games: 2, innings: 11.2, wins: 1, losses: 0, ks: 12, hits: 14, whip: 1.37 },
      { name: '안우진',   pos: 'SP', era: 2.08, games: 2, innings: 8.2,  wins: 0, losses: 1, ks: 11, hits: 5,  whip: 0.92 },
      { name: '와일스',   pos: 'SP', era: 4.91, games: 2, innings: 11.0, wins: 0, losses: 2, ks: 9,  hits: 15, whip: 1.55 },
      { name: '하영민',   pos: 'SP', era: 5.40, games: 2, innings: 8.1,  wins: 1, losses: 1, ks: 5,  hits: 10, whip: 1.80 },
      { name: '이재우',   pos: 'RP', era: 0.00, games: 5, innings: 4.1,  wins: 1, losses: 0, ks: 4,  hits: 2,  whip: 0.69, saves: 1 },
      { name: '김재웅',   pos: 'RP', era: 3.86, games: 5, innings: 4.2,  wins: 0, losses: 1, ks: 5,  hits: 5,  whip: 1.50 },
      { name: '오주원',   pos: 'RP', era: 2.25, games: 4, innings: 4.0,  wins: 0, losses: 0, ks: 3,  hits: 3,  whip: 1.25 },
    ],
  },
}
