# Application Requirements: CoFound - Cofounder Recruitment Platform

**Student Name:** [Your Name]  
**Course:** [Course Code]  
**Date:** November 12, 2025

---

## 1. Application Description

A web-based **Cofounder Recruitment Platform** that connects entrepreneurs seeking cofounders for their startup projects with talented individuals looking to join early-stage ventures. The platform enables users to create projects, browse opportunities, submit applications, manage teams, and receive email notifications throughout the application lifecycle. It exposes a REST API secured with JWT token-based authentication.

**Programming language used:** Java (JDK 17+)

**Frameworks/Databases:** Spring Boot, Spring Security, Spring Data JPA, MySQL, JavaMail, Lombok

---

## 2. Key Functionalities of the Application

a. **Register/Login System**
   - User registration with email verification
   - Email-based account activation (verification token with 24-hour expiry)
   - Login with username/password returning JWT token
   - Token-based authentication for all protected endpoints

b. **User Profile Management**
   - View own profile (id, username, email)
   - Manage user skills (add, view, delete)
   - Delete own account (with validation checks)

c. **Project Management (CRUD Operations)**
   - Create projects with title, description, team size needed, required skills
   - Read/Browse all projects or filter available projects (recruiting status, not full)
   - View project details including owner info, member count, required skills
   - View project team members (owner only)

d. **Application Workflow**
   - Submit application to projects (prevent duplicate applications)
   - View own submitted applications with status
   - Review applications for owned projects (with applicant details: name, email, skills)
   - Accept or reject applications (one-time decision, prevents re-processing)
   - Automatic team membership upon acceptance

e. **Email Notification System**
   - Verification email on registration with clickable activation link
   - Application status update emails (acceptance/rejection notifications)
   - Configurable SMTP settings (Gmail integration)

f. **Authorization & Security**
   - JWT token validation on all protected endpoints
   - Ownership-based permission checks (project owner authorization)
   - BCrypt password encryption
   - Secure configuration management (credentials in gitignored file)

---

## 3. Description of Entities and Relationships

### a. Class **User**
   - **id** (Long, primary key)
   - **username** (String, unique)
   - **email** (String, unique)
   - **password** (String, BCrypt encrypted)
   - **enabled** (boolean, default false until verified)
   - **Relationships:**
     - OneToMany: `projects` (Set<Project>) – projects owned by this user
     - ManyToMany: `joinedProjects` (Set<Project>) – projects user is member of
     - ManyToMany: `skills` (Set<Skill>) – user's skill set
     - OneToMany: `applications` (Set<ProjectApplication>) – applications submitted
     - OneToOne: `verificationToken` (VerificationToken) – email verification
     - ManyToMany: `roles` (Set<Role>) – user roles

### b. Class **Project**
   - **id** (Long, primary key)
   - **title** (String)
   - **description** (String, TEXT column)
   - **status** (String, e.g., "RECRUITING")
   - **teamSizeNeeded** (int) – target team size
   - **requiredSkills** (List<String>) – skills needed for project
   - **Relationships:**
     - ManyToOne: `owner` (User) – project creator/owner
     - ManyToMany: `members` (Set<User>) – accepted team members
     - OneToMany: `applications` (Set<ProjectApplication>) – applications to this project
     - OneToMany: `rolesNeeded` (Set<ProjectRoleNeeded>) – specific roles needed

### c. Class **ProjectApplication**
   - **id** (Long, primary key)
   - **status** (ApplicationStatus enum: PENDING, ACCEPTED, REJECTED)
   - **appliedAt** (Instant, timestamp of application)
   - **Relationships:**
     - ManyToOne: `applicant` (User) – user who applied
     - ManyToOne: `project` (Project) – project applied to

### d. Class **Skill**
   - **id** (Long, primary key)
   - **name** (String, unique) – skill name (e.g., "Java", "React")
   - **Relationships:**
     - ManyToMany: `users` (Set<User>) – users with this skill

### e. Class **VerificationToken**
   - **id** (Long, primary key)
   - **token** (String, unique) – UUID verification token
   - **expiryDate** (Instant) – 24 hours from creation
   - **Relationships:**
     - OneToOne: `user` (User, eager fetch) – user to be verified

### f. Class **Role**
   - **id** (Integer, primary key)
   - **name** (RoleEnum: ROLE_USER, ROLE_MEMBER, ROLE_POSTER)
   - **Relationships:**
     - ManyToMany: users who have this role

### g. Class **ProjectRoleNeeded** *(optional, future use)*
   - **id** (Long, primary key)
   - **roleName** (String) – e.g., "Backend Developer"
   - **description** (String)
   - **quantityNeeded** (int)
   - **Relationships:**
     - ManyToOne: `project` (Project)

---

