# CoFound: Cofounder Recruitment Platform
## Application Requirements Document

**Student Name:** [Your Name]  
**Course:** [Course Name]  
**Date:** November 12, 2025  
**Project:** CoFound - A Platform for Startup Cofounder Recruitment

---

## 1. Introduction

### 1.1 Purpose
CoFound is a web-based platform designed to connect aspiring entrepreneurs who have project ideas but limited budgets with talented individuals seeking to join early-stage startups as cofounders. The system facilitates project posting, application management, team building, and communication through email notifications.

### 1.2 Scope
This document describes the functional and technical requirements for the CoFound application, including:
- User registration and authentication with email verification
- Project creation and management
- Application submission and review process
- Team member management
- User skill profiles
- Email notification system

### 1.3 Target Users
- **Project Owners:** Entrepreneurs seeking cofounders for their startup ideas
- **Applicants:** Developers, designers, and other professionals seeking cofounder opportunities

---

## 2. System Overview

### 2.1 System Description
CoFound is a RESTful web application built using Spring Boot framework with the following key features:
- Secure JWT-based authentication
- Role-based access control
- Email verification for account activation
- Project lifecycle management
- Application workflow (pending → accepted/rejected)
- Real-time email notifications
- User skill management

### 2.2 Technology Stack
- **Backend Framework:** Spring Boot 3.x (Java 17+)
- **Build Tool:** Maven
- **Database:** MySQL
- **Security:** Spring Security with JWT
- **Email Service:** JavaMailSender (Gmail SMTP)
- **ORM:** Spring Data JPA (Hibernate)
- **Development Tools:** Lombok for boilerplate reduction

---

## 3. Functional Requirements

### 3.1 User Management

#### 3.1.1 User Registration
- **FR-1.1:** Users can register with username, email, and password
- **FR-1.2:** System assigns a single base role (ROLE_USER) to all registered users
- **FR-1.3:** New accounts are created in disabled state pending email verification
- **FR-1.4:** System generates unique verification token and sends verification email
- **FR-1.5:** Verification token expires after 24 hours

#### 3.1.2 Email Verification
- **FR-2.1:** Users receive verification email upon registration
- **FR-2.2:** Users can verify account by clicking link with unique token
- **FR-2.3:** System enables account upon successful verification
- **FR-2.4:** Invalid or expired tokens return appropriate error messages

#### 3.1.3 User Authentication
- **FR-3.1:** Users can log in with username and password
- **FR-3.2:** System returns JWT token upon successful authentication
- **FR-3.3:** Unverified accounts receive 403 Forbidden error on login attempt
- **FR-3.4:** Invalid credentials receive 401 Unauthorized error

#### 3.1.4 User Profile Management
- **FR-4.1:** Users can view their own profile (id, username, email)
- **FR-4.2:** Users can add skills to their profile
- **FR-4.3:** Users can remove skills from their profile
- **FR-4.4:** Users can view list of their current skills
- **FR-4.5:** Skills are normalized (stored once in database, linked many-to-many)

#### 3.1.5 Account Deletion
- **FR-5.1:** Users can delete their own account
- **FR-5.2:** System prevents deletion if user owns active projects
- **FR-5.3:** System removes user from all joined project teams before deletion
- **FR-5.4:** System cascades deletion to related entities (applications, tokens)

### 3.2 Project Management

#### 3.2.1 Project Creation
- **FR-6.1:** Authenticated users can create new projects
- **FR-6.2:** Project must include title and description
- **FR-6.3:** Projects can specify team size needed (optional)
- **FR-6.4:** Projects can list required skills (optional)
- **FR-6.5:** Creator automatically becomes project owner
- **FR-6.6:** New projects have status "RECRUITING"

#### 3.2.2 Project Browsing
- **FR-7.1:** Authenticated users can view all projects
- **FR-7.2:** Users can filter to view only available projects
- **FR-7.3:** Available projects are those with status "RECRUITING" and not full
- **FR-7.4:** Project listings show: title, description, status, required skills, team size, current member count, and owner information

#### 3.2.3 Team Management
- **FR-8.1:** Project owners can view their project team members
- **FR-8.2:** Team member information includes: id, username, email
- **FR-8.3:** Only project owner can access team view for their projects
- **FR-8.4:** Accepted applicants are automatically added to project team

