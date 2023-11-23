INSERT INTO risalah_users (name, username, password, jabatan, role, tipe, status, created_by, modified_by) 
VALUES ('{{.name}}', '{{.username}}', '{{.password}}', '{{.jabatan}}', '{{.role}}', '{{.tipe}}', '{{.status}}', '{{.created_by}}', '{{.modified_by}}')
RETURNING id