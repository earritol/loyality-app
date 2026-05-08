# Íconos PWA — GanaMás

## Especificaciones

| Archivo | Dimensiones | Uso | Notas |
|---------|-------------|-----|-------|
| `icon-192x192.png` | 192×192px | Manifest PWA (Android/Desktop) | Logo centrado sobre fondo #22C55E, padding ~20%, safe zone 80% central |
| `icon-512x512.png` | 512×512px | Manifest PWA (splash/install) | Logo centrado sobre fondo #22C55E, padding ~20%, safe zone 80% central |
| `apple-touch-icon.png` | 180×180px | iOS "Agregar a pantalla de inicio" | Logo centrado sobre fondo #22C55E |

## Requisitos para `purpose: "any maskable"`

Los íconos con purpose "maskable" requieren que el contenido importante esté dentro del 80% central del área total. El 20% exterior puede ser recortado por el sistema operativo en diferentes formas (círculo, squircle, etc.).

## Generación

Ejecutar el script de placeholders para testing inicial:

```bash
npx tsx scripts/generate-placeholder-icons.ts
```

Los placeholders son PNGs de color sólido (#22C55E) con las dimensiones correctas. Reemplazar con branding final antes de producción.

## Reutilización futura

Estas dimensiones y formatos son la base para generar assets nativos en una futura app Expo/React Native:
- Android: adaptive icons (foreground + background layers)
- iOS: App Icon set (múltiples resoluciones)
