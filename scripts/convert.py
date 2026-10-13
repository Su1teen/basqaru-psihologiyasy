import os, shutil, glob, re, json, sys
import pypdf

sys.stdout.reconfigure(encoding='utf-8')

src_dir = r'c:\moms\Исходный код Басқару психологиясы\+psychology\CD_Root\AutoPlay'
out_dir = r'c:\moms\book2-basqaru-psihologiyasy'

docs_dir = os.path.join(out_dir, 'public', 'assets', 'docs')
images_dir = os.path.join(out_dir, 'public', 'assets', 'images')
audio_dir = os.path.join(out_dir, 'public', 'assets', 'audio')
data_dir = os.path.join(out_dir, 'src', 'data')

for d in [docs_dir, images_dir, audio_dir, data_dir]:
    os.makedirs(d, exist_ok=True)

# 1. Copy images
img_src_dir = os.path.join(src_dir, 'Images')
for img in os.listdir(img_src_dir):
    s = os.path.join(img_src_dir, img)
    if os.path.isfile(s):
        shutil.copy2(s, os.path.join(images_dir, img))
print(f"Copied images from {img_src_dir}")

# 2. Copy audio
snd_src_dir = os.path.join(src_dir, 'Audio')
if os.path.exists(snd_src_dir):
    for snd in os.listdir(snd_src_dir):
        s = os.path.join(snd_src_dir, snd)
        if os.path.isfile(s):
            shutil.copy2(s, os.path.join(audio_dir, snd))
    print(f"Copied audio files")

# 3. Process PDFs
pdf_src_dir = os.path.join(src_dir, 'Docs')
pdf_files = [
    {"id": "intro", "file": "kirispe.pdf", "category": "intro", "shortTitle": "Кіріспе", "title": "Кіріспе"},
    {"id": "lecture-1", "file": "1sabak.pdf", "category": "lecture", "shortTitle": "1-дәріс", "title": "І Бөлім. Басқару психологиясының теориялық-әдіснамалық негіздері. § 1 Басқару психологиясының пәні мен міндеттері"},
    {"id": "lecture-2", "file": "2sabak.pdf", "category": "lecture", "shortTitle": "2-дәріс", "title": "§ 2 Басқарудың психологиялық теориясы"},
    {"id": "lecture-3", "file": "3sabak.pdf", "category": "lecture", "shortTitle": "3-дәріс", "title": "§ 3 Басқару ғылымының даму тарихы"},
    {"id": "lecture-4", "file": "4sabak.pdf", "category": "lecture", "shortTitle": "4-дәріс", "title": "§ 4 Жеке тұлға басқарудың объектісі мен субъектісі"},
    {"id": "lecture-5", "file": "5sabak.pdf", "category": "lecture", "shortTitle": "5-дәріс", "title": "§ 5 Еңбек мотивациясы"},
    {"id": "lecture-6", "file": "6sabak.pdf", "category": "lecture", "shortTitle": "6-дәріс", "title": "ІІ Бөлім. Ұжымның әлеуметтік-психологиялық ахуалын басқару. § 6 Ұжым. Ұжымның даму деңгейлері"},
    {"id": "lecture-7", "file": "7sabak.pdf", "category": "lecture", "shortTitle": "7-дәріс", "title": "§ 7 Басқару стилі және ұжымның психологиялық ахуалына әсері"},
    {"id": "lecture-8", "file": "8sabak.pdf", "category": "lecture", "shortTitle": "8-дәріс", "title": "§ 8 Жетекшілік және көшбасшылық. Көшбасшы теориясының қағидалары"},
    {"id": "lecture-9", "file": "9sabak.pdf", "category": "lecture", "shortTitle": "9-дәріс", "title": "§ 9 Басқару шешімдерін қабылдау процесінің жалпы сипаттамасы"},
    {"id": "lecture-10", "file": "10sabak.pdf", "category": "lecture", "shortTitle": "10-дәріс", "title": "§ 10 Басқару іс-әрекетіндегі перцептивтік процестер"}
]

chapters_data = []
toc = []