### 3.3 Application Management

#### 3.3.1 Application Submission
- **FR-9.1:** Authenticated users can apply to any project
- **FR-9.2:** System prevents duplicate applications to same project
- **FR-9.3:** New applications default to PENDING status
- **FR-9.4:** Application timestamp is automatically recorded

#### 3.3.2 Application Review
- **FR-10.1:** Project owners can view all applications for their projects
- **FR-10.2:** Application details include: applicant name, email, skills, status, application date
- **FR-10.3:** Only project owner can view applications for their projects
- **FR-10.4:** Applicants can view their own submitted applications

#### 3.3.3 Application Decision
- **FR-11.1:** Project owners can accept or reject pending applications
- **FR-11.2:** System prevents modifying already processed applications
- **FR-11.3:** Accepted applicants are added to project members automatically
- **FR-11.4:** System sends email notification to applicant upon decision
- **FR-11.5:** Email includes project title and decision (accepted/rejected)

### 3.4 Notification System

#### 3.4.1 Email Notifications
- **FR-12.1:** System sends verification email upon registration
- **FR-12.2:** Verification email includes clickable link with unique token
- **FR-12.3:** System sends notification when application is accepted
- **FR-12.4:** System sends notification when application is rejected
- **FR-12.5:** All emails are sent from configured Gmail account

---

## 4. Non-Functional Requirements

### 4.1 Security
- **NFR-1.1:** Passwords must be encrypted using BCrypt
- **NFR-1.2:** JWT tokens must be used for API authentication
- **NFR-1.3:** Sensitive endpoints must require valid JWT
- **NFR-1.4:** Authorization must be enforced via ownership checks
- **NFR-1.5:** Database credentials must not be committed to version control

### 4.2 Performance
- **NFR-2.1:** API responses should complete within 2 seconds under normal load
- **NFR-2.2:** Database queries should use appropriate indexes
- **NFR-2.3:** Lazy-loading must be handled to prevent N+1 query issues
- **NFR-2.4:** Email sending should not block API responses

### 4.3 Reliability
- **NFR-3.1:** System should validate all user inputs
- **NFR-3.2:** System should provide clear error messages
- **NFR-3.3:** Database transactions should maintain data consistency
- **NFR-3.4:** Failed email sends should not cause transaction rollbacks

### 4.4 Maintainability
- **NFR-4.1:** Code should follow Spring Boot best practices
- **NFR-4.2:** Configuration should be externalized in properties files
- **NFR-4.3:** DTOs should be used to prevent lazy-loading issues
- **NFR-4.4:** API documentation should be provided (API_Requests.txt)

### 4.5 Usability
- **NFR-5.1:** API responses should use standard HTTP status codes
- **NFR-5.2:** Error messages should be user-friendly
- **NFR-5.3:** REST endpoints should follow RESTful conventions
- **NFR-5.4:** Response formats should be consistent (JSON)

---

## 5. System Architecture

### 5.1 Architecture Overview
CoFound follows a layered architecture pattern:

```
┌─────────────────────────────────────┐
│     Client (Postman / Frontend)     │
└─────────────────┬───────────────────┘
                  │ HTTP/REST + JWT
┌─────────────────▼───────────────────┐
│        Spring Security Layer        │
│    (JWT Filter, Authorization)      │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│       REST Controllers              │
│  (Authentication, Project,          │
│   Application, User)                │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│          Service Layer              │
│  (Business Logic, Validation,       │
│   Email, Verification)              │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│       Repository Layer              │
│   (Spring Data JPA Interfaces)      │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│         MySQL Database              │
└─────────────────────────────────────┘
```

### 5.2 Domain Model

#### 5.2.1 Core Entities
1. **User**
   - Primary entity representing system users
   - Fields: id, username, email, password (encrypted), enabled
   - Relationships:
     - OneToMany with Project (owned projects)
     - ManyToMany with Project (joined projects via members)
     - ManyToMany with Skill
     - OneToMany with ProjectApplication
     - OneToOne with VerificationToken

2. **Project**
   - Represents startup projects seeking cofounders
   - Fields: id, title, description, status, teamSizeNeeded, requiredSkills
   - Relationships:
     - ManyToOne with User (owner)
     - ManyToMany with User (members)
     - OneToMany with ProjectApplication
     - OneToMany with ProjectRoleNeeded

