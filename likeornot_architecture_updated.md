# LikeOrNot loyihasi arxitekturasi

## 1. Loyiha haqida

LikeOrNot — foydalanuvchiga nafaqat o‘zining, balki boshqa yaqinlarining ham did va afzalliklarini saqlab borish imkonini beruvchi tizim. Loyiha ikki asosiy interfeysdan iborat bo‘ladi: Telegram bot va Web UI. Har ikkala interfeys bitta markaziy backend bilan ishlaydi. Backend Django va Django Rest Framework asosida quriladi, ma’lumotlar bazasi sifatida SQLite ishlatiladi.

Tizimning asosiy g‘oyasi shundan iboratki, foydalanuvchi odamlarning profillarini qo‘shadi, keyin har bir profil uchun nimani yoqtirishi, nimani yoqtirmasligi va bu qanchalik kuchli ekanini belgilab boradi. Masalan, “Akam kofeni juda yaxshi ko‘radi”, “Onam achchiq ovqatni yoqtirmaydi”, “Do‘stim Marvel filmlarini o‘rtacha yoqtiradi” kabi ma’lumotlar yig‘iladi. Keyinchalik bu ma’lumotlar qidiruv, tavsiya, sovg‘a tanlash, eslab qolish va shaxsiy analiz uchun ishlatiladi.

Bu yondashuvning katta afzalligi shundaki, biznes mantiq bitta joyda saqlanadi. Telegram bot ham, Web UI ham bir xil API bilan ishlaydi. Natijada tizimni boshqarish, kengaytirish va qo‘llab-quvvatlash ancha osonlashadi.

---

## 2. Yangilangan asosiy maqsad

Tizimning vazifasi foydalanuvchi uchun “odamlar va ularning didi” bazasini yuritishdir. Bu loyiha oddiy like/dislike ro‘yxat emas. Bu shaxsiy preference management tizimi bo‘ladi.

Foydalanuvchi quyidagi ishlarni qila olishi kerak:

- o‘z profilini saqlash;
- boshqa yaqinlari, do‘stlari, qarindoshlari yoki tanishlari uchun alohida profil qo‘shish;
- username orqali profilni topish yoki bog‘lash;
- har bir profilga nimalar yoqishi yoki yoqmasligini yozish;
- yoqish yoki yoqtirmaslik darajasini ball bilan belgilash;
- xohlasa rasm qo‘shish;
- rasm qo‘shilmasa default image ishlatish;
- keyinchalik profilga kirib, shu odamning afzalliklari ro‘yxatini ko‘rish.

Demak, markaziy obyekt endi oddiy `item` emas, balki `profile + preference entry` bo‘ladi.

---

## 3. Asosiy biznes mantiq

Tizimda ikkita muhim tushuncha bor:

### 3.1. Owner user
Bu tizimdan foydalanayotgan asosiy foydalanuvchi. U bot yoki Web UI orqali kiradi va o‘ziga tegishli profillarni boshqaradi.

### 3.2. Target profile
Bu ma’lumotlar saqlanayotgan odam profili. Bu profil owner user’ning o‘zi bo‘lishi ham mumkin, boshqa inson bo‘lishi ham mumkin.

Masalan:
- Komron — tizimning owner user’i;
- Komron o‘zi uchun ham profilga ega;
- Komron yana ukasi, onasi, do‘sti yoki sevgan aktyori uchun ham profil qo‘shishi mumkin;
- har bir profil ichida preference yozuvlari saqlanadi.

Shu sababli arxitektura shunday yozilishi kerakki, barcha preference yozuvlari to‘g‘ridan to‘g‘ri `User` ga emas, balki `Profile` modeliga bog‘lansin.

---

## 4. Umumiy arxitektura

Loyiha klassik monolit arxitekturada quriladi, ammo interfeyslar alohida qatlam sifatida ajratiladi. Ya’ni bitta Django backend bo‘ladi, u API, admin va kerak bo‘lsa server-side rendered Web UI qismini ham beradi. Telegram bot esa shu backend bilan API orqali gaplashadi.

