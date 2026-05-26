# CoFound Application Documentation

## Project Overview
**CoFound** is a collaboration and matchmaking platform designed for startup founders, side-projects, and developers. Its primary objective is to make it easy to assemble early-stage project teams. Instead of functioning as a typical freelancer marketplace, CoFound is oriented towards co-founder discovery, equity-sharing, and long-term project partnership.

### Main Functions
1. **User Profiles & Skills**: Users build professional profiles containing bios, resume uploads, social links, and skills.
2. **Project Directories**: Users publish projects describing their startup idea, target skills, and required team size.
3. **Application System**: Users can submit applications to join teams, and project owners can review, accept, or kick members.
4. **Real-time WebSockets Messaging**: Integrated instant messaging allows team members to communicate inside project channels.
5. **Peer Reviews & Endorsements**: Promotes trust by allowing members to review each other and endorse skill tags.

---

## Usage of Advanced Data Structures & Algorithms

To satisfy the requirements of the Advanced Data Structures curriculum, two custom data structures were implemented from scratch (avoiding standard library collection API helpers) and integrated into the core search and indexing mechanisms of the application.

### 1. Knuth-Morris-Pratt (KMP) Substring Matcher
* **Purpose**: Performs high-performance keyword search on project descriptions, titles, and required skills.
* **Problem Solved**: Standard keyword searching uses naive character comparisons which backtrack on mismatch, leading to $O(N \cdot M)$ worst-case performance.
* **Implementation**: We implemented `KMPMatcher.java`. It precomputes a prefix function table ($\pi$-array) for the query string in $O(M)$ time. During search, if a character mismatch occurs, the matcher uses the $\pi$-array to shift the pattern pointer forward, skipping redundant comparisons. The search is executed in guaranteed linear time: $O(N + M)$.
* **Integration**: When users search on the dashboard explore tab, the backend query endpoint `/api/projects/search` filters projects in-memory using `KMPMatcher.contains` (case-insensitive).

### 2. Red-Black Tree (RBTree) Team-Size Indexer
* **Purpose**: Indexes active projects by their required team size in-memory to support quick range-filtering (e.g. finding projects needing between 2 and 5 co-founders).
* **Problem Solved**: Scanning the entire list of projects for a size range is an $O(N)$ linear operation. Storing them in a balanced tree reduces lookup times.
* **Implementation**: We implemented `RedBlackTree.java`, a self-balancing binary search tree. Each node is colored RED or BLACK. The tree enforces strict properties (e.g. a red node cannot have a red child; all paths from root to leaf contain the same number of black nodes) which guarantees a maximum tree height of $2\log_2(n + 1)$. Duplicate values (multiple projects needing the same team size) are resolved by storing a list of projects in each node.
* **Integration**: When a range filter is applied on the dashboard, the backend reconstructs the RBTree and executes an in-order range query traversal, returning matches in $O(\log n + K)$ time, where $K$ is the number of matching items.

### 3. Interactive Visualization Dashboard
An **Advanced Data Structures Lab** is integrated at route `/visualizer`. It provides:
- **Red-Black Tree Visualizer**: A live SVG layout canvas. You can type sizes and insert them, watching nodes automatically rotate (Left/Right) and change color (RED/BLACK) to maintain balance, with step-by-step logs.
- **KMP Search Visualizer**: An execution simulator. Type a description and pattern to watch search pointers shift step-by-step, showing matching prefixes and the generated $\pi$-array table.

---

## How to Run the Program

### Running Locally
1. **Database Setup**: By default, the application runs on H2 (an in-memory file database at `data/cofound_db`). No separate database setup is required.
2. **Mail Setup**: Configure your SMTP credentials in `src/main/resources/application.properties` to send account verification emails.
3. **Start the Backend**:
   ```bash
   ./start-backend.sh
   ```
4. **Start the Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
5. Open your browser and go to `http://localhost:5173`. Log in or register an account.

### Running with MySQL (Docker)
1. Run `docker-compose up -d` to launch the MySQL container.
2. Set these environment variables before running `./start-backend.sh`:
   ```bash
   export SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/cofound_db"
   export SPRING_DATASOURCE_USERNAME="root"
   export SPRING_DATASOURCE_PASSWORD="your_mysql_password"
   export SPRING_DATASOURCE_DRIVER_CLASS_NAME="com.mysql.cj.jdbc.Driver"
   export SPRING_JPA_DATABASE_PLATFORM="org.hibernate.dialect.MySQLDialect"
   ```

### Deploying to Railway
1. Add a **MySQL Database** inside your Railway project.
2. Set the Spring Boot environment variables on your service:
   * `SPRING_DATASOURCE_URL` = `jdbc:mysql://${{MySQL.MYSQLHOST}}:${{MySQL.MYSQLPORT}}/${{MySQL.MYSQLDATABASE}}`
   * `SPRING_DATASOURCE_USERNAME` = `${{MySQL.MYSQLUSER}}`
   * `SPRING_DATASOURCE_PASSWORD` = `${{MySQL.MYSQLPASSWORD}}`
   * `SPRING_DATASOURCE_DRIVER_CLASS_NAME` = `com.mysql.cj.jdbc.Driver`
   * `SPRING_JPA_DATABASE_PLATFORM` = `org.hibernate.dialect.MySQLDialect`
3. Deploy. Railway will build the container using the root `Dockerfile` and start the server.
