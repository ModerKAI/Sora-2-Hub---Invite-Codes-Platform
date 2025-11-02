# Архитектура MVP — Раздача кодов Sora 2

## Модели данных

### User (Пользователь)
```sql
users:
  id: PRIMARY KEY
  email: VARCHAR(255) UNIQUE NOT NULL
  password_hash: VARCHAR(255) NOT NULL
  username: VARCHAR(50) UNIQUE
  role: ENUM('user', 'moderator', 'admin') DEFAULT 'user'
  is_verified: BOOLEAN DEFAULT FALSE
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
  last_login: TIMESTAMP
  is_banned: BOOLEAN DEFAULT FALSE
  ban_reason: TEXT
```

### Code (Код)
```sql
codes:
  id: PRIMARY KEY
  title: VARCHAR(255) NOT NULL
  description: TEXT
  code_value: VARCHAR(255) NOT NULL -- зашифрован
  code_type: ENUM('free', 'premium') DEFAULT 'free'
  price: DECIMAL(10,2) DEFAULT 0.00 -- для будущего маркета
  uploaded_by: FOREIGN KEY -> users(id)
  status: ENUM('pending', 'approved', 'rejected', 'claimed') DEFAULT 'pending'
  is_active: BOOLEAN DEFAULT TRUE
  claim_limit: INT DEFAULT 1 -- сколько раз можно получить
  claimed_count: INT DEFAULT 0
  expires_at: TIMESTAMP NULL
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
```

### Claim (Получение кода)
```sql
claims:
  id: PRIMARY KEY
  user_id: FOREIGN KEY -> users(id)
  code_id: FOREIGN KEY -> codes(id)
  claimed_at: TIMESTAMP
  ip_address: VARCHAR(45)
  user_agent: TEXT
  -- для аудита и предотвращения злоупотреблений
```

### Report (Жалоба)
```sql
reports:
  id: PRIMARY KEY
  reporter_id: FOREIGN KEY -> users(id)
  code_id: FOREIGN KEY -> codes(id)
  reason: ENUM('fake', 'inappropriate', 'spam', 'other')
  details: TEXT
  status: ENUM('pending', 'resolved', 'dismissed') DEFAULT 'pending'
  resolved_by: FOREIGN KEY -> users(id) NULL
  created_at: TIMESTAMP
  resolved_at: TIMESTAMP NULL
```

## API Endpoints

### Авторизация
- `POST /api/auth/register` - регистрация
- `POST /api/auth/login` - вход
- `POST /api/auth/logout` - выход
- `GET /api/auth/me` - получить текущего пользователя
- `POST /api/auth/verify-email` - подтверждение email

### Коды
- `GET /api/codes` - список доступных кодов (публичных)
- `GET /api/codes/:id` - информация о коде (без самого кода)
- `POST /api/codes/:id/claim` - получить код (требует авторизации)
- `POST /api/codes` - загрузить новый код (требует авторизации)
- `PUT /api/codes/:id` - редактировать свой код
- `DELETE /api/codes/:id` - удалить свой код

### Администрирование
- `GET /api/admin/codes/pending` - коды на модерации
- `PUT /api/admin/codes/:id/approve` - одобрить код
- `PUT /api/admin/codes/:id/reject` - отклонить код
- `GET /api/admin/reports` - список жалоб
- `PUT /api/admin/reports/:id/resolve` - закрыть жалобу

### Отчёты и жалобы
- `POST /api/reports` - создать жалобу
- `GET /api/reports/my` - мои жалобы

## Безопасность и ограничения

### Rate Limiting
- Получение кодов: максимум 5 в час на пользователя
- Загрузка кодов: максимум 10 в день на пользователя
- Создание жалоб: максимум 20 в день на пользователя

### Хранение кодов
- Коды шифруются перед сохранением в БД (AES-256)
- Ключ шифрования хранится в переменных окружения
- Показ кода только после успешной верификации пользователя

### Защита от злоупотреблений
- IP-based rate limiting
- Проверка на дубликаты кодов (hash-based)
- Автоматическая модерация (фильтры по ключевым словам)
- Капча для анонимных пользователей

## Технический стек

### Backend
- **Node.js + Express** - REST API
- **PostgreSQL** - основная БД (SQLite для разработки)
- **Redis** - кеширование и rate limiting
- **bcrypt** - хеширование паролей
- **crypto** - шифрование кодов
- **joi** - валидация данных

### Frontend
- **React** - UI компоненты
- **React Router** - маршрутизация
- **Axios** - HTTP клиент
- **React Hook Form** - формы
- **Tailwind CSS** - стили (или наш существующий CSS)

### Развертывание
- **Docker** - контейнеризация
- **Vercel/Netlify** - frontend hosting
- **Render/Railway** - backend hosting
- **PostgreSQL** - БД на облаке (Supabase/Neon)

## MVP функционал (фаза 1)

### Для пользователей
- [x] Просмотр доступных кодов
- [x] Получение бесплатных кодов с простой проверкой
- [ ] Регистрация и авторизация
- [ ] Загрузка собственных кодов
- [ ] Личный кабинет с историей полученных кодов

### Для модераторов
- [ ] Просмотр кодов на модерации
- [ ] Одобрение/отклонение кодов
- [ ] Работа с жалобами пользователей

### Для администраторов
- [ ] Управление пользователями
- [ ] Статистика и аналитика
- [ ] Настройки системы

## Планы на будущее (фаза 2)

### Маркет функционал
- [ ] Платные коды с интеграцией Stripe
- [ ] Эскроу система для безопасных сделок
- [ ] Комиссии платформы
- [ ] Рейтинг продавцов

### Расширенные функции
- [ ] OAuth авторизация (Google, Discord)
- [ ] Push уведомления о новых кодах
- [ ] API для сторонних разработчиков
- [ ] Мобильное приложение