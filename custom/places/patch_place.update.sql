UPDATE risalah_places 
SET nama = '{{.nama}}', status = '{{.status}}', modified_date = now()
WHERE id_place = {{.id_place}}
RETURNING id_place