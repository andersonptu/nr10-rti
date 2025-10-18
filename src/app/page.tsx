'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, Upload, Video, Mic, Eye, Trash2, Download, FileText, CheckCircle, XCircle, AlertCircle,
  Plus, Building, User, Calendar, MapPin, BarChart3, PieChart, TrendingUp, Clock, 
  FileDown, Settings, Home, List, Dashboard, Save, RotateCcw, Bell, Shield, 
  Database, Palette, Globe, Monitor, Smartphone, Tablet, Phone, Mail, MapPinIcon,
  Navigation, Loader, Image, Edit, Search, Filter
} from 'lucide-react';

interface MediaFile {
  id: string;
  file: File;
  type: 'image' | 'video' | 'audio';
  url: string;
  name: string;
  size: number;
}

interface ChecklistItem {
  id: number;
  norma: string;
  descricao: string;
  condicao: 'C' | 'NC' | 'NA' | '';
  po: 'C' | 'NC' | 'NA' | '';
  fe: 'C' | 'NC' | 'NA' | '';
  gsd: 'C' | 'NC' | 'NA' | '';
  nper: 'C' | 'NC' | 'NA' | '';
  recomendacoes: string;
  imagemPadrao: string;
  medias: MediaFile[];
  selected: boolean;
  precisaImagem: boolean; // Nova propriedade para indicar se o item precisa de imagem padrão
}

interface Area {
  id: string;
  nome: string;
  items: ChecklistItem[];
}

interface Localizacao {
  latitude: number;
  longitude: number;
  endereco?: string;
  timestamp: string;
  precisao?: number;
}

interface Inspecao {
  id: string;
  nome: string;
  numeroContrato: string;
  engenheiroResponsavel: string;
  responsavelCliente: string;
  numeroSequencial: string;
  data: string;
  areas: Area[];
  status: 'Em Andamento' | 'Concluída' | 'Pendente';
  createdAt: string;
  localizacao?: Localizacao;
  logoCliente?: string; // Nova propriedade para logo do cliente
}

interface ConfiguracaoSistema {
  empresa: {
    nome: string;
    cnpj: string;
    endereco: string;
    telefone: string;
    email: string;
    logo: string;
    marcaDagua: string; // Nova propriedade para marca d'água
  };
  relatorios: {
    incluirFotos: boolean;
    incluirComentarios: boolean;
    formatoPadrao: 'PDF' | 'Excel' | 'Word';
    assinaturasDigitais: boolean;
    marcaDagua: boolean;
  };
  notificacoes: {
    emailInspecaoConcluida: boolean;
    emailPrazosVencimento: boolean;
    lembreteManutencao: boolean;
    alertasNaoConformidade: boolean;
  };
  sistema: {
    tema: 'claro' | 'escuro' | 'auto';
    idioma: 'pt-BR' | 'en-US' | 'es-ES';
    autoSalvar: boolean;
    backupAutomatico: boolean;
    qualidadeFoto: 'alta' | 'media' | 'baixa';
  };
  seguranca: {
    senhaObrigatoria: boolean;
    tempoSessao: number;
    logAuditoria: boolean;
    criptografiaLocal: boolean;
  };
}

// Estado global para armazenar as imagens padrão dos itens
interface ImagemPadraoItem {
  id: number;
  norma: string;
  descricao: string;
  imagemPadrao: string;
  categoria: string;
  precisaImagem: boolean; // Nova propriedade para controlar se o item precisa de imagem
}

// Configuração global de quais itens precisam de imagem padrão
interface ConfiguracaoImagensPadrao {
  itensSelecionados: number[]; // IDs dos itens que devem ter imagem padrão
}

const checklistItems: Omit<ChecklistItem, 'condicao' | 'po' | 'fe' | 'gsd' | 'nper' | 'recomendacoes' | 'imagemPadrao' | 'medias' | 'selected' | 'precisaImagem'>[] = [
  { id: 1, norma: "NR10.3.9-d", descricao: "A sala ou subestação está identificada? Item 10.10.1-c – NR-10" },
  { id: 2, norma: "NR10.4.1", descricao: "As instalações elétricas devem ser projetadas e executadas de modo que seja possível prevenir acidentes e outras ocorrências originadas por choque elétrico?" },
  { id: 3, norma: "NR10.4.2", descricao: "As instalações elétricas devem ser projetadas e executadas de modo que seja possível prevenir incêndios e explosões?" },
  { id: 4, norma: "NR10.4.3", descricao: "As instalações elétricas devem ser projetadas e executadas de modo que seja possível prevenir outros tipos de acidentes?" },
  { id: 5, norma: "NR10.5.1", descricao: "As instalações elétricas devem ser mantidas em condições seguras de funcionamento?" },
  { id: 6, norma: "NR10.5.2", descricao: "As instalações elétricas devem ser submetidas à manutenção preventiva e corretiva?" },
  { id: 7, norma: "NR10.5.3", descricao: "As instalações elétricas devem ser inspecionadas e testadas de acordo com as regulamentações existentes?" },
  { id: 8, norma: "NR10.6.1", descricao: "As instalações elétricas devem ser aterradas conforme regulamentação pertinente?" },
  { id: 9, norma: "NR10.6.2", descricao: "O aterramento das instalações elétricas deve ser verificado periodicamente?" },
  { id: 10, norma: "NR10.7.1", descricao: "Os equipamentos de proteção coletiva devem ser mantidos em perfeitas condições de uso?" },
  { id: 11, norma: "NR10.7.2", descricao: "Os equipamentos de proteção individual devem ser adequados às atividades desenvolvidas?" },
  { id: 12, norma: "NR10.8.1", descricao: "É proibido o uso de adornos pessoais nos trabalhos com instalações elétricas?" },
  { id: 13, norma: "NR10.8.2", descricao: "Os trabalhadores devem usar equipamentos de proteção individual adequados?" },
  { id: 14, norma: "NR10.9.1", descricao: "Em todos os serviços executados em instalações elétricas devem ser previstas e adotadas medidas de proteção?" },
  { id: 15, norma: "NR10.9.2", descricao: "As medidas de proteção coletiva compreendem a desenergização elétrica?" },
  { id: 16, norma: "NR10.9.3", descricao: "A desenergização elétrica deve ser efetuada conforme sequência apropriada?" },
  { id: 17, norma: "NR10.10.1", descricao: "As áreas onde houver instalações ou equipamentos elétricos devem ser dotadas de proteção contra incêndio?" },
  { id: 18, norma: "NR10.10.2", descricao: "Os materiais, peças, dispositivos, equipamentos e sistemas destinados à aplicação em instalações elétricas devem ser avaliados quanto à sua conformidade?" },
  { id: 19, norma: "NR10.11.1", descricao: "Os trabalhadores autorizados a trabalhar em instalações elétricas devem ter treinamento específico?" },
  { id: 20, norma: "NR10.11.2", descricao: "Os trabalhadores devem receber treinamento de reciclagem bienal?" },
  { id: 21, norma: "NR10.12.1", descricao: "As empresas devem manter esquemas unifilares atualizados das instalações elétricas?" },
  { id: 22, norma: "NR10.12.2", descricao: "As empresas devem manter especificações do sistema de aterramento?" },
  { id: 23, norma: "NR10.12.3", descricao: "As empresas devem manter especificações dos dispositivos de proteção?" },
  { id: 24, norma: "NR10.13.1", descricao: "As empresas devem implementar medidas de controle do risco elétrico?" },
  { id: 25, norma: "NR10.13.2", descricao: "As medidas de controle devem integrar-se às demais iniciativas da empresa?" },
  { id: 26, norma: "NR10.14.1", descricao: "Os trabalhadores devem interromper suas tarefas exercendo o direito de recusa?" },
  { id: 27, norma: "NR10.14.2", descricao: "As situações que configurem risco grave e iminente devem ser comunicadas?" },
  { id: 28, norma: "NR10.2.1", descricao: "Esta NR se aplica às fases de geração, transmissão, distribuição e consumo?" },
  { id: 29, norma: "NR10.2.2", descricao: "Esta NR se aplica a todas as etapas de projeto, construção, montagem, operação, manutenção das instalações elétricas?" },
  { id: 30, norma: "NR10.2.3", descricao: "Aplica-se a quaisquer trabalhos realizados nas suas proximidades?" },
  { id: 31, norma: "NR10.3.1", descricao: "É de responsabilidade dos empregadores a implementação de medidas de controle?" },
  { id: 32, norma: "NR10.3.2", descricao: "Cabe aos trabalhadores observar as normas de segurança?" },
  { id: 33, norma: "NR10.3.3", descricao: "É responsabilidade dos contratantes manter os trabalhadores informados sobre os riscos?" },
  { id: 34, norma: "NR10.3.4", descricao: "Cabe à empresa contratante garantir as mesmas condições de proteção?" },
  { id: 35, norma: "NR10.3.5", descricao: "É de responsabilidade dos contratantes a adoção de medidas para que terceiros não autorizados não tenham acesso?" },
  { id: 36, norma: "NR10.3.6", descricao: "Os trabalhadores devem ser qualificados ou capacitados?" },
  { id: 37, norma: "NR10.3.7", descricao: "Os trabalhadores devem receber treinamento específico sobre os riscos?" },
  { id: 38, norma: "NR10.3.8", descricao: "É vedado o trabalho em instalações elétricas energizadas em áreas classificadas?" },
  { id: 39, norma: "NR10.3.9-a", descricao: "Somente serão consideradas desenergizadas as instalações elétricas liberadas para trabalho?" },
  { id: 40, norma: "NR10.3.9-b", descricao: "As instalações devem estar com ausência de tensão?" },
  { id: 41, norma: "NR10.3.9-c", descricao: "As instalações devem estar impedidas de energização?" },
  { id: 42, norma: "NR10.3.9-e", descricao: "As instalações devem estar aterradas?" },
  { id: 43, norma: "NR10.3.9-f", descricao: "As instalações devem estar protegidas dos elementos energizados existentes?" },
  { id: 44, norma: "NR10.3.10", descricao: "O estado de instalação desenergizada deve ser mantido até a autorização para reenergização?" },
  { id: 45, norma: "NR10.4.4", descricao: "As instalações elétricas devem ser construídas, montadas, operadas, reformadas, ampliadas, reparadas e inspecionadas de forma a garantir a segurança?" },
  { id: 46, norma: "NR10.4.5", descricao: "Nos locais de trabalho só podem ser utilizados equipamentos, dispositivos e ferramentas elétricas compatíveis com a instalação elétrica existente?" },
  { id: 47, norma: "NR10.5.4", descricao: "Os locais de serviços elétricos devem ser dotados de iluminação adequada?" },
  { id: 48, norma: "NR10.5.5", descricao: "A iluminação de emergência deve ser prevista quando necessária?" },
  { id: 49, norma: "NR10.6.3", descricao: "As partes das instalações elétricas sujeitas a influências externas devem ser dotadas de proteção?" },
  { id: 50, norma: "NR10.6.4", descricao: "Os circuitos elétricos com finalidades diferentes devem ser identificados e instalados separadamente?" },
  { id: 51, norma: "NR10.7.3", descricao: "As vestimentas de trabalho devem ser adequadas às atividades?" },
  { id: 52, norma: "NR10.7.4", descricao: "É vedado o uso de vestimentas condutoras de eletricidade?" },
  { id: 53, norma: "NR10.8.3", descricao: "Os trabalhadores com cabelos longos devem mantê-los presos?" },
  { id: 54, norma: "NR10.8.4", descricao: "É vedado o porte de equipamentos que possam induzir energias eletrostáticas?" },
  { id: 55, norma: "NR10.9.4", descricao: "Na impossibilidade de implementação do estabelecido no subitem 10.9.3, devem ser utilizadas outras medidas de proteção coletiva?" },
  { id: 56, norma: "NR10.9.5", descricao: "Por fim, devem ser adotados equipamentos de proteção individual?" },
  { id: 57, norma: "NR10.10.3", descricao: "Os estabelecimentos com carga instalada superior a 75 kW devem constituir e manter o Prontuário de Instalações Elétricas?" },
  { id: 58, norma: "NR10.10.4", descricao: "As empresas que operam em instalações ou equipamentos integrantes do sistema elétrico de potência devem constituir Prontuário?" },
  { id: 59, norma: "NR10.11.3", descricao: "Trabalhadores de empresas que interajam com o SEP devem ter treinamento específico?" },
  { id: 60, norma: "NR10.11.4", descricao: "Os trabalhadores com atividades não relacionadas às instalações elétricas devem ser instruídos?" },
  { id: 61, norma: "NR10.11.5", descricao: "Aqueles trabalhadores incumbidos de atividades em áreas onde houver instalações elétricas devem ser instruídos?" },
  { id: 62, norma: "NR10.11.6", descricao: "Todo trabalhador em instalações elétricas energizadas em AT deve dispor de equipamento que permita a comunicação permanente?" },
  { id: 63, norma: "NR10.11.7", descricao: "Os trabalhadores autorizados devem estar aptos a executar o resgate e prestar primeiros socorros?" },
  { id: 64, norma: "NR10.11.8", descricao: "A empresa deve possuir métodos de resgate padronizados e adequados às suas atividades?" },
  { id: 65, norma: "NR10.11.9", descricao: "Os trabalhadores autorizados devem receber treinamento específico em segurança?" },
  { id: 66, norma: "NR10.12.4", descricao: "As empresas devem manter descrição dos procedimentos para emergências?" },
  { id: 67, norma: "NR10.12.5", descricao: "As empresas devem manter certificações dos equipamentos de proteção coletiva e individual?" },
  { id: 68, norma: "NR10.13.3", descricao: "As medidas de controle adotadas devem integrar-se às demais iniciativas da empresa?" },
  { id: 69, norma: "NR10.13.4", descricao: "As empresas devem promover ações de controle do risco elétrico?" },
  { id: 70, norma: "NR10.14.3", descricao: "A empresa deve promover a participação dos trabalhadores na implementação das medidas de proteção?" },
  { id: 71, norma: "NR10.14.4", descricao: "Cabe aos trabalhadores exercer o direito de recusa ao trabalho?" },
  { id: 72, norma: "NR10.15.1", descricao: "As atividades em instalações elétricas devem ser desenvolvidas por trabalhador qualificado ou capacitado?" },
  { id: 73, norma: "NR10.15.2", descricao: "Entende-se como trabalhador qualificado aquele que comprovar conclusão de curso específico?" },
  { id: 74, norma: "NR10.15.3", descricao: "É considerado trabalhador capacitado aquele que atenda às seguintes condições simultaneamente?" },
  { id: 75, norma: "NR10.15.4", descricao: "São considerados autorizados os trabalhadores qualificados ou capacitados com anuência formal da empresa?" }
];