for item in pdf_files:
    pdf_path = os.path.join(pdf_src_dir, item["file"])
    dst_pdf_path = os.path.join(docs_dir, item["file"])
    shutil.copy2(pdf_path, dst_pdf_path)
    
    reader = pypdf.PdfReader(pdf_path)
    num_pages = len(reader.pages)
    
    # Extract text from all pages
    pages_text = []
    full_text = ""
    for idx, page in enumerate(reader.pages):
        try:
            ptxt = page.extract_text() or ""
            pages_text.append({"page": idx + 1, "text": ptxt})
            full_text += ptxt + "\n\n"
        except Exception as e:
            pages_text.append({"page": idx + 1, "text": ""})

    # Clean text to HTML paragraphs
    paragraphs = [p.strip() for p in full_text.split('\n\n') if p.strip()]
    html_paragraphs = []
    for p in paragraphs:
        # replace newlines inside paragraph with space
        cleaned_p = re.sub(r'\s+', ' ', p).strip()
        if cleaned_p:
            if cleaned_p.startswith('§') or (len(cleaned_p) < 120 and ('бөлім' in cleaned_p.lower() or 'дәріс' in cleaned_p.lower())):
                html_paragraphs.append(f'<h3 class="chapter-subheading">{cleaned_p}</h3>')
            else:
                html_paragraphs.append(f'<p>{cleaned_p}</p>')
                
    chapter_record = {
        "id": item["id"],
        "category": item["category"],
        "shortTitle": item["shortTitle"],
        "title": item["title"],
        "pdfFile": f"./assets/docs/{item['file']}",
        "numPages": num_pages,
        "textHtml": "\n".join(html_paragraphs),
        "rawText": full_text
    }
    chapters_data.append(chapter_record)
    toc.append({
        "id": item["id"],
        "category": item["category"],
        "shortTitle": item["shortTitle"],
        "title": item["title"],
        "numPages": num_pages
    })
    print(f"Processed PDF: {item['file']} ({num_pages} pages)")

# Author bio
author_info = {
    "name": "Есенғұлова Мейрамгүл Нұралықызы",
    "title": "Педагогика ғылымдарының кандидаты, доцент",
    "photo": "./assets/images/фотфото.jpeg",
    "badgeImage": "./assets/images/авторы.png",
    "bio": (
        "Есенғұлова Мейрамгүл Нұралықызы — педагогика ғылымдарының кандидаты, доцент. "
        "Салыстырмалы Педагогика Кеңесінің мүшесі (Куәлік №0057). "
        "Қ.Жұбанов атындағы Ақтөбе өңірлік мемлекеттік университетінің «Психологиялық-педагогикалық және арнайы білім беру» "
        "кафедрасының доценті қызметін атқаруда.\n\n"
        "2015 жылы ҚР заңының 23 бабына сәйкес ғылыми-техникалық істерге байланысты аккредитациядан өтті (куәлік № 004632) "
        "және Қазақстан Республикасының рухани және әлеуметтік дамуы жолында қол жеткен табыстары және өркендеуіне қосқан "
        "зор үлесі үшін Қ.Жұбанов атындағы Ақтөбе өңірлік мемлекеттік университетіне 50 жыл мерекелік (Куәлік №077) "
        "және Халықаралық педагогика және инновациялық технологиялар ғылым академиясы №8 хаттамасының шешіміне сәйкес "
        "«Асыл ұстаз» (Куәлік № УАҰ 007) Төс белгілерімен марапатталды."
    )
}

open(os.path.join(data_dir, 'book_content.json'), 'w', encoding='utf-8').write(
    json.dumps(chapters_data, ensure_ascii=False, indent=2)
)
open(os.path.join(data_dir, 'toc.json'), 'w', encoding='utf-8').write(
    json.dumps(toc, ensure_ascii=False, indent=2)
)
open(os.path.join(data_dir, 'author.json'), 'w', encoding='utf-8').write(
    json.dumps(author_info, ensure_ascii=False, indent=2)
)

print("Book 2 content successfully processed!")
