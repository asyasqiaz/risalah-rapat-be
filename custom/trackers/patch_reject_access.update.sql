UPDATE risalah_trackers
SET flag_reject = 'Y'
WHERE id_risalah_header = {{.id_risalah_header}}
  AND nomor_urut = 1