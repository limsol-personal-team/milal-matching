---
name: prod-shell-setup
description: Explains how to initialize the Django shell environment to query the production database
---

# Prod Shell Setup

Explain how to initialize the Django shell environment to query the production database for this project.

Key facts:
- The Django app lives in `server/`
- Environment variables are defined in `server/.envShell` (sourced via `source .envShell`)
- The env var that switches to prod DB is `PROD_ENV=true` (see `server/server/settings.py` line 181)
- The prod DB is a PostgreSQL RDS instance (not DynamoDB) configured in `server/config/prod_settings.py`
- Run the shell from inside the `server/` directory

The correct pattern to run any one-off Django shell command against prod is:

```bash
cd /Users/sollim/Projects/milal-matching/server && source .envShell && PROD_ENV=true python manage.py shell -c "<your python code here>"
```

Remind the user of the key models:
- `records.models.VolunteerHours` — tracks check-ins with fields: `volunteer` (FK), `email` (FK to EmailAccount), `service_date`, `service_type`, `hours`
- `users.models.Volunteer` — has `first_name`, `last_name`, `active`, `emailaccount_set` (reverse relation)
- `users.models.EmailAccount` — has `email`, `display_name`, `user` (FK to Volunteer)
- `records.models.MilalMatching` — tracks volunteer/milal friend matches

Important gotcha: `VolunteerHours` has both a `volunteer` FK and an `email` FK. Some records only have one set. Always query via the `volunteer` FK and traverse to emails via `volunteer.emailaccount_set` to avoid missing records.
