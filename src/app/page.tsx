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
  po: string; // Agora string para valores numéricos com descrição
  fe: string; // Agora string para valores numéricos com descrição
  gsd: string; // Agora string para valores numéricos com descrição
  nper: string; // Agora string para valores numéricos com descrição
  recomendacoes: string;
  imagemPadrao: string;
  medias: MediaFile[];
  selected: boolean;
  precisaImagem: boolean;
  hrn?: number; // Novo campo para armazenar o valor HRN calculado
}

// Nova interface para itens de painéis elétricos
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
  hrnTotal?: number; // Novo campo para HRN total da área
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
  hrnTotalCliente?: number; // Novo campo para HRN total do cliente
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

// Estado global para armazenar as imagens padrão dos itens
interface ImagemPadraoItem {
  id: number;
  norma: string;
  descricao: string;
  imagemPadrao: string;
  categoria: string;
  precisaImagem: boolean;
}

// Configuração global de quais itens precisam de imagem padrão
interface ConfiguracaoImagensPadrao {
  itensSelecionados: number[];
}

// CONSTANTES PARA OS NOVOS VALORES NUMÉRICOS COM DESCRIÇÕES
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

// FUNÇÃO PARA OBTER COR DO HRN BASEADA NA IMAGEM ANALISADA
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

