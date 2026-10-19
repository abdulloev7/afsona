#!/usr/bin/env python3
"""Сборка каталога для бота @afsonatj_bot из Afsona.xlsx и фото товаров.

Пишет api/_bot-catalog.js и public/bot/img/*.jpg (1080x1080, фирменный фон).
Описания берутся только из названий в Afsona.xlsx: никаких цен, свойств и обещаний.
Проверяет, что каждая позиция xlsx попала в каталог или явно пропущена (SKIP).
"""
import json, os, re, sys
import openpyxl
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))  # корень репозитория сайта
SRC = os.environ.get("AFSONA_SRC", "/mnt/project-files/afsona/Ассортимент Афсона")
XLSX = os.path.join(SRC, "Afsona.xlsx")
EMBLEM = os.path.join(HERE, "emblem.png")
OUT_IMG = os.path.join(ROOT, "public", "bot", "img")
OUT_JS = os.path.join(ROOT, "api", "_bot-catalog.js")

GREEN, CREAM, GOLD = (29, 107, 80), (255, 251, 231), (224, 189, 107)
F_BLACK = "/usr/share/fonts/opentype/inter/InterDisplay-Black.otf"
F_SEMI = "/usr/share/fonts/opentype/inter/InterDisplay-SemiBold.otf"

# Позиции xlsx без понятного названия: в каталог не идут.
SKIP = {"5584110"}

