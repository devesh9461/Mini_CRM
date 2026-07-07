import sys, os
from sqlalchemy import create_engine, inspect

def main():
    url = os.getenv("DATABASE_URL", "sqlite:///./mini_crm.db")
    engine = create_engine(url)
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print('Tables:', tables)

if __name__ == '__main__':
    main()
