import HeroSection from '@/components/sections/HeroSection'
import BenefitsSection from '@/components/sections/BenefitsSection'
import ReviewsSection from '@/components/sections/ReviewsSection'
import RoutesSection from '@/components/sections/RoutesSection'
import VehiclesSection from '@/components/sections/VehiclesSection'
import BlogSection from '@/components/sections/BlogSection'
import GallerySection from '@/components/sections/GallerySection'
import CTA from '@/components/sections/CTA'
import ContactsSection from '@/components/sections/ContactsSection'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import prisma from '@/lib/prisma'

// Изменяем на динамическую генерацию страницы
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

// Получаем отзывы
async function getReviews() {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        isPublished: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return reviews
  } catch (error) {
    console.error('Ошибка при получении отзывов:', error)
    return []
  }
}

// Получаем данные для галереи
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
          take: 1 // Берем только 1 изображение для превью
        },
        _count: {
          select: { images: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 3 // Берем только 3 последние галереи
    })

    return galleries
  } catch (error) {
    console.error('Ошибка при получении галерей:', error)
    return []
  }
}

export default async function Home() {
  const reviews = await getReviews()
  const galleries = await getGalleries()

  return (
    <>
      <Header />
      <main className="flex flex-col min-h-screen">
        <HeroSection />
        <RoutesSection />
        <VehiclesSection />
        <BenefitsSection />
        {galleries.length > 0 && <GallerySection galleries={galleries} />}
        <ReviewsSection reviews={reviews} />
        <BlogSection />
        <CTA />
        <ContactsSection />
      </main>
      <Footer />
    </>
  )
}
