import subprocess
import time
import sys
import os

ENV_VARS = [
    ("DATABASE_URL", "postgresql://postgres:Zehla_Supabase_2026@db.yzuryspivefbgmehjfse.supabase.co:5432/postgres"),
    ("REDIS_URL", "rediss://default:gQAAAAAAAgAeAAIgcDEzYTlkMTc3NjA1Mzg0ZGY4OTBmNGQ4MjE1MzhhZDc5Ng@heroic-drake-131102.upstash.io:6379"),
    ("UPSTASH_REDIS_REST_URL", "https://heroic-drake-131102.upstash.io"),
    ("UPSTASH_REDIS_REST_TOKEN", "gQAAAAAAAgAeAAIgcDEzYTlkMTc3NjA1Mzg0ZGY4OTBmNGQ4MjE1MzhhZDc5Ng"),
    ("OPENROUTER_API_KEY", "sk-Qso15UGX1eediSxLtnw0SoqpntuvjpElYidQrHFIZHrg8vnMTs5un9hhtVZCEQl1"),
    ("NEXTAUTH_SECRET", "662580795c3a4f8d6fb1e204c4b6ea03f16d8a25c156fbc8a2d1e2e347781a90"),
    ("JWT_SECRET", "8c772be467aa79d2b1f80e9a7e37604b901a88b1b2cd4d18fa7b22a94f6c4428"),
    ("EVOLUTION_API_URL", "https://zehla-evolution.onrender.com"),
    ("EVOLUTION_API_KEY", "zehla-evolution-key-prod-2026"),
    ("NEXTAUTH_URL", "https://smart-hotel-zehla.vercel.app"),
    ("NODE_ENV", "production")
]

def set_vercel_var(name, value):
    cmd = ["npx", "-y", "vercel", "env", "add", name, "production", "--value", value, "--force", "--yes"]
    print(f"🚀 [VERCEL] Configurando {name}...")
    
    env = os.environ.copy()
    env["VERCEL_TELEMETRY_DISABLED"] = "1"
    
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, env=env)
    
    start_time = time.time()
    success = False
    
    # Read output
    while True:
        # Check timeout (35 seconds)
        if time.time() - start_time > 35:
            print(f"⚠️ [TIMEOUT] Forçando encerramento para {name} após 35s")
            break
            
        # Check if process finished
        if proc.poll() is not None:
            # Check remaining output
            for line in proc.stdout.readlines():
                cleaned = line.strip()
                if cleaned:
                    print(f"  [CLI] {cleaned}")
                    if "Overrode" in cleaned or "Added" in cleaned:
                        success = True
            break
            
        # Read output line
        line = proc.stdout.readline()
        if not line:
            time.sleep(0.1)
            continue
            
        cleaned_line = line.strip()
        if cleaned_line:
            print(f"  [CLI] {cleaned_line}")
            
        # If we see success in the stream, we can mark success and terminate early
        if "Overrode" in cleaned_line or "Added" in cleaned_line or "Environment Variable" in cleaned_line:
            print(f"✅ [SUCESSO] Configurado {name}!")
            success = True
            break
        elif "already exists" in cleaned_line:
            print(f"✅ [SUCESSO] Variável {name} já existe (verificado).")
            success = True
            break
        elif "error" in cleaned_line.lower() and "telemetry" not in cleaned_line.lower():
            print(f"❌ [ERRO] Falha detectada para {name}")
            break
            
    # Clean up process
    try:
        proc.terminate()
        proc.wait(timeout=2)
    except Exception:
        try:
            proc.kill()
        except Exception:
            pass
        
    return success

def main():
    print("🧠 [ZEHLA PROD] Iniciando cadastro robusto de variáveis na Vercel...")
    succeeded = 0
    for name, value in ENV_VARS:
        if set_vercel_var(name, value):
            succeeded += 1
        print("-" * 50)
        
    print(f"\n📊 [RELATÓRIO] Configuração concluída! {succeeded}/{len(ENV_VARS)} variáveis configuradas.")

if __name__ == "__main__":
    main()
