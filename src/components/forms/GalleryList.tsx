'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Eye, Pencil, Trash2, ImagePlus, Plus, FileImage, Upload, X, Image } from 'lucide-react'
import { GalleryImageUpload, MultiGalleryImageUpload } from '@/components/ui/gallery-image-upload'
import { normalizeImagePath } from '@/lib/utils'

// Типы данных
interface Gallery {
  id: number
  title: string
  description: string | null
  slug: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
  _count?: { images: number }
}

interface GalleryImage {
  id: number
  galleryId: number
  imageUrl: string
  title: string | null
  description: string | null
  order: number
  createdAt: string
  updatedAt: string
}

// Функция для создания slug из названия
function createSlugFromTitle(title: string): string {
  return title.toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function GalleryList() {
  const router = useRouter()

  // Состояния
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [loading, setLoading] = useState(true)
  const [openGalleryModal, setOpenGalleryModal] = useState(false)
  const [openImageModal, setOpenImageModal] = useState(false)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null)
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [loadingImages, setLoadingImages] = useState(false)
  const [multipleImageUrls, setMultipleImageUrls] = useState<string[]>([''])
  const [multipleImageUploadMode, setMultipleImageUploadMode] = useState(false)

  // Формы
  const [galleryForm, setGalleryForm] = useState({
    id: 0,
    title: '',
    description: '',
    isPublished: true
  })

  const [imageForm, setImageForm] = useState({
    id: 0,
    galleryId: 0,
    imageUrl: '',
    title: '',
    description: '',
    order: 0
  })

  // Загрузка списка галерей
  const fetchGalleries = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/gallery')
      if (!response.ok) throw new Error('Не удалось загрузить галереи')
      const data = await response.json()
      setGalleries(data)
    } catch (error) {
      console.error('Ошибка при загрузке галерей:', error)
      toast.error('Не удалось загрузить галереи')
    } finally {
      setLoading(false)
    }
  }

  // Загрузка изображений для выбранной галереи
  const fetchGalleryImages = async (galleryId: number) => {
    try {
      setLoadingImages(true)
      const response = await fetch(`/api/gallery/images?galleryId=${galleryId}`)
      if (!response.ok) throw new Error('Не удалось загрузить изображения')
      const data = await response.json()
      setGalleryImages(data)
    } catch (error) {
      console.error('Ошибка при загрузке изображений:', error)
      toast.error('Не удалось загрузить изображения галереи')
    } finally {
      setLoadingImages(false)
    }
  }

  // Открытие модального окна для создания/редактирования галереи
  const openEditGalleryModal = (gallery?: Gallery) => {
    if (gallery) {
      setGalleryForm({
        id: gallery.id,
        title: gallery.title,
        description: gallery.description || '',
        isPublished: gallery.isPublished
      })
    } else {
      setGalleryForm({
        id: 0,
        title: '',
        description: '',
        isPublished: true
      })
    }
    setOpenGalleryModal(true)
  }

  // Открытие модального окна управления изображениями
  const openManageImagesModal = async (gallery: Gallery) => {
    setSelectedGallery(gallery)
    await fetchGalleryImages(gallery.id)
    setOpenImageModal(true)
    setMultipleImageUploadMode(false)
    setMultipleImageUrls([''])

    // Сбросить форму добавления изображения
    setImageForm({
      id: 0,
      galleryId: gallery.id,
      imageUrl: '',
      title: '',
      description: '',
      order: 0
    })
  }

  // Открытие модального окна подтверждения удаления
  const openConfirmDelete = (id: number) => {
    setDeleteId(id)
    setOpenDeleteModal(true)
  }

  // Сохранение галереи (создание/обновление)
  const saveGallery = async () => {
    try {
      if (!galleryForm.title) {
        toast.error('Заполните обязательное поле: название')
        return
      }

      // Автоматически создаем slug из названия
      const slug = createSlugFromTitle(galleryForm.title)

      const isUpdate = galleryForm.id > 0
      const url = '/api/gallery'
      const method = isUpdate ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...galleryForm,
          slug
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Не удалось сохранить галерею')
      }

      toast.success(isUpdate ? 'Галерея обновлена' : 'Галерея создана')
      fetchGalleries()
      setOpenGalleryModal(false)
    } catch (error) {
      console.error('Ошибка при сохранении галереи:', error)
      toast.error((error as Error).message || 'Не удалось сохранить галерею')
    }
  }

  // Удаление галереи
  const deleteGallery = async () => {
    if (!deleteId) return

    try {
      const response = await fetch(`/api/gallery?id=${deleteId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Не удалось удалить галерею')
      }

      toast.success('Галерея удалена')
      fetchGalleries()
      setOpenDeleteModal(false)
    } catch (error) {
      console.error('Ошибка при удалении галереи:', error)
      toast.error((error as Error).message || 'Не удалось удалить галерею')
    }
  }

  // Переключение режима множественной загрузки изображений
  const toggleMultipleImageUploadMode = () => {
    setMultipleImageUploadMode(!multipleImageUploadMode)
    if (!multipleImageUploadMode) {
      setImageForm({
        ...imageForm,
        imageUrl: '',
        title: '',
        description: ''
      })
    } else {
      setMultipleImageUrls([''])
    }
  }

  // Добавление поля для еще одного изображения
  const addImageField = () => {
    setMultipleImageUrls([...multipleImageUrls, ''])
  }

  // Удаление поля изображения
  const removeImageField = (index: number) => {
    const newUrls = [...multipleImageUrls]
    newUrls.splice(index, 1)
    setMultipleImageUrls(newUrls)
  }

  // Обновление URL изображения в режиме множественной загрузки
  const updateImageUrl = (index: number, value: string) => {
    const newUrls = [...multipleImageUrls]
    newUrls[index] = value
    setMultipleImageUrls(newUrls)
  }

  // Добавление одного изображения в галерею
  const addImage = async () => {
    try {
      if (!imageForm.imageUrl) {
        toast.error('Укажите URL изображения')
        return
      }

      const response = await fetch('/api/gallery/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          galleryId: selectedGallery?.id,
          imageUrl: imageForm.imageUrl,
          title: imageForm.title || null,
          description: imageForm.description || null
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Не удалось добавить изображение')
      }

      toast.success('Изображение добавлено')

      // Обновляем список изображений и сбрасываем форму
      if (selectedGallery) {
        fetchGalleryImages(selectedGallery.id)
      }

      setImageForm({
        ...imageForm,
        imageUrl: '',
        title: '',
        description: ''
      })
    } catch (error) {
      console.error('Ошибка при добавлении изображения:', error)
      toast.error((error as Error).message || 'Не удалось добавить изображение')
    }
  }

  // Добавление нескольких изображений в галерею
  const addMultipleImages = async () => {
    try {
      // Фильтруем пустые URL
      const validUrls = multipleImageUrls.filter(url => url.trim() !== '')

      if (validUrls.length === 0) {
        toast.error('Укажите хотя бы один URL изображения')
        return
      }

      // Устанавливаем общие заголовок и описание для всех изображений
      const title = imageForm.title || null
      const description = imageForm.description || null

      // Создаем массив промисов для всех изображений
      const uploadPromises = validUrls.map(url =>
        fetch('/api/gallery/images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            galleryId: selectedGallery?.id,
            imageUrl: url,
            title,
            description
          })
        })
      )

      // Запускаем все промисы параллельно
      const results = await Promise.allSettled(uploadPromises)

      // Подсчитываем успешные и неудачные загрузки
      const successful = results.filter(result => result.status === 'fulfilled').length
      const failed = results.filter(result => result.status === 'rejected').length

      if (successful > 0) {
        toast.success(`Успешно добавлено ${successful} изображений`)

        // Обновляем список изображений
        if (selectedGallery) {
          fetchGalleryImages(selectedGallery.id)
        }

        // Сбрасываем форму
        setMultipleImageUrls([''])
        setImageForm({
          ...imageForm,
          title: '',
          description: ''
        })
      }

      if (failed > 0) {
        toast.error(`Не удалось добавить ${failed} изображений`)
      }
    } catch (error) {
      console.error('Ошибка при добавлении изображений:', error)
      toast.error('Произошла ошибка при добавлении изображений')
    }
  }

  // Удаление изображения из галереи
  const deleteImage = async (imageId: number) => {
    try {
      const response = await fetch(`/api/gallery/images?id=${imageId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Не удалось удалить изображение')
      }

      toast.success('Изображение удалено')

      // Обновляем список изображений
      if (selectedGallery) {
        fetchGalleryImages(selectedGallery.id)
        fetchGalleries() // Обновляем счётчики изображений в списке галерей
      }
    } catch (error) {
      console.error('Ошибка при удалении изображения:', error)
      toast.error((error as Error).message || 'Не удалось удалить изображение')
    }
  }

  // Загрузка списка галерей при монтировании компонента
  useEffect(() => {
    fetchGalleries()
  }, [])

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Фотогалереи</CardTitle>
        <Button onClick={() => openEditGalleryModal()}>
          <Plus className="mr-2 h-4 w-4" />
          Добавить галерею
        </Button>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Загрузка галерей...</p>
          </div>
        ) : galleries.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">Галереи еще не созданы</p>
            <Button className="mt-4" onClick={() => openEditGalleryModal()}>
              Создать первую галерею
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Название</TableHead>
                  <TableHead className="text-center">Изображения</TableHead>
                  <TableHead className="text-center">Опубликовано</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {galleries.map((gallery) => (
                  <TableRow key={gallery.id}>
                    <TableCell className="font-medium">{gallery.title}</TableCell>
                    <TableCell className="text-center">{gallery._count?.images || 0}</TableCell>
                    <TableCell className="text-center">
                      {gallery.isPublished ? 'Да' : 'Нет'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => router.push(`/gallery/${gallery.slug}`)}
                          title="Просмотр галереи"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openManageImagesModal(gallery)}
                          title="Управление изображениями"
                        >
                          <ImagePlus className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openEditGalleryModal(gallery)}
                          title="Редактировать галерею"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openConfirmDelete(gallery.id)}
                          title="Удалить галерею"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Модальное окно для создания/редактирования галереи */}
        <Dialog open={openGalleryModal} onOpenChange={setOpenGalleryModal}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>
                {galleryForm.id > 0 ? 'Редактировать галерею' : 'Создать новую галерею'}
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="title" className="text-right">
                  Название*
                </label>
                <Input
                  id="title"
                  value={galleryForm.title}
                  onChange={(e) =>
                    setGalleryForm({ ...galleryForm, title: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="Название галереи"
                />
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <label htmlFor="description" className="text-right pt-2">
                  Описание
                </label>
                <Textarea
                  id="description"
                  value={galleryForm.description}
                  onChange={(e) =>
                    setGalleryForm({ ...galleryForm, description: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="Описание галереи"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="isPublished" className="text-right">
                  Опубликовать
                </label>
                <div className="flex items-center col-span-3">
                  <Switch
                    id="isPublished"
                    checked={galleryForm.isPublished}
                    onCheckedChange={(checked) =>
                      setGalleryForm({ ...galleryForm, isPublished: checked })
                    }
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Отмена</Button>
              </DialogClose>
              <Button onClick={saveGallery}>Сохранить</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Модальное окно для управления изображениями */}
        <Dialog open={openImageModal} onOpenChange={setOpenImageModal}>
          <DialogContent className="sm:max-w-[650px]">
            <DialogHeader>
              <DialogTitle>
                Управление изображениями: {selectedGallery?.title}
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-6">
              {/* Переключатель режима загрузки */}
              <div className="flex justify-between items-center pb-2 border-b">
                <h4 className="font-medium">Добавить изображения</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleMultipleImageUploadMode}
                >
                  {multipleImageUploadMode ? 'Одиночная загрузка' : 'Множественная загрузка'}
                </Button>
              </div>

              {/* Форма добавления изображений */}
              {multipleImageUploadMode ? (
                <div className="border p-4 rounded-md">
                  <div className="grid gap-3">
                    <div className="grid grid-cols-4 items-center gap-3">
                      <label htmlFor="uploadTitle" className="text-right text-sm">
                        Общий заголовок
                      </label>
                      <Input
                        id="uploadTitle"
                        value={imageForm.title || ''}
                        onChange={(e) =>
                          setImageForm({ ...imageForm, title: e.target.value })
                        }
                        className="col-span-3"
                        placeholder="Общий заголовок для всех изображений"
                      />
                    </div>

                    <div className="grid grid-cols-4 items-start gap-3">
                      <label htmlFor="uploadDescription" className="text-right text-sm pt-2">
                        Общее описание
                      </label>
                      <Textarea
                        id="uploadDescription"
                        value={imageForm.description || ''}
                        onChange={(e) =>
                          setImageForm({ ...imageForm, description: e.target.value })
                        }
                        className="col-span-3"
                        placeholder="Общее описание для всех изображений"
                        rows={2}
                      />
                    </div>

                    <div className="mt-2">
                      <MultiGalleryImageUpload
                        onUploadsComplete={(urls) => {
                          if (urls.length > 0) {
                            // Добавляем каждый URL в галерею
                            const addAllImages = async () => {
                              try {
                                // Создаем массив промисов для всех изображений
                                const uploadPromises = urls.map(url =>
                                  fetch('/api/gallery/images', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      galleryId: selectedGallery?.id,
                                      imageUrl: url,
                                      title: imageForm.title || null,
                                      description: imageForm.description || null
                                    })
                                  })
                                )

                                // Запускаем все промисы параллельно
                                const results = await Promise.allSettled(uploadPromises)

                                // Подсчитываем успешные и неудачные загрузки
                                const successful = results.filter(result => result.status === 'fulfilled').length
                                const failed = results.filter(result => result.status === 'rejected').length

                                if (successful > 0) {
                                  toast.success(`Успешно добавлено ${successful} изображений в галерею`)
                                  // Обновляем список изображений
                                  if (selectedGallery) {
                                    fetchGalleryImages(selectedGallery.id)
                                    fetchGalleries() // Обновляем счётчики изображений в списке галерей
                                  }

                                  // Сбрасываем форму
                                  setImageForm({
                                    ...imageForm,
                                    title: '',
                                    description: ''
                                  })
                                }

                                if (failed > 0) {
                                  toast.error(`Не удалось добавить ${failed} изображений в галерею`)
                                }
                              } catch (error) {
                                console.error('Ошибка при добавлении изображений в галерею:', error)
                                toast.error('Произошла ошибка при добавлении изображений в галерею')
                              }
                            }
                            addAllImages()
                          }
                        }}
                        tags={['gallery', `gallery-${selectedGallery?.id || ''}`]}
                        description={imageForm.description || `Изображения для галереи ${selectedGallery?.title || ''}`}
                        title={imageForm.title || `Галерея ${selectedGallery?.title || ''}`}
                        maxImages={20}
                        buttonLabel="Выбрать несколько изображений для загрузки"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border p-4 rounded-md">
                  <div className="grid gap-3">
                    <div className="grid grid-cols-4 items-center gap-3">
                      <label htmlFor="singleImageTitle" className="text-right text-sm">
                        Заголовок
                      </label>
                      <Input
                        id="singleImageTitle"
                        value={imageForm.title || ''}
                        onChange={(e) =>
                          setImageForm({ ...imageForm, title: e.target.value })
                        }
                        className="col-span-3"
                        placeholder="Заголовок изображения"
                      />
                    </div>

                    <div className="grid grid-cols-4 items-start gap-3">
                      <label htmlFor="singleImageDescription" className="text-right text-sm pt-2">
                        Описание
                      </label>
                      <Textarea
                        id="singleImageDescription"
                        value={imageForm.description || ''}
                        onChange={(e) =>
                          setImageForm({ ...imageForm, description: e.target.value })
                        }
                        className="col-span-3"
                        placeholder="Описание изображения"
                        rows={2}
                      />
                    </div>

                    <div className="mt-2">
                      <GalleryImageUpload
                        onUploadComplete={(url) => {
                          if (url) {
                            // Добавляем изображение в галерею
                            fetch('/api/gallery/images', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                galleryId: selectedGallery?.id,
                                imageUrl: url,
                                title: imageForm.title || null,
                                description: imageForm.description || null
                              })
                            })
                            .then(response => {
                              if (!response.ok) {
                                throw new Error('Не удалось добавить изображение в галерею')
                              }
                              return response.json()
                            })
                            .then(() => {
                              toast.success('Изображение добавлено в галерею')
                              // Обновляем список изображений
                              if (selectedGallery) {
                                fetchGalleryImages(selectedGallery.id)
                                fetchGalleries() // Обновляем счётчики изображений в списке галерей
                              }
                              // Сбрасываем форму
                              setImageForm({
                                ...imageForm,
                                title: '',
                                description: ''
                              })
                            })
                            .catch(error => {
                              console.error('Ошибка при добавлении изображения в галерею:', error)
                              toast.error('Не удалось добавить изображение в галерею')
                            })
                          }
                        }}
                        tags={['gallery', `gallery-${selectedGallery?.id || ''}`]}
                        description={imageForm.description || `Изображение для галереи ${selectedGallery?.title || ''}`}
                        title={imageForm.title || `Галерея ${selectedGallery?.title || ''}`}
                        buttonLabel="Выбрать изображение для загрузки"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Список изображений */}
              <div>
                <h4 className="font-medium mb-3">Существующие изображения</h4>

                {loadingImages ? (
                  <div className="py-8 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">Загрузка изображений...</p>
                  </div>
                ) : galleryImages.length === 0 ? (
                  <div className="py-4 text-center border rounded-md">
                    <p className="text-gray-500">Изображения еще не добавлены</p>
                  </div>
                ) : (
                  <div className="grid gap-3 max-h-[300px] overflow-y-auto border p-4 rounded-md">
                    {galleryImages.map((image) => (
                      <div key={image.id} className="flex justify-between items-center gap-3 pb-3 border-b">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded overflow-hidden flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={normalizeImagePath(image.imageUrl)}
                              alt={image.title || 'Gallery Image'}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                console.error(`Ошибка загрузки изображения: ${image.imageUrl}`);
                                (e.target as HTMLImageElement).src = '/images/default-blog.jpg';
                              }}
                            />
                          </div>
                          <div className="flex-grow">
                            <p className="text-sm font-medium truncate">
                              {image.title || 'Без заголовка'}
                            </p>
                            {image.description && (
                              <p className="text-xs text-gray-500 truncate">
                                {image.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteImage(image.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Модальное окно подтверждения удаления */}
        <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Подтверждение удаления</DialogTitle>
            </DialogHeader>

            <div className="py-4">
              <p>
                Вы действительно хотите удалить эту галерею? Это действие нельзя отменить.
                Все изображения в этой галерее также будут удалены.
              </p>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Отмена</Button>
              </DialogClose>
              <Button variant="destructive" onClick={deleteGallery}>
                Удалить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
