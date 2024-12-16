# Project 2

This project is a web application David Smith's Driveway Sealing business. This is a locally owned and operated
          business specializing in premium driveway maintenance and sealing
          services. With over a decade of experience, David and his team are
          dedicated to helping homeowners and businesses protect and enhance the
          appearance of their driveways.
          
## Prerequisites

Before you begin, ensure you have met the following requirements:
- **Node.js** (v14 or later) and npm (Node Package Manager)
- **MySQL** (Ensure that you have MySQL installed and running)
- **XAMPP**

## How to Run the Project

Follow these steps to clone and run this project on your local machine.

### Step 1: Clone the Repository

First, clone this repository to your local machine.

```bash
git clone https://github.com/Nathan-Chantiny/CSC-4710-Project-2.git
```

 
After cloning, navigate into the project directory:

```bash
cd CSC-4710-Project-2
```

### Step 2: Set Up the Backend (Express & MySQL)

1. **Navigate to the `backend` directory**:

   ```bash
   cd backend
   ```

2. **Install the backend dependencies**:

   ```bash
   npm install bcrypt body-parser cors eslint-plugin-react-hooks express jsonwebtoken multer mysql2
   ```

3. **Create the MySQL Database and Table**:

   - Start your MySQL service (using XAMPP).
   - Open a MySQL client:

   ```sql
   CREATE DATABASE jwt_auth_db;

   USE jwt_auth_db;

4. **Import the MySQL Database and Table**:
   
   - Navigate to the Import tab of in SQL admin portal
   - Click the import button, then choose the provided sql file to import all the tables into the database.


4. **Start the backend server**:

   ```bash
   npm start
   ```

   The backend will run on `http://localhost:5000`.

### Step 3: Set Up the Frontend (React)

1. **Navigate to the `frontend` directory**:

   ```bash
   cd ../frontend
   ```

2. **Install the frontend dependencies**:

   ```bash
   npm install @testing-library/jest-dom @testing-library/react @testing-library/user-event axios eslint-plugin-react-hooks jwt-decode multer react react-dom react-router-dom react-scripts web-vitals
   ```

3. **Start the frontend server**:

   ```bash
   npm start
   ```

   The frontend will run on `http://localhost:3000`.

### Step 4: Usage

1. **Access the Web Application**:

  - Web application will open automatically upon start the frontend server, if it does not, follow the step below...
  - Open your browser and go to `http://localhost:3000`. This will load the homepage of the application.

3. **Registration**:

   - To create a new user, go to the **Register** page (`http://localhost:3000/register`) and fill in the registration form.

4. **Login**:

   - After registering, log in using the **Login** page (`http://localhost:3000/login`).
   - On successful login, a JWT (JSON Web Token) will be generated and stored in your browser's **localStorage**.


### Troubleshooting

- **MySQL Connection Issues**: Ensure that MySQL is running and your credentials (username, password, database) in `backend/server.js` are correct.
- **Port Conflicts**: If `localhost:5000` (backend) or `localhost:3000` (frontend) is already in use, make sure to close any services occupying those ports or change the port number.