# id, название, бренд, фото (путь от SRC или None), что это (из названия), [(фасовка/вариант, регэксп по xlsx)]
CATS = [
 ("paint", "🎨 Краски", [
  ("r210", "Краска моющаяся «Радуга-210»", "Радуга", "Краски/Краска моющаяся Радуга-210 акриловая.webp",
   "Моющаяся акриловая краска.",
   [("7 кг", r'Радуга-210" акриловая 7 кг'), ("14 кг", r'Радуга-210" акриловая 14 кг'), ("24 кг", r'Радуга-210" акриловая 24 кг')]),
  ("r210c", "Краска моющаяся «Радуга-210», база «С»", "Радуга", "Краски/краска 210.jpg",
   "Моющаяся акриловая краска на базе «С» для колеровки.",
   [("1 кг", r'база "С" 1 кг'), ("5 кг", r'база "С" 5 кг'), ("10 кг", r'база "С" 10 кг')]),
  ("komfort", "Краска «Комфорт»", "", "Краски/Краска Комфорт.webp",
   "Краска «Комфорт».",
   [(s, r'Краска "Комфорт" ' + re.escape(s)) for s in ["1,3 кг", "3,5 кг", "7 кг", "10 кг", "14 кг", "24 кг"]]),
  ("alantex", "Краска Alantex Interior washing", "Alantex", "Краски/Краска Alantex Interior washing.png",
   "Интерьерная моющаяся краска Alantex.",
   [("14 кг", r'Alantex Interior washing 14кг')]),
  ("fasad", "Краска «Фасадная» акриловая", "", "Краски/Краска Фасадная акриловая.webp",
   "Акриловая краска для фасадов.",
   [(s, r'"Фасадная" акриловая ' + s) for s in ["7 кг", "14 кг", "24 кг"]]),
  ("extra", "Краска «Extra» «Радуга-114»", "Радуга", None,
   "Акриловая краска для фасадов и интерьеров.",
   [("0,9 л", r'Р-114 Extra 0,9л'), ("9 л", r'"Радуга-114" акриловая 9 л')]),
  ("ecolux", "Эмаль «Eco-lux» «Радуга-113»", "Радуга", None,
   "Акриловая эмаль для интерьеров и фасадов.",
   [("9 л", r'Eco-lux')]),
  ("green", "Краска GREEN", "GREEN", None,
   "Краска GREEN в белом (white 1010) и цвете topas 1036.",
   [("white, 0,7 л", r'^Краска GREEN white 0,7л'), ("white 1010, 3,18 л", r'GREEN \(white 1010\) 3,18'),
    ("white 1010, 4 л", r'^Краска GREEN \(white 1010\) 4л'), ("topas 1036, 0,7 л", r'topas 1036\) 0,7'),
    ("topas 1036, 3,18 л", r'topas 1036\) 3,18')]),
  ("greensuper", "Краска GREEN SUPER", "GREEN", None,
   "Краска GREEN SUPER.",
   [("0,7 л", r'GREEN SUPER 0,7'), ("white 1010, 4 л", r'GREEN SUPER \(white 1010\) 4л')]),
  ("greenfloor", "Краска GREEN половая", "GREEN", None,
   "Краска для пола.",
   [("0,7 л", r'GREEN половая 0,7')]),
  ("asia", "Краска ASIA Hammer", "ASIA", None,
   "Краска ASIA Hammer, три оттенка по номеру.",
   [(n, r'Asia Hammer ' + n) for n in ["416", "422", "468"]]),
 ]),
 ("lak", "✨ Лаки и эмали", [
  ("r129", "Лак для дерева матовый «Радуга-129»", "Радуга", "Краски/Лак для дерева матовый Радуга-129 акриловый.webp",
   "Матовый акриловый лак для дерева, для наружных и внутренних работ.",
   [("3 кг", r'Радуга-129')]),
  ("r231", "Лак «Воск» «Радуга-231»", "Радуга", None,
   "Лак-воск для декоративных покрытий.",
   [("1 кг", r'Радуга-231')]),
  ("r117", "Эмаль «Gold» «Радуга-117»", "Радуга", "Краски/Эмаль Gold декоративная Радуга-117 перламутровая.webp",
   "Декоративная перламутровая лессирующая эмаль.",
   [("0,1 л", r'Радуга-117.* 0,1 л'), ("0,3 л", r'Радуга-117.* 0,3 л')]),
 ]),
 ("grunt", "🧱 Грунтовки", [
  ("r26", "Грунтовка укрепляющая «Радуга-26»", "Радуга", "грунтовки/Грунтовка укрепляющая Радуга-26 акриловая.webp",
   "Укрепляющая акриловая грунтовка.",
   [("5 л", r'Радуга-26" акриловая 5 л'), ("10 л", r'Радуга-26" акриловая 10 л')]),
  ("alprimer", "Грунтовка Alantex Primer", "Alantex", None,
   "Грунтовка Alantex.",
   [("5 л", r'Alantex Primer 5 л'), ("10 л", r'Alantex Primer 10л')]),
  ("r019", "PRIMER грунтовка-концентрат «Радуга-019»", "Радуга", "грунтовки/PRIMER грунтовка концентрат Радуга-019 акриловая.webp",
   "Акриловая грунтовка-концентрат.",
   [("1 л", r'Радуга-019')]),
  ("r30", "Кварц-грунт «Бетон-контакт» «Радуга-30»", "Радуга", "грунтовки/-30-КВАРЦ-ГРУНТ-бетон-контакт.webp",
   "Акриловый кварцевый грунт «Бетон-контакт».",
   [(s, r'Радуга-30" акриловый ' + re.escape(s)) for s in ["3,5 кг", "7 кг", "15 кг"]]),
  ("smquarzo", "Грунт кварцевый San Marito Quarzo primer", "San Marito", "грунтовки/Грунт кварцевый San Marito Quarzo primer.jpg",
   "Кварцевый грунт San Marito.",
   [("15 кг", r'Quarzo primer')]),
 ]),
 ("shpat", "🪣 Шпатлёвки", [
  ("vinyl", "Шпатлёвка финишная «Vinyl Finish»", "", "шпатлевка/Шпатлевка на виниловой основе Vinyl Finish финишная.png",
   "Финишная шпатлёвка на виниловой основе.",
   [("14 кг", r'Vinyl Finish" финишная 14'), ("24 кг", r'Vinyl Finish" финишная 24')]),
  ("r0023", "Шпатлёвка для дерева «Радуга-0023»", "Радуга", "шпатлевка/Шпатлевка для деревянных изделий Радуга-0023 акриловая, цвет белый.webp",
   "Акриловая шпатлёвка для деревянных изделий.",
   [("белая, 0,85 кг", r'0023" акриловая, цвет белый'), ("сосна, 0,85 кг", r'0023" акриловая, цвет сосна')]),
 ]),
 ("decor", "🖌 Декоративные покрытия", [
  ("r37", "Штукатурка декоративная «Veneziano» «Радуга-37»", "Радуга", "декоративные покрытия/VENEZIANO-Радуга-37.webp",
   "Декоративная штукатурка «Veneziano».",
   [("5 кг", r'Радуга-37')]),
  ("r38", "Штукатурка декоративная «Travertino» «Радуга-38»", "Радуга", None,
   "Декоративная штукатурка «Travertino».",
   [("25 кг", r'Радуга-38')]),
  ("r36", "Штукатурка декоративная «Picasso» «Радуга-36»", "Радуга", None,
   "Декоративная штукатурка «Picasso».",
   [("15 кг", r'Радуга-36" 15'), ("25 кг", r'Радуга-36" 25')]),
  ("smbianco", "San Marito Ottocento Bianco", "San Marito", "декоративные покрытия/Краска декоративная с эффектом белого шелка San Marito Ottocenture Bianco.jpg",
   "Декоративная краска с эффектом белого шёлка.",
   [("5 кг", r'Ottocenture Bianco')]),
  ("smmetal", "San Marito Sahara Metallico", "San Marito", "декоративные покрытия/Краска декоративная с эффектом искрящегося песка San Marito Sahara Metallico.jpg",
   "Декоративная краска с эффектом искрящегося песка.",
   [("5 кг", r'Sahara Metallico')]),
  ("smargento", "San Marito Sahara Perfetto Argento", "San Marito", "декоративные покрытия/Краска декоративная с эффектом светоотражающего песка San Marito Sahara Perfetto Argent.jpg",
   "Декоративная краска с эффектом светоотражающего песка.",
   [("5 кг", r'Perfetto Argento')]),
  ("smbetono", "Штукатурка San Marito Arte-Betono", "San Marito", "декоративные покрытия/Штукатурка декоративная San Marito Arte-Betono.jpg",
   "Декоративная штукатурка.",
   [("15 кг", r'Arte-Betono')]),
  ("smmarmo", "Штукатурка San Marito Marmo Veneziano", "San Marito", "декоративные покрытия/Штукатурка декоративная San Marito Marmo Veneziano.jpg",
   "Декоративная штукатурка.",
   [("5 кг", r'Marmo Veneziano')]),
  ("smforte", "Лак-воск San Marito Veneziano Forte", "San Marito", "декоративные покрытия/Лак-воск для декоративных покрытий San Marito Veneziano Forte.jpg",
   "Лак-воск для декоративных покрытий.",
   [("0,3 кг", r'Veneziano Forte')]),
 ]),
 ("gidro", "💧 Гидроизоляция", [
  ("aquablock", "Мастика гидроизоляционная «Aquablock» «Радуга-021»", "Радуга", "гидроизоляция/Мастика гидроизоляционная Aquablock Радуга021.webp",
   "Гидроизоляционная мастика.",
   [(s, r'Радуга-021" ' + s) for s in ["3 кг", "7 кг", "14 кг"]]),
 ]),
 ("klei", "🧴 Клеи, герметики, пена", [
  ("montage", "Жидкие гвозди Soudal Montage 125", "Soudal", "клеи/Жидкие гвозди SOUDAL MONTAGE 125.webp",
   "Жидкие гвозди.",
   [("310 мл", r'MONTAGE 125')]),
  ("fixall", "Soudal Fix All High Tack", "Soudal", "клеи/SOUDAL FIX ALL HIGH TACK WHITE.jpg",
   "Клей-герметик, белый.",
   [("290 мл", r'FIX ALL HIGH TACK')]),
  ("mitre", "Двухкомпонентный клей Soudal Mitre Kit", "Soudal", "клеи/2 компонентный клей SOUDAL MITRE KIT.jpg",
   "Двухкомпонентный клей.",
   [("стандарт, 200 мл + 50 г", r'MITRE KIT 200'), ("большой, 400 мл + 100 г", r'MITRE KIT 400')]),
  ("acryrub", "Акриловый герметик Soudal Acryrub", "Soudal", "клеи/Акриловый герметик SOUDAL ACRYRUB.jfif",
   "Акриловый герметик, 500 г, пять цветов.",
   [(c, r'Акриловый герметик ' + c) for c in ["белый", "серый", "бежевый", "коричневый", "черный"]]),
  ("silu", "Силикон прозрачный Soudal Silicone U", "Soudal", "клеи/Силикон прозрачный SOUDAL SILICONE U.webp",
   "Прозрачный силиконовый герметик.",
   [("280 г", r'SILICONE U')]),
  ("silaq", "Силикон для аквариумов Soudal Silirub AQ", "Soudal", "клеи/Силикон прозрачный аквариум SOUDAL SILIRUB AQ.webp",
   "Прозрачный силикон для аквариумов.",
   [("300 мл", r'SILIRUB AQ')]),
  ("foamcomfort", "Пена Soudal Soudafoam Comfort (Genius Gun)", "Soudal", "клеи/Пена Genius Gun SOUDAL SOUDAFOAM COMFORT.webp",
   "Монтажная пена с аппликатором Genius Gun.",
   [("750 мл", r'SOUDAFOAM COMFORT')]),
  ("foam", "Монтажная пена Soudal Soudafoam", "Soudal", None,
   "Монтажная пена: простая (1K PU) и профессиональная (PU).",
   [("простая 1K PU, 750 мл", r'SOUDAFOAM 1K PU'), ("профессиональная PU, 750 мл", r'Пена профессиональная')]),
  ("soudabond", "Пена-клей Soudal Soudabond Easy Gun", "Soudal", "клеи/Пена-клей SOUDAL SOUDABOND EASY GUN.jpg",
   "Пена-клей.",
   [("750 мл", r'SOUDABOND EASY GUN')]),
  ("pva", "Клей ПВА", "", None,
   "Клей ПВА.",
   [("«Панда»", r'ПВА Панда'), ("«801»", r'ПВА 801')]),
 ]),
 ("koler", "🌈 Колеры и разбавители", [
  ("kolery", "Колеры (16 оттенков)", "", "колеры/1301 RT Колер.png",
   "Колеры для тонировки, 16 оттенков по коду. Тонируем на колеровочной машине в магазине.",
   [(c, re.escape(c) + r' Колер') for c in ["1301 RT", "1302 FT", "1303 HS", "1304 KS", "1305 LS", "1306 LT", "1307 MS", "1308 TT",
                                         "1309 MT", "1310 PT", "1311 RS", "1312 ST", "1313 US", "1314 VT", "1315 ZT", "1316 XT"]]),
  ("razbav", "Разбавители", "", None,
   "Разбавители.",
   [("Uzcolor", r'Разбавитель Uzcolor'), ("Tekman", r'Разбавитель Tekman')]),
 ]),
 ("tools", "🧰 Инструменты", [
  ("valik", "Валики DECOR", "DECOR", None,
   "Валики для водных красок, лаков, эмалей и шпатлёвки, разной ширины.",
   [("для водных красок, ровные поверхности 60", r'^9055060'), ("для водных красок, ровные поверхности 100", r'^9076110'),
    ("для лака, ровные поверхности 60", r'^9033060'), ("для лака, ровные поверхности 60×2", r'^5564055'),
    ("для лака, ровные поверхности 100", r'^9073110'), ("для лака, ровные поверхности 100×2", r'^5564110'),
    ("для лака, ровные поверхности 150", r'^9033150'), ("для лака, ровные поверхности 180", r'^4805180'),
    ("для эмалей, шероховатые поверхности 100", r'^9072110'), ("для эмалей, шероховатые поверхности 150", r'^9044150'),
    ("для эмалей, шероховатые поверхности 240", r'^4803240'), ("для нанесения шпатлёвки", r'^5509180')]),
  ("kist", "Кисти DECOR", "DECOR", None,
   "Кисти: универсальные, для грунта, для декоративных работ.",
   [("Black White универсальная 75", r'^880075'), ("Black White универсальная 100", r'^880100'),
    ("Profi для грунта 35", r'^780035'), ("Profi для грунта 50", r'^780050'), ("Profi для грунта 65", r'^780065'),
    ("Profi для грунта 75", r'^780075'), ("Profi для грунта 100", r'^780100'),
    ("для декоративных работ 75", r'^890075'), ("для декоративных работ 100 (белая)", r'^890100'),
    ("для декоративных работ 100 (серая)", r'^990100'),
    ("«Вторник»", r'^126015'), ("«Среда»", r'^126025'), ("«Четверг»", r'^126035'), ("«Пятница»", r'^126045')]),
  ("shpatel", "Шпатели и кельмы DECOR", "DECOR", None,
   "Шпатели разной ширины, фасадный шпатель, правило и кельмы.",
   [("шпатель 40", r'^3160040'), ("шпатель 60", r'^3110060'), ("шпатель 100", r'^3110100'), ("шпатель 300", r'^3110300'),
    ("шпатель фасадный", r'^3170250'), ("шпатель-правило", r'^2600600'),
    ("кельма угловая", r'^640222'), ("мини-кельма круглая", r'^640100'), ("мини-кельма овальная малая", r'^640116')]),
  ("mixer", "Миксеры для краски DECOR", "DECOR", None,
   "Насадки-миксеры для размешивания краски.",
   [("миксер для краски", r'^999090'), ("миксер", r'^999120')]),
 ]),
]


