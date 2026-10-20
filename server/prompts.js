export const prompts={truth:["Eng kulgili xotirang qaysi?","Qaysi iste’dodingni rivojlantirmoqchisan?","Bir kun ko‘rinmas bo‘lsang nima qilarding?","Eng katta orzuing nima?","Qaysi film qahramoni bo‘lishni xohlarding?","Bolalikdagi eng sevimli o‘yining qaysi?","Biror yangi tilni darhol bilsang, qaysini tanlarding?","Eng yaxshi odating nima?","Qaysi taomni har kuni yeyishing mumkin?","Do‘stingdagi qaysi fazilatni qadrlaysan?","Bir million kitobdan bittasini tanlasang, qaysi?","O‘zing haqingda uchta qiziq fakt ayt.","Qayerga sayohat qilishni xohlaysan?","Eng oxirgi marta nimaga rosa kulding?","Qaysi fan senga eng qiziq?"],dare:["20 soniya robotga o‘xshab gapir!","Bir hayvonni ovozsiz tasvirla.","10 soniyada beshta meva sanab ber.","O‘zing haqingda ikki qator she’r to‘qi.","Bir qo‘shiqni 15 soniya xirgoyi qil.","Ko‘zingni yumib havoda yulduz chiz.","Keyingi 20 soniya faqat qofiyali gapir.","Sport sharhlovchisidek bugungi kuningni ayt.","Bir daqiqaga yangiliklar boshlovchisi bo‘l.","Ismingni teskari aytishga urin.","Do‘stlaringga kulgili reklama namoyish et.","Uchta turli kulgi ovozini ko‘rsat.","20 soniya sekinlashtirilgan harakatda yur.","Atrofdagi buyum haqida ertak to‘qi.","Besh soniyada uchta rang ayt."]};

// All outdoor interactions are optional, brief and require consent.
const forTarget=target=>[
 `Kunduzi, xavfsiz piyodalar joyida o‘zing tengi tanish ${target}dan «Bir savol bersam maylimi?» deb so‘ra. Rozi bo‘lsa, sevimli qo‘shig‘ini so‘ra.`,
 `Tanish ${target}ga uning biror yaxshi fazilati haqida samimiy iltifot ayt.`,
 `Tanish ${target}dan roziligini olib, unga 15 soniyalik kulgili reklama namoyish qil.`,
 `Tanish ${target}ga «Kuning yaxshi o‘tsin!» deb yaxshi tilak bildir.`,
 `Tanish ${target} bilan, u rozi bo‘lsa, «tosh-qaychi-qog‘oz» o‘yna.`,
 `Tanish ${target}dan qaysi kitob yoki filmni tavsiya qilishini so‘ra. U suhbatlashishni istamasa, rahmat aytib yakunla.`,
 `Tanish ${target}ga o‘zing to‘qigan ikki qator kulgili she’rni, u tinglashga rozi bo‘lsa, aytib ber.`,
 `Tanish ${target}dan «Choymi yoki qahvami?» deb so‘ra va o‘z tanlovingni ham ayt.`,
 `Ko‘chada yoningdagi tanish ${target}ga atrofdagi uchta qiziq narsani ko‘rsat.`,
 `Tanish ${target}dan roziligini olib, biror hayvonni ovozsiz tasvirla; u topsin.`,
 `Tanish ${target}ga uning kiyimidagi rang yoki uslub haqida odobli iltifot ayt.`,
 `Tanish ${target}ni, xohlasa, davrangizdagi o‘yinga taklif qil; rad etsa qayta undama.`
];
export const genderDares={male:forTarget('qiz bola'),female:forTarget('o‘g‘il bola')};
export const commonDares=[
 'Kunduzi, xavfsiz piyodalar joyida do‘sting bilan 30 soniya robot kabi yur.',
 'Tashqarida ko‘rgan beshta rangni sanab ber; tashqariga chiqolmasang, xonadagilarni ayt.',
 'Do‘stlaring oldida 20 soniya sport sharhlovchisi kabi gapir.',
 'Rozilik bildirgan do‘sting bilan bir daqiqada kulgili sahna o‘yna.',
 'Atrofdagi oddiy bir buyumga 20 soniyalik reklama qil.',
 'O‘zingni tanishtiradigan kulgili, uch jumlalik nutq ayt.',
 'Do‘stingga uning uchta yaxshi fazilatini ayt.',
 '20 soniya qo‘shiq xirgoyi qil, boshqalar nomini topsin.'
];
