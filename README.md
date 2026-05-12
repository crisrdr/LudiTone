# 🎵 LudiTone — Plataforma de Programación Musical con Bloques

> **Trabajo de Fin de Grado**  
> Desarrollo de una aplicación web como herramienta pedagógica en la enseñanza de música  
> Grado en Ingeniería Informática · Universidad de Autónoma de Madrid

---

## 📖 Descripción

**LudiTone** es una aplicación web educativa que permite aprender conceptos de música y programación de forma simultánea mediante una interfaz visual basada en bloques. La herramienta está orientada a estudiantes sin conocimientos previos de programación ni de teoría musical, y permite componer, experimentar y escuchar resultados en tiempo real directamente desde el navegador.

La aplicación combina [Google Blockly](https://developers.google.com/blockly) como motor de programación visual con [Tone.js](https://tonejs.github.io/) como motor de síntesis de audio web, ofreciendo una experiencia pedagógica progresiva mediante distintos niveles de dificultad.

---

## 🎯 Motivación y Contexto Académico

Este proyecto surge de la necesidad de incorporar herramientas tecnológicas innovadoras en la educación musical. La programación por bloques elimina la barrera sintáctica que supone el código texto, permitiendo que el alumno se concentre en los conceptos musicales: notas, acordes, ritmos, efectos y síntesis de sonido.

La aplicación fue presentada y utilizada en el taller del **ICLC 2025** (*International Conference on Live Coding*) como herramienta para la enseñanza de música por computador.

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
- **Parámetros de síntesis**: ataque, decaimiento, sustain, liberación (ADSR)
- **Bloques personalizados**: el profesor o alumno puede crear y guardar sus propios bloques

### 🎚️ Efectos de Audio
Más de 15 efectos de procesado de señal disponibles como bloques visuales:

`Reverb` · `Delay` · `Distortion` · `Chorus` · `BitCrusher` · `PitchShift` · `AutoFilter` · `LowPassFilter` · `HighPassFilter` · `Tremolo` · `AutoPanner` · `AutoWah` · `Chebyshev` · `FreeVerb` · `JCReverb` · `MidSideEffect` · `Phaser` · `PingPongDelay` · `StereoWidener` · `Vibrato`

### 🔧 Funcionalidades Adicionales
- ▶️ **Play / Stop** para reproducción instantánea
- 🔄 **Modo Live**: ejecución continua con modificación de bloques en caliente
- 🎨 **Creador de bloques personalizados** con nombre, color y nivel de aparición
- 💬 **Sistema de comentarios/feedback** para recopilar experiencia de usuario
- 🗑️ **Limpieza del área de trabajo** con un clic

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Rol |
|------------|-----|
| [Google Blockly](https://developers.google.com/blockly) | Motor de programación visual por bloques |
| [Tone.js](https://tonejs.github.io/) | Síntesis y procesado de audio web |
| HTML5 / CSS3 / JavaScript | Desarrollo web frontend |
| Web Audio API | Base del motor de audio en el navegador |

---

## 🚀 Instalación y Ejecución

### Requisitos
- [Node.js](https://nodejs.org/) (v16 o superior)
- Navegador moderno con soporte para Web Audio API (Chrome, Firefox, Edge)

### Pasos

```bash
# 1. Clona el repositorio
git clone https://github.com/tu-usuario/blockly-music-main.git
cd blockly-music-main

# 2. Instala las dependencias
npm install

# 3. Abre index.html en tu navegador
# (no requiere servidor local — puedes abrirlo directamente)
```

> **Nota:** Para un funcionamiento óptimo, se recomienda servir el proyecto a través de un servidor local (p.ej. con la extensión *Live Server* de VS Code o `npx serve .`).

---

## 📁 Estructura del Proyecto

```
blockly-music-main/
├── index.html              # Interfaz principal de la aplicación
├── app.js                  # Lógica principal: toolbox, modos y ejecución de bloques
├── blocks/
│   ├── sounds/             # Bloques de notas, semitonos y acordes
│   ├── effects/            # Bloques de efectos de audio (reverb, delay, etc.)
│   ├── loop.js             # Bloque de repetición
│   ├── sequence.js         # Bloque de secuencia
│   ├── wait.js             # Bloque de pausa/espera
│   ├── opt_blocks.js       # Bloques de parámetros (volumen, duración, ADSR...)
│   └── opt2_blocks.js      # Bloques de síntesis avanzada
└── styles/                 # Hojas de estilo CSS
```

---

## 📚 Referencias y Trabajos Relacionados

- **Toneblocks** — M. Quigley y W. Payne. *"Toneblocks: A Block-Based Environment for Music Composition"*. NIME 2021. [Enlace](https://nime.org/proc/nime21_45/index.html)
- **Google Blockly** — Plataforma de código abierto para la creación de editores visuales de código.
- **Tone.js** — Librería Web Audio de alto nivel para síntesis musical en el navegador.

---

## 👤 Autor

**Cristina Rodríguez** — Trabajo de Fin de Grado  
Grado en Ingeniería Informática  
Universidad de Extremadura · 2025–2026
