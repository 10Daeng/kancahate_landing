// =============================================
// DIZELLE ORM SCHEMA UNTUK NEON TECH
// =============================================

import { uuid, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm';

export const users = {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name'),
  role: text('role').default('user').$type('user', 'admin', 'superadmin'),
  isActive: boolean('is_active').default(true),
  emailVerified: boolean('email_verified').default(false),
  verificationToken: text('verification_token'),
  resetPasswordToken: text('reset_password_token'),
  resetPasswordExpires: timestamp('reset_password_expires'),
  otpCode: text('otp_code'),
  otpExpires: timestamp('otp_expires'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
};

export const userProfiles = {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name'),
  gender: text('gender').$type('pria', 'wanita', 'lainnya'),
  age: integer('age'),
  location: text('location'),
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
};

export const adminUsers = {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  email: text('email').notNull().unique(),
  name: text('name'),
  role: text('role').default('admin').$type('admin', 'superadmin', 'moderator'),
  isActive: boolean('is_active').default(true),
  banned: boolean('banned').default(false),
  banReason: text('ban_reason'),
  bannedAt: timestamp('banned_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
};

export const categories = {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  icon: text('icon'),
  color: text('color'),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
};

export const articles = {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'setNull' }),
  authorId: uuid('author_id').references(() => users.id, { onDelete: 'setNull' }),
  status: text('status').default('draft').$type('draft', 'published', 'archived'),
  viewCount: integer('view_count').default(0),
  coverImage: text('cover_image'),
  tags: jsonb('tags').$type(),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
};

export const counselingSessions = {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  category: text('category').$type('Keluarga', 'Karir', 'Percintaan', 'Lainnya'),
  riskLevel: text('risk_level').$type('Rendah', 'Sedang', 'Tinggi'),
  summary: text('summary'),
  status: text('status').default('active').$type('active', 'completed', 'archived'),
  chatHistory: jsonb('chat_history').$type(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
};

// Base schema for assessment results
const assessmentResultBase = {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  scores: jsonb('scores').$type(),
  result: jsonb('result').$type(),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
};

export const riasecResults = {
  ...assessmentResultBase,
};

export const mbtiResults = {
  ...assessmentResultBase,
};

export const bigfiveResults = {
  ...assessmentResultBase,
};

export const varkResults = {
  ...assessmentResultBase,
};

export const loveLanguageResults = {
  ...assessmentResultBase,
};

export const miResults = {
  ...assessmentResultBase,
};

export const rimbResults = {
  ...assessmentResultBase,
};

export const pss10Results = {
  ...assessmentResultBase,
};

export const gad7Results = {
  ...assessmentResultBase,
};

export const phq9Results = {
  ...assessmentResultBase,
};

export const rosenbergResults = {
  ...assessmentResultBase,
};

export const incidentReports = {
  id: uuid('id').primaryKey().defaultRandom(),
  reporterId: uuid('reporter_id').references(() => users.id, { onDelete: 'setNull' }),
  reporterName: text('reporter_name'),
  reporterStatus: text('reporter_status').$type('siswa', 'orang_tua', 'guru', 'saksi', 'lainnya'),
  reporterPhone: text('reporter_phone'),
  reporterEmail: text('reporter_email'),
  isAnonymous: boolean('is_anonymous').default(false),
  perpetrators: jsonb('perpetrators').$type(),
  victims: jsonb('victims').$type(),
  incidentType: text('incident_type').notNull(),
  bullyingTypes: jsonb('bullying_types').$type(),
  location: text('location'),
  incidentDate: timestamp('incident_date'),
  incidentTime: text('incident_time'),
  chronology: text('chronology'),
  witnesses: jsonb('witnesses').$type(),
  evidence: jsonb('evidence').$type(),
  initialActions: text('initial_actions'),
  reportedToCounselor: boolean('reported_to_counselor').default(false),
  valuesViolated: jsonb('values_violated').$type(),
  severity: text('severity').default('sedang').$type('rendah', 'sedang', 'tinggi'),
  status: text('status').default('baru').$type('baru', 'ditinjau', 'ditindaklanjuti', 'selesai'),
  adminNotes: text('admin_notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
};

export const schema = {
  users,
  userProfiles,
  adminUsers,
  categories,
  articles,
  counselingSessions,
  riasecResults,
  mbtiResults,
  bigfiveResults,
  varkResults,
  loveLanguageResults,
  miResults,
  rimbResults,
  pss10Results,
  gad7Results,
  phq9Results,
  rosenbergResults,
  incidentReports,
};
