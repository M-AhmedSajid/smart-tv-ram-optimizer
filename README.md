# Smart TV App Streaming Memory Optimizer

A visual simulation of three classic page replacement algorithms used in operating systems:

* FIFO (First In, First Out)
* LRU (Least Recently Used)
* Optimal Page Replacement

The project represents a Smart TV streaming environment where applications compete for limited RAM space. Each app request is processed simultaneously by all three algorithms, allowing users to compare their behavior and performance in real time.

---

## Project Objective

Modern Smart TVs run multiple streaming applications while having limited memory resources.

This project demonstrates how different memory management strategies decide:

* Which application remains in RAM
* Which application gets removed when memory is full
* How cache hits and page faults affect performance

The simulator provides a side-by-side comparison of FIFO, LRU, and Optimal algorithms to help students understand memory allocation and page replacement concepts visually.

---

## Features

### RAM Slot Visualization

* Dynamic RAM capacity (2 to 5 slots)
* Real-time memory allocation display
* Visual replacement indicators
* App-specific colors and branding

### Algorithm Simulation

* FIFO (First In, First Out)
* LRU (Least Recently Used)
* Optimal Page Replacement

### Performance Metrics

* Cache Hits
* Page Faults
* Hit Ratio
* Live algorithm comparison

### Prediction Engine

* Future request lookahead queue
* Used by the Optimal algorithm
* Shows upcoming predicted app requests

### Live Console

* Real-time operation logs
* Hit and miss tracking
* Replacement explanations
* Expandable console view

### Request History

* Complete history of user requests
* Chronological tracking
* Visual app indicators

### Best Algorithm Detection

* Automatically compares all algorithms
* Determines the current best performer
* Updates after every request

---

## Algorithms Explained

### FIFO (First In, First Out)

Removes the application that entered RAM first.

Example:

RAM: Netflix → YouTube → Disney+

New Request: Prime

Result:
Netflix is removed because it was loaded first.

---

### LRU (Least Recently Used)

Removes the application that has not been used for the longest time.

Example:

RAM: Netflix → YouTube → Disney+

Recent Usage:
Disney+ used recently
YouTube used recently
Netflix not used for a long time

New Request: Prime

Result:
Netflix is removed.

---

### Optimal Page Replacement

Removes the application that will be needed furthest in the future.

This algorithm uses future knowledge and is considered the theoretical best possible page replacement strategy.

---

## Technologies Used

* React
* JavaScript (ES6+)
* Tailwind CSS
* Lucide React Icons
* React Icons

---

## Learning Outcomes

This project helps students understand:

* Page Replacement Algorithms
* Cache Management
* Memory Allocation
* Page Faults
* Cache Hits
* Operating System Concepts
* Algorithm Performance Analysis
* Frontend State Management with React

---

## How to Run

### 1. Clone the Repository

```bash
git clone https://github.com/M-AhmedSajid/smart-tv-ram-optimizer.git
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Open in Browser

```bash
http://localhost:3000
```

---

## Project Structure

```text
src/
├── components/
│   ├── ControlPanel.jsx
│   ├── LiveConsole.jsx
│   ├── LookaheadQueue.jsx
│   ├── MetricsPanel.jsx
│   └── RAMSlotsVisualizer.jsx
│
├── utils/
│   └── algorithms.js
│
├── types.js
│
└── App.jsx
```

---

## Educational Purpose

This project was developed as a semester project to demonstrate the practical implementation and comparison of memory management algorithms in a Smart TV streaming environment.

It combines operating system concepts with modern frontend development to create an interactive learning experience.

---

## Contributers

M. Ahmed Sajid
S. Jawad-ul-Hassan
Arham Ali Khan
