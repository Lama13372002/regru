'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LayoutGrid, LogOut, ChevronLeft, Menu, X } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const pathname = usePathname()

  // Закрыть меню при переходе на мобильных устройствах
  useEffect(() => {
    setIsDrawerOpen(false)
  }, [pathname])

  // Обработка клика по затемнению для закрытия меню
  const handleBackdropClick = () => {
    setIsDrawerOpen(false)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Верхняя панель навигации */}
      <header className="border-b bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="md:hidden"
            >
              {isDrawerOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
            <Link href="/admin" className="flex items-center space-x-2">
              <LayoutGrid className="h-6 w-6" />
              <span className="font-bold">Админ-панель</span>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <Link href="/" passHref>
              <Button variant="outline" size="sm" className="flex items-center space-x-1">
                <ChevronLeft className="h-4 w-4" />
                <span>На сайт</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-grow">
        {/* Боковая панель навигации - всегда видима на desktop, скрыта на мобильных */}
        <aside
          className={`fixed md:relative inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out bg-gray-50 md:translate-x-0 border-r ${
            isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ top: '64px', height: 'calc(100vh - 64px)' }}
        >
          <div className="h-full overflow-y-auto p-4">
            <nav className="space-y-1">
              <Link href="/admin" className="block py-2 px-3 rounded-md hover:bg-gray-200 font-medium">
                Управление сайтом
              </Link>
              <div className="pt-4 pb-2">
                <span className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Редактирование секций
                </span>
              </div>
              <Link href="/admin?tab=contact" className="block py-2 px-3 rounded-md hover:bg-gray-200">
                Контактная информация
              </Link>
              <Link href="/admin?tab=company" className="block py-2 px-3 rounded-md hover:bg-gray-200">
                О компании
              </Link>
              <Link href="/admin?tab=social" className="block py-2 px-3 rounded-md hover:bg-gray-200">
                Социальные сети
              </Link>
              <Link href="/admin?tab=blog" className="block py-2 px-3 rounded-md hover:bg-gray-200">
                Управление блогом
              </Link>
              <Link href="/admin?tab=benefits" className="block py-2 px-3 rounded-md hover:bg-gray-200">
                Блок преимуществ
              </Link>
              <Link href="/admin?tab=reviews" className="block py-2 px-3 rounded-md hover:bg-gray-200">
                Отзывы клиентов
              </Link>
              <Link href="/admin?tab=vehicles" className="block py-2 px-3 rounded-md hover:bg-gray-200">
                Автопарк
              </Link>
              <Link href="/admin?tab=routes" className="block py-2 px-3 rounded-md hover:bg-gray-200">
                Маршруты
              </Link>
              <Link href="/admin?tab=transfers" className="block py-2 px-3 rounded-md hover:bg-gray-200">
                Модальное окно трансфера
              </Link>
              <Link href="/admin?tab=footer" className="block py-2 px-3 rounded-md hover:bg-gray-200">
                Настройки футера
              </Link>
            </nav>
          </div>
        </aside>

        {/* Затемнение фона при открытом меню на мобильных */}
        {isDrawerOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-20 md:hidden"
            onClick={handleBackdropClick}
          />
        )}

        {/* Основное содержимое */}
        <main className="flex-grow overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
