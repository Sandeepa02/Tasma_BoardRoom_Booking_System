<div align="center">

# 🏢 TASMA Boardroom Booking System

### A smarter, smoother way to reserve your next meeting space.

A responsive boardroom reservation portal for TASMA Group employees and administrators. Explore available rooms, manage reservations, and handle approvals from one easy-to-use interface.

<br />

![HTML5](https://img.shields.io/badge/HTML5-markup-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-styling-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-vanilla-F7DF1E?style=for-the-badge&logo=javascript&logoColor=111827)
![Responsive](https://img.shields.io/badge/Design-responsive-8B5CF6?style=for-the-badge)

</div>

---

## ✨ At a glance

| 👩‍💼 For employees | 🛡️ For administrators | 🎨 For everyone |
|:---|:---|:---|
| Find and book boardrooms | Review pending registrations | Responsive dashboard UI |
| Track and manage bookings | Monitor department quotas | Dark mode support |
| Download passes for confirmed reservations | Oversee reservations and accounts | Toasts and confirmation dialogs |

## 🚀 What you can do

### Employee experience
- Sign in or register for an account; new registrations require approval.
- Browse boardrooms and choose a date and hourly time slot.
- Confirm reservations and manage them from **My Bookings**.
- Download a PDF pass for a confirmed reservation.
- Update profile information.
- Access features according to department-based rules.

### Administrator controls
- Review and approve pending user registrations.
- Track department quotas and registered-user limits.
- Oversee user accounts and reservations.

### Thoughtful details
- 📱 Responsive layout for desktop and tablet
- 🌙 Dark mode
- 💾 Local storage for demo data
- 🔔 Toast notifications and modal confirmations

## 🧰 Built with

| Technology | Role |
|:---|:---|
| HTML5 and CSS3 | Structure and styling |
| Vanilla JavaScript | Application behavior |
| Node.js & Express | Backend API server |
| MongoDB & Mongoose | Cloud/local database & data modeling |
| Tailwind CSS | Utility-first styling |
| Font Awesome | Icons |
| jsPDF | PDF pass generation |
| QRCode.js | QR code support |

## 🏁 Get started

### 1. Configure MongoDB
Open the `.env` file in the project root and add your MongoDB Atlas connection URI:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/boardroom_db?retryWrites=true&w=majority
```

### 2. Start the Server
```bash
npm start
```
The server will start at **`http://localhost:5000`** and automatically:
- Connect to MongoDB Atlas
- Seed default accounts (`admin@tasmagroup.com`, `john@company.com`)
- Serve the booking portal and API

## 📁 Project structure

```text
Tasma_BoardRoom_Booking_System/
├── .env                  # MongoDB Atlas credentials & port
├── .env.example          # Environment template
├── package.json          # Node.js dependencies
├── assets/
│   └── images/
├── css/
│   └── styles.css
├── js/
│   ├── api.js            # MongoDB backend synchronization bridge
│   ├── admin.js
│   ├── app.js
│   ├── auth.js
│   ├── booking.js
│   ├── calendar.js
│   ├── data.js
│   ├── main.js
│   ├── pass.js
│   ├── profile.js
│   ├── tailwind-config.js
│   └── ui.js
├── server/
│   ├── server.js         # Express server & static host
│   ├── seed.js           # Initial database seeder
│   ├── config/
│   │   └── db.js         # Mongoose connection
│   ├── models/
│   │   ├── User.js       # User schema
│   │   └── Booking.js    # Booking schema
│   └── routes/
│       ├── authRoutes.js    # Login & authentication
│       ├── userRoutes.js    # User management & approvals
│       └── bookingRoutes.js # Boardroom reservations
├── index.html
└── README.md
```

## 🗺️ What's inside

- **`index.html`** — application entry point
- **`css/styles.css`** — custom styles
- **`js/`** — authentication, booking, calendar, admin, profile, pass, and UI functionality
- **`assets/images/`** — image assets

---

<div align="center">

Made with 💜 © Suraj Sandeepa | Pathum Liyanage - IT Department Tasma Group


</div>
