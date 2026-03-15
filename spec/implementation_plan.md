# Cloud Infrastructure Deployment Plan

This plan outlines the steps to dockerize the application, switch the database to MariaDB, and setup a multi-site infrastructure on an Akamai cloud instance.

## User Review Required

> [!IMPORTANT]
> The database switch from SQLite to MariaDB requires a Prisma schema update and a migration of any existing data (if needed).
> SSL will be handled by Traefik/Nginx, but DNS must be pointed to the cloud server via Cloudflare.

## Proposed Changes

### Dockerization

#### [NEW] [Dockerfile](file:///c:/Users/Eyal/source/repos/cpa-yearly-report/backend/Dockerfile)
- Create a Dockerfile for the backend using Node.js 20 or 22.
- Configure it to run `prisma generate` and start the server.

#### [MODIFY] [api.ts](file:///c:/Users/Eyal/source/repos/cpa-yearly-report/frontend/src/store/api.ts)
- Change `baseUrl` from hardcoded `http://localhost:3001/api` to an environment variable or relative path `/api`.

### Database Switch

#### [MODIFY] [schema.prisma](file:///c:/Users/Eyal/source/repos/cpa-yearly-report/backend/prisma/schema.prisma)
- Change `datasource db` provider from `sqlite` to `mysql` (MariaDB compatible).
- Update connection string to use environment variables.

### Infrastructure Orchestration

#### [NEW] [docker-compose.yml](file:///c:/Users/Eyal/source/repos/cpa-yearly-report/docker-compose.yml)
- Define `db` service (MariaDB).
    - Use `MYSQL_ROOT_PASSWORD` for initial setup.
    - Persistent volume for data.
- Define `traefik` (Reverse Proxy).
    - Entry point for 80 (HTTP).
    - Routing based on Host header to appropriate services.
- Define `backend` and `frontend` services with Traefik labels:
    - `traefik.http.routers.cpa-yearly-reports.rule=Host("cpa.sinapistech.com")`
    - `traefik.http.services.cpa-yearly-reports.loadbalancer.server.port=80`

### Multi-site Support
- **Reverse Proxy**: Traefik will route incoming requests based on the `Host` header to the correct frontend/backend container pair.
- **Database**: 
    - A single MariaDB instance will host multiple databases (e.g., `db_cpa_yearly_reports`, `db_site2`).
    - Each backend will connect using its specific database name via environment variables.

### SSL Configuration
- **Flexible SSL**: We will use port 80 on the cloud server. SSL will be handled by Cloudflare's "Flexible" mode, where Cloudflare manages the certificate and communicates with the server via HTTP on port 80.
- No SSL certificates will be installed on the cloud server itself.

## Verification Plan

### Automated Tests
- Run `docker compose up -d` locally to verify services start correctly.
- Test backend connection to MariaDB using `prisma migrate dev`.

### Manual Verification
- Access the frontend via a local host header mapping (e.g., editing `/etc/hosts`).
- Verify that the backend API is reachable through the proxy.
- Verify multi-site routing by adding another "dummy" service to the docker-compose.
