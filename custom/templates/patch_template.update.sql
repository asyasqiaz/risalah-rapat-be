UPDATE risalah_templates SET nama_template = '{{.nama_template}}', file = '{{.file}}', status = '{{.status}}', modified_by = '{{.modified_by}}', modified_date = now() 
WHERE id_template = {{.id_template}}
RETURNING id_template