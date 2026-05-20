#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

if [ -d "venv" ]; then
    source venv/bin/activate
fi

python3 -c "import fastapi" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "Dependencias nao instaladas. Execute: pip install -r requirements.txt"
    exit 1
fi

echo "Iniciando ZEHLA Brain..."
exec python3 server.py
