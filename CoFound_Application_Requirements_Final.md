# Application Requirements: CoFound - Cofounder Recruitment Platform

**Student Name:** [Your Name]  
**Course:** [Course Code]  
**Date:** November 12, 2025

---

## 1. Add a description of the application you are implementing

A web-based **Cofounder Recruitment Platform** that lets users browse and create startup projects, apply to join teams, and manage applications. Project owners can review applicants (with their skills and contact info) and accept or reject them. The system sends email notifications for account verification and application decisions. It exposes a REST API secured with JWT token-based authentication.

**Programming language used:** Java (JDK 17+)

**Frameworks/databases:** MySQL, Spring Boot, Spring Security, Spring Data JPA, JavaMail, Lombok

---

## 2. Key functionalities of the application

a. **A register/login system** (username/password, JWT token-based authentication) with email verification (24-hour expiry token).

b. **Ability to create, read, update, and delete** projects, users, skills, and applications in the application (via HTTP REST API).

c. **Application workflow:** submit application to project, view applications (with applicant skills), accept/reject once (auto-add to team on accept).

d. **Filter available projects** by status (RECRUITING) and team capacity (members < teamSizeNeeded).

e. **Email notifications:** verification email on registration, application status email (accepted/rejected) with project title.

f. **User skill management:** add, view, and remove skills; project owners see applicant skills during review.

---

## 3. Description of entities and relationships

### a. Class **User**
   - **id** (Long)
   - **username** (String, unique)
   - **email** (String, unique)
   - **password** (String, BCrypt encrypted)
   - **enabled** (boolean)
   - **Relationships:**
     - Set<Project> projects (owned)
     - Set<Project> joinedProjects (member of)
     - Set<Skill> skills
     - Set<ProjectApplication> applications
     - VerificationToken verificationToken
     - Set<Role> roles

### b. Class **Project**
   - **id** (Long)
   - **title** (String)
   - **description** (String)
   - **status** (String, e.g. "RECRUITING")
   - **teamSizeNeeded** (int)
   - **requiredSkills** (List<String>)
   - **Relationships:**
     - User owner
     - Set<User> members
     - Set<ProjectApplication> applications
     - Set<ProjectRoleNeeded> rolesNeeded

### c. Class **ProjectApplication**
   - **id** (Long)
   - **status** (ApplicationStatus: PENDING, ACCEPTED, REJECTED)
   - **appliedAt** (Instant)
   - **Relationships:**
     - User applicant
     - Project project

### d. Class **Skill**
   - **id** (Long)
   - **name** (String, unique)
   - **Relationships:**
     - Set<User> users (many-to-many)

### e. Class **VerificationToken**
   - **id** (Long)
   - **token** (String, unique UUID)
   - **expiryDate** (Instant, 24 hours from creation)
   - **Relationships:**
     - User user (one-to-one, eager fetch)

### f. Class **Role**
   - **id** (Integer)
   - **name** (RoleEnum: ROLE_USER, ROLE_MEMBER, ROLE_POSTER)
   - **Relationships:**
     - Set<User> users (many-to-many)

### g. Class **ProjectRoleNeeded** *(optional)*
   - **id** (Long)
   - **roleName** (String, e.g. "Backend Developer")
   - **description** (String)
   - **quantityNeeded** (int)
   - **Relationships:**
     - Project project

---

## 4. Create a UML Class Diagram

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
│ + getSkills(): Set<Skill>                                           │
└──────────────┬────────────────┬─────────────────┬──────────────────┘
               │                │                 │
               │ owns           │ member of       │ has
               │ 1..*           │ *...*           │ *...*
               ▼                ▼                 ▼
      ┌────────────────┐  ┌──────────┐    ┌──────────────┐
      │    Project     │  │ Project  │    │    Skill     │
      ├────────────────┤  │ (members)│    ├──────────────┤
      │ - id: Long     │  └──────────┘    │ - id: Long   │
      │ - title        │                  │ - name       │
      │ - description  │                  └──────────────┘
      │ - status       │
      │ - teamSizeNeeded│
      │ - requiredSkills: List<String> │
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
      ├─────────────────────────┤
      │ + getApplicant(): User  │
      │ + getProject(): Project │
      └─────────────────────────┘
               │ submitted by
               │ *..1
               └────────────▶ User

      ┌─────────────────────────┐
      │   VerificationToken     │
      ├─────────────────────────┤
      │ - id: Long              │
      │ - token: String         │
      │ - expiryDate: Instant   │
      ├─────────────────────────┤
      │ + getUser(): User       │
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
               │ *...*
               └────────────▶ User

      ┌──────────────────────────────┐
      │   UserRepository             │
      │   <<interface>>              │
      ├──────────────────────────────┤
      │ + findByUsername(String)     │
      │ + existsByUsername(String)   │
      │ + existsByEmail(String)      │
      └──────────────────────────────┘

      ┌──────────────────────────────┐
      │   ProjectRepository          │
      │   <<interface>>              │
      ├──────────────────────────────┤
      │ + findByIdWithOwner(Long)    │
      └──────────────────────────────┘
