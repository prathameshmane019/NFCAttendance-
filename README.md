# 📌 RFID-Based Attendance System

A smart **RFID-Based Attendance System** built using **Node.js (Backend)**, **React.js (Frontend)**, **MongoDB (Database)**, **Tailwind CSS (UI Styling)**, **RFID Reader**, and **ESP32 Module**. This system automates attendance marking using RFID cards, enhancing security and efficiency.

---

## 🏗️ System Architecture
![Flow Diagram](./public/Flow.png)


### **Components:**
- **RFID Card Reader**: Scans RFID tags and sends data to the ESP32.
- **ESP32 (NodeMCU)**: Processes RFID data and communicates with the server via HTTP.
- **Backend (Node.js + Express.js)**: Handles API requests, processes attendance, and communicates with the database.
- **Frontend (React.js + Tailwind CSS)**: Provides an intuitive interface for admins to manage attendance records.
- **MongoDB**: Stores student details, RFID data, and attendance logs.
- **Email/SMS Gateway**: Sends real-time notifications to students and admins.

---

## 📌 Features

✅ **Automated Attendance Marking** via RFID scanning
✅ **Admin Panel** to manage students and view attendance
✅ **Real-time Notifications** via Email/SMS
✅ **Secure Data Storage** using MongoDB
✅ **REST API Integration** for efficient communication
✅ **Modern UI** using React.js & Tailwind CSS
✅ **Error Logging & Alerts**

---

## 🛠️ Technologies Used

| 🛠️ Tech Stack  | 🚀 Description |
|-------------|------------|
| **Node.js** | Backend API |
| **Express.js** | REST API Framework |
| **React.js** | Frontend UI |
| **MongoDB** | NoSQL Database |
| **Tailwind CSS** | Styling Framework |
| **ESP32 (NodeMCU)** | Microcontroller for RFID |
| **RFID Reader** | Scans RFID cards |
| **Email/SMS Gateway** | Sends alerts |

---

## 🚀 Getting Started

### 🏗️ Prerequisites

- Node.js & npm installed
- MongoDB (local or cloud)
- ESP32 firmware setup

### 🔥 Setup & Installation

#### **Backend (Node.js)**

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/rfid-attendance-system.git
   ```
2. Navigate to the backend folder:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. Backend runs on `http://localhost:5000`

#### **Frontend (React.js)**

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run React application:
   ```bash
   npm start
   ```
4. Open `http://localhost:3000` in the browser

#### **ESP32 Firmware (Microcontroller Setup)**

1. Flash the ESP32 firmware with the following Arduino code:
   ```cpp
   #include <WiFi.h>
   #include <HTTPClient.h>
   
   const char* ssid = "Your_WiFi_SSID";
   const char* password = "Your_WiFi_Password";
   const char* serverUrl = "http://localhost:5000/api/attendance";

   void setup() {
       Serial.begin(115200);
       WiFi.begin(ssid, password);
       while (WiFi.status() != WL_CONNECTED) {
           delay(1000);
           Serial.println("Connecting...");
       }
   }

   void loop() {
       if (WiFi.status() == WL_CONNECTED) {
           HTTPClient http;
           http.begin(serverUrl);
           int httpResponseCode = http.GET();
           http.end();
       }
       delay(5000);
   }
   ```
2. Upload the script to your ESP32 using Arduino IDE.
3. Connect the RFID reader to ESP32 as per the wiring diagram.

---

## 📡 API Endpoints

| Method  | Endpoint               | Description          |
|---------|------------------------|----------------------|
| `GET`   | `/students`            | Get all students    |
| `POST`  | `/students`            | Add a new student   |
| `GET`   | `/attendance`          | Get attendance logs |
| `POST`  | `/attendance`          | Mark attendance     |
| `GET`   | `/attendance/:id`      | Get attendance by ID |
| `DELETE`| `/students/:id`        | Remove a student    |

---
 

## 🙌 Acknowledgements

Thanks to **Node.js**, **React.js**, **ESP32**, and **MongoDB** communities for their amazing support and documentation!

---

## 📩 Contact

👤 **Prathamesh**  
📧 Email: maneprathamesh019@gmail.com  
🔗 [GitHub](https://github.com/prathameshmane019)  
🔗 [LinkedIn](www.linkedin.com/in/prathamesh-mane-2308a5241)  

---
 

