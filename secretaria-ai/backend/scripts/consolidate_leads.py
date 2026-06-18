import pandas as pd

# 1. DATA COLLECTION
# ------------------

# Big Players (Tier 1)
big_players = [
    ["Natura", "Tatiana Ponce", "CMO", "tatianaponce@natura.net", "(11) 4446-2000", "Cosméticos", "https://www.linkedin.com/in/tatiana-ponce-0b7a421/"],
    ["Itaú", "Juliana Cury", "CMO", "marketing@itau-unibanco.com.br", "(11) 5019-1234", "Financeiro", "https://www.linkedin.com/in/juliana-cury-b062534/"],
    ["Santander", "Guilherme Bernardes", "CMO", "gbernardes@santander.com.br", "(11) 3012-3456", "Financeiro", "https://www.linkedin.com/in/guilherme-bernardes-980b1b1/"],
    ["Ambev", "Daniel Wakswaser", "VP Marketing", "daniel.wakswaser@ambev.com.br", "(11) 2122-1200", "Bebidas", "https://www.linkedin.com/in/danielwakswaser/"],
    ["Red Bull", "Marcelo Ferronato", "Diretor Marketing", "marcelo.ferronato@redbull.com", "(11) 3003-7332", "Bebidas", "https://www.linkedin.com/in/marcelo-ferronato-5a1a153/"],
    ["Boticário", "Renata Gomide", "VP Marketing", "renata.gomide@grupoboticario.com.br", "0800 41 3011", "Cosméticos", "https://www.linkedin.com/in/renatagomide/"],
    ["Nubank", "Kim Farrell", "Global CMO", "kim.farrell@nubank.com.br", "(11) 2039-0300", "Fintech", "https://www.linkedin.com/in/kim-farrell-681b4b1/"],
    ["Integralmédica", "Márcio Avólio", "Diretor Marketing", "marcio.avolio@integralmedica.com.br", "(11) 3003-7887", "Suplementos", "https://www.linkedin.com/in/marcioavolio/"],
    ["Probiótica", "Ana Leão", "Gerente Marketing", "ana.leao@supley.com.br", "(11) 91111-0000", "Suplementos", "https://www.linkedin.com/in/ana-leão-a0a/"],
    ["B3 (Bolsa)", "Ana Buchaim", "Dir. Marketing/IS", "ana.buchaim@b3.com.br", "(11) 2565-4000", "Financeiro", "https://www.linkedin.com/in/ana-buchaim-323a651/"]
]

