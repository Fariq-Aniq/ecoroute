# EcoRoute - Smart Dispatch Console 🌿📍

EcoRoute is a full-stack Geospatial Routing & Meteorological Fleet Optimization Console. The platform acts as a smart central hub that coordinates incoming delivery shipments, maps geographical paths in real-time, and generates precise, itemized billing invoices that compute variable pricing adjustments based directly on real-time weather matrices.

---

## 🛠️ System Architecture & Stack

- **Presentation Layer (Frontend):** React.js, Leaflet Maps, Bootstrap 5 CSS Framework
- **Application Engine (Backend API):** Laravel (PHP) utilizing Eloquent ORM 
- **Database Storage Suite:** MySQL hosted via XAMPP Data Platform

---

## 🚀 Installation & System Setup Guide

### 1. Local Database Environment (XAMPP)
1. Initialize your **XAMPP Control Panel** and execute both the **Apache** and **MySQL** module servers.
2. Navigate to your local database administrator screen at `http://localhost/phpmyadmin`.
3. Create a clean database schema named `ecoroute`.

### 2. Backend Infrastructure Deployment (Laravel)
1. Open a terminal instance inside your project's `/backend` directory.
2. Install the necessary PHP development library packages:
   ```bash
   composer install