# PDS Queue & Token Management System

## Software Requirements Specification (SRS)

**Project Name:** PDS Queue & Token Management System  
**Short Name:** PDS-QTMS  
**Version:** 1.0  
**Document Type:** Software Requirements Specification  

---

# 1. Introduction

## 1.1 Project Overview

PDS Queue & Token Management System (PDS-QTMS) is a full-stack web application designed to digitally manage beneficiary registration, token generation, slots, counters and queue operations at a Public Distribution System (PDS) counter.

The system will replace manual registers, spreadsheets and informal queue communication with a centralized and controlled application.

The system will allow authorized staff to search beneficiaries, generate tokens, assign slots and counters, manage the queue, serve beneficiaries, mark missed tokens, maintain history and view reports.

---

# 2. Project Objective

The main objectives of the system are:

- Digitize PDS beneficiary queue management.
- Maintain beneficiary records.
- Generate unique tokens.
- Assign tokens to slots and counters.
- Manage the waiting queue.
- Allow staff to call and serve tokens.
- Allow staff to mark tokens as missed.
- Maintain token status history.
- Send and maintain notifications.
- Provide dashboard and reports.
- Maintain audit records for important actions.
- Provide a live customer queue screen.

---

# 3. Scope

The system will include the following modules:

- Authentication and Role Management
- Beneficiary Management
- Token Management
- Slot Management
- Counter Management
- Queue Management
- Notifications
- Search and History
- Dashboard and Reports
- Settings and Audit
- Live Customer Queue Screen

---

# 4. User Roles

## 4.1 Admin / Owner

The Admin/Owner can:

- Login to the system.
- Manage staff accounts.
- Manage beneficiaries.
- Manage slots.
- Manage counters.
- View tokens and queues.
- View dashboard statistics.
- View reports.
- View audit history.
- Manage system settings.
- Perform authorized administrative operations.

## 4.2 Staff / Operator

The Staff/Operator can:

- Login to the system.
- Search beneficiaries.
- Add beneficiaries.
- Edit beneficiary information where permitted.
- Generate tokens.
- Assign slots and counters.
- View the queue.
- Call the next token.
- Mark a token as serving.
- Mark a token as completed.
- Mark a token as missed.
- View token history.
- View relevant notifications.

## 4.3 Customer / Beneficiary

The Customer/Beneficiary can:

- Access permitted customer functionality.
- View beneficiary information.
- View token information.
- View token status.
- View queue information where available.

---

# 5. Functional Requirements

## 5.1 Authentication and Roles

- Users must be able to login securely.
- The system must authenticate users.
- The system must identify the user's role.
- Protected APIs must require authentication.
- Backend authorization must be implemented for protected operations.
- Users must only access operations permitted for their role.
- Passwords must never be stored in plain text.
- Invalid login attempts must return appropriate error responses.

## 5.2 Beneficiary Management

The system must provide:

- Add beneficiary.
- View beneficiary.
- Edit beneficiary.
- Delete beneficiary where permitted.
- Search beneficiary.
- Filter beneficiary records.
- View beneficiary history.

The system must validate required beneficiary information on the server.

Important beneficiary identifiers must be unique.

## 5.3 Token Management

The system must provide:

- Generate token.
- Generate a unique token number.
- Associate token with a beneficiary.
- Assign token to a slot.
- Assign token to a counter.
- Store token date and time.
- View token details.
- Search tokens.
- Filter tokens by date and status.
- Maintain token status history.

### Token Statuses

The system will support the following statuses:

- WAITING
- CALLED
- SERVING
- COMPLETED
- MISSED

## 5.4 Slot Management

The system must provide:

- Create slots.
- View slots.
- Edit slots.
- Manage slot status.
- Define slot date/time.
- Define slot capacity.
- Assign tokens to slots.

## 5.5 Counter Management

The system must provide:

- Create counters.
- View counters.
- Edit counters.
- Manage counter status.
- Assign staff to counters.
- Display current token at a counter.

## 5.6 Queue Management

The system must provide:

- Display waiting tokens.
- Display current token.
- Call next token.
- Move called token to serving state.
- Mark token as completed.
- Mark token as missed.
- Display queue information.
- Maintain queue status history.