def font(path, size):
    return ImageFont.truetype(path, size)


def wrap(draw, text, fnt, width):
    lines, cur = [], ""
    for w in text.split():
        t = (cur + " " + w).strip()
        if draw.textlength(t, font=fnt) <= width:
            cur = t
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def emblem(size):
    e = Image.open(EMBLEM).convert("RGBA")
    e.thumbnail((size, size))
    return e


def photo_card(src, dst):
    """Фото товара по центру на кремовом фоне, эмблема в углу."""
    im = Image.open(src)
    if im.mode in ("P", "LA", "L"):
        im = im.convert("RGBA")
    bg = Image.new("RGB", (1080, 1080), (255, 255, 255))
    im.thumbnail((900, 900), Image.LANCZOS)
    if max(im.size) < 820:  # маленькие фото увеличиваем
        k = 820 / max(im.size)
        im = im.resize((int(im.width * k), int(im.height * k)), Image.LANCZOS)
    if im.mode == "RGBA":
        bg.paste(im, ((1080 - im.width) // 2, (1080 - im.height) // 2), im)
    else:
        bg.paste(im, ((1080 - im.width) // 2, (1080 - im.height) // 2))
    d = ImageDraw.Draw(bg)
    d.rectangle([0, 1040, 1080, 1080], fill=GREEN)
    e = emblem(110)
    bg.paste(e, (1080 - e.width - 30, 30), e)
    bg.save(dst, "JPEG", quality=86)


def text_card(title, sub, dst):
    """Карточка без фото: зелёный фон, название, золотая линия."""
    bg = Image.new("RGB", (1080, 1080), GREEN)
    d = ImageDraw.Draw(bg)
    d.ellipse([400, 110, 680, 390], fill=CREAM)
    e = emblem(220)
    bg.paste(e, ((1080 - e.width) // 2, 250 - e.height // 2), e)
    f = font(F_BLACK, 76)
    lines = wrap(d, title.upper(), f, 900)
    while len(lines) > 4:
        f = font(F_BLACK, f.size - 6)
        lines = wrap(d, title.upper(), f, 900)
    y = 440
    for ln in lines:
        d.text((540, y), ln, font=f, fill=CREAM, anchor="ma")
        y += int(f.size * 1.12)
    d.rectangle([440, y + 30, 640, y + 38], fill=GOLD)
    fs = font(F_SEMI, 40)
    y += 80
    for ln in wrap(d, sub, fs, 860)[:3]:
        d.text((540, y), ln, font=fs, fill=GOLD, anchor="ma")
        y += 52
    bg.save(dst, "JPEG", quality=88)


def main():
    ws = openpyxl.load_workbook(XLSX).active
    names = []
    for r in ws.iter_rows(min_row=2, values_only=True):
        if r[4]:
            names.append(str(r[4]).strip())
    used = {}
    os.makedirs(OUT_IMG, exist_ok=True)
    cats = []
    for cid, ctitle, items in CATS:
        prods = []
        for pid, title, brand, photo, what, variants in items:
            vs = []
            for label, rx in variants:
                hits = [n for n in names if re.search(rx, n)]
                if len(hits) != 1:
                    sys.exit(f"{pid}/{label}: {rx!r} нашёл {len(hits)}: {hits}")
                if hits[0] in used:
                    sys.exit(f"{hits[0]!r} уже в {used[hits[0]]}")
                used[hits[0]] = pid
                vs.append(label)
            img = f"{pid}.jpg"
            if photo:
                photo_card(os.path.join(SRC, photo), os.path.join(OUT_IMG, img))
            else:
                text_card(title, brand if brand and brand not in title else ctitle.split(" ", 1)[1], os.path.join(OUT_IMG, img))
            prods.append({"id": pid, "title": title, "brand": brand, "what": what,
                          "variants": vs, "img": img, "real_photo": bool(photo)})
        cats.append({"id": cid, "title": ctitle, "products": prods})
    left = [n for n in names if n not in used and not any(n.startswith(s) for s in SKIP)]
    if left:
        sys.exit("Не попали в каталог: " + "; ".join(left))
    with open(OUT_JS, "w") as f:
        f.write("// Сгенерировано bot/build/build.py из Afsona.xlsx. Не редактировать вручную.\nexport default ")
        f.write(json.dumps({"categories": cats}, ensure_ascii=False, indent=1) + ";\n")
    n = sum(len(c["products"]) for c in cats)
    print(f"ok: {len(cats)} категорий, {n} карточек, {len(used)} позиций xlsx, пропущено: {sorted(SKIP)}")


if __name__ == "__main__":
    main()
