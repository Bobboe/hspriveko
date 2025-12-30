## Privat ekonomi (PWA, iPhone, lokal data)

Det här är en PWA (webbapp) som körs i Safari och kan installeras på hemskärmen utan App Store.
All data sparas lokalt i **IndexedDB** på enheten.

### Starta lokalt

```bash
npm install
npm run dev
```

### Installera på iPhone (utan App Store)

1. Host:a appen på **HTTPS** (krav för service worker/offline).
   - Bygg: `npm run build` (output i `dist/`)
   - Lägg `dist/` på valfri statisk hosting
2. Öppna sidan i **Safari** på iPhone.
3. Tryck **Dela** → **Lägg till på hemskärmen**.
4. Starta appen från hemskärmen (standalone-läge).

### Offline-test (viktigt)

1. Öppna appen minst en gång online så att den cachas.
2. Slå på **Flygplansläge**.
3. Starta appen igen från hemskärmen.
4. Kontrollera att:
   - Appen öppnas
   - Dina kategorier/utgifter finns kvar
   - Du kan lägga till/ta bort utgifter offline

### Data är lokal

- Kategorier och utgifter lagras i IndexedDB i din webbläsarprofil på iPhone.
- Om du rensar Safari-data eller tar bort webbappen kan datan försvinna.
