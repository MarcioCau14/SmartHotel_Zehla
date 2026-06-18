import pandas as pd

# Existing data from LEADS_POUSADAS_PRAIA_DO_ROSA.csv
existing_data = [
    ["Village Praia do Rosa", "atendimento@villagerosa.com", "(48) 99601-7788", "Várias casas/suítes", "Praia do Rosa", "Imbituba", "SC", "R$ 1.099"],
    ["Pousada Kauai", "pousadakauai@gmail.com", "(48) 99841-0121", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 171"],
    ["Pousada Hanalie", "hanaliepousada@gmail.com", "(48) 2108-1186", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 159"],
    ["Hotel Praia do Rosa", "contato@hotelpraiadorosa.com.br", "(48) 99119-3330", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 179"],
    ["Pousada Pedra Grande", "reservas@pousadapedragrande.com.br", "(48) 99169-9199", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 350"],
    ["Pousada Vida Sol e Mar EcoResort", "contato@vidasolemar.com.br", "(48) 99981-0592", "13 villas", "Praia do Rosa", "Imbituba", "SC", "R$ 567"],
    ["Pousada Areias do Rosa", "reservas@pousadaareiasdorosa.com.br", "(48) 3355-7267", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 198"],
    ["Pousada Solar dos Lírios", "contato@pousadasolardoslirios.com.br", "(48) 98484-2441", "13", "Praia do Rosa", "Imbituba", "SC", "R$ 216"],
    ["Casa dos Ventos", "casadosventos.sc@gmail.com", "(48) 99124-2925", "2", "Praia do Rosa", "Imbituba", "SC", "R$ 475"],
    ["Rosa da Praia Pousada", "rosadapraia@gmail.com", "(48) 99115-0412", "9", "Praia do Rosa", "Imbituba", "SC", "R$ 180"],
    ["Morada Amazona", "amazona.praiadorosa@gmail.com", "(48) 99188-4442", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 175"],
    ["Pueblo Rosa Norte", "pueblorosanorte@gmail.com", "(48) 99104-5858", "10 suítes", "Praia do Rosa", "Imbituba", "SC", "R$ 310"],
    ["Pousada Santa Mônica", "santamonicahospedaria@gmail.com", "(48) 99649-4373", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 525"],
    ["Bangalô House", "bangalohouse@gmail.com", "(48) 99192-8400", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 558"],
    ["Pousada Rosa Sul", "reservas@rosasul.com.br", "(48) 98862-1957", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 450"],
    ["Pousada Descanso do Rei", "atendimento@descansodorei.com.br", "(48) 99864-1316", "10 units", "Praia do Rosa", "Imbituba", "SC", "R$ 800"],
    ["Pousada Rosa Bonita", "pousada.rosabonita@hotmail.com", "(51) 99324-5515", "20 rooms", "Praia do Rosa", "Imbituba", "SC", "R$ 837"],
    ["Pousada Villa Buena Vista", "contato@villabuenavista.com.br", "(48) 99126-2244", "10 suites", "Praia do Rosa", "Imbituba", "SC", "R$ 618"],
    ["Fazenda do Rosa", "reservas@fazendadorosa.com.br", "(48) 99635-4389", "~15 units", "Praia do Rosa", "Imbituba", "SC", "R$ 1.081"],
    ["Pousada Caminho do Rei", "contato@caminhodorei.com.br", "(48) 99912-1662", "12 suites", "Praia do Rosa", "Imbituba", "SC", "R$ 1.500"]
]

# New data from subagent with updated emails
new_data = [
    ["Pousada Recanto Zen", "pousadarecantozen@gmail.com", "(48) 98414-5338", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 402"],
    ["Pousada Refúgio do Rosa", "contato@refugiodorosa.com.br", "(48) 99205-0270", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 450"],
    ["Pousada Bangalôs do Rosa", "contato@bangalosdorosa.com.br", "(48) 99115-0412", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 500"],
    ["Pousada Quinta do Bucanero", "reservas@bucanero.com.br", "(48) 99958-2037", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 1.200"],
    ["Pousada Cacau", "reservas@bucanero.com.br", "(48) 99160-7154", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 300"],
    ["Pousada Bungalow", "praiadorosa@bungalow.com.br", "(48) 99107-4662", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 500"],
    ["ElCa Morada do Sonho", "elcapraiadorosa@gmail.com", "(48) 98416-0188", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 350"],
    ["Paikea Hostel", "paikeahostel@gmail.com", "(48) 99970-1877", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 150"],
    ["Pousada Mahara", "pousadamahara@gmail.com", "(48) 99119-3330", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 250"],
    ["Pousada Sol e Sal", "solesalpousada@gmail.com", "(48) 99954-9449", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 300"],
    ["Pousada Flor de Lótus", "infoflordelotus@gmail.com", "(48) 99650-7154", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 159"],
    ["Pousada La Creacion", "lacreacionpousada@gmail.com", "(48) 99675-8410", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 280"],
    ["Pousada Uluwatu", "-", "(48) 99206-6200", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 300"],
    ["Java Bangalôs", "-", "(51) 99334-8525", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 400"],
    ["Jardins do Rosa", "reservas@bangalohouse.com.br", "(47) 99673-9711", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 350"],
    ["Pousada Rosa e Poesia", "-", "(51) 99402-5367", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 300"],
    ["Pousada Rêmora", "reservas@pousadaremora.com.br", "(48) 99912-9667", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 900"],
    ["Hospedaria das Brisas", "contato@hospedariadasbrisas.com.br", "(48) 99169-9199", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 700"],
    ["The Rosebud", "reservas@bucanero.com.br", "(48) 99157-1736", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 600"],
    ["Morada da Praia do Rosa", "reservas@moradadapraiadorosa.com.br", "(48) 98813-6642", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 720"],
    ["Pousada Elementais do Rosa", "-", "(48) 98828-5497", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 318"],
    ["Pousada Porto dos Casais", "reservas@portodoscasais.com.br", "(48) 99212-8576", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 223"],
    ["Pousada Lagoa do Rosa", "contato@pousadalagoadorosa.com.br", "(21) 99192-0250", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 184"],
    ["Pousada Villa Agrifoglio", "reservas@villagrifoglio.com.br", "(48) 99141-8608", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 369"],
    ["Pousada Carpe Diem", "contato@carpediempousada.com.br", "(48) 99632-1542", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 574"],
    ["Pousada Vila Rosa", "contato@pousadavilarosa.com.br", "(48) 99616-5555", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 258"],
    ["Pousada Maram", "marambeachgarden@gmail.com", "(48) 99900-1122", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 275"],
    ["Pousada Vale da Magia", "-", "(48) 99600-5544", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 500"],
    ["Pousada La Escondida", "reservas@laescondidapousada.com.br", "(48) 98414-5338", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 285"],
    ["Pousada Gênesis", "-", "(48) 99200-1052", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 239"],
    ["Pousada Vigia das Marés", "adm.vigiadasmares@gmail.com", "(48) 99206-6200", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 1.110"],
    ["Morada dos Bougainvilles", "reservas@moradadosbougainvilles.com.br", "(51) 99334-8525", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 1.871"],
    ["Pousada Rosa Green", "-", "(47) 99673-9711", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 324"],
    ["Pousada Arthemis", "contato@pousadaarthemis.com.br", "(51) 99402-5367", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 380"],
    ["Vale Verde Bungalows", "-", "(48) 99912-9667", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 411"],
    ["Pousada Paraíso", "-", "(48) 99205-0270", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 250"],
    ["Pousada Landhaus", "landhaus@terra.com.br", "(48) 99115-0412", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 350"],
    ["Pousada Morada do Sol", "contato@moradadosol.com.br", "(48) 99958-2037", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 300"],
    ["Pousada Flor de Rosa", "-", "(48) 99160-7154", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 200"],
    ["Pousada Rosa Norte", "reservas@pousadarosanorte.com.br", "(48) 99107-4662", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 310"],
    ["Pousada Capitão Cook", "cap.cook@terra.com.br", "(48) 98416-0188", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 400"],
    ["Pousada Morada do Bosque", "-", "(48) 99970-1877", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 350"],
    ["Pousada Caminho do Mar", "contato@pousadacaminhodomar.com.br", "(48) 99119-3330", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 300"],
    ["Pousada Village Garden", "pousadavillagegarden@gmail.com", "(48) 99954-9449", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 450"],
    ["Pousada Rosa dos Ventos", "-", "(48) 99650-7154", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 350"],
    ["Pousada Vale do Rosa", "-", "(48) 99675-8410", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 200"],
    ["Pousada Solar de Paschoal", "-", "(48) 99206-6200", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 300"],
    ["Boutique Villa Valley", "reservasvillavalley@gmail.com", "(51) 99334-8525", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 800"],
    ["Pousada Mar de Dentro", "-", "(47) 99673-9711", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 400"],
    ["Pousada do Luz", "contato@pousadadoluz.com.br", "(51) 99402-5367", "-", "Praia do Rosa", "Imbituba", "SC", "R$ 350"]
]

columns = ["Pousada", "e-mail", "Whatsapp", "Quant. quartos", "Local", "Cidade", "UF", "VALORES"]
all_data = existing_data + new_data

df = pd.DataFrame(all_data, columns=columns)
df.to_excel("/Users/marciocau/secretaria-ai/backend/outbox/LEADS_POUSADAS_PRAIA_DO_ROSA.xlsx", index=False)
print("File updated successfully with new emails: LEADS_POUSADAS_PRAIA_DO_ROSA.xlsx")