3. **ProjectApplication**
   - Represents application from user to project
   - Fields: id, status (PENDING/ACCEPTED/REJECTED), appliedAt
   - Relationships:
     - ManyToOne with User (applicant)
     - ManyToOne with Project

4. **Skill**
   - Normalized skill entity
   - Fields: id, name (unique)
   - Relationships:
     - ManyToMany with User

5. **VerificationToken**
   - Email verification tokens
   - Fields: id, token (unique), expiryDate
   - Relationships:
     - OneToOne with User (eager fetch)

6. **Role**
   - User authorization roles
   - Fields: id, name (enum: ROLE_USER)
   - Relationships:
     - ManyToMany with User

#### 5.2.2 Collections Used
- `Set<Project>` for user's owned projects
- `Set<Project>` for user's joined projects
- `Set<Skill>` for user skills
- `Set<ProjectApplication>` for project applications
- `Set<User>` for project members
- `List<String>` for project required skills

### 5.3 REST API Design

#### 5.3.1 Authentication Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login (returns JWT)
- `GET /auth/verify` - Email verification

#### 5.3.2 Project Endpoints
- `GET /api/projects` - List all projects
- `GET /api/projects/available` - List available projects
- `POST /api/projects` - Create new project
- `GET /api/projects/{id}/team` - View project team

#### 5.3.3 Application Endpoints
- `POST /api/applications/apply/project/{id}` - Submit application
- `GET /api/applications/for-project/{id}` - View project applications
- `PATCH /api/applications/{id}/status` - Accept/reject application
- `GET /api/applications/my-applications` - View own applications

#### 5.3.4 User Endpoints
- `GET /api/users/me` - View own profile
- `GET /api/users/me/skills` - List own skills
- `POST /api/users/me/skills` - Add skills
- `DELETE /api/users/me/skills/{skill}` - Remove skill
- `DELETE /api/users/me` - Delete account

---

## 6. Implementation Details

### 6.1 Security Implementation

#### 6.1.1 JWT Authentication
- JwtService generates and validates JWT tokens
- JwtAuthFilter intercepts requests and validates tokens
- Tokens include username claim
- UserDetailsServiceImpl loads user details for authentication

#### 6.1.2 Password Encryption
- BCryptPasswordEncoder used for password hashing
- Passwords never stored in plain text
- Password validation on login

#### 6.1.3 Authorization
- Method-level security with @PreAuthorize
- Ownership checks in controller methods
- Single role (ROLE_USER) with ownership-based permissions

### 6.2 Email Service Implementation

#### 6.2.1 Configuration
- Gmail SMTP server (smtp.gmail.com:587)
- STARTTLS encryption enabled
- Authentication via Gmail App Password
- Configurable sender address

#### 6.2.2 Email Types
1. **Verification Email**
   - Sent on registration
   - Contains verification link with token
   - 24-hour expiration
   
2. **Application Status Email**
   - Sent on accept/reject decision
   - Includes project title and status
   - Personalized to applicant

### 6.3 Data Persistence

#### 6.3.1 Database Configuration
- MySQL database
- Spring Data JPA for ORM
- Hibernate as JPA implementation
- `spring.jpa.hibernate.ddl-auto=update` for schema management

#### 6.3.2 Transaction Management
- @Transactional annotations on service and controller methods
- Read-only transactions for queries
- Write transactions for modifications
- `open-in-view=false` to prevent lazy loading issues

#### 6.3.3 Lazy Loading Strategy
- DTOs used to avoid LazyInitializationException
- Fetch joins for required associations
- Eager loading only for critical relationships (e.g., VerificationToken.user)

---

## 7. Testing and Validation

### 7.1 API Testing
All endpoints tested using Postman:
- Registration flow (register → verify → login)
- Project creation and browsing
- Application submission and review
- Skill management
- Account deletion
- Error cases (duplicate apply, invalid token, unauthorized access)

### 7.2 Validation Rules
1. **Registration**
   - Username and email must be unique
   - Password must meet complexity requirements
   
2. **Applications**
   - Cannot apply twice to same project
   - Cannot modify already processed applications
   
