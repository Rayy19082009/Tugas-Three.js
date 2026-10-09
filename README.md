# Tugu Jogja 3D — Website Sejarah & Visualisasi 3D

Website sejarah lengkap Tugu Jogja (Tugu Pal Putih) dengan visualisasi 3D interaktif.

## Tech Stack
- **Node.js** + **Express** (production server)
- **Vite** (dev server & bundler)
- **Three.js** (render 3D, OrbitControls, GLTFLoader)
- HTML/CSS vanilla (tanpa framework UI)

## Menjalankan

```bash
# 1. Install dependencies
npm install

# 2. Mode development (hot reload)
npm run dev
# → http://localhost:5173

# 3. Production
npm run build
npm start
# → http://localhost:3000
```

## Memasang Model 3D Sketchfab

Model "JOGJA 3D" (https://skfb.ly/6XupP) oleh SAW IND / Pee Wee World (CC Attribution):

1. Unduh model dari halaman Sketchfab (format **glTF/GLB**, butuh login akun gratis)
2. Simpan sebagai `public/models/tugu_jogja.glb`
3. Refresh halaman — loader otomatis memuat file tersebut

> Jika file tidak ditemukan, website otomatis memakai **model procedural** (Tugu Pal Putih
> yang dibangun dari geometri Three.js) sehingga halaman tetap berfungsi penuh.

## Struktur
```
├── index.html      # Konten sejarah, timeline, filosofi, fakta
├── main.js         # Scene Three.js (loader GLTF + fallback)
├── server.js       # Express production server
├── vite.config.js
└── public/models/  # Letakkan tugu_jogja.glb di sini
```
