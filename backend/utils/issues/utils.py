import re
from datetime import datetime,timezone
import markdown

def find_issue_by_id(objs, id):
  """
  Find issue object by id
  """
  for obj in objs:
    if str(obj.gh_id) == str(id):
      return obj
  return None

def find_comment_by_id(objs, id):
  """
  Find comment object by id
  """
  for obj in objs:
    if str(obj.number) == str(id):
      return obj
  return None

def get_datetime(updated_at):
  """
  Get datetime from string
  """
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
  return h2_content.replace("Autor: ", "") if "Autor: " in h2_content else ""

def extract_files_from_github(body):
    """
    Get images and files from the body of the issue/comment
    """
    if not body:
      return [], []
    
    images_alts = []
    videos_and_files = []
    
    # Regex for Markdown image syntax
    image_pattern = re.compile(r'!\[(.*?)\]\((.*?)\)')
    # Regex for Markdown link syntax
    link_pattern = re.compile(r'\[(.*?)\]\((.*?)\)')
    # Regex for HTML <img> tag
    html_image_pattern = re.compile(
      r'<img[^>]*\b(src|alt)=["\'](.*?)["\'][^>]*\b(alt|src)=["\'](.*?)["\'][^>]*>',
      re.IGNORECASE
    )

    for match in image_pattern.finditer(body):
      alt_text, url = match.groups()
      images_alts.append((alt_text, url))

    for match in html_image_pattern.finditer(body):
      first_attr, first_value, second_attr, second_value = match.groups()
      if first_attr == 'src' and second_attr == 'alt':
        images_alts.append((second_value, first_value))
      elif first_attr == 'alt' and second_attr == 'src':
        images_alts.append((first_value, second_value))

    for match in link_pattern.finditer(body):
      link_text, url = match.groups()
      if (link_text, url) not in images_alts:
        videos_and_files.append((link_text, url))

    return images_alts, videos_and_files

def remove_files_from_description(description: str, images_alts, videos_and_files) -> str:
  """
  Remove Images and Files from the issue/comment description/body
  """
  if not description:
    return ""

  for alt_text, url in images_alts:
    description = description.replace(f"![{alt_text}]({url})", f"<p class='file-gh' title='Obrázek'>[{alt_text}]</p>")
    description = re.sub(rf"<img[^>]*src=['\"]{re.escape(url)}['\"][^>]*alt=['\"]{re.escape(alt_text)}['\"][^>]*>", f"<p class='file-gh' title='Obrázek'>[{alt_text}]</p>", description, flags=re.IGNORECASE)
    description = re.sub(rf"<img[^>]*alt=['\"]{re.escape(alt_text)}['\"][^>]*src=['\"]{re.escape(url)}['\"][^>]*>", f"<p class='file-gh' title='Obrázek'>[{alt_text}]</p>", description, flags=re.IGNORECASE)

  for link_text, url in videos_and_files:
    description = description.replace(f"[{link_text}]({url})", f"<p class='file-gh' title='Soubor'>{link_text}</p>")

  return description

def add_ujepsoft_author(description: str, author: str) -> str:
  """
  Add ujepsoft author's email to the issue/comment description/body
  """
  if not description:
    return ""
  description = description + f"<h2>Autor: {author}</h2>\n"
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
    if file.file_type == 'image':
      images_description = images_description + f"<img src='{file.file.url if file.file else file.remote_url}' alt='{file.name}'>\n"
    else:
      files_description = files_description + f"[{file.name}]({file.file.url if file.file else file.remote_url})\n"

  if len(images_description) > 2:
    formatted_description = formatted_description + "<h2>Obrázky:</h2>\n" + images_description

  if len(files_description) > 2:
    formatted_description = formatted_description + "<h2>Soubory:</h2>\n" + files_description

  return formatted_description

def markdown_to_html(description: str) -> str:
  """
  Convert markdown to html
  """
  proccessed_md = insert_div_after_lists(description)
  html = markdown.markdown(proccessed_md,  extensions=['extra', 'nl2br'])
  return html

def insert_div_after_lists(md_content: str) -> str:
  """
  This method inserts a div after every list in the markdown content, must
  be done, because when there are two lists in a row, they are not separated
  """
  lines = md_content.split('\n')
  new_lines = []
  in_list = False

  for line in lines:
    stripped_line = line.strip()
    if stripped_line.startswith(('-', '*', '1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.')):
      in_list = True
      new_lines.append(line)
    elif in_list and not stripped_line:
      in_list = False
      new_lines.append('<div></div>')
      new_lines.append('') 
    else:
      new_lines.append(line)

  if in_list:
    new_lines.append('<div></div>')

  return '\n'.join(new_lines)

def remove_file_extenstion_from_name(file_name: str) -> str:
  """
  Remove file extension from the name of the file
  """
  return file_name[:file_name.rfind('.')] if '.' in file_name else file_name