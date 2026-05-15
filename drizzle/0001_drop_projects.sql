-- Drop the projects table (and any indexes it carried) now that the
-- /projects route and its admin/api surface have been removed.
DROP INDEX IF EXISTS projects_slug_idx;
DROP TABLE IF EXISTS projects;
