
<div align="center">

# 🏢 TASMA Boardroom Booking System

**A modern, responsive reservation platform for managing meetings and boardrooms.**

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&pause=1200&color=8B5CF6&center=true&vCenter=true&width=650&lines=Book+with+confidence.;Manage+every+reservation.;Approve+users+seamlessly.;A+smarter+way+to+meet." alt="Typing animation" />

<br />

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/docs/Web/HTML)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=111827)](https://developer.mozilla.org/docs/Web/JavaScript)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-blueviolet?style=for-the-badge)](LICENSE)

<br />

A complete boardroom reservation solution for TASMA Group employees and administrators.

</div>

---

## ✨ Overview

TASMA Boardroom Booking System simplifies meeting-room reservations from discovery to confirmation. Employees can find available rooms, book time slots, and download booking passes, while administrators manage approvals, users, departments, quotas, and reservations.

```mermaid
flowchart LR
    A[Employee Registration] --> B{Admin Approval}
    B -->|Approved| C[Browse Boardrooms]
    C --> D[Select Date & Time]
    D --> E[Confirm Reservation]
    E --> F[Download PDF Pass]
    B -->|Rejected| G[Account Pending]
```

---

## 🎯 Features

<table>
<tr>
<td width="33%" valign="top">

### 👩‍💼 Employee

- Create and manage an account
- Browse available boardrooms
- Select dates and hourly slots
- Confirm and manage bookings
- Download reservation PDF passes
- Update profile information
- Use department-based features

</td>
<td width="33%" valign="top">

### 🛡️ Administrator

- Approve or reject registrations
- Manage user accounts
- Monitor department quotas
- Oversee registered-user limits
- Review and manage reservations
- Keep booking data organized

</td>
<td width="33%" valign="top">

### 💫 Experience

- Responsive desktop and tablet UI
- Dark and light themes
- Local demo data support
- Toast notifications
- Confirmation dialogs
- QR code support
- Cloud or local MongoDB storage

</td>
</tr>
</table>

---

## 🧰 Technology Stack

| Category | Technologies |
|:---|:---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Styling | Tailwind CSS |
| Icons | Font Awesome |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| PDF | jsPDF |
| QR Codes | QRCode.js |
| Email | Nodemailer |
| Environment | dotenv |

---

## 🗺️ System Architecture

```mermaid
flowchart TD
    U[User Browser] --> F[Frontend HTML, CSS & JavaScript]
    F -->|REST API| S[Express Server]
    S --> A[Authentication Routes]
    S --> B[User Management Routes]
    S --> C[Booking Routes]
    A --> D[(MongoDB)]
    B --> D
    C --> D
    S --> E[Email Notifications]
    F --> P[PDF Pass Generator]
```

---

## 📁 Project Structure

```text
Tasma_BoardRoom_Booking_System/
├── .env
├── .env.example
├── package.json
├── frontend/
│   ├── index.html
│   ├── assets/
│   │   └── images/
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── api.js
│       ├── admin.js
│       ├── app.js
│       ├── auth.js
│       ├── booking.js
│       ├── calendar.js
│       ├── data.js
│       ├── main.js
│       ├── pass.js
│       ├── profile.js
│       ├── tailwind-config.js
│       └── ui.js
├── backend/
│   ├── server.js
│   ├── seed.js
│   ├── create-admin.js
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── User.js
│   │   └── Booking.js
│   └── routes/
│       ├── authRoutes.js
│       ├── userRoutes.js
│       └── bookingRoutes.js
└── README.md
```

---

## 🚀 Getting Started

### ✅ Prerequisites

- Node.js 18 or newer
- npm
- MongoDB Atlas or a local MongoDB instance
- A Gmail account with an app password for email notifications

### 1️⃣ Install dependencies

```bash
npm install
```

### 2️⃣ Configure the environment

Create or update the `.env` file in the project root:

```env
PORT=5000

MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/boardroom_db

ADMIN_EMAIL=admin@tasmagroup.com

EMAIL_SERVICE=gmail
EMAIL_USER=your_company_email@gmail.com
EMAIL_PASS=your_google_app_password
```

> ⚠️ Never commit real database credentials or email app passwords to GitHub.

### 3️⃣ Start the application

```bash
npm start
```

Open:

```text
http://localhost:5000
```

The server can connect to MongoDB, seed default accounts, expose the API, and serve the frontend.

---

## 🔐 Default Accounts

| Role | Email | Purpose |
|:---|:---|:---|
| Administrator | `admin@tasmagroup.com` | Manage users, registrations, quotas, and reservations |
| Employee | `john@company.com` | Explore the employee booking experience |

> Change default credentials before deploying the application to a public environment.

---

## 🔄 Booking Workflow

```mermaid
sequenceDiagram
    participant E as Employee
    participant F as Frontend
    participant S as Express API
    participant D as MongoDB
    participant A as Administrator

    E->>F: Sign in
    F->>S: Authenticate
    S->>D: Validate account
    D-->>S: Approved account
    S-->>F: Access granted
    E->>F: Select room, date and time
    F->>S: Create reservation
    S->>D: Save booking
    D-->>S: Booking confirmed
    S-->>F: Confirmation
    F-->>E: Download PDF pass
    A->>F: Manage users and reservations
```

---

## 🧪 Development

Run the project in development mode:

```bash
npm run dev
```

For a custom port:

```env
PORT=5000
```

Then open:

```text
http://localhost:5000
```

---

## 🛡️ Security Recommendations

- Add `.env` to `.gitignore`
- Use strong administrator passwords
- Replace seeded credentials in production
- Restrict database network access
- Add server-side validation and rate limiting
- Implement secure session or JWT authentication
- Use HTTPS for public deployments
- Never expose credentials in frontend JavaScript

---

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature/your-feature
```

3. Commit your changes.

```bash
git commit -m "Add your feature"
```

4. Push the branch.

```bash
git push origin feature/your-feature
```

5. Open a pull request.

---

## 📜 License

Distributed for educational and organizational use. Add a `LICENSE` file if you want to publish a specific open-source license.

---

<div align="center">

### Made with 💜 by Suraj Sandeepa & Pathum Liyanage

**TASMA Group — IT Department**

[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=for-the-badge&logo=github)](https://github.com/Sandeepa02)

</div>
````
