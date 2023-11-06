INSERT INTO risalah_templates (nama_template, file, status) 
VALUES ('{{.nama_template}}', '{{.file}}', '{{.status}}')
RETURNING id_template
