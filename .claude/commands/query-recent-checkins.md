---
name: query-recent-checkins
description: Query prod DB for volunteers with check-ins in a recent time window and display names and emails
---

# Query Recent Check-ins

Query the production database for volunteers who have checked in (have VolunteerHours records) within a given time window and display their names and emails.

Use this shell pattern from inside `server/`:

```bash
cd /Users/sollim/Projects/milal-matching/server && source .envShell && PROD_ENV=true python manage.py shell -c "
from django.utils import timezone
from datetime import timedelta
from records.models import VolunteerHours
from users.models import Volunteer

one_month_ago = timezone.now() - timedelta(days=30)

vol_ids = (
    VolunteerHours.objects
    .filter(service_date__gte=one_month_ago, volunteer__isnull=False)
    .values_list('volunteer_id', flat=True)
    .distinct()
)

volunteers = Volunteer.objects.filter(id__in=vol_ids).prefetch_related('emailaccount_set')

print(f'Total volunteers: {volunteers.count()}')
print()
for v in sorted(volunteers, key=lambda v: (v.last_name, v.first_name)):
    emails = [ea.email for ea in v.emailaccount_set.all()]
    emails_str = ', '.join(emails) if emails else '(no email)'
    print(f'{v.first_name} {v.last_name:<20} {emails_str}')
"
```

To export as TSV for Excel/Sheets paste, replace the print block with:

```python
rows = []
for v in sorted(volunteers, key=lambda v: (v.last_name, v.first_name)):
    emails = [ea.email for ea in v.emailaccount_set.all()]
    rows.append((v.first_name, v.last_name, emails))

max_emails = max(len(r[2]) for r in rows)
email_headers = '\t'.join(f'Email {i+1}' for i in range(max_emails))
print(f'First Name\tLast Name\t{email_headers}')
for first, last, emails in rows:
    padded = emails + [''] * (max_emails - len(emails))
    print(f'{first}\t{last}\t' + '\t'.join(padded))
```

Adjust `timedelta(days=30)` to change the lookback window.
