import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card'
import prisma from '@/lib/prisma'
import { Metadata } from 'next'
import { normalizeImagePath } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Фотогалерея | RoyalTransfer',
  description: 'Фотогалерея наших трансферов и автомобилей'
}

async function getGalleries() {
  try {
    const galleries = await prisma.gallery.findMany({
      where: {
        isPublished: true
      },
      include: {
        images: {
          orderBy: {
            order: 'asc'
          },
          take: 1
        },
        _count: {
          select: { images: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return galleries
  } catch (error) {
    console.error('Ошибка при получении галерей:', error)
    return []
  }
}

export default async function GalleryPage() {
  const galleries = await getGalleries()

  return (
    <main className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Фотогалерея</h1>
          <p className="text-gray-600">
            Ознакомьтесь с фотографиями наших автомобилей и трансферов
          </p>
        </div>

        {galleries.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-medium">Галереи пока не добавлены</h2>
            <p className="text-gray-500 mt-2">Пожалуйста, загляните позже</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleries.map((gallery) => (
              <Link href={`/gallery/${gallery.slug}`} key={gallery.id}>
                <Card className="h-full transition-all duration-300 hover:shadow-md overflow-hidden">
                  <div className="relative w-full h-48 overflow-hidden">
                    {gallery.images.length > 0 ? (
                      <Image
                        src={normalizeImagePath(gallery.images[0].imageUrl, '/images/default-blog.jpg')}
                        alt={gallery.title}
                        className="object-cover"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        onError={(e) => {
                          console.error(`Ошибка загрузки изображения галереи: ${gallery.images[0].imageUrl}`);
                          // @ts-ignore - Next Image компонент не имеет onError в типах, но это работает
                          e.target.src = '/images/default-blog.jpg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">Нет изображений</span>
                      </div>
                    )}
                  </div>

                  <CardContent className="pt-4">
                    <CardTitle className="mb-2">{gallery.title}</CardTitle>
                    {gallery.description && (
                      <p className="text-gray-600 line-clamp-2">{gallery.description}</p>
                    )}
                  </CardContent>

                  <CardFooter className="text-sm text-gray-500">
                    {gallery._count.images} фото
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