## 5.7 Notifications

The system must provide:

- Token-related notifications.
- Token status notifications.
- Queue/status updates where applicable.
- Notification history.
- Notification status tracking.

If external notification integration is unavailable, the system may use a realistic notification simulation/prototype.

## 5.8 Search and History

The system must provide:

- Beneficiary search.
- Token search.
- Date filters.
- Status filters.
- Counter filters where applicable.
- Beneficiary history.
- Token history.
- Token status history.

Important status changes must be traceable.

## 5.9 Dashboard and Reports

The dashboard must display:

- Total beneficiaries.
- Today's total tokens.
- Waiting tokens.
- Called/Serving tokens.
- Completed/Served tokens.
- Missed tokens.
- Counter information.

Reports must be calculated from the same transaction data used by the application.

Reports should support useful filters such as:

- Date.
- Token status.
- Counter.

## 5.10 Settings and Audit

The system must provide:

- User profile/settings.
- Role management for authorized administrators.
- Important action history.
- Audit records.

Important status and data changes must be traceable.

## 5.11 Live Customer Queue Screen

The system must provide a live customer queue screen as an advanced feature.

The screen should display:

- Current token.
- Current counter.
- Next waiting tokens.
- Queue status.

If real-time integration is unavailable, a realistic simulation/prototype may be implemented.

---

# 6. Business Workflow

The main business workflow is:

Beneficiary Search/Create

↓

Generate Token

↓

Assign Slot

↓

Assign Counter

↓

Token Status = WAITING

↓

Staff Calls Token

↓

Token Status = CALLED

↓

Beneficiary Arrives

↓

Token Status = SERVING

↓

Service Completed

↓

Token Status = COMPLETED

If the beneficiary does not arrive:

Token Status = MISSED

↓

Notification and History Update

---

# 7. Token Status Workflow

Normal workflow:

WAITING

↓

CALLED

↓

SERVING

↓

COMPLETED

Missed workflow:

WAITING

↓

CALLED

↓

MISSED

### Status Definitions

**WAITING**  
The token is waiting in the queue.

**CALLED**  
The staff has called the beneficiary's token.

**SERVING**  
The beneficiary has arrived at the counter and service is in progress.

**COMPLETED**  
The beneficiary's service has been successfully completed.

**MISSED**  
The beneficiary did not arrive after the token was called.

---

# 8. Non-Functional Requirements

## 8.1 Security

- Passwords must not be stored in plain text.
- Authentication must be implemented securely.
- Protected APIs must require authentication.
- Role-based authorization must be enforced on the backend.
- Secrets and API keys must be stored using environment variables.

## 8.2 Validation

- Important fields must be validated on the server.
- Required fields must be validated.
- Duplicate important identifiers must be prevented.
- Invalid status changes must be rejected.

## 8.3 Database Integrity

- Primary keys must be used.
- Foreign keys must be used where appropriate.
- Relationships must maintain data consistency.
- Important records must contain created_at and updated_at fields.
- Important changes must maintain audit/history information.

## 8.4 Performance and Usability

- Search must be available for large lists.
- Filtering must be supported.
- Pagination should be used for large datasets.
- The application should provide clear success and error messages.
- Appropriate HTTP status codes must be returned.

## 8.5 Responsive Design

The frontend should work on:

- Desktop
- Tablet
- Mobile

## 8.6 Accessibility

The application should provide:

- Proper form labels.
- Keyboard-friendly forms.
- Useful validation messages.
- Clear error and success feedback.

---

# 9. Technology Stack

## Frontend

- React.js

## Backend

- Python
- Django
- Django REST Framework

## Database

- MySQL

## API Testing

- Postman

## Version Control

- Git
- GitHub

## Editor

- Visual Studio Code

## Deployment

- Vercel for frontend
- Appropriate hosting for Django backend and MySQL database

---

# 10. Database Requirements

The main database entities are:

- Users
- Beneficiaries
- Tokens
- Slots
- Counters
- Notifications
- Token Status History
- Audit Logs

The database must contain:

- Primary keys.
- Foreign keys.
- Appropriate relationships.
- Indexes for frequent searches.
- created_at fields.
- updated_at fields.
- Audit/history fields where required.

