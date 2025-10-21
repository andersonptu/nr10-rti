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

// DADOS DOS ITENS DE CHECKLIST
const checklistItems: Omit<ChecklistItem, 'condicao' | 'po' | 'fe' | 'gsd' | 'nper' | 'recomendacoes' | 'imagemPadrao' | 'medias' | 'selected' | 'precisaImagem' | 'hrn'>[] = [
  { id: 1, norma: "NR10.3.9-d", descricao: "A sala ou subestação está identificada? Item 10.10.1-c – NR-10" },
  { id: 2, norma: "NR10.4.1", descricao: "As instalações elétricas devem ser projetadas e executadas de modo que seja possível prevenir acidentes e outras ocorrências originadas por choque elétrico?" },
  { id: 3, norma: "NR10.4.2", descricao: "As instalações elétricas devem ser projetadas e executadas de modo que seja possível prevenir incêndios e explosões?" },
  { id: 4, norma: "NR10.4.3", descricao: "As instalações elétricas devem ser projetadas e executadas de modo que seja possível prevenir outros tipos de acidentes?" },
  { id: 5, norma: "NR10.5.1", descricao: "As instalações elétricas devem ser mantidas em condições seguras de funcionamento?" }
];

const painelEletricoItems: Omit<PainelEletricoItem, 'condicao' | 'observacao' | 'recomendacao' | 'medias' | 'selected'>[] = [
  { id: 1, norma: "NBR 5410", descricao: "O painel está identificado: Possui TAG, Etiqueta com nível de tensão, Advertência quanto aos riscos elétricos." },
  { id: 2, norma: "NBR 5410", descricao: "O painel possui chave para bloqueio elétrico?" },
  { id: 3, norma: "NR-10", descricao: "Existe sinalização restringindo o acesso a pessoas não autorizados?" },
  { id: 4, norma: "NBR 5410", descricao: "O painel esta protegido contra entrada de animais?" },
  { id: 5, norma: "NBR 5410", descricao: "O painel possui diagrama elétrico?" }
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

  // Inicializar imagens padrão
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
      5: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop&q=80'
    };
    
    return imageMap[itemId] || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop&q=80';
  };

  // Função para categorizar itens
  const getCategoryForItem = (norma: string): string => {
    if (norma.includes('10.3')) return 'Responsabilidades';
    if (norma.includes('10.4')) return 'Projeto e Execução';
    if (norma.includes('10.5')) return 'Manutenção';
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

    alert(`Inspeção criada com sucesso!\\nNúmero sequencial: ${numeroSequencial}`);
  };

  const addArea = () => {
    if (!novaArea.trim() || !currentInspecao) return;

    const checklistCompleto: ChecklistItem[] = checklistItems.map(item => ({
      id: item.id,
      norma: item.norma,
      descricao: item.descricao,
      condicao: '',
      po: '',
      fe: '',
      gsd: '',
      nper: '',
      recomendacoes: '',
      imagemPadrao: getDefaultImageForItem(item.id),
      medias: [],
      selected: true,
      precisaImagem: false,
      hrn: 0
    }));

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
    
    alert(`Área "${novaArea}" criada com sucesso!`);
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
      area.items.forEach(item => {
        totalItems++;
        if (item.condicao === 'C') conformes++;
        else if (item.condicao === 'NC') naoConformes++;
        else if (item.condicao === 'NA') naoAplicaveis++;
      });
    });

    return { totalItems, conformes, naoConformes, naoAplicaveis };
  };

  // COMPONENTE DE CABEÇALHO PROFISSIONAL
  const ProfessionalHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
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
              <div className="bg-white shadow-lg rounded-lg overflow-hidden border">
                <table className="w-full">
                  <thead className="bg-gray-800 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Inspeção</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Contrato</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Cliente</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Progresso</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inspecoes.map(inspecao => {
                      const stats = getInspecaoStats(inspecao);
                      const progresso = stats.totalItems > 0 ? 
                        Math.round(((stats.conformes + stats.naoConformes + stats.naoAplicaveis) / stats.totalItems) * 100) : 0;

                      return (
                        <tr key={inspecao.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="font-semibold text-gray-900">{inspecao.nome}</div>
                            <div className="text-sm text-blue-600 font-mono">{inspecao.numeroSequencial}</div>
                          </td>
                          
                          <td className="px-4 py-4 text-sm text-gray-900 font-mono">
                            {inspecao.numeroContrato}
                          </td>
                          
                          <td className="px-4 py-4 text-sm text-gray-700">
                            {inspecao.responsavelCliente}
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
                  </div>
                </div>
              </div>
            </div>
          </div>

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
                    Criar Área
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
                const stats = { total: area.items.length, conformes: 0, naoConformes: 0, naoAplicaveis: 0 };
                
                area.items.forEach(item => {
                  if (item.condicao === 'C') stats.conformes++;
                  else if (item.condicao === 'NC') stats.naoConformes++;
                  else if (item.condicao === 'NA') stats.naoAplicaveis++;
                });
                
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

  // Renderização da tela de checklist
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
                    Checklist com {currentArea.items.length} itens de inspeção elétrica
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px]">
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
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">HRN</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Recomendações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentArea.items.map((item, index) => {
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
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Renderização das outras telas (dashboard, configurações, etc.)
  if (currentView === 'dashboard') {
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
                    <p className="text-blue-100 text-sm font-medium">TOTAL DE INSPEÇÕES</p>
                    <p className="text-3xl font-bold">{inspecoes.length}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">CONCLUÍDAS</p>
                    <p className="text-3xl font-bold">
                      {inspecoes.filter(i => i.status === 'Concluída').length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-200" />
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
                    <p className="text-red-100 text-sm font-medium">PENDENTES</p>
                    <p className="text-3xl font-bold">
                      {inspecoes.filter(i => i.status === 'Pendente').length}
                    </p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-200" />
                </div>
              </div>
            </div>
          </NumberedSection>
        </div>
      </div>
    );
  }

  if (currentView === 'gerenciar-imagens') {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProfessionalHeader 
          title="GERENCIAMENTO DE IMAGENS PADRÃO" 
          subtitle="Configuração das Imagens de Referência dos Itens NR-10"
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

          <NumberedSection number="1" title="GERENCIAMENTO DE IMAGENS">
            <div className="text-center py-12">
              <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Funcionalidade em desenvolvimento</p>
              <p className="text-gray-400">Em breve você poderá gerenciar as imagens padrão</p>
            </div>
          </NumberedSection>
        </div>
      </div>
    );
  }

  if (currentView === 'configuracoes') {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProfessionalHeader 
          title="CONFIGURAÇÕES DO SISTEMA" 
          subtitle="Personalização e Ajustes Técnicos"
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

          <NumberedSection number="1" title="CONFIGURAÇÕES">
            <div className="text-center py-12">
              <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Configurações em desenvolvimento</p>
              <p className="text-gray-400">Em breve você poderá personalizar o sistema</p>
            </div>
          </NumberedSection>
        </div>
      </div>
    );
  }

  return null;
}