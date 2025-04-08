'use client'

import { useState, useRef } from 'react'
import { UploadCloud, X, Check, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface GalleryImageUploadProps {
  onUploadComplete: (fileUrl: string) => void
  className?: string
  accept?: string
  maxSizeMB?: number
  buttonLabel?: string
  tags?: string[]
  description?: string
  title?: string
}

export function GalleryImageUpload({
  onUploadComplete,
  className = '',
  accept = 'image/*',
  maxSizeMB = 5,
  buttonLabel = 'Загрузить изображение',
  tags = ['gallery'],
  description = '',
  title = ''
}: GalleryImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Проверка размера файла
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      toast.error(`Размер файла превышает ${maxSizeMB}MB`)
      return
    }

    // Предпросмотр изображения
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }

    try {
      setIsUploading(true)
      setIsSuccess(false)

      // Создаем FormData для отправки на наш сервер
      const formData = new FormData()
      formData.append('file', file)
      formData.append('usePostImage', 'true') // Указываем, что нужно использовать PostImage
      formData.append('title', title || file.name)

      if (description) {
        formData.append('description', description)
      }

      if (tags && tags.length > 0) {
        formData.append('tags', tags.join(','))
      }

      // Отправляем запрос на наш прокси API
      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.url) {
        throw new Error('Не удалось получить URL загруженного изображения')
      }

      console.log('Изображение успешно загружено:', data.url)
      setIsSuccess(true)
      onUploadComplete(data.url)
      toast.success('Файл успешно загружен')
    } catch (error) {
      console.error('Ошибка загрузки изображения:', error)
      toast.error('Не удалось загрузить файл')
      setPreview(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const clearUpload = () => {
    setPreview(null)
    setIsSuccess(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={accept}
      />

      {!preview ? (
        <Button
          type="button"
          variant="outline"
          onClick={handleClick}
          disabled={isUploading}
          className="w-full border-dashed h-32 flex flex-col items-center justify-center space-y-2"
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
              <span className="mt-2 text-sm">Загрузка...</span>
            </div>
          ) : (
            <>
              <UploadCloud className="h-6 w-6 text-gray-400" />
              <span className="text-sm text-gray-600">{buttonLabel}</span>
              <span className="text-xs text-gray-400">
                Максимальный размер: {maxSizeMB}MB
              </span>
            </>
          )}
        </Button>
      ) : (
        <div className="relative border rounded-md overflow-hidden">
          <div className="absolute top-2 right-2 z-10 flex space-x-2">
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="h-6 w-6 rounded-full"
              onClick={clearUpload}
            >
              <X className="h-4 w-4" />
            </Button>
            {isSuccess && (
              <div className="bg-green-500 text-white rounded-full h-6 w-6 flex items-center justify-center">
                <Check className="h-4 w-4" />
              </div>
            )}
          </div>

          <img
            src={preview}
            alt="Preview"
            className="w-full h-32 object-cover"
          />
        </div>
      )}
    </div>
  )
}

interface MultiGalleryImageUploadProps {
  onUploadsComplete: (fileUrls: string[]) => void
  className?: string
  accept?: string
  maxSizeMB?: number
  buttonLabel?: string
  tags?: string[]
  description?: string
  title?: string
  maxImages?: number
}

export function MultiGalleryImageUpload({
  onUploadsComplete,
  className = '',
  accept = 'image/*',
  maxSizeMB = 5,
  buttonLabel = 'Выбрать изображения',
  tags = ['gallery'],
  description = '',
  title = '',
  maxImages = 10
}: MultiGalleryImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [totalFiles, setTotalFiles] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState(0)
  const [previews, setPreviews] = useState<string[]>([])
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (files.length > maxImages) {
      toast.error(`Максимальное количество файлов для загрузки: ${maxImages}`)
      return
    }

    // Проверка размера всех файлов
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    const oversizedFiles = Array.from(files).filter(file => file.size > maxSizeBytes)

    if (oversizedFiles.length > 0) {
      toast.error(`${oversizedFiles.length} файл(ов) превышают максимальный размер ${maxSizeMB}MB`)
      return
    }

    // Создаем превью для всех изображений
    const newPreviews: string[] = []
    const fileArray = Array.from(files)

    for (const file of fileArray) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            newPreviews.push(event.target.result as string)
            if (newPreviews.length === fileArray.length) {
              setPreviews(newPreviews)
            }
          }
        }
        reader.readAsDataURL(file)
      }
    }

    try {
      setIsUploading(true)
      setTotalFiles(files.length)
      setUploadedFiles(0)
      setProgress(0)
      setUploadedUrls([])

      const newUrls: string[] = []

      // Загружаем каждый файл последовательно
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Создаем FormData для текущего файла
        const formData = new FormData()
        formData.append('file', file)
        formData.append('usePostImage', 'true')
        formData.append('title', title || file.name)

        if (description) {
          formData.append('description', description)
        }

        if (tags && tags.length > 0) {
          formData.append('tags', tags.join(','))
        }

        // Отправляем запрос
        const response = await fetch('/api/uploads', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Ошибка при загрузке файла ${i+1}: HTTP ${response.status}`)
        }

        const data = await response.json()

        if (!data.url) {
          throw new Error(`Не удалось получить URL файла ${i+1}`)
        }

        // Добавляем URL в массив
        newUrls.push(data.url)

        // Обновляем прогресс
        setUploadedFiles(i + 1)
        setProgress(Math.round(((i + 1) / files.length) * 100))
      }

      setUploadedUrls(newUrls)
      onUploadsComplete(newUrls)
      toast.success(`Успешно загружено ${newUrls.length} изображений`)
    } catch (error) {
      console.error('Ошибка загрузки изображений:', error)
      toast.error(`Ошибка загрузки: ${(error as Error).message}`)

      // Если некоторые файлы были загружены, передаем их
      if (uploadedUrls.length > 0) {
        onUploadsComplete(uploadedUrls)
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const clearUploads = () => {
    setPreviews([])
    setUploadedUrls([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={accept}
        multiple
      />

      {previews.length === 0 ? (
        <Button
          type="button"
          variant="outline"
          onClick={handleClick}
          disabled={isUploading}
          className="w-full border-dashed h-32 flex flex-col items-center justify-center space-y-2"
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
              <span className="mt-2 text-sm">
                Загрузка {uploadedFiles} из {totalFiles} ({progress}%)
              </span>
            </div>
          ) : (
            <>
              <UploadCloud className="h-6 w-6 text-gray-400" />
              <span className="text-sm text-gray-600">{buttonLabel}</span>
              <span className="text-xs text-gray-400">
                Максимум {maxImages} файлов, размер до {maxSizeMB}MB каждый
              </span>
            </>
          )}
        </Button>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">Загружено {previews.length} изображений</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearUploads}
              disabled={isUploading}
            >
              Очистить все
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto p-2">
            {previews.map((preview, index) => (
              <div key={index} className="relative border rounded-md overflow-hidden">
                <img
                  src={preview}
                  alt={`Preview ${index+1}`}
                  className="w-full h-24 object-cover"
                />
                {uploadedUrls[index] && (
                  <div className="absolute bottom-1 right-1 bg-green-500 text-white rounded-full h-5 w-5 flex items-center justify-center">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
