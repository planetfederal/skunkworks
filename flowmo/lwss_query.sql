-- Downstream query using the "watershed code"
-- http://www.env.gov.bc.ca/fish/pdf/guide2_hierarchical_watershed_coding_system4BC.pdf

-- Example watershed code, expanded into parts
-- Major basin, then subwatersheds, working from the ocean (left) to the mountains (right)
-- 120 246600 11500 09000 4320 1370 000 000 000 000 000 000
-- Each portion says how far up the parent river, proportionally, the child river entered it
-- So, 120 = Fraser, and 24.6% up the Fraser, the Nicola entered, and 11.5% up the Nicola the
-- next river entered, and so on.

-- Breakdown of watershed code, 3-digit major, then n-digit sub-basins
-- ARRAY[3,6,5,5,4,4,3,3,3,3,3,3]


-- We need a table structure to define the output of our query building
-- function
DROP TABLE wsquery;
CREATE TABLE wsquery (ws_code varchar(45), seg_prop varchar(6));

-- Query building function takes a watershed code and proportion up it, and 
-- generates a set of codes and proportions that can be used to find all the 
-- downstream segments.
CREATE OR REPLACE FUNCTION get_wsquery(varchar,varchar) RETURNS SETOF wsquery AS
$BODY$
DECLARE
    ws_code varchar := $1;
    seg_prop varchar := $2;
    ws_sizes integer[] := ARRAY[6,5,5,4,4,3,3,3,3,3,3];
    result wsquery;
    ws_len integer;
    ws_size integer := 3;
    ws_pos integer := 4;
BEGIN

    result.seg_prop := seg_prop;
    result.ws_code := ws_code;
    RETURN NEXT result;
    
    FOREACH ws_len IN ARRAY ws_sizes
    LOOP
        result.seg_prop := substring(ws_code from ws_pos for ws_len);
        result.ws_code := substring(ws_code from 1 for ws_size) || repeat('0', 45 - ws_size);
        IF int4(result.seg_prop) = 0 THEN
            RETURN;
        END IF;
        ws_size := ws_size + ws_len;
        ws_pos := ws_size + 1;
        RETURN NEXT result;
    END LOOP;
    RETURN;
END
$BODY$
LANGUAGE plpgsql;

-- How to use the query, just join it to the master table
-- and find all the lines with the same watershed codes and proportions less than the 
-- thresholds.
SELECT s.geom, s.gaze_name, s.ws_code, s.seg_prop 
FROM lwss s JOIN get_wsquery('120246600115000900000000000000000000000000000','0140') q
on s.ws_code = q.ws_code and s.seg_prop < q.seg_prop
ORDER BY ws_code DESC, seg_prop DESC;




