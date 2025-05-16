/*
  # スレッドテーブルに updated_at カラムを追加

  1. 変更内容
    - `threads`テーブルに`updated_at`カラムを追加
    - デフォルト値として現在時刻を設定
    - 自動更新トリガーを設定

  2. セキュリティ
    - 既存のRLSポリシーは影響を受けません
*/

-- updated_at カラムを追加
ALTER TABLE threads 
ADD COLUMN updated_at timestamptz DEFAULT now();

-- 更新時に updated_at を自動更新するトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーを設定
CREATE TRIGGER threads_updated_at
  BEFORE UPDATE ON threads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();