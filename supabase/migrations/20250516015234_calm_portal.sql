/*
  # チャットアプリケーションのスキーマ設定

  1. 新規テーブル
    - `threads`
      - `id` (uuid, 主キー)
      - `user_id` (uuid, ユーザーID)
      - `title` (text, スレッドタイトル)
      - `created_at` (timestamp, 作成日時)
      - `updated_at` (timestamp, 更新日時)

    - `messages`
      - `id` (uuid, 主キー)
      - `thread_id` (uuid, スレッドID)
      - `content` (text, メッセージ内容)
      - `role` (text, 'user' または 'assistant')
      - `created_at` (timestamp, 作成日時)

  2. セキュリティ
    - 両テーブルでRLSを有効化
    - ユーザーは自身のデータのみアクセス可能
*/

-- threadsテーブルの作成
CREATE TABLE IF NOT EXISTS threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- messagesテーブルの作成
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid REFERENCES threads(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  role text CHECK (role IN ('user', 'assistant')) NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- updated_atを自動更新するためのトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- threadsテーブルのupdated_at自動更新トリガー
CREATE TRIGGER threads_updated_at
  BEFORE UPDATE ON threads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLSの設定
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- threadsテーブルのポリシー
CREATE POLICY "ユーザーは自身のスレッドを参照可能"
  ON threads
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "ユーザーは新規スレッドを作成可能"
  ON threads
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ユーザーは自身のスレッドを更新可能"
  ON threads
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ユーザーは自身のスレッドを削除可能"
  ON threads
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- messagesテーブルのポリシー
CREATE POLICY "ユーザーは自身のスレッドのメッセージを参照可能"
  ON messages
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM threads
    WHERE threads.id = messages.thread_id
    AND threads.user_id = auth.uid()
  ));

CREATE POLICY "ユーザーは自身のスレッドにメッセージを追加可能"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM threads
    WHERE threads.id = messages.thread_id
    AND threads.user_id = auth.uid()
  ));