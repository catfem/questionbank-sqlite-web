#!/usr/bin/env python3

import sys
import os

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.models import init_db

if __name__ == "__main__":
    print("Initializing database...")
    init_db()
    print("Database initialized successfully!")