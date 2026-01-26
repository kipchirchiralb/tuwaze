## Relational database design of the SDG 16 app Tuwaze for Eldoret.

## 1. Users

Stores residents, officials, moderators, legal aid staff.

**users**

* user_id (PK)
* full_name
* phone_number
* email
* password_hash
* role (citizen, official, moderator, legal_aid)
* ward
* is_anonymous_allowed (boolean)
* created_at

---

## 2. Community Reporting (Incidents & Issues)

### reports

* report_id (PK)
* user_id (FK → users.user_id, nullable for anonymous)
* category (safety, corruption, infrastructure, dispute)
* title
* description
* location_description
* latitude (nullable)
* longitude (nullable)
* status (submitted, in_review, resolved, rejected)
* is_anonymous (boolean)
* created_at
* updated_at

### report_media

* media_id (PK)
* report_id (FK → reports.report_id)
* file_url
* file_type (image, video)
* uploaded_at

### report_assignments

Tracks which authority is responsible.

* assignment_id (PK)
* report_id (FK → reports.report_id)
* assigned_to_department
* assigned_at
* resolved_at

---

## 3. Anonymous Tip Line (Secure Messaging)

### anonymous_tips

* tip_id (PK)
* category
* description
* status (new, in_progress, closed)
* created_at

### tip_messages

* message_id (PK)
* tip_id (FK → anonymous_tips.tip_id)
* sender_type (citizen, authority)
* encrypted_message
* sent_at

---

## 4. Justice & Legal Support Directory

### legal_services

* service_id (PK)
* organization_name
* service_type (legal_aid, police, court, NGO)
* description
* phone
* email
* physical_address
* ward
* operating_hours

### legal_documents

Stores metadata about each document.

* document_id (PK)
* title
* document_type
  *(constitution, county_law, police_form, court_form, rights_guide, policy)*
* description
* language (English, Kiswahili)
* file_url
* published_by
* publish_date
* is_public (boolean)
* created_at


---

## 5. Community Voice Forum

### forum_topics

* topic_id (PK)
* user_id (FK → users.user_id)
* title
* description
* category
* created_at
* status (open, closed)

### forum_comments

* comment_id (PK)
* topic_id (FK → forum_topics.topic_id)
* user_id (FK → users.user_id)
* comment_text
* created_at

### forum_votes

* vote_id (PK)
* topic_id (FK → forum_topics.topic_id)
* user_id (FK → users.user_id)
* vote_type (upvote, downvote)

---

## 6. GovConnect (Public Meetings & Participation)

### government_meetings

* meeting_id (PK)
* title
* description
* meeting_date
* location
* ward
* created_at

### meeting_questions

* question_id (PK)
* meeting_id (FK → government_meetings.meeting_id)
* user_id (FK → users.user_id)
* question_text
* submitted_at

---

## 7. Transparency Dashboard (Projects & Response Tracking)

### public_projects

* project_id (PK)
* project_name
* department
* ward
* budget_allocated
* start_date
* expected_end_date
* status

### service_metrics

* metric_id (PK)
* department
* metric_type (avg_response_time, resolution_rate)
* metric_value
* recorded_at

---

## Key Relationships (Bird’s-Eye View 🦅)

* One **user** → many **reports**, **forum topics**, **comments**, **votes**
* One **report** → many **media files**
* One **report** → one or many **assignments**
* One **forum topic** → many **comments** and **votes**
* One **meeting** → many **questions**
* Anonymous tips are **decoupled from users** for safety

---

## Why This Design Works for SDG 16

* 🔐 Supports anonymity and whistleblowing
* 📊 Enables accountability through status tracking
* 🗣️ Encourages inclusive participation
* ⚖️ Improves access to justice information
* 🏛️ Strengthens trust between citizens and institutions


