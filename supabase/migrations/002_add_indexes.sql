-- Index for dashboard queries filtering visits by user
CREATE INDEX visits_user_id_idx ON visits(user_id);

-- Ensure email uniqueness at the database level
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
