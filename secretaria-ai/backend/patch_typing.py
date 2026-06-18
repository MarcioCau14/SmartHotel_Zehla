import os
import re

def patch_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Add imports if necessary
    if '|' in content and 'from typing import' in content:
        if 'Union' not in content:
            content = content.replace('from typing import ', 'from typing import Union, ')
        if 'Optional' not in content:
            content = content.replace('from typing import ', 'from typing import Optional, ')
    elif '|' in content:
        content = "from typing import Union, Optional\n" + content

    # Replace 'Type | None' with 'Optional[Type]'
    content = re.sub(r'([\w\.]+)\s*\|\s*None', r'Optional[\1]', content)
    
    # Replace 'Type1 | Type2' with 'Union[Type1, Type2]'
    # This is a bit tricky for nested types, but let's handle simple cases
    content = re.sub(r'([\w\.]+)\s*\|\s*([\w\.]+)', r'Union[\1, \2]', content)

    with open(filepath, 'w') as f:
        f.write(content)

scripts_dir = 'LESSIE_AI/skills/skill_creator/scripts'
for filename in os.listdir(scripts_dir):
    if filename.endswith('.py'):
        patch_file(os.path.join(scripts_dir, filename))
print("Patching complete.")
