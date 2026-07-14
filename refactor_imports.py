import os
import re

src_dir = r"C:\Users\abhay\OneDrive\Documents\Minor_Project\shieldai-extension\src"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_imports = []
    
    # 1. const { a, b } = await import('path');
    def repl1(m):
        vars_ = m.group(1).strip()
        path = m.group(2)
        new_imports.append(f"import {{ {vars_} }} from {path};")
        return ""
    content = re.sub(r'const\s*\{\s*([^}]+)\s*\}\s*=\s*await\s+import\(([\'"][^\'"]+[\'"])\);?', repl1, content)
    
    # 2. const ort = await import('onnxruntime-web');
    def repl2(m):
        var_ = m.group(1).strip()
        path = m.group(2)
        if var_ in ('ort', 'Tesseract'):
             new_imports.append(f"import * as {var_} from {path};")
        else:
             new_imports.append(f"import {var_} from {path};")
        return ""
    content = re.sub(r'const\s+([A-Za-z0-9_]+)\s*=\s*await\s+import\(([\'"][^\'"]+[\'"])\);?', repl2, content)

    # 3. const jsQR = (await import('jsqr')).default;
    def repl3(m):
        var_ = m.group(1).strip()
        path = m.group(2)
        new_imports.append(f"import {var_} from {path};")
        return ""
    content = re.sub(r'const\s+([A-Za-z0-9_]+)\s*=\s*\(await\s+import\(([\'"][^\'"]+[\'"])\)\)\.default;?', repl3, content)

    if new_imports:
        # Avoid duplicate imports
        unique_imports = []
        for imp in new_imports:
            if imp not in unique_imports:
                unique_imports.append(imp)
        
        # Add to top of file, after any '///' or initial comments
        lines = content.split('\n')
        insert_idx = 0
        for i, line in enumerate(lines):
            if line.startswith('//') or line.startswith('///'):
                insert_idx = i + 1
            else:
                break
        
        # also deduplicate existing imports
        final_imports = []
        for imp in unique_imports:
             if imp not in content:
                 final_imports.append(imp)
                 
        if final_imports:
            lines.insert(insert_idx, '\n'.join(final_imports))
            content = '\n'.join(lines)
            
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.ts') or file.endswith('.tsx'):
            process_file(os.path.join(root, file))
