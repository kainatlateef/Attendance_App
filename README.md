# 🎓 Abbey College - Attendance Management System (AMS)

A **web-based Attendance Management System** for **Abbey College Adelaide**, developed as part of a full-stack web development internship.  
This system streamlines student attendance tracking using **QR codes** and **location-based validation**, enabling secure and efficient record-keeping for administrators and students.

---

## 📝 Table of Contents

- [Project Overview](#project-overview)  
- [🚀 Features](#features)  
- [🛠️ Technologies Used](#technologies-used)  
- [💻 Installation](#installation)  
- [⚙️ Usage](#usage)  
- [📸 Screenshots](#screenshots)  
- [🤝 Contributing](#contributing)  
- [📄 License](#license)

---

## 🔍 Project Overview

The **AMS project** allows:

- ✅ Administrators to manage students, courses, and attendance records on a centralized platform  
- ✅ Students to mark attendance securely using QR code scans  
- ✅ Real-time attendance tracking with location verification  

The system is built using a **full-stack approach** with **React.js**, **PHP (RESTful API)**, and **MySQL**.

---

## 🚀 Features

- 🖥️ **Admin Dashboard** – Overview of students, courses, and daily attendance  
- 👩‍🎓 **Student Module** – Secure QR code check-in with daily attendance prevention  
- 🔗 **QR Code Generator** – Generate time-limited QR codes for attendance  
- 🔍 **Search & Filter** – Search students, courses, and attendance records  
- 📊 **Export Functionality** – Download attendance records in CSV/Excel format  
- 🌍 **Location-Based Attendance** – Ensure attendance is marked within 1,000 meters  
- 📄 **Pagination** – For optimized performance in large datasets  

---

## 🛠️ Technologies Used

| Technology | Purpose |
|------------|---------|
| ![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black) | Front-end library for dynamic UI |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC?logo=tailwind-css&logoColor=white) | Styling framework for modern and responsive designs |
| ![Lucide React](https://img.shields.io/badge/Lucide-000000?style=flat&logo=lucide) | Icons for UI components |
| ![PHP](https://img.shields.io/badge/PHP-777BB4?logo=php&logoColor=white) | Backend logic and RESTful API |
| ![MySQL](https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=white) | Relational database for storing records |
| HTML5 & JS | Front-end structure and logic |
| XAMPP / Apache | Local server environment for PHP & MySQL |
| Git & GitHub | Version control & collaboration |

---

## 💻 Installation

1. **Clone the repository**  
```bash
git clone https://github.com/kainatlateef/Attendance_App.git
cd Attendance_App
Install dependencies

bash
Copy code
npm install
Set up environment variables
Create a .env file in the root directory:

env
Copy code
VITE_API_BASE_URL=http://localhost:8000/api
Run the development server

bash
Copy code
npm run dev
Open the app
Visit http://localhost:5173 in your browser

⚙️ Usage
Log in as an admin to manage courses, students, and attendance

Generate QR codes for students to scan using their devices

Search, filter, and export attendance records from the portal

📸 Screenshots


🤝 Contributing
Contributions are welcome!
Please fork the repository and submit a pull request with detailed explanations for improvements or bug fixes.

📄 License
This project is licensed under the MIT License.
