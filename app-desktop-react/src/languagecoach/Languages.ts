export enum ISO_639_1 {
  English = "en",
  Chinese = "zh",
  Korean = "ko",
  Japanese = "ja",
  Spanish = "es",
  French = "fr",
  Ukrainian = "uk",
  Hindi = "hi",
  Bengali = "bn",
  Portuguese = "pt",
  German = "de",
  Russian = "ru"
}

export enum ISO_639_3 {
  English = "eng",
  Chinese = "zho",
  Mandarin = "cmn",
  Cantonese = "yue",
  MinDong = "cdo",
  Korean = "kor",
  Japanese = "jpn",
  Spanish = "spa",
  French = "fra",
  Ukrainian = "ukr",
  Hindi = "hin",
  Bengali = "ben",
  Portuguese = "por",
  German = "deu",
  Russian = "rus"
}

export class Language {
  /**
   * Identifier for the Language.
   */
  key: string;

  /**
   * The ISO 639-3 codes of the languages that are related to this language.
   */
  includes: ISO_639_3[];

  /**
   * The ISO 639-1 code of the language.
   */
  iso1Code: ISO_639_1;

  /**
   * A map of ISO 639-3 codes to the names of the language in that language.
   */
  iso3Names: Map<ISO_639_3, string>;

  /**
   * @param related The ISO 639-3 codes of the languages that are related to this language.
   */
  constructor(
    key: string,
    iso1Code: ISO_639_1,
    related: ISO_639_3[],
    iso3Names: Map<ISO_639_3, string> = new Map(),
  ) {
    this.key = key;
    this.iso1Code = iso1Code;
    this.includes = related;
    this.iso3Names = iso3Names;
  }

  getISO3Name(isoCode: ISO_639_3): string | undefined {
    return this.iso3Names.get(isoCode);
  }

  setISO3Name(isoCode: ISO_639_3, name: string) {
    this.iso3Names.set(isoCode, name);
  }

  getIncludes(): ISO_639_3[] {
    return this.includes;
  }
}

export const english = new Language(
  'english',
  ISO_639_1.English,
  [ISO_639_3.English]
);
english.setISO3Name(ISO_639_3.English, 'English')
english.setISO3Name(ISO_639_3.Chinese, '英语');
english.setISO3Name(ISO_639_3.Mandarin, '英语');
english.setISO3Name(ISO_639_3.Cantonese, '英文');
english.setISO3Name(ISO_639_3.Korean, '영어');
english.setISO3Name(ISO_639_3.Japanese, '英語');
english.setISO3Name(ISO_639_3.French, 'Anglais');
english.setISO3Name(ISO_639_3.Spanish, 'Inglés');
english.setISO3Name(ISO_639_3.Ukrainian, 'Англійська');

export const chinese = new Language(
  'chinese',
  ISO_639_1.Chinese,
  [
    ISO_639_3.Chinese,
    ISO_639_3.Mandarin,
    ISO_639_3.Cantonese,
  ]
);
chinese.setISO3Name(ISO_639_3.English, "Chinese");
chinese.setISO3Name(ISO_639_3.Chinese, '汉语');
chinese.setISO3Name(ISO_639_3.Mandarin, '汉语');
chinese.setISO3Name(ISO_639_3.Cantonese, '中文');
chinese.setISO3Name(ISO_639_3.Korean, '중국어');
chinese.setISO3Name(ISO_639_3.Japanese, '中国語');
chinese.setISO3Name(ISO_639_3.French, 'Chinois');
chinese.setISO3Name(ISO_639_3.Spanish, 'Chino');
chinese.setISO3Name(ISO_639_3.Ukrainian, 'Китайська');

export const korean = new Language(
  'korean',
  ISO_639_1.Korean,
  [ISO_639_3.Korean]
);
korean.setISO3Name(ISO_639_3.English, 'Korean');
korean.setISO3Name(ISO_639_3.Chinese, '韩语');
korean.setISO3Name(ISO_639_3.Mandarin, '韩语');
korean.setISO3Name(ISO_639_3.Cantonese, '韩语');
korean.setISO3Name(ISO_639_3.Korean, '한국어');
korean.setISO3Name(ISO_639_3.Japanese, '韓国語');
korean.setISO3Name(ISO_639_3.French, 'Coréen');
korean.setISO3Name(ISO_639_3.Spanish, 'Coreano');
korean.setISO3Name(ISO_639_3.Ukrainian, 'Корейська');

