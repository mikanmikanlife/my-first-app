/*
  # ユーザープロファイルテーブルの作成

  1. 新規テーブル
    - `profiles`
      - `id` (uuid, primary key) - ユーザーID
      - `username` (text) - ユーザー名
      - `full_name` (text) - フルネーム
      - `avatar_url` (text) - アバター画像URL
      - `updated_at` (timestamp) - 更新日時

  2. セキュリティ
    - RLSを有効化
    - 認証済みユーザーのみが自身のプロファイルを読み書き可能
*/

-- プロファイルテーブルの作成
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  updated_at timestamptz DEFAULT now()
);

-- RLSの有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- プロファイル参照ポリシー
CREATE POLICY "ユーザーは自身のプロファイルを参照可能"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- プロファイル更新ポリシー
CREATE POLICY "ユーザーは自身のプロファイルを更新可能"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- プロファイル作成ポリシー
CREATE POLICY "ユーザーは自身のプロファイルを作成可能"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- プロファイル削除ポリシー
CREATE POLICY "ユーザーは自身のプロファイルを削除可能"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- 更新日時を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();