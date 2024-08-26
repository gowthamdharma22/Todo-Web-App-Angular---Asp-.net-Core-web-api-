# Todo App with Angular Frontend and ASP.NET Core Backend

This project is a Todo application featuring an Angular frontend and an ASP.NET Core Web API backend. The application includes JWT-based authentication with refresh token functionality.

## Setup Instructions

### Prerequisites

- Node.js
- .NET SDK
- Git

### Frontend (Angular)

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the Angular development server:
   ```bash
   ng serve
   ```

### Backend (ASP.NET Core)

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Restore NuGet packages:
   ```bash
   dotnet restore
   ```

3. Update the database:
   ```bash
   dotnet ef database update
   ```

4. Run the ASP.NET Core server:
   ```bash
   dotnet run
   ```

### Environment Configuration

- Ensure your environment variables and settings (like JWT keys) are properly configured in the `appsettings.json` (backend) and the `environment` files (frontend).

---

This README provides basic setup instructions and highlights the JWT refresh token implementation in your project.
