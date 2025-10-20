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
  po: string;
  fe: string;
  gsd: string;
  nper: string;
  recomendacoes: string;
  imagemPadrao: string;
  medias: MediaFile[];
  selected: boolean;
  precisaImagem: boolean;
  hrn?: number;
}

interface PainelEletricoItem {
  id: number;
  norma: string;
  descricao: string;
  condicao: 'C' | 'NC' | 'NA' | '';
  observacao: string;
  recomendacao: string;
  medias: MediaFile[];
  selected: boolean;
}

interface Area {
  id: string;
  nome: string;
  items: ChecklistItem[];
  painelItems?: PainelEletricoItem[];
  tipoChecklist: 'subestacoes' | 'paineis';
  hrnTotal?: number;
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
  logoCliente?: string;
  hrnTotalCliente?: number;
}

interface ConfiguracaoSistema {
  empresa: {
    nome: string;
    cnpj: string;
    endereco: string;
    telefone: string;
    email: string;
    logo: string;
    marcaDagua: string;
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

interface ImagemPadraoItem {
  id: number;
  norma: string;
  descricao: string;
  imagemPadrao: string;
  categoria: string;
  precisaImagem: boolean;
}

interface ConfiguracaoImagensPadrao {
  itensSelecionados: number[];
}

// CONSTANTES PARA OS VALORES NUMÉRICOS COM DESCRIÇÕES
const PO_OPTIONS = [
  { value: '', label: 'Selecione...' },
  { value: '0.033', label: '0,033 - Quase Impossível' },
  { value: '1', label: '1 - Altamente Improvável' },
  { value: '1.5', label: '1,5 - Improvável' },
  { value: '2', label: '2 - Possível' },
  { value: '5', label: '5 - Alguma Chance' },
  { value: '8', label: '8 - Provável' },
  { value: '10', label: '10 - Muito Provável' },
  { value: '15', label: '15 - Certeza' }
];

const FE_OPTIONS = [
  { value: '', label: 'Selecione...' },
  { value: '0.5', label: '0,5 - Anualmente' },
  { value: '1', label: '1 - Mensalmente' },
  { value: '1.5', label: '1,5 - Semanalmente' },
  { value: '2.5', label: '2,5 - Possível' },
  { value: '4', label: '4 - Em Tempo de Hora' },
  { value: '5', label: '5 - Constantemente' }
];

const GSD_OPTIONS = [
  { value: '', label: 'Selecione...' },
  { value: '0.1', label: '0,1 - Escoriação' },
  { value: '0.5', label: '0,5 - Dilaceração/Corte/Enfer. Leve' },
  { value: '1', label: '1 - Fratura Leve Ossos/Mão/Braço/Perna' },
  { value: '2', label: '2 - Fratura Grave Ossos/Mão/Braço/Perna' },
  { value: '4', label: '4 - Perda de 1 ou 2 Dedos das Mãos/Pés' },
  { value: '8', label: '8 - Amputação da Perna/Mão Perda Parcial Visão/Audição' },
  { value: '10', label: '10 - Amputação de 2 Pernas/Mãos Perda Parcial Visão/Audição' },
  { value: '12', label: '12 - Enfermidade Permanente ou Crítica' },
  { value: '15', label: '15 - Fatalidade' }
];

const NPER_OPTIONS = [
  { value: '', label: 'Selecione...' },
  { value: '1', label: '1 - 1-2 Pessoas' },
  { value: '2', label: '2 - 3-7 Pessoas' },
  { value: '4', label: '4 - 8-15 Pessoas' },
  { value: '8', label: '8 - 16-50 Pessoas' },
  { value: '12', label: '12 - Mais de 50 Pessoas' }
];

// FUNÇÃO PARA CALCULAR HRN
const calcularHRN = (po: string, fe: string, gsd: string, nper: string): number => {
  const poValue = parseFloat(po) || 0;
  const feValue = parseFloat(fe) || 0;
  const gsdValue = parseFloat(gsd) || 0;
  const nperValue = parseFloat(nper) || 0;
  
  return poValue * feValue * gsdValue * nperValue;
};

// FUNÇÃO PARA OBTER COR DO HRN
const getHRNColor = (hrn: number): { bg: string; text: string; label: string } => {
  if (hrn >= 0 && hrn <= 1) return { bg: 'bg-green-100', text: 'text-green-800', label: 'Aceitável' };
  if (hrn > 1 && hrn <= 5) return { bg: 'bg-green-200', text: 'text-green-900', label: 'Muito Baixo' };
  if (hrn > 5 && hrn <= 10) return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Baixo' };
  if (hrn > 10 && hrn <= 50) return { bg: 'bg-yellow-200', text: 'text-yellow-900', label: 'Significante' };
  if (hrn > 50 && hrn <= 100) return { bg: 'bg-red-100', text: 'text-red-800', label: 'Alto' };
  if (hrn > 100 && hrn <= 500) return { bg: 'bg-red-200', text: 'text-red-900', label: 'Muito Alto' };
  if (hrn > 500 && hrn <= 1000) return { bg: 'bg-red-300', text: 'text-red-900', label: 'Extremo' };
  if (hrn > 1000) return { bg: 'bg-red-400', text: 'text-red-900', label: 'Inaceitável' };
  return { bg: 'bg-gray-100', text: 'text-gray-800', label: 'N/A' };
};

const checklistItems: Omit<ChecklistItem, 'condicao' | 'po' | 'fe' | 'gsd' | 'nper' | 'recomendacoes' | 'imagemPadrao' | 'medias' | 'selected' | 'precisaImagem' | 'hrn'>[] = [
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

const painelEletricoItems: Omit<PainelEletricoItem, 'condicao' | 'observacao' | 'recomendacao' | 'medias' | 'selected'>[] = [
  { id: 1, norma: "NBR 5410", descricao: "O painel está identificado: Possui TAG, Etiqueta com nível de tensão, Advertência quanto aos riscos elétricos." },
  { id: 2, norma: "NBR 5410", descricao: "O painel possui chave para bloqueio elétrico?" },
  { id: 3, norma: "NR-10", descricao: "Existe sinalização restringindo o acesso a pessoas não autorizados?" },
  { id: 4, norma: "NBR 5410", descricao: "O painel esta protegido contra entrada de animais?" },
  { id: 5, norma: "NBR 5410", descricao: "O painel possui diagrama elétrico?" },
  { id: 6, norma: "NBR 5410", descricao: "O painel possui botoeira de emergência?" },
  { id: 7, norma: "NBR 5410", descricao: "O painel possui proteção contra intempéries (chuva, sol)?" },
  { id: 8, norma: "NR-10", descricao: "O painel está trancado, impedindo acesso a pessoas não autorizados?" },
  { id: 9, norma: "NBR 5410", descricao: "O painel possui disjuntor DR?" },
  { id: 10, norma: "NBR 5410", descricao: "O painel está limpo e a fiação organizada nas canaletas?" },
  { id: 11, norma: "NBR 5410", descricao: "O painel possui iluminação?" },
  { id: 12, norma: "NBR 5410", descricao: "O painel está livre de qualquer objeto no seu interior?" },
  { id: 13, norma: "NBR 5410", descricao: "As partes vivas estão protegidas contra contato acidental?" },
  { id: 14, norma: "NBR 5410", descricao: "Os cabos, disjuntores e chaves estão identificados?" },
  { id: 15, norma: "NBR 5410", descricao: "No painel existe identificação dos circuitos?" },
  { id: 16, norma: "NBR 5410", descricao: "O painel e porta possuem aterramento?" },
  { id: 17, norma: "NR-17", descricao: "O painel está a uma altura ergonômica?" },
  { id: 18, norma: "NR-10", descricao: "O acesso ao painel está livre de obstáculos?" },
  { id: 19, norma: "NBR 5410", descricao: "As cores dos cabos estão dentro do padrão?" },
  { id: 20, norma: "NBR 5410", descricao: "As tomadas externas estão identificadas?" }
];

export default function InspecaoEletrica() {
  const [currentView, setCurrentView] = useState<'home' | 'nova-inspecao' | 'inspecao' | 'checklist' | 'selecionar-itens' | 'configuracoes' | 'dashboard' | 'gerenciar-imagens' | 'selecionar-tipo-checklist'>('home');
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
    logoCliente: ''
  });

  // Estados para nova área
  const [novaArea, setNovaArea] = useState('');
  const [showNovaAreaForm, setShowNovaAreaForm] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectAllItems, setSelectAllItems] = useState(true);
  const [tipoChecklistSelecionado, setTipoChecklistSelecionado] = useState<'subestacoes' | 'paineis'>('subestacoes');

