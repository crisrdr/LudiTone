# LudiTone — Plataforma de Programación Musical con Bloques

> **Trabajo de Fin de Grado**  
> Desarrollo de una aplicación web como herramienta pedagógica en la enseñanza de música  
> Grado en Ingeniería Informática · Universidad Autónoma de Madrid · 2025–2026

[![Licencia: CC BY-SA 4.0](https://img.shields.io/badge/Licencia-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)
[![Acceso en línea](https://img.shields.io/badge/Demo-crisrdr.github.io%2FLudiTone-blue)](https://crisrdr.github.io/LudiTone/)

---

## Descripción

**LudiTone** es una aplicación web educativa que combina programación visual por bloques y síntesis de audio en tiempo real, orientada a la enseñanza de conceptos musicales en entornos escolares. Está diseñada para estudiantes sin conocimientos previos de programación ni de teoría musical, permitiendo componer, experimentar y escuchar resultados directamente desde el navegador, sin necesidad de instalación.

> El nombre surge de la combinación de *Ludus* (del latín, «juego» o «actividad lúdica») y **Tone.js**, la librería de síntesis de audio sobre la que se construye la aplicación, reflejando la filosofía del proyecto: aprender música de forma experimental y lúdica.

La aplicación integra [Google Blockly](https://developers.google.com/blockly) como motor de programación visual y [Tone.js](https://tonejs.github.io/) como motor de síntesis de audio, ofreciendo una progresión pedagógica estructurada en niveles de dificultad creciente.

---

## Motivación y Contexto Académico

Este proyecto surge de la necesidad de incorporar herramientas tecnológicas innovadoras en la educación musical. La programación por bloques elimina la barrera sintáctica del código textual, permitiendo que el alumno centre su atención en los conceptos musicales: notas, acordes, ritmos, efectos y síntesis de sonido.

Una primera versión de la aplicación fue presentada y utilizada en el taller del **ICLC 2025** (*International Conference on Live Coding*) como herramienta para la enseñanza de música por computador.

---

## Funcionalidades

### Niveles de uso

| Nivel | Descripción |
|-------|-------------|
| **Básico** | Notas simples y secuencias. Introducción a conceptos musicales elementales. |
| **Intermedio** | Acordes, semitonos y parámetros de sonido como volumen y duración. |
| **Avanzado** | Síntesis avanzada: envolventes ADSR, osciladores FAT, portamento, FM/AM. |
| **Live** | Edición en tiempo real con acceso a todas las herramientas disponibles. |
| **Crear Sonido** | Diseño personalizado de timbres con control total de la envolvente. |

### Bloques de sonido

- Notas musicales (Do, Re, Mi... en varias octavas)
- Semitonos con control de alteraciones
- Acordes predefinidos y personalizados
- Parámetros de síntesis: ataque, decay, sustain, release (ADSR)
- Bloques personalizados: el docente o el alumno puede crear y guardar sus propios bloques de sonido

### Efectos de audio

Más de 15 efectos de procesado de señal disponibles como bloques visuales:

`Reverb` · `Delay` · `Distortion` · `Chorus` · `BitCrusher` · `PitchShift` · `AutoFilter` · `LowPassFilter` · `HighPassFilter` · `Tremolo` · `AutoPanner` · `AutoWah` · `Chebyshev` · `FreeVerb` · `JCReverb` · `MidSideEffect` · `Phaser` · `PingPongDelay` · `StereoWidener` · `Vibrato`

---

## Tecnologías

| Tecnología | Uso |
|------------|-----|
| HTML / CSS / JavaScript | Base de la aplicación web |
| [Google Blockly](https://developers.google.com/blockly) | Motor de programación visual por bloques |
| [Tone.js](https://tonejs.github.io/) | Síntesis y reproducción de audio en el navegador |
| Local Storage API | Persistencia del área de trabajo y bloques personalizados |
| GitHub Pages | Despliegue y distribución de la aplicación |

---

## Acceso

La aplicación está disponible en línea en:  
🔗 [crisrdr.github.io/LudiTone](https://crisrdr.github.io/LudiTone/)

No requiere instalación ni registro. Es compatible con cualquier navegador moderno.

---

## Referencias

- M. Quigley y W. Payne. *"Toneblocks: A Block-Based Environment for Music Composition"*. NIME 2021. [Enlace](https://nime.org/proc/nime21_45/index.html)
- Google Blockly — [developers.google.com/blockly](https://developers.google.com/blockly)
- Tone.js — [tonejs.github.io](https://tonejs.github.io/)

---

## Licencia

Este trabajo está publicado bajo la licencia **Creative Commons Atribución-CompartirIgual 4.0 Internacional (CC BY-SA 4.0)**.

Esto significa que puedes compartir y adaptar el material para cualquier propósito, incluso comercial, siempre que se otorgue la atribución adecuada a la autora y se distribuyan las obras derivadas bajo la misma licencia.

[![CC BY-SA 4.0](https://licensebuttons.net/l/by-sa/4.0/88x31.png)](https://creativecommons.org/licenses/by-sa/4.0/)

Consulta los términos completos en [creativecommons.org/licenses/by-sa/4.0](https://creativecommons.org/licenses/by-sa/4.0/).

---

## Autoría

**Cristina Rodríguez de los Ríos Medina**  
Trabajo de Fin de Grado · Grado en Ingeniería Informática  
Universidad Autónoma de Madrid · 2025–2026
