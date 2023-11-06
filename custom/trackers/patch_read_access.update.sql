UPDATE risalah_trackers
SET flag_read = 'Y'
WHERE id_risalah_header = {{.id_risalah_header}}
  AND id_user = {{.id_user}}
  AND nomor_urut = {{.nomor_urut}}