// Novos itens para painéis elétricos
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
    const isCurrentlySelected = configuracaoImagensPadrao.itensSelecionados.includes(itemId);
    
    setImagensPadrao(prev => prev.map(item => 
      item.id === itemId ? { ...item, precisaImagem: !isCurrentlySelected } : item
    ));

    setConfiguracaoImagensPadrao(prev => ({
      ...prev,
      itensSelecionados: isCurrentlySelected
        ? prev.itensSelecionados.filter(id => id !== itemId)
        : [...prev.itensSelecionados, itemId]
    }));
  };

  // Função para selecionar/deselecionar todos os itens para imagem padrão
  const toggleAllItemsImagemPadrao = () => {
    const todosIds = imagensPadrao.map(item => item.id);
    const todosSelecionados = configuracaoImagensPadrao.itensSelecionados.length === todosIds.length;

    if (todosSelecionados) {
      setImagensPadrao(prev => prev.map(item => ({ ...item, precisaImagem: false })));
      setConfiguracaoImagensPadrao(prev => ({ ...prev, itensSelecionados: [] }));
    } else {
      setImagensPadrao(prev => prev.map(item => ({ ...item, precisaImagem: true })));
      setConfiguracaoImagensPadrao(prev => ({ ...prev, itensSelecionados: todosIds }));
    }
  };

  // Função para salvar configuração de imagens padrão
  const salvarConfiguracaoImagensPadrao = () => {
    try {
      localStorage.setItem('configuracao-imagens-padrao', JSON.stringify(configuracaoImagensPadrao));
      alert(`Configuração salva com sucesso!\n${configuracaoImagensPadrao.itensSelecionados.length} itens selecionados para receber imagem padrão em novas inspeções.`);
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      alert('Erro ao salvar configuração. Tente novamente.');
    }
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
        console.log('Não foi possível obter o endereço, mas a localização foi capturada');
      }

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
    if (!novaArea.trim() || !currentInspecao) {
      alert('Preencha o nome da área antes de continuar');
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
            condicao: '',
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
          condicao: '',
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
        condicao: '',
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

        if (currentArea.tipoChecklist === 'paineis') {
          updatePainelItem(currentArea.id, cameraOpen.itemId, 'medias', 
            currentArea.painelItems?.find(i => i.id === cameraOpen.itemId)?.medias.concat(mediaFile) || [mediaFile]
          );
        } else {
          updateItem(currentArea.id, cameraOpen.itemId, 'medias', 
            currentArea.items.find(i => i.id === cameraOpen.itemId)?.medias.concat(mediaFile) || [mediaFile]
          );
        }
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

  // FUNÇÃO PARA GERAR PDF (mantida igual)
  const generatePDF = async () => {
    if (!currentInspecao) return;
    
    try {
      let jsPDF = (window as any).jsPDF;
      
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
          setTimeout(() => reject(new Error('Timeout ao carregar jsPDF')), 10000);
        });
      }
      
      if (!jsPDF) {
        throw new Error('jsPDF não está disponível');
      }
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;
      let pageNumber = 1;
      
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

      const addHeader = () => {
        addWatermark();
        
        pdf.setFillColor(255, 140, 0);
        pdf.rect(0, 0, 8, pageHeight, 'F');
        
        try {
          pdf.setFillColor(255, 255, 255);
          pdf.rect(margin, margin, 30, 20, 'F');
          pdf.setFontSize(8);
          pdf.setTextColor(0, 0, 0);
          pdf.text('PA BRASIL', margin + 2, margin + 8);
          pdf.text('AUTOMAÇÃO', margin + 2, margin + 12);
        } catch (error) {
          console.log('Erro ao adicionar logo PA Brasil');
        }

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

      const addFooter = () => {
        const footerY = pageHeight - 20;
        
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
        
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(configuracoes.empresa.nome, margin, footerY);
        pdf.text(`${configuracoes.empresa.telefone} | ${configuracoes.empresa.email}`, margin, footerY + 4);
        pdf.text(configuracoes.empresa.endereco, margin, footerY + 8);
        
        pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - margin - 40, footerY);
        pdf.text(`Página ${pageNumber}`, pageWidth - margin - 40, footerY + 4);
      };

      const addNewPage = () => {
        addFooter();
        pdf.addPage();
        pageNumber++;
        yPosition = margin;
        addHeader();
      };

      const checkPageBreak = (requiredHeight: number) => {
        if (yPosition + requiredHeight > pageHeight - 40) {
          addNewPage();
        }
      };

      // PÁGINA 1 - CAPA
      addHeader();
      
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 100, 200);
      pdf.text('RELATÓRIO TÉCNICO DE INSPEÇÃO', pageWidth / 2, yPosition + 20, { align: 'center' });
      
      pdf.setFontSize(18);
      pdf.setTextColor(0, 0, 0);
      pdf.text('INSTALAÇÕES ELÉTRICAS - NR-10', pageWidth / 2, yPosition + 35, { align: 'center' });
      
      yPosition += 60;
      
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
      
      // HRN TOTAL DO CLIENTE
      if (currentInspecao.hrnTotalCliente && currentInspecao.hrnTotalCliente > 0) {
        const hrnColor = getHRNColor(currentInspecao.hrnTotalCliente);
        
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 100, 200);
        pdf.text('HIERARQUIA DE RISCO NUMÉRICO (HRN)', margin, yPosition);
        yPosition += 15;
        
        pdf.setFillColor(245, 245, 245);
        pdf.rect(margin, yPosition, pageWidth - 2 * margin, 30, 'F');
        pdf.setDrawColor(200, 200, 200);
        pdf.rect(margin, yPosition, pageWidth - 2 * margin, 30);
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(`HRN Total do Cliente: ${currentInspecao.hrnTotalCliente.toFixed(2)}`, margin + 5, yPosition + 10);
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Classificação: ${hrnColor.label}`, margin + 5, yPosition + 20);
        
        yPosition += 40;
      }

      addFooter();
      
      // NOVA PÁGINA - CONTEÚDO
      pdf.addPage();
      pageNumber++;
      addHeader();
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 100, 200);
      pdf.text('6. RESULTADOS DA INSPEÇÃO', margin, yPosition);
      yPosition += 15;
      
      // Áreas e Itens com HRN
      currentInspecao.areas.forEach((area, areaIndex) => {
        checkPageBreak(30);
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        const tipoArea = area.tipoChecklist === 'paineis' ? 'QUADROS ELÉTRICOS' : 'SUBESTAÇÕES';
        pdf.text(`6.${areaIndex + 1} ÁREA: ${area.nome.toUpperCase()} - ${tipoArea}`, margin, yPosition);
        yPosition += 8;
        
        // HRN da Área
        if (area.hrnTotal && area.hrnTotal > 0) {
          const hrnColor = getHRNColor(area.hrnTotal);
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`HRN da Área: ${area.hrnTotal.toFixed(2)} - ${hrnColor.label}`, margin, yPosition);
          yPosition += 6;
        }
        
        yPosition += 6;

        if (area.tipoChecklist === 'paineis' && area.painelItems) {
          // Tabela para painéis elétricos (sem HRN)
          const tableStartY = yPosition;
          const colWidths = [15, 25, 80, 15, 30, 30];
          const headers = ['Item', 'Norma', 'Descrição', 'Cond.', 'Observação', 'Recomendação'];
          
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
          
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(0, 0, 0);
          
          area.painelItems.forEach((item, itemIndex) => {
            checkPageBreak(12);
            
            if (itemIndex % 2 === 0) {
              pdf.setFillColor(248, 248, 248);
              pdf.rect(margin, yPosition, colWidths.reduce((a, b) => a + b, 0), 8, 'F');
            }
            
            xPos = margin;
            const rowData = [
              item.id.toString(),
              item.norma,
              item.descricao.length > 40 ? item.descricao.substring(0, 37) + '...' : item.descricao,
              item.condicao || '-',
              item.observacao.length > 15 ? item.observacao.substring(0, 12) + '...' : item.observacao || '-',
              item.recomendacao.length > 15 ? item.recomendacao.substring(0, 12) + '...' : item.recomendacao || '-'
            ];
            
            rowData.forEach((data, i) => {
              pdf.text(data, xPos + 2, yPosition + 5);
              xPos += colWidths[i];
            });
            
            pdf.setDrawColor(200, 200, 200);
            xPos = margin;
            headers.forEach((_, i) => {
              pdf.rect(xPos, yPosition, colWidths[i], 8);
              xPos += colWidths[i];
            });
            
            yPosition += 8;
          });
        } else {
          // Tabela para subestações com HRN
          const tableStartY = yPosition;
          const colWidths = [15, 25, 60, 15, 15, 15, 15, 15, 20];
          const headers = ['Item', 'Norma', 'Descrição', 'Cond.', 'PO', 'FE', 'GSD', 'NPER', 'HRN'];
          
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
          
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(0, 0, 0);
          
          area.items.forEach((item, itemIndex) => {
            checkPageBreak(12);
            
            if (itemIndex % 2 === 0) {
              pdf.setFillColor(248, 248, 248);
              pdf.rect(margin, yPosition, colWidths.reduce((a, b) => a + b, 0), 8, 'F');
            }
            
            xPos = margin;
            const hrnValue = item.hrn || 0;
            const hrnColor = getHRNColor(hrnValue);
            
            const rowData = [
              item.id.toString(),
              item.norma,
              item.descricao.length > 30 ? item.descricao.substring(0, 27) + '...' : item.descricao,
              item.condicao || '-',
              item.po ? item.po.split('-')[0] : '-',
              item.fe ? item.fe.split('-')[0] : '-',
              item.gsd ? item.gsd.split('-')[0] : '-',
              item.nper ? item.nper.split('-')[0] : '-',
              hrnValue > 0 ? hrnValue.toFixed(2) : '-'
            ];
            
            rowData.forEach((data, i) => {
              // Destacar HRN com cor se for NC
              if (i === 8 && item.condicao === 'NC' && hrnValue > 0) {
                pdf.setFont('helvetica', 'bold');
                if (hrnValue > 50) pdf.setTextColor(200, 0, 0); // Vermelho para alto risco
                else if (hrnValue > 10) pdf.setTextColor(255, 140, 0); // Laranja para médio
                else pdf.setTextColor(0, 150, 0); // Verde para baixo
              } else {
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(0, 0, 0);
              }
              
              pdf.text(data, xPos + 2, yPosition + 5);
              xPos += colWidths[i];
            });
            
            pdf.setDrawColor(200, 200, 200);
            xPos = margin;
            headers.forEach((_, i) => {
              pdf.rect(xPos, yPosition, colWidths[i], 8);
              xPos += colWidths[i];
            });
            
            yPosition += 8;
            
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
        }
        
        yPosition += 15;
      });
      
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
      
      const fileName = `RRTI-${currentInspecao.numeroSequencial}-${currentInspecao.nome.replace(/\s+/g, '-')}.pdf`;
      
      pdf.save(fileName);
      
      alert(`PDF gerado com sucesso!\nArquivo: ${fileName}\n\n✓ Incluído sistema HRN com cores\n✓ HRN total por área e cliente\n✓ Classificação de riscos conforme análise\n✓ Estrutura profissional mantida`);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      
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
      const totalItems = area.painelItems.length;
      const completedItems = area.painelItems.filter(item => 
        item.condicao !== '' || item.observacao !== '' || item.recomendacao !== ''
      ).length;
      return completedItems > 0;
    } else {
      const totalItems = area.items.length;
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

  const salvarConfiguracoes = () => {
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

  // FUNÇÃO PARA OBTER DADOS DOS CLIENTES COM HRN
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
          conformidade: { total: 0, conformes: 0, naoConformes: 0, naoAplicaveis: 0 },
          hrnTotal: 0 // Novo campo para HRN total do cliente
        });
      }

      const clienteData = clientesMap.get(cliente);
      clienteData.totalInspecoes++;
      
      if (inspecao.status === 'Concluída') clienteData.inspecoesConcluidas++;
      else if (inspecao.status === 'Em Andamento') clienteData.inspecoesAndamento++;
      else if (inspecao.status === 'Pendente') clienteData.inspecoesPendentes++;

      clienteData.numeroSequenciais.push(inspecao.numeroSequencial);

      if (!clienteData.ultimaInspecao || new Date(inspecao.createdAt) > new Date(clienteData.ultimaInspecao)) {
        clienteData.ultimaInspecao = inspecao.createdAt;
      }

      const stats = getInspecaoStats(inspecao);
      clienteData.conformidade.total += stats.totalItems;
      clienteData.conformidade.conformes += stats.conformes;
      clienteData.conformidade.naoConformes += stats.naoConformes;
      clienteData.conformidade.naoAplicaveis += stats.naoAplicaveis;

      // Somar HRN total do cliente
      if (inspecao.hrnTotalCliente) {
        clienteData.hrnTotal += inspecao.hrnTotalCliente;
      }
    });

    return Array.from(clientesMap.values());
  };

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

  // COMPONENTE DE TABELA PROFISSIONAL
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

  // Renderização da tela de seleção de tipo de checklist
  if (currentView === 'selecionar-tipo-checklist') {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProfessionalHeader 
          title="SELEÇÃO DO TIPO DE CHECKLIST" 
          subtitle={`Área: ${novaArea} - Escolha o Tipo de Inspeção`}
        />

        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-6">
            <button
              onClick={() => setCurrentView('inspecao')}
              className="flex items-center gap-2 text-blue-800 hover:text-blue-900 transition-colors font-medium"
            >
              <Home className="w-5 h-5" />
              Voltar à Inspeção
            </button>
          </div>

          <NumberedSection number="1" title="ESCOLHA O TIPO DE CHECKLIST">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-blue-900 mb-2">Check List para Subestações</h3>
                  <p className="text-blue-700 text-sm">Inspeção completa baseada na NR-10 com sistema HRN</p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-blue-800">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">75 itens de verificação NR-10</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-800">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Colunas: Condição, PO, FE, GSD, NPER</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-800">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Cálculo automático de HRN</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-800">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Classificação de riscos com cores</span>
                  </div>
                </div>

                <button
                  onClick={() => showItemSelectionForType('subestacoes')}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Selecionar Itens NR-10 (75 itens)
                </button>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <Settings className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-green-900 mb-2">Checklist para Quadros Elétricos</h3>
                  <p className="text-green-700 text-sm">Inspeção específica para painéis elétricos</p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">20 itens específicos para painéis</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Colunas: Condição, Observação, Recomendação</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Normas NBR 5410 e NR-10</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Foco em aspectos práticos</span>
                  </div>
                </div>

                <button
                  onClick={() => showItemSelectionForType('paineis')}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Selecionar Itens de Painéis (20 itens)
                </button>
              </div>
            </div>

            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h5 className="font-medium text-yellow-900">Sistema HRN - Hierarquia de Risco Numérico</h5>
                  <div className="text-yellow-800 text-sm mt-2 space-y-1">
                    <p><strong>Check List para Subestações:</strong> Inclui cálculo automático de HRN quando Condição = NC, multiplicando os valores PO × FE × GSD × NPER.</p>
                    <p><strong>Classificação de Riscos:</strong> Verde (Aceitável/Muito Baixo), Amarelo (Baixo/Significante), Vermelho (Alto/Muito Alto/Extremo/Inaceitável).</p>
                  </div>
                </div>
              </div>
            </div>
          </NumberedSection>
        </div>
      </div>
    );
  }

  // Renderização da tela de gerenciamento de imagens (mantida igual)
  if (currentView === 'gerenciar-imagens') {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProfessionalHeader 
          title="GERENCIAMENTO DE IMAGENS PADRÃO" 
          subtitle="Configuração das Imagens de Referência dos 75 Itens NR-10"
        />

        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-6">
            <button
              onClick={() => setCurrentView('home')}
              className="flex items-center gap-2 text-blue-800 hover:text-blue-900 transition-colors font-medium"
            >
              <Home className="w-5 h-5" />
              Voltar ao Início
            </button>
          </div>

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

          <NumberedSection number="3" title="IMAGENS PADRÃO DOS ITENS NR-10">
            <div className="space-y-4">
              {imagensFiltradas.map((item) => (
                <div key={item.id} className={`rounded-lg p-4 border ${
                  item.precisaImagem ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
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

  // Renderização da tela de dashboard com HRN
  if (currentView === 'dashboard') {
    const clientesData = getClientesData();
    
    return (
      <div className="min-h-screen bg-gray-50">
        <ProfessionalHeader 
          title="DASHBOARD HRN - HIERARQUIA DE RISCO NUMÉRICO" 
          subtitle="Análise de Conformidade NR-10 e Classificação de Riscos"
        />

        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-6">
            <button
              onClick={() => setCurrentView('home')}
              className="flex items-center gap-2 text-blue-800 hover:text-blue-900 transition-colors font-medium"
            >
              <Home className="w-5 h-5" />
              Voltar ao Início
            </button>
          </div>

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

              <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium">HRN TOTAL SISTEMA</p>
                    <p className="text-3xl font-bold">
                      {clientesData.reduce((total, cliente) => total + cliente.hrnTotal, 0).toFixed(0)}
                    </p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-200" />
                </div>
              </div>
            </div>
          </NumberedSection>

          <NumberedSection number="2" title="DADOS DETALHADOS POR CLIENTE COM HRN">
            {clientesData.length === 0 ? (
              <div className="text-center py-12">
                <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Nenhum cliente cadastrado</p>
                <p className="text-gray-400">Crie uma inspeção para começar</p>
              </div>
            ) : (
              <ProfessionalTable headers={['Cliente', 'Inspeções', 'Status', 'Conformidade', 'HRN Total', 'Classificação', 'Última Inspeção', 'Ações']}>
                {clientesData.map((cliente, index) => {
                  const conformidadePercentual = cliente.conformidade.total > 0 
                    ? Math.round((cliente.conformidade.conformes / cliente.conformidade.total) * 100)
                    : 0;

                  const hrnColor = getHRNColor(cliente.hrnTotal);

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

                      <td className="px-4 py-4 text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {cliente.hrnTotal.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500">Risco Acumulado</div>
                      </td>

                      <td className="px-4 py-4">
                        <div className={`px-3 py-2 rounded-full text-xs font-medium text-center ${hrnColor.bg} ${hrnColor.text}`}>
                          {hrnColor.label}
                        </div>
                        <div className="text-xs text-gray-500 text-center mt-1">
                          {cliente.hrnTotal > 0 ? `HRN: ${cliente.hrnTotal.toFixed(2)}` : 'Sem NC'}
                        </div>
                      </td>
                      
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {cliente.ultimaInspecao 
                          ? new Date(cliente.ultimaInspecao).toLocaleDateString('pt-BR')
                          : 'N/A'
                        }
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

          <NumberedSection number="3" title="LEGENDA DE CLASSIFICAÇÃO HRN">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-green-100 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">ACEITÁVEL / MUITO BAIXO</h4>
                <p className="text-sm text-green-700 mb-2">HRN: 0-1 / 1-5</p>
                <p className="text-xs text-green-600">Manter medidas de proteção atuais</p>
              </div>

              <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">BAIXO / SIGNIFICANTE</h4>
                <p className="text-sm text-yellow-700 mb-2">HRN: 5-10 / 10-50</p>
                <p className="text-xs text-yellow-600">Garantir eficácia das medidas e aprimorar</p>
              </div>

              <div className="bg-red-100 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-2">ALTO / MUITO ALTO</h4>
                <p className="text-sm text-red-700 mb-2">HRN: 50-100 / 100-500</p>
                <p className="text-xs text-red-600">Reduzir ou eliminar risco, implementar proteções</p>
              </div>

              <div className="bg-red-200 border border-red-300 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2">EXTREMO / INACEITÁVEL</h4>
                <p className="text-sm text-red-800 mb-2">HRN: 500-1000 / >1000</p>
                <p className="text-xs text-red-700">Ação imediata, interromper atividades</p>
              </div>
            </div>
          </NumberedSection>

          <NumberedSection number="4" title="OBSERVAÇÕES E CONCLUSÕES HRN">
            <div className="prose max-w-none">
              <p className="text-gray-700 mb-4">
                Este dashboard apresenta a Hierarquia de Risco Numérico (HRN) calculada automaticamente para itens com condição "NC" 
                (Não Conforme) através da multiplicação: PO × FE × GSD × NPER, conforme metodologia de análise de riscos.
              </p>
              
              <h4 className="text-lg font-semibold text-gray-900 mb-2">4.1 Metodologia HRN</h4>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li><strong>PO (Probabilidade de Ocorrência):</strong> De 0,033 (Quase Impossível) a 15 (Certeza)</li>
                <li><strong>FE (Frequência de Exposição):</strong> De 0,5 (Anualmente) a 5 (Constantemente)</li>
                <li><strong>GSD (Gravidade dos Danos):</strong> De 0,1 (Escoriação) a 15 (Fatalidade)</li>
                <li><strong>NPER (Número de Pessoas Expostas):</strong> De 1 (1-2 pessoas) a 12 (Mais de 50 pessoas)</li>
              </ul>

              <h4 className="text-lg font-semibold text-gray-900 mb-2">4.2 Aplicação Prática</h4>
              <p className="text-gray-700 mb-4">
                O sistema calcula automaticamente o HRN apenas para itens marcados como "NC", permitindo priorização 
                de ações corretivas baseada no nível de risco. Áreas e clientes com HRN mais alto requerem atenção imediata.
              </p>

              <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-orange-900">Correlação com NR-28</h5>
                    <p className="text-orange-800 text-sm mt-1">
                      Os valores HRN podem ser correlacionados com os critérios da NR-28 para determinação de multas 
                      e penalidades, considerando a gravidade das não conformidades identificadas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
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
                  <p className="text-gray-300 text-sm">Dashboard HRN gerado em {new Date().toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <div className="text-right text-sm text-gray-300">
                <p>Sistema de Análise de Riscos NR-10</p>
                <p>Hierarquia de Risco Numérico - Versão 1.0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Renderização da tela de configurações (mantida igual)
  if (currentView === 'configuracoes') {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProfessionalHeader 
          title="CONFIGURAÇÕES DO SISTEMA" 
          subtitle="Personalização e Ajustes Técnicos"
        />

        <div className="max-w-7xl mx-auto p-6">
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

            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-lg p-6">
                
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
                
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Renderização da tela de seleção de itens (mantida igual)
  if (currentView === 'selecionar-itens') {
    const itemsToShow = tipoChecklistSelecionado === 'subestacoes' ? checklistItems : painelEletricoItems;
    const tipoNome = tipoChecklistSelecionado === 'subestacoes' ? 'Check List para Subestações' : 'Checklist para Quadros Elétricos';
    
    return (
      <div className="min-h-screen bg-gray-50">
        <ProfessionalHeader 
          title="SELEÇÃO DE ITENS PARA INSPEÇÃO" 
          subtitle={`Área: ${novaArea} - ${tipoNome}`}
        />

        <div className="max-w-7xl mx-auto p-6">
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
                  {selectedItems.length} de {itemsToShow.length} itens selecionados
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentView('selecionar-tipo-checklist')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Voltar
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

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h5 className="font-medium text-blue-900">Tipo de Checklist Selecionado</h5>
                  <p className="text-blue-800 text-sm mt-1">
                    <strong>{tipoNome}</strong> - {itemsToShow.length} itens disponíveis para seleção.
                    {tipoChecklistSelecionado === 'subestacoes' 
                      ? ' Focado na conformidade geral com a NR-10 para subestações, com cálculo automático de HRN.'
                      : ' Específico para quadros elétricos com base na NBR 5410 e NR-10.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          <ProfessionalTable headers={['', 'Item', 'Norma', 'Descrição']}>
            {itemsToShow.map((item, index) => (
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

  // Renderização da tela inicial (mantida igual)
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
              <ProfessionalTable headers={['Inspeção', 'Contrato', 'Cliente', 'Engenheiro', 'Data', 'Status', 'HRN Total', 'Progresso', 'Ações']}>
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

  // Renderização da tela de nova inspeção (mantida igual)
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

  // Renderização da tela de inspeção (mantida igual)
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
                  onClick={generatePDF}
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

  // Renderização da tela de checklist ATUALIZADA COM HRN
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