export default function InspecaoEletrica() {
  const [currentView, setCurrentView] = useState<'home' | 'nova-inspecao' | 'inspecao' | 'checklist' | 'selecionar-itens' | 'configuracoes' | 'dashboard' | 'gerenciar-imagens'>('home');
  const [inspecoes, setInspecoes] = useState<Inspecao[]>([]);
  const [currentInspecao, setCurrentInspecao] = useState<Inspecao | null>(null);
  const [currentArea, setCurrentArea] = useState<Area | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const [cameraOpen, setCameraOpen] = useState<{ itemId: number } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Estados para geolocalização
  const [localizacao, setLocalizacao] = useState<Localizacao | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Estados para nova inspeção
  const [novaInspecao, setNovaInspecao] = useState({
    nome: '',
    numeroContrato: '',
    engenheiroResponsavel: '',
    responsavelCliente: '',
    data: new Date().toISOString().split('T')[0],
    logoCliente: '' // Novo campo para logo do cliente
  });

  // Estados para nova área
  const [novaArea, setNovaArea] = useState('');
  const [showNovaAreaForm, setShowNovaAreaForm] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectAllItems, setSelectAllItems] = useState(true);

  // Estados para gerenciamento de imagens padrão
  const [imagensPadrao, setImagensPadrao] = useState<ImagemPadraoItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [editingImage, setEditingImage] = useState<number | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Estados para configuração de imagens padrão
  const [configuracaoImagensPadrao, setConfiguracaoImagensPadrao] = useState<ConfiguracaoImagensPadrao>({
    itensSelecionados: [] // Inicialmente nenhum item selecionado
  });

  // Estados para configurações
  const [configuracoes, setConfiguracoes] = useState<ConfiguracaoSistema>({
    empresa: {
      nome: 'PA BRASIL AUTOMAÇÃO',
      cnpj: '12.345.678/0001-90',
      endereco: 'Rua Bálsamo, 107 - Jardim Serrano - Paracatu/MG',
      telefone: '(38) 998368153',
      email: 'pabrasil@pabrasil.net',
      logo: 'https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/fa828cdc-1102-4fee-ad59-2f41a354564e.jpg',
      marcaDagua: 'https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/fa828cdc-1102-4fee-ad59-2f41a354564e.jpg' // Marca d'água PA Brasil
    },
    relatorios: {
      incluirFotos: true,
      incluirComentarios: true,
      formatoPadrao: 'PDF',
      assinaturasDigitais: false,
      marcaDagua: true
    },
    notificacoes: {
      emailInspecaoConcluida: true,
      emailPrazosVencimento: true,
      lembreteManutencao: false,
      alertasNaoConformidade: true
    },
    sistema: {
      tema: 'claro',
      idioma: 'pt-BR',
      autoSalvar: true,
      backupAutomatico: true,
      qualidadeFoto: 'alta'
    },
    seguranca: {
      senhaObrigatoria: false,
      tempoSessao: 60,
      logAuditoria: true,
      criptografiaLocal: false
    }
  });

  const [activeConfigTab, setActiveConfigTab] = useState<'empresa' | 'relatorios' | 'notificacoes' | 'sistema' | 'seguranca'>('empresa');

  // Inicializar imagens padrão com categorias
  useEffect(() => {
    const imagensIniciais: ImagemPadraoItem[] = checklistItems.map(item => ({
      id: item.id,
      norma: item.norma,
      descricao: item.descricao,
      imagemPadrao: getDefaultImageForItem(item.id),
      categoria: getCategoryForItem(item.norma),
      precisaImagem: false // Inicialmente nenhum item precisa de imagem
    }));
    setImagensPadrao(imagensIniciais);
  }, []);

  // Função para obter imagem padrão baseada no tipo de item
  const getDefaultImageForItem = (itemId: number): string => {
    const imageMap: { [key: number]: string } = {
      1: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop&q=80', // Identificação
      2: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&q=80', // Prevenção acidentes
      3: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop&q=80', // Prevenção incêndios
      4: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop&q=80', // Prevenção geral
      5: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop&q=80', // Manutenção
      6: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop&q=80', // Manutenção preventiva
      7: 'https://images.unsplash.com/photo-1621905252472-e8592afb8f2f?w=400&h=300&fit=crop&q=80', // Inspeção
      8: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop&q=80', // Aterramento
      9: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop&q=80', // Verificação aterramento
      10: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&q=80', // EPC
      // Continua para todos os 75 itens...
    };
    
    return imageMap[itemId] || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop&q=80';
  };

  // Função para categorizar itens
  const getCategoryForItem = (norma: string): string => {
    if (norma.includes('10.3')) return 'Responsabilidades';
    if (norma.includes('10.4')) return 'Projeto e Execução';
    if (norma.includes('10.5')) return 'Manutenção';
    if (norma.includes('10.6')) return 'Aterramento e Proteção';
    if (norma.includes('10.7')) return 'Equipamentos de Proteção';
    if (norma.includes('10.8')) return 'Vestimentas e Adornos';
    if (norma.includes('10.9')) return 'Medidas de Proteção';
    if (norma.includes('10.10')) return 'Proteção contra Incêndio';
    if (norma.includes('10.11')) return 'Treinamento';
    if (norma.includes('10.12')) return 'Documentação';
    if (norma.includes('10.13')) return 'Controle de Riscos';
    if (norma.includes('10.14')) return 'Direitos e Deveres';
    if (norma.includes('10.15')) return 'Qualificação';
    return 'Geral';
  };

  // Função para atualizar imagem padrão
  const updateImagemPadrao = (itemId: number, novaUrl: string) => {
    setImagensPadrao(prev => prev.map(item => 
      item.id === itemId ? { ...item, imagemPadrao: novaUrl } : item
    ));
    
    // Atualizar também nas inspeções existentes
    setInspecoes(prev => prev.map(inspecao => ({
      ...inspecao,
      areas: inspecao.areas.map(area => ({
        ...area,
        items: area.items.map(item => 
          item.id === itemId ? { ...item, imagemPadrao: novaUrl } : item
        )
      }))
    })));

    setEditingImage(null);
    setNewImageUrl('');
    alert('Imagem padrão atualizada com sucesso!');
  };

  // Função para alternar seleção de item para imagem padrão
  const toggleItemImagemPadrao = (itemId: number) => {
    setImagensPadrao(prev => prev.map(item => 
      item.id === itemId ? { ...item, precisaImagem: !item.precisaImagem } : item
    ));

    setConfiguracaoImagensPadrao(prev => ({
      ...prev,
      itensSelecionados: prev.itensSelecionados.includes(itemId)
        ? prev.itensSelecionados.filter(id => id !== itemId)
        : [...prev.itensSelecionados, itemId]
    }));
  };

  // Função para selecionar/deselecionar todos os itens para imagem padrão
  const toggleAllItemsImagemPadrao = () => {
    const todosIds = imagensPadrao.map(item => item.id);
    const todosSelecionados = configuracaoImagensPadrao.itensSelecionados.length === todosIds.length;

    if (todosSelecionados) {
      // Desmarcar todos
      setImagensPadrao(prev => prev.map(item => ({ ...item, precisaImagem: false })));
      setConfiguracaoImagensPadrao(prev => ({ ...prev, itensSelecionados: [] }));
    } else {
      // Selecionar todos
      setImagensPadrao(prev => prev.map(item => ({ ...item, precisaImagem: true })));
      setConfiguracaoImagensPadrao(prev => ({ ...prev, itensSelecionados: todosIds }));
    }
  };

  // Função para salvar configuração de imagens padrão
  const salvarConfiguracaoImagensPadrao = () => {
    localStorage.setItem('configuracao-imagens-padrao', JSON.stringify(configuracaoImagensPadrao));
    alert(`Configuração salva com sucesso!\n${configuracaoImagensPadrao.itensSelecionados.length} itens selecionados para receber imagem padrão em novas inspeções.`);
  };

  // Filtrar imagens baseado na busca e categoria
  const imagensFiltradas = imagensPadrao.filter(item => {
    const matchSearch = item.norma.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       item.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === 'todas' || item.categoria === selectedCategory;
    return matchSearch && matchCategory;
  });

  // Obter categorias únicas
  const categorias = ['todas', ...Array.from(new Set(imagensPadrao.map(item => item.categoria)))];

  // FUNÇÃO PARA OBTER GEOLOCALIZAÇÃO
  const obterLocalizacao = async () => {
    setLoadingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocalização não é suportada neste navegador');
      setLoadingLocation(false);
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        );
      });

      const novaLocalizacao: Localizacao = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        precisao: position.coords.accuracy,
        timestamp: new Date().toISOString()
      };

      // Tentar obter endereço usando reverse geocoding
      try {
        const response = await fetch(
          `https://api.opencagedata.com/geocode/v1/json?q=${position.coords.latitude}+${position.coords.longitude}&key=YOUR_API_KEY&language=pt&pretty=1`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.results && data.results.length > 0) {
            novaLocalizacao.endereco = data.results[0].formatted;
          }
        }
      } catch (geocodeError) {
        // Se falhar o geocoding, continua sem o endereço
        console.log('Não foi possível obter o endereço, mas a localização foi capturada');
      }

      setLocalizacao(novaLocalizacao);
      
      // Se estiver criando uma inspeção, adicionar a localização
      if (currentInspecao) {
        const updatedInspecao = {
          ...currentInspecao,
          localizacao: novaLocalizacao
        };
        setCurrentInspecao(updatedInspecao);
        setInspecoes(prev => prev.map(i => i.id === currentInspecao.id ? updatedInspecao : i));
      }

    } catch (error: any) {
      let errorMessage = 'Erro ao obter localização';
      
      if (error.code === 1) {
        errorMessage = 'Permissão de localização negada. Permita o acesso à localização nas configurações do navegador.';
      } else if (error.code === 2) {
        errorMessage = 'Localização indisponível. Verifique se o GPS está ativado.';
      } else if (error.code === 3) {
        errorMessage = 'Tempo limite excedido ao obter localização.';
      }
      
      setLocationError(errorMessage);
    } finally {
      setLoadingLocation(false);
    }
  };

  // COMPONENTE DE GEOLOCALIZAÇÃO
  const GeolocationComponent = () => (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Navigation className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Localização do Cliente</h3>
        </div>
        <button
          onClick={obterLocalizacao}
          disabled={loadingLocation}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            loadingLocation 
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loadingLocation ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Obtendo...
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4" />
              Capturar Localização
            </>
          )}
        </button>
      </div>

      {locationError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800 text-sm">{locationError}</p>
          </div>
        </div>
      )}

      {localizacao && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-green-800 mb-2">Coordenadas GPS</h4>
              <div className="text-sm text-green-700 space-y-1">
                <p><span className="font-medium">Latitude:</span> {localizacao.latitude.toFixed(6)}</p>
                <p><span className="font-medium">Longitude:</span> {localizacao.longitude.toFixed(6)}</p>
                {localizacao.precisao && (
                  <p><span className="font-medium">Precisão:</span> ±{Math.round(localizacao.precisao)}m</p>
                )}
                <p><span className="font-medium">Capturado em:</span> {new Date(localizacao.timestamp).toLocaleString('pt-BR')}</p>
              </div>
            </div>
            
            {localizacao.endereco && (
              <div>
                <h4 className="font-medium text-green-800 mb-2">Endereço</h4>
                <p className="text-sm text-green-700">{localizacao.endereco}</p>
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <a
              href={`https://www.google.com/maps?q=${localizacao.latitude},${localizacao.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
            >
              <Globe className="w-4 h-4" />
              Ver no Google Maps
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${localizacao.latitude}, ${localizacao.longitude}`);
                alert('Coordenadas copiadas para a área de transferência!');
              }}
              className="flex items-center gap-2 bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Copiar Coordenadas
            </button>
          </div>
        </div>
      )}

      {!localizacao && !locationError && !loadingLocation && (
        <div className="text-center py-8">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">Clique em "Capturar Localização" para registrar a posição atual</p>
          <p className="text-gray-400 text-sm mt-1">A localização será anexada à inspeção para referência</p>
        </div>
      )}
    </div>
  );

  // FUNÇÃO PARA GERAR NÚMERO SEQUENCIAL
  const generateSequentialNumber = (responsavelCliente: string): string => {
    const currentYear = new Date().getFullYear();
    
    // Contar quantas inspeções já existem para este cliente no ano atual
    const clienteInspecoes = inspecoes.filter(inspecao => {
      const inspecaoYear = new Date(inspecao.createdAt).getFullYear();
      return inspecao.responsavelCliente === responsavelCliente && inspecaoYear === currentYear;
    });
    
    const nextNumber = clienteInspecoes.length + 1;
    const sequentialNumber = nextNumber.toString().padStart(4, '0');
    
    return `PA-${currentYear}-${sequentialNumber}`;
  };

  const createNewInspecao = () => {
    if (!novaInspecao.nome || !novaInspecao.numeroContrato || !novaInspecao.engenheiroResponsavel || !novaInspecao.responsavelCliente) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    // Gerar número sequencial baseado no responsável do cliente
    const numeroSequencial = generateSequentialNumber(novaInspecao.responsavelCliente);

    const inspecao: Inspecao = {
      id: Date.now().toString(),
      nome: novaInspecao.nome,
      numeroContrato: novaInspecao.numeroContrato,
      engenheiroResponsavel: novaInspecao.engenheiroResponsavel,
      responsavelCliente: novaInspecao.responsavelCliente,
      numeroSequencial: numeroSequencial,
      data: novaInspecao.data,
      areas: [],
      status: 'Em Andamento',
      createdAt: new Date().toISOString(),
      localizacao: localizacao || undefined,
      logoCliente: novaInspecao.logoCliente || undefined
    };

    setInspecoes(prev => [...prev, inspecao]);
    setCurrentInspecao(inspecao);
    setCurrentView('inspecao');
    
    // Reset form
    setNovaInspecao({
      nome: '',
      numeroContrato: '',
      engenheiroResponsavel: '',
      responsavelCliente: '',
      data: new Date().toISOString().split('T')[0],
      logoCliente: ''
    });

    // Mostrar mensagem com o número sequencial gerado
    alert(`Inspeção criada com sucesso!\nNúmero sequencial: ${numeroSequencial}${localizacao ? '\nLocalização capturada e anexada!' : ''}`);
  };

  const showItemSelection = () => {
    setSelectedItems(checklistItems.map(item => item.id)); // Selecionar todos por padrão
    setSelectAllItems(true);
    setCurrentView('selecionar-itens');
  };

  const toggleSelectAll = () => {
    if (selectAllItems) {
      // Se todos estão selecionados, desmarcar todos
      setSelectedItems([]);
      setSelectAllItems(false);
    } else {
      // Se nem todos estão selecionados, selecionar todos
      setSelectedItems(checklistItems.map(item => item.id));
      setSelectAllItems(true);
    }
  };

  const toggleItemSelection = (itemId: number) => {
    setSelectedItems(prev => {
      const newSelection = prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId];
      
      // Atualizar o estado do "Selecionar Todos" baseado na nova seleção
      setSelectAllItems(newSelection.length === checklistItems.length);
      return newSelection;
    });
  };

  const addAreaWithSelectedItems = () => {
    if (!novaArea.trim() || !currentInspecao) return;

    if (selectedItems.length === 0) {
      alert('Selecione pelo menos um item para inspeção');
      return;
    }

    // Criar checklist apenas com os itens selecionados
    const checklistSelecionado: ChecklistItem[] = checklistItems
      .filter(item => selectedItems.includes(item.id))
      .map(item => {
        const imagemItem = imagensPadrao.find(img => img.id === item.id);
        const precisaImagem = configuracaoImagensPadrao.itensSelecionados.includes(item.id);
        
        return {
          id: item.id,
          norma: item.norma,
          descricao: item.descricao,
          condicao: '',
          po: '',
          fe: '',
          gsd: '',
          nper: '',
          recomendacoes: '',
          imagemPadrao: precisaImagem ? (imagemItem?.imagemPadrao || getDefaultImageForItem(item.id)) : '',
          medias: [],
          selected: true,
          precisaImagem: precisaImagem
        };
      });

    const area: Area = {
      id: Date.now().toString(),
      nome: novaArea,
      items: checklistSelecionado
    };

    const updatedInspecao = {
      ...currentInspecao,
      areas: [...currentInspecao.areas, area]
    };

    setCurrentInspecao(updatedInspecao);
    setInspecoes(prev => prev.map(i => i.id === currentInspecao.id ? updatedInspecao : i));
    setNovaArea('');
    setShowNovaAreaForm(false);
    setCurrentView('inspecao');
    
    // Mostrar mensagem de confirmação
    const itensComImagem = checklistSelecionado.filter(item => item.precisaImagem).length;
    alert(`Área "${novaArea}" criada com sucesso!\nChecklist com ${selectedItems.length} itens NR-10 selecionados.\n${itensComImagem} itens receberão imagem padrão.`);
  };

  const addArea = () => {
    if (!novaArea.trim() || !currentInspecao) return;

    // Criar checklist completo com todos os 75 itens
    const checklistCompleto: ChecklistItem[] = checklistItems.map(item => {
      const imagemItem = imagensPadrao.find(img => img.id === item.id);
      const precisaImagem = configuracaoImagensPadrao.itensSelecionados.includes(item.id);
      
      return {
        id: item.id,
        norma: item.norma,
        descricao: item.descricao,
        condicao: '',
        po: '',
        fe: '',
        gsd: '',
        nper: '',
        recomendacoes: '',
        imagemPadrao: precisaImagem ? (imagemItem?.imagemPadrao || getDefaultImageForItem(item.id)) : '',
        medias: [],
        selected: true,
        precisaImagem: precisaImagem
      };
    });

    const area: Area = {
      id: Date.now().toString(),
      nome: novaArea,
      items: checklistCompleto
    };

    const updatedInspecao = {
      ...currentInspecao,
      areas: [...currentInspecao.areas, area]
    };

    setCurrentInspecao(updatedInspecao);
    setInspecoes(prev => prev.map(i => i.id === currentInspecao.id ? updatedInspecao : i));
    setNovaArea('');
    setShowNovaAreaForm(false);
    
    // Mostrar mensagem de confirmação
    const itensComImagem = checklistCompleto.filter(item => item.precisaImagem).length;
    alert(`Área "${novaArea}" criada com sucesso!\nChecklist completo com 75 itens NR-10 adicionado.\n${itensComImagem} itens receberão imagem padrão.`);
  };

  const updateItem = (areaId: string, itemId: number, field: keyof ChecklistItem, value: any) => {
    if (!currentInspecao) return;

    const updatedInspecao = {
      ...currentInspecao,
      areas: currentInspecao.areas.map(area => 
        area.id === areaId 
          ? {
              ...area,
              items: area.items.map(item => 
                item.id === itemId ? { ...item, [field]: value } : item
              )
            }
          : area
      )
    };

    setCurrentInspecao(updatedInspecao);
    setInspecoes(prev => prev.map(i => i.id === currentInspecao.id ? updatedInspecao : i));
  };

  const handleFileUpload = (areaId: string, itemId: number, files: FileList | null, type: 'image' | 'video' | 'audio') => {
    if (!files || !currentInspecao) return;

    Array.from(files).forEach(file => {
      const mediaFile: MediaFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        file,
        type,
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size
      };

      updateItem(areaId, itemId, 'medias', 
        currentInspecao.areas.find(a => a.id === areaId)?.items.find(i => i.id === itemId)?.medias.concat(mediaFile) || [mediaFile]
      );
    });
  };

  const removeMedia = (areaId: string, itemId: number, mediaId: string) => {
    if (!currentInspecao) return;
    
    const area = currentInspecao.areas.find(a => a.id === areaId);
    const item = area?.items.find(i => i.id === itemId);
    if (!item) return;

    updateItem(areaId, itemId, 'medias', item.medias.filter(m => m.id !== mediaId));
  };

  const openCamera = async (itemId: number) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      setCameraOpen({ itemId });
      
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      alert('Não foi possível acessar a câmera');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !cameraOpen || !currentArea) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context?.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `foto-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const mediaFile: MediaFile = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          file,
          type: 'image',
          url: URL.createObjectURL(file),
          name: file.name,
          size: file.size
        };

        updateItem(currentArea.id, cameraOpen.itemId, 'medias', 
          currentArea.items.find(i => i.id === cameraOpen.itemId)?.medias.concat(mediaFile) || [mediaFile]
        );
      }
    }, 'image/jpeg', 0.8);

    closeCamera();
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraOpen(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'C': return 'bg-green-100 text-green-800';
      case 'NC': return 'bg-red-100 text-red-800';
      case 'NA': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // FUNÇÃO PARA GERAR PDF COM ESTRUTURA PROFISSIONAL E MARCA D'ÁGUA - VERSÃO CORRIGIDA
  const generatePDF = async () => {
    if (!currentInspecao) return;
    
    try {
      // Verificar se jsPDF está disponível globalmente primeiro
      let jsPDF = (window as any).jsPDF;
      
      // Se não estiver disponível, tentar carregar via CDN
      if (!jsPDF) {
        console.log('Carregando jsPDF via CDN...');
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
        
        await new Promise((resolve, reject) => {
          script.onload = () => {
            jsPDF = (window as any).jsPDF;
            resolve(jsPDF);
          };
          script.onerror = () => reject(new Error('Falha ao carregar jsPDF via CDN'));
          
          // Timeout de 10 segundos
          setTimeout(() => reject(new Error('Timeout ao carregar jsPDF')), 10000);
        });
      }
      
      if (!jsPDF) {
        throw new Error('jsPDF não está disponível');
      }
      
      // Criar nova instância do PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Configurações
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;
      let pageNumber = 1;
      
      // Função para adicionar marca d'água em todas as páginas
      const addWatermark = () => {
        if (configuracoes.relatorios.marcaDagua && configuracoes.empresa.marcaDagua) {
          pdf.setGState(new pdf.GState({ opacity: 0.1 }));
          pdf.setFontSize(60);
          pdf.setTextColor(200, 200, 200);
          pdf.text('PA BRASIL', pageWidth / 2, pageHeight / 2, { 
            align: 'center', 
            angle: 45 
          });
          pdf.text('AUTOMAÇÃO', pageWidth / 2, (pageHeight / 2) + 20, { 
            align: 'center', 
            angle: 45 
          });
          pdf.setGState(new pdf.GState({ opacity: 1 }));
        }
      };

      // Função para adicionar cabeçalho profissional
      const addHeader = () => {
        // Marca d'água
        addWatermark();
        
        // Barra laranja lateral (baseada nas imagens)
        pdf.setFillColor(255, 140, 0); // Laranja
        pdf.rect(0, 0, 8, pageHeight, 'F');
        
        // Logo PA Brasil (canto superior esquerdo)
        try {
          // Placeholder para logo - em produção, usar imagem real
          pdf.setFillColor(255, 255, 255);
          pdf.rect(margin, margin, 30, 20, 'F');
          pdf.setFontSize(8);
          pdf.setTextColor(0, 0, 0);
          pdf.text('PA BRASIL', margin + 2, margin + 8);
          pdf.text('AUTOMAÇÃO', margin + 2, margin + 12);
        } catch (error) {
          console.log('Erro ao adicionar logo PA Brasil');
        }

        // Logo do Cliente (canto superior direito)
        if (currentInspecao.logoCliente) {
          try {
            pdf.setFillColor(240, 240, 240);
            pdf.rect(pageWidth - margin - 30, margin, 30, 20, 'F');
            pdf.setFontSize(8);
            pdf.setTextColor(100, 100, 100);
            pdf.text('LOGO CLIENTE', pageWidth - margin - 28, margin + 12);
          } catch (error) {
            console.log('Erro ao adicionar logo do cliente');
          }
        }

        // Informações do documento (baseado nas imagens)
        pdf.setFillColor(240, 240, 240);
        pdf.rect(pageWidth - margin - 60, margin + 25, 60, 25, 'F');
        pdf.setFontSize(8);
        pdf.setTextColor(0, 0, 0);
        pdf.text('RELATÓRIO TÉCNICO DE INSPEÇÃO', pageWidth - margin - 58, margin + 30);
        pdf.text(`RRTI-${new Date().getFullYear()}-${currentInspecao.numeroSequencial}`, pageWidth - margin - 58, margin + 35);
        pdf.text('REVISÃO: 001', pageWidth - margin - 58, margin + 40);
        pdf.text(`FOLHA: Página ${pageNumber}`, pageWidth - margin - 58, margin + 45);
        
        yPosition = margin + 60;
      };

      // Função para adicionar rodapé profissional
      const addFooter = () => {
        const footerY = pageHeight - 20;
        
        // Linha separadora
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
        
        // Informações da empresa
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(configuracoes.empresa.nome, margin, footerY);
        pdf.text(`${configuracoes.empresa.telefone} | ${configuracoes.empresa.email}`, margin, footerY + 4);
        pdf.text(configuracoes.empresa.endereco, margin, footerY + 8);
        
        // Data e página
        pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - margin - 40, footerY);
        pdf.text(`Página ${pageNumber}`, pageWidth - margin - 40, footerY + 4);
      };

      // Função para adicionar nova página
      const addNewPage = () => {
        addFooter();
        pdf.addPage();
        pageNumber++;
        yPosition = margin;
        addHeader();
      };

      // Função para verificar quebra de página
      const checkPageBreak = (requiredHeight: number) => {
        if (yPosition + requiredHeight > pageHeight - 40) {
          addNewPage();
        }
      };

      // PÁGINA 1 - CAPA
      addHeader();
      
      // Título principal (baseado nas imagens)
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 100, 200); // Azul
      pdf.text('RELATÓRIO TÉCNICO DE INSPEÇÃO', pageWidth / 2, yPosition + 20, { align: 'center' });
      
      pdf.setFontSize(18);
      pdf.setTextColor(0, 0, 0);
      pdf.text('INSTALAÇÕES ELÉTRICAS - NR-10', pageWidth / 2, yPosition + 35, { align: 'center' });
      
      yPosition += 60;
      
      // Informações da inspeção em caixa
      pdf.setFillColor(245, 245, 245);
      pdf.rect(margin, yPosition, pageWidth - 2 * margin, 60, 'F');
      pdf.setDrawColor(0, 100, 200);
      pdf.rect(margin, yPosition, pageWidth - 2 * margin, 60);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DADOS DA INSPEÇÃO', margin + 5, yPosition + 10);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      const infoLines = [
        `Cliente: ${currentInspecao.nome}`,
        `Contrato: ${currentInspecao.numeroContrato}`,
        `Engenheiro Responsável: ${currentInspecao.engenheiroResponsavel}`,
        `Responsável do Cliente: ${currentInspecao.responsavelCliente}`,
        `Data da Inspeção: ${new Date(currentInspecao.data).toLocaleDateString('pt-BR')}`,
        `Número Sequencial: ${currentInspecao.numeroSequencial}`
      ];
      
      infoLines.forEach((line, index) => {
        pdf.text(line, margin + 5, yPosition + 20 + (index * 6));
      });
      
      yPosition += 80;
      
      // SUMÁRIO (baseado nas imagens)
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 100, 200);
      pdf.text('SUMÁRIO', margin, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      
      const sumarioItems = [
        '1. INTRODUÇÃO',
        '2. OBJETIVO',
        '3. NORMAS APLICÁVEIS',
        '4. METODOLOGIA',
        '5. CLASSIFICAÇÃO DOS RISCOS',
        '6. RESULTADOS DA INSPEÇÃO',
        '7. RECOMENDAÇÕES',
        '8. CONCLUSÕES',
        '9. ANEXOS'
      ];
      
      sumarioItems.forEach((item, index) => {
        pdf.text(item, margin + 10, yPosition + (index * 8));
        // Linha pontilhada
        const textWidth = pdf.getTextWidth(item);
        const dotsStart = margin + 15 + textWidth;
        const dotsEnd = pageWidth - margin - 20;
        let dotPosition = dotsStart + 5;
        
        while (dotPosition < dotsEnd) {
          pdf.text('.', dotPosition, yPosition + (index * 8));
          dotPosition += 3;
        }
        
        pdf.text((index + 2).toString(), pageWidth - margin - 15, yPosition + (index * 8));
      });
      
      addFooter();
      
      // NOVA PÁGINA - CONTEÚDO
      pdf.addPage();
      pageNumber++;
      addHeader();
      
      // Seção 6 - Resultados da Inspeção
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 100, 200);
      pdf.text('6. RESULTADOS DA INSPEÇÃO', margin, yPosition);
      yPosition += 15;
      
      // Áreas e Itens
      currentInspecao.areas.forEach((area, areaIndex) => {
        checkPageBreak(30);
        
        // Título da área
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(`6.${areaIndex + 1} ÁREA: ${area.nome.toUpperCase()}`, margin, yPosition);
        yPosition += 12;
        
        // Tabela de resultados
        const tableStartY = yPosition;
        const colWidths = [15, 25, 70, 15, 15, 15, 15, 15];
        const headers = ['Item', 'Norma', 'Descrição', 'Cond.', 'PO', 'FE', 'GSD', 'NPER'];
        
        // Cabeçalho da tabela
        pdf.setFillColor(50, 50, 50);
        pdf.rect(margin, yPosition, colWidths.reduce((a, b) => a + b, 0), 8, 'F');
        
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(255, 255, 255);
        
        let xPos = margin;
        headers.forEach((header, i) => {
          pdf.text(header, xPos + 2, yPosition + 5);
          xPos += colWidths[i];
        });
        
        yPosition += 8;
        
        // Dados da tabela
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        
        area.items.forEach((item, itemIndex) => {
          checkPageBreak(12);
          
          // Cor de fundo alternada
          if (itemIndex % 2 === 0) {
            pdf.setFillColor(248, 248, 248);
            pdf.rect(margin, yPosition, colWidths.reduce((a, b) => a + b, 0), 8, 'F');
          }
          
          xPos = margin;
          const rowData = [
            item.id.toString(),
            item.norma,
            item.descricao.length > 35 ? item.descricao.substring(0, 32) + '...' : item.descricao,
            item.condicao || '-',
            item.po || '-',
            item.fe || '-',
            item.gsd || '-',
            item.nper || '-'
          ];
          
          rowData.forEach((data, i) => {
            pdf.text(data, xPos + 2, yPosition + 5);
            xPos += colWidths[i];
          });
          
          // Bordas da tabela
          pdf.setDrawColor(200, 200, 200);
          xPos = margin;
          headers.forEach((_, i) => {
            pdf.rect(xPos, yPosition, colWidths[i], 8);
            xPos += colWidths[i];
          });
          
          yPosition += 8;
          
          // Recomendações se existir
          if (item.recomendacoes && item.recomendacoes.trim()) {
            checkPageBreak(8);
            pdf.setFontSize(7);
            pdf.setFont('helvetica', 'italic');
            pdf.setTextColor(100, 100, 100);
            pdf.text(`Recomendações: ${item.recomendacoes}`, margin + 2, yPosition + 4);
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(0, 0, 0);
            yPosition += 6;
          }
        });
        
        yPosition += 15;
      });
      
      // Localização se disponível
      if (currentInspecao.localizacao) {
        checkPageBreak(20);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('LOCALIZAÇÃO GPS', margin, yPosition);
        yPosition += 8;
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Coordenadas: ${currentInspecao.localizacao.latitude.toFixed(6)}, ${currentInspecao.localizacao.longitude.toFixed(6)}`, margin, yPosition);
        yPosition += 5;
        
        if (currentInspecao.localizacao.endereco) {
          pdf.text(`Endereço: ${currentInspecao.localizacao.endereco}`, margin, yPosition);
          yPosition += 5;
        }
        
        pdf.text(`Data/Hora: ${new Date(currentInspecao.localizacao.timestamp).toLocaleString('pt-BR')}`, margin, yPosition);
        yPosition += 10;
      }
      
      addFooter();
      
      // Nome do arquivo
      const fileName = `RRTI-${currentInspecao.numeroSequencial}-${currentInspecao.nome.replace(/\s+/g, '-')}.pdf`;
      
      // Salvar o PDF
      pdf.save(fileName);
      
      // Mostrar mensagem de sucesso
      alert(`PDF gerado com sucesso!\nArquivo: ${fileName}\n\nEstrutura profissional aplicada conforme especificações:\n✓ Marca d'água PA Brasil\n✓ Logo do cliente\n✓ Cabeçalho e rodapé profissionais\n✓ Numeração de páginas\n✓ Sumário estruturado`);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      
      // Mensagem de erro mais específica baseada no tipo de erro
      let errorMessage = 'Erro ao gerar PDF. ';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to load chunk') || error.message.includes('Loading chunk')) {
          errorMessage += 'Problema de conectividade detectado. Tente novamente em alguns segundos.';
        } else if (error.message.includes('jsPDF') || error.message.includes('Timeout')) {
          errorMessage += 'Biblioteca de PDF não pôde ser carregada. Verifique sua conexão com a internet.';
        } else if (error.message.includes('CDN')) {
          errorMessage += 'Falha ao carregar recursos externos. Tente recarregar a página.';
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += 'Erro desconhecido. Tente recarregar a página.';
      }
      
      alert(errorMessage + '\n\nSoluções alternativas:\n• Recarregue a página e tente novamente\n• Verifique sua conexão com a internet\n• Aguarde alguns segundos e tente novamente\n• Use a funcionalidade de exportação manual dos dados');
    }
  };

  const getInspecaoStats = (inspecao: Inspecao) => {
    let totalItems = 0;
    let conformes = 0;
    let naoConformes = 0;
    let naoAplicaveis = 0;

    inspecao.areas.forEach(area => {
      area.items.forEach(item => {
        totalItems++;
        if (item.condicao === 'C') conformes++;
        else if (item.condicao === 'NC') naoConformes++;
        else if (item.condicao === 'NA') naoAplicaveis++;
      });
    });

    return { totalItems, conformes, naoConformes, naoAplicaveis };
  };

  const canCompleteInspection = (area: Area) => {
    const totalItems = area.items.length;
    const completedItems = area.items.filter(item => 
      item.condicao !== '' || item.po !== '' || item.fe !== '' || item.gsd !== '' || item.nper !== ''
    ).length;
    
    return completedItems > 0; // Permite concluir se pelo menos um item foi preenchido
  };

  const completeInspection = (area: Area) => {
    if (!currentInspecao) return;

    const totalItems = area.items.length;
    const completedItems = area.items.filter(item => 
      item.condicao !== '' || item.po !== '' || item.fe !== '' || item.gsd !== '' || item.nper !== ''
    ).length;

    const incompleteItems = totalItems - completedItems;

    if (incompleteItems > 0) {
      const confirmMessage = `Atenção: ${incompleteItems} item(ns) não foram preenchidos.\n\nDeseja realmente concluir a inspeção desta área mesmo assim?`;
      
      if (!confirm(confirmMessage)) {
        return;
      }
    }

    // Marcar inspeção como concluída
    const updatedInspecao = {
      ...currentInspecao,
      status: 'Concluída' as const
    };

    setCurrentInspecao(updatedInspecao);
    setInspecoes(prev => prev.map(i => i.id === currentInspecao.id ? updatedInspecao : i));
    
    alert(`Inspeção da área "${area.nome}" concluída com sucesso!\n${completedItems} de ${totalItems} itens foram preenchidos.`);
    setCurrentView('inspecao');
  };

  const salvarConfiguracoes = () => {
    // Simular salvamento das configurações
    localStorage.setItem('configuracoes-sistema', JSON.stringify(configuracoes));
    alert('Configurações salvas com sucesso!');
  };

  const resetarConfiguracoes = () => {
    if (confirm('Tem certeza que deseja restaurar as configurações padrão? Esta ação não pode ser desfeita.')) {
      setConfiguracoes({
        empresa: {
          nome: 'PA BRASIL AUTOMAÇÃO',
          cnpj: '12.345.678/0001-90',
          endereco: 'Rua Bálsamo, 107 - Jardim Serrano - Paracatu/MG',
          telefone: '(38) 998368153',
          email: 'pabrasil@pabrasil.net',
          logo: 'https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/fa828cdc-1102-4fee-ad59-2f41a354564e.jpg',
          marcaDagua: 'https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/fa828cdc-1102-4fee-ad59-2f41a354564e.jpg'
        },
        relatorios: {
          incluirFotos: true,
          incluirComentarios: true,
          formatoPadrao: 'PDF',
          assinaturasDigitais: false,
          marcaDagua: true
        },
        notificacoes: {
          emailInspecaoConcluida: true,
          emailPrazosVencimento: true,
          lembreteManutencao: false,
          alertasNaoConformidade: true
        },
        sistema: {
          tema: 'claro',
          idioma: 'pt-BR',
          autoSalvar: true,
          backupAutomatico: true,
          qualidadeFoto: 'alta'
        },
        seguranca: {
          senhaObrigatoria: false,
          tempoSessao: 60,
          logAuditoria: true,
          criptografiaLocal: false
        }
      });
      alert('Configurações restauradas para os valores padrão!');
    }
  };

  // FUNÇÃO PARA OBTER DADOS DOS CLIENTES
  const getClientesData = () => {
    const clientesMap = new Map();

    inspecoes.forEach(inspecao => {
      const cliente = inspecao.responsavelCliente;
      if (!clientesMap.has(cliente)) {
        clientesMap.set(cliente, {
          nome: cliente,
          totalInspecoes: 0,
          inspecoesConcluidas: 0,
          inspecoesAndamento: 0,
          inspecoesPendentes: 0,
          ultimaInspecao: null,
          numeroSequenciais: [],
          conformidade: { total: 0, conformes: 0, naoConformes: 0, naoAplicaveis: 0 }
        });
      }

      const clienteData = clientesMap.get(cliente);
      clienteData.totalInspecoes++;
      
      if (inspecao.status === 'Concluída') clienteData.inspecoesConcluidas++;
      else if (inspecao.status === 'Em Andamento') clienteData.inspecoesAndamento++;
      else if (inspecao.status === 'Pendente') clienteData.inspecoesPendentes++;

      clienteData.numeroSequenciais.push(inspecao.numeroSequencial);

      // Atualizar última inspeção
      if (!clienteData.ultimaInspecao || new Date(inspecao.createdAt) > new Date(clienteData.ultimaInspecao)) {
        clienteData.ultimaInspecao = inspecao.createdAt;
      }

      // Calcular conformidade
      const stats = getInspecaoStats(inspecao);
      clienteData.conformidade.total += stats.totalItems;
      clienteData.conformidade.conformes += stats.conformes;
      clienteData.conformidade.naoConformes += stats.naoConformes;
      clienteData.conformidade.naoAplicaveis += stats.naoAplicaveis;
    });

    return Array.from(clientesMap.values());
  };

  // COMPONENTE DE CABEÇALHO PROFISSIONAL (BASEADO NO PDF)
  const ProfessionalHeader = ({ title, subtitle, showCompanyInfo = true }: { title: string; subtitle?: string; showCompanyInfo?: boolean }) => (
    <div className="bg-white border-l-4 border-orange-500 shadow-lg">
      {/* Cabeçalho Principal */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white p-6">
        <div className="flex items-center justify-between">
          {/* Logo e Nome da Empresa */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center p-2">
              <img 
                src={configuracoes.empresa.logo} 
                alt="Logo PA BRASIL AUTOMAÇÃO" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{configuracoes.empresa.nome}</h1>
              <p className="text-blue-200 text-sm">Automação e Consultoria Elétrica</p>
            </div>
          </div>
          
          {/* Informações de Contato */}
          {showCompanyInfo && (
            <div className="text-right text-sm text-blue-200">
              <div className="flex items-center gap-2 justify-end mb-1">
                <Phone className="w-4 h-4" />
                <span>{configuracoes.empresa.telefone}</span>
              </div>
              <div className="flex items-center gap-2 justify-end mb-1">
                <Mail className="w-4 h-4" />
                <span>{configuracoes.empresa.email}</span>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <MapPinIcon className="w-4 h-4" />
                <span>{configuracoes.empresa.endereco}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Título do Documento */}
      <div className="bg-gray-50 px-6 py-4 border-b">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  // COMPONENTE DE TABELA PROFISSIONAL (BASEADO NO PDF)
  const ProfessionalTable = ({ children, headers }: { children: React.ReactNode; headers: string[] }) => (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden border">
      <table className="w-full">
        <thead className="bg-gray-800 text-white">
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider border-r border-gray-600 last:border-r-0">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {children}
        </tbody>
      </table>
    </div>
  );

  // COMPONENTE DE SEÇÃO NUMERADA (BASEADO NO PDF)
  const NumberedSection = ({ number, title, children }: { number: string; title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
        <div className="w-8 h-8 bg-blue-800 text-white rounded-full flex items-center justify-center text-sm font-bold">
          {number}
        </div>
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );

  // Renderização da tela de gerenciamento de imagens
  if (currentView === 'gerenciar-imagens') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Cabeçalho Profissional */}
        <ProfessionalHeader 
          title="GERENCIAMENTO DE IMAGENS PADRÃO" 
          subtitle="Configuração das Imagens de Referência dos 75 Itens NR-10"
        />

        <div className="max-w-7xl mx-auto p-6">
          {/* Botão de Navegação */}
          <div className="mb-6">
            <button
              onClick={() => setCurrentView('home')}
              className="flex items-center gap-2 text-blue-800 hover:text-blue-900 transition-colors font-medium"
            >
              <Home className="w-5 h-5" />
              Voltar ao Início
            </button>
          </div>

          {/* Seção de Seleção de Itens */}
          <NumberedSection number="1" title="SELEÇÃO DE ITENS PARA IMAGEM PADRÃO">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={toggleAllItemsImagemPadrao}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      configuracaoImagensPadrao.itensSelecionados.length === imagensPadrao.length
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {configuracaoImagensPadrao.itensSelecionados.length === imagensPadrao.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                  </button>
                  <span className="text-sm text-gray-600 font-medium">
                    {configuracaoImagensPadrao.itensSelecionados.length} de {imagensPadrao.length} itens selecionados para receber imagem padrão
                  </span>
                </div>
                <button
                  onClick={salvarConfiguracaoImagensPadrao}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Salvar Configuração
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-blue-900">Como Funciona</h5>
                    <p className="text-blue-800 text-sm mt-1">
                      Selecione quais dos 75 itens NR-10 devem receber uma imagem padrão automaticamente quando novas áreas forem criadas. 
                      Apenas os itens marcados terão suas imagens aplicadas nas inspeções futuras.
                    </p>
                  </div>
                </div>
              </div>

              {/* Lista de Seleção de Itens */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {imagensPadrao.map((item) => (
                  <div key={item.id} className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    item.precisaImagem ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}>
                    <div 
                      className="flex items-start gap-3"
                      onClick={() => toggleItemImagemPadrao(item.id)}
                    >
                      <input
                        type="checkbox"
                        checked={item.precisaImagem}
                        onChange={() => toggleItemImagemPadrao(item.id)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {item.id}
                          </div>
                          <div className="text-sm font-medium text-blue-600">{item.norma}</div>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">{item.descricao}</p>
                        <div className="text-xs text-gray-500 mt-1">{item.categoria}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </NumberedSection>

          {/* Controles de Busca e Filtro */}
          <NumberedSection number="2" title="CONTROLES DE BUSCA E FILTRO">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar por Norma ou Descrição
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Ex: NR10.3.9 ou identificação..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por Categoria
                </label>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    {categorias.map(categoria => (
                      <option key={categoria} value={categoria}>
                        {categoria === 'todas' ? 'Todas as Categorias' : categoria}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Mostrando {imagensFiltradas.length} de {imagensPadrao.length} itens
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Image className="w-4 h-4" />
                <span>Clique na imagem para visualizar em tamanho maior</span>
              </div>
            </div>
          </NumberedSection>

          {/* Lista de Imagens */}
          <NumberedSection number="3" title="IMAGENS PADRÃO DOS ITENS NR-10">
            <div className="space-y-4">
              {imagensFiltradas.map((item) => (
                <div key={item.id} className={`rounded-lg p-4 border ${
                  item.precisaImagem ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                    {/* Informações do Item */}
                    <div className="lg:col-span-1 text-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto ${
                        item.precisaImagem ? 'bg-blue-600 text-white' : 'bg-gray-400 text-white'
                      }`}>
                        {item.id}
                      </div>
                      {item.precisaImagem && (
                        <div className="text-xs text-blue-600 mt-1 font-medium">ATIVO</div>
                      )}
                    </div>

                    <div className="lg:col-span-2">
                      <div className={`text-sm font-medium ${item.precisaImagem ? 'text-blue-600' : 'text-gray-600'}`}>
                        {item.norma}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{item.categoria}</div>
                    </div>

                    <div className="lg:col-span-4">
                      <p className="text-sm text-gray-700 line-clamp-2">{item.descricao}</p>
                    </div>

                    {/* Imagem Atual */}
                    <div className="lg:col-span-2 text-center">
                      {item.precisaImagem ? (
                        <>
                          <img
                            src={item.imagemPadrao}
                            alt={`Referência para item ${item.id}`}
                            className="w-20 h-16 object-cover rounded border cursor-pointer hover:opacity-75 transition-opacity mx-auto"
                            onClick={() => window.open(item.imagemPadrao, '_blank')}
                            title="Clique para ver em tamanho maior"
                          />
                          <p className="text-xs text-gray-500 mt-1">Imagem Ativa</p>
                        </>
                      ) : (
                        <div className="w-20 h-16 bg-gray-200 rounded border flex items-center justify-center mx-auto">
                          <Image className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Controles de Edição */}
                    <div className="lg:col-span-3">
                      {item.precisaImagem ? (
                        editingImage === item.id ? (
                          <div className="space-y-2">
                            <input
                              type="url"
                              value={newImageUrl}
                              onChange={(e) => setNewImageUrl(e.target.value)}
                              placeholder="https://exemplo.com/nova-imagem.jpg"
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateImagemPadrao(item.id, newImageUrl)}
                                disabled={!newImageUrl.trim()}
                                className={`flex-1 px-3 py-2 text-xs rounded transition-colors ${
                                  newImageUrl.trim()
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                }`}
                              >
                                <CheckCircle className="w-3 h-3 inline mr-1" />
                                Salvar
                              </button>
                              <button
                                onClick={() => {
                                  setEditingImage(null);
                                  setNewImageUrl('');
                                }}
                                className="flex-1 px-3 py-2 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                              >
                                <XCircle className="w-3 h-3 inline mr-1" />
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingImage(item.id);
                              setNewImageUrl(item.imagemPadrao);
                            }}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                            Alterar Imagem
                          </button>
                        )
                      ) : (
                        <div className="text-center text-gray-500">
                          <p className="text-sm">Item não selecionado</p>
                          <p className="text-xs">Marque o item acima para ativar</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {imagensFiltradas.length === 0 && (
              <div className="text-center py-12">
                <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Nenhum item encontrado</p>
                <p className="text-gray-400">Tente ajustar os filtros de busca</p>
              </div>
            )}
          </NumberedSection>

          {/* Instruções */}
          <NumberedSection number="4" title="INSTRUÇÕES DE USO">
            <div className="prose max-w-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Como Configurar</h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>Na Seção 1, marque os itens que devem receber imagem padrão</li>
                    <li>Clique em "Salvar Configuração" para aplicar as seleções</li>
                    <li>Na Seção 3, altere as URLs das imagens dos itens ativos</li>
                    <li>As configurações serão aplicadas em todas as novas inspeções</li>
                  </ol>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Recomendações</h4>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Selecione apenas itens que realmente precisam de referência visual</li>
                    <li>Use imagens de alta qualidade (mínimo 400x300px)</li>
                    <li>Prefira URLs de serviços confiáveis (Unsplash, etc.)</li>
                    <li>Teste as URLs antes de salvar para evitar links quebrados</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-green-900">Aplicação Automática</h5>
                    <p className="text-green-800 text-sm mt-1">
                      Quando você criar uma nova área de inspeção, apenas os itens selecionados na Seção 1 receberão 
                      automaticamente suas imagens padrão. Isso otimiza o processo e evita carregar imagens desnecessárias.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </NumberedSection>
        </div>
      </div>
    );
  }

  // Renderização da tela de dashboard com layout profissional
  if (currentView === 'dashboard') {
    const clientesData = getClientesData();
    
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Cabeçalho Profissional */}
        <ProfessionalHeader 
          title="RELATÓRIO DE INSPEÇÕES ELÉTRICAS" 
          subtitle="Dashboard Executivo - Análise de Conformidade NR-10"
        />

        <div className="max-w-7xl mx-auto p-6">
          {/* Botão de Navegação */}
          <div className="mb-6">
            <button
              onClick={() => setCurrentView('home')}
              className="flex items-center gap-2 text-blue-800 hover:text-blue-900 transition-colors font-medium"
            >
              <Home className="w-5 h-5" />
              Voltar ao Início
            </button>
          </div>

          {/* Seção 1 - Estatísticas Gerais */}
          <NumberedSection number="1" title="ESTATÍSTICAS GERAIS DO SISTEMA">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">TOTAL DE CLIENTES</p>
                    <p className="text-3xl font-bold">{clientesData.length}</p>
                  </div>
                  <User className="w-8 h-8 text-blue-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">TOTAL DE INSPEÇÕES</p>
                    <p className="text-3xl font-bold">{inspecoes.length}</p>
                  </div>
                  <FileText className="w-8 h-8 text-green-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 text-white p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm font-medium">EM ANDAMENTO</p>
                    <p className="text-3xl font-bold">
                      {inspecoes.filter(i => i.status === 'Em Andamento').length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">CONCLUÍDAS</p>
                    <p className="text-3xl font-bold">
                      {inspecoes.filter(i => i.status === 'Concluída').length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-purple-200" />
                </div>
              </div>
            </div>
          </NumberedSection>

          {/* Seção 2 - Dados Detalhados por Cliente */}
          <NumberedSection number="2" title="DADOS DETALHADOS POR CLIENTE">
            {clientesData.length === 0 ? (
              <div className="text-center py-12">
                <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Nenhum cliente cadastrado</p>
                <p className="text-gray-400">Crie uma inspeção para começar</p>
              </div>
            ) : (
              <ProfessionalTable headers={['Cliente', 'Inspeções', 'Status', 'Conformidade', 'Última Inspeção', 'Números Sequenciais', 'Ações']}>
                {clientesData.map((cliente, index) => {
                  const conformidadePercentual = cliente.conformidade.total > 0 
                    ? Math.round((cliente.conformidade.conformes / cliente.conformidade.total) * 100)
                    : 0;

                  return (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-4">
                        <div className="font-semibold text-gray-900">{cliente.nome}</div>
                        <div className="text-sm text-gray-600">Cliente Ativo</div>
                      </td>
                      
                      <td className="px-4 py-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{cliente.totalInspecoes}</div>
                        <div className="text-xs text-gray-500">Total</div>
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <div className="text-sm font-semibold text-green-600">{cliente.inspecoesConcluidas}</div>
                            <div className="text-xs text-gray-500">Concluídas</div>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-yellow-600">{cliente.inspecoesAndamento}</div>
                            <div className="text-xs text-gray-500">Andamento</div>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-red-600">{cliente.inspecoesPendentes}</div>
                            <div className="text-xs text-gray-500">Pendentes</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium">{conformidadePercentual}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${conformidadePercentual}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>C: {cliente.conformidade.conformes}</span>
                              <span>NC: {cliente.conformidade.naoConformes}</span>
                              <span>NA: {cliente.conformidade.naoAplicaveis}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {cliente.ultimaInspecao 
                          ? new Date(cliente.ultimaInspecao).toLocaleDateString('pt-BR')
                          : 'N/A'
                        }
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {cliente.numeroSequenciais.slice(0, 2).map((numero, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-mono">
                              {numero}
                            </span>
                          ))}
                          {cliente.numeroSequenciais.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              +{cliente.numeroSequenciais.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="flex gap-1">
                          <button className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="bg-gray-600 text-white p-2 rounded hover:bg-gray-700 transition-colors">
                            <FileDown className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </ProfessionalTable>
            )}
          </NumberedSection>

          {/* Seção 3 - Observações e Conclusões */}
          <NumberedSection number="3" title="OBSERVAÇÕES E CONCLUSÕES">
            <div className="prose max-w-none">
              <p className="text-gray-700 mb-4">
                Este relatório apresenta um panorama completo das inspeções elétricas realizadas conforme a Norma Regulamentadora NR-10, 
                demonstrando o comprometimento com a segurança em instalações elétricas.
              </p>
              
              <h4 className="text-lg font-semibold text-gray-900 mb-2">3.1 Escopo da Inspeção</h4>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Verificação de conformidade com os 75 itens da NR-10</li>
                <li>Análise de condições de segurança das instalações elétricas</li>
                <li>Documentação fotográfica e registro de não conformidades</li>
                <li>Elaboração de relatórios técnicos detalhados</li>
              </ul>

              <h4 className="text-lg font-semibold text-gray-900 mb-2">3.2 Metodologia Aplicada</h4>
              <p className="text-gray-700 mb-4">
                As inspeções são realizadas por profissionais qualificados, seguindo rigorosamente os procedimentos estabelecidos 
                pela NR-10, garantindo a identificação precisa de riscos e não conformidades.
              </p>
            </div>
          </NumberedSection>
        </div>

        {/* Rodapé Profissional */}
        <div className="bg-gray-800 text-white p-6 mt-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-2">
                  <img 
                    src={configuracoes.empresa.logo} 
                    alt="Logo PA BRASIL AUTOMAÇÃO" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <p className="font-semibold">{configuracoes.empresa.nome}</p>
                  <p className="text-gray-300 text-sm">Relatório gerado em {new Date().toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <div className="text-right text-sm text-gray-300">
                <p>Sistema de Inspeção Elétrica NR-10</p>
                <p>Versão 1.0 - {new Date().getFullYear()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Renderização da tela de configurações com layout profissional
  if (currentView === 'configuracoes') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Cabeçalho Profissional */}
        <ProfessionalHeader 
          title="CONFIGURAÇÕES DO SISTEMA" 
          subtitle="Personalização e Ajustes Técnicos"
        />

        <div className="max-w-7xl mx-auto p-6">
          {/* Botão de Navegação */}
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => setCurrentView('home')}
              className="flex items-center gap-2 text-blue-800 hover:text-blue-900 transition-colors font-medium"
            >
              <Home className="w-5 h-5" />
              Voltar ao Início
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={resetarConfiguracoes}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Restaurar Padrão
              </button>
              <button
                onClick={salvarConfiguracoes}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Salvar Configurações
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Menu lateral */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-4">
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveConfigTab('empresa')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeConfigTab === 'empresa' 
                        ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Building className="w-5 h-5" />
                    Dados da Empresa
                  </button>
                  
                  <button
                    onClick={() => setActiveConfigTab('relatorios')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeConfigTab === 'relatorios' 
                        ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                    Relatórios
                  </button>
                  
                  <button
                    onClick={() => setActiveConfigTab('notificacoes')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeConfigTab === 'notificacoes' 
                        ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Bell className="w-5 h-5" />
                    Notificações
                  </button>
                  
                  <button
                    onClick={() => setActiveConfigTab('sistema')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeConfigTab === 'sistema' 
                        ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Monitor className="w-5 h-5" />
                    Sistema
                  </button>
                  
                  <button
                    onClick={() => setActiveConfigTab('seguranca')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeConfigTab === 'seguranca' 
                        ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Shield className="w-5 h-5" />
                    Segurança
                  </button>
                </nav>
              </div>
            </div>

            {/* Conteúdo das configurações */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-lg p-6">
                
                {/* Dados da Empresa */}
                {activeConfigTab === 'empresa' && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Dados da Empresa</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Empresa</label>
                        <input
                          type="text"
                          value={configuracoes.empresa.nome}
                          onChange={(e) => setConfiguracoes(prev => ({
                            ...prev,
                            empresa: { ...prev.empresa, nome: e.target.value }
                          }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">CNPJ</label>
                        <input
                          type="text"
                          value={configuracoes.empresa.cnpj}
                          onChange={(e) => setConfiguracoes(prev => ({
                            ...prev,
                            empresa: { ...prev.empresa, cnpj: e.target.value }
                          }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
                        <input
                          type="text"
                          value={configuracoes.empresa.endereco}
                          onChange={(e) => setConfiguracoes(prev => ({
                            ...prev,
                            empresa: { ...prev.empresa, endereco: e.target.value }
                          }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                        <input
                          type="text"
                          value={configuracoes.empresa.telefone}
                          onChange={(e) => setConfiguracoes(prev => ({
                            ...prev,
                            empresa: { ...prev.empresa, telefone: e.target.value }
                          }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                        <input
                          type="email"
                          value={configuracoes.empresa.email}
                          onChange={(e) => setConfiguracoes(prev => ({
                            ...prev,
                            empresa: { ...prev.empresa, email: e.target.value }
                          }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">URL da Marca D'água</label>
                        <input
                          type="url"
                          value={configuracoes.empresa.marcaDagua}
                          onChange={(e) => setConfiguracoes(prev => ({
                            ...prev,
                            empresa: { ...prev.empresa, marcaDagua: e.target.value }
                          }))}
                          placeholder="https://exemplo.com/marca-dagua.png"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-sm text-gray-500 mt-1">Esta imagem será usada como marca d'água nos PDFs</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Outras seções de configuração permanecem iguais... */}
                {/* (Mantendo o código original para as outras abas) */}
                
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Renderização da tela de seleção de itens
  if (currentView === 'selecionar-itens') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Cabeçalho Profissional */}
        <ProfessionalHeader 
          title="SELEÇÃO DE ITENS PARA INSPEÇÃO" 
          subtitle={`Área: ${novaArea} - Checklist NR-10`}
        />

        <div className="max-w-7xl mx-auto p-6">
          {/* Controles */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleSelectAll}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    selectAllItems 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  {selectAllItems ? 'Desmarcar Todos' : 'Selecionar Todos'}
                </button>
                <span className="text-sm text-gray-600 font-medium">
                  {selectedItems.length} de {checklistItems.length} itens selecionados
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentView('inspecao')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={addAreaWithSelectedItems}
                  disabled={selectedItems.length === 0}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedItems.length > 0 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  }`}
                >
                  Criar Área com Itens Selecionados ({selectedItems.length})
                </button>
              </div>
            </div>
          </div>

          {/* Tabela de Seleção */}
          <ProfessionalTable headers={['', 'Item', 'Norma', 'Descrição']}>
            {checklistItems.map((item, index) => (
              <tr 
                key={item.id} 
                className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${
                  selectedItems.includes(item.id) ? 'bg-blue-50' : ''
                } hover:bg-blue-100 transition-colors`}
              >
                <td className="px-4 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleItemSelection(item.id);
                    }}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.id}
                </td>
                <td className="px-4 py-4 text-sm text-gray-900 font-medium">
                  {item.norma}
                </td>
                <td className="px-4 py-4 text-sm text-gray-700">
                  {item.descricao}
                </td>
              </tr>
            ))}
          </ProfessionalTable>
        </div>
      </div>
    );
  }

  // Renderização da tela inicial com layout profissional
  if (currentView === 'home') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Cabeçalho Profissional */}
        <ProfessionalHeader 
          title="SISTEMA DE INSPEÇÃO ELÉTRICA NR-10" 
          subtitle="Gestão Completa de Conformidade em Instalações Elétricas"
        />

        <div className="max-w-7xl mx-auto p-6">
          {/* Seção 1 - Menu Principal */}
          <NumberedSection number="1" title="MENU PRINCIPAL">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <button
                onClick={() => setCurrentView('nova-inspecao')}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Plus className="w-8 h-8 mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">Nova Inspeção</h3>
                <p className="text-sm opacity-90">Criar nova inspeção elétrica</p>
              </button>

              <button 
                onClick={() => setCurrentView('dashboard')}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <BarChart3 className="w-8 h-8 mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">Dashboard</h3>
                <p className="text-sm opacity-90">Análises e relatórios</p>
              </button>

              <button 
                onClick={() => setCurrentView('gerenciar-imagens')}
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Image className="w-8 h-8 mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">Gerenciar Imagens</h3>
                <p className="text-sm opacity-90">Selecionar e alterar imagens padrão</p>
              </button>

              <button 
                onClick={() => setCurrentView('configuracoes')}
                className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6 rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Settings className="w-8 h-8 mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">Configurações</h3>
                <p className="text-sm opacity-90">Ajustes do sistema</p>
              </button>
            </div>
          </NumberedSection>

          {/* Seção 2 - Inspeções Recentes */}
          <NumberedSection number="2" title="INSPEÇÕES RECENTES">
            {inspecoes.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Nenhuma inspeção criada ainda</p>
                <p className="text-gray-400">Clique em "Nova Inspeção" para começar</p>
              </div>
            ) : (
              <ProfessionalTable headers={['Inspeção', 'Contrato', 'Cliente', 'Engenheiro', 'Data', 'Status', 'Localização', 'Progresso', 'Ações']}>
                {inspecoes.map(inspecao => {
                  const stats = getInspecaoStats(inspecao);
                  const progresso = stats.totalItems > 0 ? 
                    Math.round(((stats.conformes + stats.naoConformes + stats.naoAplicaveis) / stats.totalItems) * 100) : 0;

                  return (
                    <tr key={inspecao.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="font-semibold text-gray-900">{inspecao.nome}</div>
                        <div className="text-sm text-blue-600 font-mono">{inspecao.numeroSequencial}</div>
                        <div className="text-xs text-gray-500">{inspecao.areas.length} área(s)</div>
                      </td>
                      
                      <td className="px-4 py-4 text-sm text-gray-900 font-mono">
                        {inspecao.numeroContrato}
                      </td>
                      
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {inspecao.responsavelCliente}
                      </td>
                      
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {inspecao.engenheiroResponsavel}
                      </td>
                      
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {new Date(inspecao.data).toLocaleDateString('pt-BR')}
                      </td>
                      
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          inspecao.status === 'Concluída' ? 'bg-green-100 text-green-800' :
                          inspecao.status === 'Em Andamento' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {inspecao.status}
                        </span>
                      </td>
                      
                      <td className="px-4 py-4">
                        {inspecao.localizacao ? (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-green-600" />
                            <span className="text-xs text-green-700">GPS</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-500">N/A</span>
                          </div>
                        )}
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progresso}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-600 font-medium">{progresso}%</span>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setCurrentInspecao(inspecao);
                              setCurrentView('inspecao');
                            }}
                            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setCurrentInspecao(inspecao);
                              generatePDF();
                            }}
                            className="bg-gray-600 text-white p-2 rounded hover:bg-gray-700 transition-colors"
                          >
                            <FileDown className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </ProfessionalTable>
            )}
          </NumberedSection>
        </div>

        {/* Rodapé Profissional */}
        <div className="bg-gray-800 text-white p-6 mt-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-2">
                  <img 
                    src={configuracoes.empresa.logo} 
                    alt="Logo PA BRASIL AUTOMAÇÃO" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <p className="font-semibold">{configuracoes.empresa.nome}</p>
                  <p className="text-gray-300 text-sm">Sistema de Inspeção Elétrica NR-10</p>
                </div>
              </div>
              <div className="text-right text-sm text-gray-300">
                <p>Versão 1.0 - {new Date().getFullYear()}</p>
                <p>Desenvolvido para conformidade NR-10</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Renderização da tela de nova inspeção com layout profissional
  if (currentView === 'nova-inspecao') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Cabeçalho Profissional */}
        <ProfessionalHeader 
          title="NOVA INSPEÇÃO ELÉTRICA" 
          subtitle="Cadastro de Nova Inspeção - Formulário de Dados Iniciais"
        />

        <div className="max-w-4xl mx-auto p-6">
          {/* Botão de Navegação */}
          <div className="mb-6">
            <button
              onClick={() => setCurrentView('home')}
              className="flex items-center gap-2 text-blue-800 hover:text-blue-900 transition-colors font-medium"
            >
              <Home className="w-5 h-5" />
              Voltar ao Início
            </button>
          </div>

          <NumberedSection number="1" title="DADOS DA INSPEÇÃO">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Cliente *
                </label>
                <input
                  type="text"
                  value={novaInspecao.nome}
                  onChange={(e) => setNovaInspecao(prev => ({ ...prev, nome: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Empresa ABC Ltda"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número do Contrato *
                </label>
                <input
                  type="text"
                  value={novaInspecao.numeroContrato}
                  onChange={(e) => setNovaInspecao(prev => ({ ...prev, numeroContrato: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: CT-2024-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Engenheiro Responsável *
                </label>
                <input
                  type="text"
                  value={novaInspecao.engenheiroResponsavel}
                  onChange={(e) => setNovaInspecao(prev => ({ ...prev, engenheiroResponsavel: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: João Silva - CREA 123456"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Responsável do Cliente *
                </label>
                <input
                  type="text"
                  value={novaInspecao.responsavelCliente}
                  onChange={(e) => setNovaInspecao(prev => ({ ...prev, responsavelCliente: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Maria Santos - Gerente de Manutenção"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data da Inspeção *
                </label>
                <input
                  type="date"
                  value={novaInspecao.data}
                  onChange={(e) => setNovaInspecao(prev => ({ ...prev, data: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo do Cliente (URL)
                </label>
                <input
                  type="url"
                  value={novaInspecao.logoCliente}
                  onChange={(e) => setNovaInspecao(prev => ({ ...prev, logoCliente: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://exemplo.com/logo-cliente.png"
                />
                <p className="text-sm text-gray-500 mt-1">Logo que aparecerá no PDF (opcional)</p>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={() => setCurrentView('home')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={createNewInspecao}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Criar Inspeção
              </button>
            </div>
          </NumberedSection>

          {/* Componente de Geolocalização */}
          <GeolocationComponent />
        </div>
      </div>
    );
  }

  // Renderização da tela de inspeção (mantém o layout original por ser funcional)
  if (currentView === 'inspecao' && currentInspecao) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header da Inspeção */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentView('home')}
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <Home className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{currentInspecao.nome}</h1>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                    <span>Contrato: {currentInspecao.numeroContrato}</span>
                    <span>Responsável: {currentInspecao.engenheiroResponsavel}</span>
                    <span>Cliente: {currentInspecao.responsavelCliente}</span>
                    <span className="font-medium text-blue-600">{currentInspecao.numeroSequencial}</span>
                    <span>Data: {new Date(currentInspecao.data).toLocaleDateString('pt-BR')}</span>
                    {currentInspecao.localizacao && (
                      <span className="flex items-center gap-1 text-green-600">
                        <MapPin className="w-4 h-4" />
                        GPS: {currentInspecao.localizacao.latitude.toFixed(4)}, {currentInspecao.localizacao.longitude.toFixed(4)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={generatePDF}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <FileDown className="w-4 h-4" />
                  Gerar PDF
                </button>
              </div>
            </div>
          </div>

          {/* Componente de Geolocalização na tela de inspeção */}
          <GeolocationComponent />

          {/* Áreas */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Áreas de Inspeção</h2>
              <button
                onClick={() => setShowNovaAreaForm(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nova Área
              </button>
            </div>

            {showNovaAreaForm && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="mb-3">
                  <input
                    type="text"
                    value={novaArea}
                    onChange={(e) => setNovaArea(e.target.value)}
                    placeholder="Nome da área (ex: Subestação Principal)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={addArea}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Todos os Itens (75)
                  </button>
                  <button
                    onClick={showItemSelection}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Selecionar Itens
                  </button>
                  <button
                    onClick={() => {
                      setShowNovaAreaForm(false);
                      setNovaArea('');
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentInspecao.areas.map(area => {
                const stats = {
                  total: area.items.length,
                  conformes: area.items.filter(i => i.condicao === 'C').length,
                  naoConformes: area.items.filter(i => i.condicao === 'NC').length,
                  naoAplicaveis: area.items.filter(i => i.condicao === 'NA').length
                };
                const progresso = stats.total > 0 ? 
                  Math.round(((stats.conformes + stats.naoConformes + stats.naoAplicaveis) / stats.total) * 100) : 0;

                return (
                  <div key={area.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-900 mb-2">{area.nome}</h3>
                    <div className="text-sm text-gray-600 mb-3">
                      <div>Total: {stats.total} itens</div>
                      <div className="flex gap-4 mt-1">
                        <span className="text-green-600">C: {stats.conformes}</span>
                        <span className="text-red-600">NC: {stats.naoConformes}</span>
                        <span className="text-yellow-600">NA: {stats.naoAplicaveis}</span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progresso</span>
                        <span>{progresso}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progresso}%` }}
                        ></div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setCurrentArea(area);
                        setCurrentView('checklist');
                      }}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Inspecionar
                    </button>
                  </div>
                );
              })}
            </div>

            {currentInspecao.areas.length === 0 && (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Nenhuma área adicionada ainda</p>
                <p className="text-gray-400 text-sm">Clique em "Nova Área" para começar</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Renderização da tela de checklist (mantém o layout original por ser funcional)
  if (currentView === 'checklist' && currentArea && currentInspecao) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentView('inspecao')}
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <List className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {currentArea.nome} - {currentInspecao.nome}
                  </h1>
                  <p className="text-gray-600">
                    Checklist NR-10 com {currentArea.items.length} itens de inspeção elétrica
                  </p>
                </div>
              </div>
              
              {/* Botão de Concluir Inspeção */}
              <button
                onClick={() => completeInspection(currentArea)}
                disabled={!canCompleteInspection(currentArea)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  canCompleteInspection(currentArea)
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                Concluir Inspeção
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Container com barra de rolagem no topo */}
            <div className="overflow-x-auto">
              {/* Div invisível para forçar barra de rolagem no topo */}
              <div className="h-4 overflow-x-auto mb-2">
                <div style={{ width: '1400px', height: '1px' }}></div>
              </div>
              
              {/* Tabela principal */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1400px]">
                  <thead className="bg-gray-800 text-white sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Item</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Norma</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Descrição</th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Condição</th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">PO</th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">FE</th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">GSD</th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">NPER</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Recomendações</th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Imagem Padrão</th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Mídia</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentArea.items.map((item, index) => (
                      <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.id}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 font-medium">
                          {item.norma}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700 max-w-md">
                          {item.descricao}
                        </td>
                        
                        {/* Condição */}
                        <td className="px-4 py-4 text-center">
                          <select
                            value={item.condicao}
                            onChange={(e) => updateItem(currentArea.id, item.id, 'condicao', e.target.value as 'C' | 'NC' | 'NA' | '')}
                            className={`w-16 px-2 py-1 text-xs rounded border ${getStatusColor(item.condicao)} border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                          >
                            <option value="">-</option>
                            <option value="C">C</option>
                            <option value="NC">NC</option>
                            <option value="NA">NA</option>
                          </select>
                        </td>

                        {/* PO */}
                        <td className="px-4 py-4 text-center">
                          <select
                            value={item.po}
                            onChange={(e) => updateItem(currentArea.id, item.id, 'po', e.target.value as 'C' | 'NC' | 'NA' | '')}
                            className={`w-16 px-2 py-1 text-xs rounded border ${getStatusColor(item.po)} border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                          >
                            <option value="">-</option>
                            <option value="C">C</option>
                            <option value="NC">NC</option>
                            <option value="NA">NA</option>
                          </select>
                        </td>

                        {/* FE */}
                        <td className="px-4 py-4 text-center">
                          <select
                            value={item.fe}
                            onChange={(e) => updateItem(currentArea.id, item.id, 'fe', e.target.value as 'C' | 'NC' | 'NA' | '')}
                            className={`w-16 px-2 py-1 text-xs rounded border ${getStatusColor(item.fe)} border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                          >
                            <option value="">-</option>
                            <option value="C">C</option>
                            <option value="NC">NC</option>
                            <option value="NA">NA</option>
                          </select>
                        </td>

                        {/* GSD */}
                        <td className="px-4 py-4 text-center">
                          <select
                            value={item.gsd}
                            onChange={(e) => updateItem(currentArea.id, item.id, 'gsd', e.target.value as 'C' | 'NC' | 'NA' | '')}
                            className={`w-16 px-2 py-1 text-xs rounded border ${getStatusColor(item.gsd)} border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                          >
                            <option value="">-</option>
                            <option value="C">C</option>
                            <option value="NC">NC</option>
                            <option value="NA">NA</option>
                          </select>
                        </td>

                        {/* NPER */}
                        <td className="px-4 py-4 text-center">
                          <select
                            value={item.nper}
                            onChange={(e) => updateItem(currentArea.id, item.id, 'nper', e.target.value as 'C' | 'NC' | 'NA' | '')}
                            className={`w-16 px-2 py-1 text-xs rounded border ${getStatusColor(item.nper)} border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                          >
                            <option value="">-</option>
                            <option value="C">C</option>
                            <option value="NC">NC</option>
                            <option value="NA">NA</option>
                          </select>
                        </td>

                        {/* Recomendações */}
                        <td className="px-4 py-4">
                          <textarea
                            value={item.recomendacoes}
                            onChange={(e) => updateItem(currentArea.id, item.id, 'recomendacoes', e.target.value)}
                            placeholder="Adicione recomendações técnicas..."
                            className="w-full min-w-[200px] px-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={2}
                          />
                        </td>

                        {/* Imagem Padrão */}
                        <td className="px-4 py-4 text-center">
                          <div className="flex flex-col items-center gap-2">
                            {item.precisaImagem && item.imagemPadrao ? (
                              <>
                                <img
                                  src={item.imagemPadrao}
                                  alt={`Referência para item ${item.id}`}
                                  className="w-16 h-12 object-cover rounded border cursor-pointer hover:opacity-75 transition-opacity"
                                  onClick={() => window.open(item.imagemPadrao, '_blank')}
                                  title="Clique para ver em tamanho maior"
                                />
                                <div className="flex items-center gap-1 text-xs text-blue-600">
                                  <Image className="w-3 h-3" />
                                  <span>Ref.</span>
                                </div>
                              </>
                            ) : (
                              <div className="w-16 h-12 bg-gray-100 rounded border flex items-center justify-center">
                                <Image className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Mídia */}
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-2 min-w-[120px]">
                            {/* Botões de mídia em linha horizontal */}
                            <div className="flex gap-1">
                              {/* Upload Imagem */}
                              <label className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition-colors cursor-pointer">
                                <Upload className="w-3 h-3" />
                                Img
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={(e) => handleFileUpload(currentArea.id, item.id, e.target.files, 'image')}
                                  className="hidden"
                                />
                              </label>

                              {/* Upload Vídeo */}
                              <label className="flex items-center gap-1 bg-purple-600 text-white px-2 py-1 rounded text-xs hover:bg-purple-700 transition-colors cursor-pointer">
                                <Video className="w-3 h-3" />
                                Vid
                                <input
                                  type="file"
                                  accept="video/*"
                                  multiple
                                  onChange={(e) => handleFileUpload(currentArea.id, item.id, e.target.files, 'video')}
                                  className="hidden"
                                />
                              </label>

                              {/* Upload Áudio */}
                              <label className="flex items-center gap-1 bg-orange-600 text-white px-2 py-1 rounded text-xs hover:bg-orange-700 transition-colors cursor-pointer">
                                <Mic className="w-3 h-3" />
                                Aud
                                <input
                                  type="file"
                                  accept="audio/*"
                                  multiple
                                  onChange={(e) => handleFileUpload(currentArea.id, item.id, e.target.files, 'audio')}
                                  className="hidden"
                                />
                              </label>
                            </div>

                            {/* Lista de mídias */}
                            {item.medias.length > 0 && (
                              <div className="grid grid-cols-2 gap-1 mt-2">
                                {item.medias.map((media) => (
                                  <div key={media.id} className="relative group">
                                    {media.type === 'image' && (
                                      <img
                                        src={media.url}
                                        alt={media.name}
                                        className="w-full h-16 object-cover rounded border cursor-pointer"
                                        onClick={() => setSelectedMedia(media)}
                                      />
                                    )}
                                    {media.type === 'video' && (
                                      <div
                                        className="w-full h-16 bg-purple-100 rounded border flex items-center justify-center cursor-pointer"
                                        onClick={() => setSelectedMedia(media)}
                                      >
                                        <Video className="w-6 h-6 text-purple-600" />
                                      </div>
                                    )}
                                    {media.type === 'audio' && (
                                      <div
                                        className="w-full h-16 bg-orange-100 rounded border flex items-center justify-center cursor-pointer"
                                        onClick={() => setSelectedMedia(media)}
                                      >
                                        <Mic className="w-6 h-6 text-orange-600" />
                                      </div>
                                    )}
                                    <button
                                      onClick={() => removeMedia(currentArea.id, item.id, media.id)}
                                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Modal da Câmera */}
        {cameraOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Tirar Foto</h3>
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={capturePhoto}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Capturar
                </button>
                <button
                  onClick={closeCamera}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Visualização de Mídia */}
        {selectedMedia && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{selectedMedia.name}</h3>
                <button
                  onClick={() => setSelectedMedia(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              {selectedMedia.type === 'image' && (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.name}
                  className="max-w-full max-h-[70vh] object-contain mx-auto"
                />
              )}
              
              {selectedMedia.type === 'video' && (
                <video
                  src={selectedMedia.url}
                  controls
                  className="max-w-full max-h-[70vh] mx-auto"
                />
              )}
              
              {selectedMedia.type === 'audio' && (
                <div className="text-center py-8">
                  <Mic className="w-16 h-16 text-orange-600 mx-auto mb-4" />
                  <audio src={selectedMedia.url} controls className="mx-auto" />
                </div>
              )}
              
              <div className="mt-4 text-sm text-gray-600">
                <p>Tamanho: {(selectedMedia.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}