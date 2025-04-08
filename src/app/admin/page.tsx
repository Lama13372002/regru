'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSettings } from '@/lib/settings-context'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import BlogPostList from '@/components/forms/BlogPostList'
import BenefitsList from '@/components/forms/BenefitsList'
import ReviewsList from '@/components/forms/ReviewsList'
import VehiclesList from '@/components/forms/VehiclesList'
import RoutesList from '@/components/forms/RoutesList'
import TransferConfigList from '@/components/forms/TransferConfigList'
import TransferRequestsList from '@/components/forms/TransferRequestsList'
import ContactRequestsList from '@/components/forms/ContactRequestsList'
import ApplicationRequestsList from '@/components/forms/ApplicationRequestsList'
import LogoSettingsForm from '@/components/forms/LogoSettingsForm'
import HomeSettingsForm from '@/components/forms/HomeSettingsForm'
import GalleryList from '@/components/forms/GalleryList'
import { LayoutGrid, FileText, Phone, Mail, Share2, Award, MessageSquare, Car, Map, Home, Image as ImageIcon, Inbox, MessageCircle, FileQuestion, Camera } from 'lucide-react'

// Компонент, который использует useSearchParams и обернут в Suspense
function AdminContent() {
  const { settings, updateSettings, loading, error } = useSettings()
  const searchParams = useSearchParams()

  const [activeTab, setActiveTab] = useState('contact')
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    address: '',
    workingHours: '',
    companyName: '',
    companyDesc: '',
    instagramLink: '',
    telegramLink: '',
    whatsappLink: ''
  })
  const [isUpdating, setIsUpdating] = useState(false)

  // Обрабатываем URL параметры при загрузке страницы
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Загружаем данные из контекста настроек в локальное состояние формы
  useEffect(() => {
    if (settings) {
      setFormData({
        phone: settings.phone || '',
        email: settings.email || '',
        address: settings.address || '',
        workingHours: settings.workingHours || '',
        companyName: settings.companyName || '',
        companyDesc: settings.companyDesc || '',
        instagramLink: settings.instagramLink || '',
        telegramLink: settings.telegramLink || '',
        whatsappLink: settings.whatsappLink || ''
      })
    }
  }, [settings])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Валидация обязательных полей
    if (!formData.phone.trim() || !formData.email.trim() || !formData.companyName.trim()) {
      toast.error('Пожалуйста, заполните все обязательные поля')
      return
    }

    setIsUpdating(true)
    try {
      await updateSettings(formData)
      toast.success('Настройки успешно обновлены')
    } catch (err) {
      toast.error('Не удалось обновить настройки')
      console.error(err)
    } finally {
      setIsUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Панель администратора</h1>
          <p className="text-gray-600">Управление настройками сайта и контентом</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto pb-2 -mx-4 px-4">
            <TabsList className="mb-4 flex flex-nowrap min-w-max">
              <TabsTrigger value="contact" className="flex items-center text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span>Контакты</span>
              </TabsTrigger>
              <TabsTrigger value="company" className="flex items-center text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3">
                <LayoutGrid className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span>О компании</span>
              </TabsTrigger>
              <TabsTrigger value="social" className="flex items-center text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3">
                <Share2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span>Соцсети</span>
              </TabsTrigger>
              <TabsTrigger value="homepage" className="flex items-center text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3">
                <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span>Главный блок</span>
              </TabsTrigger>
              <TabsTrigger value="logos" className="flex items-center text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3">
                <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span>Логотипы</span>
              </TabsTrigger>
              <TabsTrigger value="gallery" className="flex items-center text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3">
                <Camera className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span>Фотогалерея</span>
              </TabsTrigger>
              <TabsTrigger value="benefits" className="flex items-center text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3">
                <Award className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span>Преимущества</span>
              </TabsTrigger>
              <TabsTrigger value="reviews" className="flex items-center text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3">
                <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span>Отзывы</span>
              </TabsTrigger>
              <TabsTrigger value="blog" className="flex items-center text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3">
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span>Блог</span>
              </TabsTrigger>
              <TabsTrigger value="vehicles" className="flex items-center text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3">
                <Car className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span>Автомобили</span>
              </TabsTrigger>
              <TabsTrigger value="routes" className="flex items-center text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3">
                <Map className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span>Маршруты</span>
              </TabsTrigger>
              <TabsTrigger value="transfers" className="flex items-center text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3">
                <Car className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span>Настройки трансфера</span>
              </TabsTrigger>
              <TabsTrigger value="transfer-requests" className="flex items-center text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3">
                <Inbox className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span>Заявки на трансфер</span>
              </TabsTrigger>
              <TabsTrigger value="contact-requests" className="flex items-center text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3">
                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span>Заявки со связи</span>
              </TabsTrigger>
              <TabsTrigger value="application-requests" className="flex items-center text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3">
                <FileQuestion className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span>Заявки с формы</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <form onSubmit={handleSubmit}>
            <TabsContent value="contact">
              <Card>
                <CardHeader>
                  <CardTitle>Контактная информация</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Номер телефона *
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="text"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+7 (000) 000-00-00"
                      className="w-full"
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Телефон будет отображаться в футере на всех страницах сайта
                    </p>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="info@example.com"
                      className="w-full"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Адрес
                    </label>
                    <Input
                      id="address"
                      name="address"
                      type="text"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Ваш адрес"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="workingHours" className="block text-sm font-medium text-gray-700 mb-1">
                      Часы работы
                    </label>
                    <Input
                      id="workingHours"
                      name="workingHours"
                      type="text"
                      value={formData.workingHours}
                      onChange={handleChange}
                      placeholder="Пн-Вс: 9:00-18:00"
                      className="w-full"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isUpdating || loading} className="ml-auto">
                    {isUpdating ? 'Сохранение...' : 'Сохранить настройки'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="company">
              <Card>
                <CardHeader>
                  <CardTitle>Информация о компании</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                      Название компании *
                    </label>
                    <Input
                      id="companyName"
                      name="companyName"
                      type="text"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="Название компании"
                      className="w-full"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="companyDesc" className="block text-sm font-medium text-gray-700 mb-1">
                      Описание компании
                    </label>
                    <Textarea
                      id="companyDesc"
                      name="companyDesc"
                      value={formData.companyDesc}
                      onChange={handleChange}
                      placeholder="Короткое описание компании"
                      className="w-full"
                      rows={4}
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Это описание будет отображаться в футере сайта
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isUpdating || loading} className="ml-auto">
                    {isUpdating ? 'Сохранение...' : 'Сохранить настройки'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="social">
              <Card>
                <CardHeader>
                  <CardTitle>Социальные сети</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="instagramLink" className="block text-sm font-medium text-gray-700 mb-1">
                      Ссылка на Instagram
                    </label>
                    <Input
                      id="instagramLink"
                      name="instagramLink"
                      type="url"
                      value={formData.instagramLink}
                      onChange={handleChange}
                      placeholder="https://instagram.com/your_account"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="telegramLink" className="block text-sm font-medium text-gray-700 mb-1">
                      Ссылка на Telegram
                    </label>
                    <Input
                      id="telegramLink"
                      name="telegramLink"
                      type="url"
                      value={formData.telegramLink}
                      onChange={handleChange}
                      placeholder="https://t.me/your_account"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="whatsappLink" className="block text-sm font-medium text-gray-700 mb-1">
                      Ссылка на WhatsApp
                    </label>
                    <Input
                      id="whatsappLink"
                      name="whatsappLink"
                      type="url"
                      value={formData.whatsappLink}
                      onChange={handleChange}
                      placeholder="https://wa.me/your_number"
                      className="w-full"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Например: https://wa.me/79001234567
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isUpdating || loading} className="ml-auto">
                    {isUpdating ? 'Сохранение...' : 'Сохранить настройки'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </form>

          <TabsContent value="blog">
            <BlogPostList />
          </TabsContent>

          <TabsContent value="benefits">
            <BenefitsList />
          </TabsContent>

          <TabsContent value="reviews">
            <ReviewsList />
          </TabsContent>

          <TabsContent value="vehicles">
            <VehiclesList />
          </TabsContent>

          <TabsContent value="routes">
            <RoutesList />
          </TabsContent>

          <TabsContent value="transfers">
            <TransferConfigList />
          </TabsContent>

          <TabsContent value="transfer-requests">
            <TransferRequestsList />
          </TabsContent>

          <TabsContent value="contact-requests">
            <ContactRequestsList />
          </TabsContent>

          <TabsContent value="application-requests">
            <ApplicationRequestsList />
          </TabsContent>

          <TabsContent value="logos">
            <LogoSettingsForm />
          </TabsContent>

          <TabsContent value="homepage">
            <HomeSettingsForm />
          </TabsContent>

          <TabsContent value="gallery">
            <GalleryList />
          </TabsContent>

          <TabsContent value="footer">
            <Card>
              <CardHeader>
                <CardTitle>Настройки футера</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Настройки футера состоят из контактной информации и данных о компании, которые можно изменить на соответствующих вкладках.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => setActiveTab("contact")}>
                    Редактировать контакты
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab("company")}>
                    Редактировать информацию о компании
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {error && (
          <div className="p-3 rounded bg-red-50 text-red-700 text-sm mt-6">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}

// Основной компонент страницы администратора
export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    }>
      <AdminContent />
    </Suspense>
  )
}
