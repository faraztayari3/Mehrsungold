# راهنمای آیکون‌های PWA برای مهرسان گلد

## ✅ تغییرات انجام شده و تکمیل شده

### مشکلات برطرف شده:
1. ✅ **نام اپلیکیشن**: از "صفحه ورود ثبت نام" به **"مهرسان گلد"** تغییر کرد
2. ✅ **آیکون‌های PNG**: آیکون‌های استاندارد PWA با سایزهای مختلف ساخته شدند
3. ✅ **پشتیبانی iOS/Android**: تمام meta tags و لینک‌های لازم اضافه شدند
4. ✅ **رنگ تم**: به رنگ اصلی سایت (#006d5b) تغییر کرد
5. ✅ **Favicon**: آیکون‌های 16x16 و 32x32 برای تب مرورگر

### آیکون‌های تولید شده:
- ✅ `/icon-192.png` - 192x192 پیکسل (Android)
- ✅ `/icon-512.png` - 512x512 پیکسل (Android/Desktop)
- ✅ `/apple-touch-icon.png` - 180x180 پیکسل (iOS)
- ✅ `/favicon-32x32.png` - 32x32 پیکسل (تب مرورگر)
- ✅ `/favicon-16x16.png` - 16x16 پیکسل (تب مرورگر)

## تولید مجدد آیکون‌ها

اگر لوگو تغییر کرد، برای تولید مجدد آیکون‌ها:

```bash
cd /Users/faraz/Desktop/Repo/Front/Mehrsungold
node generate-icons.js
```

این اسکریپت به صورت خودکار تمام آیکون‌های لازم را از `/public/assets/img/logo.svg` می‌سازد.

## نحوه استفاده از آیکون سفارشی

### روش 1: از پنل مدیریت (توصیه می‌شود)
1. وارد پنل ادمین شوید
2. به بخش **تنظیمات** بروید
3. در قسمت **"آیکون (تم لایت)"** فایل PNG آیکون خود را آپلود کنید
4. سایز توصیه شده: **512x512 پیکسل** (PNG با پس‌زمینه شفاف)

### روش 2: قرار دادن مستقیم فایل
فایل‌های آیکون را در مسیر زیر قرار دهید:
```
public/
  ├── icon-192.png   (192x192 پیکسل)
  ├── icon-512.png   (512x512 پیکسل)
  └── apple-touch-icon.png (180x180 پیکسل)
```

## ساخت آیکون‌های PWA

### استفاده از ابزار آنلاین:
1. [https://realfavicongenerator.net/](https://realfavicongenerator.net/)
2. لوگوی خود را آپلود کنید
3. فایل‌های تولید شده را در پوشه `public/` قرار دهید

### استفاده از دستور (نیاز به ImageMagick):
```bash
# نصب ImageMagick (macOS)
brew install imagemagick

# تبدیل SVG به PNG با سایزهای مختلف
convert public/assets/img/logo.svg -resize 192x192 public/icon-192.png
convert public/assets/img/logo.svg -resize 512x512 public/icon-512.png
convert public/assets/img/logo.svg -resize 180x180 public/apple-touch-icon.png
```

## فایل‌های تغییر یافته

### 1. `pages/_app.js`
- اضافه شدن fallback به `/assets/img/logo.svg`
- پشتیبانی از `purpose: 'any maskable'`
- تغییر رنگ تم به #006d5b
- اضافه شدن توضیحات (description)

### 2. `pages/_document.js`
- اضافه شدن meta tags برای iOS
- اضافه شدن meta tags برای Android
- اضافه شدن apple-touch-icon
- اضافه شدن theme-color

## تست کردن PWA

### روی موبایل:
1. سایت را باز کنید: `https://panel.mehrsun.gold/auth`
2. منوی مرورگر را باز کنید
3. گزینه **"Add to Home Screen"** را انتخاب کنید
4. باید نام **"مهرسان گلد"** و آیکون سایت نمایش داده شود

### روی دسکتاپ (Chrome):
1. سایت را باز کنید
2. آیکون نصب (+) در نوار آدرس را کلیک کنید
3. PWA را نصب کنید

## بررسی Manifest در مرورگر

1. سایت را باز کنید
2. Developer Tools را باز کنید (F12)
3. به تب **Application** بروید
4. از منوی سمت چپ **Manifest** را انتخاب کنید
5. مقادیر زیر را بررسی کنید:
   - Name: مهرسان گلد
   - Short name: مهرسان گلد
   - Icons: آیکون‌های 192x192 و 512x512
   - Theme color: #006d5b

## توجه مهم

⚠️ **پس از تغییر آیکون در پنل ادمین:**
- کش مرورگر را پاک کنید
- صفحه را رفرش کنید (Ctrl+F5)
- اگر قبلاً PWA نصب کرده بودید، آن را حذف و دوباره نصب کنید

## پشتیبانی

در صورت مشکل:
1. Console مرورگر را بررسی کنید
2. Network tab را چک کنید که آیکون‌ها لود می‌شوند
3. از Lighthouse در Chrome DevTools برای بررسی PWA استفاده کنید