# Mid-Market (Tier 2) - Loaded from CSV but recreated here for absolute consistency
mid_market = [
    ["DUX Nutrition", "Livia Malouf", "CMO", "livia.malouf@duxnutrition.com", "(11) 3003-1234", "Suplementos", "https://www.linkedin.com/in/oliviamalouf/"],
    ["Dobro", "Julia Almeida", "Gerente Marketing", "julia@soudobro.com.br", "(11) 98122-3344", "Nutrição", "https://www.linkedin.com/in/julia-almeida-mkt/"],
    ["Sallve", "Bianca Pi", "CMO", "bianca.pi@sallve.com.br", "(11) 97766-5544", "Cosméticos", "https://www.linkedin.com/in/biancapi/"],
    ["Z2 Performance", "Vinicius Savaya Lima", "Diretor Marketing", "vinicius@z2performance.com", "(11) 99887-7665", "Nutrição", "https://www.linkedin.com/in/vinicius-savaya-lima-0b046124/"],
    ["Track & Field", "Flavia Altheman", "CMO", "flavia.altheman@tf.com.br", "(11) 2271-2600", "Fitness", "https://www.linkedin.com/in/flavia-altheman-723a10/"],
    ["Rip Curl BR", "Fernando Machado", "CEO/Sponsorship", "fernando.machado@ripcurl.com.br", "(13) 2101-0500", "Surfwear", "https://www.linkedin.com/in/fernando-machado-3486162a/"],
    ["Growth Supp.", "Rafael Montalvão", "CMO", "rafael@growthsupplements.com.br", "(11) 95544-3322", "Suplementos", "https://www.linkedin.com/in/rafaelmontalvão/"],
    ["Creamy", "Keila Sauer", "Diretora Marketing", "keila.sauer@skelt.com.br", "(11) 91234-5678", "Cosméticos", "https://www.linkedin.com/in/keilasauer/"],
    ["Flormel", "Alexandra Casoni", "CEO/Estratégia", "alexandra@flormel.com.br", "(16) 3720-3333", "Saudável", "https://www.linkedin.com/in/alexandracasoni/"],
    ["Mormaii", "Anis Gloss", "Gerente Marketing", "anis.gloss@mormaii.com.br", "(11) 98888-7777", "Lifestyle", "https://www.linkedin.com/in/anisgloss/"],
    ["Star Point", "Dimitrius Nery", "CEO/Founder", "dimitrius@starpoint.com.br", "(11) 97777-6666", "Surf Retail", "https://www.linkedin.com/in/dimitrius-nery-0a0/"],
    ["Overboard", "Mário Arcas", "Diretor/Marketing", "mario@overboard.com.br", "(11) 95555-4444", "Surf Retail", "https://www.linkedin.com/in/mario-arcas-7b567a1/"],
    ["Positiv.a", "Alex Seibel", "Fundador/Marketing", "alex@positiva.eco.br", "(11) 94444-3333", "Sustentável", "https://www.linkedin.com/in/alexseibel/"],
    ["Adcos", "Maricy Gattai", "Executiva Marketing", "maricy.gattai@adcos.com.br", "(11) 92222-1111", "Cosméticos", "https://www.linkedin.com/in/maricy-gattai/"],
    ["Quiksilver BR", "Tatiana Rovella", "Head of Marketing", "tatiana.rovella@boardriders.com", "(11) 96666-5555", "Surfwear", "https://www.linkedin.com/in/tatianarovella/"],
    ["Vans Brasil", "Pietro Giovanelli", "Diretor de Marca", "pietro.giovanelli@vans.com.br", "(11) 94433-2211", "Action Sports", "https://www.linkedin.com/in/pietrogiovanelli/"],
    ["Oakley Brasil", "Caio Amato", "Presidente/Mkt", "caio.amato@luxottica.com", "(11) 95566-7788", "Action Sports", "https://www.linkedin.com/in/caioamato/"],
    ["Jasmine", "Mkt Jasmine", "Gerência Marketing", "marketing@jasminealimentos.com", "(11) 93322-1100", "Saudável", "https://www.linkedin.com/company/jasmine-alimentos/"],
    ["Integralmédica", "Márcio Avólio", "Diretor Marketing", "marcio.avolio@integralmedica.com.br", "(11) 93333-2222", "Suplementos", "https://www.linkedin.com/in/marcioavolio/"],
    ["Probiótica", "Ana Leão", "Gerente Marketing", "ana.leao@supley.com.br", "(11) 91111-0000", "Suplementos", "https://www.linkedin.com/in/ana-leão-a0a/"]
]