Arxitektura quyidagi qismlardan iborat bo‘ladi:

- **Web UI** — foydalanuvchi brauzer orqali ishlaydigan qism;
- **Telegram Bot** — foydalanuvchi Telegram ichida ishlatadigan qism;
- **DRF Backend** — biznes mantiq, autentifikatsiya, permission, API va validatsiya qismi;
- **SQLite Database** — barcha ma’lumotlarni saqlovchi qatlam;
- **Django Admin** — ichki boshqaruv paneli.

Oddiy oqim quyidagicha bo‘ladi:

1. Foydalanuvchi Telegram bot yoki Web UI orqali amal bajaradi.
2. So‘rov DRF backend’ga yuboriladi.
3. Backend ma’lumotni tekshiradi, qayta ishlaydi va SQLite bazaga yozadi yoki o‘qiydi.
4. Natija yana Telegram bot yoki Web UI ga qaytariladi.

---

## 5. Arxitektura sxemasi

```text
                +----------------------+
                |       Web UI         |
                |   Django Templates   |
                |   yoki JS frontend   |
                +----------+-----------+
                           |
                           | HTTP / JSON
                           |
+----------------+         v         +----------------------+
|  Telegram Bot  | <----> API <----> |   Django + DRF       |
|    Aiogram     |                   |  Biznes mantiq       |
+----------------+                   |  Auth / Permissions  |
                                     |  Admin panel         |
                                     +----------+-----------+
                                                |
                                                |
                                                v
                                     +----------------------+
                                     |      SQLite DB       |
                                     | users, profiles,     |
                                     | preferences, images  |
                                     +----------------------+
```

---

## 6. Texnologik stack

### Backend
- Python
- Django
- Django Rest Framework
- SQLite
- Django Admin
- Pillow (rasm bilan ishlash uchun)
- django-cleanup yoki custom media handling
- JWT yoki Session authentication

### Telegram Bot
- Aiogram
- `aiohttp` yoki `httpx`
- FSM state’lar orqali step-by-step input olish

### Web UI
- Django Templates + Tailwind CSS
- yoki alohida frontend kerak bo‘lsa React / Next.js

MVP uchun eng maqbul yo‘l:
- **Backend:** Django + DRF
- **DB:** SQLite
- **Web UI:** Django Templates + Tailwind CSS
- **Bot:** Aiogram

Bu yo‘l tez, sodda va AI agent uchun ham aniq implementatsiya qilinadi.

---

## 7. Loyiha modullari

Django backend quyidagi app’larga bo‘linishi tavsiya qilinadi:

```text
config/              # project settings
apps/
  users/             # auth, custom user, telegram user mapping
  profiles/          # target profiles (o'zi va boshqa odamlar profili)
  preferences/       # yoqadi/yoqmaydi yozuvlari
  categories/        # category va taglar
  mediafiles/        # image handling, default image logic
  api/               # serializers, views, urls
  common/            # helpers, mixins, permissions, constants
telegram_bot/        # aiogram service yoki alohida repo/service
```

---

## 8. Ma’lumotlar bazasi modeli

Bu bo‘lim AI agent uchun eng muhim qism. Kod yozishda preference yozuvlari `User` ga emas, `Profile` ga bog‘lanishi kerak.

### 8.1. User

Tizimdan foydalanayotgan real foydalanuvchi.

Tavsiya etiladigan maydonlar:
- `id`
- `username`
- `full_name`
- `telegram_id` — nullable
- `telegram_username` — nullable
- `phone_number` — optional
- `created_at`
- `updated_at`

Izoh:
- Web UI uchun `username/password` ishlatiladi.
- Telegram bot uchun `telegram_id` va `telegram_username` saqlanadi.

### 8.2. Profile

Bu asosiy model. Har bir profil ma’lum bir insonni ifodalaydi. Profile owner user’ga tegishli bo‘ladi.

