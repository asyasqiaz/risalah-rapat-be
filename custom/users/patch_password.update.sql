UPDATE risalah_users
SET password = '{{.new_password}}', modified_by = '{{.modified_by}}', modified_date = now()
WHERE id = {{.id}}
  AND password = MD5('{{.old_password}}')
RETURNING id