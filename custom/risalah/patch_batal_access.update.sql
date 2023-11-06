UPDATE risalah_rapat_header
SET alasan_pembatalan = {{.alasan_pembatalan}}, modified_date = now()
AND flag_batal = 'Y'
WHERE id_risalah_header = {{.id_risalah_header}}