Tavsiya etiladigan maydonlar:
- `id`
- `owner` — FK to User
- `linked_user` — nullable OneToOne yoki FK to User
- `username` — qidiruv va ko‘rsatish uchun
- `full_name`
- `nickname` — optional
- `relation` — masalan self, friend, brother, sister, mother, father, colleague, custom
- `bio` — optional
- `avatar` — ImageField, optional
- `is_self_profile` — bool
- `is_public` — bool, default False
- `created_at`
- `updated_at`

Izoh:
- `owner` bu profilni yaratgan foydalanuvchi.
- `linked_user` esa shu profil real tizim foydalanuvchisiga bog‘langan bo‘lishi mumkinligini bildiradi.
- Agar owner kimnidir username orqali qo‘shsa va bazada shu username bilan user bo‘lsa, `linked_user` bog‘lanishi mumkin.
- Agar bunday user topilmasa, profil local profile sifatida yaratiladi.

### 8.3. Category

Preference yozuvlarini guruhlash uchun ishlatiladi.

Misollar:
- Ovqat
- Ichimlik
- Film
- Musiqa
- Kitob
- Hobbi
- Rang
- Sport
- Sovg‘a
- Joy
- Brend
- Xarakter xususiyati

Maydonlar:
- `id`
- `name`
- `slug`
- `icon` — optional
- `created_at`

### 8.4. PreferenceEntry

Har bir profil uchun “nima yoqadi / nima yoqmaydi” shu yerda saqlanadi.

Tavsiya etiladigan maydonlar:
- `id`
- `profile` — FK to Profile
- `category` — FK to Category
- `title` — masalan “Lavash”, “Qora kofe”, “Marvel filmlari”
- `description` — optional
- `sentiment` — choices: `like`, `neutral`, `dislike`
- `level` — integer, masalan 1 dan 5 gacha
- `image` — ImageField, optional
- `image_source_type` — default yoki uploaded
- `note` — optional qisqa izoh
- `created_by` — FK to User
- `created_at`
- `updated_at`

Muhim qoida:
- agar foydalanuvchi rasm yuklamasa, API yoki model darajasida default image biriktirilishi kerak;
- `level` maydoni validatsiya qilinishi kerak;
- `sentiment=like` bo‘lsa ham, `sentiment=dislike` bo‘lsa ham `level` ishlatiladi, ya’ni kuchlilik darajasi alohida saqlanadi.

Masalan:
- `like + level=5` → juda yoqadi
- `like + level=2` → biroz yoqadi
- `dislike + level=5` → juda yoqmaydi
- `dislike + level=1` → uncha yoqmaydi

### 8.5. ProfileSearchLog (optional)

Username bo‘yicha qidiruvlar tarixini saqlash uchun.

Maydonlar:
- `id`
- `owner`
- `searched_username`
- `result_profile` — nullable
- `created_at`

### 8.6. ActivityLog (optional)

Audit va analytics uchun.

Maydonlar:
- `id`
- `user`
- `action`
- `target_type`
- `target_id`
- `metadata` — JSONField bo‘lsa yaxshi, SQLite JSON text sifatida ham yurishi mumkin
- `created_at`

---

## 9. Ma’lumotlar bazasi aloqalari

```text
User (1) -------- (N) Profile               [owner]
User (1) -------- (N) PreferenceEntry       [created_by]
User (1) -------- (0..1) Profile            [linked_user orqali]

Profile (1) ----- (N) PreferenceEntry
Category (1) ---- (N) PreferenceEntry
```

Tizimning to‘g‘ri modeli aynan shu bo‘lishi kerak. Chunki kelajakda bir foydalanuvchi o‘nlab odamlarning profilini yuritishi mumkin.

---

## 10. Username orqali profil topish logikasi

Yangi funksiya bo‘yicha quyidagi biznes oqim kerak:

1. Foydalanuvchi “profil qo‘shish” tugmasini bosadi.
2. Tizim undan username kiritishni so‘raydi.
3. Backend shu username bo‘yicha qidiruv qiladi.
4. Agar bazada shu username bilan real user yoki oldin yaratilgan profile topilsa, shu profil ko‘rsatiladi.
5. Agar topilmasa, owner user uchun yangi local profile yaratiladi.
6. So‘ng foydalanuvchi shu profilga preference yozuvlarini kiritishni boshlaydi.

