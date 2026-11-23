'use strict';

// Strictly app-scoped storage keys so other apps on the same GitHub Pages domain are never affected.
const STORAGE_PREFIX = 'topten_helper_v1_';
const STORAGE_KEYS = {
  LANG: `${STORAGE_PREFIX}lang`,
  SOUND: `${STORAGE_PREFIX}sound`,
  VIBRATION: `${STORAGE_PREFIX}vibration`,
  EDITION: `${STORAGE_PREFIX}edition`,
  MODE: `${STORAGE_PREFIX}mode`,
  USED_SETS: `${STORAGE_PREFIX}used_sets`,
  USED_SETS_18: `${STORAGE_PREFIX}used_sets_18`,
  PLAYER_NAMES: `${STORAGE_PREFIX}player_names`,
  SESSION: `${STORAGE_PREFIX}session`
};

// Legacy keys from earlier version (read-only migration fallback, never wipes unrelated keys)
const LEGACY_STORAGE_KEYS = {
  LANG: 'topten_lang',
  SOUND: 'topten_sound',
  MODE: 'topten_mode',
  USED_SETS: 'topten_used_sets'
};

const APP_CACHE_PREFIX = 'topten-helper-cache-';
const LEGACY_APP_CACHES = ['TopTenV1', 'TopTenV2', 'TopTenV3', 'TopTenV4'];

const CLASSIC_EMBLEM_SRC = 'img/logo.svg';
const ADULT_EMBLEM_SRC = 'img/logo-18.svg';
const INKBLOT_IMG_SRC = 'img/inkblot.svg';

const TOTAL_CARD_SETS_CLASSIC = Math.floor(TOP_TEN_DATA.textsRU.length / 4); // 125 cards (500 topics)
const REGULAR_ADULT_SETS = Math.floor(TOP_TEN_DATA.texts18RU.length / 4); // 116 4-topic cards (464 topics)
const INKBLOT_CARD_SET = REGULAR_ADULT_SETS; // Card #116: special 1-topic inkblot card
const TOTAL_CARD_SETS_ADULT = REGULAR_ADULT_SETS + 1; // 117 cards (465 topics total)
const TOTAL_ROUNDS = 5;
const MAX_PLAYERS = 9;
const HOLD_DURATION_MS = 650;

const VIBRATION_PATTERNS = {
  tap: 12,
  unlock: [20, 35, 30],
  success: [16, 40, 26],
  penalty: [70, 45, 70],
  win: [30, 50, 30, 50, 80],
  fail: [130, 60, 130]
};

const I18N = {
  ru: {
    appTitle: 'ТИП-ТОП',
    appTitle18: 'ТИП-ТОП 18+',
    docTitle: 'Top Ten — Тип-Топ',
    docTitle18: 'Top Ten 18+ — Тип-Топ для взрослых',
    editionSubtitle: 'Кооперативная игра на одной волне. Выберите версию:',
    editionClassicName: 'Тип-Топ',
    editionClassicDesc: '500 тем · базовые и универсальные ситуации для любой компании (14+)',
    editionAdultName: 'Тип-Топ 18+',
    editionAdultDesc: '465 тем · откровенный, дерзкий и чёрный юмор для взрослых (18+)',
    inkblotAlt: 'Клякса психотерапевта',
    inkblotZoomHint: 'Нажмите на картинку, чтобы увеличить',
    inkblotLightboxTitle: 'Клякса психотерапевта',
    heroSubtitle: 'Кооперативная игра на одной волне. 5 раундов, шкала от 1 до 10 и командные жетоны.',
    heroSubtitle18: 'Версия для взрослых. 5 раундов, шкала от 1 (голубой) до 10 (розовый) и командные жетоны.',
    modeLabel: 'Режим игры',
    modeClassic: 'Классический',
    modeExpert: 'Экспертный',
    modeClassicHint: 'Капитан выстраивает ответы игроков в порядке возрастания от 1 до 10.',
    modeExpertHint: 'Для 4–8 игроков: Капитан называет точный номер каждого игрока. В конце команда может угадать карту Капитана и вернуть 1 жетон.',
    playersLabel: 'Количество игроков',
    expertOnlyClassicSub: '4–8 в эксп.',
    playerNamesBtn: 'Имена игроков',
    playerNamesEdited: (count) => `Имена игроков (${count})`,
    namesModalTitle: 'Имена игроков',
    namesModalDesc: 'По желанию введите имена участников — они будут отображаться при раздаче и проверке карт.',
    namesPlaceholder: (n) => `Игрок ${n}`,
    namesSaveBtn: 'Сохранить',
    namesResetBtn: 'Сбросить',
    deckRemaining: (left, total) => `Осталось новых карт: ${left} из ${total}`,
    resetDeck: 'Сбросить историю колоды',
    roundShort: (r, total) => `Раунд ${r}/${total}`,
    captainLabel: (name) => `Капитан: ${name}`,
    playerLabel: (n) => `Игрок ${n}`,
    captainTag: 'Капитан',
    // Compact Stage Titles
    step1Short: 'Выбор темы',
    step2Short: 'Раздача карт',
    step3Short: 'Проверка и жетоны',
    // Stage 1: Pick Topic
    btnRedraw: 'Другие темы',
    btnConfirmTopic: 'Далее: раздача карт →',
    btnPickTopicPrompt: 'Выберите одну тему',
    // Stage 2: Deal Intro & Privacy Shield
    btnChangeTopic: '← Другая тема',
    dealIntroTitle: 'Раздать карты 1–10?',
    dealIntroDesc: (cardsCount, isNine) =>
      isNine
        ? '8 карт по кругу с защитой от подглядывания (Капитан без карты).'
        : `${cardsCount} карт по кругу — число откроется только после удержания.`,
    btnStartDeal: 'Раздать карты',
    btnUsePhysicalCards: 'Физические карты →',
    shieldProgress: (cur, total) => `Карта ${cur} из ${total}`,
    shieldPassTo: 'Передайте телефон:',
    shieldWarning: 'Убедитесь, что никто другой не смотрит на экран.',
    shieldHoldLabel: 'Удерживайте, чтобы открыть',
    shieldHoldShortHint: 'Удерживайте до заполнения',
    shieldCaptainSkipped: (capName) => `${capName} (Капитан) без карты (9 игр.)`,
    peekHint: 'Придумайте ответ под эту шкалу. Называть число нельзя.',
    scaleLow: '1 · Зелёный',
    scaleHigh: '10 · Красный',
    scaleLow18: '1 · Голубой',
    scaleHigh18: '10 · Розовый',
    btnHidePassNext: (nextName) => `Скрыть → ${nextName}`,
    btnHideFinishDeal: 'Скрыть и начать раунд →',
    // Re-peek (forgotten number)
    btnForgotNumber: 'Забыли цифру?',
    repeekTitle: 'Посмотреть свою цифру',
    repeekDesc: 'Выберите своё имя, затем удерживайте кнопку на защитном экране.',
    repeekAction: 'Подсмотреть',
    repeekBackToRound: '← Вернуться к раунду',
    repeekBackToList: '← К списку',
    repeekShieldKicker: 'Повторный просмотр:',
    repeekDoneBtn: 'Скрыть и вернуться к раунду',
    // Stage 3: Play Round
    ninePlayersNote: '9 игроков: Капитан без карты и не даёт ответ.',
    expertRoundNote: 'Эксперт: назовите точный номер перед открытием. Карта Капитана — последней (+1 жетон).',
    revealPanelTitle: 'Карты игроков',
    revealClassicHint: 'Открывайте по возрастанию от 1 к 10.',
    revealExpertHint: 'Выберите игрока и назовите его точный номер (1–10).',
    btnUndoReveal: 'Отменить',
    btnRedealCards: 'Пересдать',
    btnDealDigitalNow: 'Раздать карты 1–10',
    physicalCardsNote: 'Физические карты — отмечайте жетоны на планшете ниже.',
    tapToReveal: 'Открыть',
    tapToSelect: 'Выбрать',
    secretNoCard: 'Без карты',
    secretRevealedLast: 'Последней',
    secretSelected: 'Выбран',
    guessNote: (g) => `ставка: ${g}`,
    secretExpertGuessFor: (name) => `Какой номер у игрока: ${name}?`,
    secretExpertPickNum: 'Выберите номер 1–10',
    secretExpertOpenBtn: (num) => `Открыть (ставка: ${num})`,
    secretExpertCaptainTitle: 'Бонус: карта Капитана',
    secretExpertCaptainDesc: (capName) => `Угадайте точный номер Капитана (${capName}) — за попадание вернётся +1 жетон.`,
    secretExpertCaptainGuessBtn: (num) => `Проверить (${num})`,
    secretSequenceLabel: 'Порядок:',
    secretFeedbackFirst: (name, num) => `${name}: ${num} — начало ряда!`,
    secretFeedbackOk: (name, num, prev) => `${name}: ${num} (> ${prev}) — верно!`,
    secretFeedbackPenalty: (name, num, prev) => `${name}: ${num} (< ${prev}) — ошибка! −1 жетон.`,
    secretFeedbackExpertHit: (name, num) => `${name}: ровно ${num} — точно в цель!`,
    secretFeedbackExpertMiss: (name, actual, guess) => `${name}: ${actual} (ставка ${guess}) — ошибка! −1 жетон.`,
    secretFeedbackCapHitRestore: (actual) => `Точно! У Капитана ${actual} — +1 жетон возвращён!`,
    secretFeedbackCapHitFull: (actual) => `Точно! У Капитана ${actual} (все жетоны уже на месте).`,
    secretFeedbackCapMiss: (actual, guess) => `Мимо: у Капитана ${actual} (ставка ${guess}). Жетоны целы.`,
    secretAllRevealed: 'Все карты раунда открыты!',
    // Token board
    zoneUnicorns: 'Зона единорога',
    zonePoops: 'Зона какашек',
    zoneEmpty: 'Пусто',
    btnRestoreToken: '+1 Вернуть',
    btnPenaltyToken: '−1 Ошибка',
    btnNextRound: 'Следующий раунд →',
    btnFinishGame: 'Завершить игру',
    // Result page
    resultTitle: 'Итоги партии',
    resultScoreOf: (u, total) => `${u} из ${total}`,
    resultUnicornsStat: (u) => `Единороги: ${u}`,
    resultPoopsStat: (p) => `Какашки: ${p}`,
    resultRoundsStat: (r) => `Раундов: ${r} / ${TOTAL_ROUNDS}`,
    btnPlayAgain: 'Новая игра',
    btnSamePlayers: (p) => `Ещё раз (${p} игр.)`,
    // Confirmation modals
    popupNextTitle: (nextR) => `Раунд ${nextR} из ${TOTAL_ROUNDS}`,
    popupNextDesc: (nextCapName, unrevealed) =>
      `Переходим к следующему раунду? Новым Капитаном станет ${nextCapName}.${unrevealed > 0 ? `\n\nВнимание: осталось неоткрытых карт: ${unrevealed}.` : ''}`,
    popupNextConfirm: 'Начать раунд',
    popupCancel: 'Отмена',
    popupFinishTitle: 'Завершить партию?',
    popupFinishDesc: (unrevealed) =>
      `Пятый раунд завершён. Перейти к подсчёту итогового результата?${unrevealed > 0 ? `\n\nВнимание: осталось неоткрытых карт: ${unrevealed}.` : ''}`,
    popupFinishConfirm: 'Показать результат',
    popupZeroTitle: 'Все жетоны в зоне какашек!',
    popupZeroDesc: 'В зоне единорога не осталось жетонов — по правилам команда проиграла. Завершить партию или отменить последнюю ошибку?',
    popupZeroConfirm: 'К результату',
    popupZeroUndo: 'Отменить ошибку (+1)',
    popupExitTitle: 'Выйти в меню?',
    popupExitDesc: 'Текущая партия будет сброшена.',
    popupExitConfirm: 'Выйти в меню',
    popupCancelDealTitle: 'Прервать раздачу карт?',
    popupCancelDealDesc: 'Часть игроков уже посмотрела свои числа. Если вернуться назад, карты придётся раздать заново.',
    popupCancelDealConfirm: 'Прервать раздачу',
    popupReinstallTitle: 'Переустановить программу?',
    popupReinstallDesc: 'Кэш и Service Worker только этого приложения будут обновлены заново. Текущая партия, история колоды и другие ваши приложения на GitHub Pages останутся в полной сохранности.',
    popupReinstallConfirm: 'Обновить и переустановить',
    popupIosTitle: 'Установка на iPhone / iPad',
    popupIosDesc: '1. Нажмите кнопку «Поделиться» на нижней панели Safari.\n2. Выберите «На экран «Домой»» и нажмите «Добавить».',
    popupOk: 'Понятно',
    // Rules modal & footer
    rulesTitle: 'Правила игры «Тип-Топ»',
    rulesTitle18: 'Правила игры «Тип-Топ 18+»',
    vibrationOn: 'Вибрация: Вкл',
    vibrationOff: 'Вибрация: Выкл',
    installCardTitle: 'Установить на устройство',
    installCardDesc: 'Работает офлайн как отдельное приложение',
    installBtn: 'Установить',
    installIosBtn: 'Как установить (iOS)',
    reinstallBtn: 'Переустановить программу',
    reinstallBusy: 'Обновление...',
    offlineNotice: 'Офлайн-режим: приложение работает из локального кэша.',
    ariaBack: 'Назад',
    ariaSound: 'Переключить звук',
    ariaRules: 'Правила игры',
    ariaLang: 'Переключить язык'
  },
  en: {
    appTitle: 'TOP TEN',
    appTitle18: 'TOP TEN 18+',
    docTitle: 'Top Ten Helper',
    docTitle18: 'Top Ten 18+ — Adult Edition',
    editionSubtitle: 'Cooperative party game on one wavelength. Choose an edition:',
    editionClassicName: 'Top Ten',
    editionClassicDesc: '500 topics · classic party prompts for friends & family (14+)',
    editionAdultName: 'Top Ten 18+',
    editionAdultDesc: '465 topics · bold, spicy & dark-humor prompts for adults (18+)',
    inkblotAlt: 'Psychotherapist inkblot',
    inkblotZoomHint: 'Tap image to zoom in',
    inkblotLightboxTitle: 'Psychotherapist Inkblot',
    heroSubtitle: 'Cooperative party game on the same wavelength. 5 rounds, 1–10 intensity scale, and team tokens.',
    heroSubtitle18: 'Adult edition. 5 rounds, scale from 1 (blue) to 10 (pink), and team tokens.',
    modeLabel: 'Game Mode',
    modeClassic: 'Classic',
    modeExpert: 'Expert',
    modeClassicHint: 'The Captain arranges everyone’s answers in ascending order from 1 to 10.',
    modeExpertHint: 'For 4–8 players: the Captain guesses each player’s exact number. At the end, the team can guess the Captain’s card to recover 1 token.',
    playersLabel: 'Number of Players',
    expertOnlyClassicSub: '4–8 in Expert',
    playerNamesBtn: 'Player names',
    playerNamesEdited: (count) => `Player names (${count})`,
    namesModalTitle: 'Player Names',
    namesModalDesc: 'Optionally enter player names — they will appear during card dealing and reveal.',
    namesPlaceholder: (n) => `Player ${n}`,
    namesSaveBtn: 'Save',
    namesResetBtn: 'Reset',
    deckRemaining: (left, total) => `Unseen card sets: ${left} of ${total}`,
    resetDeck: 'Reset deck history',
    roundShort: (r, total) => `Round ${r}/${total}`,
    captainLabel: (name) => `Captain: ${name}`,
    playerLabel: (n) => `Player ${n}`,
    captainTag: 'Captain',
    // Compact Stage Titles
    step1Short: 'Pick Topic',
    step2Short: 'Deal Cards',
    step3Short: 'Reveal & Tokens',
    // Stage 1: Pick Topic
    btnRedraw: 'New Topics',
    btnConfirmTopic: 'Next: Deal Cards →',
    btnPickTopicPrompt: 'Select one topic',
    // Stage 2: Deal Intro & Privacy Shield
    btnChangeTopic: '← Other Topic',
    dealIntroTitle: 'Deal 1–10 Number Cards?',
    dealIntroDesc: (cardsCount, isNine) =>
      isNine
        ? '8 secret numbers passed around behind a privacy shield (Captain gets no card).'
        : `${cardsCount} cards passed around — each number opens only after holding.`,
    btnStartDeal: 'Deal Cards',
    btnUsePhysicalCards: 'Physical Cards →',
    shieldProgress: (cur, total) => `Card ${cur} of ${total}`,
    shieldPassTo: 'Pass phone to:',
    shieldWarning: 'Make sure no one else can see the screen.',
    shieldHoldLabel: 'Hold to Reveal',
    shieldHoldShortHint: 'Keep holding until full',
    shieldCaptainSkipped: (capName) => `${capName} (Captain) has no card (9p)`,
    peekHint: 'Think of an answer for this scale. Never say the number.',
    scaleLow: '1 · Green',
    scaleHigh: '10 · Red',
    scaleLow18: '1 · Blue',
    scaleHigh18: '10 · Pink',
    btnHidePassNext: (nextName) => `Hide → ${nextName}`,
    btnHideFinishDeal: 'Hide & Start Round →',
    // Re-peek (forgotten number)
    btnForgotNumber: 'Forgot number?',
    repeekTitle: 'Check Your Number Again',
    repeekDesc: 'Tap your player card, then hold the button on the privacy shield.',
    repeekAction: 'Peek',
    repeekBackToRound: '← Back to Round',
    repeekBackToList: '← Players',
    repeekShieldKicker: 'Re-check number:',
    repeekDoneBtn: 'Hide & Return to Round',
    // Stage 3: Play Round
    ninePlayersNote: '9 players: Captain gets no card and gives no answer.',
    expertRoundNote: 'Expert: call the exact number before flipping. Captain’s card goes last (+1 token).',
    revealPanelTitle: 'Player Cards',
    revealClassicHint: 'Reveal in ascending order from 1 to 10.',
    revealExpertHint: 'Pick a player and call their exact number (1–10).',
    btnUndoReveal: 'Undo',
    btnRedealCards: 'Redeal',
    btnDealDigitalNow: 'Deal 1–10 Cards',
    physicalCardsNote: 'Physical cards — track tokens on the board below.',
    tapToReveal: 'Reveal',
    tapToSelect: 'Select',
    secretNoCard: 'No card',
    secretRevealedLast: 'Last',
    secretSelected: 'Selected',
    guessNote: (g) => `guess: ${g}`,
    secretExpertGuessFor: (name) => `Guess ${name}’s number:`,
    secretExpertPickNum: 'Pick a number 1–10',
    secretExpertOpenBtn: (num) => `Reveal (Guess: ${num})`,
    secretExpertCaptainTitle: 'Bonus: Captain’s Card',
    secretExpertCaptainDesc: (capName) => `Guess the Captain’s (${capName}) exact number to restore +1 Unicorn token.`,
    secretExpertCaptainGuessBtn: (num) => `Check (${num})`,
    secretSequenceLabel: 'Order:',
    secretFeedbackFirst: (name, num) => `${name}: ${num} — started!`,
    secretFeedbackOk: (name, num, prev) => `${name}: ${num} (> ${prev}) — correct!`,
    secretFeedbackPenalty: (name, num, prev) => `${name}: ${num} (< ${prev}) — mistake! −1 token.`,
    secretFeedbackExpertHit: (name, num) => `${name}: exact ${num}!`,
    secretFeedbackExpertMiss: (name, actual, guess) => `${name}: ${actual} (guessed ${guess}) — mistake! −1 token.`,
    secretFeedbackCapHitRestore: (actual) => `Spot on! Captain had ${actual} — +1 token restored!`,
    secretFeedbackCapHitFull: (actual) => `Spot on! Captain had ${actual} (all tokens already safe).`,
    secretFeedbackCapMiss: (actual, guess) => `Missed: Captain had ${actual} (guessed ${guess}). No tokens lost.`,
    secretAllRevealed: 'All cards revealed!',
    // Token board
    zoneUnicorns: 'Unicorn Zone',
    zonePoops: 'Poop Zone',
    zoneEmpty: 'Empty',
    btnRestoreToken: '+1 Restore',
    btnPenaltyToken: '−1 Mistake',
    btnNextRound: 'Next Round →',
    btnFinishGame: 'Finish Game',
    // Result page
    resultTitle: 'Final Result',
    resultScoreOf: (u, total) => `${u} of ${total}`,
    resultUnicornsStat: (u) => `Unicorns: ${u}`,
    resultPoopsStat: (p) => `Poops: ${p}`,
    resultRoundsStat: (r) => `Rounds: ${r} / ${TOTAL_ROUNDS}`,
    btnPlayAgain: 'New Game',
    btnSamePlayers: (p) => `Play Again (${p} players)`,
    // Confirmation modals
    popupNextTitle: (nextR) => `Round ${nextR} of ${TOTAL_ROUNDS}`,
    popupNextDesc: (nextCapName, unrevealed) =>
      `Move to the next round? ${nextCapName} will become the new Captain.${unrevealed > 0 ? `\n\nNote: ${unrevealed} player card(s) are still unrevealed.` : ''}`,
    popupNextConfirm: 'Start Round',
    popupCancel: 'Cancel',
    popupFinishTitle: 'Finish the Game?',
    popupFinishDesc: (unrevealed) =>
      `Round 5 is complete. View the team’s final evaluation?${unrevealed > 0 ? `\n\nNote: ${unrevealed} player card(s) are still unrevealed.` : ''}`,
    popupFinishConfirm: 'See Result',
    popupZeroTitle: 'All Tokens in the Poop Zone!',
    popupZeroDesc: 'There are no Unicorn tokens left — by the rules, the team has lost. Finish the game or undo the last mistake?',
    popupZeroConfirm: 'Go to Result',
    popupZeroUndo: 'Undo Mistake (+1)',
    popupExitTitle: 'Return to Menu?',
    popupExitDesc: 'Your current game progress will be lost.',
    popupExitConfirm: 'Leave Game',
    popupCancelDealTitle: 'Cancel Card Dealing?',
    popupCancelDealDesc: 'Some players have already seen their numbers. Going back will reset the deal.',
    popupCancelDealConfirm: 'Cancel Deal',
    popupReinstallTitle: 'Reinstall App?',
    popupReinstallDesc: 'Only this app’s cache and Service Worker will be refreshed. Your active game, deck history, and any other apps on your GitHub Pages will remain untouched.',
    popupReinstallConfirm: 'Refresh & Reinstall',
    popupIosTitle: 'Install on iPhone / iPad',
    popupIosDesc: '1. Tap the Share button in Safari’s toolbar.\n2. Tap “Add to Home Screen” and confirm.',
    popupOk: 'Got it',
    // Rules modal & footer
    rulesTitle: 'How to Play Top Ten',
    rulesTitle18: 'How to Play Top Ten 18+',
    vibrationOn: 'Vibration: On',
    vibrationOff: 'Vibration: Off',
    installCardTitle: 'Install on Device',
    installCardDesc: 'Works offline as a standalone app',
    installBtn: 'Install',
    installIosBtn: 'Install on iOS',
    reinstallBtn: 'Reinstall App',
    reinstallBusy: 'Updating...',
    offlineNotice: 'Offline mode: running from local cache.',
    ariaBack: 'Back',
    ariaSound: 'Toggle sound',
    ariaRules: 'Game rules',
    ariaLang: 'Switch language'
  }
};

