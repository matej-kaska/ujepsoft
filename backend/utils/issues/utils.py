import re
from api.models import Label
from datetime import datetime,timezone

from django.conf import settings
from api import IMAGES_EXTENSIONS
from utils import GITHUB_EXTENSIONS

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

def remove_footer_from_body(description: str) -> str:
  """
  Remove footer from the body of the issue
  """
  if not description:
    return ""
  
  last_p_start = description.rfind('<p>')
  last_p_end = description.rfind('</p>') + len('</p>')
  last_p_content = description[last_p_start:last_p_end]

  return description.replace(last_p_content, "") if last_p_content else description

def get_ujepsoft_author(description: str) -> str:
  """
  Get ujepsoft author's email of the issue/comment from description/body
  """
  if not description:
    return ""
  
  last_p_start = description.rfind('<p>')
  last_p_end = description.rfind('</p>') + len('</p>')
  last_p_content = description[last_p_start:last_p_end]

  h2_start = last_p_content.find('<h2>') + len('<h2>')
  h2_end = last_p_content.find('</h2>')
  h2_content = last_p_content[h2_start:h2_end]
  return h2_content.replace("Autor Issue: ", "") if "Autor Issue: " in h2_content else ""

# TODO: Možná smazat? Idk jestli se to potřebuju
def get_files_from_description_from_ujepsoft(description: str) -> list:
  images_alts = []
  files_hrefs = []

  if "<h3>Tento Issue byl vygenerován pomocí aplikace UJEP Soft</h3>" not in description:
      return images_alts, files_hrefs

  description = description.replace("\n", "")

  attachments_pos = description.rfind("<h1>Přílohy:</h1>")
  if attachments_pos == -1:
      return images_alts, files_hrefs

  description = description[attachments_pos:]

  images_pos = description.find("<h2>Obrázky:</h2>")
  files_pos = description.find("<h2>Soubory:</h2>")

  if images_pos != -1:
      images_html = description[images_pos:files_pos if files_pos != -1 else None]

      img_pos = images_html.find("<img")
      while img_pos != -1:
          start_alt = images_html.find('alt="', img_pos) + 5
          end_alt = images_html.find('"', start_alt)
          images_alts.append(images_html[start_alt:end_alt])

          img_pos = images_html.find("<img", end_alt)

  if files_pos != -1:
      files_html = description[files_pos:]

      a_pos = files_html.find("<a")
      while a_pos != -1:
          start_href = files_html.find('href="', a_pos) + 6
          end_href = files_html.find('"', start_href)
          files_hrefs.append(files_html[start_href:end_href].replace(settings.MEDIA_URL, ""))

          a_pos = files_html.find("<a", end_href)

  return images_alts, files_hrefs

def extract_files_from_github(body):
    images_alts = []
    videos_and_files = []

    # Regex for Markdown image syntax
    image_pattern = re.compile(r'!\[(.*?)\]\((.*?)\)')
    # Regex for Markdown link syntax
    link_pattern = re.compile(r'\[(.*?)\]\((.*?)\)')

    for match in image_pattern.finditer(body):
      alt_text, url = match.groups()
      images_alts.append((alt_text, url))

    for match in link_pattern.finditer(body):
      link_text, url = match.groups()
      if any(url.lower().endswith(f".{ext}") for ext in GITHUB_EXTENSIONS):
        videos_and_files.append((link_text, url))

    return images_alts, videos_and_files

def add_ujepsoft_author(description: str, author: str) -> str:
  """
  Add ujepsoft author's email to the issue/comment description/body
  """
  if not description:
    return ""
  description = description + f"<h2>Autor Issue: {author}</h2>\n"
  description = description + "<h3>Tento Issue byl vygenerován pomocí aplikace UJEP Soft</h3>\n"
  return description

def add_files_to_description(description: str, files) -> str:
  """
  Add Images and Files to the issue/comment description/body
  """
  if len(files) == 0:
    return description
  
  formatted_description = description + "<h1>Přílohy:</h1>\n"
  images_description = "\n"
  files_description = "\n"

  for file in files:
    extension = file.name.split('.')[-1].lower()
    if extension in IMAGES_EXTENSIONS:
      images_description = images_description + f"<img src='{settings.MEDIA_URL}{file.name}' alt='{file.name}'>\n"
    else:
      files_description = files_description + f"[{file.name}]({settings.MEDIA_URL}{file.file})\n"

  if len(images_description) > 2:
    formatted_description = formatted_description + "<h2>Obrázky:</h2>\n" + images_description

  if len(files_description) > 2:
    formatted_description = formatted_description + "<h2>Soubory:</h2>\n" + files_description

  return formatted_description