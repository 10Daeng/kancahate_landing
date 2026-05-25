import { pgTable, serial, text, varchar, timestamp, boolean, jsonb, integer, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  passwordHash: varchar('password_hash', { length: 255 }),
  role: varchar('role', { length: 50 }).default('user'),
  isActive: boolean('is_active').default(true),
  emailVerified: timestamp('email_verified'),
  failedLoginAttempts: integer('failed_login_attempts').default(0),
  lockedUntil: timestamp('locked_until'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const userProfiles = pgTable('user_profiles', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  email: varchar('email', { length: 255 }),
  name: varchar('name', { length: 255 }),
  gender: varchar('gender', { length: 50 }),
  dob: timestamp('dob'),
  age: integer('age'),
  educationStatus: varchar('education_status', { length: 100 }),
  institutionType: varchar('institution_type', { length: 100 }),
  occupation: varchar('occupation', { length: 100 }),
  location: varchar('location', { length: 255 }),
  locationCustom: varchar('location_custom', { length: 255 }),
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const counselingSessions = pgTable('counseling_sessions', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id'),
  userEmail: varchar('user_email', { length: 255 }),
  userName: varchar('user_name', { length: 255 }),
  category: varchar('category', { length: 100 }),
  subtopic: varchar('subtopic', { length: 255 }),
  subtopicCustom: boolean('subtopic_custom').default(false),
  personaId: varchar('persona_id', { length: 100 }),
  riskLevel: varchar('risk_level', { length: 50 }),
  riskPriority: integer('risk_priority').default(1),
  chatHistory: jsonb('chat_history').default([]),
  messageCount: integer('message_count').default(0),
  userMessageCount: integer('user_message_count').default(0),
  summary: text('summary'),
  detectedKeywords: text('detected_keywords'),
  startedAt: timestamp('started_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  status: varchar('status', { length: 50 }).default('In Progress'),
  metadata: jsonb('metadata').default({}),
});

export const counselingSessionsDrafts = pgTable('counseling_sessions_drafts', {
  id: serial('id').primaryKey(),
  sessionId: varchar('session_id', { length: 255 }),
  userId: uuid('user_id'),
  sessionData: jsonb('session_data'),
  lastSavedAt: timestamp('last_saved_at').defaultNow(),
});

export const articles = pgTable('articles', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),
  categoryId: integer('category_id'),
  featuredImageUrl: text('featured_image_url'),
  status: varchar('status', { length: 50 }).default('draft'),
  authorId: uuid('author_id'),
  authorName: varchar('author_name', { length: 255 }),
  viewCount: integer('view_count').default(0),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const articleCategories = pgTable('article_categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  icon: varchar('icon', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const assessmentResults = pgTable('assessment_results', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id'),
  email: varchar('email', { length: 255 }),
  assessmentType: varchar('assessment_type', { length: 100 }),
  assessmentName: varchar('assessment_name', { length: 255 }),
  score: integer('score'),
  maxScore: integer('max_score'),
  severity: varchar('severity', { length: 100 }),
  resultData: jsonb('result_data'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const incidentReports = pgTable('incident_reports', {
  id: serial('id').primaryKey(),
  reporterId: uuid('reporter_id'),
  reporterName: varchar('reporter_name', { length: 255 }),
  reporterStatus: varchar('reporter_status', { length: 100 }),
  reporterPhone: varchar('reporter_phone', { length: 50 }),
  reporterEmail: varchar('reporter_email', { length: 255 }),
  isAnonymous: boolean('is_anonymous').default(false),
  perpetrators: jsonb('perpetrators'),
  perpName: varchar('perp_name', { length: 255 }),
  perpClass: varchar('perp_class', { length: 100 }),
  perpDescription: text('perp_description'),
  victims: jsonb('victims'),
  victimName: varchar('victim_name', { length: 255 }),
  victimClass: varchar('victim_class', { length: 100 }),
  victimRelation: varchar('victim_relation', { length: 100 }),
  incidentType: varchar('incident_type', { length: 100 }),
  bullyingTypes: jsonb('bullying_types'),
  location: varchar('location', { length: 255 }),
  incidentDate: timestamp('incident_date'),
  incidentTime: varchar('incident_time', { length: 50 }),
  chronology: text('chronology'),
  witnesses: jsonb('witnesses'),
  evidence: jsonb('evidence'),
  initialActions: text('initial_actions'),
  reportedToCounselor: boolean('reported_to_counselor').default(false),
  valuesViolated: jsonb('values_violated'),
  severity: varchar('severity', { length: 50 }).default('sedang'),
  status: varchar('status', { length: 50 }).default('pending'),
  adminNotes: text('admin_notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Admin Auth and Roles
export const adminUsers = pgTable('admin_users', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id'),
  email: varchar('email', { length: 255 }).notNull().unique(),
  role: varchar('role', { length: 50 }).default('admin'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});
