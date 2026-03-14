
# CPA Office Task Management System - Complete Specifications

**Tech Stack:** NodeJS (Express/NestJS) + React + RTL Hebrew + Responsive (desktop/mobile)

**All screens:** Hebrew language, RTL layout (`dir="rtl"`), CSS logical properties, responsive design.

***

## 1. Global Application Structure

### Core Technologies

- **Frontend:** React 18 + React Router + Redux Toolkit Query + Tailwind CSS (RTL plugin)
- **Backend:** NodeJS + Express/NestJS + JWT Auth + PostgreSQL/MySQL
- **Localization:** Hebrew (`he-IL`), Gregorian calendar (`dd/MM/yyyy`)
- **RTL:** CSS logical properties (`margin-inline-start`, `padding-block`, etc.)


### Global Layout Components

**Top Navigation Bar** (authenticated users only):

```
[Logo] ← [Main Menu Items] ← [Notifications] ← [User Avatar Dropdown]
```

- **Desktop:** Horizontal bar
- **Mobile:** Right hamburger → slide panel from right
- **User dropdown:** "הפרופיל שלי", "התנתק"

**Filter Panel** (task lists):

- **Desktop:** Right sidebar (20% width)
- **Mobile:** Collapsible from top ("סינון ▼")

**Table Features:**

- Sortable columns (click header)
- Pagination (default 20 rows/page)
- Search + filters persist per user

***

## 2. Authentication Screens

### 2.1 Login Screen

**Route:** `/login` (public)

**Layout:** Centered card

```
[Logo + "מערכת ניהול דוחות שנתיים"]

אימייל / שם משתמש: [________________]
סיסמה:                 [________________]
☐ זכור אותי           [התחבר]

שכחת סיסמה?
```

**Fields \& Validations:**


| Field | Type | Default | Required | Validation | Error Messages |
| :-- | :-- | :-- | :-- | :-- | :-- |
| identifier | text | empty | Yes | Email OR username pattern | "שדה חובה", "פורמט שגוי" |
| password | password | empty | Yes | minLength: 8 | "שדה חובה", "מינימום 8 תווים" |
| rememberMe | checkbox | unchecked | No | - | - |

**Backend:** `POST /api/auth/login`

```json
{
  "identifier": "string",
  "password": "string",
  "rememberMe": "boolean"
}
```

**Response:** `{ jwt: string, user: { id, name, role, teamId } }`

### 2.2 Password Reset (future)

**Route:** `/forgot-password` (TBD)

***

## 3. Employee Workspace

### 3.1 Employee Main Menu

**Navigation items:**

- "המשימות שלי" → `/tasks/my`
- "פרטי התחברות שלי" → `/profile/password`


### 3.2 My Tasks Screen

**Route:** `/tasks/my`

**Filters Panel:**


| Filter | Type | Default | Validation |
| :-- | :-- | :-- | :-- |
| סטטוס | multi-select | Open, In-progress, Awaiting | At least 1 |
| סוג דו"ח | multi-select | All | None |
| תאריך יעד מדויק | date picker | empty | None |
| חיפוש טקסט | text | empty | max 100 chars |

**Task Table Columns:**


| Column | Content | Color Rules |
| :-- | :-- | :-- |
| סוג דו"ח | Report type name | - |
| סטטוס | Colored pill | Status color |
| תאריך יעד | dd/MM/yyyy | Red=overdue, Orange=≤7days |
| מנהל משימה | Manager name | - |
| הערה אחרונה | 80 char snippet | Hover→full history |
| פעולות | "צפה / ערוך" | - |

**Row coloring:**

- **Red background + red text:** Overdue AND status ≠ Completed/Cancelled
- **Orange background + orange text:** ≤7 days remaining AND status ≠ Completed/Cancelled


### 3.3 Task Details (Employee)

**Route:** `/tasks/:taskId`

