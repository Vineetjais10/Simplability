# Uncompromised Backend

A backend system for automating land allocation to farmers, built using Node.js and PostgreSQL. It ensures efficient use of available land by providing task scheduling, time tracking, resource management, and progress monitoring for farmers. Administrators also get insights through detailed reports and analytics.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Branch Details](#branch-details)
- [Installation](#installation)

## Features

### Admin Features:
- Manage land allocation to farmers
- Assign tasks with deadlines and track progress
- Monitor resource allocation (seeds, tools, fertilizers, etc.)
- Generate reports and analytics for land use and task completion

### User (Farmer) Features:
- View assigned tasks with deadlines
- Real-time progress tracking of tasks
- Receive notifications and reminders for upcoming tasks
- Report task completion

## Technologies Used

- **Node.js (v20.9.0)**: Backend development using JavaScript runtime.
- **Express**: Web application framework for building the RESTful API.
- **PostgreSQL**: Relational database for storing land allocation, tasks, farmer details, and progress.
- **Redis**: Used for caching and managing sessions to enhance performance and scalability.
- **Docker**: Containerization for easy deployment and consistent environments.
- **AWS**: For uploading and storing CSV files containing land allocation and farmer data.

## Branch Details

The project uses two main branches to manage the development workflow effectively:

- **Development Branch**:  
  This branch is used for active development, including writing, testing, and debugging code. Developers should pull this branch to work on new features or bug fixes. It contains the latest updates that may not yet be stable for production or client use.

- **Staging Branch**:  
  This branch is used for client-facing purposes. It serves as a stable environment where changes from the development branch are tested thoroughly before being deployed to production. Clients can use this branch to preview updates and provide feedback.

## Installation

Follow these steps to set up and run the project locally for development:

### Prerequisites

Ensure the following are installed on your system:

- **Node.js**: v20.9.0
- **npm**: Comes with Node.js
- **PostgreSQL**: Installed and running
- **Docker**: Installed and running

### Steps

1. **Clone the repository**:

   ```bash
   git clone https://github.com/GKMIT/uncompromised-backend.git
   cd uncompromised-backend
   ```

2. **Install dependencies**:

   ```bash
   npm start
   ```

3. Setup environment variables as given in .env.sample

4. **Run migration**:
   ```bash
   npm run migrate
   ```

5. **Run seed**:

   ```bash
   npm run seed
   ```

6. **Start Server**:


   ```bash
   npm run dev
   ```