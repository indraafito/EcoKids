import { pgTable, text, uuid, timestamp, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  fullName: text('full_name'),
  role: text('role'),          // nilai: 'siswa' | 'guru'
  avatarUrl: text('avatar_url'),
  schoolName: text('school_name'),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  lastActive: timestamp('last_active'),
});

export const scanHistory = pgTable('scan_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  imageUrl: text('image_url'),
  wasteType: text('waste_type'),   // nilai: 'organic' | 'inorganic'
  wasteName: text('waste_name'),
  confidence: integer('confidence'),
  explanation: text('explanation'),
  recommendation: text('recommendation'),
  scannedAt: timestamp('scanned_at').defaultNow(),
});

export const quizScores = pgTable('quiz_scores', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  moduleTitle: text('module_title'),
  score: integer('score').notNull(),          // nilai 0–1000; di-cap server-side sebelum INSERT
  totalQuestions: integer('total_questions').notNull(),
  correctAnswers: integer('correct_answers').notNull(),
  timeTaken: integer('time_taken'),   // dalam detik
  completedAt: timestamp('completed_at').defaultNow(),
});

export const studentActivities = pgTable('student_activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  activityType: text('activity_type'),  // nilai: 'scan' | 'quiz' | 'game' | 'guide'
  activityDate: timestamp('activity_date').defaultNow(),
  metadata: text('metadata'),   // JSON string
  createdAt: timestamp('created_at').defaultNow(),
});