```
אחראי לביצוע: [שם עובד] ✓
סוג דו"ח:      [שם סוג] ✓
סטטוס:        [▼ dropdown]
תאריך יעד:     [dd/MM/yyyy] ✓

הערות:
[Timeline of comments newest first]
───────────────
הוסף הערה חדשה:
[textarea 2000 chars max]

[שמור] [ביטול]
```

**Editable fields:**

- **Status:** Single select from active Status Types
- **New comment:** Optional textarea


### 3.4 Password Change Screen

**Route:** `/profile/password`

```
סיסמה נוכחית:     [________________]
סיסמה חדשה:       [________________]
אימות סיסמה חדשה: [________________]

[שנה סיסמה]
```

**Validations:**


| Field | Required | Validation |
| :-- | :-- | :-- |
| currentPassword | Yes | minLength 8 |
| newPassword | Yes | minLength 8, 1 letter + 1 digit |
| confirmPassword | Yes | === newPassword |

**Backend:** `PATCH /api/profile/password`

***

## 4. Manager Workspace

### 4.1 Manager Main Menu

**Navigation items:**

- "משימות" → `/tasks`
- "לוח בקרה" → `/dashboard` (future)
- "הגדרות משרד" → `/admin/*` (if admin)


### 4.2 Tasks Management Screen

**Route:** `/tasks`

**Enhanced Filters:**


| Filter | Type | Default | Notes |
| :-- | :-- | :-- | :-- |
| סטטוס | multi-select | Open,In-progress,Awaiting |  |
| אחראי לביצוע | multi-select | All employees | Team members only |
| סוג דו"ח | multi-select | All |  |
| תאריך יעד מדויק | date | empty | Single date |
| סיכון איחור | single-select | הכל | Red/Orange/Green |
| חיפוש | text | empty | Names+comments |
| קיבוץ לפי | single-select | ללא | Assignee/ReportType |

**Enhanced Table:**


| Column | Content |
| :-- | :-- |
| אחראי | Employee name |
| סוג דו"ח | Report name |
| סטטוס | Colored pill |
| תאריך יעד | Date + risk icon |
| סיכון איחור | Red/Orange/Green icon |
| הערה אחרונה | Snippet (hover→history) |
| מס' הערות | Count badge |
| תאריך יצירה | dd/MM/yyyy |
| פעולות | Edit/View/Delete |

**Summary Cards (top):**

```
פתוחות: 12  |  באיחור: 3  |  כתומות: 5
```


### 4.3 Create/Edit Task

**Route:** `/tasks/new`, `/tasks/:taskId/edit`

**Fields:**


| Field | Type | Required | Default | Validation |
| :-- | :-- | :-- | :-- | :-- |
| אחראי לביצוע | select | Yes | empty | Active employees only |
| סוג דו"ח | select | Yes | empty | Active report types |
| סטטוס | select | Yes | "פתוח" | Active status types |
| תאריך יעד | date | Yes | +7 days | Future date |
| הערה ראשונית | textarea | No | empty | max 2000 chars |


***

## 5. Backoffice (Admin/Office Manager)

### 5.1 Backoffice Menu

```
ניהול משתמשים → /admin/users
סוגי דוחות → /admin/report-types  
סוגי סטטוסים → /admin/status-types
הגדרות מערכת → /admin/settings
```


### 5.2 Users Management

**Route:** `/admin/users`

**Filters:**


| Filter | Type | Default |
| :-- | :-- | :-- |
| תפקיד | multi-select | All |
| סטטוס | single-select | פעיל |
| חיפוש | text | empty |

**Table Columns:** Name, Email, Role, Active, Created, Actions

**User Edit/Create Form:**


| Field | Type | Required | Default | Notes |
| :-- | :-- | :-- | :-- | :-- |
| שם פרטי | text | Yes | empty | Hebrew/Latin 2-50 |
| שם משפחה | text | Yes | empty | Hebrew/Latin 2-50 |
| אימייל | email | Yes | empty | Unique |
| תפקיד | select | Yes | עובד | manager/employee/admin |
| פעיל | checkbox | No | true |  |
| **סיסמה** | **password** | **No** | empty | **Admin sets employee's password** |