// Crisp icons (main game unicorn logo for unicorn tokens/badges + inline SVGs)
const ICON_UNICORN_SVG = `<img src="${CLASSIC_EMBLEM_SRC}" alt="" class="unicorn-logo-icon" aria-hidden="true">`;
const ICON_POOP_SVG = `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.2 3c.6 1.5.2 2.9-1 3.9 2.1.2 3.8 1.6 4 3.6 1.8.5 3.1 2 3.1 3.9 0 .4-.1.8-.2 1.2 1.2.8 1.9 2.1 1.9 3.5 0 2.2-1.9 3.9-4.3 3.9H8.3C5.9 23 4 21.3 4 19.1c0-1.4.7-2.7 1.9-3.5-.1-.4-.2-.8-.2-1.2 0-1.9 1.3-3.4 3.1-3.9.2-1.4 1.1-2.6 2.4-3.2-.6-1.4-.2-3.1 1-4.3z"/></svg>`;
const ICON_EYE_OFF_SVG = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
const ICON_EYE_SM_SVG = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>`;
const ICON_REFRESH_SVG = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`;
const ICON_UNDO_SVG = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>`;
const ICON_CROWN_SVG = `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 18h18v2H3v-2zm0-2L1.5 6.5 7 11l5-7 5 7 5.5-4.5L21 16H3z"/></svg>`;
const ICON_CHECK_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;
const ICON_CROSS_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
const ICON_CHEVRON_RIGHT_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>`;

const clickSound = new Audio('audio/click.mp3');

// ---------- Storage Helpers (strictly scoped) ----------

function loadStoredString(key, legacyKey, fallback, allowed) {
  try {
    let val = localStorage.getItem(key);
    if (!val && legacyKey) {
      val = localStorage.getItem(legacyKey);
      if (val && (!allowed || allowed.includes(val))) {
        localStorage.setItem(key, val);
      }
    }
    if (val && (!allowed || allowed.includes(val))) return val;
  } catch (_) {}
  return fallback;
}

function loadStoredBool(key, legacyKey, fallback) {
  try {
    let val = localStorage.getItem(key);
    if (val === null && legacyKey) {
      val = localStorage.getItem(legacyKey);
      if (val === 'true' || val === 'false') {
        localStorage.setItem(key, val);
      }
    }
    if (val === 'true') return true;
    if (val === 'false') return false;
  } catch (_) {}
  return fallback;
}

function loadUsedSets(edition) {
  const isAdult = edition === 'adult';
  const key = isAdult ? STORAGE_KEYS.USED_SETS_18 : STORAGE_KEYS.USED_SETS;
  const maxSets = isAdult ? TOTAL_CARD_SETS_ADULT : TOTAL_CARD_SETS_CLASSIC;
  try {
    let raw = localStorage.getItem(key);
    if (!raw && !isAdult) {
      raw = localStorage.getItem(LEGACY_STORAGE_KEYS.USED_SETS);
      if (raw) localStorage.setItem(key, raw);
    }
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((n) => Number.isInteger(n) && n >= 0 && n < maxSets);
    }
  } catch (_) {}
  return [];
}

function saveUsedSets(sets, edition) {
  const key = edition === 'adult' ? STORAGE_KEYS.USED_SETS_18 : STORAGE_KEYS.USED_SETS;
  try {
    localStorage.setItem(key, JSON.stringify(sets));
  } catch (_) {}
}

function loadPlayerNames() {
  const empty = Array.from({ length: MAX_PLAYERS }, () => '');
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PLAYER_NAMES);
    if (!raw) return empty;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return empty.map((_, i) => (typeof parsed[i] === 'string' ? parsed[i].trim().slice(0, 24) : ''));
    }
  } catch (_) {}
  return empty;
}

function savePlayerNamesToStorage(names) {
  try {
    localStorage.setItem(STORAGE_KEYS.PLAYER_NAMES, JSON.stringify(names));
  } catch (_) {}
}

// ---------- Wake Lock + Anti-Peek Visibility Handler ----------

let wakeLockSentinel = null;
let wakeLockRequesting = false;

async function requestWakeLock() {
  if (!('wakeLock' in navigator) || document.visibilityState !== 'visible') return;
  if (wakeLockRequesting || (wakeLockSentinel && !wakeLockSentinel.released)) return;
  wakeLockRequesting = true;
  try {
    const sentinel = await navigator.wakeLock.request('screen');
    wakeLockSentinel = sentinel;
    sentinel.addEventListener('release', () => {
      if (wakeLockSentinel === sentinel) {
        wakeLockSentinel = null;
      }
    });
  } catch (_) {
    // Gracefully ignored if battery saver / browser policy blocks Wake Lock
  } finally {
    wakeLockRequesting = false;
  }
}

function initWakeLockAndPrivacy() {
  requestWakeLock();
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Auto-hide exposed secret number if user switches apps or locks phone
      if (state.page === 'game') {
        if (state.roundStage === 'deal_reveal') {
          state.roundStage = 'deal_shield';
          render();
        } else if (state.roundStage === 'repeek_reveal') {
          state.roundStage = 'repeek_shield';
          render();
        } else {
          saveGameSession();
        }
      }
    } else if (document.visibilityState === 'visible') {
      requestWakeLock();
    }
  });
  const retryOnResume = () => {
    if (document.visibilityState === 'visible' && (!wakeLockSentinel || wakeLockSentinel.released)) {
      requestWakeLock();
    }
  };
  window.addEventListener('focus', retryOnResume, { passive: true });
  window.addEventListener('pageshow', retryOnResume, { passive: true });
  window.addEventListener('orientationchange', retryOnResume, { passive: true });
  window.addEventListener('pointerdown', retryOnResume, { passive: true });
  window.addEventListener('touchstart', retryOnResume, { passive: true });
  window.addEventListener('keydown', retryOnResume, { passive: true });
}

// ---------- PWA Install State ----------

const pwaState = {
  deferredPrompt: null,
  isInstalled:
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true,
  isIOS: /iphone|ipad|ipod/i.test(window.navigator.userAgent),
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isReinstalling: false
};

// Active hold-to-confirm animation state
let holdState = {
  rafId: null,
  startTime: 0,
  active: false,
  pointerId: null
};

const state = {
  page: 'edition', // 'edition' | 'start' | 'game' | 'result'
  edition: loadStoredString(STORAGE_KEYS.EDITION, null, 'classic', ['classic', 'adult']),
  roundStage: 'pick_topic', // 'pick_topic' | 'deal_intro' | 'deal_shield' | 'deal_reveal' | 'play_round' | 'repeek_pick' | 'repeek_shield' | 'repeek_reveal'
  repeekPlayerIdx: null,
  usedDigitalCards: false,
  language: loadStoredString(STORAGE_KEYS.LANG, LEGACY_STORAGE_KEYS.LANG, 'ru', ['ru', 'en']),
  soundEnabled: loadStoredBool(STORAGE_KEYS.SOUND, LEGACY_STORAGE_KEYS.SOUND, true),
  vibrationEnabled: loadStoredBool(STORAGE_KEYS.VIBRATION, null, true),
  mode: loadStoredString(STORAGE_KEYS.MODE, LEGACY_STORAGE_KEYS.MODE, 'classic', ['classic', 'expert']),
  playerNames: loadPlayerNames(),
  players: 4,
  maxTokens: 4,
  unicorns: 4,
  poops: 0,
  round: 1,
  captainIndex: 0,
  usedCardSets: loadUsedSets('classic'),
  usedCardSets18: loadUsedSets('adult'),
  skippedCardSets: [], // transient during Stage 1 so skipped cards aren't burned
  currentCardSet: 0,
  selectedTopicIndex: null,
  confirmModal: null, // 'next_round' | 'finish_round5' | 'zero_unicorns' | 'exit_game' | 'cancel_deal' | 'reinstall_app' | 'ios_install'
  lastZeroSource: null, // 'reveal' | 'manual' | null
  rulesOpen: false,
  namesModalOpen: false,
  lightboxOpen: false,
  secretRound: null
};

// ---------- Edition, Player Name & Modal Lock Helpers ----------

function t() {
  return I18N[state.language];
}

function isAdultEdition() {
  return state.edition === 'adult';
}

function isCurrentCardInkblot() {
  return isAdultEdition() && state.currentCardSet === INKBLOT_CARD_SET;
}

function getActiveTopics() {
  if (isAdultEdition()) {
    return state.language === 'ru' ? TOP_TEN_DATA.texts18RU : TOP_TEN_DATA.texts18EN;
  }
  return state.language === 'ru' ? TOP_TEN_DATA.textsRU : TOP_TEN_DATA.textsEN;
}

function getInkblotTopicText() {
  return state.language === 'ru' ? TOP_TEN_DATA.inkblotCardRU : TOP_TEN_DATA.inkblotCardEN;
}

function getTotalCardSets() {
  return isAdultEdition() ? TOTAL_CARD_SETS_ADULT : TOTAL_CARD_SETS_CLASSIC;
}

function getActiveUsedSets() {
  return isAdultEdition() ? state.usedCardSets18 : state.usedCardSets;
}

function setActiveUsedSets(sets) {
  if (isAdultEdition()) {
    state.usedCardSets18 = sets;
  } else {
    state.usedCardSets = sets;
  }
  saveUsedSets(sets, state.edition);
}

function getActiveAppTitle() {
  const tr = t();
  return isAdultEdition() ? tr.appTitle18 : tr.appTitle;
}

function getActiveScaleLabels() {
  const tr = t();
  return isAdultEdition()
    ? { low: tr.scaleLow18, high: tr.scaleHigh18 }
    : { low: tr.scaleLow, high: tr.scaleHigh };
}

function getPlayerName(playerIdx) {
  const custom = state.playerNames[playerIdx];
  if (custom && custom.trim()) return custom.trim();
  return t().playerLabel(playerIdx + 1);
}

function getPlayerDisplay(playerIdx, isCaptain, sep) {
  const name = getPlayerName(playerIdx);
  if (!isCaptain) return name;
  const tag = t().captainTag;
  return sep === 'dot' ? `${name} · ${tag}` : `${name} (${tag})`;
}

function syncBodyModalLock() {
  const anyOpen = Boolean(
    state.confirmModal || state.rulesOpen || state.namesModalOpen || state.lightboxOpen
  );
  document.body.classList.toggle('modal-open', anyOpen);
}

function syncThemeAndMeta() {
  const isEditionPage = state.page === 'edition';
  const adultActive = !isEditionPage && isAdultEdition();
  document.body.classList.toggle('theme-adult', adultActive);

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', adultActive ? '#14111c' : '#075251');
  }
  const tr = t();
  document.title = isEditionPage ? tr.docTitle : adultActive ? tr.docTitle18 : tr.docTitle;
}

// ---------- Session Persistence (Reload Protection) ----------

function saveGameSession() {
  try {
    if (state.page === 'edition' || state.page === 'start') {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      return;
    }
    let safeStage = state.roundStage;
    if (safeStage === 'deal_reveal') {
      safeStage = 'deal_shield';
    } else if (safeStage === 'repeek_pick' || safeStage === 'repeek_shield' || safeStage === 'repeek_reveal') {
      safeStage = 'play_round';
    }

    const payload = {
      v: 1,
      page: state.page,
      edition: state.edition,
      roundStage: safeStage,
      usedDigitalCards: state.usedDigitalCards,
      mode: state.mode,
      players: state.players,
      maxTokens: state.maxTokens,
      unicorns: state.unicorns,
      poops: state.poops,
      round: state.round,
      captainIndex: state.captainIndex,
      currentCardSet: state.currentCardSet,
      skippedCardSets: state.skippedCardSets,
      selectedTopicIndex: state.selectedTopicIndex,
      secretRound: state.secretRound
    };
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(payload));
  } catch (_) {}
}

function restoreGameSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!raw) return false;
    const saved = JSON.parse(raw);
    if (!saved || saved.v !== 1) return false;
    if (!['game', 'result'].includes(saved.page)) return false;
    if (!Number.isInteger(saved.players) || saved.players < 4 || saved.players > 9) return false;

    const validStages = ['pick_topic', 'deal_intro', 'deal_shield', 'play_round'];
    state.edition = saved.edition === 'adult' ? 'adult' : 'classic';
    state.page = saved.page;
    state.roundStage = validStages.includes(saved.roundStage) ? saved.roundStage : 'pick_topic';
    state.usedDigitalCards = Boolean(saved.usedDigitalCards);
    if (saved.mode === 'classic' || saved.mode === 'expert') state.mode = saved.mode;
    state.players = saved.players;
    // Official rules: Expert variant is for 4–8 players only
    if (state.players === 9 && state.mode === 'expert') {
      state.mode = 'classic';
    }
    state.maxTokens = saved.players === 9 ? 8 : saved.players;
    state.unicorns = Math.max(0, Math.min(state.maxTokens, Number(saved.unicorns) || 0));
    state.poops = state.maxTokens - state.unicorns;
    state.round = Math.max(1, Math.min(TOTAL_ROUNDS, Number(saved.round) || 1));
    state.captainIndex = Math.max(0, Math.min(state.players - 1, Number(saved.captainIndex) || 0));
    const maxSets = getTotalCardSets();
    state.currentCardSet =
      Number.isInteger(saved.currentCardSet) && saved.currentCardSet >= 0 && saved.currentCardSet < maxSets
        ? saved.currentCardSet
        : 0;
    state.skippedCardSets = Array.isArray(saved.skippedCardSets)
      ? saved.skippedCardSets.filter((n) => Number.isInteger(n) && n >= 0 && n < maxSets)
      : [];
    state.selectedTopicIndex = isCurrentCardInkblot()
      ? 0
      : Number.isInteger(saved.selectedTopicIndex) && saved.selectedTopicIndex >= 0 && saved.selectedTopicIndex <= 3
        ? saved.selectedTopicIndex
        : null;
    if (saved.secretRound && Array.isArray(saved.secretRound.cards) && saved.secretRound.cards.length === state.players) {
      state.secretRound = saved.secretRound;
    } else {
      state.secretRound = createSecretRoundData();
    }
    return true;
  } catch (_) {
    return false;
  }
}

// ---------- Audio & Vibration Feedback ----------

function vibrate(type) {
  if (!state.vibrationEnabled) return;
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
  const pattern = VIBRATION_PATTERNS[type] || VIBRATION_PATTERNS.tap;
  try {
    navigator.vibrate(pattern);
  } catch (_) {}
}

function playClickSound() {
  if (!state.soundEnabled) return;
  try {
    clickSound.currentTime = 0;
    const p = clickSound.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => {});
    }
  } catch (_) {}
}

function feedbackTap() {
  playClickSound();
  vibrate('tap');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatCardHtml(raw) {
  return escapeHtml(raw)
    .replace(/&lt;g&gt;([\s\S]*?)&lt;\/g&gt;/g, '<span class="scale-low">$1</span>')
    .replace(/&lt;r&gt;([\s\S]*?)&lt;\/r&gt;/g, '<span class="scale-high">$1</span>')
    .replace(/&lt;b&gt;([\s\S]*?)&lt;\/b&gt;/g, '<strong>$1</strong>');
}

function getSelectedTopicRawText() {
  if (isCurrentCardInkblot()) {
    return getInkblotTopicText();
  }
  const texts = getActiveTopics();
  const idx = state.selectedTopicIndex !== null ? state.selectedTopicIndex : 0;
  return texts[(state.currentCardSet * 4 + idx) % texts.length];
}

// Smart deck drawing: never burns skipped card sets into usedCardSets until a topic is actually confirmed.
function drawNextCardSet(isRedraw) {
  const totalSets = getTotalCardSets();
  let usedSets = getActiveUsedSets();

  if (isRedraw) {
    if (!state.skippedCardSets.includes(state.currentCardSet)) {
      state.skippedCardSets.push(state.currentCardSet);
    }
  } else {
    state.skippedCardSets = [];
  }

  let available = [];
  for (let i = 0; i < totalSets; i++) {
    if (!usedSets.includes(i) && !state.skippedCardSets.includes(i)) {
      available.push(i);
    }
  }

  // If all remaining unseen sets were just skipped during redraws, recycle skipped list first
  if (available.length === 0) {
    state.skippedCardSets = isRedraw ? [state.currentCardSet] : [];
    for (let i = 0; i < totalSets; i++) {
      if (!usedSets.includes(i) && !state.skippedCardSets.includes(i)) {
        available.push(i);
      }
    }
  }

  // If the entire deck has been played, reset deck history
  if (available.length === 0) {
    usedSets = [];
    setActiveUsedSets([]);
    state.skippedCardSets = [];
    for (let i = 0; i < totalSets; i++) {
      if (!isRedraw || i !== state.currentCardSet) {
        available.push(i);
      }
    }
    if (available.length === 0) available.push(0);
  }

  const picked = available[Math.floor(Math.random() * available.length)];
  state.currentCardSet = picked;
  state.selectedTopicIndex = isCurrentCardInkblot() ? 0 : null;
}

function markCurrentCardSetUsed() {
  const usedSets = getActiveUsedSets();
  if (!usedSets.includes(state.currentCardSet)) {
    setActiveUsedSets([...usedSets, state.currentCardSet]);
  }
  state.skippedCardSets = [];
}

function createSecretRoundData() {
  const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  let poolCursor = 0;
  const cards = [];
  for (let i = 0; i < state.players; i++) {
    const isCaptain = i === state.captainIndex;
    const hasCard = !(state.players === 9 && isCaptain);
    cards.push({
      playerIdx: i,
      isCaptain,
      hasCard,
      number: hasCard ? pool[poolCursor++] : null,
      viewed: !hasCard,
      revealed: false,
      penalty: false,
      guessedNumber: null
    });
  }

  const dealOrder = [];
  for (let offset = 0; offset < state.players; offset++) {
    const idx = (state.captainIndex + offset) % state.players;
    if (cards[idx].hasCard) {
      dealOrder.push(idx);
    }
  }

  return {
    cards,
    dealOrder,
    dealCursor: 0,
    revealedOrder: [],
    lastFeedback: null,
    expertTarget: null,
    expertGuess: null,
    captainGuessDone: false
  };
}

// ---------- Hold-to-Confirm Logic ----------

function cancelHold(showShortHint) {
  if (holdState.rafId !== null) {
    cancelAnimationFrame(holdState.rafId);
    holdState.rafId = null;
  }
  const wasActive = holdState.active;
  holdState.active = false;
  holdState.pointerId = null;

  const btn = document.getElementById('hold-reveal-btn');
  const fill = document.getElementById('hold-reveal-fill');
  const hint = document.getElementById('hold-reveal-hint');
  if (btn) {
    btn.classList.remove('is-holding', 'is-past-half');
  }
  if (fill) {
    fill.style.transform = 'scaleX(0)';
  }
  if (showShortHint && wasActive && hint) {
    hint.textContent = t().shieldHoldShortHint;
  }
}

function startHold(event) {
  const isDealShield = state.roundStage === 'deal_shield';
  const isRepeekShield = state.roundStage === 'repeek_shield';
  if (state.page !== 'game' || (!isDealShield && !isRepeekShield)) return;
  if (holdState.active) return;

  if (event && event.type === 'pointerdown') {
    if (event.button !== undefined && event.button !== 0) return;
    holdState.pointerId = event.pointerId;
    if (event.currentTarget && event.currentTarget.setPointerCapture) {
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch (_) {}
    }
  }

  vibrate('tap');
  holdState.active = true;
  holdState.startTime = performance.now();

  const btn = document.getElementById('hold-reveal-btn');
  const fill = document.getElementById('hold-reveal-fill');
  const hint = document.getElementById('hold-reveal-hint');
  if (btn) btn.classList.add('is-holding');
  if (hint) hint.textContent = '';

  const tick = (now) => {
    if (!holdState.active) return;
    const elapsed = now - holdState.startTime;
    const progress = Math.min(1, elapsed / HOLD_DURATION_MS);

    if (fill) {
      fill.style.transform = `scaleX(${progress})`;
    }
    if (btn) {
      btn.classList.toggle('is-past-half', progress >= 0.45);
    }

    if (progress >= 1) {
      holdState.active = false;
      holdState.rafId = null;
      holdState.pointerId = null;
      playClickSound();
      vibrate('unlock');
      state.roundStage = isRepeekShield ? 'repeek_reveal' : 'deal_reveal';
      render();
      return;
    }

    holdState.rafId = requestAnimationFrame(tick);
  };

  holdState.rafId = requestAnimationFrame(tick);
}

function handleHoldKeyDown(event) {
  if (event.key === ' ' || event.key === 'Enter') {
    event.preventDefault();
    if (!event.repeat) {
      startHold(event);
    }
  }
}

function handleHoldKeyUp(event) {
  if (event.key === ' ' || event.key === 'Enter') {
    event.preventDefault();
    cancelHold(true);
  }
}

// ---------- PWA Install & Safe Scoped Reinstall ----------

async function triggerPWAInstall() {
  feedbackTap();
  if (pwaState.deferredPrompt) {
    try {
      await pwaState.deferredPrompt.prompt();
      const { outcome } = await pwaState.deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        pwaState.isInstalled = true;
        pwaState.deferredPrompt = null;
        vibrate('success');
        render();
        if (state.rulesOpen) renderRulesModal();
      }
    } catch (_) {}
    return;
  }
  if (pwaState.isIOS) {
    closeRulesModal(true);
    openConfirmModal('ios_install');
  }
}

function requestSafeReinstall() {
  feedbackTap();
  openConfirmModal('reinstall_app');
}

async function performSafeReinstall() {
  // Never wipe offline cache while offline — otherwise the app could not reload without internet
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    pwaState.isReinstalling = false;
    if (state.rulesOpen) renderRulesModal();
    return;
  }
  pwaState.isReinstalling = true;
  saveGameSession();
  saveUsedSets(state.usedCardSets, 'classic');
  saveUsedSets(state.usedCardSets18, 'adult');
  savePlayerNamesToStorage(state.playerNames);

  const currentAppScope = new URL('./', window.location.href).href;

  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map((reg) => {
          if (reg.scope === currentAppScope) {
            return reg.unregister();
          }
          return Promise.resolve();
        })
      );
    } catch (_) {}
  }

  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((name) => {
          if (name.startsWith(APP_CACHE_PREFIX) || LEGACY_APP_CACHES.includes(name)) {
            return caches.delete(name);
          }
          return Promise.resolve();
        })
      );
    } catch (_) {}
  }

  const reloadUrl = new URL(window.location.href);
  reloadUrl.searchParams.set('_reinstall', String(Date.now()));
  window.location.replace(reloadUrl.toString());
}

// ---------- Navigation & Round Stages ----------

function selectEdition(edition) {
  cancelHold(false);
  feedbackTap();
  state.edition = edition === 'adult' ? 'adult' : 'classic';
  try {
    localStorage.setItem(STORAGE_KEYS.EDITION, state.edition);
  } catch (_) {}
  state.page = 'start';
  render();
}

function goToEditionSelect() {
  cancelHold(false);
  state.page = 'edition';
  state.roundStage = 'pick_topic';
  state.repeekPlayerIdx = null;
  state.usedDigitalCards = false;
  state.round = 1;
  state.captainIndex = 0;
  state.selectedTopicIndex = null;
  state.skippedCardSets = [];
  state.secretRound = null;
  closeConfirmModal(true);
  render();
}

function goToStart() {
  cancelHold(false);
  state.page = 'start';
  state.roundStage = 'pick_topic';
  state.repeekPlayerIdx = null;
  state.usedDigitalCards = false;
  state.round = 1;
  state.captainIndex = 0;
  state.selectedTopicIndex = null;
  state.skippedCardSets = [];
  state.secretRound = null;
  closeConfirmModal(true);
  render();
}

function startGame(playersCount) {
  if (playersCount === 9 && state.mode === 'expert') return;
  cancelHold(false);
  feedbackTap();
  state.players = playersCount;
  state.maxTokens = playersCount === 9 ? 8 : playersCount;
  state.unicorns = state.maxTokens;
  state.poops = 0;
  state.round = 1;
  state.captainIndex = 0;
  state.page = 'game';
  state.roundStage = 'pick_topic';
  state.repeekPlayerIdx = null;
  state.usedDigitalCards = false;
  state.lastZeroSource = null;
  drawNextCardSet(false);
  state.secretRound = createSecretRoundData();
  render();
}

function setMode(mode) {
  if (state.mode === mode) return;
  feedbackTap();
  state.mode = mode;
  try {
    localStorage.setItem(STORAGE_KEYS.MODE, mode);
  } catch (_) {}
  render();
}

function resetDeckHistory() {
  feedbackTap();
  setActiveUsedSets([]);
  state.skippedCardSets = [];
  render();
}

function redrawTopics() {
  feedbackTap();
  drawNextCardSet(true);
  render();
}

function selectTopic(idx) {
  feedbackTap();
  state.selectedTopicIndex = idx;
  render();
}

function confirmTopicSelection() {
  if (state.selectedTopicIndex === null) return;
  feedbackTap();
  markCurrentCardSetUsed();
  state.roundStage = 'deal_intro';
  render();
}

function backToTopicSelection() {
  cancelHold(false);
  feedbackTap();
  state.roundStage = 'pick_topic';
  render();
}

function beginDigitalDeal() {
  cancelHold(false);
  feedbackTap();
  state.usedDigitalCards = true;
  state.repeekPlayerIdx = null;
  state.secretRound = createSecretRoundData();
  state.roundStage = 'deal_shield';
  render();
}

function skipDigitalDeal() {
  cancelHold(false);
  feedbackTap();
  state.usedDigitalCards = false;
  state.repeekPlayerIdx = null;
  state.roundStage = 'play_round';
  render();
}

function hideCardAndAdvance() {
  cancelHold(false);
  feedbackTap();
  const sr = state.secretRound;
  if (!sr) return;

  const currentPlayerIdx = sr.dealOrder[sr.dealCursor];
  if (sr.cards[currentPlayerIdx]) {
    sr.cards[currentPlayerIdx].viewed = true;
  }

  if (sr.dealCursor + 1 < sr.dealOrder.length) {
    sr.dealCursor += 1;
    state.roundStage = 'deal_shield';
  } else {
    state.usedDigitalCards = true;
    state.roundStage = 'play_round';
  }
  render();
}

// Re-peek flow (when a player forgot their secret number during Stage 3)
function openRepeekPicker() {
  cancelHold(false);
  feedbackTap();
  state.repeekPlayerIdx = null;
  state.roundStage = 'repeek_pick';
  render();
}

function selectRepeekPlayer(playerIdx) {
  const sr = state.secretRound;
  if (!sr) return;
  const card = sr.cards[playerIdx];
  if (!card || !card.hasCard || card.revealed) return;
  cancelHold(false);
  feedbackTap();
  state.repeekPlayerIdx = playerIdx;
  state.roundStage = 'repeek_shield';
  render();
}

function returnToPlayRound() {
  cancelHold(false);
  feedbackTap();
  state.repeekPlayerIdx = null;
  state.roundStage = 'play_round';
  render();
}

function adjustTokens(delta) {
  playClickSound();
  const nextUnicorns = state.unicorns + delta;
  if (nextUnicorns > state.maxTokens || nextUnicorns < 0) return;
  state.unicorns = nextUnicorns;
  state.poops = state.maxTokens - state.unicorns;

  if (delta < 0) {
    vibrate(state.unicorns === 0 ? 'fail' : 'penalty');
  } else {
    vibrate('success');
  }

  render();

  if (state.unicorns === 0 && delta < 0) {
    state.lastZeroSource = 'manual';
    openConfirmModal('zero_unicorns');
  }
}

function handleBackClick() {
  cancelHold(false);
  feedbackTap();
  if (state.page === 'start') {
    goToEditionSelect();
  } else if (state.page === 'game') {
    if (state.roundStage === 'deal_intro') {
      state.roundStage = 'pick_topic';
      render();
    } else if (state.roundStage === 'deal_shield' || state.roundStage === 'deal_reveal') {
      const sr = state.secretRound;
      const hasDealProgress = Boolean(sr && (sr.dealCursor > 0 || state.roundStage === 'deal_reveal'));
      if (hasDealProgress) {
        openConfirmModal('cancel_deal');
      } else {
        state.roundStage = 'deal_intro';
        render();
      }
    } else if (state.roundStage === 'repeek_pick') {
      state.repeekPlayerIdx = null;
      state.roundStage = 'play_round';
      render();
    } else if (state.roundStage === 'repeek_shield' || state.roundStage === 'repeek_reveal') {
      state.repeekPlayerIdx = null;
      state.roundStage = 'repeek_pick';
      render();
    } else {
      openConfirmModal('exit_game');
    }
  } else if (state.page === 'result') {
    goToStart();
  }
}

function toggleSound() {
  state.soundEnabled = !state.soundEnabled;
  try {
    localStorage.setItem(STORAGE_KEYS.SOUND, String(state.soundEnabled));
  } catch (_) {}
  if (state.soundEnabled) playClickSound();
  vibrate('tap');
  updateTopBar();
}

function toggleVibration() {
  state.vibrationEnabled = !state.vibrationEnabled;
  try {
    localStorage.setItem(STORAGE_KEYS.VIBRATION, String(state.vibrationEnabled));
  } catch (_) {}
  playClickSound();
  if (state.vibrationEnabled) vibrate('unlock');
  if (state.rulesOpen) renderRulesModal();
}

function toggleLanguage() {
  cancelHold(false);
  feedbackTap();
  state.language = state.language === 'ru' ? 'en' : 'ru';
  try {
    localStorage.setItem(STORAGE_KEYS.LANG, state.language);
  } catch (_) {}
  document.documentElement.lang = state.language;
  render();
  if (state.confirmModal) renderConfirmModal();
  if (state.rulesOpen) renderRulesModal();
  if (state.namesModalOpen) renderNamesModal();
  if (state.lightboxOpen) updateLightboxTexts();
}

// ---------- Stage 3 Reveal & Undo Handlers ----------

function revealClassicPlayer(playerIdx) {
  const sr = state.secretRound;
  if (!sr) return;
  const card = sr.cards[playerIdx];
  if (!card || !card.hasCard || card.revealed) return;
  playClickSound();

  const tr = t();
  const prev = sr.revealedOrder.length > 0 ? sr.revealedOrder[sr.revealedOrder.length - 1] : null;
  const prevFeedback = sr.lastFeedback ? { ...sr.lastFeedback } : null;
  const name = getPlayerDisplay(playerIdx, card.isCaptain, 'paren');

  card.revealed = true;
  let tokenDelta = 0;

  if (!prev) {
    vibrate('tap');
    sr.lastFeedback = { ok: true, text: tr.secretFeedbackFirst(name, card.number) };
  } else if (card.number < prev.number) {
    card.penalty = true;
    sr.lastFeedback = { ok: false, text: tr.secretFeedbackPenalty(name, card.number, prev.number) };
    if (state.unicorns > 0) {
      state.unicorns -= 1;
      state.poops = state.maxTokens - state.unicorns;
      tokenDelta = -1;
      vibrate(state.unicorns === 0 ? 'fail' : 'penalty');
    }
  } else {
    vibrate('success');
    sr.lastFeedback = { ok: true, text: tr.secretFeedbackOk(name, card.number, prev.number) };
  }

  sr.revealedOrder.push({
    playerIdx,
    number: card.number,
    penalty: card.penalty,
    tokenDelta,
    prevFeedback,
    isCaptainBonus: false
  });

  render();

  if (tokenDelta < 0 && state.unicorns === 0) {
    state.lastZeroSource = 'reveal';
    openConfirmModal('zero_unicorns');
  }
}

function selectExpertTarget(playerIdx) {
  const sr = state.secretRound;
  if (!sr) return;
  const card = sr.cards[playerIdx];
  if (!card || !card.hasCard || card.revealed || card.isCaptain) return;
  feedbackTap();
  sr.expertTarget = playerIdx;
  sr.expertGuess = null;
  render();
}

function pickExpertNumber(num) {
  const sr = state.secretRound;
  if (!sr) return;
  feedbackTap();
  sr.expertGuess = num;
  render();
}

function confirmExpertReveal() {
  const sr = state.secretRound;
  if (!sr || sr.expertTarget === null || sr.expertGuess === null) return;
  const card = sr.cards[sr.expertTarget];
  if (!card || card.revealed) return;
  playClickSound();

  const tr = t();
  const prevFeedback = sr.lastFeedback ? { ...sr.lastFeedback } : null;
  const name = getPlayerName(card.playerIdx);
  card.revealed = true;
  card.guessedNumber = sr.expertGuess;

  let tokenDelta = 0;
  if (card.number === sr.expertGuess) {
    vibrate('success');
    sr.lastFeedback = { ok: true, text: tr.secretFeedbackExpertHit(name, card.number) };
  } else {
    card.penalty = true;
    sr.lastFeedback = { ok: false, text: tr.secretFeedbackExpertMiss(name, card.number, sr.expertGuess) };
    if (state.unicorns > 0) {
      state.unicorns -= 1;
      state.poops = state.maxTokens - state.unicorns;
      tokenDelta = -1;
      vibrate(state.unicorns === 0 ? 'fail' : 'penalty');
    }
  }

  sr.revealedOrder.push({
    playerIdx: card.playerIdx,
    number: card.number,
    penalty: card.penalty,
    tokenDelta,
    prevFeedback,
    isCaptainBonus: false
  });
  sr.expertTarget = null;
  sr.expertGuess = null;

  render();

  if (tokenDelta < 0 && state.unicorns === 0) {
    state.lastZeroSource = 'reveal';
    openConfirmModal('zero_unicorns');
  }
}

function confirmExpertCaptainGuess() {
  const sr = state.secretRound;
  if (!sr || sr.expertGuess === null || sr.captainGuessDone) return;
  const capCard = sr.cards.find((c) => c.isCaptain && c.hasCard);
  if (!capCard) return;
  playClickSound();

  const tr = t();
  const prevFeedback = sr.lastFeedback ? { ...sr.lastFeedback } : null;
  capCard.revealed = true;
  capCard.guessedNumber = sr.expertGuess;
  sr.captainGuessDone = true;

  let tokenDelta = 0;
  if (capCard.number === sr.expertGuess) {
    if (state.poops > 0) {
      state.unicorns += 1;
      state.poops = state.maxTokens - state.unicorns;
      tokenDelta = 1;
    }
    vibrate('success');
    sr.lastFeedback = {
      ok: true,
      text: tokenDelta > 0 ? tr.secretFeedbackCapHitRestore(capCard.number) : tr.secretFeedbackCapHitFull(capCard.number)
    };
  } else {
    vibrate('penalty');
    sr.lastFeedback = {
      ok: false,
      text: tr.secretFeedbackCapMiss(capCard.number, sr.expertGuess)
    };
  }

  sr.revealedOrder.push({
    playerIdx: capCard.playerIdx,
    number: capCard.number,
    penalty: false,
    tokenDelta,
    prevFeedback,
    isCaptainBonus: true
  });
  sr.expertGuess = null;
  render();
}

function undoLastReveal() {
  const sr = state.secretRound;
  if (!sr || sr.revealedOrder.length === 0) return;
  feedbackTap();

  const last = sr.revealedOrder.pop();
  const card = sr.cards[last.playerIdx];
  if (card) {
    card.revealed = false;
    card.penalty = false;
    card.guessedNumber = null;
  }
  if (last.isCaptainBonus) {
    sr.captainGuessDone = false;
  }

  const delta = Number.isFinite(last.tokenDelta) ? last.tokenDelta : last.penalty ? -1 : 0;
  if (delta !== 0) {
    state.unicorns = Math.max(0, Math.min(state.maxTokens, state.unicorns - delta));
    state.poops = state.maxTokens - state.unicorns;
  }

  sr.lastFeedback = last.prevFeedback || null;
  sr.expertTarget = null;
  sr.expertGuess = null;
  state.lastZeroSource = null;
  vibrate('tap');
  render();
}

// ---------- Top Bar & Page Rendering ----------

function updateTopBar() {
  const tr = t();
  const btnBack = document.getElementById('btn-back');
  const titleEl = document.getElementById('top-bar-title');
  const btnLang = document.getElementById('btn-lang');
  const btnSound = document.getElementById('btn-sound');
  const iconOn = document.getElementById('icon-sound-on');
  const iconOff = document.getElementById('icon-sound-off');
  const btnRules = document.getElementById('btn-rules');

  btnBack.classList.toggle('is-invisible', state.page === 'edition');
  btnBack.setAttribute('aria-label', tr.ariaBack);
  btnSound.setAttribute('aria-label', tr.ariaSound);
  btnRules.setAttribute('aria-label', tr.ariaRules);
  btnLang.setAttribute('aria-label', tr.ariaLang);

  btnLang.textContent = state.language === 'ru' ? 'EN' : 'RU';
  btnSound.classList.toggle('is-muted', !state.soundEnabled);
  iconOn.classList.toggle('hidden', !state.soundEnabled);
  iconOff.classList.toggle('hidden', state.soundEnabled);

  if (state.page === 'edition') {
    titleEl.textContent = tr.appTitle;
  } else if (state.page === 'start') {
    titleEl.textContent = getActiveAppTitle();
  } else if (state.page === 'game') {
    // Keep top bar concise so it never truncates on 375px viewports
    titleEl.textContent = tr.roundShort(state.round, TOTAL_ROUNDS);
  } else {
    titleEl.textContent = tr.resultTitle;
  }
}

function render() {
  cancelHold(false);
  saveGameSession();
  syncThemeAndMeta();
  updateTopBar();
  const content = document.getElementById('content');
  const offlineBanner = !pwaState.isOnline ? `<div class="offline-notice">${t().offlineNotice}</div>` : '';

  if (state.page === 'edition') {
    content.innerHTML = offlineBanner + renderEditionPageHtml();
  } else if (state.page === 'start') {
    content.innerHTML = offlineBanner + renderStartPageHtml();
  } else if (state.page === 'game') {
    content.innerHTML = offlineBanner + renderGameStageHtml();
  } else {
    content.innerHTML = offlineBanner + renderResultPageHtml();
  }
}

function canOfferInstall() {
  return !pwaState.isInstalled && (Boolean(pwaState.deferredPrompt) || pwaState.isIOS);
}

function renderInstallCardHtml() {
  if (!canOfferInstall()) return '';
  const tr = t();
  return `
    <div class="install-card">
      <div class="install-card-text">
        <strong>${tr.installCardTitle}</strong>
        <span>${tr.installCardDesc}</span>
      </div>
      <button type="button" class="tool-btn tool-btn-accent" onclick="triggerPWAInstall()">
        ${pwaState.deferredPrompt ? tr.installBtn : tr.installIosBtn}
      </button>
    </div>
  `;
}

// Page 0: Edition Selection — unified with Start Page design (clean, concise 2-button choice)
function renderEditionPageHtml() {
  const tr = t();

  return `
    <section class="start-page">
      <div class="hero-brand">
        <img src="${CLASSIC_EMBLEM_SRC}" alt="${tr.appTitle}" class="hero-logo">
        <h1 class="hero-title">${tr.appTitle}</h1>
        <p class="hero-subtitle">${tr.editionSubtitle}</p>
      </div>

      <div class="edition-choices">
        <button type="button" class="edition-choice-btn edition-choice-classic" onclick="selectEdition('classic')">
          <span class="edition-choice-emblem">
            <img src="${CLASSIC_EMBLEM_SRC}" alt="">
          </span>
          <span class="edition-choice-copy">
            <span class="edition-choice-title">${tr.editionClassicName}</span>
            <span class="edition-choice-desc">${tr.editionClassicDesc}</span>
          </span>
          <span class="edition-choice-arrow" aria-hidden="true">${ICON_CHEVRON_RIGHT_SVG}</span>
        </button>

        <button type="button" class="edition-choice-btn edition-choice-adult" onclick="selectEdition('adult')">
          <span class="edition-choice-emblem">
            <img src="${ADULT_EMBLEM_SRC}" alt="">
          </span>
          <span class="edition-choice-copy">
            <span class="edition-choice-title">${tr.editionAdultName}</span>
            <span class="edition-choice-desc">${tr.editionAdultDesc}</span>
          </span>
          <span class="edition-choice-arrow" aria-hidden="true">${ICON_CHEVRON_RIGHT_SVG}</span>
        </button>
      </div>

      ${renderInstallCardHtml()}
    </section>
  `;
}

function renderEditionHeroEmblemHtml(isResult) {
  const appTitle = getActiveAppTitle();
  if (isAdultEdition()) {
    return `<img src="${ADULT_EMBLEM_SRC}" alt="${appTitle}" class="${isResult ? 'result-logo-adult' : 'hero-logo-adult'}">`;
  }
  return `<img src="${CLASSIC_EMBLEM_SRC}" alt="${appTitle}" class="${isResult ? 'result-logo' : 'hero-logo'}">`;
}

function renderStartPageHtml() {
  const tr = t();
  const totalSets = getTotalCardSets();
  const usedSets = getActiveUsedSets();
  const remaining = totalSets - usedSets.length;
  const modeHint = state.mode === 'classic' ? tr.modeClassicHint : tr.modeExpertHint;
  const subtitle = isAdultEdition() ? tr.heroSubtitle18 : tr.heroSubtitle;
  const isExpert = state.mode === 'expert';
  const namedCount = state.playerNames.filter((n) => n.trim().length > 0).length;

  const playerButtons = [4, 5, 6, 7, 8, 9]
    .map((n) => {
      const disabledNine = n === 9 && isExpert;
      const subLabel = disabledNine
        ? tr.expertOnlyClassicSub
        : n === 9
          ? state.language === 'ru'
            ? '8 жетонов'
            : '8 tokens'
          : state.language === 'ru'
            ? `${n} жет.`
            : `${n} tok.`;
      return `
        <button type="button" class="player-btn" onclick="startGame(${n})" ${disabledNine ? 'disabled' : ''}>
          <span>${n}</span>
          <span class="player-btn-sub">${subLabel}</span>
        </button>
      `;
    })
    .join('');

  return `
    <section class="start-page">
      <div class="hero-brand">
        ${renderEditionHeroEmblemHtml(false)}
        <h1 class="hero-title">${getActiveAppTitle()}</h1>
        <p class="hero-subtitle">${subtitle}</p>
      </div>

      <div class="setup-block">
        <h2 class="section-label">${tr.modeLabel}</h2>
        <div class="mode-switch" role="group" aria-label="${tr.modeLabel}">
          <button type="button" class="mode-btn ${state.mode === 'classic' ? 'is-active' : ''}" onclick="setMode('classic')" aria-pressed="${state.mode === 'classic'}">${tr.modeClassic}</button>
          <button type="button" class="mode-btn ${state.mode === 'expert' ? 'is-active' : ''}" onclick="setMode('expert')" aria-pressed="${state.mode === 'expert'}">${tr.modeExpert}</button>
        </div>
        <p class="mode-hint">${modeHint}</p>
      </div>

      <div class="setup-block">
        <h2 class="section-label">${tr.playersLabel}</h2>
        <div class="player-grid">${playerButtons}</div>
      </div>

      ${renderInstallCardHtml()}

      <div class="deck-meta">
        <button type="button" class="text-link-btn" onclick="openNamesModal()">${namedCount > 0 ? tr.playerNamesEdited(namedCount) : tr.playerNamesBtn}</button>
        <span aria-hidden="true">·</span>
        <span>${tr.deckRemaining(remaining, totalSets)}</span>
        ${usedSets.length > 0 ? `<span aria-hidden="true">·</span><button type="button" class="text-link-btn" onclick="resetDeckHistory()">${tr.resetDeck}</button>` : ''}
      </div>
    </section>
  `;
}

function renderRoundContextBarHtml() {
  const tr = t();
  const capName = escapeHtml(getPlayerName(state.captainIndex));
  const modeBadge = state.mode === 'expert' ? `<span class="round-context-mode">${tr.modeExpert}</span>` : '';
  return `
    <div class="round-context-bar">
      <span class="round-context-captain">${ICON_CROWN_SVG}<span>${tr.captainLabel(capName)}</span></span>
      ${modeBadge}
    </div>
  `;
}

function renderStageToolbarHtml(activeStepNumber, rightActionHtml) {
  const tr = t();
  const labels = {
    1: tr.step1Short,
    2: tr.step2Short,
    3: tr.step3Short
  };
  const dots = [1, 2, 3]
    .map((n) => {
      const cls = n < activeStepNumber ? 'is-done' : n === activeStepNumber ? 'is-active' : '';
      return `<span class="step-dot ${cls}"></span>`;
    })
    .join('');

  return `
    <div class="stage-toolbar">
      <div class="stage-step-compact" aria-label="Step ${activeStepNumber} of 3">
        <span class="step-dots" aria-hidden="true">${dots}</span>
        <span class="step-compact-num">${activeStepNumber}/3</span>
        <span class="step-compact-label">${labels[activeStepNumber]}</span>
      </div>
      ${rightActionHtml ? `<div class="stage-toolbar-actions">${rightActionHtml}</div>` : ''}
    </div>
  `;
}

function renderInkblotInteractiveHtml() {
  const tr = t();
  return `
    <div class="topic-inkblot-btn" role="button" tabindex="0" onclick="openInkblotLightbox(event)" onkeydown="handleInkblotKeyDown(event)" aria-label="${tr.inkblotAlt} — ${tr.inkblotZoomHint}">
      <img src="${INKBLOT_IMG_SRC}" alt="${tr.inkblotAlt}" class="topic-inkblot-img">
      <span class="topic-inkblot-hint">${tr.inkblotZoomHint}</span>
    </div>
  `;
}

function renderFeaturedTopicCardHtml(compact) {
  const topicText = getSelectedTopicRawText();
  const inkblotHtml = isCurrentCardInkblot() ? renderInkblotInteractiveHtml() : '';
  return `
    <div class="featured-topic-card ${compact ? 'is-compact' : ''}">
      <p class="featured-topic-text">${formatCardHtml(topicText)}</p>
      ${inkblotHtml}
    </div>
  `;
}

function renderGameStageHtml() {
  if (state.roundStage === 'pick_topic') return renderStage1PickTopicHtml();
  if (state.roundStage === 'deal_intro') return renderStage2DealIntroHtml();
  if (state.roundStage === 'deal_shield') return renderStage2DealShieldHtml();
  if (state.roundStage === 'deal_reveal') return renderStage2DealRevealHtml();
  if (state.roundStage === 'repeek_pick') return renderRepeekPickHtml();
  if (state.roundStage === 'repeek_shield') return renderRepeekShieldHtml();
  if (state.roundStage === 'repeek_reveal') return renderRepeekRevealHtml();
  return renderStage3PlayRoundHtml();
}

// Stage 1: Pick 1 of 4 Topics (or the standalone 1-topic Psychotherapist Inkblot card!)
function renderStage1PickTopicHtml() {
  const tr = t();
  const redrawBtn = `<button type="button" class="tool-btn" onclick="redrawTopics()">${ICON_REFRESH_SVG}<span>${tr.btnRedraw}</span></button>`;

  let topicCardsHtml = '';
  const isInkblot = isCurrentCardInkblot();

  if (isInkblot) {
    const isSelected = state.selectedTopicIndex === 0;
    const cardText = getInkblotTopicText();
    topicCardsHtml = `
      <div class="topics-grid is-single-card">
        <div role="button" tabindex="0"
          class="topic-card ${isSelected ? 'is-selected' : ''}"
          onclick="selectTopic(0)"
          onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();selectTopic(0);}"
          aria-pressed="${isSelected}">
          ${isSelected ? `<span class="topic-check-badge" aria-hidden="true">${ICON_CHECK_SVG}</span>` : ''}
          <p class="topic-text">${formatCardHtml(cardText)}</p>
          ${renderInkblotInteractiveHtml()}
        </div>
      </div>
    `;
  } else {
    const texts = getActiveTopics();
    const baseIdx = state.currentCardSet * 4;
    const cards = [0, 1, 2, 3]
      .map((i) => {
        const cardText = texts[(baseIdx + i) % texts.length];
        const isSelected = state.selectedTopicIndex === i;
        const isDimmed = state.selectedTopicIndex !== null && !isSelected;
        return `
          <button type="button"
            class="topic-card ${isSelected ? 'is-selected' : ''} ${isDimmed ? 'is-dimmed' : ''}"
            onclick="selectTopic(${i})"
            aria-pressed="${isSelected}">
            ${isSelected ? `<span class="topic-check-badge" aria-hidden="true">${ICON_CHECK_SVG}</span>` : ''}
            <p class="topic-text">${formatCardHtml(cardText)}</p>
          </button>
        `;
      })
      .join('');
    topicCardsHtml = `<div class="topics-grid">${cards}</div>`;
  }

  const hasChoice = state.selectedTopicIndex !== null;

  return `
    <section class="game-page">
      ${renderRoundContextBarHtml()}
      ${renderStageToolbarHtml(1, redrawBtn)}

      ${topicCardsHtml}

      <div class="stage-footer-bar">
        <button type="button" class="btn btn-primary" onclick="confirmTopicSelection()" ${hasChoice ? '' : 'disabled'}>
          ${hasChoice ? tr.btnConfirmTopic : tr.btnPickTopicPrompt}
        </button>
      </div>
    </section>
  `;
}

// Stage 2A: Standalone Topic Card + Prompt to Deal Secret Cards
function renderStage2DealIntroHtml() {
  const tr = t();
  const isNine = state.players === 9;
  const cardsCount = isNine ? 8 : state.players;
  const changeBtn = `<button type="button" class="tool-btn" onclick="backToTopicSelection()">${tr.btnChangeTopic}</button>`;

  return `
    <section class="stage-centered">
      ${renderRoundContextBarHtml()}
      ${renderStageToolbarHtml(2, changeBtn)}

      ${renderFeaturedTopicCardHtml(false)}

      <div class="deal-intro-panel">
        <h2 class="deal-intro-title">${tr.dealIntroTitle}</h2>
        <p class="deal-intro-desc">${tr.dealIntroDesc(cardsCount, isNine)}</p>

        <div class="stage-action-stack">
          <button type="button" class="btn btn-primary" onclick="beginDigitalDeal()">${tr.btnStartDeal}</button>
          <button type="button" class="btn btn-secondary" onclick="skipDigitalDeal()">${tr.btnUsePhysicalCards}</button>
        </div>
      </div>
    </section>
  `;
}

// Stage 2B: Anti-Peek Privacy Shield with Hold-to-Confirm Button
function renderStage2DealShieldHtml() {
  const tr = t();
  const sr = state.secretRound;
  if (!sr) return renderStage2DealIntroHtml();

  const currentIdx = sr.dealOrder[sr.dealCursor];
  const card = sr.cards[currentIdx];
  const playerTitle = escapeHtml(getPlayerDisplay(card.playerIdx, card.isCaptain, 'paren'));

  const dots = sr.dealOrder
    .map((_, idx) => {
      const cls = idx < sr.dealCursor ? 'is-done' : idx === sr.dealCursor ? 'is-current' : '';
      return `<span class="shield-dot ${cls}"></span>`;
    })
    .join('');

  return `
    <section class="stage-centered">
      ${renderStageToolbarHtml(2, '')}

      <div class="privacy-shield">
        <div class="shield-progress-row">
          <span>${tr.shieldProgress(sr.dealCursor + 1, sr.dealOrder.length)}</span>
          <div class="shield-dots" aria-hidden="true">${dots}</div>
        </div>

        <div class="shield-icon-wrap">${ICON_EYE_OFF_SVG}</div>

        <span class="shield-kicker">${tr.shieldPassTo}</span>
        <h2 class="shield-player-title">${playerTitle}</h2>

        <button type="button"
          id="hold-reveal-btn"
          class="hold-btn"
          onpointerdown="startHold(event)"
          onpointerup="cancelHold(true)"
          onpointercancel="cancelHold(false)"
          onpointerleave="cancelHold(true)"
          onkeydown="handleHoldKeyDown(event)"
          onkeyup="handleHoldKeyUp(event)"
          oncontextmenu="return false">
          <span id="hold-reveal-fill" class="hold-btn-fill" aria-hidden="true"></span>
          <span class="hold-btn-label">${tr.shieldHoldLabel}</span>
        </button>

        <div id="hold-reveal-hint" class="hold-hint" aria-live="polite"></div>

        ${state.players === 9 ? `<div class="deck-meta">${escapeHtml(tr.shieldCaptainSkipped(getPlayerName(state.captainIndex)))}</div>` : ''}
      </div>

      ${renderFeaturedTopicCardHtml(true)}
    </section>
  `;
}

// Stage 2C: Secret Number Reveal for Current Player
function renderStage2DealRevealHtml() {
  const tr = t();
  const sr = state.secretRound;
  if (!sr) return renderStage2DealIntroHtml();

  const currentIdx = sr.dealOrder[sr.dealCursor];
  const card = sr.cards[currentIdx];
  const percent = ((card.number - 1) / 9) * 100;
  const playerTitle = escapeHtml(getPlayerDisplay(card.playerIdx, card.isCaptain, 'dot'));

  const hasNext = sr.dealCursor + 1 < sr.dealOrder.length;
  let nextBtnText = tr.btnHideFinishDeal;
  if (hasNext) {
    const nextIdx = sr.dealOrder[sr.dealCursor + 1];
    const nextCard = sr.cards[nextIdx];
    const nextName = getPlayerDisplay(nextIdx, nextCard.isCaptain, 'paren');
    nextBtnText = tr.btnHidePassNext(nextName);
  }

  const scaleLabels = getActiveScaleLabels();

  return `
    <section class="stage-centered">
      ${renderStageToolbarHtml(2, '')}

      <div class="peek-card">
        <span class="peek-player-name">${playerTitle}</span>
        <div class="peek-number">${card.number}</div>
        <div class="intensity-bar-wrap">
          <div class="intensity-bar">
            <span class="intensity-marker" style="left: ${percent}%"></span>
          </div>
          <div class="intensity-labels">
            <span class="low">${scaleLabels.low}</span>
            <span class="high">${scaleLabels.high}</span>
          </div>
        </div>
        <p class="peek-hint-text">${tr.peekHint}</p>
        <button type="button" class="btn btn-primary" onclick="hideCardAndAdvance()">${escapeHtml(nextBtnText)}</button>
      </div>

      ${renderFeaturedTopicCardHtml(true)}
    </section>
  `;
}

// Re-peek Views (when a player forgot their secret number during Stage 3)
function renderRepeekPickHtml() {
  const tr = t();
  const sr = state.secretRound;
  if (!sr) return renderStage3PlayRoundHtml();

  const backBtn = `<button type="button" class="tool-btn" onclick="returnToPlayRound()">${tr.repeekBackToRound}</button>`;
  const tiles = sr.cards
    .map((card) => renderPlayerCardButtonHtml(card, 'repeek'))
    .join('');

  return `
    <section class="game-page">
      ${renderStageToolbarHtml(3, backBtn)}

      <div class="reveal-panel">
        <div class="reveal-panel-header">
          <h3 class="reveal-panel-title">${tr.repeekTitle}</h3>
        </div>
        <p class="secret-intro">${tr.repeekDesc}</p>
        <div class="secret-grid-wide">${tiles}</div>
      </div>

      ${renderFeaturedTopicCardHtml(true)}
    </section>
  `;
}

function renderRepeekShieldHtml() {
  const tr = t();
  const sr = state.secretRound;
  const idx = state.repeekPlayerIdx;
  if (!sr || idx === null || !sr.cards[idx]) return renderStage3PlayRoundHtml();

  const card = sr.cards[idx];
  const playerTitle = escapeHtml(getPlayerDisplay(card.playerIdx, card.isCaptain, 'paren'));
  const backBtn = `<button type="button" class="tool-btn" onclick="openRepeekPicker()">${tr.repeekBackToList}</button>`;

  return `
    <section class="stage-centered">
      ${renderStageToolbarHtml(3, backBtn)}

      <div class="privacy-shield">
        <div class="shield-icon-wrap">${ICON_EYE_OFF_SVG}</div>

        <span class="shield-kicker">${tr.repeekShieldKicker}</span>
        <h2 class="shield-player-title">${playerTitle}</h2>

        <button type="button"
          id="hold-reveal-btn"
          class="hold-btn"
          onpointerdown="startHold(event)"
          onpointerup="cancelHold(true)"
          onpointercancel="cancelHold(false)"
          onpointerleave="cancelHold(true)"
          onkeydown="handleHoldKeyDown(event)"
          onkeyup="handleHoldKeyUp(event)"
          oncontextmenu="return false">
          <span id="hold-reveal-fill" class="hold-btn-fill" aria-hidden="true"></span>
          <span class="hold-btn-label">${tr.shieldHoldLabel}</span>
        </button>

        <div id="hold-reveal-hint" class="hold-hint" aria-live="polite"></div>
      </div>

      ${renderFeaturedTopicCardHtml(true)}
    </section>
  `;
}

function renderRepeekRevealHtml() {
  const tr = t();
  const sr = state.secretRound;
  const idx = state.repeekPlayerIdx;
  if (!sr || idx === null || !sr.cards[idx]) return renderStage3PlayRoundHtml();

  const card = sr.cards[idx];
  const percent = ((card.number - 1) / 9) * 100;
  const playerTitle = escapeHtml(getPlayerDisplay(card.playerIdx, card.isCaptain, 'dot'));
  const scaleLabels = getActiveScaleLabels();

  return `
    <section class="stage-centered">
      ${renderStageToolbarHtml(3, '')}

      <div class="peek-card">
        <span class="peek-player-name">${playerTitle}</span>
        <div class="peek-number">${card.number}</div>
        <div class="intensity-bar-wrap">
          <div class="intensity-bar">
            <span class="intensity-marker" style="left: ${percent}%"></span>
          </div>
          <div class="intensity-labels">
            <span class="low">${scaleLabels.low}</span>
            <span class="high">${scaleLabels.high}</span>
          </div>
        </div>
        <p class="peek-hint-text">${tr.peekHint}</p>
        <button type="button" class="btn btn-primary" onclick="returnToPlayRound()">${tr.repeekDoneBtn}</button>
      </div>

      ${renderFeaturedTopicCardHtml(true)}
    </section>
  `;
}

// Polished tabletop player card button (used by Captain in Stage 3 & Re-peek picker)
function renderPlayerCardButtonHtml(card, mode) {
  const tr = t();
  const sr = state.secretRound;
  const playerNum = card.playerIdx + 1;
  const name = escapeHtml(getPlayerName(card.playerIdx));
  const avatarInner = card.isCaptain ? ICON_CROWN_SVG : String(playerNum);
  const captainClass = card.isCaptain ? 'is-captain' : '';

  if (!card.hasCard) {
    return `
      <button type="button" class="player-card-tile is-nocard ${captainClass}" disabled>
        <div class="pcard-avatar">${avatarInner}</div>
        <div class="pcard-name">${name}</div>
        <div class="pcard-status">${tr.secretNoCard}</div>
      </button>
    `;
  }

  if (card.revealed) {
    const percent = ((card.number - 1) / 9) * 100;
    const stateIcon = card.penalty ? ICON_CROSS_SVG : ICON_CHECK_SVG;
    const showGuessNote =
      state.mode === 'expert' &&
      card.guessedNumber !== null &&
      card.guessedNumber !== card.number;
    return `
      <button type="button" class="player-card-tile ${card.penalty ? 'is-penalty' : 'is-revealed'} ${captainClass}" disabled>
        <div class="pcard-revealed-top">
          <span class="pcard-revealed-name">${card.isCaptain ? `${ICON_CROWN_SVG} ` : ''}${name}</span>
          <span class="pcard-state-badge ${card.penalty ? 'is-err' : 'is-ok'}" aria-hidden="true">${stateIcon}</span>
        </div>
        <div class="pcard-number">${card.number}</div>
        ${showGuessNote ? `<div class="pcard-guess-note">${tr.guessNote(card.guessedNumber)}</div>` : ''}
        <div class="pcard-mini-bar" aria-hidden="true">
          <span class="pcard-mini-dot" style="left: ${percent}%"></span>
        </div>
      </button>
    `;
  }

  if (mode === 'repeek') {
    return `
      <button type="button" class="player-card-tile is-repeek ${captainClass}" onclick="selectRepeekPlayer(${card.playerIdx})">
        <div class="pcard-avatar">${avatarInner}</div>
        <div class="pcard-name">${name}</div>
        ${card.isCaptain ? `<span class="pcard-cap-sub">${tr.captainTag}</span>` : ''}
        <span class="pcard-action">${ICON_EYE_SM_SVG}<span>${tr.repeekAction}</span></span>
      </button>
    `;
  }

  if (mode === 'expert') {
    const isSelectedTarget = sr && sr.expertTarget === card.playerIdx;
    const disabledCap = card.isCaptain ? 'disabled' : '';
    const actionText = card.isCaptain
      ? tr.secretRevealedLast
      : isSelectedTarget
        ? tr.secretSelected
        : tr.tapToSelect;
    return `
      <button type="button"
        class="player-card-tile ${isSelectedTarget ? 'is-selected-target' : ''} ${card.isCaptain ? 'is-locked-cap' : ''} ${captainClass}"
        onclick="selectExpertTarget(${card.playerIdx})"
        ${disabledCap}>
        <div class="pcard-avatar">${avatarInner}</div>
        <div class="pcard-name">${name}</div>
        ${card.isCaptain ? `<span class="pcard-cap-sub">${tr.captainTag}</span>` : ''}
        <span class="pcard-action">${actionText}</span>
      </button>
    `;
  }

  return `
    <button type="button" class="player-card-tile ${captainClass}" onclick="revealClassicPlayer(${card.playerIdx})">
      <div class="pcard-avatar">${avatarInner}</div>
      <div class="pcard-name">${name}</div>
      ${card.isCaptain ? `<span class="pcard-cap-sub">${tr.captainTag}</span>` : ''}
      <span class="pcard-action">${tr.tapToReveal}</span>
    </button>
  `;
}

// Stage 3: Topic + Player Card Reveal + Token Scoring Playmat
function renderStage3PlayRoundHtml() {
  const tr = t();
  const isExpert = state.mode === 'expert';
  const banners = [];
  if (state.players === 9) {
    banners.push(`<div><strong>9:</strong> ${tr.ninePlayersNote}</div>`);
  }
  if (isExpert) {
    banners.push(`<div><strong>${tr.modeExpert}:</strong> ${tr.expertRoundNote}</div>`);
  }

  const unicornDiscs =
    state.unicorns > 0
      ? Array.from({ length: state.unicorns }, () => `<span class="token-disc token-disc-unicorn">${ICON_UNICORN_SVG}</span>`).join('')
      : `<span class="token-empty-note">${tr.zoneEmpty}</span>`;

  const poopDiscs =
    state.poops > 0
      ? Array.from({ length: state.poops }, () => `<span class="token-disc token-disc-poop">${ICON_POOP_SVG}</span>`).join('')
      : `<span class="token-empty-note">${tr.zoneEmpty}</span>`;

  const isLastRound = state.round >= TOTAL_ROUNDS || state.unicorns <= 0;
  const nextLabel = isLastRound ? tr.btnFinishGame : tr.btnNextRound;

  return `
    <section class="game-page">
      ${renderRoundContextBarHtml()}
      ${renderStageToolbarHtml(3, '')}

      ${renderFeaturedTopicCardHtml(true)}

      ${banners.length ? `<div class="mode-banner">${banners.join('')}</div>` : ''}

      ${renderInlineRevealPanelHtml()}

      <div class="playmat">
        <div class="token-zones">
          <div class="token-zone token-zone-unicorns">
            <div class="token-zone-header">
              <span class="token-zone-label">${ICON_UNICORN_SVG}<span>${tr.zoneUnicorns}</span></span>
              <span class="token-zone-count">${state.unicorns}</span>
            </div>
            <div class="token-dots">${unicornDiscs}</div>
            <button type="button" class="token-action-btn token-btn-restore" onclick="adjustTokens(1)" ${state.poops <= 0 ? 'disabled' : ''}>${tr.btnRestoreToken}</button>
          </div>

          <div class="token-zone token-zone-poops">
            <div class="token-zone-header">
              <span class="token-zone-label">${ICON_POOP_SVG}<span>${tr.zonePoops}</span></span>
              <span class="token-zone-count">${state.poops}</span>
            </div>
            <div class="token-dots">${poopDiscs}</div>
            <button type="button" class="token-action-btn token-btn-penalty" onclick="adjustTokens(-1)" ${state.unicorns <= 0 ? 'disabled' : ''}>${tr.btnPenaltyToken}</button>
          </div>
        </div>

        <button type="button" class="btn btn-primary" onclick="handleNextRoundClick()">${nextLabel}</button>
      </div>
    </section>
  `;
}

function renderInlineRevealPanelHtml() {
  const tr = t();
  if (!state.usedDigitalCards || !state.secretRound) {
    return `
      <div class="reveal-panel">
        <div class="reveal-panel-header">
          <h3 class="reveal-panel-title">${tr.revealPanelTitle}</h3>
          <button type="button" class="tool-btn tool-btn-accent" onclick="beginDigitalDeal()">${tr.btnDealDigitalNow}</button>
        </div>
        <p class="secret-intro">${tr.physicalCardsNote}</p>
      </div>
    `;
  }

  const sr = state.secretRound;
  const isExpert = state.mode === 'expert';
  const nonCaptainCards = sr.cards.filter((c) => c.hasCard && !c.isCaptain);
  const allNonCaptainRevealed = nonCaptainCards.every((c) => c.revealed);
  const captainCard = sr.cards.find((c) => c.isCaptain && c.hasCard);
  const needsCaptainBonus = isExpert && allNonCaptainRevealed && captainCard && !captainCard.revealed;
  const hasUnrevealedCards = sr.cards.some((c) => c.hasCard && !c.revealed);
  const allRevealed = !hasUnrevealedCards;
  const revealedNumbers = new Set(sr.cards.filter((c) => c.revealed).map((c) => c.number));

  const tiles = sr.cards
    .map((card) => renderPlayerCardButtonHtml(card, isExpert ? 'expert' : 'classic'))
    .join('');

  const sequenceHtml =
    sr.revealedOrder.length > 0
      ? `<div class="sequence-row"><span>${tr.secretSequenceLabel}</span>${sr.revealedOrder
          .map((item, idx) => `${idx > 0 ? '<span aria-hidden="true">→</span>' : ''}<span class="seq-item ${item.penalty ? 'is-err' : ''}">${item.number}</span>`)
          .join('')}</div>`
      : '';

  const feedbackHtml = sr.lastFeedback
    ? `<div class="reveal-feedback ${sr.lastFeedback.ok ? 'is-ok' : 'is-err'}">${escapeHtml(sr.lastFeedback.text)}</div>`
    : '';

  let expertPickerHtml = '';
  if (isExpert && !allRevealed) {
    const numButtons = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      .map((n) => {
        const isChosen = sr.expertGuess === n;
        const isUsed = revealedNumbers.has(n);
        return `<button type="button" class="num-pick-btn ${isUsed ? 'is-used-num' : ''} ${isChosen ? 'is-chosen' : ''}" onclick="pickExpertNumber(${n})">${n}</button>`;
      })
      .join('');

    if (needsCaptainBonus) {
      const capName = escapeHtml(getPlayerName(captainCard.playerIdx));
      expertPickerHtml = `
        <div class="expert-picker">
          <div style="font-weight: 700; color: var(--accent-gold);">${tr.secretExpertCaptainTitle}</div>
          <p class="secret-intro">${tr.secretExpertCaptainDesc(capName)}</p>
          <div class="num-pick-grid">${numButtons}</div>
          <button type="button" class="btn btn-primary" onclick="confirmExpertCaptainGuess()" ${sr.expertGuess === null ? 'disabled' : ''}>
            ${sr.expertGuess === null ? tr.secretExpertPickNum : tr.secretExpertCaptainGuessBtn(sr.expertGuess)}
          </button>
        </div>
      `;
    } else if (sr.expertTarget !== null) {
      const targetName = escapeHtml(getPlayerName(sr.expertTarget));
      expertPickerHtml = `
        <div class="expert-picker">
          <div style="font-weight: 700;">${tr.secretExpertGuessFor(targetName)}</div>
          <div class="num-pick-grid">${numButtons}</div>
          <button type="button" class="btn btn-primary" onclick="confirmExpertReveal()" ${sr.expertGuess === null ? 'disabled' : ''}>
            ${sr.expertGuess === null ? tr.secretExpertPickNum : tr.secretExpertOpenBtn(sr.expertGuess)}
          </button>
        </div>
      `;
    }
  }

  const headerActions = [
    sr.revealedOrder.length > 0
      ? `<button type="button" class="tool-btn" onclick="undoLastReveal()">${ICON_UNDO_SVG}<span>${tr.btnUndoReveal}</span></button>`
      : '',
    hasUnrevealedCards
      ? `<button type="button" class="tool-btn tool-btn-subtle" onclick="openRepeekPicker()">${ICON_EYE_SM_SVG}<span>${tr.btnForgotNumber}</span></button>`
      : '',
    sr.revealedOrder.length === 0
      ? `<button type="button" class="tool-btn" onclick="beginDigitalDeal()">${ICON_REFRESH_SVG}<span>${tr.btnRedealCards}</span></button>`
      : ''
  ]
    .filter(Boolean)
    .join('');

  return `
    <div class="reveal-panel">
      <div class="reveal-panel-header">
        <div class="reveal-panel-heading">
          <h3 class="reveal-panel-title">${tr.revealPanelTitle}</h3>
          <span class="reveal-panel-hint">${isExpert ? tr.revealExpertHint : tr.revealClassicHint}</span>
        </div>
        ${headerActions ? `<div class="reveal-panel-actions">${headerActions}</div>` : ''}
      </div>
      ${feedbackHtml}
      ${sequenceHtml}
      <div class="secret-grid-wide">${tiles}</div>
      ${expertPickerHtml}
      ${allRevealed ? `<div class="reveal-feedback is-ok">${tr.secretAllRevealed}</div>` : ''}
    </div>
  `;
}

// ---------- Page 3: Result Page ----------

function getResultTier() {
  const results = isAdultEdition()
    ? state.language === 'ru'
      ? TOP_TEN_DATA.results18RU
      : TOP_TEN_DATA.results18EN
    : state.language === 'ru'
      ? TOP_TEN_DATA.resultsRU
      : TOP_TEN_DATA.resultsEN;
  if (state.poops === 0) return results[0];
  if (state.unicorns === 0) return results[3];
  if (state.poops > state.unicorns) return results[2];
  return results[1];
}

function renderResultPageHtml() {
  const tr = t();
  const tier = getResultTier();
  const isPositive = state.unicorns > 0 && state.unicorns >= state.poops;

  return `
    <section class="result-page">
      <div class="result-emblem">
        ${renderEditionHeroEmblemHtml(true)}
        <div class="result-score-line ${isPositive ? 'result-score-good' : 'result-score-bad'}">
          ${tr.resultScoreOf(state.unicorns, state.maxTokens)}
        </div>
      </div>

      <div class="result-card">
        <span class="result-tier-sub">${tier.subtitle}</span>
        <h1 class="result-tier-title">${tier.title}</h1>
        <p class="result-tier-desc">${tier.description}</p>
        <div class="result-tokens-summary">
          <span class="result-stat-good">${tr.resultUnicornsStat(state.unicorns)}</span>
          <span aria-hidden="true">·</span>
          <span class="result-stat-bad">${tr.resultPoopsStat(state.poops)}</span>
          <span aria-hidden="true">·</span>
          <span>${tr.resultRoundsStat(state.round)}</span>
        </div>
      </div>

      <div class="result-actions">
        <button type="button" class="btn btn-primary" onclick="startGame(${state.players})">${tr.btnSamePlayers(state.players)}</button>
        <button type="button" class="btn btn-secondary" onclick="goToStart()">${tr.btnPlayAgain}</button>
      </div>
    </section>
  `;
}

// ---------- Inkblot Lightbox Modal ----------

function updateLightboxTexts() {
  const tr = t();
  const titleEl = document.getElementById('lightbox-title');
  const imgEl = document.getElementById('lightbox-img');
  if (titleEl) titleEl.textContent = tr.inkblotLightboxTitle;
  if (imgEl) imgEl.alt = tr.inkblotAlt;
}

function openInkblotLightbox(event) {
  if (event) event.stopPropagation();
  cancelHold(false);
  feedbackTap();
  state.lightboxOpen = true;
  updateLightboxTexts();
  document.getElementById('image-overlay').classList.add('is-open');
  syncBodyModalLock();
}

function handleInkblotKeyDown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    openInkblotLightbox(event);
  }
}

function closeInkblotLightbox(silent) {
  if (!silent) feedbackTap();
  state.lightboxOpen = false;
  document.getElementById('image-overlay').classList.remove('is-open');
  syncBodyModalLock();
}

// ---------- Player Names Modal ----------

function openNamesModal() {
  cancelHold(false);
  feedbackTap();
  state.namesModalOpen = true;
  renderNamesModal();
  document.getElementById('names-overlay').classList.add('is-open');
  syncBodyModalLock();
}

function closeNamesModal(silent) {
  if (!silent) feedbackTap();
  state.namesModalOpen = false;
  document.getElementById('names-overlay').classList.remove('is-open');
  syncBodyModalLock();
}

function renderNamesModal() {
  const tr = t();
  document.getElementById('names-title').textContent = tr.namesModalTitle;
  const rowsHtml = Array.from({ length: MAX_PLAYERS }, (_, idx) => {
    const val = escapeHtml(state.playerNames[idx] || '');
    return `
      <label class="name-row">
        <span class="name-row-num">${idx + 1}</span>
        <input type="text" class="name-input" id="player-name-input-${idx}" maxlength="24" value="${val}" placeholder="${escapeHtml(tr.namesPlaceholder(idx + 1))}">
      </label>
    `;
  }).join('');

  document.getElementById('names-body').innerHTML = `
    <p class="modal-desc">${tr.namesModalDesc}</p>
    <div class="names-list">${rowsHtml}</div>
  `;

  document.getElementById('names-footer').innerHTML = `
    <div class="names-footer-actions">
      <button type="button" class="btn btn-secondary" onclick="resetPlayerNames()">${tr.namesResetBtn}</button>
      <button type="button" class="btn btn-primary" onclick="savePlayerNames()">${tr.namesSaveBtn}</button>
    </div>
  `;
}

function savePlayerNames() {
  feedbackTap();
  const next = Array.from({ length: MAX_PLAYERS }, (_, idx) => {
    const input = document.getElementById(`player-name-input-${idx}`);
    return input ? input.value.trim().slice(0, 24) : '';
  });
  state.playerNames = next;
  savePlayerNamesToStorage(next);
  closeNamesModal(true);
  render();
}

function resetPlayerNames() {
  feedbackTap();
  state.playerNames = Array.from({ length: MAX_PLAYERS }, () => '');
  savePlayerNamesToStorage(state.playerNames);
  renderNamesModal();
  render();
}

// ---------- Confirmation Modal ----------

function getUnrevealedDigitalCount() {
  if (!state.usedDigitalCards || !state.secretRound) return 0;
  return state.secretRound.cards.filter((c) => c.hasCard && !c.revealed).length;
}

function handleNextRoundClick() {
  feedbackTap();
  if (state.unicorns <= 0) {
    openConfirmModal('zero_unicorns');
  } else if (state.round >= TOTAL_ROUNDS) {
    openConfirmModal('finish_round5');
  } else {
    openConfirmModal('next_round');
  }
}

function openConfirmModal(type) {
  cancelHold(false);
  state.confirmModal = type;
  renderConfirmModal();
  document.getElementById('overlay').classList.add('is-open');
  syncBodyModalLock();
}

function renderConfirmModal() {
  const tr = t();
  const titleEl = document.getElementById('popup-title');
  const descEl = document.getElementById('popup-desc');
  const primaryBtn = document.getElementById('popup-btn-primary');
  const secondaryBtn = document.getElementById('popup-btn-secondary');

  primaryBtn.className = 'btn btn-primary';
  secondaryBtn.classList.remove('hidden');
  descEl.style.whiteSpace = 'pre-line';

  if (state.confirmModal === 'next_round') {
    const nextRound = state.round + 1;
    const nextCapIdx = (state.captainIndex + 1) % state.players;
    titleEl.textContent = tr.popupNextTitle(nextRound);
    descEl.textContent = tr.popupNextDesc(getPlayerName(nextCapIdx), getUnrevealedDigitalCount());
    primaryBtn.textContent = tr.popupNextConfirm;
    secondaryBtn.textContent = tr.popupCancel;
  } else if (state.confirmModal === 'finish_round5') {
    titleEl.textContent = tr.popupFinishTitle;
    descEl.textContent = tr.popupFinishDesc(getUnrevealedDigitalCount());
    primaryBtn.textContent = tr.popupFinishConfirm;
    secondaryBtn.textContent = tr.popupCancel;
  } else if (state.confirmModal === 'zero_unicorns') {
    titleEl.textContent = tr.popupZeroTitle;
    descEl.textContent = tr.popupZeroDesc;
    primaryBtn.textContent = tr.popupZeroConfirm;
    primaryBtn.className = 'btn btn-danger';
    secondaryBtn.textContent = tr.popupZeroUndo;
  } else if (state.confirmModal === 'exit_game') {
    titleEl.textContent = tr.popupExitTitle;
    descEl.textContent = tr.popupExitDesc;
    primaryBtn.textContent = tr.popupExitConfirm;
    primaryBtn.className = 'btn btn-danger';
    secondaryBtn.textContent = tr.popupCancel;
  } else if (state.confirmModal === 'cancel_deal') {
    titleEl.textContent = tr.popupCancelDealTitle;
    descEl.textContent = tr.popupCancelDealDesc;
    primaryBtn.textContent = tr.popupCancelDealConfirm;
    primaryBtn.className = 'btn btn-danger';
    secondaryBtn.textContent = tr.popupCancel;
  } else if (state.confirmModal === 'reinstall_app') {
    titleEl.textContent = tr.popupReinstallTitle;
    descEl.textContent = tr.popupReinstallDesc;
    primaryBtn.textContent = tr.popupReinstallConfirm;
    secondaryBtn.textContent = tr.popupCancel;
  } else if (state.confirmModal === 'ios_install') {
    titleEl.textContent = tr.popupIosTitle;
    descEl.textContent = tr.popupIosDesc;
    primaryBtn.textContent = tr.popupOk;
    secondaryBtn.classList.add('hidden');
  }
}

function closeConfirmModal(silent) {
  if (!silent) feedbackTap();
  state.confirmModal = null;
  document.getElementById('overlay').classList.remove('is-open');
  syncBodyModalLock();
}

function confirmPrimaryAction() {
  playClickSound();
  const type = state.confirmModal;
  closeConfirmModal(true);

  if (type === 'next_round') {
    vibrate('tap');
    state.round += 1;
    state.captainIndex = (state.captainIndex + 1) % state.players;
    state.roundStage = 'pick_topic';
    state.repeekPlayerIdx = null;
    state.usedDigitalCards = false;
    state.lastZeroSource = null;
    drawNextCardSet(false);
    state.secretRound = createSecretRoundData();
    render();
  } else if (type === 'finish_round5' || type === 'zero_unicorns') {
    state.page = 'result';
    vibrate(state.unicorns > 0 ? 'win' : 'fail');
    render();
  } else if (type === 'exit_game') {
    vibrate('tap');
    goToStart();
  } else if (type === 'cancel_deal') {
    vibrate('tap');
    state.roundStage = 'deal_intro';
    render();
  } else if (type === 'reinstall_app') {
    vibrate('unlock');
    const btn = document.getElementById('btn-reinstall-app');
    if (btn) {
      btn.disabled = true;
      btn.textContent = t().reinstallBusy;
    }
    performSafeReinstall();
  }
}

function confirmSecondaryAction() {
  feedbackTap();
  const type = state.confirmModal;
  closeConfirmModal(true);

  if (type === 'zero_unicorns' && state.unicorns === 0 && state.poops > 0) {
    if (state.lastZeroSource === 'reveal' && state.secretRound && state.secretRound.revealedOrder.length > 0) {
      undoLastReveal();
    } else {
      state.unicorns = 1;
      state.poops = state.maxTokens - 1;
      state.lastZeroSource = null;
      vibrate('success');
      render();
    }
  }
}

function handleBackdropClick(event, kind) {
  if (event.target !== event.currentTarget) return;
  if (kind === 'confirm') {
    if (state.confirmModal === 'zero_unicorns') {
      confirmSecondaryAction();
    } else {
      closeConfirmModal();
    }
  } else if (kind === 'rules') {
    closeRulesModal();
  } else if (kind === 'names') {
    closeNamesModal();
  } else if (kind === 'lightbox') {
    closeInkblotLightbox();
  }
}

// ---------- Rules Modal (Continuous staged flow, no tabs, no caption below Reinstall) ----------

function openRulesModal() {
  cancelHold(false);
  feedbackTap();
  state.rulesOpen = true;
  renderRulesModal();
  document.getElementById('rules-overlay').classList.add('is-open');
  syncBodyModalLock();
}

function closeRulesModal(silent) {
  if (!silent) feedbackTap();
  state.rulesOpen = false;
  document.getElementById('rules-overlay').classList.remove('is-open');
  syncBodyModalLock();
}

function renderRulesModal() {
  const tr = t();
  const showAdultRules = state.page !== 'edition' && isAdultEdition();
  document.getElementById('rules-title').textContent = showAdultRules ? tr.rulesTitle18 : tr.rulesTitle;
  document.getElementById('rules-body').innerHTML = getRulesHtml(state.language, showAdultRules);

  const installBtnHtml = canOfferInstall()
    ? `<button type="button" class="tool-btn tool-btn-accent" onclick="triggerPWAInstall()">${pwaState.deferredPrompt ? tr.installBtn : tr.installIosBtn}</button>`
    : '';

  document.getElementById('rules-footer').innerHTML = `
    <div class="rules-footer-row">
      <button type="button" class="tool-btn" onclick="toggleVibration()">${state.vibrationEnabled ? tr.vibrationOn : tr.vibrationOff}</button>
      ${installBtnHtml}
    </div>
    <button type="button" id="btn-reinstall-app" class="reinstall-btn" onclick="requestSafeReinstall()"${!pwaState.isOnline ? ' disabled' : ''}>
      ${ICON_REFRESH_SVG}
      <span>${tr.reinstallBtn}</span>
    </button>
  `;
}

function getRulesHtml(lang, isAdult) {
  if (lang === 'ru') {
    const scalePhrase = isAdult
      ? 'от <strong>1 (голубой критерий)</strong> до <strong>10 (розовый критерий)</strong>'
      : 'от <strong>1 (зелёный критерий)</strong> до <strong>10 (красный критерий)</strong>';
    const adultDisclaimer = isAdult
      ? `<div class="rules-callout">Придумывая темы для карт «Тип-Топ 18+», авторы не задавались целью кого-либо задеть или оскорбить и руководствовались исключительно желанием развеселить игроков. Смотрите на жизнь с юмором!</div>`
      : '';

    return `
      <div class="rules-section">
        <h3>1. Подготовка и цель игры</h3>
        <p>«Тип-Топ${isAdult ? ' 18+' : ''}» — кооперативная игра для 4–9 игроков, рассчитанная на 5 раундов. Все участники играют в одной команде. В начале партии в <strong>зону единорога</strong> кладётся столько жетонов, сколько игроков (от 4 до 8; при 9 игроках — 8 жетонов).</p>
        ${adultDisclaimer}
      </div>

      <div class="rules-section">
        <h3>2. Ход раунда</h3>
        <ol>
          <li><strong>Выбор темы:</strong> Капитан выбирает одну тему и зачитывает её вслух. В теме указана шкала ${scalePhrase}.</li>
          <li><strong>Тайные числа:</strong> каждый игрок получает одну карту с номером от 1 до 10 (лишние карты не участвуют).</li>
          <li><strong>Ответы:</strong> сначала Капитан, а затем остальные игроки в любом порядке дают ответ (словами или действиями), соответствующий их номеру.</li>
          <li><strong>Проверка порядка:</strong> Капитан по очереди называет игроков от наименьшего числа к наибольшему, и они открывают карты (включая карту Капитана).</li>
        </ol>
        <div class="rules-callout">
          <strong>Штраф:</strong> если номер на новой карте <strong>меньше</strong> номера на предыдущей открытой карте — переместите 1 жетон из зоны единорога в зону какашек. Если все жетоны оказались в зоне какашек — команда проиграла!
        </div>
      </div>

      <div class="rules-section">
        <h3>3. Особые правила и игра вдевятером</h3>
        <ul>
          <li><strong>9 игроков:</strong> в зоне единорога 8 жетонов. Капитан не получает карту и не даёт ответ — он только угадывает порядок ответов остальных 8 игроков.</li>
          <li><strong>Сравнение только с предыдущей картой:</strong> пример — открылись <strong>4 → 2</strong> (ошибка, −1 жетон), затем открылась <strong>3</strong> — ошибки нет, так как 3 больше 2!</li>
          <li>Нельзя называть своё число или намекать на него (при номере 3 нельзя сказать «Три поросёнка»).</li>
          <li>Ответ можно повторить, но нельзя изменить.</li>
          <li>В новом раунде Капитаном становится следующий игрок, числа 1–10 замешиваются заново, а жетоны остаются на своих местах.</li>
        </ul>
      </div>

      <div class="rules-section">
        <h3>4. Экспертный вариант (4–8 игроков)</h3>
        <ul>
          <li><strong>Порядок возрастания больше не важен.</strong></li>
          <li>Прежде чем открыть карту игрока, <strong>Капитан должен назвать её точный номер</strong> (один и тот же номер можно называть повторно). За ошибку — −1 жетон в зону какашек.</li>
          <li><strong>Карта Капитана открывается последней:</strong> когда открыты все остальные карты, команда пытается угадать номер Капитана. При попадании возвращается <strong>+1 жетон</strong> из зоны какашек в зону единорога! При промахе жетоны не теряются.</li>
        </ul>
      </div>

      <div class="rules-section">
        <h3>5. Итоговая оценка после 5 раундов</h3>
        <div class="rules-tiers">
          <div class="rules-tier-row">
            <strong>Одни единороги (0 ошибок)</strong>
            <span>${isAdult ? 'Браво! Вы закончили игру с идеальным счётом! Попробуйте сыграть в экспертный вариант!' : 'Чемпионы! Вы закончили игру с идеальным счётом! Попробуйте экспертный вариант!'}</span>
          </div>
          <div class="rules-tier-row">
            <strong>Единорогов больше или столько же, сколько какашек</strong>
            <span>Вы настоящие профессионалы!</span>
          </div>
          <div class="rules-tier-row">
            <strong>Какашек больше, чем единорогов</strong>
            <span>${isAdult ? 'Неплохо, но тренировка не помешает — в следующий раз у вас точно всё получится!' : 'Неплохо, но вам стоит попробовать ещё: в следующий раз у вас точно получится.'}</span>
          </div>
          <div class="rules-tier-row">
            <strong>Одни какашки (0 единорогов)</strong>
            <span>Это полный провал. Вы ведь только разогревались?</span>
          </div>
        </div>
      </div>
    `;
  }

  // English continuous rules
  const scalePhraseEn = isAdult
    ? 'from <strong>1 (blue)</strong> to <strong>10 (pink)</strong>'
    : 'from <strong>1 (green)</strong> to <strong>10 (red)</strong>';
  const adultDisclaimerEn = isAdult
    ? `<div class="rules-callout">Top Ten 18+ prompts are written purely for adult party humor — never take them too seriously!</div>`
    : '';

  return `
    <div class="rules-section">
      <h3>1. Setup & Goal</h3>
      <p>Top Ten${isAdult ? ' 18+' : ''} is a cooperative game for 4–9 players played over 5 rounds. Everyone plays on the same team. Start with one token in the <strong>Unicorn Zone</strong> per player (4 to 8 tokens; with 9 players, use 8 tokens).</p>
      ${adultDisclaimerEn}
    </div>

    <div class="rules-section">
      <h3>2. Round Flow</h3>
      <ol>
        <li><strong>Pick a Topic:</strong> the Captain chooses one topic and reads it aloud. Every topic has an intensity scale ${scalePhraseEn}.</li>
        <li><strong>Secret Numbers:</strong> each player secretly gets a number card from 1 to 10 (unused cards stay face down).</li>
        <li><strong>Answers:</strong> the Captain answers first, then everyone else answers in any order to match their secret number.</li>
        <li><strong>Reveal Order:</strong> the Captain calls players one by one from lowest to highest, flipping each card (including their own).</li>
      </ol>
      <div class="rules-callout">
        <strong>Penalty:</strong> whenever a newly revealed card is <strong>lower</strong> than the previous card, move 1 token from the Unicorn Zone to the Poop Zone. If all tokens reach the Poop Zone, the team loses immediately!
      </div>
    </div>

    <div class="rules-section">
      <h3>3. Special Rules & 9 Players</h3>
      <ul>
        <li><strong>9 Players:</strong> use 8 tokens in the Unicorn Zone. The Captain gets no card and gives no answer — they only order the other 8 players.</li>
        <li><strong>Only compare to the previous card:</strong> e.g. <strong>4 → 2</strong> is a mistake (−1 token), then <strong>2 → 3</strong> is fine because 3 is higher than 2!</li>
        <li>Never say or hint at your number (with 3, you cannot answer “Three Little Pigs”).</li>
        <li>You may repeat your answer, but never change it.</li>
        <li>Each round, the Captain role passes clockwise, all 10 number cards are reshuffled, and tokens remain where they are.</li>
      </ul>
    </div>

    <div class="rules-section">
      <h3>4. Expert Variant (4–8 Players)</h3>
      <ul>
        <li><strong>Ascending order no longer matters.</strong></li>
        <li>Before revealing a player’s card, the <strong>Captain must call its exact number</strong> (repeating numbers is allowed). Each miss moves 1 token to the Poop Zone.</li>
        <li><strong>Captain’s Card Goes Last:</strong> once all other cards are revealed, the team guesses the Captain’s number. A hit restores <strong>+1 token</strong> from the Poop Zone to the Unicorn Zone! A miss costs nothing.</li>
      </ul>
    </div>

    <div class="rules-section">
      <h3>5. End-of-Game Evaluation (After 5 Rounds)</h3>
      <div class="rules-tiers">
        <div class="rules-tier-row">
          <strong>All Unicorns (0 mistakes)</strong>
          <span>${isAdult ? 'Bravo! You finished the game with a perfect score! Try the expert variant!' : 'Champions! You completed the game with a perfect score! Try the expert variant!'}</span>
        </div>
        <div class="rules-tier-row">
          <strong>More or Equal Unicorns</strong>
          <span>You are true professionals!</span>
        </div>
        <div class="rules-tier-row">
          <strong>More Poops than Unicorns</strong>
          <span>${isAdult ? 'Not bad, a little more practice won’t hurt — you’ll get it next time!' : 'Not bad, but you should try again: next time you will definitely succeed.'}</span>
        </div>
        <div class="rules-tier-row">
          <strong>All Poops (0 Unicorns)</strong>
          <span>This is a complete failure. Were you just warming up?</span>
        </div>
      </div>
    </div>
  `;
}

// ---------- Global Listeners & Init ----------

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  pwaState.deferredPrompt = event;
  render();
  if (state.rulesOpen) renderRulesModal();
});

window.addEventListener('appinstalled', () => {
  pwaState.isInstalled = true;
  pwaState.deferredPrompt = null;
  render();
  if (state.rulesOpen) renderRulesModal();
});

window.addEventListener('online', () => {
  pwaState.isOnline = true;
  render();
  if (state.rulesOpen) renderRulesModal();
});

window.addEventListener('offline', () => {
  pwaState.isOnline = false;
  render();
  if (state.rulesOpen) renderRulesModal();
});

// Reload protection & mobile lifecycle persistence (skipped during intentional reinstall)
window.addEventListener('beforeunload', (event) => {
  saveGameSession();
  if (state.page === 'game' && !pwaState.isReinstalling) {
    event.preventDefault();
    event.returnValue = '';
  }
});

window.addEventListener('pagehide', () => {
  saveGameSession();
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (state.confirmModal) {
    if (state.confirmModal === 'zero_unicorns') {
      confirmSecondaryAction();
    } else {
      closeConfirmModal();
    }
  } else if (state.lightboxOpen) {
    closeInkblotLightbox();
  } else if (state.namesModalOpen) {
    closeNamesModal();
  } else if (state.rulesOpen) {
    closeRulesModal();
  }
});

window.addEventListener('load', () => {
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.has('_reinstall')) {
      url.searchParams.delete('_reinstall');
      window.history.replaceState({}, '', url.toString());
    }
  } catch (_) {}

  // Strictly relative scope so sibling GitHub Pages apps are never affected
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js', { scope: './' }).catch(() => {});
  }

  initWakeLockAndPrivacy();
  restoreGameSession();

  document.documentElement.lang = state.language;
  render();

  const preloader = document.getElementById('preloader');
  if (preloader) {
    setTimeout(() => {
      preloader.classList.add('is-hidden');
      setTimeout(() => preloader.classList.add('hidden'), 260);
    }, 250);
  }
});
