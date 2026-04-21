# FB2Manager

## Overview

FB2Manager is a Node.js-based project designed to manage and process book-related data, including metadata, genres, authors, and database storage using SQLite.

The project also includes an automated Windows batch setup script that initializes the environment, installs dependencies, and synchronizes the project with a GitHub repository.

---

## What this project does

When you run the setup script, it will:

### 1. Initialize the project environment
- Detect current directory
- Initialize a Git repository if missing
- Connect it to GitHub repository

### 2. Install Node.js dependencies
Automatically installs required packages:

- better-sqlite3 (database engine)
- chardet (encoding detection)
- fast-xml-parser (XML parsing)
- iconv-lite (text encoding conversion)
- twig (templating engine)

---

### 3. Set up Node.js project
If missing, it will:
- Create `package.json`
- Prepare project for npm usage

---

### 4. Git synchronization
The script:
- Pulls or fetches repository content
- Sets branch to `master`
- Detects changes
- Commits updates automatically
- Pushes to GitHub if changes exist

Repository:
https://github.com/mikhail-leonov/FB2Manager.git

---

### 5. Backup system
The project supports automatic backup creation (outside Git tracking) using timestamped archives.

Ignored folders include:
- backup/
- node_modules/
- upload/

---

## Project Structure

/js - JavaScript logic
/sql - Database schema and queries
/views - Twig templates
/app - Application core logic
/core - Core utilities
/server.js - Main entry point



---

## Requirements

- Node.js 16+ recommended
- Git installed and configured
- Internet connection for dependency installation

For some dependencies (like `better-sqlite3`), build tools may be required on Windows.

---

## Setup

Run the setup script:


_init.cmd



It will automatically initialize everything.

---

## Notes

- This project uses `master` branch (not `main`)
- Auto-commit is enabled when file changes are detected
- Node modules and uploads are excluded from Git tracking
- Backup files are stored locally and not uploaded to GitHub

---

## Purpose

This project is designed as a lightweight system for:
- Managing structured book data
- Parsing metadata from external sources
- Storing data in SQLite
- Rendering views using Twig templates
- Keeping project state synchronized with GitHub automatically


