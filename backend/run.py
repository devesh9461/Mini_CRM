import os
import uvicorn
from dotenv import load_dotenv

# Load local environment variables if present
load_dotenv()

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    workers = int(os.getenv("WORKERS", "1"))

    print(f"[Server] Starting Mini CRM API on http://{host}:{port}")
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        workers=workers,
        log_level="info",
    )