```

**Key Collections Used:**
- `Set<Project>` – user's owned projects and joined projects
- `Set<Skill>` – user's skill set
- `Set<ProjectApplication>` – applications for a project
- `Set<User>` – project team members
- `List<String>` – project's required skills
- `Set<Role>` – user's roles

**Key Interfaces (Repositories):**
- `UserRepository extends JpaRepository<User, Long>`
- `ProjectRepository extends JpaRepository<Project, Long>`
- `ProjectApplicationRepository extends JpaRepository<ProjectApplication, Long>`
- `SkillRepository extends JpaRepository<Skill, Long>`
- `VerificationTokenRepository extends JpaRepository<VerificationToken, Long>`

---

## 5. Any other kind of UML diagrams or other diagrams

### Entity-Relationship Diagram

```
┌─────────┐           ┌───────────────┐           ┌─────────┐
│  users  │───────────│  user_roles   │───────────│  roles  │
└────┬────┘     *   * └───────────────┘  *      * └─────────┘
     │
     │ 1
     │
     │ 1                ┌──────────────────────┐
     ├──────────────────│ verification_tokens   │
     │                  └──────────────────────┘
     │
     │ 1                ┌──────────────┐
     ├──────────────────│ user_skills  │───────┐
     │ *                └──────────────┘  *  * │
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
┌────▼──────────────┐     │    ┌─────▼──────────────────┐
│ project_members   │     │    │ project_applications   │
│  (join table)     │     │    │                        │
└───────────────────┘     │    │ - id                   │
     *             *      │    │ - status               │
                          │    │ - appliedAt            │
                          │    │ - applicant_id (FK)    │
                          │    │ - project_id (FK)      │
                          │    └────────────────────────┘
                          │          
                          └──────────
                            project_id
```

### Application Workflow Sequence Diagram

```
User              System           Database         EmailService
 │                   │                 │                 │
 │──register────────▶│                 │                 │
 │                   │──save user─────▶│                 │
 │                   │◀───user saved───│                 │
 │                   │──create token──▶│                 │
 │                   │──send email────────────────────▶ │
 │◀──success msg─────│                 │                 │
 │                   │                 │                 │
 │──click verify────▶│                 │                 │
 │   link            │──get token─────▶│                 │
 │                   │◀───token────────│                 │
 │                   │──enable user───▶│                 │
 │◀──verified────────│                 │                 │
 │                   │                 │                 │
 │──login───────────▶│                 │                 │
 │                   │──check creds───▶│                 │
 │◀──JWT token───────│◀───user valid───│                 │
 │                   │                 │                 │
 │──apply to────────▶│                 │                 │
 │   project         │──check dup─────▶│                 │
 │   (JWT)           │──save app──────▶│                 │
 │◀──success─────────│                 │                 │
 │                   │                 │                 │
[Owner]               │                 │                 │
 │──review apps─────▶│                 │                 │
 │   (JWT)           │──get apps──────▶│                 │
 │◀──app list────────│◀───apps─────────│                 │
 │   (with skills)   │                 │                 │
 │                   │                 │                 │
 │──accept app──────▶│                 │                 │
 │   (JWT)           │──update status─▶│                 │
 │                   │──add to team───▶│                 │
 │                   │──send email────────────────────▶ │
 │◀──success─────────│                 │                 │
```

---

**End of Document**

