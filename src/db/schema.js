import { pgTable, serial, text, varchar, timestamp, boolean, jsonb, integer, uuid, primaryKey } from 'drizzle-orm/pg-core';

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
  verificationToken: varchar('verification_token', { length: 255 }),
  otpCode: varchar('otp_code', { length: 10 }),
  otpExpires: timestamp('otp_expires'),
  resetPasswordToken: varchar('reset_password_token', { length: 255 }),
  resetPasswordExpires: timestamp('reset_password_expires'),
  referredBy: uuid('referred_by'), // ID user yang mengajak mendaftar
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
  sessionId: varchar('session_id', { length: 255 }).unique(),
  userId: uuid('user_id'),
  anonUserId: varchar('anon_user_id', { length: 255 }),
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

// Kept to avoid drizzle-kit data loss prompts during push, though unused now.
export const counselingSessionsDrafts = pgTable('counseling_sessions_drafts', {
  id: serial('id').primaryKey(),
  sessionId: varchar('session_id', { length: 255 }),
  userId: uuid('user_id'),
  anonUserId: varchar('anon_user_id', { length: 255 }),
  sessionData: jsonb('session_data'),
  lastSavedAt: timestamp('last_saved_at').defaultNow(),
});

export const articles = pgTable('articles', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),
  category: varchar('category', { length: 100 }),
  coverImage: text('cover_image'),
  status: varchar('status', { length: 50 }).default('draft'),
  authorId: uuid('author_id'),
  authorName: varchar('author_name', { length: 255 }),
  viewCount: integer('view_count').default(0),
  tags: jsonb('tags').default([]),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const assessmentResults = pgTable('assessment_results', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id'),
  anonUserId: varchar('anon_user_id', { length: 255 }),
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
  victims: jsonb('victims'),
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
  name: varchar('name', { length: 255 }),
  role: varchar('role', { length: 50 }).default('admin'),
  isActive: boolean('is_active').default(true),
  banned: boolean('banned').default(false),
  banReason: text('ban_reason'),
  bannedAt: timestamp('banned_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ==========================================
// NextAuth / Drizzle Adapter Required Tables
// ==========================================

export const accounts = pgTable(
  'accounts',
  {
    userId: uuid('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    // Using simple uniqueIndex since compound primaryKey might conflict with some Drizzle versions
    // or just define primary key on provider + providerAccountId
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable('sessions', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: uuid('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable(
  'verificationTokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);
