import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Вспомогательная функция для создания slug из названия
function createSlugFromTitle(title: string): string {
  return title.toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Функция для получения уникального slug
async function getUniqueSlug(baseSlug: string, galleryId?: number): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  let slugExists = true;

  while (slugExists) {
    const existingGallery = await prisma.gallery.findFirst({
      where: {
        slug,
        ...(galleryId && { id: { not: galleryId } })
      }
    });

    if (!existingGallery) {
      slugExists = false;
    } else {
      slug = `${baseSlug}-${counter}`;
      counter += 1;
    }
  }

  return slug;
}

// GET: получить список галерей или конкретную галерею по slug
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    // Если указан slug, возвращаем конкретную галерею с изображениями
    if (slug) {
      const gallery = await prisma.gallery.findUnique({
        where: { slug },
        include: {
          images: {
            orderBy: { order: 'asc' }
          }
        }
      })

      if (!gallery) {
        return NextResponse.json({ error: 'Галерея не найдена' }, { status: 404 })
      }

      return NextResponse.json(gallery)
    }

    // Иначе возвращаем список всех галерей
    const galleries = await prisma.gallery.findMany({
      include: {
        _count: {
          select: { images: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(galleries)
  } catch (error) {
    console.error('[API Error]', error)
    return NextResponse.json({ error: 'Ошибка при получении данных галереи' }, { status: 500 })
  }
}

// POST: создать новую галерею
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Проверка обязательных полей
    if (!data.title) {
      return NextResponse.json(
        { error: 'Название является обязательным полем' },
        { status: 400 }
      )
    }

    // Создаем slug из названия, если он не указан
    let slug = data.slug || createSlugFromTitle(data.title);

    // Проверяем, что slug уникален
    slug = await getUniqueSlug(slug);

    // Создаем новую галерею
    const newGallery = await prisma.gallery.create({
      data: {
        title: data.title,
        description: data.description || null,
        slug,
        isPublished: data.isPublished !== undefined ? data.isPublished : true
      }
    })

    revalidatePath('/gallery')
    revalidatePath('/admin')

    return NextResponse.json(newGallery, { status: 201 })
  } catch (error) {
    console.error('[API Error]', error)
    return NextResponse.json({ error: 'Ошибка при создании галереи' }, { status: 500 })
  }
}

// PUT: обновить существующую галерею
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()

    if (!data.id) {
      return NextResponse.json({ error: 'ID галереи не указан' }, { status: 400 })
    }

    // Проверяем, существует ли галерея
    const existingGallery = await prisma.gallery.findUnique({
      where: { id: data.id }
    })

    if (!existingGallery) {
      return NextResponse.json({ error: 'Галерея не найдена' }, { status: 404 })
    }

    // Если название изменилось, обновляем slug
    let slug = existingGallery.slug;
    if (data.title && data.title !== existingGallery.title) {
      slug = createSlugFromTitle(data.title);
      slug = await getUniqueSlug(slug, data.id);
    }

    // Обновляем галерею
    const updatedGallery = await prisma.gallery.update({
      where: { id: data.id },
      data: {
        title: data.title !== undefined ? data.title : existingGallery.title,
        description: data.description !== undefined ? data.description : existingGallery.description,
        slug,
        isPublished: data.isPublished !== undefined ? data.isPublished : existingGallery.isPublished
      }
    })

    revalidatePath('/gallery')
    revalidatePath(`/gallery/${updatedGallery.slug}`)
    revalidatePath('/admin')

    return NextResponse.json(updatedGallery)
  } catch (error) {
    console.error('[API Error]', error)
    return NextResponse.json({ error: 'Ошибка при обновлении галереи' }, { status: 500 })
  }
}

// DELETE: удалить галерею
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID галереи не указан' }, { status: 400 })
    }

    const galleryId = parseInt(id)

    // Проверяем, существует ли галерея
    const existingGallery = await prisma.gallery.findUnique({
      where: { id: galleryId }
    })

    if (!existingGallery) {
      return NextResponse.json({ error: 'Галерея не найдена' }, { status: 404 })
    }

    // Удаляем галерею (каскадное удаление изображений будет выполнено автоматически благодаря onDelete: Cascade)
    await prisma.gallery.delete({
      where: { id: galleryId }
    })

    revalidatePath('/gallery')
    revalidatePath('/admin')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API Error]', error)
    return NextResponse.json({ error: 'Ошибка при удалении галереи' }, { status: 500 })
  }
}