  // Estados para gerenciamento de imagens padrão
  const [imagensPadrao, setImagensPadrao] = useState<ImagemPadraoItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [editingImage, setEditingImage] = useState<number | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Estados para configuração de imagens padrão
  const [configuracaoImagensPadrao, setConfiguracaoImagensPadrao] = useState<ConfiguracaoImagensPadrao>({
    itensSelecionados: []
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

  const [activeConfigTab, setActiveConfigTab] = useState<'empresa' | 'relatorios' | 'notificacoes' | 'sistema' | 'seguranca'>('empresa');

  // Inicializar imagens padrão com categorias
  useEffect(() => {
    const imagensIniciais: ImagemPadraoItem[] = checklistItems.map(item => ({
      id: item.id,
      norma: item.norma,
      descricao: item.descricao,
      imagemPadrao: getDefaultImageForItem(item.id),
      categoria: getCategoryForItem(item.norma),
      precisaImagem: false
    }));
    setImagensPadrao(imagensIniciais);
  }, []);

  // Função para obter imagem padrão baseada no tipo de item
  const getDefaultImageForItem = (itemId: number): string => {
    const imageMap: { [key: number]: string } = {
      1: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop&q=80',
      2: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&q=80',
      3: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop&q=80',
      4: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop&q=80',
      5: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop&q=80',
      6: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop&q=80',
      7: 'https://images.unsplash.com/photo-1621905252472-e8592afb8f2f?w=400&h=300&fit=crop&q=80',
      8: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop&q=80',
      9: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop&q=80',
      10: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&q=80',
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

  // FUNÇÃO PARA GERAR NÚMERO SEQUENCIAL
  const generateSequentialNumber = (responsavelCliente: string): string => {
    const currentYear = new Date().getFullYear();
    
    const clienteInspecoes = inspecoes.filter(inspecao => {
      const inspecaoYear = new Date(inspecao.createdAt).getFullYear();
      return inspecao.responsavelCliente === responsavelCliente && inspecaoYear === currentYear;
    });
    
    const nextNumber = clienteInspecoes.length + 1;
    const sequentialNumber = nextNumber.toString().padStart(4, '0');
    
    return `PA-${currentYear}-${sequentialNumber}`;
  };

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

      setLocalizacao(novaLocalizacao);
      
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

  const createNewInspecao = () => {
    if (!novaInspecao.nome || !novaInspecao.numeroContrato || !novaInspecao.engenheiroResponsavel || !novaInspecao.responsavelCliente) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

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
    
    setNovaInspecao({
      nome: '',
      numeroContrato: '',
      engenheiroResponsavel: '',
      responsavelCliente: '',
      data: new Date().toISOString().split('T')[0],
      logoCliente: ''
    });

    alert(`Inspeção criada com sucesso!\nNúmero sequencial: ${numeroSequencial}${localizacao ? '\nLocalização capturada e anexada!' : ''}`);
  };

  const showItemSelection = () => {
    setCurrentView('selecionar-tipo-checklist');
  };

  const showItemSelectionForType = (tipo: 'subestacoes' | 'paineis') => {
    setTipoChecklistSelecionado(tipo);
    if (tipo === 'subestacoes') {
      setSelectedItems(checklistItems.map(item => item.id));
    } else {
      setSelectedItems(painelEletricoItems.map(item => item.id));
    }
    setSelectAllItems(true);
    setCurrentView('selecionar-itens');
  };

  const toggleSelectAll = () => {
    const itemsToSelect = tipoChecklistSelecionado === 'subestacoes' ? checklistItems : painelEletricoItems;
    
    if (selectAllItems) {
      setSelectedItems([]);
      setSelectAllItems(false);
    } else {
      setSelectedItems(itemsToSelect.map(item => item.id));
      setSelectAllItems(true);
    }
  };

  const toggleItemSelection = (itemId: number) => {
    const itemsToSelect = tipoChecklistSelecionado === 'subestacoes' ? checklistItems : painelEletricoItems;
    
    setSelectedItems(prev => {
      const newSelection = prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId];
      
      setSelectAllItems(newSelection.length === itemsToSelect.length);
      return newSelection;
    });
  };

  const addAreaWithSelectedItems = () => {
    if (!novaArea.trim()) {
      alert('Preencha o nome da área antes de continuar');
      return;
    }

    if (!currentInspecao) {
      alert('Erro: Nenhuma inspeção selecionada');
      return;
    }

    if (selectedItems.length === 0) {
      alert('Selecione pelo menos um item para inspeção');
      return;
    }

    if (tipoChecklistSelecionado === 'subestacoes') {
      const checklistSelecionado: ChecklistItem[] = checklistItems
        .filter(item => selectedItems.includes(item.id))
        .map(item => {
          const imagemItem = imagensPadrao.find(img => img.id === item.id);
          const precisaImagem = configuracaoImagensPadrao.itensSelecionados.includes(item.id);
          
          return {
            id: item.id,
            norma: item.norma,
            descricao: item.descricao,
            condicao: '' as const,
            po: '',
            fe: '',
            gsd: '',
            nper: '',
            recomendacoes: '',
            imagemPadrao: precisaImagem ? (imagemItem?.imagemPadrao || getDefaultImageForItem(item.id)) : '',
            medias: [],
            selected: true,
            precisaImagem: precisaImagem,
            hrn: 0
          };
        });

      const area: Area = {
        id: Date.now().toString(),
        nome: novaArea,
        items: checklistSelecionado,
        tipoChecklist: 'subestacoes',
        hrnTotal: 0
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
      
      const itensComImagem = checklistSelecionado.filter(item => item.precisaImagem).length;
      alert(`Área "${novaArea}" criada com sucesso!\nCheck List para Subestações com ${selectedItems.length} itens NR-10 selecionados.\n${itensComImagem} itens receberão imagem padrão.`);
    } else {
      const painelSelecionado: PainelEletricoItem[] = painelEletricoItems
        .filter(item => selectedItems.includes(item.id))
        .map(item => ({
          id: item.id,
          norma: item.norma,
          descricao: item.descricao,
          condicao: '' as const,
          observacao: '',
          recomendacao: '',
          medias: [],
          selected: true
        }));

      const area: Area = {
        id: Date.now().toString(),
        nome: novaArea,
        items: [],
        painelItems: painelSelecionado,
        tipoChecklist: 'paineis'
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
      
      alert(`Área "${novaArea}" criada com sucesso!\nChecklist para Quadros Elétricos com ${selectedItems.length} itens selecionados.`);
    }
  };

  const addArea = () => {
    if (!novaArea.trim() || !currentInspecao) return;

    const checklistCompleto: ChecklistItem[] = checklistItems.map(item => {
      const imagemItem = imagensPadrao.find(img => img.id === item.id);
      const precisaImagem = configuracaoImagensPadrao.itensSelecionados.includes(item.id);
      
      return {
        id: item.id,
        norma: item.norma,
        descricao: item.descricao,
        condicao: '' as const,
        po: '',
        fe: '',
        gsd: '',
        nper: '',
        recomendacoes: '',
        imagemPadrao: precisaImagem ? (imagemItem?.imagemPadrao || getDefaultImageForItem(item.id)) : '',
        medias: [],
        selected: true,
        precisaImagem: precisaImagem,
        hrn: 0
      };
    });

    const area: Area = {
      id: Date.now().toString(),
      nome: novaArea,
      items: checklistCompleto,
      tipoChecklist: 'subestacoes',
      hrnTotal: 0
    };

    const updatedInspecao = {
      ...currentInspecao,
      areas: [...currentInspecao.areas, area]
    };

    setCurrentInspecao(updatedInspecao);
    setInspecoes(prev => prev.map(i => i.id === currentInspecao.id ? updatedInspecao : i));
    setNovaArea('');
    setShowNovaAreaForm(false);
    
    const itensComImagem = checklistCompleto.filter(item => item.precisaImagem).length;
    alert(`Área "${novaArea}" criada com sucesso!\nCheck List para Subestações completo com 75 itens NR-10 adicionado.\n${itensComImagem} itens receberão imagem padrão.`);
  };

  // FUNÇÃO ATUALIZADA PARA CALCULAR HRN AUTOMATICAMENTE
  const updateItem = (areaId: string, itemId: number, field: keyof ChecklistItem, value: any) => {
    if (!currentInspecao) return;

    const updatedInspecao = {
      ...currentInspecao,
      areas: currentInspecao.areas.map(area => 
        area.id === areaId 
          ? {
              ...area,
              items: area.items.map(item => {
                if (item.id === itemId) {
                  const updatedItem = { ...item, [field]: value };
                  
                  // Calcular HRN se a condição for NC e todos os campos estiverem preenchidos
                  if (updatedItem.condicao === 'NC' && updatedItem.po && updatedItem.fe && updatedItem.gsd && updatedItem.nper) {
                    updatedItem.hrn = calcularHRN(updatedItem.po, updatedItem.fe, updatedItem.gsd, updatedItem.nper);
                  } else {
                    updatedItem.hrn = 0;
                  }
                  
                  return updatedItem;
                } else {
                  return item;
                }
              })
            }
          : area
      )
    };

    // Recalcular HRN total da área
    const areaAtualizada = updatedInspecao.areas.find(a => a.id === areaId);
    if (areaAtualizada) {
      areaAtualizada.hrnTotal = areaAtualizada.items.reduce((total, item) => total + (item.hrn || 0), 0);
    }

    // Recalcular HRN total do cliente
    updatedInspecao.hrnTotalCliente = updatedInspecao.areas.reduce((total, area) => total + (area.hrnTotal || 0), 0);

    setCurrentInspecao(updatedInspecao);
    setInspecoes(prev => prev.map(i => i.id === currentInspecao.id ? updatedInspecao : i));
  };

  const updatePainelItem = (areaId: string, itemId: number, field: keyof PainelEletricoItem, value: any) => {
    if (!currentInspecao) return;

    const updatedInspecao = {
      ...currentInspecao,
      areas: currentInspecao.areas.map(area => 
        area.id === areaId 
          ? {
              ...area,
              painelItems: area.painelItems?.map(item => 
                item.id === itemId ? { ...item, [field]: value } : item
              )
            }
          : area
      )
    };

    setCurrentInspecao(updatedInspecao);
    setInspecoes(prev => prev.map(i => i.id === currentInspecao.id ? updatedInspecao : i));
  };

  const handleFileUpload = (areaId: string, itemId: number, files: FileList | null, type: 'image' | 'video' | 'audio', isPainel: boolean = false) => {
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

      if (isPainel) {
        updatePainelItem(areaId, itemId, 'medias', 
          currentInspecao.areas.find(a => a.id === areaId)?.painelItems?.find(i => i.id === itemId)?.medias.concat(mediaFile) || [mediaFile]
        );
      } else {
        updateItem(areaId, itemId, 'medias', 
          currentInspecao.areas.find(a => a.id === areaId)?.items.find(i => i.id === itemId)?.medias.concat(mediaFile) || [mediaFile]
        );
      }
    });
  };

  const removeMedia = (areaId: string, itemId: number, mediaId: string, isPainel: boolean = false) => {
    if (!currentInspecao) return;
    
    const area = currentInspecao.areas.find(a => a.id === areaId);
    
    if (isPainel) {
      const item = area?.painelItems?.find(i => i.id === itemId);
      if (!item) return;
      updatePainelItem(areaId, itemId, 'medias', item.medias.filter(m => m.id !== mediaId));
    } else {
      const item = area?.items.find(i => i.id === itemId);
      if (!item) return;
      updateItem(areaId, itemId, 'medias', item.medias.filter(m => m.id !== mediaId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'C': return 'bg-green-100 text-green-800';
      case 'NC': return 'bg-red-100 text-red-800';
      case 'NA': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInspecaoStats = (inspecao: Inspecao) => {
    let totalItems = 0;
    let conformes = 0;
    let naoConformes = 0;
    let naoAplicaveis = 0;

    inspecao.areas.forEach(area => {
      if (area.tipoChecklist === 'paineis' && area.painelItems) {
        area.painelItems.forEach(item => {
          totalItems++;
          if (item.condicao === 'C') conformes++;
          else if (item.condicao === 'NC') naoConformes++;
          else if (item.condicao === 'NA') naoAplicaveis++;
        });
      } else {
        area.items.forEach(item => {
          totalItems++;
          if (item.condicao === 'C') conformes++;
          else if (item.condicao === 'NC') naoConformes++;
          else if (item.condicao === 'NA') naoAplicaveis++;
        });
      }
    });

    return { totalItems, conformes, naoConformes, naoAplicaveis };
  };

  const canCompleteInspection = (area: Area) => {
    if (area.tipoChecklist === 'paineis' && area.painelItems) {
      const completedItems = area.painelItems.filter(item => 
        item.condicao !== '' || item.observacao !== '' || item.recomendacao !== ''
      ).length;
      return completedItems > 0;
    } else {
      const completedItems = area.items.filter(item => 
        item.condicao !== '' || item.po !== '' || item.fe !== '' || item.gsd !== '' || item.nper !== ''
      ).length;
      return completedItems > 0;
    }
  };

  const completeInspection = (area: Area) => {
    if (!currentInspecao) return;

    let totalItems = 0;
    let completedItems = 0;

    if (area.tipoChecklist === 'paineis' && area.painelItems) {
      totalItems = area.painelItems.length;
      completedItems = area.painelItems.filter(item => 
        item.condicao !== '' || item.observacao !== '' || item.recomendacao !== ''
      ).length;
    } else {
      totalItems = area.items.length;
      completedItems = area.items.filter(item => 
        item.condicao !== '' || item.po !== '' || item.fe !== '' || item.gsd !== '' || item.nper !== ''
      ).length;
    }

    const incompleteItems = totalItems - completedItems;

    if (incompleteItems > 0) {
      const confirmMessage = `Atenção: ${incompleteItems} item(ns) não foram preenchidos.\n\nDeseja realmente concluir a inspeção desta área mesmo assim?`;
      
      if (!confirm(confirmMessage)) {
        return;
      }
    }

    const updatedInspecao = {
      ...currentInspecao,
      status: 'Concluída' as const
    };

    setCurrentInspecao(updatedInspecao);
    setInspecoes(prev => prev.map(i => i.id === currentInspecao.id ? updatedInspecao : i));
    
    const tipoArea = area.tipoChecklist === 'paineis' ? 'Quadros Elétricos' : 'Subestações';
    alert(`Inspeção da área "${area.nome}" (${tipoArea}) concluída com sucesso!\n${completedItems} de ${totalItems} itens foram preenchidos.`);
    setCurrentView('inspecao');
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

  // COMPONENTE DE CABEÇALHO PROFISSIONAL
  const ProfessionalHeader = ({ title, subtitle, showCompanyInfo = true }: { title: string; subtitle?: string; showCompanyInfo?: boolean }) => (
    <div className="bg-white border-l-4 border-orange-500 shadow-lg">
      <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white p-6">
        <div className="flex items-center justify-between">
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
      
      <div className="bg-gray-50 px-6 py-4 border-b">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  // COMPONENTE DE SEÇÃO NUMERADA
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

  // Renderização da tela inicial
  if (currentView === 'home') {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProfessionalHeader 
          title="SISTEMA DE INSPEÇÃO ELÉTRICA NR-10 COM HRN" 
          subtitle="Gestão Completa de Conformidade e Hierarquia de Risco Numérico"
        />

        <div className="max-w-7xl mx-auto p-6">
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
                <h3 className="text-lg font-semibold mb-2">Dashboard HRN</h3>
                <p className="text-sm opacity-90">Análises e hierarquia de riscos</p>
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

          <NumberedSection number="2" title="INSPEÇÕES RECENTES">
            {inspecoes.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Nenhuma inspeção criada ainda</p>
                <p className="text-gray-400">Clique em "Nova Inspeção" para começar</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Inspeção</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Contrato</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Cliente</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Engenheiro</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Data</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">HRN Total</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Progresso</th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inspecoes.map(inspecao => {
                      const stats = getInspecaoStats(inspecao);
                      const progresso = stats.totalItems > 0 ? 
                        Math.round(((stats.conformes + stats.naoConformes + stats.naoAplicaveis) / stats.totalItems) * 100) : 0;

                      const hrnColor = getHRNColor(inspecao.hrnTotalCliente || 0);

                      return (
                        <tr key={inspecao.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="font-semibold text-gray-900">{inspecao.nome}</div>
                            <div className="text-sm text-blue-600 font-mono">{inspecao.numeroSequencial}</div>
                            <div className="text-xs text-gray-500">
                              {inspecao.areas.length} área(s) - 
                              {inspecao.areas.filter(a => a.tipoChecklist === 'subestacoes').length > 0 && ' Subestações'}
                              {inspecao.areas.filter(a => a.tipoChecklist === 'paineis').length > 0 && ' Painéis'}
                            </div>
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

                          <td className="px-4 py-4 text-center">
                            {inspecao.hrnTotalCliente && inspecao.hrnTotalCliente > 0 ? (
                              <div>
                                <div className="text-lg font-bold text-red-600">
                                  {inspecao.hrnTotalCliente.toFixed(1)}
                                </div>
                                <div className={`px-2 py-1 rounded text-xs font-medium ${hrnColor.bg} ${hrnColor.text}`}>
                                  {hrnColor.label}
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">Sem NC</div>
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
                                  alert('Funcionalidade de PDF será implementada em breve!');
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
                  </tbody>
                </table>
              </div>
            )}
          </NumberedSection>
        </div>

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
                  <p className="text-gray-300 text-sm">Sistema de Inspeção Elétrica NR-10 com HRN</p>
                </div>
              </div>
              <div className="text-right text-sm text-gray-300">
                <p>Versão 2.0 - {new Date().getFullYear()}</p>
                <p>Hierarquia de Risco Numérico Integrada</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Renderização da tela de nova inspeção
  if (currentView === 'nova-inspecao') {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProfessionalHeader 
          title="NOVA INSPEÇÃO ELÉTRICA" 
          subtitle="Cadastro de Nova Inspeção - Formulário de Dados Iniciais"
        />

        <div className="max-w-4xl mx-auto p-6">
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

          <GeolocationComponent />
        </div>
      </div>
    );
  }

  // Renderização da tela de inspeção
  if (currentView === 'inspecao' && currentInspecao) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
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
                    {currentInspecao.hrnTotalCliente && currentInspecao.hrnTotalCliente > 0 && (
                      <span className="flex items-center gap-1 text-red-600 font-bold">
                        <AlertCircle className="w-4 h-4" />
                        HRN Total: {currentInspecao.hrnTotalCliente.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => alert('Funcionalidade de PDF será implementada em breve!')}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <FileDown className="w-4 h-4" />
                  Gerar PDF
                </button>
              </div>
            </div>
          </div>

          <GeolocationComponent />

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
                    Check List para Subestações (75 itens)
                  </button>
                  <button
                    onClick={showItemSelection}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Selecionar Tipo e Itens
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
                let stats = { total: 0, conformes: 0, naoConformes: 0, naoAplicaveis: 0 };
                
                if (area.tipoChecklist === 'paineis' && area.painelItems) {
                  stats.total = area.painelItems.length;
                  stats.conformes = area.painelItems.filter(i => i.condicao === 'C').length;
                  stats.naoConformes = area.painelItems.filter(i => i.condicao === 'NC').length;
                  stats.naoAplicaveis = area.painelItems.filter(i => i.condicao === 'NA').length;
                } else {
                  stats.total = area.items.length;
                  stats.conformes = area.items.filter(i => i.condicao === 'C').length;
                  stats.naoConformes = area.items.filter(i => i.condicao === 'NC').length;
                  stats.naoAplicaveis = area.items.filter(i => i.condicao === 'NA').length;
                }
                
                const progresso = stats.total > 0 ? 
                  Math.round(((stats.conformes + stats.naoConformes + stats.naoAplicaveis) / stats.total) * 100) : 0;

                const tipoArea = area.tipoChecklist === 'paineis' ? 'Quadros Elétricos' : 'Subestações';
                const hrnColor = getHRNColor(area.hrnTotal || 0);

                return (
                  <div key={area.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-900 mb-2">{area.nome}</h3>
                    <div className="text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          area.tipoChecklist === 'paineis' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {tipoArea}
                        </span>
                        {area.hrnTotal && area.hrnTotal > 0 && (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${hrnColor.bg} ${hrnColor.text}`}>
                            HRN: {area.hrnTotal.toFixed(1)}
                          </span>
                        )}
                      </div>
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

  // Renderização da tela de checklist
  if (currentView === 'checklist' && currentArea && currentInspecao) {
    const isPainelChecklist = currentArea.tipoChecklist === 'paineis';
    const tipoNome = isPainelChecklist ? 'Quadros Elétricos' : 'Check List para Subestações';
    
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
                    {tipoNome} com {isPainelChecklist ? currentArea.painelItems?.length || 0 : currentArea.items.length} itens de inspeção elétrica
                    {!isPainelChecklist && currentArea.hrnTotal && currentArea.hrnTotal > 0 && (
                      <span className="ml-4 text-red-600 font-bold">
                        HRN da Área: {currentArea.hrnTotal.toFixed(2)} - {getHRNColor(currentArea.hrnTotal).label}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              
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
            <div className="overflow-x-auto">
              <div className="h-4 overflow-x-auto mb-2">
                <div style={{ width: isPainelChecklist ? '1200px' : '1600px', height: '1px' }}></div>
              </div>
              
              <div className="overflow-x-auto">
                <table className={`w-full ${isPainelChecklist ? 'min-w-[1200px]' : 'min-w-[1600px]'}`}>
                  <thead className="bg-gray-800 text-white sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Item</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Norma</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Descrição</th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Condição</th>
                      {isPainelChecklist ? (
                        <>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Observação</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Recomendação</th>
                        </>
                      ) : (
                        <>
                          <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">PO</th>
                          <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">FE</th>
                          <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">GSD</th>
                          <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">NPER</th>
                          <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">HRN</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Recomendações</th>
                          <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Imagem Padrão</th>
                        </>
                      )}
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Mídia</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isPainelChecklist && currentArea.painelItems ? (
                      currentArea.painelItems.map((item, index) => (
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
                          
                          <td className="px-4 py-4 text-center">
                            <select
                              value={item.condicao}
                              onChange={(e) => updatePainelItem(currentArea.id, item.id, 'condicao', e.target.value as 'C' | 'NC' | 'NA' | '')}
                              className={`w-16 px-2 py-1 text-xs rounded border ${getStatusColor(item.condicao)} border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                            >
                              <option value="">-</option>
                              <option value="C">C</option>
                              <option value="NC">NC</option>
                              <option value="NA">NA</option>
                            </select>
                          </td>

                          <td className="px-4 py-4">
                            <textarea
                              value={item.observacao}
                              onChange={(e) => updatePainelItem(currentArea.id, item.id, 'observacao', e.target.value)}
                              placeholder="Adicione observações..."
                              className="w-full min-w-[200px] px-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                              rows={2}
                            />
                          </td>

                          <td className="px-4 py-4">
                            <textarea
                              value={item.recomendacao}
                              onChange={(e) => updatePainelItem(currentArea.id, item.id, 'recomendacao', e.target.value)}
                              placeholder="Adicione recomendações..."
                              className="w-full min-w-[200px] px-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                              rows={2}
                            />
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex flex-col gap-2 min-w-[120px]">
                              <div className="flex gap-1">
                                <label className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition-colors cursor-pointer">
                                  <Upload className="w-3 h-3" />
                                  Img
                                  <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => handleFileUpload(currentArea.id, item.id, e.target.files, 'image', true)}
                                    className="hidden"
                                  />
                                </label>

                                <label className="flex items-center gap-1 bg-purple-600 text-white px-2 py-1 rounded text-xs hover:bg-purple-700 transition-colors cursor-pointer">
                                  <Video className="w-3 h-3" />
                                  Vid
                                  <input
                                    type="file"
                                    accept="video/*"
                                    multiple
                                    onChange={(e) => handleFileUpload(currentArea.id, item.id, e.target.files, 'video', true)}
                                    className="hidden"
                                  />
                                </label>

                                <label className="flex items-center gap-1 bg-orange-600 text-white px-2 py-1 rounded text-xs hover:bg-orange-700 transition-colors cursor-pointer">
                                  <Mic className="w-3 h-3" />
                                  Aud
                                  <input
                                    type="file"
                                    accept="audio/*"
                                    multiple
                                    onChange={(e) => handleFileUpload(currentArea.id, item.id, e.target.files, 'audio', true)}
                                    className="hidden"
                                  />
                                </label>
                              </div>

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
                                        onClick={() => removeMedia(currentArea.id, item.id, media.id, true)}
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
                      ))
                    ) : (
                      currentArea.items.map((item, index) => {
                        const hrnValue = item.hrn || 0;
                        const hrnColor = getHRNColor(hrnValue);
                        
                        return (
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

                            <td className="px-4 py-4 text-center">
                              <select
                                value={item.po}
                                onChange={(e) => updateItem(currentArea.id, item.id, 'po', e.target.value)}
                                className="w-32 px-2 py-1 text-xs rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={item.condicao !== 'NC'}
                              >
                                {PO_OPTIONS.map(option => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td className="px-4 py-4 text-center">
                              <select
                                value={item.fe}
                                onChange={(e) => updateItem(currentArea.id, item.id, 'fe', e.target.value)}
                                className="w-32 px-2 py-1 text-xs rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={item.condicao !== 'NC'}
                              >
                                {FE_OPTIONS.map(option => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td className="px-4 py-4 text-center">
                              <select
                                value={item.gsd}
                                onChange={(e) => updateItem(currentArea.id, item.id, 'gsd', e.target.value)}
                                className="w-32 px-2 py-1 text-xs rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={item.condicao !== 'NC'}
                              >
                                {GSD_OPTIONS.map(option => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td className="px-4 py-4 text-center">
                              <select
                                value={item.nper}
                                onChange={(e) => updateItem(currentArea.id, item.id, 'nper', e.target.value)}
                                className="w-32 px-2 py-1 text-xs rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={item.condicao !== 'NC'}
                              >
                                {NPER_OPTIONS.map(option => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td className="px-4 py-4 text-center">
                              {item.condicao === 'NC' && hrnValue > 0 ? (
                                <div className={`px-3 py-2 rounded-lg text-sm font-bold ${hrnColor.bg} ${hrnColor.text}`}>
                                  {hrnValue.toFixed(2)}
                                  <div className="text-xs font-normal mt-1">
                                    {hrnColor.label}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-sm text-gray-400">
                                  {item.condicao === 'NC' ? 'Preencha todos os campos' : '-'}
                                </div>
                              )}
                            </td>

                            <td className="px-4 py-4">
                              <textarea
                                value={item.recomendacoes}
                                onChange={(e) => updateItem(currentArea.id, item.id, 'recomendacoes', e.target.value)}
                                placeholder="Adicione recomendações técnicas..."
                                className="w-full min-w-[200px] px-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                rows={2}
                              />
                            </td>

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

                            <td className="px-4 py-4">
                              <div className="flex flex-col gap-2 min-w-[120px]">
                                <div className="flex gap-1">
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
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

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

  // Renderização padrão para outras views (placeholder)
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">Funcionalidade em desenvolvimento</p>
        <button
          onClick={() => setCurrentView('home')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Voltar ao Início
        </button>
      </div>
    </div>
  );
}