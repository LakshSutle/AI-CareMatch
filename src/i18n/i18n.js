// i18n — Internationalization system for AI CareMatch
// Supports: English (en), Hindi (hi), Telugu (te), Tamil (ta)

import { useState, useEffect, useCallback } from 'react';
import en from './translations/en.json';
import hi from './translations/hi.json';
import te from './translations/te.json';
import ta from './translations/ta.json';

const translations = { en, hi, te, ta };

const LANG_KEY = 'cm_language';

// Auto-detect language from browser locale
function detectLanguage() {
  const saved = localStorage.getItem(LANG_KEY);
  if (saved && translations[saved]) return saved;

  const browserLang = navigator.language?.split('-')[0] || 'en';
  const map = { en: 'en', hi: 'hi', te: 'te', ta: 'ta' };
  return map[browserLang] || 'en';
}

let currentLang = detectLanguage();
let listeners = [];

export function getLang() {
  return currentLang;
}

export function setLang(lang) {
  if (translations[lang]) {
    currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);
    listeners.forEach(fn => fn(lang));
  }
}

export function onLangChange(fn) {
  listeners.push(fn);
  return () => { listeners = listeners.filter(l => l !== fn); };
}

// Translation function — returns translated string or fallback to English
export function t(key) {
  const keys = key.split('.');
  let val = translations[currentLang];
  for (const k of keys) {
    val = val?.[k];
  }
  if (val !== undefined) return val;

  // Fallback to English
  let fallback = translations.en;
  for (const k of keys) {
    fallback = fallback?.[k];
  }
  return fallback || key;
}

// React hook — triggers re-render when language changes
export function useTranslation() {
  const [lang, setLangState] = useState(currentLang);

  useEffect(() => {
    return onLangChange((newLang) => setLangState(newLang));
  }, []);

  const translate = useCallback((key) => {
    const keys = key.split('.');
    let val = translations[lang];
    for (const k of keys) {
      val = val?.[k];
    }
    if (val !== undefined) return val;
    let fallback = translations.en;
    for (const k of keys) {
      fallback = fallback?.[k];
    }
    return fallback || key;
  }, [lang]);

  return { t: translate, lang, setLang };
}

export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'te', label: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' },
];

