import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// GET: получить изображения для конкретной галереи
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const galleryId = searchParams.get('galleryId')

    if (!galleryId) {
      return NextResponse.json({ error: 'ID галереи не указан' }, { status: 400 })
    }

    const galleryIdNum = parseInt(galleryId)

    // Проверяем, существует ли галерея
    const gallery = await prisma.gallery.findUnique({
      where: { id: galleryIdNum }
    })

    if (!gallery) {
      return NextResponse.json({ error: 'Галерея не найдена' }, { status: 404 })
    }

    // Получаем изображения галереи, отсортированные по порядку
    const images = await prisma.galleryImage.findMany({
      where: { galleryId: galleryIdNum },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(images)
  } catch (error) {
    console.error('[API Error]', error)
    return NextResponse.json(
      { error: 'Ошибка при получении изображений галереи' },
      { status: 500 }
    )
  }
}

// POST: добавить новое изображение в галерею
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Проверка обязательных полей
    if (!data.galleryId || !data.imageUrl) {
      return NextResponse.json(
        { error: 'ID галереи и URL изображения являются обязательными полями' },
        { status: 400 }
      )
    }

    const galleryId = typeof data.galleryId === 'string'
      ? parseInt(data.galleryId)
      : data.galleryId

    // Проверяем, существует ли галерея
    const gallery = await prisma.gallery.findUnique({
      where: { id: galleryId }
    })

    if (!gallery) {
      return NextResponse.json({ error: 'Галерея не найдена' }, { status: 404 })
    }

    // Определяем порядок нового изображения
    const maxOrderImage = await prisma.galleryImage.findFirst({
      where: { galleryId },
      orderBy: { order: 'desc' }
    })

    const order = maxOrderImage ? maxOrderImage.order + 1 : 0

    // Создаем новое изображение
    const newImage = await prisma.galleryImage.create({
      data: {
        galleryId,
        imageUrl: data.imageUrl,
        title: data.title || null,
        description: data.description || null,
        order
      }
    })

    revalidatePath('/gallery')
    revalidatePath(`/gallery/${gallery.slug}`)
    revalidatePath('/admin')

    return NextResponse.json(newImage, { status: 201 })
  } catch (error) {
    console.error('[API Error]', error)
    return NextResponse.json(
      { error: 'Ошибка при добавлении изображения в галерею' },
      { status: 500 }
    )
  }
}

// PUT: обновить изображение
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()

    if (!data.id) {
      return NextResponse.json({ error: 'ID изображения не указан' }, { status: 400 })
    }

    const imageId = typeof data.id === 'string' ? parseInt(data.id) : data.id

    // Проверяем, существует ли изображение
    const existingImage = await prisma.galleryImage.findUnique({
      where: { id: imageId },
      include: { gallery: true }
    })

    if (!existingImage) {
      return NextResponse.json({ error: 'Изображение не найдено' }, { status: 404 })
    }

    // Обновляем изображение
    const updatedImage = await prisma.galleryImage.update({
      where: { id: imageId },
      data: {
        imageUrl: data.imageUrl !== undefined ? data.imageUrl : existingImage.imageUrl,
        title: data.title !== undefined ? data.title : existingImage.title,
        description: data.description !== undefined ? data.description : existingImage.description,
        order: data.order !== undefined ? data.order : existingImage.order
      }
    })

    revalidatePath('/gallery')
    revalidatePath(`/gallery/${existingImage.gallery.slug}`)
    revalidatePath('/admin')

    return NextResponse.json(updatedImage)
  } catch (error) {
    console.error('[API Error]', error)
    return NextResponse.json(
      { error: 'Ошибка при обновлении изображения' },
      { status: 500 }
    )
  }
}

// DELETE: удалить изображение
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID изображения не указан' }, { status: 400 })
    }

    const imageId = parseInt(id)

    // Проверяем, существует ли изображение
    const existingImage = await prisma.galleryImage.findUnique({
      where: { id: imageId },
      include: { gallery: true }
    })

    if (!existingImage) {
      return NextResponse.json({ error: 'Изображение не найдено' }, { status: 404 })
    }

    // Сохраняем slug галереи для revalidation
    const gallerySlug = existingImage.gallery.slug

    // Удаляем изображение
    await prisma.galleryImage.delete({
      where: { id: imageId }
    })

    // После удаления, обновляем порядок оставшихся изображений
    const remainingImages = await prisma.galleryImage.findMany({
      where: { galleryId: existingImage.galleryId },
      orderBy: { order: 'asc' }
    })

    // Перенумеровываем все изображения, чтобы избежать пробелов в порядковых номерах
    for (let i = 0; i < remainingImages.length; i++) {
      await prisma.galleryImage.update({
        where: { id: remainingImages[i].id },
        data: { order: i }
      })
    }

    revalidatePath('/gallery')
    revalidatePath(`/gallery/${gallerySlug}`)
    revalidatePath('/admin')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API Error]', error)
    return NextResponse.json(
      { error: 'Ошибка при удалении изображения' },
      { status: 500 }
    )
  }
}