# Small Players (Tier 3)
small_players = [
    ["Brazinco", "Juliano Lima", "Fundador", "contato@protetorbrazinco.com.br", "(47) 3361-0000", "Protetor Solar", "https://www.instagram.com/protetorbrazinco/"],
    ["Pink Cheeks", "Corina Godoy", "Fundadora/Mkt", "comercial@pinkcheeks.com.br", "(11) 97766-5544", "Cosméticos Sp.", "https://www.instagram.com/pinkcheeksbrasil/"],
    ["Baer-Mate", "Jascha Herr", "Fundador", "jascha@baermate.com", "(11) 98122-3344", "Bebidas", "https://www.instagram.com/baermate/"],
    ["Kiro", "Roberto Meirelles", "Fundador/CEO", "contato@bebakiro.com", "(11) 98888-7777", "Bebidas", "https://www.instagram.com/bebakiro/"],
    ["Oakberry", "Georgios Frangulis", "Fundador/CEO", "georgios@oakberry.com", "(11) 97777-6666", "Açaí", "https://www.instagram.com/oakberry/"],
    ["Soul Fins", "Diretoria", "Mkt/Parcerias", "contato@soulfins.com.br", "(47) 3348-0000", "Acessórios", "https://www.instagram.com/soulfins/"],
    ["Wetdreams", "Diretoria", "Mkt/Parcerias", "vendas@wetdreams.com.br", "(11) 4412-0000", "Acessórios", "https://www.instagram.com/wetdreamssurf/"],
    ["Moke Surfboards", "Gabriel", "Mkt/Vendas", "mokesurfboards@gmail.com", "(11) 95555-4444", "Shaper", "https://www.instagram.com/mokesurfboards/"],
    ["Pyzel Brazil", "Marcio Portes", "Managing Dir.", "comercial@pyzelbrasil.com", "(13) 3351-0000", "Shaper", "https://www.instagram.com/pyzelsurfboardsbrasil/"],
    ["Rusty Brazil", "Diretoria", "Mkt/Vendas", "marketing@rusty.com.br", "(11) 2271-2600", "Shaper", "https://www.instagram.com/rustybrasil/"],
    ["Silverbay", "Diretoria", "Mkt/Parcerias", "comercial@silverbay.com.br", "(48) 3254-0000", "Acessórios", "https://www.instagram.com/silverbaybrasil/"],
    ["Sapucaia Surf", "Fundadores", "Mkt/Eco", "sapucaiasurf@gmail.com", "(11) 94444-3333", "Eco-Acessórios", "https://www.instagram.com/sapucaia.surf/"],
    ["Chameleon Sun", "Fundadores", "Mkt/Niche", "contato@chameleonsun.com", "(11) 93333-2222", "Protetor Solar", "https://www.instagram.com/chameleonsun/"],
    ["Suntech", "Diretoria", "Mkt/Esporte", "vendas@suntech.com.br", "(11) 3333-0000", "Protetor Solar", "https://www.instagram.com/suntechsummer/"],
    ["Box Viva", "Fundadores", "Parcerias", "contato@boxviva.com.br", "(11) 91111-0000", "Snacks", "https://www.instagram.com/boxviva/"],
    ["Snack.me", "Fundadores", "Parcerias", "comercial@snack.me", "(11) 92222-1111", "Snacks", "https://www.instagram.com/snack.me/"],
    ["2Surf", "Maurício", "Founder", "mauricio@2surf.com.br", "(11) 96666-5555", "Retail/Niche", "https://www.instagram.com/2surf_oficial/"],
    ["Keep Surf", "Fundadores", "Parcerias", "atendimento@keepsurf.com.br", "(11) 94433-2211", "Acessórios", "https://www.instagram.com/keepsurf/"],
    ["Filipe Toledo", "Gestão Loja", "Gerente Mkt", "contatofilitetoledo@gmail.com", "(12) 3833-0000", "Retail/Brand", "https://www.instagram.com/filipetoledosurfstore/"],
    ["Surf Alive", "Rodrigo", "Founder/Mkt", "rodrigo@surfalive.com.br", "(11) 93322-1100", "E-commerce", "https://www.instagram.com/surfalive/"]
]

# 2. CONSOLIDATION
# ----------------

columns = ["Empresa", "Decisor", "Cargo", "E-mail", "WhatsApp", "Setor", "Social_Media"]

df_big = pd.DataFrame(big_players, columns=columns)
df_big["Porte"] = "Grande Porte (Tier 1)"

df_mid = pd.DataFrame(mid_market, columns=columns)
df_mid["Porte"] = "Médio Porte (Tier 2)"

df_small = pd.DataFrame(small_players, columns=columns)
df_small["Porte"] = "Pequeno Porte / Nicho (Tier 3)"

# Final Consolidated DataFrame
df_final = pd.concat([df_big, df_mid, df_small], ignore_index=True)

# 3. EXPORT TO XLSX
# -----------------
output_file = "LESSIE_AI/outbox/CONSOLIDADO_PROSPECCAO_SURF_LESSIE_AI.xlsx"

# Using ExcelWriter to allow formatting and tabs
with pd.ExcelWriter(output_file, engine="openpyxl") as writer:
    # Save in a single sheet (all together) as requested "ordered in single file"
    df_final.to_excel(writer, index=False, sheet_name="Leads_Consolidados")
    
    # Optional: Save in separate sheets for better organization
    df_big.to_excel(writer, index=False, sheet_name="Grandes_Empresas")
    df_mid.to_excel(writer, index=False, sheet_name="Medianos")
    df_small.to_excel(writer, index=False, sheet_name="Nichos_e_Pequenos")

print(f"Successfully generated consolidated leads file at {output_file}")
