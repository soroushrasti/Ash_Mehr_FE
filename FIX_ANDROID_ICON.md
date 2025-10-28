# راهنمای رفع مشکل آیکون اندروید

## مشکل
بعد از بیلد APK یا AAB، آیکون برنامه در اندروید نمایش داده نمی‌شود.

## راه‌حل‌های پیشنهادی

### روش 1: استفاده از EAS Build (توصیه می‌شود)

اگر از EAS Build استفاده می‌کنید، این مراحل را دنبال کنید:

```bash
# 1. پاک‌سازی کامل
rm -rf node_modules package-lock.json
npm install

# 2. پاک‌سازی کش EAS
eas build:configure

# 3. بیلد مجدد
eas build --platform android --profile production
```

### روش 2: بیلد لوکال با Expo

```bash
# 1. پاک‌سازی کامل
rm -rf android node_modules package-lock.json .expo
npm install

# 2. تولید مجدد پروژه اندروید
npx expo prebuild --clean --platform android

# 3. بررسی تولید آیکون‌ها
ls -la android/app/src/main/res/mipmap-*/

# 4. بیلد اپلیکیشن
cd android && ./gradlew clean && ./gradlew assembleRelease
```

### روش 3: بررسی و رفع مشکلات رایج

#### 1. بررسی ابعاد تصاویر
تصاویر آیکون باید دقیقاً این ابعاد را داشته باشند:
- `icon.png`: **1024×1024 پیکسل**
- `adaptive-icon.png`: **1024×1024 پیکسل**

برای بررسی ابعاد:
```bash
# با استفاده از sips (macOS)
sips -g pixelWidth -g pixelHeight assets/images/icon.png

# یا با Python
python3 -c "from PIL import Image; img=Image.open('assets/images/icon.png'); print(f'{img.size[0]}x{img.size[1]}')"
```

#### 2. اگر ابعاد تصاویر نادرست است
می‌توانید آن‌ها را با این دستور تغییر اندازه دهید:

```bash
# با sips (macOS)
sips -z 1024 1024 assets/images/icon.png
sips -z 1024 1024 assets/images/adaptive-icon.png

# یا با ImageMagick
convert assets/images/icon.png -resize 1024x1024 assets/images/icon.png
```

#### 3. بررسی app.json
مطمئن شوید که `app.json` این تنظیمات را دارد:

```json
{
  "expo": {
    "icon": "./assets/images/icon.png",
    "android": {
      "icon": "./assets/images/icon.png",
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#2E7D32"
      }
    }
  }
}
```

### روش 4: تولید دستی آیکون‌ها

اگر `expo prebuild` به‌درستی کار نکرد، می‌توانید از ابزارهای آنلاین استفاده کنید:

1. به این سایت بروید: https://icon.kitchen/
2. تصویر `icon.png` خود را آپلود کنید
3. پکیج Android را دانلود کنید
4. فایل‌های تولید شده را در `android/app/src/main/res/` کپی کنید

### روش 5: استفاده از expo-splash-screen برای تولید آیکون

```bash
npm install -g @expo/image-utils
npx expo-generate-icons
```

## بررسی نهایی

بعد از اعمال تغییرات، بررسی کنید که فایل‌های زیر وجود دارند:

```bash
# بررسی آیکون‌های تولید شده
ls -la android/app/src/main/res/mipmap-hdpi/ic_launcher.png
ls -la android/app/src/main/res/mipmap-mdpi/ic_launcher.png
ls -la android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
ls -la android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
ls -la android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png

# برای Adaptive Icon
ls -la android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml
```

## نکات مهم

1. **همیشه بعد از تغییر آیکون، کش را پاک کنید**
2. **بیلد Release را تست کنید، نه Debug**
3. **مطمئن شوید که در `AndroidManifest.xml` مسیر آیکون صحیح است:**
   ```xml
   <application
       android:icon="@mipmap/ic_launcher"
       android:roundIcon="@mipmap/ic_launcher_round"
       ...>
   ```

## اگر همچنان مشکل دارید

اگر بعد از انجام تمام این مراحل همچنان آیکون نمایش داده نمی‌شود:

1. APK را از روی دستگاه حذف کنید (uninstall)
2. کش دستگاه را پاک کنید
3. APK جدید را نصب کنید
4. دستگاه را ری‌استارت کنید

## بیلد نهایی برای ارسال به بازار

```bash
# با EAS
eas build --platform android --profile production

# یا با Gradle مستقیم
cd android
./gradlew clean
./gradlew bundleRelease  # برای AAB
# یا
./gradlew assembleRelease  # برای APK
```

فایل خروجی در این مسیر خواهد بود:
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`
- APK: `android/app/build/outputs/apk/release/app-release.apk`

