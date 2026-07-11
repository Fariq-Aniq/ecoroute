```markdown
# EcoRoute - Smart Dispatch Console 🌿📍

EcoRoute is a full-stack Geospatial Routing & Meteorological Fleet Optimization Console. The platform acts as a smart central hub that coordinates incoming delivery shipments, maps geographical paths in real-time, and generates precise, itemized billing invoices that compute variable pricing adjustments based directly on real-time weather matrices.

---

## 🛠️ System Architecture & Stack

- **Presentation Layer (Frontend):** React.js, Leaflet Maps, Bootstrap 5 CSS Framework
- **Application Engine (Backend API):** Laravel 11 (PHP) utilizing Eloquent ORM
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

```

3. Set up your environment settings by duplicating the default configuration file:
```bash
cp .env.example .env

```


*(Open `.env` and verify that `DB_DATABASE=ecoroute`, `DB_USERNAME=root`, and `DB_PASSWORD=` match your local XAMPP setup)*
4. Execute the system database migrations to generate your tables instantly:
```bash
php artisan migrate

```


5. Ignite the backend local proxy pipeline server:
```bash
php artisan serve

```


*The backend engine API pipeline is now active at:* `http://localhost:8000`

### 3. Frontend Dashboard Launch (React)

1. Open a separate, distinct terminal instance inside your project's `/frontend` directory.
2. Download and rebuild the required JavaScript module trees:
```bash
npm install

```


3. Boot up the local runtime client service window:
```bash
npm start

```


*The client interface will automatically compile and open in your web browser at:* `http://localhost:3000`

---

## 🗄️ Database Schema Design (MySQL Tables)

The system relies on three core relational tables inside MySQL to manage live data states:

### 1. `orders` Table

Keeps a permanent log registry of all incoming client delivery coordinates and conditions.

* `id` (Primary Key)
* `tracking_number` (Unique Varchar Hash)
* `recipient_name` (Varchar)
* `destination_address` (Text)
* `latitude` / `longitude` (Decimal coordinates for Leaflet mapping)
* `weather_condition` (Varchar - e.g., Clear, Clouds, Rain, Thunderstorm)
* `distance_km` (Decimal calculation)

### 2. `riders` Table

Manages the fleet management system assets.

* `id` (Primary Key)
* `name` (Varchar - e.g., Rider Fahmi, Rider Syakir)
* `availability` (Varchar - default: `active`)

### 3. `invoices` Table

Stores finalized historical financial sheets compiled by the surcharge logic engine.

* `id` (Primary Key)
* `order_id` (Foreign Key linked to orders)
* `tracking_number` (Varchar)
* `recipient_name` (Varchar)
* `subtotal` (Decimal base mileage rate)
* `weather_surcharge` (Decimal 25% hazard modifier)
* `total_cost` (Decimal final aggregate bill)

---

## 🔌 Integrated RESTful API Endpoints

### Orders Service Pipeline (`OrderController`)

* `GET /api/orders/all` - Pulls historical streams to render table rows and map markers.
* `POST /api/orders/create` - Takes user text inputs, coordinates geolocation markers, and logs them to MySQL.
* `DELETE /api/orders/{id}` - Safely purges an active shipment record from logs.

### Fleet Allocation Pipeline (`RiderController`)

* `GET /api/riders/active` - Fetches available driver accounts to populate the dashboard selection tools.
* `POST /api/riders/assign` - Simulates courier route deployment and changes asset availability flags.

### Invoice Compilation Pipeline (`InvoiceController`)

* `POST /api/invoices/generate/{orderId}` - Reads an order row, scans weather parameters, compiles a 25% surcharge if raining, and writes a structural bill directly into database memory.

---

## 🎯 Main Live Features Verified

### 1. Dynamic Shipment Generation 📍

* Inputting a client entity name and location automatically records the order entries directly into the XAMPP data tier.
* Integrates open-source maps seamlessly to render interactive tracking pins globally across your visual dashboard map.

### 2. Fleet Telemetry & Driver Deployment 🏍️

* Pulls live courier identities dynamically from your custom MySQL `riders` table registry.
* Provides interactive dropdown menus allowing controllers to seamlessly allocate drivers to the target log streams.

### 3. Meteorological Surcharge Pricing Engine 📄

* Communicates directly with the `InvoiceController` API pipeline.
* Automatically scans weather strings inside your data blocks: if a targeted record lists **Rain** or **Thunderstorm**, the logic injects a **+25% Weather Surcharge fee (Meteorological Fee)** into the final pricing total.

```

```