Muhim qoidalar:
- owner user begona foydalanuvchining maxfiy ma’lumotlarini ko‘ra olmasligi kerak;
- agar profile `is_public=False` bo‘lsa, faqat cheklangan ko‘rinish bo‘lishi kerak yoki umuman ko‘rsatilmasligi kerak;
- oddiy MVP’da esa username asosan “profil identifikatori” sifatida ishlatiladi.

MVP uchun soddalashtirilgan yondashuv:
- username noyob bo‘lishi kerak;
- qidiruvda topilsa, profil kartasi chiqadi;
- topilmasa, foydalanuvchiga “yangi profil yaratish” taklifi beriladi.

---

## 11. Default image logikasi

Bu bo‘limni AI agent kodda albatta implement qilishi kerak.

Talab:
- Preference yozuvi yaratilayotganda foydalanuvchi rasm yuklashi mumkin;
- agar rasm yuklamasa, default image ishlatiladi.

Implementatsiya variantlari:

### Variant A: Model default image
`ImageField(default='defaults/preference-default.png')`

Afzalligi:
- sodda;
- backend darajasida avtomatik ishlaydi.

### Variant B: Serializer yoki service darajasida
Agar request ichida image bo‘lmasa, backend custom service orqali default image path biriktiradi.

Afzalligi:
- nazorat ko‘proq;
- keyinchalik category bo‘yicha turli default image berish mumkin.

Kelajak uchun yaxshi g‘oya:
- category bo‘yicha default image bo‘lsin;
- masalan film uchun alohida, ovqat uchun alohida, ichimlik uchun alohida default rasm.

MVP uchun esa bitta global default image yetadi.

---

## 12. API dizayni

Telegram bot ham, Web UI ham bir xil REST API bilan ishlashi kerak.

