INSERT INTO risalah_places (nama, status, created_by, modified_by) 
VALUES ('{{.nama}}', '{{.status}}', '{{.created_by}}', '{{.modified_by}}')
RETURNING id_place
