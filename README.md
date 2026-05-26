# CoFound

CoFound is a dedicated collaboration platform designed to bridge the gap between visionary startup founders and skilled professionals looking to join a team. Built for students, developers, and entrepreneurs, the application facilitates meaningful connections through detailed profiles, skill matching, and project-based communication.

Rather than a freelancer marketplace, CoFound focuses on side-projects, equity-based collaborations, and early-stage startup matchmaking ("founder dating").

---

## Key Features

- **Founder Dating & Profiles**: Create detailed profiles with professional biographies, links (GitHub, LinkedIn), and categorized skill sets.
- **Project Listings**: Post startup ideas, specify required team sizes, and list target skills for potential co-founders.
- **Application Workflow**: Apply to projects with a single click. Project owners can review, accept, or reject applications.
- **Real-Time Communication**: Chat directly with team members in real-time using integrated WebSockets.
- **Skill Endorsements & Peer Reviews**: Rate teammates and endorse skills after project milestones, building trust in the community.
- **Notification Engine**: Receive immediate alerts for new applications, network requests, and project updates.

---

## Tech Stack

- **Backend**: Java Spring Boot 3, Hibernate JPA, Spring Security (JWT, Role-Based Access)
- **Frontend**: React 18, React-Bootstrap, Vite
- **Database**: H2 Database (local development) / PostgreSQL / MySQL (production ready)
- **Communication**: WebSockets (STOMP) for chat and alerts

---

## Getting Started

### Prerequisites
- **Java JDK 17** or higher
- **Node.js** (v18 or higher) and **npm**
- **Docker** (optional, for local MySQL)

### Running the Backend
1. Configure your email credentials in `src/main/resources/application.properties` (used for sending verification links):
   ```properties
   spring.mail.username=YOUR_EMAIL@gmail.com
   spring.mail.password=YOUR_APP_PASSWORD
   ```
2. Start the backend using the helper script:
   ```bash
   ./start-backend.sh
   ```
   *The server runs at `http://localhost:8080`.*

### Running the Frontend
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   *The client opens at `http://localhost:5173`.*

---

## Database Configuration

The application automatically supports dynamic configuration out of the box. 

### Local Development (H2)
By default, the application runs using an embedded H2 file database (`./data/cofound_db`) which requires no external setup.

### Local Development (MySQL via Docker)
1. Start the MySQL container:
   ```bash
   docker-compose up -d
   ```
2. Run your server setting these environment variables:
   ```bash
   export SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/cofound_db"
   export SPRING_DATASOURCE_USERNAME="root"
   export SPRING_DATASOURCE_PASSWORD="your_mysql_password"
   export SPRING_DATASOURCE_DRIVER_CLASS_NAME="com.mysql.cj.jdbc.Driver"
   export SPRING_JPA_DATABASE_PLATFORM="org.hibernate.dialect.MySQLDialect"
   ./start-backend.sh
   ```
