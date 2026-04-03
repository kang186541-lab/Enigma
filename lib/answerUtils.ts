export type AnswerResult = {
  correct: boolean;
  isVariant: boolean;
  accentDiff: boolean;
};

export function getSpellingVariants(word: string): string[] {
  const variants: string[] = [word];

  // -re / -er (theatre/theater, centre/center)
  if (word.endsWith("re") && word.length > 3) variants.push(word.slice(0, -2) + "er");
  if (word.endsWith("er") && word.length > 3) variants.push(word.slice(0, -2) + "re");

  // -our / -or (colour/color, honour/honor, favour/favor, humour/humor, neighbour/neighbor)
  if (word.endsWith("our")) variants.push(word.replace(/our$/, "or"));
  if (word.endsWith("or") && !["oor","for","nor","tor","bor","mor","cor","gor","por","sor","vor","wor","xor","yor","zor"].some(e => word.endsWith(e))) {
    variants.push(word.replace(/or$/, "our"));
  }

  // -ise / -ize (organise/organize, realise/realize, recognise/recognize, apologise/apologize)
  if (word.endsWith("ise")) variants.push(word.replace(/ise$/, "ize"));
  if (word.endsWith("ize")) variants.push(word.replace(/ize$/, "ise"));

  // -yse / -yze (analyse/analyze)
  if (word.endsWith("yse")) variants.push(word.replace(/yse$/, "yze"));
  if (word.endsWith("yze")) variants.push(word.replace(/yze$/, "yse"));

  // -ence / -ense (defence/defense, offence/offense, licence/license)
  if (word.endsWith("ence")) variants.push(word.replace(/ence$/, "ense"));
  if (word.endsWith("ense")) variants.push(word.replace(/ense$/, "ence"));

  // -ogue / -og (catalogue/catalog, dialogue/dialog)
  if (word.endsWith("ogue")) variants.push(word.replace(/ogue$/, "og"));
  if (word.endsWith("og") && !word.endsWith("oog")) variants.push(word + "ue");

  // -lled / -led (travelled/traveled, cancelled/canceled)
  if (word.endsWith("lled")) variants.push(word.replace(/lled$/, "led"));
  if (word.endsWith("led") && !word.endsWith("lled")) variants.push(word.replace(/led$/, "lled"));

  // gray / grey
  if (word.includes("gray")) variants.push(word.replace(/gray/g, "grey"));
  if (word.includes("grey")) variants.push(word.replace(/grey/g, "gray"));

  // word-specific irregular pairs
  const irregularPairs: Record<string, string> = {
    airplane: "aeroplane",
    aeroplane: "airplane",
    jewelry: "jewellery",
    jewellery: "jewelry",
    pajamas: "pyjamas",
    pyjamas: "pajamas",
    mom: "mum",
    mum: "mom",
    program: "programme",
    programme: "program",
    check: "cheque",
    cheque: "check",
    catalog: "catalogue",
    catalogue: "catalog",
    dialog: "dialogue",
    dialogue: "dialog",
    theater: "theatre",
    theatre: "theater",
    center: "centre",
    centre: "center",
    color: "colour",
    colour: "color",
    favor: "favour",
    favour: "favor",
    neighbor: "neighbour",
    neighbour: "neighbor",
    honor: "honour",
    honour: "honor",
    humor: "humour",
    humour: "humor",
    organize: "organise",
    organise: "organize",
    realize: "realise",
    realise: "realize",
    recognize: "recognise",
    recognise: "recognize",
    apologize: "apologise",
    apologise: "apologize",
    analyze: "analyse",
    analyse: "analyze",
    traveled: "travelled",
    travelled: "traveled",
    canceled: "cancelled",
    cancelled: "canceled",
    defense: "defence",
    defence: "defense",
    offense: "offence",
    offence: "offense",
    license: "licence",
    licence: "license",
  };

  if (irregularPairs[word]) variants.push(irregularPairs[word]);

  return [...new Set(variants)];
}

function removeAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function removeKoreanSpaces(s: string): string {
  return s.replace(/\s+/g, "");
}

export function checkAnswer(
  userInput: string,
  correctAnswer: string,
  options?: {
    acceptableAnswers?: string[];
    learningLang?: string;
  }
): AnswerResult {
  const { acceptableAnswers = [], learningLang = "english" } = options ?? {};

  const norm = (s: string) => s.trim().toLowerCase().replace(/[.,!?;:'"]/g, "");
  const userNorm = norm(userInput);
  const correctNorm = norm(correctAnswer);

  if (userNorm === correctNorm) {
    return { correct: true, isVariant: false, accentDiff: false };
  }

  if (acceptableAnswers.some((a) => norm(a) === userNorm)) {
    return { correct: true, isVariant: true, accentDiff: false };
  }

  if (learningLang === "english") {
    const variants = getSpellingVariants(correctNorm);
    if (variants.includes(userNorm)) {
      return { correct: true, isVariant: true, accentDiff: false };
    }
  }

  if (learningLang === "spanish") {
    const userNoAccent = removeAccents(userNorm);
    const correctNoAccent = removeAccents(correctNorm);
    if (userNoAccent === correctNoAccent) {
      return { correct: true, isVariant: false, accentDiff: true };
    }
  }

  if (learningLang === "korean") {
    if (removeKoreanSpaces(userNorm) === removeKoreanSpaces(correctNorm)) {
      return { correct: true, isVariant: false, accentDiff: false };
    }
  }

  return { correct: false, isVariant: false, accentDiff: false };
}
