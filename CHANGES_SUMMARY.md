# تغییرات انجام شده - Changes Summary

## ✅ تغییرات کامل شده (Frontend)

### 1. تغییر نام PWA در Home Screen
**فایل**: `pages/_app.js`  
**خط**: 114-115  
**تغییر**: نام و short_name از `siteInfo?.title` به `"مهرسان گلد"` تغییر یافت

```javascript
// قبل:
short_name: siteInfo?.title,
name: siteInfo?.title,

// بعد:
short_name: "مهرسان گلد",
name: "مهرسان گلد",
```

**نتیجه**: حالا وقتی کاربر اپلیکیشن را به Home Screen اضافه کند، نوشته زیر آیکون "مهرسان گلد" خواهد بود نه "ورود|ثبت نام مهرسان"

---

### 2. اضافه کردن فیلد آپلود Favicon
**فایل**: `components/admin/settingsPageCompo.jsx`  
**تغییرات**:

#### الف) اضافه شدن به لیست فیلدها (خط ~321)
```javascript
const filteredData = FilterObjectFields(newSettings, [
    // ... فیلدهای دیگر
    "faviconImage",  // ✅ اضافه شد
    // ... بقیه فیلدها
]);
```

#### ب) اضافه شدن handler آپلود (خط ~429-431)
```javascript
if (type == 'faviconImage') {
    setSettings({ ...settings, faviconImage: result.fileUrl });
}
```

#### ج) اضافه شدن UI فیلد آپلود (بعد از خط ~2134)
یک فیلد جدید برای انتخاب Favicon با ساختار مشابه lightIconImage و darkIconImage اضافه شد:
- Label: "انتخاب Favicon"
- Input file hidden با id="faviconImage"
- نمایش پیش‌نمایش تصویر فعلی یا آیکون پیش‌فرض
- دکمه انتخاب فایل

---

## ⚠️ تغییرات لازم برای بکند (Backend)

### فایل‌های نیازمند تغییر:

#### 1. Schema File
**مسیر**: `mehrsungold-backend/settings/schema/settings.schema.ts` (اگر سورس TypeScript وجود دارد)  
یا  
`mehrsungold-backend/settings/schema/settings.schema.js`

**تغییر مورد نیاز**:
```typescript
@Prop()
faviconImage: string;
```

#### 2. DTO Files
**مسیر**: `mehrsungold-backend/settings/dto/update-settings.dto.ts`

**تغییر مورد نیاز**:
```typescript
@ApiPropertyOptional()
@IsOptional()
@IsString()
@IsNotEmpty()
faviconImage: string;
```

**مسیر**: `mehrsungold-backend/settings/dto/public-settings.dto.ts`

**تغییر مورد نیاز**: اضافه کردن 'faviconImage' به لیست فیلدهای PickType:
```typescript
class PublicSettingsDto extends PickType(SettingsDto, [
    // ... فیلدهای موجود
    'faviconImage',
    // ... بقیه فیلدها
]) {}
```

---

## 🔍 چک‌لیست تست

### Frontend:
- [ ] بیلد پروژه فرانتند بدون خطا (`npm run build`)
- [ ] تست PWA install روی موبایل - نام "مهرسان گلد" نمایش داده شود
- [ ] تست آپلود favicon در پنل ادمین
- [ ] بررسی نمایش favicon در تب مرورگر

### Backend:
- [ ] اضافه کردن فیلد faviconImage به schema
- [ ] اضافه کردن فیلد faviconImage به DTOs
- [ ] بیلد بکند بدون خطا
- [ ] تست API endpoint برای ذخیره و دریافت faviconImage

---

## 📝 نکات مهم

1. **فایل‌های بکند obfuscated هستند**: فایل‌های JavaScript بکند compile شده و obfuscated هستند، پس باید سورس TypeScript اصلی را ویرایش کرده و دوباره بیلد کنید.

2. **استفاده از Favicon**: بعد از اضافه کردن فیلد، می‌توانید در `_document.js` یا `_app.js` از favicon استفاده کنید:
```html
<link rel="icon" href={`${process.env.NEXT_PUBLIC_BASEURL}${siteInfo?.faviconImage}`} />
```

3. **Default Favicon**: در صورت نبودن favicon سفارشی، می‌توانید یک favicon پیش‌فرض در `public/` قرار دهید.

---

## 📂 فایل‌های تغییر یافته

### Frontend (تغییر داده شده):
1. ✅ `/Users/faraz/Desktop/Repo/Front/Mehrsungold/pages/_app.js`
2. ✅ `/Users/faraz/Desktop/Repo/Front/Mehrsungold/components/admin/settingsPageCompo.jsx`

### Backend (نیاز به تغییر):
3. ⏳ `mehrsungold-backend/settings/schema/settings.schema.ts`
4. ⏳ `mehrsungold-backend/settings/dto/update-settings.dto.ts`
5. ⏳ `mehrsungold-backend/settings/dto/public-settings.dto.ts`

---

## 🚀 مراحل دیپلوی

### Frontend:
```bash
cd /Users/faraz/Desktop/Repo/Front/Mehrsungold
npm run build
# آپلود فایل‌های build شده به سرور Chabokan
```

### Backend (بعد از تغییرات):
```bash
cd /Users/faraz/Desktop/Repo/Back/mehrsungold-backend
# ویرایش فایل‌های TypeScript source
npm run build  # یا هر command بیلد که دارید
pm2 restart all
```

---

تاریخ: $(date)
توسط: GitHub Copilot
