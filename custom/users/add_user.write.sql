INSERT INTO risalah_users (name, username, password, jabatan, role, status, created_by, modified_by) 
VALUES ('{{.name}}', '{{.username}}', '{{.password}}', '{{.jabatan}}', '{{.role}}', '{{.status}}', '{{.created_by}}', '{{.modified_by}}')
RETURNING id