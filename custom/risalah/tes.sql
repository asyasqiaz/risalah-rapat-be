
-- CREATE OR REPLACE FUNCTION create_place_trigger()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     INSERT INTO risalah_places (nama, status) VALUES (NEW.nama, NEW.status);
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE TRIGGER create_place
-- AFTER INSERT ON risalah_places
-- FOR EACH ROW
-- EXECUTE FUNCTION create_place_trigger();
