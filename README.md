# Jasorat yoki Haqiqat 🎮
React + Vite + DaisyUI frontend, Express + Socket.IO backend, PostgreSQL results.

## Ishga tushirish
Node.js 22 yoki yuqori kerak.

```bash
npm install
cp .env.example .env
npm run dev
```
Brauzer: http://localhost:5173. Bir xil tarmoqdagi telefonlarda kompyuterning lokal IP manzili va 5173 portini oching. Har bir o‘yinchi alohida qurilma yoki brauzer sessiyasidan kiradi.

## Ishlash tartibi
1. Ism va Male (O‘g‘il bola) / Female (Qiz bola) tanlovini kiriting va xona yarating.
2. Olti belgili xona kodini do‘stlaringizga bering (2–12 kishi).
3. Xona egasi boshlaydi. Navbatdagi o‘yinchi tur tanlaydi.
4. Haqiqat uchun 60 soniya, jasorat uchun 180 soniya ichida «Bajardim» 10 ball beradi; «O‘tkazish» ball bermaydi. Vaqt tugasa navbat avtomatik almashadi.
5. Xona egasi o‘yinni yakunlaydi; natija PostgreSQL sozlangan bo‘lsa bazaga yoziladi.

Topshiriqlar takrorlanmasdan tanlanadi. Xona egasi o‘z topshiriqlarini qo‘sha oladi. Sahifa yangilanganda sessionStorage tokeni bilan qayta ulaniladi. Aloqa uzilgan o‘yinchining navbati o‘tkaziladi; egasi uzilsa boshqaruv boshqa ulangan o‘yinchiga beriladi. Ball o‘yinchining o‘zi tasdiqlashi asosida beriladi.

## PostgreSQL
`.env` dagi `DATABASE_URL` ni PostgreSQL manziliga sozlang. Server `game_results` jadvalini avtomatik yaratadi. Ulanish muvaffaqiyatsiz bo‘lsa server ishga tushmaydi. SSL talab qiluvchi bazalarda provayder bergan ulanish parametrlaridan foydalaning; sertifikat tekshiruvini o‘chirmang.

Xonalar va joriy o‘yin operativ xotirada: server qayta ishga tushsa yo‘qoladi. Bazada yakunlangan o‘yin natijalari saqlanadi. Bir soat foydalanilmagan bo‘sh xonalar tozalanadi. Hozirgi versiya bitta server jarayoni uchun; bir nechta replica uchun umumiy xona ombori va Socket.IO adapter kerak.

## Production
```bash
npm ci
npm run build
npm start
```
Bitta Node server frontend va Socket.IO ni bir manzilda taqdim etadi. Platformada build: `npm ci && npm run build`; start: `npm start`; health: `/api/health`. HTTPS va WebSocket qo‘llaydigan Node hosting kerak. Frontendni Vercelga alohida qo‘ysangiz, backendni doimiy Node hostingga joylang, frontenddagi `VITE_SERVER_URL` va backenddagi `CLIENT_ORIGIN` ni moslang. Vite o‘zgaruvchilari build vaqtida o‘qiladi.

## Tekshiruv
```bash
npm test
npm run build
```
GitHubga kod yuklashning o‘zi jonli sayt yaratmaydi. `.env`, parollar va node_modules gitga qo‘shilmaydi.

Jasorat: 8 ta umumiy, har bir tanlov uchun 12 tadan alohida shart. Ochiq joydagi muloqot faqat rozilik bilan; topshiriqni o‘tkazish doim mumkin.

## Admin panel va uslubni o‘zgartirish
`/admin` sahifasi — faqat admin paroli bilan kiriladi. `.env` da `ADMIN_PASSWORD` (kamida 12 belgi) va uzun tasodifiy `ADMIN_SECRET` belgilang. Haqiqiy parollarni GitHubga yuklamang. Birinchi kirishdan keyin panelda parolni o‘zgartirish mumkin. Admin sessiya 8 soat; parol o‘zgarsa eski sessiyalar bekor bo‘ladi.

Paneldan:
- sayt nomi va bosh sarlavhalar;
- fon, karta, matn va tugma ranglari, shrift o‘lchami va burchaklar;
- haqiqat/jasorat vaqti va ball;
- haqiqat, umumiy jasorat, male va female shartlarini qo‘shish/tahrirlash/o‘chirish;
- JSON eksport/import va admin parolini almashtirish.

«Saqlash» bosilganda dizayn ulangan o‘yinchilarga darhol yuboriladi. Vaqt, ball va matnlar keyingi shartga qo‘llanadi. Joriy topshiriq o‘z vaqti va ballini saqlaydi. JSON import hali saqlash emas — uni ko‘rib Saqlashni bosing.

Server sozlamalari `DATA_DIR` ichida `settings.json`, parol xeshi `admin.json` faylida turadi. Lokal standart `./data`. Hostingda doimiy volume `/data` va `DATA_DIR=/data` kerak; aks holda qayta deployda sozlamalar yo‘qoladi. Saqlash atomik, versiya tekshiruvi bilan. O‘yin xonalari bundan alohida, hali ham operativ xotirada.

### VS Code bilan kodni o‘zgartirish
1. ZIPni oching va papkani VS Code’da oching.
2. Terminalda `npm install`, so‘ng `.env.example` dan `.env` yarating va admin parolini belgilang.
3. `npm run dev` bilan http://localhost:5173 ni oching; admin: http://localhost:5173/admin.
4. `client/src/style.css` — uslub; `client/src/main.jsx` — o‘yin; `client/src/Admin.jsx` — boshqaruv paneli; `server/prompts.js` — boshlang‘ich shartlar.
5. `npm test` va `npm run build` bilan tekshiring. GitHub `main` ga yuklang, keyin hostingning yangi commitni joylashtirganini tekshiring.

Panelda saqlangan sozlamalar boshlang‘ich ranglar va shartlardan ustun turadi. Boshlang‘ich kodni o‘zgartirgandan keyin kerak bo‘lsa paneldagi qiymatlarni ham yangilang.

### Tasodifiy navbat
Birinchi va keyingi o‘yinchini server kriptografik random orqali tanlaydi. Bir davrada har bir onlayn o‘yinchi bir martadan tanlanadi. Yangi davra boshida oldingi o‘yinchi darhol takrorlanmaydi (kamida ikki onlayn o‘yinchi bo‘lsa). Ulanmaganlar navbatga kirmaydi. Bajarish, o‘tkazish va vaqt tugashi bir xil random navbat qoidasidan foydalanadi.