## 4. UML Class Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                              User                                    │
├─────────────────────────────────────────────────────────────────────┤
│ - id: Long                                                          │
│ - username: String                                                  │
│ - email: String                                                     │
│ - password: String                                                  │
│ - enabled: boolean                                                  │
├─────────────────────────────────────────────────────────────────────┤
│ + getUsername(): String                                             │
│ + getEmail(): String                                                │
│ + isEnabled(): boolean                                              │
└──────────────┬────────────────┬─────────────────┬──────────────────┘
               │                │                 │
               │ owns           │ member of       │ has
               │ 1..*           │ *               │ *
               ▼                ▼                 ▼
      ┌────────────────┐  ┌──────────┐    ┌──────────────┐
      │    Project     │  │ Project  │    │    Skill     │
      ├────────────────┤  │ (members)│    ├──────────────┤
      │ - id: Long     │  └──────────┘    │ - id: Long   │
      │ - title        │                  │ - name       │
      │ - description  │                  └──────────────┘
      │ - status       │
      │ - teamSizeNeeded│
      │ - requiredSkills│
      └────────┬───────┘
               │ has
               │ 1..*
               ▼
      ┌─────────────────────────┐
      │  ProjectApplication     │
      ├─────────────────────────┤
      │ - id: Long              │
      │ - status: ApplicationStatus │
      │ - appliedAt: Instant    │
      └─────────────────────────┘

      ┌─────────────────────────┐
      │   VerificationToken     │
      ├─────────────────────────┤
      │ - id: Long              │
      │ - token: String         │
      │ - expiryDate: Instant   │
      └─────────────────────────┘
               │ verifies
               │ 1..1
               └────────────▶ User

      ┌─────────────────────────┐
      │        Role             │
      ├─────────────────────────┤
      │ - id: Integer           │
      │ - name: RoleEnum        │
      └─────────────────────────┘
               │ assigned to
               │ *
               └────────────▶ User
```

**Key Relationships:**
- User **owns** 0..* Projects (one-to-many)
- User **is member of** 0..* Projects (many-to-many via `project_members` table)
- User **has** 0..* Skills (many-to-many via `user_skills` table)
- User **submits** 0..* ProjectApplications (one-to-many)
- User **has** 0..1 VerificationToken (one-to-one)
- Project **receives** 0..* ProjectApplications (one-to-many)
- ProjectApplication **from** 1 User (many-to-one)
- ProjectApplication **to** 1 Project (many-to-one)

**Collections Used:**
- `Set<Project>` – user's owned and joined projects
- `Set<Skill>` – user's skills
- `Set<ProjectApplication>` – project's applications
- `Set<User>` – project's members
- `List<String>` – project's required skills
- `Set<Role>` – user's roles

---

## 5. Interfaces (Repositories)

### a. Interface **UserRepository** extends JpaRepository<User, Long>
   - `Optional<User> findByUsername(String username)`
   - `Boolean existsByUsername(String username)`
   - `Boolean existsByEmail(String email)`

### b. Interface **ProjectRepository** extends JpaRepository<Project, Long>
   - `@Query("SELECT p FROM Project p JOIN FETCH p.owner WHERE p.id = :id")`
   - `Optional<Project> findByIdWithOwner(@Param("id") Long id)`

### c. Interface **ProjectApplicationRepository** extends JpaRepository<ProjectApplication, Long>
   - `boolean existsByProjectIdAndApplicantId(Long projectId, Long applicantId)`
   - `@Query("SELECT pa FROM ProjectApplication pa JOIN FETCH pa.applicant a JOIN FETCH a.skills WHERE pa.project.id = :projectId")`
   - `List<ProjectApplication> findAllByProjectIdWithApplicantSkills(@Param("projectId") Long projectId)`

### d. Interface **SkillRepository** extends JpaRepository<Skill, Long>
   - `Optional<Skill> findByName(String name)`

### e. Interface **VerificationTokenRepository** extends JpaRepository<VerificationToken, Long>
   - `Optional<VerificationToken> findByToken(String token)`

---

## 6. REST API Endpoints

### Authentication Endpoints
- **POST** `/auth/register` – Register new user
- **POST** `/auth/login` – Login and receive JWT token
- **GET** `/auth/verify?token={token}` – Verify email address

### User Profile Endpoints
- **GET** `/api/users/me` – View own profile
- **GET** `/api/users/me/skills` – List own skills
- **POST** `/api/users/me/skills` – Add skills to profile
- **DELETE** `/api/users/me/skills/{skillName}` – Remove skill
- **DELETE** `/api/users/me` – Delete own account

### Project Endpoints
- **GET** `/api/projects` – List all projects
- **GET** `/api/projects/available` – List available projects (recruiting & not full)
- **POST** `/api/projects` – Create new project
- **GET** `/api/projects/{projectId}/team` – View team members (owner only)

### Application Endpoints
- **POST** `/api/applications/apply/project/{projectId}` – Apply to project
- **GET** `/api/applications/for-project/{projectId}` – List applications for project (owner only)
- **PATCH** `/api/applications/{applicationId}/status` – Accept/reject application (owner only)
- **GET** `/api/applications/my-applications` – View own applications

---

## 7. Security Implementation

- **JWT Token Generation:** JwtService creates tokens with username claim
- **JWT Validation:** JwtAuthFilter intercepts requests and validates tokens
- **Password Encryption:** BCryptPasswordEncoder for password hashing
- **Method-level Security:** @PreAuthorize annotations on endpoints
- **Ownership Authorization:** Controller methods verify project ownership before allowing operations

---

## 8. Email Service

- **SMTP Server:** Gmail (smtp.gmail.com:587)
- **Authentication:** Gmail App Password (2FA required)
- **Email Types:**
  - **Verification Email:** Sent on registration with activation link
  - **Application Status Email:** Sent when application is accepted/rejected
- **Configuration:** Externalized in `application.properties`

---

## 9. Data Persistence

- **Database:** MySQL
- **ORM:** Spring Data JPA with Hibernate
- **Transaction Management:** @Transactional annotations
- **Session Management:** `spring.jpa.open-in-view=false` with DTOs to prevent lazy loading issues
- **Schema Management:** `spring.jpa.hibernate.ddl-auto=update`

---

## 10. Additional Diagrams

### Entity-Relationship Diagram (ERD)

```
┌─────────┐           ┌───────────────┐           ┌─────────┐
│  users  │───────────│  user_roles   │───────────│  roles  │
└────┬────┘           └───────────────┘           └─────────┘
     │
     │ 1
     │
     │ *                ┌──────────────────────┐
     ├──────────────────│ verification_tokens   │
     │                  └──────────────────────┘
     │
     │ 1                ┌──────────────┐
     ├──────────────────│ user_skills  │───────┐
     │ *                └──────────────┘       │ *
     │                                         │
     │                                    ┌────▼────┐
     │                                    │ skills  │
     │                                    └─────────┘
     │ owner_id
     │ 1
     │
     │ *           ┌──────────────┐
     ├─────────────│   projects   │
     │             └──────┬───────┘
     │                    │ 1
     │                    │
     │ *                  │ *
     ├────────────────────├──────────┐
     │                    │          │