The detailed database schema will be documented separately in:

`docs/Database-Schema.md`

The ER diagram will be stored in:

`docs/ER-Diagram/`

---

# 11. REST API Requirements

The backend must provide REST APIs for:

- Authentication.
- Logout/token refresh.
- Current user profile.
- Beneficiary CRUD.
- Beneficiary search/filter.
- Token generation.
- Token status management.
- Queue operations.
- Slot management.
- Counter management.
- Notifications.
- History.
- Audit records.
- Dashboard.
- Reports.

API request and response formats will be documented separately in:

`docs/API-Documentation.md`

---

# 12. UI Requirements

The React frontend must provide screens for:

- Login.
- Dashboard.
- Beneficiary Management.
- Token Management.
- Slot Management.
- Counter Management.
- Queue Management.
- Notifications.
- History.
- Reports.
- Settings.

The UI must be responsive and should provide clear navigation based on user role.

---

# 13. Testing Requirements

The system must be tested for:

- Normal cases.
- Invalid input.
- Boundary cases.
- Duplicate data.
- Authentication.
- Unauthorized access.
- Role-based permissions.
- Token generation.
- Token status changes.
- Queue workflow.
- Serve workflow.
- Missed token workflow.
- Search and filters.
- Dashboard calculations.
- Reports.
- Notification status.

Backend APIs will be tested using Postman.

Detailed test cases will be documented separately.

---

# 14. Git and GitHub Requirements

The project must use Git for version control.

The development process should include:

- Feature branches.
- Meaningful commit messages.
- Regular commits.
- Clear project history.

Example branch names:

- feature/authentication
- feature/beneficiary-management
- feature/token-management
- feature/queue-management
- feature/reports

Example commit:

`feat: add beneficiary CRUD APIs`

---

# 15. Documentation Requirements

The final project must include:

- Source code.
- README.
- SRS.
- User Stories.
- Use Cases.
- Wireframes.
- ER Diagram.
- Database Schema.
- API Documentation.
- Postman Collection.
- Test Cases.
- Screenshots.
- Local setup instructions.
- Deployment instructions.

---

# 16. MVP Scope

The MVP must include:

1. Authentication and role-based access.
2. Beneficiary management.
3. Token generation.
4. Slot management.
5. Counter management.
6. Queue workflow.
7. Serve and Missed token handling.
8. Search and history.
9. Notifications.
10. Dashboard.
11. Basic reports.
12. Validation and audit/history.

The advanced Live Customer Queue Screen must not delay the completion of the MVP.

---

# 17. Advanced Feature

The advanced feature is:

**Live Customer Queue Screen**

The screen should display the current queue and token status.

If real-time integration is unavailable, the system will provide a realistic simulation/prototype with clear indication that it is a simulation.

---

# 18. Acceptance Criteria

The project will be considered functional when:

- Users can login according to their roles.
- Unauthorized users cannot access restricted operations.
- Staff can search or create a beneficiary.
- Staff can generate a token.
- Token can be assigned to a slot and counter.
- Staff can call the token.
- Staff can serve/complete the token.
- Staff can mark a token as missed.
- Token status history is maintained.
- Notifications are recorded.
- Beneficiary and token records can be searched.
- Historical records can be retrieved.
- Dashboard statistics are calculated from actual transaction data.
- Reports reconcile with transaction data.
- Important actions are auditable.
- APIs validate invalid and duplicate data.
- The core workflow works without manual database changes.
- The Live Queue feature works as a real-time feature or realistic simulation.

---

# 19. Development Sequence

The project will be developed in the following sequence:

Requirement Understanding

↓

User Stories

↓

Use Cases

↓

Wireframes

↓

ER Diagram

↓

Database Schema

↓

Django Project Setup

↓

MySQL Connection

↓

Django Models

↓

Authentication and Roles

↓

Beneficiary APIs

↓

Token APIs

↓

Slot APIs

↓

Counter APIs

↓

Queue Workflow

↓

Notifications

↓

History and Audit

↓

Reports APIs

↓

React UI

↓

Frontend-Backend Integration

↓

Testing

↓

Live Queue Feature

↓

GitHub

↓

Deployment

↓

Documentation

↓

Final Demo
