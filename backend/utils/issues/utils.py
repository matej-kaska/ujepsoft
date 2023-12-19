from api.models import Label
from datetime import datetime,timezone

def get_label_names_by_ids(label_ids):
  labels = Label.objects.filter(id__in=label_ids)

  return [label.name for label in labels]

def find_obj_by_id(objs, id):
  for obj in objs:
    if "id" in obj and str(obj['id']) == id:
      return obj
  return None

def find_issue_by_id(objs, id):
  for obj in objs:
    if str(obj.gh_id) == str(id):
      return obj
  return None

def find_comment_by_id(objs, id):
  for obj in objs:
    if str(obj.number) == str(id):
      return obj
  return None

def get_datetime(updated_at):
  if isinstance(updated_at, str):
    return datetime.strptime(updated_at, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
  return updated_at