3. **Projects**
   - Only owner can view applications and team
   - Only owner can accept/reject applications
   
4. **Account Deletion**
   - Cannot delete if owning projects
   - Cleanup of memberships before deletion

### 7.3 Test Scenarios
- **Scenario 1:** User registers, verifies, creates project
- **Scenario 2:** User applies to project, owner reviews and accepts
- **Scenario 3:** User attempts duplicate application (rejected)
- **Scenario 4:** User attempts to delete account while owning project (rejected)
- **Scenario 5:** User adds/removes skills from profile
- **Scenario 6:** Owner views applicant skills during review

---

## 8. Configuration Management

### 8.1 Configuration Files
- `application.properties` - Active configuration (gitignored)
- `application-example.properties` - Template with placeholders
- `.gitignore` - Excludes sensitive files

### 8.2 Configuration Parameters
```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/cofound_db
spring.datasource.username=root
spring.datasource.password=<your-password>

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.open-in-view=false

# JWT
jwt.secret=<your-secret-key>

# Email
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=<your-email@gmail.com>
spring.mail.password=<your-app-password>

# Application
app.url=http://localhost:8080
```

---

## 9. Maven Project Requirements

### 9.1 Maven Structure
- Standard Maven project structure
- `pom.xml` with Spring Boot parent
- Dependencies managed via Maven

### 9.2 Key Dependencies
```xml
<!-- JSON Processing -->
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
</dependency>

<!-- Spring Boot Starters -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>

<!-- JWT -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
</dependency>

<!-- MySQL -->
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
</dependency>

<!-- Lombok -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
</dependency>
```

### 9.3 Build and Run
```bash
# Build project
mvn clean package

# Run application
java -jar target/cofound-0.0.1-SNAPSHOT.jar

# Or run directly
mvn spring-boot:run
```

---

## 10. Project Deliverables

### 10.1 Source Code
- Complete Spring Boot application
- Controllers, Services, Repositories, Models
- Security configuration
- Email service implementation

### 10.2 Documentation
- API_Requests.txt - Complete API documentation with examples
- application-example.properties - Configuration template
- README (if created) - Setup instructions

### 10.3 Database
- SQL schema (auto-generated by Hibernate)
- data.sql - Initial role data

### 10.4 UML Diagrams
- Class diagram showing entities and relationships
- Must include at least 4 classes and 2 interfaces
- Must show collections (Set, List, Map)

---

## 11. Future Enhancements

### 11.1 Planned Features
1. **Advanced Project Search**
   - Filter by skills
   - Filter by team size
   - Search by keywords

2. **Rich Project Roles**
   - Expose ProjectRoleNeeded entity
   - Specify quantity needed per role
   - Role-specific descriptions

3. **Data Export/Import**
   - JSON format export
   - Java Object Stream serialization
   - File size and performance comparison

4. **Input Validation**
   - Bean Validation annotations (@NotBlank, @Email, @Min)
   - Custom validators for business rules
   - Comprehensive error messages

5. **Exception Handling**
   - Custom exception classes (ProjectOwnershipException, etc.)
   - Global exception handler (@ControllerAdvice)
   - Standard error response format

6. **Enhanced Notifications**
   - HTML email templates
   - In-app notification center
   - Configurable notification preferences

---

## 12. Conclusion

CoFound successfully implements a functional cofounder recruitment platform with secure authentication, email verification, project management, application workflows, and team building features. The application demonstrates:

- Strong understanding of Spring Boot ecosystem
- Proper security implementation with JWT
- Effective use of Spring Data JPA and Hibernate
- Email integration for user communications
- RESTful API design principles
- Transaction management and lazy-loading handling

The system provides a solid foundation for connecting entrepreneurs with potential cofounders, reducing the barrier to entry for early-stage startups.

---

## Appendices

### Appendix A: Entity Relationship Diagram
[Include diagram showing relationships between User, Project, ProjectApplication, Skill, VerificationToken, Role]

### Appendix B: API Request Examples
See `API_Requests.txt` for complete collection of API requests with:
- Request methods and URLs
- Required headers
- Request body examples
- Response examples
- Error scenarios

### Appendix C: Configuration Template
See `application-example.properties` for complete configuration template

---

**Document Version:** 1.0  
**Last Updated:** November 12, 2025



