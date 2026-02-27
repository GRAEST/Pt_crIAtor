const ONES = [
  "",
  "um",
  "dois",
  "tres",
  "quatro",
  "cinco",
  "seis",
  "sete",
  "oito",
  "nove",
  "dez",
  "onze",
  "doze",
  "treze",
  "quatorze",
  "quinze",
  "dezesseis",
  "dezessete",
  "dezoito",
  "dezenove",
];

const TENS = [
  "",
  "",
  "vinte",
  "trinta",
  "quarenta",
  "cinquenta",
  "sessenta",
  "setenta",
  "oitenta",
  "noventa",
];

const HUNDREDS = [
  "",
  "cento",
  "duzentos",
  "trezentos",
  "quatrocentos",
  "quinhentos",
  "seiscentos",
  "setecentos",
  "oitocentos",
  "novecentos",
];

/**
 * Converts a number in the range [0, 999] to its written form in Portuguese.
 * Returns an empty string for 0.
 */
function groupToWords(n: number): string {
  if (n === 0) return "";
  if (n === 100) return "cem";

  const parts: string[] = [];

  const h = Math.floor(n / 100);
  const remainder = n % 100;

  if (h > 0) {
    parts.push(HUNDREDS[h]);
  }

  if (remainder > 0) {
    if (remainder < 20) {
      parts.push(ONES[remainder]);
    } else {
      const t = Math.floor(remainder / 10);
      const o = remainder % 10;
      if (o === 0) {
        parts.push(TENS[t]);
      } else {
        parts.push(`${TENS[t]} e ${ONES[o]}`);
      }
    }
  }

  return parts.join(" e ");
}

/**
 * Splits an integer into groups of three digits from right to left.
 * Index 0 = units, 1 = thousands, 2 = millions, 3 = billions, etc.
 */
function splitIntoGroups(n: number): number[] {
  if (n === 0) return [0];
  const groups: number[] = [];
  while (n > 0) {
    groups.push(n % 1000);
    n = Math.floor(n / 1000);
  }
  return groups;
}

// Scale labels: [singular, plural]
const SCALES: [string, string][] = [
  ["", ""],
  ["mil", "mil"],
  ["milhao", "milhoes"],
  ["bilhao", "bilhoes"],
];

// Replace plain ASCII with accented forms
function applyAccents(text: string): string {
  return text
    .replace(/\bmilhao\b/g, "milh\u00e3o")
    .replace(/\bmilhoes\b/g, "milh\u00f5es")
    .replace(/\bbilhao\b/g, "bilh\u00e3o")
    .replace(/\bbilhoes\b/g, "bilh\u00f5es")
    .replace(/\btrес\b/g, "tr\u00eas")
    .replace(/\btres\b/g, "tr\u00eas");
}

/**
 * Converts the integer part to words.
 * Returns empty string for 0.
 */
