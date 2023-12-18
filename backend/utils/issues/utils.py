from api.models import Label

def get_label_names_by_ids(label_ids):
  labels = Label.objects.filter(id__in=label_ids)

  return [label.name for label in labels]

def find_obj_by_id(objs, id):
  for obj in objs:
    if "id" in obj and str(obj['id']) == id:
      return obj
  return None

def find_comment_by_id(objs, id):
  for obj in objs:
    if str(obj.number) == str(id):
      return obj
  return None