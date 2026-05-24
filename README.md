# NexusDesk — Smart Ticket Management (Angular)

Frontend for **TicketManagement.API** (ASP.NET Core + SQL Server).

## Prerequisites

- Node.js 20+
- .NET 8 SDK
- SQL Server LocalDB (connection in API `appsettings.json`)

## Run (two terminals)

### 1. Backend

```powershell
cd C:\Users\kurab\Downloads\TicketManagement\TicketManagement.API
dotnet ef database update
dotnet run --launch-profile http
```

API: **http://localhost:5005**  
Swagger: http://localhost:5005/swagger

### 2. Frontend

```powershell
cd "C:\Users\kurab\OneDrive\Desktop\CSHARP TRAINING\Bootstrap\Angular\Sample1\smart-ticket-desk"
npm start
```

App: **http://localhost:4200**

## Seeded demo accounts

| Email | Password | Role |
|-------|----------|------|
| sanjana@hcl.com | Password@123 | Employee |
| vikram@hcl.com | Password@123 | SupportEngineer |
| ananya@hcl.com | Password@123 | Manager |

## Demo flow (Employee)

1. Open http://localhost:4200 → **Sign in** (or register new Employee)
2. Use `sanjana@hcl.com` / `Password@123` to see 8 sample tickets
3. **Raise ticket** → submit a new incident
4. Open any ticket → **Post comment** → track SLA and status

## Roles

| Role | Features |
|------|----------|
| Employee | Raise tickets, comment, view own history |
| SupportEngineer | Engineer queue, update status/priority |
| Manager | Analytics dashboard (`/app/analytics`) |

## API base URL

Edit `src/environments/environment.ts` if your API port changes:

```ts
apiUrl: 'http://localhost:5005/api'
```
