CREATE TABLE IF NOT EXISTS forum_profiles (
  user_id text PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
  display_name text NOT NULL CHECK(char_length(display_name) BETWEEN 2 AND 30),
  game_id text NOT NULL DEFAULT '' CHECK(char_length(game_id)<=32),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS forum_posts (
  id uuid PRIMARY KEY, author_id text NOT NULL REFERENCES forum_profiles(user_id),
  title text NOT NULL CHECK(char_length(title) BETWEEN 4 AND 100),
  body text NOT NULL CHECK(char_length(body) BETWEEN 10 AND 12000),
  category text NOT NULL CHECK(category IN ('questions','skills','quests','general','feedback')),
  pinned boolean NOT NULL DEFAULT false,locked boolean NOT NULL DEFAULT false,
  hidden_at timestamptz,created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),activity_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS forum_posts_activity ON forum_posts(pinned DESC,activity_at DESC) WHERE hidden_at IS NULL;
CREATE INDEX IF NOT EXISTS forum_posts_category ON forum_posts(category,pinned DESC,activity_at DESC) WHERE hidden_at IS NULL;
CREATE TABLE IF NOT EXISTS forum_replies (
  id uuid PRIMARY KEY,post_id uuid NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  author_id text NOT NULL REFERENCES forum_profiles(user_id),body text NOT NULL CHECK(char_length(body) BETWEEN 2 AND 12000),
  hidden_at timestamptz,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS forum_replies_post ON forum_replies(post_id,created_at);
CREATE TABLE IF NOT EXISTS forum_actions (
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,action text NOT NULL,created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS forum_actions_rate ON forum_actions(user_id,created_at);
CREATE TABLE IF NOT EXISTS forum_moderation (
  id bigserial PRIMARY KEY,actor_id text NOT NULL REFERENCES "user"(id),target_id uuid NOT NULL,action text NOT NULL,created_at timestamptz NOT NULL DEFAULT now()
);
