import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    name: text("name"),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    createdAt: integer("created_at", { mode: "number" }).notNull(),
    trialStartedAt: integer("trial_started_at", { mode: "number" }),
    trialEndsAt: integer("trial_ends_at", { mode: "number" }),
    emailVerifiedAt: integer("email_verified_at", { mode: "number" }),
  },
  (table) => ({
    emailUnique: uniqueIndex("users_email_unique").on(table.email),
  }),
);

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    tokenHash: text("token_hash").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    expiresAt: integer("expires_at", { mode: "number" }).notNull(),
    createdAt: integer("created_at", { mode: "number" }).notNull(),
  },
  (table) => ({
    tokenHashUnique: uniqueIndex("sessions_token_hash_unique").on(
      table.tokenHash,
    ),
    userIdIdx: index("sessions_user_id_index").on(table.userId),
  }),
);

export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;

export const organizationProfiles = sqliteTable(
  "organization_profiles",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    companyName: text("company_name").notNull(),
    teitittely: integer("teitittely", { mode: "boolean" }).notNull(),
    defaultTone: text("default_tone").notNull(),
    industry: text("industry").notNull().default("MUU"),
    communicationRole: text("communication_role")
      .notNull()
      .default("ASIAKASPALVELU"),
    refundPolicy: text("refund_policy").notNull().default("EI_LUVATA"),
    cautionLevel: text("caution_level").notNull().default("TASAPAINOINEN"),
    forbiddenPhrases: text("forbidden_phrases")
      .notNull()
      .default("[]"),
    terminology: text("terminology").notNull().default("{}"),
    signature: text("signature").notNull(),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    subscriptionStatus: text("subscription_status"),
    currentPeriodEnd: integer("current_period_end", { mode: "number" }),
    createdAt: integer("created_at", { mode: "number" }).notNull(),
    updatedAt: integer("updated_at", { mode: "number" }).notNull(),
  },
  (table) => ({
    userUnique: uniqueIndex("organization_profiles_user_unique").on(
      table.userId,
    ),
  }),
);

export const templates = sqliteTable(
  "templates",
  {
    id: text("id").primaryKey(),
    key: text("key").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    formSchema: text("form_schema").notNull(),
    basePromptText: text("base_prompt_text").notNull(),
    createdAt: integer("created_at", { mode: "number" }).notNull(),
  },
  (table) => ({
    keyUnique: uniqueIndex("templates_key_unique").on(table.key),
  }),
);

export const drafts = sqliteTable(
  "drafts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    templateId: text("template_id")
      .notNull()
      .references(() => templates.id),
    input: text("input").notNull(),
    output: text("output").notNull(),
    model: text("model").notNull(),
    createdAt: integer("created_at", { mode: "number" }).notNull(),
  },
  (table) => ({
    userCreatedAtIdx: index("drafts_user_created_at_index").on(
      table.userId,
      table.createdAt,
    ),
  }),
);

export const auditEvents = sqliteTable("audit_events", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  type: text("type").notNull(),
  metadata: text("metadata").notNull(),
  createdAt: integer("created_at", { mode: "number" }).notNull(),
});

export const usageEvents = sqliteTable("usage_events", {
  id: text("id").primaryKey(),
  eventName: text("event_name").notNull(),
  userId: text("user_id"),
  context: text("context"),
  createdAt: integer("created_at", { mode: "number" }).notNull(),
});

export const stripeEvents = sqliteTable(
  "stripe_events",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id").notNull(),
    createdAt: integer("created_at", { mode: "number" }).notNull(),
  },
  (table) => ({
    eventIdUnique: uniqueIndex("stripe_events_event_id_unique").on(
      table.eventId,
    ),
  }),
);

export const emailVerificationTokens = sqliteTable(
  "email_verification_tokens",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    tokenHash: text("token_hash").notNull(),
    expiresAt: integer("expires_at", { mode: "number" }).notNull(),
    createdAt: integer("created_at", { mode: "number" }).notNull(),
  },
  (table) => ({
    tokenHashUnique: uniqueIndex("email_verification_token_hash_unique").on(
      table.tokenHash,
    ),
  }),
);

export const trialDevices = sqliteTable(
  "trial_devices",
  {
    id: text("id").primaryKey(),
    deviceIdHash: text("device_id_hash").notNull(),
    firstUserId: text("first_user_id")
      .notNull()
      .references(() => users.id),
    firstSeenAt: integer("first_seen_at", { mode: "number" }).notNull(),
  },
  (table) => ({
    deviceHashUnique: uniqueIndex("trial_devices_device_hash_unique").on(
      table.deviceIdHash,
    ),
  }),
);

export const registrationIpLimits = sqliteTable(
  "registration_ip_limits",
  {
    id: text("id").primaryKey(),
    ipHash: text("ip_hash").notNull(),
    windowStart: integer("window_start", { mode: "number" }).notNull(),
    count: integer("count", { mode: "number" }).notNull(),
    updatedAt: integer("updated_at", { mode: "number" }).notNull(),
  },
  (table) => ({
    ipHashIndex: index("registration_ip_hash_index").on(table.ipHash),
    ipHashUnique: uniqueIndex("registration_ip_hash_unique").on(table.ipHash),
  }),
);

export const subscriptions = sqliteTable(
  "subscriptions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    stripePriceId: text("stripe_price_id"),
    status: text("status").notNull(),
    currentPeriodEnd: integer("current_period_end", { mode: "number" }),
    cancelAtPeriodEnd: integer("cancel_at_period_end", { mode: "number" })
      .notNull()
      .default(0),
    createdAt: integer("created_at", { mode: "number" }).notNull(),
    updatedAt: integer("updated_at", { mode: "number" }).notNull(),
  },
  (table) => ({
    userUnique: uniqueIndex("subscriptions_user_unique").on(table.userId),
  }),
);

export type OrganizationProfile = typeof organizationProfiles.$inferSelect;
export type Template = typeof templates.$inferSelect;
export type Draft = typeof drafts.$inferSelect;
export type AuditEvent = typeof auditEvents.$inferSelect;
export type UsageEvent = typeof usageEvents.$inferSelect;
export type StripeEvent = typeof stripeEvents.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type EmailVerificationToken = typeof emailVerificationTokens.$inferSelect;
export type TrialDevice = typeof trialDevices.$inferSelect;
export type RegistrationIpLimit = typeof registrationIpLimits.$inferSelect;
