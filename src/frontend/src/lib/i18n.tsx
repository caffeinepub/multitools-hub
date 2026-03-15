import { createContext, useContext, useState } from "react";

type Lang = "en" | "fr";

const translations = {
  en: {
    // Nav
    home: "Home",
    cat_subtitle: "Subtitle",
    cat_text: "Text",
    cat_encoding: "Encoding",
    cat_developer: "Developer",
    cat_design: "Design",
    lang_toggle: "FR",
    app_title: "MultiTools Hub",
    app_description:
      "A collection of free, client-side utilities. No uploads, no tracking, all processing happens in your browser.",
    tools_label: "Tools",
    // Tool labels
    tool_subtitle_label: "Subtitle Converter & Editor",
    tool_subtitle_desc:
      "Convert between SRT, VTT, ASS, SUB, SBV, LRC, DFXP, STL and edit entries inline.",
    tool_textcase_label: "Text Case Converter",
    tool_textcase_desc:
      "Transform text to UPPER, lower, Title, camelCase, snake_case and more.",
    tool_counter_label: "Word & Character Counter",
    tool_counter_desc:
      "Count characters, words, sentences, paragraphs, reading and speaking time.",
    tool_json_label: "JSON Formatter & Validator",
    tool_json_desc:
      "Format, minify, and validate JSON with error highlighting.",
    tool_base64_label: "Base64 Encoder/Decoder",
    tool_base64_desc: "Encode and decode text or files to/from Base64.",
    tool_url_label: "URL Encoder/Decoder",
    tool_url_desc: "Encode or decode URL-encoded strings and components.",
    tool_hash_label: "Hash Generator",
    tool_hash_desc: "Generate MD5, SHA-1, SHA-256, SHA-512 hashes instantly.",
    tool_timestamp_label: "Timestamp Converter",
    tool_timestamp_desc:
      "Convert Unix timestamps to/from human-readable dates across timezones.",
    tool_color_label: "Color Converter",
    tool_color_desc: "Convert colors between HEX, RGB, HSL, and CMYK formats.",
    // SubtitleConverter
    sub_drop: "Drop subtitle file here or click to browse",
    sub_formats: "SRT, VTT, ASS, SSA, SUB, SBV, LRC, DFXP, TTML, STL",
    sub_input: "Input:",
    sub_output: "Output:",
    sub_parse: "Parse / Convert",
    sub_download: "Download",
    sub_raw: "Raw Input",
    sub_editor: "Editor",
    sub_preview: "Preview Output",
    sub_shift: "Shift all timings:",
    sub_apply: "Apply",
    sub_add_row: "Add Row",
    sub_empty: "No entries. Upload a file or paste text.",
    sub_paste: "Paste subtitle text here...",
    sub_parse_text: "Parse Text",
    sub_copy: "Copy to Clipboard",
    sub_entries: "entries loaded",
    // TextCaseConverter
    tc_placeholder: "Enter your text here...",
    tc_uppercase: "UPPERCASE",
    tc_lowercase: "lowercase",
    tc_title: "Title Case",
    tc_sentence: "Sentence case",
    tc_camel: "camelCase",
    tc_pascal: "PascalCase",
    tc_snake: "snake_case",
    tc_kebab: "kebab-case",
    tc_dot: "dot.case",
    // WordCounter
    wc_placeholder: "Start typing or paste text to count...",
    wc_chars: "Characters",
    wc_chars_nospace: "Chars (no spaces)",
    wc_words: "Words",
    wc_sentences: "Sentences",
    wc_paragraphs: "Paragraphs",
    wc_reading: "Reading time",
    wc_speaking: "Speaking time",
    // JsonFormatter
    json_format: "Format",
    json_minify: "Minify",
    json_validate: "Validate",
    json_valid: "Valid",
    json_error: "Error",
    json_input: "Input",
    json_output: "Output",
    json_2spaces: "2 spaces",
    json_4spaces: "4 spaces",
    json_tab: "Tab",
    // Base64Tool
    b64_plain: "Plain Text",
    b64_encode: "Encode",
    b64_encode_file: "Encode File",
    b64_base64: "Base64",
    b64_decode: "Decode",
    b64_paste: "Or paste Base64 here to decode...",
    b64_placeholder: "Enter text to encode...",
    // UrlEncoderTool
    url_placeholder: "Enter URL or text...",
    url_encode_full: "Encode (Full)",
    url_encode_uri: "Encode (URI)",
    url_decode: "Decode",
    // HashGenerator
    hash_placeholder: "Enter text to hash...",
    hash_generate: "Generate Hashes",
    hash_generating: "Generating...",
    // TimestampConverter
    ts_unix: "Unix Timestamp",
    ts_datetime: "Date / Time",
    ts_now: "Now",
    ts_convert: "Convert",
    ts_from_date: "From Date",
    // ColorConverter
    color_hex: "HEX",
    color_rgb: "RGB",
    color_hsl: "HSL",
    color_cmyk: "CMYK",
    color_r: "R",
    color_g: "G",
    color_b: "B",
    // Common
    copy: "Copy",
    copied: "Copied!",
  },
  fr: {
    // Nav
    home: "Accueil",
    cat_subtitle: "Sous-titres",
    cat_text: "Texte",
    cat_encoding: "Encodage",
    cat_developer: "Développeur",
    cat_design: "Design",
    lang_toggle: "EN",
    app_title: "MultiTools Hub",
    app_description:
      "Une collection d'utilitaires gratuits côté client. Pas de téléchargement, pas de suivi, tout le traitement se fait dans votre navigateur.",
    tools_label: "Outils",
    // Tool labels
    tool_subtitle_label: "Convertisseur & Éditeur de Sous-titres",
    tool_subtitle_desc:
      "Convertissez entre SRT, VTT, ASS, SUB, SBV, LRC, DFXP, STL et modifiez les entrées en ligne.",
    tool_textcase_label: "Convertisseur de Casse de Texte",
    tool_textcase_desc:
      "Transformez le texte en MAJUSCULES, minuscules, Titre, camelCase, snake_case et plus encore.",
    tool_counter_label: "Compteur de Mots & Caractères",
    tool_counter_desc:
      "Comptez les caractères, mots, phrases, paragraphes, temps de lecture et de parole.",
    tool_json_label: "Formateur & Validateur JSON",
    tool_json_desc:
      "Formatez, minifiez et validez le JSON avec mise en évidence des erreurs.",
    tool_base64_label: "Encodeur/Décodeur Base64",
    tool_base64_desc: "Encodez et décodez du texte ou des fichiers en Base64.",
    tool_url_label: "Encodeur/Décodeur URL",
    tool_url_desc:
      "Encodez ou décodez des chaînes et composants encodés en URL.",
    tool_hash_label: "Générateur de Hash",
    tool_hash_desc:
      "Générez des hachages MD5, SHA-1, SHA-256, SHA-512 instantanément.",
    tool_timestamp_label: "Convertisseur de Timestamp",
    tool_timestamp_desc:
      "Convertissez les timestamps Unix vers/depuis des dates lisibles dans différents fuseaux horaires.",
    tool_color_label: "Convertisseur de Couleur",
    tool_color_desc:
      "Convertissez des couleurs entre les formats HEX, RGB, HSL et CMYK.",
    // SubtitleConverter
    sub_drop: "Déposez le fichier de sous-titres ici ou cliquez pour parcourir",
    sub_formats: "SRT, VTT, ASS, SSA, SUB, SBV, LRC, DFXP, TTML, STL",
    sub_input: "Entrée :",
    sub_output: "Sortie :",
    sub_parse: "Analyser / Convertir",
    sub_download: "Télécharger",
    sub_raw: "Texte brut",
    sub_editor: "Éditeur",
    sub_preview: "Aperçu de la sortie",
    sub_shift: "Décaler tous les timings :",
    sub_apply: "Appliquer",
    sub_add_row: "Ajouter une ligne",
    sub_empty: "Aucune entrée. Téléversez un fichier ou collez du texte.",
    sub_paste: "Collez le texte des sous-titres ici...",
    sub_parse_text: "Analyser le texte",
    sub_copy: "Copier dans le presse-papiers",
    sub_entries: "entrées chargées",
    // TextCaseConverter
    tc_placeholder: "Saisissez votre texte ici...",
    tc_uppercase: "MAJUSCULES",
    tc_lowercase: "minuscules",
    tc_title: "Titre",
    tc_sentence: "Phrase",
    tc_camel: "camelCase",
    tc_pascal: "PascalCase",
    tc_snake: "snake_case",
    tc_kebab: "kebab-case",
    tc_dot: "dot.case",
    // WordCounter
    wc_placeholder: "Commencez à taper ou collez du texte...",
    wc_chars: "Caractères",
    wc_chars_nospace: "Caract. (sans espaces)",
    wc_words: "Mots",
    wc_sentences: "Phrases",
    wc_paragraphs: "Paragraphes",
    wc_reading: "Temps de lecture",
    wc_speaking: "Temps de parole",
    // JsonFormatter
    json_format: "Formater",
    json_minify: "Minifier",
    json_validate: "Valider",
    json_valid: "Valide",
    json_error: "Erreur",
    json_input: "Entrée",
    json_output: "Sortie",
    json_2spaces: "2 espaces",
    json_4spaces: "4 espaces",
    json_tab: "Tabulation",
    // Base64Tool
    b64_plain: "Texte brut",
    b64_encode: "Encoder",
    b64_encode_file: "Encoder un fichier",
    b64_base64: "Base64",
    b64_decode: "Décoder",
    b64_paste: "Ou collez le Base64 ici pour décoder...",
    b64_placeholder: "Saisissez le texte à encoder...",
    // UrlEncoderTool
    url_placeholder: "Saisissez l'URL ou le texte...",
    url_encode_full: "Encoder (complet)",
    url_encode_uri: "Encoder (URI)",
    url_decode: "Décoder",
    // HashGenerator
    hash_placeholder: "Saisissez le texte à hacher...",
    hash_generate: "Générer les hachages",
    hash_generating: "Génération en cours...",
    // TimestampConverter
    ts_unix: "Timestamp Unix",
    ts_datetime: "Date / Heure",
    ts_now: "Maintenant",
    ts_convert: "Convertir",
    ts_from_date: "Depuis la date",
    // ColorConverter
    color_hex: "HEX",
    color_rgb: "RVB",
    color_hsl: "TSL",
    color_cmyk: "CMJN",
    color_r: "R",
    color_g: "V",
    color_b: "B",
    // Common
    copy: "Copier",
    copied: "Copié !",
  },
};

type TranslationKey = keyof typeof translations.en;

interface I18nContextType {
  lang: Lang;
  t: (key: TranslationKey) => string;
  toggleLang: () => void;
}

const I18nContext = createContext<I18nContextType>({
  lang: "en",
  t: (key) => translations.en[key],
  toggleLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  const t = (key: TranslationKey): string =>
    translations[lang][key] ?? translations.en[key];
  const toggleLang = () => setLang((l) => (l === "en" ? "fr" : "en"));

  return (
    <I18nContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}