function integerToWords(n: number): string {
  if (n === 0) return "";

  const groups = splitIntoGroups(n);
  const parts: string[] = [];

  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i];
    if (g === 0) continue;

    const words = groupToWords(g);
    const [singular, plural] = SCALES[i];

    if (i === 1) {
      // Thousands: "mil" (never "um mil")
      if (g === 1) {
        parts.push("mil");
      } else {
        parts.push(`${words} mil`);
      }
    } else if (i >= 2) {
      // Millions, billions, etc.
      if (g === 1) {
        parts.push(`${words} ${singular}`);
      } else {
        parts.push(`${words} ${plural}`);
      }
    } else {
      // Units group (i === 0)
      parts.push(words);
    }
  }

  // Join groups with appropriate separators.
  // Rules for Brazilian Portuguese:
  // - Use "e" (and) when the last non-zero group is in [1..99]
  //   or when there are exactly two parts and the second is <= 99.
  // - Use ", " (comma) between higher groups.
  // Then, if only last group is small, use "e" before it.

  if (parts.length === 1) {
    return parts[0];
  }

  // Determine the separator before the last part.
  // The last non-zero group value helps decide:
  // If the units group (groups[0]) is non-zero and <= 100, use "e" before it.
  // Otherwise use ", ".

  // Strategy: join all but last with ", ", then decide connector to last.
  const lastGroupIndex = findLastNonZeroGroupIndex(groups);
  const lastGroupValue = groups[0]; // the units position

  // Check if we should use "e" before the last part.
  // "e" is used when the last part is a "small" addition:
  // - the units group is in [1..99], or
  // - the units group is a round hundred (100, 200, ..., 900)
  // Actually in Brazilian Portuguese the connector logic is:
  // - Between the last two non-zero groups, use "e" if the lower group is < 100
  //   or is a round hundred.
  // - Between other groups, use ", ".

  // Simpler approach: if there are only 2 parts, use " e ".
  // If there are more, join all but last with ", " and last with " e " if
  // the lowest group (units) is in [1..999] and is the "simple" addition.

  // Let's use a well-known approach:
  // 1) If there are exactly 2 parts, join with " e ".
  // 2) If there are more, join all but last with ", ".
  //    The last gets " e " if groups[0] is in [1..99] or is a round hundred.
  //    Otherwise ", ".

  if (parts.length === 2) {
    return parts.join(" e ");
  }

  const allButLast = parts.slice(0, -1).join(", ");
  const last = parts[parts.length - 1];

  // Determine if the last group value warrants "e"
  const unitsVal = groups[0];
  const useE =
    unitsVal > 0 && (unitsVal < 100 || unitsVal % 100 === 0);

  return `${allButLast}${useE ? " e " : ", "}${last}`;
}

function findLastNonZeroGroupIndex(groups: number[]): number {
  for (let i = 0; i < groups.length; i++) {
    if (groups[i] !== 0) return i;
  }
  return 0;
}

/**
 * Converts a number representing Brazilian Reais (BRL) to its written form
 * in Portuguese (por extenso).
 *
 * Handles values from 0 up to billions, including centavos (cents).
 *
 * @param value - The monetary value in BRL
 * @returns The value written out in Portuguese
 *
 * @example
 * numberToWordsBRL(1) // "um real"
 * numberToWordsBRL(1500) // "mil e quinhentos reais"
 * numberToWordsBRL(1.50) // "um real e cinquenta centavos"
 */
export function numberToWordsBRL(value: number): string {
  if (value < 0) {
    return `menos ${numberToWordsBRL(-value)}`;
  }

  // Split into integer and cents, rounding to avoid floating point issues.
  const rounded = Math.round(value * 100);
  const integerPart = Math.floor(rounded / 100);
  const centsPart = rounded % 100;

  const intWords = integerToWords(integerPart);
  const centsWords = integerToWords(centsPart);

  let result: string;

  if (integerPart === 0 && centsPart === 0) {
    result = "zero reais";
  } else if (integerPart === 0) {
    // Only cents
    const centLabel = centsPart === 1 ? "centavo" : "centavos";
    result = `${centsWords} ${centLabel}`;
  } else if (centsPart === 0) {
    // Only integer
    const realLabel = integerPart === 1 ? "real" : "reais";

    // "de reais" is used after milhao/milhoes/bilhao/bilhoes when there are
    // no thousands or units groups.
    const needsDe = needsDeConnector(integerPart);
    result = `${intWords} ${needsDe ? "de " : ""}${realLabel}`;
  } else {
    // Both integer and cents
    const realLabel = integerPart === 1 ? "real" : "reais";
    const centLabel = centsPart === 1 ? "centavo" : "centavos";

    const needsDe = needsDeConnector(integerPart);
    result = `${intWords} ${needsDe ? "de " : ""}${realLabel} e ${centsWords} ${centLabel}`;
  }

  return applyAccents(result);
}

/**
 * Determines if "de" should be placed before "reais".
 * In Portuguese, "de" is used when the value is an exact multiple of
 * million/billion with no thousands or units.
 * E.g., "um milhao de reais" but "um milhao e quinhentos mil reais".
 */
function needsDeConnector(n: number): boolean {
  if (n < 1_000_000) return false;
  // "de" is used when the number is an exact multiple of 1,000,000
  // (i.e., no thousands or units groups).
  return n % 1_000_000 === 0;
}
