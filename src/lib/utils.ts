import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Утилиты для работы с классами
export function combineClasses(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export function conditionalClass(condition: boolean, className: string) {
  return condition ? className : ''
}

/**
 * Нормализует путь к изображению, обрабатывая относительные пути и URL
 * @param path Путь к изображению, может быть null
 * @returns Нормализованный путь или путь по умолчанию, если path равен null
 */
export function normalizeImagePath(path: string | null, defaultPath: string = ''): string {
  if (!path) return defaultPath;

  // Если путь уже абсолютный URL (начинается с http:// или https://)
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Если путь относительный (начинается с /)
  if (path.startsWith('/')) {
    // Получаем базовый URL сайта (без trailing slash)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ||
                    (typeof window !== 'undefined' ? window.location.origin : '');

    return `${baseUrl}${path}`;
  }

  // Если путь не начинается с /, добавляем / в начало
  return `/${path}`;
}
