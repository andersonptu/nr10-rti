'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, Upload, Video, Mic, Eye, Trash2, Download, FileText, CheckCircle, XCircle, AlertCircle,
  Plus, Building, User, Calendar, MapPin, BarChart3, PieChart, TrendingUp, Clock, 
  FileDown, Settings, Home, List, Dashboard, Save, RotateCcw, Bell, Shield, 
  Database, Palette, Globe, Monitor, Smartphone, Tablet, Phone, Mail, MapPinIcon,
  Navigation, Loader, Image, Edit, Search, Filter, Menu, X, ChevronDown, ChevronUp,
  Zap, AlertTriangle, Activity, Target, Layers, FileCheck, Users, Calendar as CalendarIcon,
  Briefcase, MapPin as LocationIcon, Clock as TimeIcon, Star, Award, TrendingDown,
  BarChart, LineChart, Gauge, Thermometer, Battery, Power, Wifi, Signal
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
    criptografiaLocal: false;
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

interface DashboardStats {
  totalInspecoes: number;
  inspecoesCompletas: number;
  inspecoesPendentes: number;
  hrnMedio: number;
  itensNaoConformes: number;
  areasInspecionadas: number;
}

interface RelatorioItem {
  id: string;
  nome: string;
  tipo: 'PDF' | 'Excel' | 'Word';
  dataGeracao: string;
  status: 'Gerado' | 'Processando' | 'Erro';
  tamanho: string;
}

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

const calcularHRN = (po: string, fe: string, gsd: string, nper: string): number => {
  const poValue = parseFloat(po) || 0;
  const feValue = parseFloat(fe) || 0;
  const gsdValue = parseFloat(gsd) || 0;
  const nperValue = parseFloat(nper) || 0;
  
  return poValue * feValue * gsdValue * nperValue;
};

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
  { id: 6, norma: "NR10.6.1", descricao: "Os equipamentos, dispositivos e ferramentas que venham a ser utilizados em instalações elétricas devem ser destinados exclusivamente a esta finalidade?" },
  { id: 7, norma: "NR10.6.2", descricao: "Os equipamentos de proteção coletiva e individual devem ser utilizados nas atividades em instalações elétricas?" },
  { id: 8, norma: "NR10.7.1", descricao: "Os equipamentos e instalações elétricas devem ser dotados de dispositivos de desligamento de emergência?" },
  { id: 9, norma: "NR10.8.1", descricao: "É proibido o uso de adornos pessoais nos trabalhos com instalações elétricas ou em suas proximidades?" },
  { id: 10, norma: "NR10.9.1", descricao: "Os trabalhadores autorizados a trabalhar em instalações elétricas devem ter essa condição consignada no sistema de registro de empregado da empresa?" }
];

const painelEletricoItems: Omit<PainelEletricoItem, 'condicao' | 'observacao' | 'recomendacao' | 'medias' | 'selected'>[] = [
  { id: 1, norma: "NBR 5410", descricao: "O painel está identificado: Possui TAG, Etiqueta com nível de tensão, Advertência quanto aos riscos elétricos." },
  { id: 2, norma: "NBR 5410", descricao: "O painel possui chave para bloqueio elétrico?" },
  { id: 3, norma: "NR-10", descricao: "Existe sinalização restringindo o acesso a pessoas não autorizados?" },
  { id: 4, norma: "NBR 5410", descricao: "O painel esta protegido contra entrada de animais?" },
  { id: 5, norma: "NBR 5410", descricao: "O painel possui diagrama elétrico?" },
  { id: 6, norma: "NBR 5410", descricao: "Os condutores estão identificados conforme a norma?" },
  { id: 7, norma: "NBR 5410", descricao: "Existe proteção contra sobrecorrente adequada?" },
  { id: 8, norma: "NBR 5410", descricao: "O aterramento está adequado e funcional?" },
  { id: 9, norma: "NR-10", descricao: "Existe dispositivo de proteção diferencial residual?" },
  { id: 10, norma: "NBR 5410", descricao: "As conexões estão firmes e sem aquecimento?" }
];

