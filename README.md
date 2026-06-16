# BitBat - Echolocation Adventure

**BitBat** è un videogame arcade platform 2D sviluppato interamente in **Vanilla JavaScript** ed eseguito su **HTML5 Canvas**.

E se fossi un pipistrello? Bit Bat è la prima avventura di eco-localizzazione che ti permette di entrare nei panni di un vero mammifero placentato (si, i pipistrelli sono mammiferi!) fatto di pixel.
L'obiettivo è usare il proprio biosonar per trovare le piattaforme di appoggio ed uscire dalla caverna.
I barbagianni saranno attratti dal sonar e lo sfrutteranno contro di te per venire a mangiarti!

Mangia le falene per aumentare la portata del tuo biosonar!

Dato che è sviluppato senza l'ausilio di framework di gioco (come Phaser o Pixi.js), l'intero motore fisico, il rilevamento delle collisioni e l'intelligenza artificiale dei nemici sono stati implementati da zero in puro JS!

---

## Stack Tecnologico & Architettura

- **Linguaggio:** JavaScript (ES6+) strutturato a classi (Programmazione Orientata agli Oggetti).
- **Rendering:** HTML5 Canvas API per una gestione fluida delle performance a 60 FPS.
- **Interfaccia & Stili:** CSS3 avanzato con font custom in pixel-art e layout responsive adattivo.
- **Input Matrix:** Gestione sincrona di tastiera (PC) e Touch Events (`touchstart`/`touchend` con prevenzione del comportamento di default) per dispositivi mobile.

---

## Funzionalità Tecniche Rilevanti

### 1. Sistema di Ecolocalizzazione (Sonar Mechanics)
L'ambiente di gioco (piattaforme, nemici) ha un'opacità dinamica legata al tempo e alla distanza dall'impulso emesso dal giocatore. È stato implementato un sistema di gestione delle particelle e onde circolari che aggiorna in tempo reale il coefficiente di rendering alpha (`ctx.globalAlpha`), simulando l'effetto dell'ecolocalizzazione.

### 2. Intelligenza Artificiale dei Nemici (`Drone.js`)
I droni di pattuglia non seguono un percorso fisso lineare, ma implementano una mini **Macchina a Stati Finiti (FSM)**:
- **PATROL:** Calcolo dei vettori di movimento basato su coordinate generate dinamicamente (`radiusX`, `radiusY`).
- **RETURNING:** Algoritmo di riposizionamento verso il path originale mediante calcolo della distanza euclidea e normalizzazione del vettore velocità quando il drone perde il target.

### 3. Gestione dei Fluidi e Fisica Custom
Implementazione manuale di:
- Forza di gravità costante, attrito vettoriale e gestione dei salti multipli (fino a 3 salti aerei).
- Sistema di *Collision Detection* asse-allineato (AABB) ottimizzato per evitare compenetrazioni con le piattaforme.

---

## Struttura del Codice

Il progetto segue i principi SOLID e la separazione dei concetti, dividendo la logica in moduli indipendenti:
- `Main.js`: Gestisce il ciclo vitale del gioco (Game Loop con `requestAnimationFrame`), il controllo degli stati (`START`, `PLAYING`, `GAMEOVER`) e il rendering della UI.
- `Player.js`: Gestisce la fisica, le animazioni delle ali e lo stato di vulnerabilità del personaggio.
- `Drone.js`: Gestisce i calcoli trigonometrici e i vettori di movimento dei nemici.
- `Platform.js` & `Insect.js`: Gestiscono rispettivamente gli elementi strutturali della mappa e i collezionabili.

---

## Come Eseguire il Progetto in Locale

1. Clona il repository:
   ```bash
   git clone [https://github.com/fabiomaz/bitbat.git](https://github.com/fabiomaz/bitbat.git)

2. Apri il file index.html in un qualsiasi browser moderno, oppure utilizza un server locale come Live Server su VS Code per goderti l'esperienza di gioco.
