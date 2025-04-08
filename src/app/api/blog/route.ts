import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Получение всех статей блога
export async function GET() {
  try {
    const blogPosts = await prisma.blogPost.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ blogPosts })
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json({ error: 'Не удалось получить статьи блога' }, { status: 500 })
  }
}

// Создание новой статьи блога
export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const excerpt = formData.get('excerpt') as string
    const isPublished = formData.get('isPublished') === 'true'
    const imageUrl = formData.get('imageUrl') as string || null

    // Генерируем slug из заголовка
    const slug = title
      .toLowerCase()
      .replace(/[^\w\sа-яё]/gi, '')
      .replace(/\s+/g, '-')
      .replace(/[а-яё]/gi, c => {
        const translitMap: Record<string, string> = {
          'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
          'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
          'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
          'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
        }
        return translitMap[c.toLowerCase()] || c
      })
      .slice(0, 50)

    const publishedAt = isPublished ? new Date() : null

    const blogPost = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        imageUrl,
        isPublished,
        publishedAt
      }
    })

    return NextResponse.json({ blogPost })
  } catch (error) {
    console.error('Error creating blog post:', error)
    return NextResponse.json({ error: 'Не удалось создать статью блога' }, { status: 500 })
  }
}

// Обновление статьи блога
export async function PUT(request: Request) {
  try {
    const formData = await request.formData()

    const id = Number(formData.get('id'))
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const excerpt = formData.get('excerpt') as string
    const isPublished = formData.get('isPublished') === 'true'
    const imageUrl = formData.get('imageUrl') as string || null

    // Получаем текущую статью
    const existingPost = await prisma.blogPost.findUnique({
      where: { id }
    })

    if (!existingPost) {
      return NextResponse.json({ error: 'Статья не найдена' }, { status: 404 })
    }

    // Обновляем publishedAt если статья публикуется впервые
    let publishedAt = existingPost.publishedAt
    if (isPublished && !existingPost.publishedAt) {
      publishedAt = new Date()
    }

    const blogPost = await prisma.blogPost.update({
      where: { id },
      data: {
        title,
        content,
        excerpt,
        imageUrl,
        isPublished,
        publishedAt
      }
    })

    return NextResponse.json({ blogPost })
  } catch (error) {
    console.error('Error updating blog post:', error)
    return NextResponse.json({ error: 'Не удалось обновить статью блога' }, { status: 500 })
  }
}

// Удаление статьи блога
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = Number(searchParams.get('id'))

    if (!id) {
      return NextResponse.json({ error: 'Необходимо указать ID статьи' }, { status: 400 })
    }

    // Получаем статью перед удалением
    const blogPost = await prisma.blogPost.findUnique({
      where: { id }
    })

    if (!blogPost) {
      return NextResponse.json({ error: 'Статья не найдена' }, { status: 404 })
    }

    // Удаляем статью из базы данных
    await prisma.blogPost.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting blog post:', error)
    return NextResponse.json({ error: 'Не удалось удалить статью блога' }, { status: 500 })
  }
}
