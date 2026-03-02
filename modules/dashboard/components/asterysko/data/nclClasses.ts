export interface NclClass {
    id: string;
    description: string;
    keywords: string[];
}

export const nclClasses: NclClass[] = [
    // Produtos (1-34)
    { id: "1", description: "Produtos químicos destinados à indústria, ciência e fotografia.", keywords: ["químicos", "indústria", "ciência", "fotografia", "agricultura"] },
    { id: "2", description: "Tintas, vernizes, lacas e corantes.", keywords: ["tintas", "vernizes", "lacas", "corantes", "pintura"] },
    { id: "3", description: "Produtos cosméticos e de higiene pessoal.", keywords: ["cosméticos", "higiene", "beleza", "limpeza", "shampoo", "perfume", "sabonete"] },
    { id: "4", description: "Óleos e graxas industriais, lubrificantes e combustíveis.", keywords: ["óleos", "graxas", "lubrificantes", "combustíveis", "gasolina", "iluminação"] },
    { id: "5", description: "Produtos farmacêuticos, veterinários e higiênicos para medicina.", keywords: ["farmacêuticos", "remédios", "veterinários", "medicina", "suplementos"] },
    { id: "6", description: "Metais comuns e suas ligas, materiais de construção metálicos.", keywords: ["metais", "construção", "ferragens", "cabos", "fios"] },
    { id: "7", description: "Máquinas, motores e ferramentas mecânicas.", keywords: ["máquinas", "motores", "ferramentas", "indústria", "robôs"] },
    { id: "8", description: "Ferramentas manuais e cutelaria.", keywords: ["ferramentas", "manuais", "facas", "talheres", "lâminas"] },
    { id: "9", description: "Aparelhos científicos, eletrônicos, softwares e computadores.", keywords: ["software", "aplicativo", "app", "computador", "eletrônica", "celular", "oculos", "internet"] },
    { id: "10", description: "Aparelhos médicos, cirúrgicos e odontológicos.", keywords: ["médicos", "cirúrgicos", "hospitalar", "próteses", "ortopedia"] },
    { id: "11", description: "Aparelhos de iluminação, aquecimento e refrigeração.", keywords: ["lâmpadas", "aquecedores", "ar condicionado", "geladeira", "forno"] },
    { id: "12", description: "Veículos e aparelhos de locomoção.", keywords: ["carros", "motos", "veículos", "bicicletas", "barcos", "aviões"] },
    { id: "13", description: "Armas de fogo e munições.", keywords: ["armas", "munição", "fogos", "explosivos"] },
    { id: "14", description: "Metais preciosos, joias e relógios.", keywords: ["joias", "ouro", "prata", "relógios", "bijuterias"] },
    { id: "15", description: "Instrumentos musicais.", keywords: ["instrumentos", "musicais", "piano", "violão", "bateria"] },
    { id: "16", description: "Papel, impressos, material de escritório e embalagens.", keywords: ["papel", "livros", "revistas", "canetas", "embalagens", "papelaria"] },
    { id: "17", description: "Borracha, plásticos semi-acabados e isolantes.", keywords: ["borracha", "plástico", "isolamento", "mangueiras"] },
    { id: "18", description: "Couro, bolsas, malas e carteiras.", keywords: ["couro", "bolsas", "malas", "carteiras", "mochilas"] },
    { id: "19", description: "Materiais de construção não metálicos.", keywords: ["construção", "cimento", "tijolos", "madeira", "vidro"] },
    { id: "20", description: "Móveis, espelhos e molduras.", keywords: ["móveis", "cadeiras", "mesas", "decoração", "colchões"] },
    { id: "21", description: "Utensílios domésticos, de cozinha e vidro.", keywords: ["cozinha", "panelas", "copos", "escovas", "limpeza"] },
    { id: "22", description: "Cordas, redes, tendas e lonas.", keywords: ["cordas", "redes", "tendas", "sacos"] },
    { id: "23", description: "Fios para uso têxtil.", keywords: ["fios", "linhas", "tecelagem", "costura"] },
    { id: "24", description: "Tecidos e roupas de cama e mesa.", keywords: ["tecidos", "lençóis", "toalhas", "cobertores"] },
    { id: "25", description: "Vestuário, calçados e chapelaria.", keywords: ["roupas", "camisas", "calças", "sapatos", "tênis", "bonés", "moda"] },
    { id: "26", description: "Rendas, bordados e aviamentos.", keywords: ["rendas", "botões", "zíperes", "costura", "enfeites"] },
    { id: "27", description: "Tapetes e revestimentos de piso.", keywords: ["tapetes", "carpetes", "pisos", "grama"] },
    { id: "28", description: "Jogos, brinquedos e artigos esportivos.", keywords: ["jogos", "brinquedos", "esporte", "ginástica", "videogame"] },
    { id: "29", description: "Carne, peixe, laticínios e alimentos processados.", keywords: ["carne", "peixe", "leite", "queijo", "frutas", "legumes", "geléia"] },
    { id: "30", description: "Café, chá, pão, doces e condimentos.", keywords: ["café", "chá", "chocolate", "pão", "bolo", "açúcar", "arroz", "sorvete"] },
    { id: "31", description: "Produtos agrícolas, animais vivos e plantas.", keywords: ["agricultura", "grãos", "animais", "flores", "racão"] },
    { id: "32", description: "Cervejas, refrigerantes, sucos e águas.", keywords: ["bebidas", "cerveja", "refrigerante", "suco", "água"] },
    { id: "33", description: "Bebidas alcoólicas (exceto cerveja).", keywords: ["vinho", "whisky", "vodka", "licor", "cachaça"] },
    { id: "34", description: "Tabaco e artigos para fumantes.", keywords: ["cigarro", "tabaco", "fumo", "isqueiro"] },

    // Serviços (35-45)
    { id: "35", description: "Publicidade, gestão de negócios e comércio.", keywords: ["publicidade", "marketing", "loja", "vendas", "consultoria", "gestão", "comércio", "escritório"] },
    { id: "36", description: "Seguros, financeiro e imobiliário.", keywords: ["banco", "seguros", "imobiliária", "investimentos", "financeiro", "crédito"] },
    { id: "37", description: "Construção, reparo e instalação.", keywords: ["construção", "reforma", "manutenção", "mecânico", "limpeza", "instalação"] },
    { id: "38", description: "Telecomunicações e difusão.", keywords: ["telecomunicações", "internet", "telefone", "tv", "rádio", "streaming"] },
    { id: "39", description: "Transporte, turismo e viagens.", keywords: ["transporte", "logística", "entregas", "viagens", "turismo", "armazenagem"] },
    { id: "40", description: "Tratamento de materiais e reciclagem.", keywords: ["reciclagem", "impressão", "costura", "usinagem", "fabricação"] },
    { id: "41", description: "Educação, entretenimento e eventos.", keywords: ["escola", "curso", "treinamento", "eventos", "shows", "festas", "esporte", "cultura"] },
    { id: "42", description: "Tecnologia, software e pesquisa científica.", keywords: ["tecnologia", "software", "programação", "site", "design", "engenharia", "arquitetura", "pesquisa"] },
    { id: "43", description: "Alimentação e hospedagem (Bares, Restaurantes, Hotéis).", keywords: ["restaurante", "bar", "hotel", "pousada", "cafeteria", "delivery", "comida"] },
    { id: "44", description: "Saúde, beleza e estética.", keywords: ["médico", "dentista", "clínica", "beleza", "salão", "estética", "veterinário", "agricultura"] },
    { id: "45", description: "Serviços jurídicos e de segurança.", keywords: ["advogado", "jurídico", "segurança", "detetive", "pessoal", "social", "casamento"] }
];
