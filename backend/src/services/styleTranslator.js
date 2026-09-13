const knownReferences = [
  "aespa",
  "newjeans",
  "blackpink",
  "ive",
  "le sserafim",
  "lesserafim",
  "吒",
  "炽",
  "芙","兔","墨","apink","illit","babymonster","meovv","喵","kiss of life","吻","idle","娃","tara","t-ara","txt","档","TommorrowXTogether","straykids","套","WonderGirls","treasure","riize",
  "twice",
  "red velvet",
  "itzy",
  "gidle",
  "(g)i-dle",
  "bts",
  "exo",
  "少女时代",
  "防弹",
  "周杰伦",
  "蔡依林",
  "王菲",
  "邓紫棋"
];
const styleHints = [
  // ===== 女团 / K-pop 通用 =====
  {
    match: /女团|出道|k-?pop|舞台|唱跳|center|打歌/i,
    text: "idol pop debut single, choreography-friendly structure, polished production, catchy hook, strong chorus payoff, stage-ready arrangement"
  },

  // ===== aespa / 吒：赛博、未来、电子、金属质感 =====
  {
    match: /aespa|吒团|吒女|电子|赛博|未来|金属|ai感|虚拟|机械|冷感/i,
    text: "sleek electropop, futuristic synth bass, metallic percussion, glossy digital textures, glitchy transitions, confident chant hooks, high-concept cyber atmosphere"
  },

  // ===== NewJeans / 清爽、Y2K、UK garage、少女日常感 =====
  {
    match: /new\s*jeans|newjeans|牛仔裤|清爽|青春|夏天|校园|y2k|uk\s*garage|轻盈|日常感/i,
    text: "fresh dance pop with UK garage influence, airy chords, bouncy drums, soft bass groove, youthful melodies, intimate conversational vocal texture, relaxed summer mood"
  },

  // ===== BLACKPINK / 墨：girl crush、hip-hop pop、拽感 =====
  {
    match: /blackpink|粉墨|墨团|墨女|girl\s*crush|拽|女王|swag|霸气|trap|hip\s*hop/i,
    text: "bold girl-crush pop, hip-hop influenced drums, heavy bass, confident rap section, sharp pre-chorus build, explosive chorus drop, luxury performance energy"
  },

  // ===== IVE / 芙：高级、优雅、runway、闪亮流行 =====
  {
    match: /ive|芙团|芙女|优雅|高级|贵气|runway|闪耀|自信美/i,
    text: "elegant glossy pop, runway-like confidence, shimmering synths, refined bassline, graceful melodic chorus, luxurious and self-assured idol performance mood"
  },

  // ===== LE SSERAFIM / 炽：强韧、运动感、极简低频、自信 =====
  {
    match: /le\s*sserafim|lesserafim|炽团|炽女|强韧|无畏|运动感|健身|低频|自律|酷飒/i,
    text: "minimalist confident pop, athletic rhythm, tight bass groove, dry punchy drums, chant-like hooks, fearless lyrics about ambition and self-discipline"
  },

  // ===== ILLIT：梦幻、少女、轻电子、可爱但不幼稚 =====
  {
    match: /illit|梦核|梦幻少女|软萌|甜酷|少女幻想|轻电子|闪粉/i,
    text: "dreamy teen pop, soft electronic textures, sparkling synth arpeggios, delicate vocal layers, sweet but modern chorus, fantasy-like youthful atmosphere"
  },

  // ===== BABYMONSTER：YG 系、强唱功、hip-hop、强新人感 =====
  {
    match: /babymonster|baby\s*monster|怪物新人|yg|强唱功|大嗓|rap\s*part|新人王/i,
    text: "high-impact hip-hop pop debut, powerful vocal moments, confident rap verses, heavy drums, bold bass, dramatic build-ups, rookie energy with strong stage presence"
  },

  // ===== MEOVV / 喵：冷感、时尚、极简、猫系 =====
  {
    match: /meovv|喵团|喵女|猫系|冷感|时尚|极简|高级冷/i,
    text: "minimal chic pop, cool fashion-forward mood, restrained bass groove, sleek percussion, understated vocal attitude, stylish and mysterious idol aura"
  },

  // ===== KISS OF LIFE / 吻：Y2K、R&B、成熟女团、live感 =====
  {
    match: /kiss\s*of\s*life|吻团|吻女|成熟女团|y2k\s*r&b|复古性感|live感|vocal女团/i,
    text: "Y2K R&B pop, groovy bassline, warm keys, mature vocal tone, confident feminine energy, soulful ad-libs, retro yet modern pop production"
  },

  // ===== (G)I-DLE / 娃：概念强、戏剧感、女王感、另类流行 =====
  {
    match: /gidle|\(g\)i-?dle|idle|娃团|娃女|概念|戏剧|女王|叛逆|另类|拉丁/i,
    text: "concept-driven alternative pop, theatrical arrangement, bold lyrical attitude, dramatic hooks, charismatic vocal delivery, distinctive group identity, unconventional pop structure"
  },

  // ===== TWICE / 兔瓦斯：元气、甜美、明亮、成瘾副歌 =====
  {
    match: /twice|兔瓦斯|兔|元气|甜美|可爱|bright\s*pop|bubblegum|活力/i,
    text: "bright bubblegum pop, energetic drums, colorful synths, sweet melodic hooks, cheerful group vocals, addictive chorus, feel-good idol energy"
  },

  // ===== Red Velvet：梦幻怪诞 / R&B velvet 感 =====
  {
    match: /red\s*velvet|红贝贝|贝贝|怪诞|梦幻|velvet|丝绒|诡异甜美/i,
    text: "sophisticated pop with dreamy R&B colors, lush harmonies, quirky melodic details, velvet-like vocal layers, elegant but slightly mysterious atmosphere"
  },

  // ===== ITZY：teen crush、自信、运动感、强节奏 =====
  {
    match: /itzy|梯团|teen\s*crush|自信|做自己|酷女孩|强节奏/i,
    text: "teen-crush dance pop, punchy drums, confident spoken hooks, energetic synth riffs, bold self-empowerment lyrics, sharp choreography-ready sections"
  },

  // ===== Apink：清纯、二代女团、旋律性强 =====
  {
    match: /apink|清纯|初恋感|二代清纯|温柔女团/i,
    text: "innocent melodic pop, hiphop drum,bright piano and guitar colors, gentle synth pads, sweet vocal harmonies, nostalgic first-love mood, clear and memorable chorus"
  },

  // ===== T-ara：复古舞曲、Eurodance、强旋律 =====
  {
    match: /t-?ara|tara|皇冠|复古舞曲|二代舞曲|eurodance|disco/i,
    text: "retro dance pop, Eurodance-inspired beat, strong repetitive hook, bright synth leads, dramatic melodic chorus, nostalgic club-pop energy"
  },

  // ===== Wonder Girls：复古、disco、funk、合成器 =====
  {
    match: /wonder\s*girls|wondergirls|复古女团|disco|funk|八十年代|合成器复古/i,
    text: "retro disco pop, funky guitar, vintage synths, steady dance groove, charming group vocals, nostalgic but polished pop arrangement"
  },

  // ===== TXT / 档：少年感、成长痛、梦幻流行摇滚 =====
  {
    match: /txt|tomorrow\s*x\s*together|tomorrowxtogether|档团|档|少年感|成长痛|青春疼痛|梦幻男团/i,
    text: "youthful boy-group pop, emotional coming-of-age theme, dreamy synth layers,obvious acoustic guitar, pop-rock colors, bright yet bittersweet chorus, cinematic teen energy"
  },

  // ===== Stray Kids / 迷孩：强烈、trap、工业、爆发力 =====
  {
    match: /stray\s*kids|straykids|skz|迷孩|迷子|强烈|工业|噪音|爆裂|硬核|暗黑男团/i,
    text: "high-energy trap-pop, industrial percussion, aggressive bass, rapid rap sections, explosive transitions, intense performance-driven structure"
  },

  // ===== TREASURE：明亮男团、青春、YG流行感 =====
  {
    match: /treasure|盒|宝石|明亮男团|青春男团|清爽男团/i,
    text: "bright boy-group pop with synth pop, youthful vocal energy, playful synths, rhythmic rap break, uplifting chorus, clean and optimistic performance mood"
  },

  // ===== RIIZE：清爽男团、吉他、怀旧、情绪青春 =====
  {
    match: /riize|清爽男团|情绪男团|怀旧青春|吉他男团|初恋男团/i,
    text: "fresh emotional boy-group pop, nostalgic guitar textures, warm and soft synths, smooth groove, youthful vocal tone, sentimental but hopeful chorus"
  },

  // ===== BTS / 防弹 / 套：热血、治愈、少年成长、群像感 =====
  {
    match: /bts|防弹|套|套|热血|治愈|少年成长|梦想|群像|青春宣言/i,
    text: "emotional idol pop anthem, hopeful lyrics about youth and dreams, powerful group chorus, warm synth layers, dynamic rap and vocal contrast, uplifting stadium-ready build"
  },

  // ===== EXO：华丽、R&B、强vocal、戏剧男团 =====
  {
    match: /exo|茶蛋|行星|华丽男团|强vocal|咆哮感|r&b男团/i,
    text: "polished male idol pop with R&B influence, dramatic harmonies, smooth vocal runs, sleek bassline, grand chorus arrangement, luxurious and powerful performance mood"
  },

  // ===== 少女时代：经典女团、明亮、anthem、二代感 =====
  {
    match: /少女时代|girls['’]?\s*generation|snsd|经典女团|国民女团|二代女团/i,
    text: "classic girl-group pop anthem, bright synths, uplifting chorus, clean group harmonies, elegant yet energetic arrangement,strong drums, timeless idol performance feel"
  },

  // ===== 周杰伦：华语R&B、中国风、旋律说唱 =====
  {
    match: /周杰伦|jay\s*chou|中国风|方文山|古风r&b|旋律说唱/i,
    text: "Mandopop R&B fusion, melodic rap flow, pentatonic-inspired motifs, warm piano or guzheng colors, nostalgic romantic lyrics, smooth groove"
  },

  // ===== 蔡依林：唱跳女王、dance pop、时尚电子 =====
  {
    match: /蔡依林|jolin|唱跳女王|华语dance|时尚电子|舞曲/i,
    text: "fashion-forward dance pop, sleek electronic beat, confident diva vocal attitude, strong rhythmic hook, glamorous choreography-ready production"
  },

  // ===== 王菲：空灵、梦幻、另类流行 =====
  {
    match: /王菲|faye\s*wong|空灵|迷幻|另类华语|疏离|梦游感/i,
    text: "ethereal art pop, airy vocal texture, spacious reverb, minimal atmospheric arrangement, poetic emotional distance, dreamlike melodic phrasing"
  },

  // ===== 邓紫棋：强vocal、爆发、副歌大歌 =====
  {
    match: /邓紫棋|gem|g\.e\.m|大嗓|高音|爆发|强vocal|华语大歌/i,
    text: "powerful Mandopop ballad-pop, expressive lead vocal, emotional piano build, strong high-note chorus, dramatic drums, inspirational lyrical theme"
  },

  // ===== 通用情绪：暧昧 / 暗恋 =====
  {
    match: /暧昧|心动|暗恋|crush|拉扯|暧昧期|喜欢朋友/i,
    text: "romantic tension, subtle flirtatious lyrics, soft pre-chorus lift, sparkling synth accents, intimate vocal delivery, bittersweet emotional undertone"
  },

  // ===== 通用曲风：摇滚 / 乐队 =====
  {
    match: /摇滚|乐队|吉他|pop\s*rock|band/i,
    text: "pop rock guitars, punchy live drums, driving bassline, anthemic chorus, emotional band performance energy"
  },

  // ===== 通用曲风：R&B =====
  {
    match: /r&b|rnb|rb|丝滑|慵懒|律动|groove/i,
    text: "contemporary R&B groove, smooth bass, warm keys, laid-back drums, layered harmonies, sensual but polished vocal texture"
  },

  // ===== 通用曲风：夏日 / 清凉 =====
  {
    match: /夏日|海边|清凉|阳光|傍晚|晚风|汽水|橘子/i,
    text: "summer pop atmosphere, breezy percussion, bright chords, refreshing melodic hook, warm sunset mood, light and sparkling arrangement"
  },

  // ===== 通用曲风：暗黑 / 反派感 =====
  {
    match: /暗黑|反派|危险|病娇|低气压|黑化|压迫感/i,
    text: "dark pop atmosphere, minor-key synth progression, heavy low-end, tense percussion, mysterious vocal layers, dramatic cinematic build"
  },

  // ===== 通用曲风：甜酷 =====
  {
    match: /甜酷|可爱但拽|甜辣|辣妹|俏皮/i,
    text: "sweet-cool pop, playful synth hooks, punchy dance beat, cute but confident vocal attitude, catchy chant section, colorful stage energy"
  }
];

function findRemovedReferences(input) {
  const lowered = input.toLowerCase();
  const known = knownReferences.filter((name) => lowered.includes(name.toLowerCase()));
  const inferred = [];
  const patterns = [
    /像\s*([A-Za-z0-9()._-]{2,30})/gi,
    /([A-Za-z0-9()._-]{2,30})\s*风格/gi,
    /([A-Za-z0-9()._-]{2,30})\s*同款/gi
  ];

  for (const pattern of patterns) {
    for (const match of input.matchAll(pattern)) {
      inferred.push(match[1]);
    }
  }

  return [...new Set([...known, ...inferred])];
}

function createChineseSummary(input) {
  const tags = [];
  if (/清爽|青春|夏天|校园/i.test(input)) tags.push("清爽青春");
  if (/暧昧|心动|暗恋|crush/i.test(input)) tags.push("暧昧心动");
  if (/电子|赛博|未来|金属/i.test(input)) tags.push("未来电子");
  if (/摇滚|乐队|吉他/i.test(input)) tags.push("流行摇滚");
  if (/r&b|rb|丝滑|慵懒/i.test(input)) tags.push("丝滑 R&B");
  if (/女团|出道|k-?pop|舞台/i.test(input)) tags.push("适合出道舞台");
  const direction = tags.length ? tags.join("、") : "有记忆点、适合舞台";
  return `一首${direction}的原创出道曲`;
}

function sanitizeForPrompt(value, removedReferences) {
  let text = String(value || "").trim().replace(/\s+/g, " ");
  for (const ref of removedReferences) {
    const escaped = ref.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    text = text.replace(new RegExp(escaped, "gi"), "generic inspiration");
  }
  return text
    .replace(/模仿|复刻|同款声音|照着|一模一样/g, "original inspired direction")
    .slice(0, 220);
}

function profilePromptDetails(profile = {}, removedReferences) {
  const title = sanitizeForPrompt(profile.songTitle, removedReferences);
  const mood = sanitizeForPrompt(profile.mood, removedReferences);
  const genre = sanitizeForPrompt(profile.genre || profile.musicStyle, removedReferences);
  const lyricTheme = sanitizeForPrompt(profile.lyricTheme, removedReferences);
  const language = sanitizeForPrompt(profile.language, removedReferences);
  const songDescription = sanitizeForPrompt(profile.songPrompt, removedReferences);

  return [
    title ? `Working song title: "${title}".` : "",
    mood ? `Mood: ${mood}.` : "",
    genre ? `Genre and production direction: ${genre}.` : "",
    lyricTheme ? `Lyric theme: ${lyricTheme}.` : "",
    language ? `Lyric language: ${language}.` : "",
    songDescription ? `User song description after safety rewriting: ${songDescription}.` : ""
  ].filter(Boolean);
}

export async function translateStyle(userInput, profile = {}) {
  const removedReferences = findRemovedReferences(userInput);
  const matchedHints = styleHints.filter((hint) => hint.match.test(userInput)).map((hint) => hint.text);
  const fallback = [
    "original pop debut single",
    "memorable hook",
    "modern production",
    "expressive lead vocal",
    "stage-ready arrangement",
    "Chinese lyric theme about self-discovery and first spotlight"
  ];

  const safeMusicPrompt = [
    "Create a fully original debut song.",
    ...profilePromptDetails(profile, removedReferences),
    ...new Set([...matchedHints, ...fallback]),
    "Do not imitate or reference any real artist, group, song title, melody, lyrics, logo, voice, or proprietary concept.",
    "No voice cloning. Use generic youthful pop vocal textures and original lyrics."
  ].join(" ");

  return {
    originalInputSummary: createChineseSummary(userInput),
    safeMusicPrompt,
    removedReferences
  };
}

export const translatorSystemPrompt = `你是一个音乐风格转译助手。用户会描述她想要的出道曲风格，可能会提到真实艺人、团体或歌曲名。你的任务不是模仿真实艺人或复制已有作品，而是把用户表达转译成原创音乐生成所需的通用音乐元素。

规则：
1. 最终 safeMusicPrompt 中不能出现任何真实艺人名、团体名、歌曲名。
2. 不能要求模仿真实艺人的声音。
3. 不能要求复制已有歌曲的旋律、歌词、编曲或专属概念。
4. 只能保留通用音乐元素，例如 genre、mood、tempo、rhythm、instruments、arrangement、vocal texture、lyric theme、song structure。
5. 用户说“像某某”时，要转成具体风格词，而不是保留名字。
6. 输出必须是严格 JSON。`;
