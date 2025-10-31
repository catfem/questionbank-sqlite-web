#!/usr/bin/env python3
import zipfile
import os
from pathlib import Path

def create_zip():
    """Create a zip file of the project"""
    project_dir = Path('.')
    zip_path = project_dir / 'question-system.zip'
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for file_path in project_dir.rglob('*'):
            # Skip the zip file itself if it exists
            if file_path.name == 'question-system.zip':
                continue
                
            # Skip hidden files and common ignore patterns
            if any(part.startswith('.') for part in file_path.parts):
                continue
                
            # Skip specific directories
            if file_path.is_dir() and file_path.name in ['__pycache__', 'node_modules', '.git', 'venv']:
                continue
                
            # Add file to zip
            arcname = str(file_path.relative_to(project_dir))
            zipf.write(file_path, arcname)
    
    print(f"✅ Created {zip_path}")
    print(f"📁 Size: {zip_path.stat().st_size / (1024*1024):.1f} MB")

if __name__ == "__main__":
    create_zip()