export default function InspecaoEletrica() {
  const [currentView, setCurrentView] = useState<'home' | 'nova-inspecao' | 'inspecao' | 'checklist' | 'dashboard' | 'configuracoes' | 'relatorios' | 'gerenciar-imagens'>('home');
  const [inspecoes, setInspecoes] = useState<Inspecao[]>([]);
  const [currentInspecao, setCurrentInspecao] = useState<Inspecao | null>(null);
  const [currentArea, setCurrentArea] = useState<Area | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const [cameraOpen, setCameraOpen] = useState<{ itemId: number } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [localizacao, setLocalizacao] = useState<Localizacao | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [novaInspecao, setNovaInspecao] = useState({
    nome: '',
    numeroContrato: '',
    engenheiroResponsavel: '',
    responsavelCliente: '',
    data: new Date().toISOString().split('T')[0],
    logoCliente: ''
  });

  const [novaArea, setNovaArea] = useState('');
  const [showNovaAreaForm, setShowNovaAreaForm] = useState(false);
  const [tipoChecklistSelecionado, setTipoChecklistSelecionado] = useState<'subestacoes' | 'paineis'>('subestacoes');

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

  const [imagensPadrao, setImagensPadrao] = useState<ImagemPadraoItem[]>([
    { id: 1, norma: "NR10.3.9-d", descricao: "Identificação da subestação", imagemPadrao: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop&q=80", categoria: "Identificação", precisaImagem: true },
    { id: 2, norma: "NR10.4.1", descricao: "Prevenção de acidentes elétricos", imagemPadrao: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&q=80", categoria: "Segurança", precisaImagem: true },
    { id: 3, norma: "NR10.4.2", descricao: "Prevenção de incêndios", imagemPadrao: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop&q=80", categoria: "Prevenção", precisaImagem: true },
    { id: 4, norma: "NR10.4.3", descricao: "Prevenção de outros acidentes", imagemPadrao: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop&q=80", categoria: "Segurança", precisaImagem: false },
    { id: 5, norma: "NR10.5.1", descricao: "Condições seguras de funcionamento", imagemPadrao: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop&q=80", categoria: "Manutenção", precisaImagem: true }
  ]);

  const [configuracaoImagens, setConfiguracaoImagens] = useState<ConfiguracaoImagensPadrao>({
    itensSelecionados: [1, 2, 3, 5]
  });

  const [relatorios, setRelatorios] = useState<RelatorioItem[]>([
    { id: '1', nome: 'Relatório Inspeção - Cliente ABC', tipo: 'PDF', dataGeracao: '2024-01-15', status: 'Gerado', tamanho: '2.5 MB' },
    { id: '2', nome: 'Planilha HRN - Subestação Principal', tipo: 'Excel', dataGeracao: '2024-01-14', status: 'Gerado', tamanho: '1.2 MB' },
    { id: '3', nome: 'Relatório Técnico - Painel Geral', tipo: 'Word', dataGeracao: '2024-01-13', status: 'Processando', tamanho: '-' }
  ]);

  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalInspecoes: 0,
    inspecoesCompletas: 0,
    inspecoesPendentes: 0,
    hrnMedio: 0,
    itensNaoConformes: 0,
    areasInspecionadas: 0
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Em Andamento' | 'Concluída' | 'Pendente'>('all');

  // Atualizar estatísticas do dashboard
  useEffect(() => {
    const stats: DashboardStats = {
      totalInspecoes: inspecoes.length,
      inspecoesCompletas: inspecoes.filter(i => i.status === 'Concluída').length,
      inspecoesPendentes: inspecoes.filter(i => i.status === 'Pendente' || i.status === 'Em Andamento').length,
      hrnMedio: 0,
      itensNaoConformes: 0,
      areasInspecionadas: inspecoes.reduce((total, inspecao) => total + inspecao.areas.length, 0)
    };

    let totalHrn = 0;
    let totalItensNC = 0;
    let totalItensComHrn = 0;

    inspecoes.forEach(inspecao => {
      inspecao.areas.forEach(area => {
        area.items.forEach(item => {
          if (item.condicao === 'NC') {
            totalItensNC++;
            if (item.hrn && item.hrn > 0) {
              totalHrn += item.hrn;
              totalItensComHrn++;
            }
          }
        });
      });
    });

    stats.hrnMedio = totalItensComHrn > 0 ? totalHrn / totalItensComHrn : 0;
    stats.itensNaoConformes = totalItensNC;

    setDashboardStats(stats);
  }, [inspecoes]);

  const getDefaultImageForItem = (itemId: number): string => {
    const imagemPadrao = imagensPadrao.find(img => img.id === itemId);
    return imagemPadrao?.imagemPadrao || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop&q=80';
  };

  const obterLocalizacao = () => {
    setLoadingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocalização não é suportada neste navegador');
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const novaLocalizacao: Localizacao = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          precisao: position.coords.accuracy,
          timestamp: new Date().toISOString()
        };

        // Tentar obter endereço usando reverse geocoding (simulado)
        fetch(`https://api.opencagedata.com/geocode/v1/json?q=${position.coords.latitude}+${position.coords.longitude}&key=YOUR_API_KEY`)
          .then(response => response.json())
          .then(data => {
            if (data.results && data.results[0]) {
              novaLocalizacao.endereco = data.results[0].formatted;
            }
          })
          .catch(() => {
            // Se falhar, usar coordenadas como endereço
            novaLocalizacao.endereco = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
          })
          .finally(() => {
            setLocalizacao(novaLocalizacao);
            setLoadingLocation(false);
          });
      },
      (error) => {
        let errorMessage = 'Erro ao obter localização';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permissão de localização negada';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Localização indisponível';
            break;
          case error.TIMEOUT:
            errorMessage = 'Timeout ao obter localização';
            break;
        }
        setLocationError(errorMessage);
        setLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  const createNewInspecao = () => {
    if (!novaInspecao.nome || !novaInspecao.numeroContrato || !novaInspecao.engenheiroResponsavel || !novaInspecao.responsavelCliente) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const numeroSequencial = `PA-${new Date().getFullYear()}-${(inspecoes.length + 1).toString().padStart(4, '0')}`;

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

    alert(`Inspeção criada com sucesso!\nNúmero sequencial: ${numeroSequencial}`);
  };

  const addArea = () => {
    if (!novaArea.trim() || !currentInspecao) return;

    let checklistCompleto: ChecklistItem[] = [];
    let painelItems: PainelEletricoItem[] = [];

    if (tipoChecklistSelecionado === 'subestacoes') {
      checklistCompleto = checklistItems.map(item => ({
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
        selected: configuracaoImagens.itensSelecionados.includes(item.id),
        precisaImagem: imagensPadrao.find(img => img.id === item.id)?.precisaImagem || false,
        hrn: 0
      }));
    } else {
      painelItems = painelEletricoItems.map(item => ({
        id: item.id,
        norma: item.norma,
        descricao: item.descricao,
        condicao: '',
        observacao: '',
        recomendacao: '',
        medias: [],
        selected: true
      }));
    }

    const area: Area = {
      id: Date.now().toString(),
      nome: novaArea,
      items: checklistCompleto,
      painelItems: painelItems,
      tipoChecklist: tipoChecklistSelecionado,
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

    const areaAtualizada = updatedInspecao.areas.find(a => a.id === areaId);
    if (areaAtualizada) {
      areaAtualizada.hrnTotal = areaAtualizada.items.reduce((total, item) => total + (item.hrn || 0), 0);
    }

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'C': return 'bg-green-100 text-green-800';
      case 'NC': return 'bg-red-100 text-red-800';
      case 'NA': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredInspecoes = inspecoes.filter(inspecao => {
    const matchesSearch = inspecao.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inspecao.numeroSequencial.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inspecao.engenheiroResponsavel.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || inspecao.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const ProfessionalHeader = ({ title, subtitle, showCompanyInfo = true }: { title: string; subtitle?: string; showCompanyInfo?: boolean }) => (
    <div className="bg-white border-l-4 border-orange-500 shadow-lg">
      <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-lg flex items-center justify-center p-2">
              <img 
                src={configuracoes.empresa.logo} 
                alt="Logo PA BRASIL AUTOMAÇÃO" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold">{configuracoes.empresa.nome}</h1>
              <p className="text-blue-200 text-xs sm:text-sm">Automação e Consultoria Elétrica</p>
            </div>
          </div>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden text-white p-2"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          {showCompanyInfo && (
            <div className="hidden sm:block text-right text-sm text-blue-200">
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
                <span className="text-xs">{configuracoes.empresa.endereco}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-gray-50 px-4 sm:px-6 py-4 border-b">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          {subtitle && <p className="text-gray-600 text-sm sm:text-base">{subtitle}</p>}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-blue-900 text-white p-4 border-t border-blue-700">
          <div className="space-y-3">
            <button
              onClick={() => {
                setCurrentView('home');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 w-full text-left p-2 rounded hover:bg-blue-800"
            >
              <Home className="w-5 h-5" />
              <span>Início</span>
            </button>
            <button
              onClick={() => {
                setCurrentView('dashboard');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 w-full text-left p-2 rounded hover:bg-blue-800"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => {
                setCurrentView('relatorios');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 w-full text-left p-2 rounded hover:bg-blue-800"
            >
              <FileText className="w-5 h-5" />
              <span>Relatórios</span>
            </button>
            <button
              onClick={() => {
                setCurrentView('configuracoes');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 w-full text-left p-2 rounded hover:bg-blue-800"
            >
              <Settings className="w-5 h-5" />
              <span>Configurações</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const NumberedSection = ({ number, title, children }: { number: string; title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
        <div className="w-8 h-8 bg-blue-800 text-white rounded-full flex items-center justify-center text-sm font-bold">
          {number}
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }: { 
    icon: any; 
    title: string; 
    value: string | number; 
    subtitle?: string; 
    color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' 
  }) => {
    const colorClasses = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      red: 'from-red-500 to-red-600',
      yellow: 'from-yellow-500 to-yellow-600',
      purple: 'from-purple-500 to-purple-600'
    };

    return (
      <div className={`bg-gradient-to-r ${colorClasses[color]} text-white p-6 rounded-xl shadow-lg`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {subtitle && <p className="text-sm opacity-75 mt-1">{subtitle}</p>}
          </div>
          <Icon className="w-12 h-12 opacity-80" />
        </div>
      </div>
    );
  };

  if (currentView === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProfessionalHeader 
          title="DASHBOARD HRN - HIERARQUIA DE RISCO NUMÉRICO" 
          subtitle="Análise Completa de Riscos e Estatísticas de Inspeções"
        />

        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <div className="mb-6">
            <button
              onClick={() => setCurrentView('home')}
              className="flex items-center gap-2 text-blue-800 hover:text-blue-900 transition-colors font-medium"
            >
              <Home className="w-5 h-5" />
              Voltar ao Início
            </button>
          </div>

          <NumberedSection number="1" title="ESTATÍSTICAS GERAIS">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <StatCard
                icon={FileCheck}
                title="Total de Inspeções"
                value={dashboardStats.totalInspecoes}
                color="blue"
              />
              <StatCard
                icon={CheckCircle}
                title="Concluídas"
                value={dashboardStats.inspecoesCompletas}
                color="green"
              />
              <StatCard
                icon={Clock}
                title="Pendentes"
                value={dashboardStats.inspecoesPendentes}
                color="yellow"
              />
              <StatCard
                icon={AlertTriangle}
                title="Itens NC"
                value={dashboardStats.itensNaoConformes}
                color="red"
              />
              <StatCard
                icon={Layers}
                title="Áreas Inspecionadas"
                value={dashboardStats.areasInspecionadas}
                color="purple"
              />
              <StatCard
                icon={Gauge}
                title="HRN Médio"
                value={dashboardStats.hrnMedio.toFixed(2)}
                subtitle="Risco Médio"
                color="red"
              />
            </div>
          </NumberedSection>

          <NumberedSection number="2" title="ANÁLISE DE RISCOS POR INSPEÇÃO">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Inspeção</th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Áreas</th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Itens NC</th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">HRN Total</th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Classificação</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inspecoes.map(inspecao => {
                    const itensNC = inspecao.areas.reduce((total, area) => 
                      total + area.items.filter(item => item.condicao === 'NC').length, 0
                    );
                    const hrnTotal = inspecao.hrnTotalCliente || 0;
                    const hrnColor = getHRNColor(hrnTotal);

                    return (
                      <tr key={inspecao.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="font-semibold text-gray-900">{inspecao.nome}</div>
                          <div className="text-sm text-blue-600 font-mono">{inspecao.numeroSequencial}</div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            inspecao.status === 'Concluída' ? 'bg-green-100 text-green-800' :
                            inspecao.status === 'Em Andamento' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {inspecao.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center font-medium">
                          {inspecao.areas.length}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`px-2 py-1 rounded text-sm font-medium ${
                            itensNC > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {itensNC}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="text-lg font-bold text-gray-900">
                            {hrnTotal.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`px-3 py-2 rounded-lg text-sm font-bold ${hrnColor.bg} ${hrnColor.text}`}>
                            {hrnColor.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {inspecoes.length === 0 && (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Nenhuma inspeção para análise</p>
                <p className="text-gray-400">Crie inspeções para visualizar estatísticas</p>
              </div>
            )}
          </NumberedSection>

          <NumberedSection number="3" title="DISTRIBUIÇÃO DE RISCOS">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Classificação HRN
                </h4>
                <div className="space-y-3">
                  {[
                    { label: 'Aceitável (0-1)', color: 'bg-green-500', count: 0 },
                    { label: 'Muito Baixo (1-5)', color: 'bg-green-400', count: 0 },
                    { label: 'Baixo (5-10)', color: 'bg-yellow-400', count: 0 },
                    { label: 'Significante (10-50)', color: 'bg-yellow-500', count: 0 },
                    { label: 'Alto (50-100)', color: 'bg-red-400', count: 0 },
                    { label: 'Muito Alto (100-500)', color: 'bg-red-500', count: 0 },
                    { label: 'Extremo (500-1000)', color: 'bg-red-600', count: 0 },
                    { label: 'Inaceitável (>1000)', color: 'bg-red-700', count: 0 }
                  ].map((categoria, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded ${categoria.color}`}></div>
                        <span className="text-sm text-gray-700">{categoria.label}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{categoria.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Tendências
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white rounded border">
                    <div className="flex items-center gap-3">
                      <Activity className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-gray-700">Inspeções este mês</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">{inspecoes.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded border">
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-gray-700">Taxa de conformidade</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      {dashboardStats.itensNaoConformes === 0 ? '100%' : 
                       `${(100 - (dashboardStats.itensNaoConformes / (inspecoes.length * 10) * 100)).toFixed(1)}%`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded border">
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-purple-600" />
                      <span className="text-sm text-gray-700">Áreas inspecionadas</span>
                    </div>
                    <span className="text-lg font-bold text-purple-600">{dashboardStats.areasInspecionadas}</span>
                  </div>
                </div>
              </div>
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
          subtitle="Personalização e Ajustes Gerais da Plataforma"
        />

        <div className="max-w-6xl mx-auto p-4 sm:p-6">
          <div className="mb-6">
            <button
              onClick={() => setCurrentView('home')}
              className="flex items-center gap-2 text-blue-800 hover:text-blue-900 transition-colors font-medium"
            >
              <Home className="w-5 h-5" />
              Voltar ao Início
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <NumberedSection number="1" title="DADOS DA EMPRESA">
              <div className="space-y-4">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
                  <textarea
                    value={configuracoes.empresa.endereco}
                    onChange={(e) => setConfiguracoes(prev => ({
                      ...prev,
                      empresa: { ...prev.empresa, endereco: e.target.value }
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
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
                </div>
              </div>
            </NumberedSection>

            <NumberedSection number="2" title="CONFIGURAÇÕES DE RELATÓRIOS">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Incluir fotos nos relatórios</label>
                  <input
                    type="checkbox"
                    checked={configuracoes.relatorios.incluirFotos}
                    onChange={(e) => setConfiguracoes(prev => ({
                      ...prev,
                      relatorios: { ...prev.relatorios, incluirFotos: e.target.checked }
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Incluir comentários</label>
                  <input
                    type="checkbox"
                    checked={configuracoes.relatorios.incluirComentarios}
                    onChange={(e) => setConfiguracoes(prev => ({
                      ...prev,
                      relatorios: { ...prev.relatorios, incluirComentarios: e.target.checked }
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Marca d'água</label>
                  <input
                    type="checkbox"
                    checked={configuracoes.relatorios.marcaDagua}
                    onChange={(e) => setConfiguracoes(prev => ({
                      ...prev,
                      relatorios: { ...prev.relatorios, marcaDagua: e.target.checked }
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Formato padrão</label>
                  <select
                    value={configuracoes.relatorios.formatoPadrao}
                    onChange={(e) => setConfiguracoes(prev => ({
                      ...prev,
                      relatorios: { ...prev.relatorios, formatoPadrao: e.target.value as 'PDF' | 'Excel' | 'Word' }
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="PDF">PDF</option>
                    <option value="Excel">Excel</option>
                    <option value="Word">Word</option>
                  </select>
                </div>
              </div>
            </NumberedSection>

            <NumberedSection number="3" title="NOTIFICAÇÕES">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Email ao concluir inspeção</label>
                  <input
                    type="checkbox"
                    checked={configuracoes.notificacoes.emailInspecaoConcluida}
                    onChange={(e) => setConfiguracoes(prev => ({
                      ...prev,
                      notificacoes: { ...prev.notificacoes, emailInspecaoConcluida: e.target.checked }
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Alertas de prazos</label>
                  <input
                    type="checkbox"
                    checked={configuracoes.notificacoes.emailPrazosVencimento}
                    onChange={(e) => setConfiguracoes(prev => ({
                      ...prev,
                      notificacoes: { ...prev.notificacoes, emailPrazosVencimento: e.target.checked }
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Lembretes de manutenção</label>
                  <input
                    type="checkbox"
                    checked={configuracoes.notificacoes.lembreteManutencao}
                    onChange={(e) => setConfiguracoes(prev => ({
                      ...prev,
                      notificacoes: { ...prev.notificacoes, lembreteManutencao: e.target.checked }
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Alertas de não conformidade</label>
                  <input
                    type="checkbox"
                    checked={configuracoes.notificacoes.alertasNaoConformidade}
                    onChange={(e) => setConfiguracoes(prev => ({
                      ...prev,
                      notificacoes: { ...prev.notificacoes, alertasNaoConformidade: e.target.checked }
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
              </div>
            </NumberedSection>

            <NumberedSection number="4" title="SISTEMA">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tema</label>
                  <select
                    value={configuracoes.sistema.tema}
                    onChange={(e) => setConfiguracoes(prev => ({
                      ...prev,
                      sistema: { ...prev.sistema, tema: e.target.value as 'claro' | 'escuro' | 'auto' }
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="claro">Claro</option>
                    <option value="escuro">Escuro</option>
                    <option value="auto">Automático</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Qualidade das fotos</label>
                  <select
                    value={configuracoes.sistema.qualidadeFoto}
                    onChange={(e) => setConfiguracoes(prev => ({
                      ...prev,
                      sistema: { ...prev.sistema, qualidadeFoto: e.target.value as 'alta' | 'media' | 'baixa' }
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="alta">Alta</option>
                    <option value="media">Média</option>
                    <option value="baixa">Baixa</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Auto-salvar</label>
                  <input
                    type="checkbox"
                    checked={configuracoes.sistema.autoSalvar}
                    onChange={(e) => setConfiguracoes(prev => ({
                      ...prev,
                      sistema: { ...prev.sistema, autoSalvar: e.target.checked }
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Backup automático</label>
                  <input
                    type="checkbox"
                    checked={configuracoes.sistema.backupAutomatico}
                    onChange={(e) => setConfiguracoes(prev => ({
                      ...prev,
                      sistema: { ...prev.sistema, backupAutomatico: e.target.checked }
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
              </div>
            </NumberedSection>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => {
                alert('Configurações salvas com sucesso!');
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              Salvar Configurações
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'relatorios') {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProfessionalHeader 
          title="CENTRO DE RELATÓRIOS" 
          subtitle="Geração e Gerenciamento de Relatórios Técnicos"
        />

        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <div className="mb-6">
            <button
              onClick={() => setCurrentView('home')}
              className="flex items-center gap-2 text-blue-800 hover:text-blue-900 transition-colors font-medium"
            >
              <Home className="w-5 h-5" />
              Voltar ao Início
            </button>
          </div>

          <NumberedSection number="1" title="GERAR NOVO RELATÓRIO">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 shadow-lg">
                <FileText className="w-8 h-8 mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">Relatório PDF</h3>
                <p className="text-sm opacity-90">Relatório completo com fotos e análises</p>
              </button>

              <button className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg">
                <FileDown className="w-8 h-8 mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">Planilha Excel</h3>
                <p className="text-sm opacity-90">Dados estruturados para análise</p>
              </button>

              <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg">
                <Edit className="w-8 h-8 mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">Documento Word</h3>
                <p className="text-sm opacity-90">Relatório editável e personalizável</p>
              </button>
            </div>
          </NumberedSection>

          <NumberedSection number="2" title="RELATÓRIOS GERADOS">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Nome do Relatório</th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Tipo</th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Data</th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Tamanho</th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {relatorios.map(relatorio => (
                    <tr key={relatorio.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="font-semibold text-gray-900">{relatorio.nome}</div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          relatorio.tipo === 'PDF' ? 'bg-red-100 text-red-800' :
                          relatorio.tipo === 'Excel' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {relatorio.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center text-sm text-gray-600">
                        {new Date(relatorio.dataGeracao).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          relatorio.status === 'Gerado' ? 'bg-green-100 text-green-800' :
                          relatorio.status === 'Processando' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {relatorio.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center text-sm text-gray-600">
                        {relatorio.tamanho}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            className="bg-red-600 text-white p-2 rounded hover:bg-red-700 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </NumberedSection>

          <NumberedSection number="3" title="MODELOS DE RELATÓRIO">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                  <h4 className="text-lg font-semibold text-gray-900">Relatório NR-10</h4>
                </div>
                <p className="text-gray-600 text-sm mb-4">Relatório completo de conformidade com a Norma Regulamentadora NR-10</p>
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  Usar Modelo
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <Gauge className="w-8 h-8 text-red-600" />
                  <h4 className="text-lg font-semibold text-gray-900">Análise HRN</h4>
                </div>
                <p className="text-gray-600 text-sm mb-4">Relatório focado na Hierarquia de Risco Numérico e análise de riscos</p>
                <button className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors text-sm">
                  Usar Modelo
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <h4 className="text-lg font-semibold text-gray-900">Checklist Executivo</h4>
                </div>
                <p className="text-gray-600 text-sm mb-4">Resumo executivo com principais pontos de atenção e recomendações</p>
                <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                  Usar Modelo
                </button>
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
          subtitle="Configuração de Imagens de Referência para Itens de Inspeção"
        />

        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <div className="mb-6">
            <button
              onClick={() => setCurrentView('home')}
              className="flex items-center gap-2 text-blue-800 hover:text-blue-900 transition-colors font-medium"
            >
              <Home className="w-5 h-5" />
              Voltar ao Início
            </button>
          </div>

          <NumberedSection number="1" title="CONFIGURAÇÃO DE IMAGENS PADRÃO">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {imagensPadrao.map(imagem => (
                <div key={imagem.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-video bg-gray-100">
                    <img 
                      src={imagem.imagemPadrao} 
                      alt={imagem.descricao}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        {imagem.norma}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {imagem.categoria}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">{imagem.descricao}</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={configuracaoImagens.itensSelecionados.includes(imagem.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setConfiguracaoImagens(prev => ({
                                ...prev,
                                itensSelecionados: [...prev.itensSelecionados, imagem.id]
                              }));
                            } else {
                              setConfiguracaoImagens(prev => ({
                                ...prev,
                                itensSelecionados: prev.itensSelecionados.filter(id => id !== imagem.id)
                              }));
                            }
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label className="text-xs text-gray-600">Usar em novas áreas</label>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="text-blue-600 hover:text-blue-800 p-1">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-800 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {imagem.precisaImagem && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-orange-600">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Imagem obrigatória</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </NumberedSection>

          <NumberedSection number="2" title="ADICIONAR NOVA IMAGEM PADRÃO">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Norma</label>
                  <input
                    type="text"
                    placeholder="Ex: NR10.3.9-d"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Selecione uma categoria</option>
                    <option value="Identificação">Identificação</option>
                    <option value="Segurança">Segurança</option>
                    <option value="Prevenção">Prevenção</option>
                    <option value="Manutenção">Manutenção</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                  <textarea
                    placeholder="Descrição detalhada do item de inspeção"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL da Imagem</label>
                  <input
                    type="url"
                    placeholder="https://exemplo.com/imagem.jpg"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="text-sm text-gray-700">Imagem obrigatória para este item</label>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Adicionar Imagem
                </button>
              </div>
            </div>
          </NumberedSection>
        </div>
      </div>
    );
  }

  if (currentView === 'home') {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProfessionalHeader 
          title="SISTEMA DE INSPEÇÃO ELÉTRICA NR-10 COM HRN" 
          subtitle="Gestão Completa de Conformidade e Hierarquia de Risco Numérico"
        />

        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <NumberedSection number="1" title="MENU PRINCIPAL">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              <button
                onClick={() => setCurrentView('nova-inspecao')}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sm:p-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Plus className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-3" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">Nova Inspeção</h3>
                <p className="text-xs sm:text-sm opacity-90">Criar nova inspeção elétrica</p>
              </button>

              <button 
                onClick={() => setCurrentView('dashboard')}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 sm:p-6 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-3" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">Dashboard HRN</h3>
                <p className="text-xs sm:text-sm opacity-90">Análises e hierarquia de riscos</p>
              </button>

              <button 
                onClick={() => setCurrentView('relatorios')}
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 sm:p-6 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-3" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">Relatórios</h3>
                <p className="text-xs sm:text-sm opacity-90">Gerar e gerenciar relatórios</p>
              </button>

              <button 
                onClick={() => setCurrentView('configuracoes')}
                className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-4 sm:p-6 rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Settings className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-3" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">Configurações</h3>
                <p className="text-xs sm:text-sm opacity-90">Ajustes do sistema</p>
              </button>
            </div>
          </NumberedSection>

          <NumberedSection number="2" title="BUSCA E FILTROS">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar por nome, número sequencial ou engenheiro..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos os Status</option>
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Concluída">Concluída</option>
                  <option value="Pendente">Pendente</option>
                </select>
                <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>
          </NumberedSection>

          <NumberedSection number="3" title="INSPEÇÕES RECENTES">
            {filteredInspecoes.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  {searchTerm || filterStatus !== 'all' ? 'Nenhuma inspeção encontrada' : 'Nenhuma inspeção criada ainda'}
                </p>
                <p className="text-gray-400">
                  {searchTerm || filterStatus !== 'all' ? 'Tente ajustar os filtros de busca' : 'Clique em "Nova Inspeção" para começar'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-gray-800 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Inspeção</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Engenheiro</th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Áreas</th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">HRN Total</th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredInspecoes.map(inspecao => {
                      const hrnTotal = inspecao.hrnTotalCliente || 0;
                      const hrnColor = getHRNColor(hrnTotal);
                      
                      return (
                        <tr key={inspecao.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="font-semibold text-gray-900">{inspecao.nome}</div>
                            <div className="text-sm text-blue-600 font-mono">{inspecao.numeroSequencial}</div>
                            <div className="text-xs text-gray-500">{new Date(inspecao.data).toLocaleDateString('pt-BR')}</div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600">
                            {inspecao.engenheiroResponsavel}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              inspecao.status === 'Concluída' ? 'bg-green-100 text-green-800' :
                              inspecao.status === 'Em Andamento' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {inspecao.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center font-medium">
                            {inspecao.areas.length}
                          </td>
                          <td className="px-4 py-4 text-center">
                            {hrnTotal > 0 ? (
                              <div className={`px-3 py-2 rounded-lg text-sm font-bold ${hrnColor.bg} ${hrnColor.text}`}>
                                {hrnTotal.toFixed(2)}
                                <div className="text-xs font-normal mt-1">
                                  {hrnColor.label}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <button
                              onClick={() => {
                                setCurrentInspecao(inspecao);
                                setCurrentView('inspecao');
                              }}
                              className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors"
                              title="Visualizar Inspeção"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </NumberedSection>

          {dashboardStats.totalInspecoes > 0 && (
            <NumberedSection number="4" title="RESUMO ESTATÍSTICO">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{dashboardStats.totalInspecoes}</div>
                  <div className="text-sm text-blue-800">Total</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{dashboardStats.inspecoesCompletas}</div>
                  <div className="text-sm text-green-800">Concluídas</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-600">{dashboardStats.inspecoesPendentes}</div>
                  <div className="text-sm text-yellow-800">Pendentes</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600">{dashboardStats.itensNaoConformes}</div>
                  <div className="text-sm text-red-800">Itens NC</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">{dashboardStats.areasInspecionadas}</div>
                  <div className="text-sm text-purple-800">Áreas</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600">{dashboardStats.hrnMedio.toFixed(1)}</div>
                  <div className="text-sm text-orange-800">HRN Médio</div>
                </div>
              </div>
            </NumberedSection>
          )}
        </div>
      </div>
    );
  }

  if (currentView === 'nova-inspecao') {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProfessionalHeader 
          title="NOVA INSPEÇÃO ELÉTRICA" 
          subtitle="Cadastro de Nova Inspeção - Formulário de Dados Iniciais"
        />

        <div className="max-w-4xl mx-auto p-4 sm:p-6">
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
                  Logo do Cliente (Opcional)
                </label>
                <input
                  type="url"
                  value={novaInspecao.logoCliente}
                  onChange={(e) => setNovaInspecao(prev => ({ ...prev, logoCliente: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://exemplo.com/logo.png"
                />
              </div>
            </div>
          </NumberedSection>

          <NumberedSection number="2" title="LOCALIZAÇÃO (OPCIONAL)">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Capturar Localização GPS</h4>
                  <p className="text-sm text-gray-600">Adicione a localização exata da inspeção</p>
                </div>
                <button
                  onClick={obterLocalizacao}
                  disabled={loadingLocation}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loadingLocation ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Obtendo...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4" />
                      Obter Localização
                    </>
                  )}
                </button>
              </div>

              {localizacao && (
                <div className="bg-white p-4 rounded border">
                  <div className="flex items-center gap-2 text-green-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">Localização capturada</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>Latitude: {localizacao.latitude.toFixed(6)}</div>
                    <div>Longitude: {localizacao.longitude.toFixed(6)}</div>
                    {localizacao.endereco && <div>Endereço: {localizacao.endereco}</div>}
                    {localizacao.precisao && <div>Precisão: {localizacao.precisao.toFixed(0)}m</div>}
                  </div>
                </div>
              )}

              {locationError && (
                <div className="bg-red-50 border border-red-200 p-4 rounded">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-medium">Erro ao obter localização</span>
                  </div>
                  <div className="text-sm text-red-600 mt-1">{locationError}</div>
                </div>
              )}
            </div>
          </NumberedSection>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setCurrentView('home')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={createNewInspecao}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Criar Inspeção
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'inspecao' && currentInspecao) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentView('home')}
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <Home className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{currentInspecao.nome}</h1>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                    <span>Contrato: {currentInspecao.numeroContrato}</span>
                    <span>Responsável: {currentInspecao.engenheiroResponsavel}</span>
                    <span className="font-medium text-blue-600">{currentInspecao.numeroSequencial}</span>
                  </div>
                </div>
              </div>
              
              {currentInspecao.hrnTotalCliente && currentInspecao.hrnTotalCliente > 0 && (
                <div className="text-center">
                  <div className="text-sm text-gray-600">HRN Total do Cliente</div>
                  <div className={`px-4 py-2 rounded-lg text-lg font-bold ${getHRNColor(currentInspecao.hrnTotalCliente).bg} ${getHRNColor(currentInspecao.hrnTotalCliente).text}`}>
                    {currentInspecao.hrnTotalCliente.toFixed(2)}
                    <div className="text-sm font-normal">
                      {getHRNColor(currentInspecao.hrnTotalCliente).label}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
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
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Checklist</label>
                  <select
                    value={tipoChecklistSelecionado}
                    onChange={(e) => setTipoChecklistSelecionado(e.target.value as 'subestacoes' | 'paineis')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="subestacoes">Subestações (com HRN)</option>
                    <option value="paineis">Painéis Elétricos</option>
                  </select>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
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
              {currentInspecao.areas.map(area => (
                <div key={area.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{area.nome}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      area.tipoChecklist === 'subestacoes' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {area.tipoChecklist === 'subestacoes' ? 'Subestação' : 'Painel'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    <div>Total: {area.tipoChecklist === 'subestacoes' ? area.items.length : area.painelItems?.length || 0} itens</div>
                    {area.tipoChecklist === 'subestacoes' && area.hrnTotal && area.hrnTotal > 0 && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">HRN da Área:</span>
                        <div className={`inline-block ml-2 px-2 py-1 rounded text-xs font-bold ${getHRNColor(area.hrnTotal).bg} ${getHRNColor(area.hrnTotal).text}`}>
                          {area.hrnTotal.toFixed(2)}
                        </div>
                      </div>
                    )}
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
              ))}
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

  if (currentView === 'checklist' && currentArea && currentInspecao) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentView('inspecao')}
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <List className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {currentArea.nome} - {currentInspecao.nome}
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {currentArea.tipoChecklist === 'subestacoes' ? 'Checklist com HRN' : 'Checklist de Painéis'} - {currentArea.tipoChecklist === 'subestacoes' ? currentArea.items.length : currentArea.painelItems?.length || 0} itens
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              {currentArea.tipoChecklist === 'subestacoes' ? (
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
              ) : (
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-800 text-white sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Item</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Norma</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Descrição</th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Condição</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Observação</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Recomendação</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentArea.painelItems?.map((item, index) => (
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
                            placeholder="Observações sobre o item..."
                            className="w-full min-w-[200px] px-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={2}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <textarea
                            value={item.recomendacao}
                            onChange={(e) => updatePainelItem(currentArea.id, item.id, 'recomendacao', e.target.value)}
                            placeholder="Recomendações técnicas..."
                            className="w-full min-w-[200px] px-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={2}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}