UPDATE risalah_users 
SET name = '{{.name}}', username = '{{.username}}', password = '{{.password}}', jabatan = '{{.jabatan}}', role = '{{.role}}', status = '{{.status}}', modified_date = now() 
WHERE id = {{.id}}
RETURNING id