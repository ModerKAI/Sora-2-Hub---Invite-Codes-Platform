# Инструкция по деплою на Vercel

## Шаг 1: Закоммить и запушить изменения

```bash
git add package.json vercel.json
git commit -m "Fix: Подготовка проекта для деплоя на Vercel"
git push origin master
```

## Шаг 2: Подключение к Vercel

### Вариант A: Через веб-интерфейс Vercel

1. Перейдите на https://vercel.com
2. Войдите через GitHub аккаунт
3. Нажмите "Add New Project" (или "New Project")
4. Выберите репозиторий `ModerKAI/sora2`
5. Vercel автоматически определит настройки:
   - **Framework Preset**: Other
   - **Build Command**: (оставьте пустым или `npm install`)
   - **Output Directory**: (оставьте пустым)
   - **Install Command**: `npm install`
6. Нажмите "Deploy"

### Вариант B: Через Vercel CLI

```bash
# Установите Vercel CLI (если еще не установлен)
npm i -g vercel

# Войдите в аккаунт
vercel login

# Задеплойте проект
vercel

# Для production деплоя
vercel --prod
```

## Шаг 3: Проверка деплоя

После успешного деплоя Vercel предоставит вам URL вида:
- `https://your-project-name.vercel.app`

## Важные моменты

1. **Статические файлы**: Сервер Express настроен на обслуживание статических файлов из папки `public/`
2. **API маршруты**: Все API endpoints доступны по пути `/api/*`
3. **Главная страница**: Доступна по корневому пути `/`
4. **Автоматический деплой**: После подключения к GitHub, каждый push в master ветку будет автоматически деплоиться

## Переменные окружения (если понадобятся в будущем)

Если в будущем потребуется добавить переменные окружения:
1. Перейдите в Settings проекта на Vercel
2. Раздел "Environment Variables"
3. Добавьте необходимые переменные

## Мониторинг

- Логи доступны в Dashboard проекта
- Функции мониторинга в разделе "Functions"
- Analytics можно включить в Settings

## Откат версии

Если нужно откатить версию:
1. Перейдите в Deployments
2. Найдите нужную версию
3. Нажмите "..." → "Promote to Production"