### 12.1. Auth
- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/logout/`
- `GET /api/auth/me/`
- `POST /api/auth/telegram-sync/`

### 12.2. Profiles
- `GET /api/profiles/` — owner user’ning profillari ro‘yxati
- `POST /api/profiles/` — yangi profil yaratish
- `GET /api/profiles/<id>/` — profil detail
- `PUT /api/profiles/<id>/` — profil tahrirlash
- `PATCH /api/profiles/<id>/`
- `DELETE /api/profiles/<id>/`
- `GET /api/profiles/search/?username=<username>` — username bo‘yicha profil qidirish
- `POST /api/profiles/create-from-username/` — username asosida profil yaratish yoki linklash

### 12.3. Categories
- `GET /api/categories/`
- `POST /api/categories/`
- `GET /api/categories/<id>/`
- `PUT /api/categories/<id>/`
- `DELETE /api/categories/<id>/`

### 12.4. Preference entries
- `GET /api/preferences/` — filter bilan
- `POST /api/preferences/`
- `GET /api/preferences/<id>/`
- `PUT /api/preferences/<id>/`
- `PATCH /api/preferences/<id>/`
- `DELETE /api/preferences/<id>/`

Qo‘shimcha filter endpointlar:
- `GET /api/preferences/?profile=<profile_id>`
- `GET /api/preferences/?profile=<profile_id>&sentiment=like`
- `GET /api/preferences/?profile=<profile_id>&sentiment=dislike`
- `GET /api/preferences/?profile=<profile_id>&category=<category_id>`
- `GET /api/preferences/?profile=<profile_id>&search=coffee`

### 12.5. Statistics
- `GET /api/stats/overview/`
- `GET /api/stats/profiles/`
- `GET /api/stats/profile/<id>/`
- `GET /api/stats/top-liked/?profile=<id>`
- `GET /api/stats/top-disliked/?profile=<id>`
- `GET /api/stats/category-breakdown/?profile=<id>`

### 12.6. Media
- `POST /api/upload/image/`
- `DELETE /api/upload/image/<id>/` — ixtiyoriy

---

## 13. DRF serializer qoidalari

AI agent serializer yozayotganda quyidagilarni inobatga olishi kerak:

### ProfileSerializer
- owner ni request user’dan avtomatik olsin;
- linked_user optional bo‘lsin;
- username unique yoki owner doirasida unique bo‘lishi bo‘yicha aniq qoida qo‘yilsin;
- `is_self_profile=True` bo‘lsa, owner ga tegishli bitta self profile bo‘lishi kerak.

### PreferenceEntrySerializer
- `created_by` request user’dan avtomatik olinsin;
- `profile` faqat request user’ga tegishli profile bo‘lishi kerak;
- `level` valid range’da bo‘lishi kerak, masalan 1..5;
- `sentiment` faqat allowed values’dan bo‘lsin;
- image bo‘lmasa default image set qilinsin.

---

## 14. Permission qoidalari

Bu bo‘lim juda muhim. Aks holda odamlar boshqalarning ma’lumotini ko‘rib yuboradi.

Asosiy qoidalar:
- foydalanuvchi faqat o‘zi yaratgan profillarni ko‘ra oladi;
- foydalanuvchi faqat o‘z profillariga preference qo‘sha oladi;
- foydalanuvchi faqat o‘ziga tegishli preference yozuvlarini tahrirlay oladi;
- admin barcha ma’lumotga kira oladi;
- agar public profile mexanizmi ishlatilsa, faqat ruxsat etilgan qismlar ko‘rinadi.

MVP uchun oddiy va xavfsiz yondashuv:
- barcha profile va preference yozuvlari default holatda private bo‘lsin;
- username qidiruvi orqali topilgan profile haqida faqat bazaviy karta ko‘rsatilsin;
- full preference ro‘yxati faqat owner yoki ruxsatga ega user uchun ko‘rinsin.

---

## 15. Telegram bot ishlash logikasi

Telegram bot foydalanuvchini step-by-step flow bilan olib borishi kerak. Aiogram FSM ishlatish tavsiya etiladi.

### 15.1. Asosiy komandalar
- `/start` — botni ishga tushirish
- `/profiles` — barcha profillar ro‘yxati
- `/add_profile` — yangi profil qo‘shish
- `/search_profile` — username orqali qidirish
- `/view_profile` — profilni ko‘rish
- `/add_preference` — profilga preference qo‘shish
- `/list_preferences` — profil preference’larini ko‘rish
- `/stats` — statistika
- `/me` — o‘z profiling

### 15.2. Profil qo‘shish flow’i
1. User `/add_profile` yuboradi.
2. Bot username so‘raydi.
3. User username kiritadi.
4. Bot backend’dan qidiradi.
5. Topilsa, profil kartasi ko‘rsatadi va “shu profilni qo‘shish” deydi.
6. Topilmasa, “yangi profil yaratamizmi?” deydi.
7. Full name va relation so‘raladi.
8. Profil yaratiladi.

### 15.3. Preference qo‘shish flow’i
1. User profil tanlaydi.
2. Bot kategoriya tanlashni so‘raydi.
3. Bot item nomini so‘raydi.
4. Bot sentiment tanlatadi: yoqadi / o‘rtacha / yoqmaydi.
5. Bot level tanlatadi: 1..5.
6. Bot rasm yuborishni taklif qiladi yoki skip qiladi.
7. Bot note so‘raydi yoki skip qiladi.
8. Backend’ga so‘rov yuboriladi.
9. Natija karta ko‘rinishida qaytariladi.

### 15.4. Telegram media handling
- foydalanuvchi Telegram orqali photo yuborsa, bot uni yuklab backend’ga uzatadi;
- foydalanuvchi skip qilsa, backend default image biriktiradi.

---

## 16. Web UI ishlash logikasi

Web UI foydalanuvchi uchun ancha qulay boshqaruv paneli bo‘ladi. MVP uchun quyidagi sahifalar yetarli:

- Login / Register
- Dashboard
- Profiles list
- Create profile page
- Profile detail page
- Add preference form
- Preference edit page
- Statistics page
- Search page

### 16.1. Profiles list sahifasi
Bu sahifada owner user’ning barcha profillari chiqadi:
- avatar
- full name
- username
- relation
- nechta preference borligi
- like/dislike soni

### 16.2. Profile detail sahifasi
Bu sahifada tanlangan odamning to‘liq preference’lari chiqadi:
- yoqadigan narsalar
- yoqmaydigan narsalar
- kategoriya bo‘yicha ajratish
- level badge yoki star ko‘rinishida ko‘rsatish
- qidiruv va filter

### 16.3. Add preference form
Form quyidagilarni o‘z ichiga oladi:
- profile
- category
- title
- description
- sentiment
- level
- image upload
- note

Agar image qo‘shilmasa, form submit bo‘lgandan keyin default image ishlatiladi.

---

## 17. Tavsiya etiladigan URL tuzilmasi

### Web UI URL’lar
- `/`
- `/login/`
- `/register/`
- `/dashboard/`
- `/profiles/`
- `/profiles/create/`
- `/profiles/<id>/`
- `/profiles/<id>/edit/`
- `/profiles/search/`
- `/preferences/create/`
- `/preferences/<id>/edit/`
- `/stats/`

### API URL’lar
- `/api/auth/...`
- `/api/profiles/...`
- `/api/categories/...`
- `/api/preferences/...`
- `/api/stats/...`

---

## 18. Admin panel

Django admin quyidagilarni boshqarishi kerak:
- users
- profiles
- categories
- preference entries
- logs

Admin’da foydali list display maydonlari:

### ProfileAdmin
- id
- full_name
- username
- owner
- relation
- is_self_profile
- created_at

### PreferenceEntryAdmin
- id
- profile
- category
- title
- sentiment
- level
- created_by
- created_at

Admin filterlar:
- relation
- sentiment
- category
- created_at

Search fields:
- profile__full_name
- profile__username
- title
- note

---

## 19. Tavsiya etiladigan papkalar tuzilmasi

```text
likeornot/
├── backend/
│   ├── manage.py
│   ├── config/
│   ├── apps/
│   │   ├── users/
│   │   ├── profiles/
│   │   ├── categories/
│   │   ├── preferences/
│   │   ├── mediafiles/
│   │   ├── api/
│   │   └── common/
│   ├── templates/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── profiles/
│   │   └── preferences/
│   ├── static/
│   ├── media/
│   │   └── defaults/
│   │       └── preference-default.png
│   └── db.sqlite3
│
├── bot/
│   ├── main.py
│   ├── handlers/
│   ├── keyboards/
│   ├── services/
│   ├── states/
│   └── utils/
│
├── docs/
│   └── architecture.md
│
├── .env
├── requirements.txt
└── README.md
```

---

## 20. Ishlash oqimlari

### 20.1. Username orqali profil qo‘shish
1. Foydalanuvchi bot yoki Web UI’da username kiritadi.
2. Frontend `GET /api/profiles/search/?username=...` so‘rov yuboradi.
3. Backend qidiradi.
4. Agar topilsa, response’da profil preview qaytadi.
5. User “qo‘shish” tugmasini bosadi.
6. `POST /api/profiles/create-from-username/` yuboriladi.
7. Owner bilan profil bog‘lanadi.

### 20.2. Yangi local profile yaratish
1. User username kiritadi.
2. Qidiruv natija bermaydi.
3. Tizim full name va relation so‘raydi.
4. `POST /api/profiles/` yuboriladi.
5. Profil yaratiladi.

### 20.3. Preference qo‘shish
1. User profilni ochadi.
2. Add preference tugmasini bosadi.
3. Kategoriya, nom, sentiment, level, image va note kiritadi.
4. `POST /api/preferences/` yuboriladi.
5. Backend validatsiya qiladi.
6. Agar image yo‘q bo‘lsa default image set qiladi.
7. Yozuv saqlanadi va response qaytadi.

### 20.4. Profil detail ko‘rish
1. User profilga kiradi.
2. `GET /api/profiles/<id>/` va `GET /api/preferences/?profile=<id>` so‘rovlari ketadi.
3. Backend shu profilga tegishli preference’larni qaytaradi.
4. Frontend like/dislike bo‘limlariga ajratib ko‘rsatadi.

---

## 21. AI Agent uchun aniq implementatsiya ko‘rsatmalari

Quyidagi talablar kod yozishda majburiy deb olinishi kerak:

1. Loyiha Django + DRF + SQLite asosida yozilsin.
2. Telegram bot Aiogram asosida alohida service ko‘rinishida yozilsin.
3. Web UI Django Templates + Tailwind CSS asosida yozilsin.
4. Custom User model ishlatish tavsiya etiladi.
5. `Profile` modeli owner user’ga bog‘lansin.
6. `PreferenceEntry` modeli `Profile` ga bog‘lansin.
7. `PreferenceEntry.image` optional bo‘lsin.
8. Image yuklanmasa default image avtomatik ishlasin.
9. `level` 1 dan 5 gacha bo‘lsin.
10. `sentiment` qiymatlari `like`, `neutral`, `dislike` bo‘lsin.
11. Har bir user faqat o‘z profillari va o‘z preference yozuvlarini boshqara olsin.
12. Username bo‘yicha qidiruv endpoint bo‘lsin.
13. Profil detail sahifasi va profil preference ro‘yxati bo‘lsin.
14. Telegram botda profile qo‘shish va preference qo‘shish step-by-step flow yozilsin.
15. API serializer, service va permission qatlamlari alohida va toza yozilsin.
16. Kod keyinchalik PostgreSQL ga o‘tishga tayyor bo‘lsin.

---

## 22. Kelajakdagi kengaytirish imkoniyatlari

Bu loyiha keyinchalik juda qiziq productga aylanishi mumkin. Masalan:
- birthday gift recommendation;
- “kim nimani yaxshi ko‘radi” bo‘yicha smart search;
- AI tavsiya tizimi;
- public profile share;
- tag va label sistemi;
- category bo‘yicha custom default image;
- reminder: “onangiz gullarni yaxshi ko‘radi” kabi eslatmalar;
- relationship analytics;
- export/import funksiyasi.

Shu sababli arxitektura boshidan tartibli yozilishi kerak. Betartib yozilgan MVP keyin qo‘lni kuydiradi.

---

## 23. Yakuniy tavsiya

LikeOrNot uchun yangilangan eng maqbul arxitektura quyidagicha bo‘ladi: markazda Django Rest Framework asosidagi backend turadi, ma’lumotlar SQLite bazada saqlanadi, Telegram bot va Web UI esa bir xil API bilan ishlaydi. Tizimning markaziy modeli `Profile` bo‘ladi, preference yozuvlari esa aynan shu profilga bog‘lanadi. Bu yondashuv foydalanuvchiga o‘zining ham, boshqa yaqinlarining ham didini saqlash imkonini beradi.

Amaliy jihatdan eng yaxshi start variant:
- Backend: Django + DRF
- Database: SQLite
- Web UI: Django Templates + Tailwind CSS
- Bot: Aiogram
- Auth: Session yoki JWT
- Media: ImageField + default image
- Admin: Django Admin

Bu arxitektura bilan loyiha tez ishga tushadi, kod bazasi nazoratda bo‘ladi va keyinchalik recommendation engine, AI analiz yoki katta product darajasiga olib chiqish osonlashadi.

---

## 24. Qisqa xulosa

Endi loyiha oddiy like/dislike tizimidan chiqib, “insonlar va ularning didi” ni boshqaruvchi platformaga aylanadi. Foydalanuvchi boshqa insonlarning profilini qo‘sha oladi, username orqali topa oladi, ularning yoqtirish va yoqtirmasliklarini daraja bilan saqlay oladi, rasm qo‘sha oladi yoki default image’dan foydalanadi. Shu struktura Telegram bot va Web UI bilan birga ishlasa, juda qulay va kengaytiriladigan MVP hosil bo‘ladi.
