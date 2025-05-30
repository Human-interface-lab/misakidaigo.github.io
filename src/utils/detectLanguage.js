// src/utils/detectLanguage.js
import { franc } from 'franc';
import langs from 'langs';

export function detectLanguage(text) {
  const code3 = franc(text);
  const lang = langs.where("3", code3);
  return lang ? lang.name : "English";
}