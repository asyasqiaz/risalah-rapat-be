UPDATE risalah_rapat_header
SET flag_final = 'Y', modified_date = now()
WHERE id_risalah_header = {{.id_risalah_header}}