┌────▼──────────────┐     │    ┌─────▼──────────┐
│ project_members   │     │    │ project_applications │
└───────────────────┘     │    └─────┬──────────┘
                          │          │ applicant_id
                          │          │
                          └──────────┘
                            project_id
```

### Application Workflow Diagram

```
┌────────────┐
│   User     │
│ Registers  │
└─────┬──────┘
      │
      ▼
┌─────────────────────┐
│ Verification Email  │
│      Sent           │
└─────┬───────────────┘
      │
      ▼
┌─────────────────────┐       ┌──────────────────┐
│ User Clicks Link    │──────▶│  Account Enabled │
└─────────────────────┘       └────────┬─────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │  User Logs In   │
                              │ (receives JWT)  │
                              └────────┬────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    ▼                  ▼                  ▼
          ┌─────────────────┐  ┌──────────────┐  ┌─────────────┐
          │ Create Project  │  │Browse Projects│  │Manage Skills│
          └────────┬────────┘  └──────┬───────┘  └─────────────┘
                   │                  │
                   │ (becomes owner)  │ (apply)
                   │                  │
                   ▼                  ▼
          ┌──────────────────┐  ┌──────────────────────┐
          │ Review Applications│  │ Submit Application   │
          │ (with skills)      │  │ (PENDING status)     │
          └────────┬───────────┘  └──────────────────────┘
                   │
                   │
        ┌──────────┴─────────┐
        ▼                    ▼
┌───────────────┐    ┌────────────────┐
│ ACCEPT        │    │ REJECT         │
│ (add to team) │    │ (notify only)  │
└───────┬───────┘    └────────┬───────┘
        │                     │
        └──────────┬──────────┘
                   │
                   ▼
          ┌────────────────────┐
          │  Send Email to     │
          │  Applicant         │
          └────────────────────┘
```

---

## 11. Testing

All functionality tested via **Postman**:
- Registration → Verification → Login flow
- Project CRUD operations
- Application submission and duplicate prevention
- Accept/reject workflow with one-time decision enforcement
- Skill management (add, list, remove)
- Account deletion with ownership validation
- Authorization checks (403 for unauthorized access)
- Email delivery verification

---

## 12. Maven Build

**Build command:**
```bash
mvn clean package
```

**Run command:**
```bash
java -jar target/cofound-0.0.1-SNAPSHOT.jar
```

**Key Maven dependencies:**
- `spring-boot-starter-web` – REST API
- `spring-boot-starter-data-jpa` – JPA/Hibernate
- `spring-boot-starter-security` – Security & JWT
- `spring-boot-starter-mail` – Email service
- `mysql-connector-j` – MySQL driver
- `jjwt-api`, `jjwt-impl`, `jjwt-jackson` – JWT library
- `lombok` – Boilerplate reduction
- `jackson-databind` – JSON processing

---

## 13. Configuration Management

- **Active config:** `application.properties` (gitignored)
- **Template:** `application-example.properties` (committed)
- **Secret management:** Database credentials, JWT secret, email password excluded from version control
- **.gitignore:** Excludes `application.properties`, `target/`, `.idea/`, etc.

---

**End of Document**



