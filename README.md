# 🎵 LudiTone — Plataforma de Programación Musical con Bloques

> **Trabajo de Fin de Grado**  
> Desarrollo de una aplicación web como herramienta pedagógica en la enseñanza de música  
> Grado en Ingeniería Informática · Universidad de Autónoma de Madrid

---

## 📖 Descripción

**LudiTone** es una aplicación web educativa que permite aprender conceptos de música y programación de forma simultánea mediante una interfaz visual basada en bloques. La herramienta está orientada a estudiantes sin conocimientos previos de programación ni de teoría musical, y permite componer, experimentar y escuchar resultados en tiempo real directamente desde el navegador.

> El nombre **LudiTone** surge de la combinación de *Ludus* (del latín, «juego» o «actividad lúdica») y **Tone.js**, la librería de síntesis de audio sobre la que se construye la aplicación. Esta denominación refleja la filosofía del proyecto: aprender música de forma entretenida y experimental, a través del juego y la exploración sonora.

La aplicación combina [Google Blockly](https://developers.google.com/blockly) como motor de programación visual con [Tone.js](https://tonejs.github.io/) como motor de síntesis de audio web, ofreciendo una experiencia pedagógica progresiva mediante distintos niveles de dificultad.

---

## 🎯 Motivación y Contexto Académico

Este proyecto surge de la necesidad de incorporar herramientas tecnológicas innovadoras en la educación musical. La programación por bloques elimina la barrera sintáctica que supone el código texto, permitiendo que el alumno se concentre en los conceptos musicales: notas, acordes, ritmos, efectos y síntesis de sonido.

Una primera versión de la aplicación fue presentada y utilizada en el taller del **ICLC 2025** (*International Conference on Live Coding*) como herramienta para la enseñanza de música por computador.

---

## ✨ Funcionalidades Principales

### 🧩 Modos de Uso
| Modo | Descripción |
|------|-------------|
| **Básico** | Notas simples y secuencias. Ideal para introducción a la música. |
| **Intermedio** | Acordes, semitonos y parámetros de sonido como volumen y duración. |
| **Avanzado** | Síntesis avanzada: envolventes ADSR, osciladores FAT, portamento, FM/AM. |
| **Live** | Edición en tiempo real con todas las herramientas disponibles. |
| **Crear Sonido** | Diseño personalizado de timbres con control total de la envolvente. |

### 🎛️ Bloques de Sonido
- **Notas musicales** (Do, Re, Mi... en varias octavas)
- **Semitonos** con control de alteraciones
- **Acordes** predefinidos y personalizados
- **Parámetros de síntesis**: ataque, decay, sustain, release (ADSR)
- **Bloques personalizados**: el profesor o alumno puede crear y guardar sus propios bloques

### 🎚️ Efectos de Audio
Más de 15 efectos de procesado de señal disponibles como bloques visuales:

`Reverb` · `Delay` · `Distortion` · `Chorus` · `BitCrusher` · `PitchShift` · `AutoFilter` · `LowPassFilter` · `HighPassFilter` · `Tremolo` · `AutoPanner` · `AutoWah` · `Chebyshev` · `FreeVerb` · `JCReverb` · `MidSideEffect` · `Phaser` · `PingPongDelay` · `StereoWidener` · `Vibrato`

---

🌐 **Acceso en línea:** [crisrdr.github.io/TFG](https://crisrdr.github.io/TFG/)

---

## 📚 Referencias y Trabajos Relacionados

- **Toneblocks** — M. Quigley y W. Payne. *"Toneblocks: A Block-Based Environment for Music Composition"*. NIME 2021. [Enlace](https://nime.org/proc/nime21_45/index.html)
- **Google Blockly** — Plataforma de código abierto para la creación de editores visuales de código.
- **Tone.js** — Librería Web Audio de alto nivel para síntesis musical en el navegador.

---

## 👤 Autor

**Cristina Rodríguez de los Ríos Medina** — Trabajo de Fin de Grado  
Grado en Ingeniería Informática  
Universidad de Autónoma de Madrid · 2025–2026
