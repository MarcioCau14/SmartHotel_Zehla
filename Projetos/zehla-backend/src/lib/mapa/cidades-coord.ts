export type Coord = [number, number];

export const CIDADES_COORD: Record<string, Coord> = {
  "rio de janeiro": [-22.9068, -43.1729],
  "paraty": [-23.2178, -44.7131],
  "buzios": [-22.7469, -41.8817],
  "angra dos reis": [-23.0068, -44.3182],
  "ilha grande": [-23.1499, -44.5378],
  "petropolis": [-22.5050, -43.1789],
  "teresopolis": [-22.4110, -42.9656],
  "arraial do cabo": [-22.9631, -42.0278],
  "saquarema": [-22.9292, -42.4944],
  "niteroi": [-22.8831, -43.1030],
  "cabofrio": [-22.8816, -42.0255],
  "macae": [-22.3825, -41.7889],
  "nova iguacu": [-22.7587, -43.4502],
  "volta redonda": [-22.5223, -44.0989],

  "sao paulo": [-23.5505, -46.6333],
  "campos do jordao": [-22.7397, -45.5933],
  "sao roque": [-23.5322, -47.1442],
  "santos": [-23.9608, -46.3336],
  "guarujá": [-23.9931, -46.2569],
  "ubatuba": [-23.4358, -45.0644],
  "ilhabela": [-23.8140, -45.3519],
  "sao sebastiao": [-23.7966, -45.4028],
  "sorocaba": [-23.5015, -47.4526],
  "campinas": [-22.9099, -47.0626],
  "ribeirao preto": [-21.1767, -47.8208],
  "sao jose dos campos": [-23.2237, -45.9009],
  "atibaia": [-23.1172, -46.5564],
  "braganca paulista": [-22.9517, -46.9425],
  "holambra": [-22.6364, -47.0553],
  "mongagua": [-24.0997, -46.5614],
  "peruibe": [-24.3128, -46.9475],
  "itahare": [-24.2481, -47.0314],
  "bertioga": [-23.8514, -46.1297],

  "tiradentes": [-21.1194, -44.1686],
  "ouro preto": [-20.3866, -43.5031],
  "mariana": [-20.3839, -43.4164],
  "belo horizonte": [-19.9167, -43.9345],
  "monte verde": [-22.8661, -46.1033],
  "sao thomas das letres": [-21.5183, -44.2589],
  "diamantina": [-18.2394, -43.6047],
  "caparao": [-20.4297, -41.8633],
  "congonhas": [-20.4942, -43.8608],
  "barbacena": [-21.2217, -43.7686],
  "caxambu": [-21.9753, -44.9489],

  "florianopolis": [-27.5954, -48.5480],
  "garopaba": [-28.0247, -48.6047],
  "imbbituba": [-28.2297, -48.6728],
  "lagos": [-28.5033, -48.8028],
  "penha": [-26.7886, -48.6294],
  "balneario camboriu": [-26.9906, -48.6347],
  "itapema": [-27.0906, -48.6119],
  "blumenau": [-26.9194, -49.0661],
  "joinville": [-26.3037, -48.8455],
  "lages": [-27.8164, -50.3264],
  "sao joaquim": [-28.2958, -49.9322],
  "porto belo": [-27.1375, -48.5489],
  "urubici": [-28.0239, -49.5972],
  "jaguaquara": [-26.4781, -49.1969],

  "gramado": [-29.3773, -50.8765],
  "canela": [-29.3586, -50.8503],
  "nova petropolis": [-29.3672, -50.9783],
  "bento goncalves": [-29.1725, -51.5217],
  "caxias do sul": [-29.1687, -51.1792],
  "portalegre": [-28.7833, -51.5886],
  "cambara do sul": [-29.0564, -50.6364],

  "salvador": [-12.9714, -38.5124],
  "porto seguro": [-16.4445, -39.0659],
  "arraial d ajuda": [-16.5494, -39.0589],
  "trancoso": [-16.5586, -39.1058],
  "itacare": [-14.2844, -38.9639],
  "morro de sao paulo": [-13.2628, -38.8781],
  "prado": [-17.3375, -39.2164],
  "itacarezinho": [-14.2244, -38.9039],
  "chapada diamantina": [-12.5586, -41.2842],
  "lençois": [-12.5486, -41.3931],
  "feira de santana": [-12.2669, -38.9589],
  "ilhéus": [-14.7939, -39.0394],

  "jericoacoara": [-2.7984, -40.5149],
  "fortaleza": [-3.7172, -38.5433],
  "canoa quebrada": [-4.9517, -37.7586],
  "beberibe": [-4.1656, -38.0756],
  "cumbuco": [-3.6275, -38.8781],
  "taiba": [-3.4978, -38.9283],
  "santa cruz": [-4.5611, -38.5544],
  "morro branco": [-3.7450, -38.8281],

  "recife": [-8.0476, -34.8770],
  "porto de galinhas": [-8.5211, -35.0981],
  "fernando de noronha": [-3.8544, -32.4239],
  "maragogi": [-8.7147, -35.1883],
  "boa viagem": [-8.1194, -34.8950],
  "olinda": [-7.9979, -34.8458],
  "caruaru": [-8.2828, -35.9711],

  "curitiba": [-25.4284, -49.2733],
  "foz do iguacu": [-25.5479, -54.5881],
  "ilha do mel": [-25.5572, -48.3561],
  "matinhos": [-25.8369, -48.5331],
  "pontal do parana": [-25.6833, -48.4781],
  "guaratuba": [-25.8856, -48.5803],
  "londrina": [-23.3106, -51.1628],
  "maringa": [-23.4256, -51.9386],

  "bonito": [-21.1264, -56.4867],
  "campo grande": [-20.4435, -54.6478],
  "aquidauana": [-20.4842, -55.7964],
  "miranda": [-20.2481, -56.3836],

  "manaus": [-3.1190, -60.0217],
  "parintins": [-2.6328, -56.7364],

  "belem": [-1.4558, -48.5024],
  "alter do chao": [-2.5147, -55.0106],
  "santarem": [-2.4430, -54.8577],
  "maraba": [-5.3689, -49.1177],

  "sao luis": [-2.5298, -44.2833],
  "lencois maranhenses": [-2.4936, -43.0164],
  "barreirinhas": [-2.7497, -42.8628],

  "natal": [-5.7945, -35.2110],
  "pipa": [-6.2311, -35.0486],
  "sao miguel dos milagres": [-9.0717, -35.3628],
  "maxaranguape": [-5.5078, -35.2461],

  "maceio": [-9.6658, -35.7353],
  "praia do francês": [-9.8078, -35.8803],

  "aracaju": [-10.9472, -37.0731],

  "joao pessoa": [-7.1150, -34.8611],
  "campina grande": [-7.2307, -35.8811],

  "vitoria": [-20.3155, -40.3128],
  "guarapari": [-20.6689, -40.5025],

  "goiania": [-16.6869, -49.2648],
  "pirenopolis": [-15.8519, -49.0303],
  "caldas novas": [-17.7386, -48.6225],
  "chapada dos veadeiros": [-14.1278, -47.8278],

  "cuiaba": [-15.6014, -56.0979],
  "chapada dos guimaraes": [-15.4314, -55.8400],

  "teresina": [-5.0892, -42.8019],
  "luis correia": [-2.8806, -41.6800],
  "barra grande": [-2.8231, -41.6881],

  "brasilia": [-15.7975, -47.8919],

  "palmas": [-10.1845, -48.3336],
};

export function geolocalizarCidade(cidade: string): Coord | null {
  const key = cidade.toLowerCase().trim();
  if (CIDADES_COORD[key]) return CIDADES_COORD[key];

  const semAcento = key
    .replace(/[áàâãä]/g, 'a')
    .replace(/[éèêë]/g, 'e')
    .replace(/[íìîï]/g, 'i')
    .replace(/[óòôõö]/g, 'o')
    .replace(/[úùûü]/g, 'u')
    .replace(/[ç]/g, 'c');
  if (CIDADES_COORD[semAcento]) return CIDADES_COORD[semAcento];

  return null;
}
