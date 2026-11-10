# TASMA Boardroom Booking System

A modern, responsive boardroom reservation portal designed for TASMA Group employees and administrators. The system allows staff to book meeting rooms, manage their bookings, and enables admins to review member registrations and enforce department booking limits.

## Overview

The TASMA Boardroom Booking System is a front-end web application built with HTML, Tailwind CSS, and vanilla JavaScript. It simulates a real corporate booking workflow with:

- employee login and registration
- admin approval flow
- boardroom selection
- date and time-slot booking
- reservation tracking
- profile management
- PDF pass generation
- dark mode UI
- local storage persistence for demo data

## Features

### Employee Experience
- Secure employee sign-in
- Registration with approval requirement
- Department-based access rules
- Boardroom selection for available spaces
- Calendar-based date picker
- Hourly time slot selection
- Reservation confirmation flow
- "My Bookings" dashboard to review and manage bookings
- PDF pass download for confirmed reservations
- User profile updates

### Admin Controls
- Admin login portal
- Pending user approvals
- Department quota tracking
- Limit enforcement for registered users per department
- Reservation and account oversight

### User Experience
- Clean enterprise dashboard UI
- Responsive layout for desktop and tablet
- Dark mode support
- Modern card-based design
- Toast notifications and modal confirmations

## Tech Stack

- HTML5
- CSS3
- JavaScript (Vanilla JS)
- Tailwind CSS
- Font Awesome
- jsPDF
- QRCode.js

## Project Structure

```text
Tasma_BoardRoom_Booking_System/
├── assets/
│   └── images/
├── css/
│   └── styles.css
├── js/
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
├── index.html
├── README.md
└── LICENSE (if present)
