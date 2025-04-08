'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

interface Gallery {
  id: number
  title: string
  description: string | null
  slug: string
  images: {
    id: number
    imageUrl: string
    title: string | null
  }[]
  _count?: {
    images: number
  }
}

interface GallerySectionProps {
  galleries: Gallery[]
}

export default function GallerySection({ galleries }: GallerySectionProps) {
  if (!galleries || galleries.length === 0) {
    return null
  }

  // Показываем только до 3 галерей на главной странице
  const displayGalleries = galleries.slice(0, 3)

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Фотогалерея</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Ознакомьтесь с фотографиями наших автомобилей и трансферов. Мы предлагаем комфортные поездки на премиальных автомобилях.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayGalleries.map((gallery) => (
            <Card key={gallery.id} className="overflow-hidden transition-all duration-300 hover:shadow-md group">
              <div className="relative w-full h-56 overflow-hidden">
                {gallery.images.length > 0 ? (
                  <Image
                    src={gallery.images[0].imageUrl}
                    alt={gallery.title}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">Нет изображений</span>
                  </div>
                )}
              </div>

              <CardContent className="pt-4">
                <h3 className="text-xl font-semibold mb-2">{gallery.title}</h3>
                {gallery.description && (
                  <p className="text-gray-600 line-clamp-2">{gallery.description}</p>
                )}
              </CardContent>

              <CardFooter className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {gallery._count?.images || gallery.images.length} фото
                </span>
                <Link href="/gallery">
                  <Button variant="ghost" size="sm" className="group/button">
                    Смотреть галерею
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/button:translate-x-1" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {galleries.length > 3 && (
          <div className="text-center mt-12">
            <Link href="/gallery">
              <Button className="px-8">
                Все галереи
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
