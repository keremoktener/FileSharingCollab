# File Sharing Collaboration Platform

A secure file sharing and collaboration platform built with Spring Boot (Java) backend and React (TypeScript) frontend.

## Project Structure

This project consists of two main parts:
- `backend`: Spring Boot application with JWT authentication, file operations, and PostgreSQL integration
- `frontend`: React application with TypeScript and Tailwind CSS for styling

## Features

- User authentication (register, login, logout)
- File operations (upload, download, list, delete)
- Secure storage of files and metadata
- Clean, responsive UI

## Tech Stack

### Backend
- Java 17
- Spring Boot 3.1.x
- Spring Security with JWT authentication
- PostgreSQL for data storage
- Lombok for reducing boilerplate code
- Swagger/OpenAPI for API documentation

### Frontend
- React 18
- TypeScript
- React Router for navigation
- Axios for API communication
- Tailwind CSS for styling
- React Hot Toast for notifications

## Setup and Installation

### Prerequisites
- Java 17
- Node.js and npm
- PostgreSQL

### Backend Setup
1. Create a PostgreSQL database named `filesharing`
2. Navigate to the `backend` directory
3. Copy `.env.example` to `.env` and configure your database credentials
4. Run the backend using Gradle:
   ```
   ./gradlew bootRun
   ```
5. The API will be available at `http://localhost:8080/api`

### Frontend Setup
1. Navigate to the `frontend` directory
2. Copy `.env.example` to `.env`
3. Install dependencies:
   ```
   npm install
   ```
4. Start the development server:
   ```
   npm start
   ```
5. The frontend will be available at `http://localhost:3000`

## API Documentation

Once the backend is running, you can access the Swagger UI at `http://localhost:8080/swagger-ui.html` to explore and test the API endpoints.

## Future Enhancements (Phase 2)

- Sharing files with other users
- File versioning
- Comments and collaboration features
- Folder organization
- Enhanced permission system 