### 5.3 Report Types Management

**Route:** `/admin/report-types`

**Fields:**


| Field | Type | Required | Default |
| :-- | :-- | :-- | :-- |
| שם סוג דו"ח | text | Yes | empty |
| תיאור | textarea | No | empty |
| פעיל | checkbox | No | true |

### 5.4 Status Types Management (NEW)

**Route:** `/admin/status-types`

**Fields:**


| Field | Type | Required | Default | Notes |
| :-- | :-- | :-- | :-- | :-- |
| שם סטטוס | text | Yes | empty | e.g. "פתוח", "בתהליך" |
| צבע | color picker | Yes | \#007BFF | Hex color |
| פעיל | checkbox | No | true |  |
| ברירת מחדל | checkbox | No | false | Only 1 default |

### 5.5 System Settings

**Route:** `/admin/settings`


| Setting | Type | Default | Validation |
| :-- | :-- | :-- | :-- |
| ימי יעד ברירת מחדל | number | 7 | 1-365 |
| ימי התרעה כתומה | number | 7 | 1-30 |


***

## 6. Complete API Endpoints

```
Auth:
POST /api/auth/login
PATCH /api/profile/password

Tasks (all roles):
GET /api/tasks?filters...
GET /api/tasks/:id
PATCH /api/tasks/:id {status?, comment?}
POST /api/tasks (managers only)

Admin:
GET/POST/PUT/DELETE /api/admin/users
GET/POST/PUT/DELETE /api/admin/report-types  
GET/POST/PUT/DELETE /api/admin/status-types
GET/PATCH /api/admin/settings
```


***

## 7. Frontend Component Structure

```
App/
├── components/
│   ├── Layout/
│   │   ├── AppLayout.jsx (RTL wrapper)
│   │   ├── TopNav.jsx
│   │   └── FilterPanel.jsx
│   ├── Tables/
│   │   ├── TaskTable.jsx
│   │   └── UserTable.jsx
│   └── Forms/
│       ├── TaskForm.jsx
│       └── UserForm.jsx
├── pages/
│   ├── Login.jsx
│   ├── Employee/
│   │   ├── MyTasks.jsx
│   │   └── PasswordChange.jsx
│   ├── Manager/
│   │   ├── Tasks.jsx
│   │   └── TaskForm.jsx
│   └── Admin/
│       ├── Users.jsx
│       ├── ReportTypes.jsx
│       ├── StatusTypes.jsx
│       └── Settings.jsx
└── hooks/
    └── useTasks.js (RTK Query)
```


***

## 8. Validation Summary Table

| Context | Field | Required | Client Validation | Server Validation |
| :-- | :-- | :-- | :-- | :-- |
| Login | identifier | ✓ | email/username | exists |
|  | password | ✓ | min 8 | hash match |
| Password Change | current | ✓ | min 8 | hash match |
|  | new | ✓ | min 8 + strength | hash |
| Task Create | assigneeId | ✓ | exists, active | team member |
|  | reportTypeId | ✓ | exists, active | exists |
|  | statusId | ✓ | exists, active | exists, default |
|  | dueDate | ✓ | future date | future |
| User Create | email | ✓ | valid, unique | unique DB |
|  | **password** | No | min 8 + strength | **hash if provided** |
| Status Type | name | ✓ | unique active | unique |
|  | color | ✓ | valid hex | valid hex |


***

## 9. Key Features Implementation Notes

1. **RTL Hebrew:** `dir="rtl"`, CSS logical properties, Hebrew labels everywhere
2. **Risk Indicators:**
    - Red: `dueDate < today AND status NOT in [completed,cancelled]`
    - Orange: `today ≤ dueDate ≤ today+7 AND status NOT in [completed,cancelled]`
3. **Comments Hover:** React Tooltip/Popover showing full timeline
4. **Role-based Routes:** Higher roles see all lower role screens
5. **Mobile:** Touch-friendly tables, swipe-to-archive, collapsible filters

**Ready for development. All screens fully specified with fields, validations, layouts, and API contracts.**


