'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ArrowLeft, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { normalizeImagePath } from '@/lib/utils'

interface GalleryImage {
  id: number
  imageUrl: string
  title: string | null
  description: string | null
}

interface Gallery {
  id: number
  title: string
  description: string | null
  images: GalleryImage[]
}

export default function GalleryDetailPage() {
  const { slug } = useParams()
  const [gallery, setGallery] = useState<Gallery | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Состояние для модального окна и навигации по изображениям
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/gallery?slug=${slug}`)

        if (!response.ok) {
          if (response.status === 404) {
            notFound()
          }
          throw new Error('Не удалось загрузить галерею')
        }

        const data = await response.json()
        setGallery(data)
      } catch (err) {
        console.error('Ошибка при загрузке галереи:', err)
        setError('Не удалось загрузить галерею. Пожалуйста, попробуйте позже.')
      } finally {
        setLoading(false)
      }
    }

    fetchGallery()
  }, [slug])

  // Обработчики для модального окна и навигации
  const openModal = (index: number) => {
    setSelectedImageIndex(index)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const goToNextImage = () => {
    if (!gallery) return
    setSelectedImageIndex((prevIndex) =>
      prevIndex === gallery.images.length - 1 ? 0 : prevIndex + 1
    )
  }

  const goToPrevImage = () => {
    if (!gallery) return
    setSelectedImageIndex((prevIndex) =>
      prevIndex === 0 ? gallery.images.length - 1 : prevIndex - 1
    )
  }

  // Обработчики клавиш
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return

      switch (e.key) {
        case 'ArrowRight':
          goToNextImage()
          break
        case 'ArrowLeft':
          goToPrevImage()
          break
        case 'Escape':
          closeModal()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen, gallery])

  if (loading) {
    return (
      <main className="min-h-screen pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse flex flex-col space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error || !gallery) {
    return (
      <main className="min-h-screen pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-12">
            <h2 className="text-xl font-medium text-red-500">
              {error || 'Галерея не найдена'}
            </h2>
            <Link href="/gallery">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Вернуться к списку галерей
              </Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-6">
          <Link href="/gallery">
            <Button variant="ghost" className="mb-4 pl-0 hover:pl-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад к галереям
            </Button>
          </Link>

          <h1 className="text-3xl font-bold mb-2">{gallery.title}</h1>
          {gallery.description && (
            <p className="text-gray-600 max-w-3xl">{gallery.description}</p>
          )}
        </div>

        {gallery.images.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-medium">В этой галерее пока нет фотографий</h2>
            <p className="text-gray-500 mt-2">Фотографии появятся позже</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallery.images.map((image, index) => (
              <div
                key={image.id}
                className="relative group cursor-pointer"
                onClick={() => openModal(index)}
              >
                <div className="relative aspect-square overflow-hidden rounded-lg">
                  <Image
                    src={normalizeImagePath(image.imageUrl, '/images/default-blog.jpg')}
                    alt={image.title || gallery.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      console.error(`Ошибка загрузки изображения галереи: ${image.imageUrl}`);
                      // @ts-ignore
                      e.target.src = '/images/default-blog.jpg';
                    }}
                  />
                </div>

                <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white">
                  {image.title && (
                    <h3 className="font-medium text-lg">{image.title}</h3>
                  )}
                  {image.description && (
                    <p className="text-sm text-gray-200 mt-1">{image.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Модальное окно для просмотра изображений */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[90vw] max-h-[90vh] p-0 bg-black/95 border-none">
            <div className="relative w-full h-full flex flex-col">
              {/* Кнопка закрытия */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 text-white bg-black/30 p-2 rounded-full hover:bg-black/50 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Основное изображение */}
              <div className="flex-grow flex items-center justify-center p-4 relative">
                {gallery.images.length > 0 && (
                  <div className="relative w-full h-full max-h-[70vh] flex items-center justify-center">
                    <Image
                      src={normalizeImagePath(gallery.images[selectedImageIndex].imageUrl, '/images/default-blog.jpg')}
                      alt={gallery.images[selectedImageIndex].title || gallery.title}
                      className="object-contain max-h-full"
                      fill
                      sizes="90vw"
                      priority
                      onError={(e) => {
                        console.error(`Ошибка загрузки изображения галереи: ${gallery.images[selectedImageIndex].imageUrl}`);
                        // @ts-ignore
                        e.target.src = '/images/default-blog.jpg';
                      }}
                    />
                  </div>
                )}

                {/* Навигационные кнопки */}
                {gallery.images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); goToPrevImage(); }}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 p-2 rounded-full hover:bg-black/50 transition-colors text-white"
                    >
                      <ChevronLeft className="h-8 w-8" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); goToNextImage(); }}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 p-2 rounded-full hover:bg-black/50 transition-colors text-white"
                    >
                      <ChevronRight className="h-8 w-8" />
                    </button>
                  </>
                )}
              </div>

              {/* Описание изображения */}
              {(gallery.images[selectedImageIndex]?.title || gallery.images[selectedImageIndex]?.description) && (
                <div className="p-4 bg-black text-white">
                  {gallery.images[selectedImageIndex]?.title && (
                    <h3 className="font-medium text-lg">{gallery.images[selectedImageIndex].title}</h3>
                  )}
                  {gallery.images[selectedImageIndex]?.description && (
                    <p className="text-gray-300 mt-1">{gallery.images[selectedImageIndex].description}</p>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  )
}
