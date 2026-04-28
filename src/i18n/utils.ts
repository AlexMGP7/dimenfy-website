import { ui, defaultLang } from './ui';

export function getLangFromUrl(url: URL) {
  let pathname = url.pathname;
  const base = import.meta.env.BASE_URL;
  
  if (base && base !== '/' && pathname.startsWith(base)) {
    pathname = pathname.replace(base, '');
  }
  if (!pathname.startsWith('/')) {
    pathname = '/' + pathname;
  }

  const [, lang] = pathname.split('/');
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof typeof ui[typeof defaultLang]) {
    return ui[lang][key] || ui[defaultLang][key];
  }
}

export function getRouteFromUrl(url: URL): string | undefined {
  let pathname = url.pathname;
  const base = import.meta.env.BASE_URL;
  
  if (base && base !== '/' && pathname.startsWith(base)) {
    pathname = pathname.replace(base, '');
  }
  if (!pathname.startsWith('/')) {
    pathname = '/' + pathname;
  }

  const parts = pathname.split('/');
  // If the first real path segment is a language, return the rest
  if (parts.length > 1 && parts[1] in ui) {
    return parts.length > 2 ? '/' + parts.slice(2).join('/') : '/';
  }
  
  // Otherwise, the route is the path itself (e.g., english default without prefix)
  return pathname;
}