export const japanese = new Language(
  'japanese',
  ISO_639_1.Japanese,
  [ISO_639_3.Japanese]
);
japanese.setISO3Name(ISO_639_3.English, 'Japanese');
japanese.setISO3Name(ISO_639_3.Chinese, '日语');
japanese.setISO3Name(ISO_639_3.Mandarin, '日语');
japanese.setISO3Name(ISO_639_3.Cantonese, '日语');
japanese.setISO3Name(ISO_639_3.Korean, '일본어');
japanese.setISO3Name(ISO_639_3.Japanese, '日本語');
japanese.setISO3Name(ISO_639_3.French, 'Japonais');
japanese.setISO3Name(ISO_639_3.Spanish, 'Japonés');
japanese.setISO3Name(ISO_639_3.Ukrainian, 'Японська');

export const french = new Language(
  'french',
  ISO_639_1.French,
  [ISO_639_3.French]
);
french.setISO3Name(ISO_639_3.English, 'French');
french.setISO3Name(ISO_639_3.Chinese, '法语');
french.setISO3Name(ISO_639_3.Mandarin, '法语');
french.setISO3Name(ISO_639_3.Cantonese, '法语');
french.setISO3Name(ISO_639_3.Korean, '프랑스어');
french.setISO3Name(ISO_639_3.Japanese, 'フランス語');
french.setISO3Name(ISO_639_3.French, 'Français');
french.setISO3Name(ISO_639_3.Spanish, 'Francés');
french.setISO3Name(ISO_639_3.Ukrainian, 'Французька');

export const spanish = new Language(
  'spanish',
  ISO_639_1.Spanish,
  [ISO_639_3.Spanish]
);
spanish.setISO3Name(ISO_639_3.English, 'Spanish');
spanish.setISO3Name(ISO_639_3.Chinese, '西班牙语');
spanish.setISO3Name(ISO_639_3.Mandarin, '西班牙语');
spanish.setISO3Name(ISO_639_3.Cantonese, '西班牙语');
spanish.setISO3Name(ISO_639_3.Korean, '스페인어');
spanish.setISO3Name(ISO_639_3.Japanese, 'スペイン語');
spanish.setISO3Name(ISO_639_3.French, 'Espagnol');
spanish.setISO3Name(ISO_639_3.Spanish, 'Español');
spanish.setISO3Name(ISO_639_3.Ukrainian, 'Іспанська');

export const ukrainian = new Language(
  'ukrainian',
  ISO_639_1.Ukrainian,
  [ISO_639_3.Ukrainian]
);
ukrainian.setISO3Name(ISO_639_3.English, 'Ukrainian');
ukrainian.setISO3Name(ISO_639_3.Chinese, '乌克兰语');
ukrainian.setISO3Name(ISO_639_3.Mandarin, '乌克兰语');
ukrainian.setISO3Name(ISO_639_3.Cantonese, '乌克兰语');
ukrainian.setISO3Name(ISO_639_3.Korean, '우크라이나어');
ukrainian.setISO3Name(ISO_639_3.Japanese, 'ウクライナ語');
ukrainian.setISO3Name(ISO_639_3.French, 'Ukrainien');
ukrainian.setISO3Name(ISO_639_3.Spanish, 'Ucraniano');
ukrainian.setISO3Name(ISO_639_3.Ukrainian, 'Українська');

export const availableLanguages: Language[]= [
  english,
  chinese,
  korean,
  japanese,
  french,
  spanish,
  ukrainian,
];

export function getLanguageByKey(key: string): Language | undefined {
  return availableLanguages.find(language => language.key === key);
}

export function getLanguageDisplayName(source: Language, target?: Language): string {
  const name = source.includes
    .map(iso3 => target?.getISO3Name(iso3))
    .find(name => name !== undefined)
  return name || `Error: ${source.key} to ${target?.key}.`;
};

export function getLanguageByCode(code: string): Language {
  const languageCode = code.split('-')[0];
  const iso1Language = availableLanguages.find(language =>
    language.iso1Code === languageCode
  );
  if (iso1Language) {
    return iso1Language;
  }
  const iso3Language = availableLanguages.find(language =>
    language.includes.includes(languageCode as ISO_639_3)
  );
  return iso3Language || english;
}
