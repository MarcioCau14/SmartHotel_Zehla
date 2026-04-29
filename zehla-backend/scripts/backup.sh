#!/bin/bash
echo "🔄 Iniciando backup..."
docker exec zehla-postgres pg_dump -U zehla zehla_db > backup_$(date +%Y%m%d_%H%M%S).sql
echo "✅ Backup concluído"
