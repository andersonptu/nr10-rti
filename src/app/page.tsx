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
  BarChart, LineChart, Gauge, Thermometer, Battery, Power, Wifi, Signal, Link, WifiOff,
  ChevronLeft, ChevronRight, Brain, Sparkles
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
  preRecomendacao?: string;
  analiseIA?: string;
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

const checklistItems: Omit<ChecklistItem, 'condicao' | 'po' | 'fe' | 'gsd' | 'nper' | 'recomendacoes' | 'imagemPadrao' | 'medias' | 'selected' | 'precisaImagem' | 'hrn' | 'preRecomendacao' | 'analiseIA'>[] = [
  { id: 1, norma: "NR10.3.9-d", descricao: "A sala ou subestação está identificada? Item 10.10.1-c – NR-10" },
  { id: 2, norma: "NR10.4.1", descricao: "As instalações elétricas devem ser projetadas e executadas de modo que seja possível prevenir acidentes e outras ocorrências originadas por choque elétrico?" },
  { id: 3, norma: "NR10.4.2", descricao: "As instalações elétricas devem ser projetadas e executadas de modo que seja possível prevenir incêndios e explosões?" },
  { id: 4, norma: "NR10.4.3", descricao: "As instalações elétricas devem ser projetadas e executadas de modo que seja possível prevenir outros tipos de acidentes?" },
  { id: 5, norma: "NR10.5.1", descricao: "As instalações elétricas devem ser mantidas em condições seguras de funcionamento?" },
  { id: 6, norma: "NR10.6.1", descricao: "Os equipamentos, dispositivos e ferramentas que venham a ser utilizados em instalações elétricas devem ser destinados exclusivamente a esta finalidade?" },
  { id: 7, norma: "NR10.6.2", descricao: "Os equipamentos de proteção coletiva e individual devem ser utilizados nas atividades em instalações elétricas?" },
  { id: 8, norma: "NR10.7.1", descricao: "Os equipamentos e instalações elétricas devem ser dotados de dispositivos de desligamento de emergência?" },
  { id: 9, norma: "NR10.8.1", descricao: "É proibido o uso de adornos pessoais nos trabalhos com instalações elétricas ou em suas proximidades?" },
  { id: 10, norma: "NR10.9.1", descricao: "Os trabalhadores autorizados a trabalhar em instalações elétricas devem ter essa condição consignada no sistema de registro de empregado da empresa?" },
  { id: 11, norma: "NR10.10.1-a", descricao: "Apenas pessoas qualificadas, habilitadas, capacitadas e autorizadas podem trabalhar em instalações elétricas?" },
  { id: 12, norma: "NR10.10.1-b", descricao: "É assegurada a realização de serviços em instalações elétricas por pessoa qualificada e com anuência formal da empresa?" },
  { id: 13, norma: "NR10.10.1-c", descricao: "A empresa deve manter esquemas unifilares atualizados das instalações elétricas dos seus estabelecimentos com as especificações do sistema de aterramento e demais equipamentos e dispositivos de proteção?" },
  { id: 14, norma: "NR10.10.1-d", descricao: "Os estabelecimentos com carga instalada superior a 75 kW devem constituir e manter o Prontuário de Instalações Elétricas?" },
  { id: 15, norma: "NR10.10.2-a", descricao: "As empresas estão obrigadas a manter esquemas unifilares atualizados das instalações elétricas dos seus estabelecimentos com as especificações do sistema de aterramento e demais equipamentos e dispositivos de proteção?" },
  { id: 16, norma: "NR10.10.2-b", descricao: "As empresas devem possuir especificações dos equipamentos de proteção coletiva e individual e o ferramental, aplicáveis conforme determina esta NR?" },
  { id: 17, norma: "NR10.10.2-c", descricao: "As empresas devem possuir documentação das inspeções e medições do sistema de proteção contra descargas atmosféricas e aterramentos elétricos?" },
  { id: 18, norma: "NR10.10.2-d", descricao: "As empresas devem possuir especificação dos equipamentos de proteção coletiva e individual e o ferramental, aplicáveis conforme determina esta NR?" },
  { id: 19, norma: "NR10.10.2-e", descricao: "As empresas devem possuir documentação comprobatória da qualificação, habilitação, capacitação, autorização dos trabalhadores e dos treinamentos realizados?" },
  { id: 20, norma: "NR10.10.2-f", descricao: "As empresas devem possuir resultados dos testes de isolação elétrica realizados em equipamentos de proteção individual e coletiva?" },
  { id: 21, norma: "NR10.10.2-g", descricao: "As empresas devem possuir certificações dos equipamentos e materiais elétricos em áreas classificadas?" },
  { id: 22, norma: "NR10.10.2-h", descricao: "As empresas devem possuir relatório técnico das inspeções atualizadas com recomendações, cronogramas de adequações, contemplando as alíneas de 'a' a 'f'?" },
  { id: 23, norma: "NR10.11.1", descricao: "Os trabalhadores autorizados a trabalhar em instalações elétricas devem ter essa condição consignada no sistema de registro de empregado da empresa?" },
  { id: 24, norma: "NR10.11.2", descricao: "Os trabalhadores autorizados a trabalhar em instalações elétricas devem possuir treinamento específico sobre os riscos decorrentes do emprego da energia elétrica e as principais medidas de prevenção de acidentes em instalações elétricas?" },
  { id: 25, norma: "NR10.11.3", descricao: "É assegurada a realização de serviços em instalações elétricas somente por trabalhador qualificado ou capacitado e autorizado?" },
  { id: 26, norma: "NR10.11.4", descricao: "Os trabalhadores autorizados a intervir em instalações elétricas devem ser submetidos à exame de saúde compatível com as atividades a serem desenvolvidas?" },
  { id: 27, norma: "NR10.11.5", descricao: "Os trabalhadores autorizados a trabalhar em instalações elétricas devem possuir treinamento específico na forma estabelecida no Anexo II desta NR?" },
  { id: 28, norma: "NR10.11.6", descricao: "A empresa deve realizar treinamento de reciclagem bienal e sempre que ocorrer alguma das situações a seguir: troca de função ou mudança de empresa; retorno de afastamento ao trabalho ou inatividade, por período superior a três meses; modificações significativas nas instalações elétricas ou troca de métodos, processos e organização do trabalho?" },
  { id: 29, norma: "NR10.11.7", descricao: "Os trabalhos em áreas classificadas devem ser precedidos de treinamento específico de acordo com risco envolvido?" },
  { id: 30, norma: "NR10.11.8", descricao: "Os trabalhadores com atividades não relacionadas às instalações elétricas desenvolvidas em zona livre e na vizinhança da zona controlada devem ser instruídos formalmente com conhecimentos que permitam identificar e avaliar seus possíveis riscos e adotar as precauções cabíveis?" },
  { id: 31, norma: "NR10.12.1", descricao: "Em todos os serviços executados em instalações elétricas devem ser previstas e adotadas, prioritariamente, medidas de proteção coletiva aplicáveis, mediante procedimentos, às atividades a serem desenvolvidas?" },
  { id: 32, norma: "NR10.12.2", descricao: "Medidas de proteção individual podem ser adotadas isoladamente quando as medidas de proteção coletiva forem tecnicamente inviáveis ou insuficientes para controlar os riscos?" },
  { id: 33, norma: "NR10.12.3", descricao: "É vedado o uso de adornos pessoais nos trabalhos com instalações elétricas ou em suas proximidades?" },
  { id: 34, norma: "NR10.13.1", descricao: "As vestimentas de trabalho devem ser adequadas às atividades, devendo contemplar a condutibilidade, inflamabilidade e influências eletromagnéticas?" },
  { id: 35, norma: "NR10.13.2", descricao: "É vedado o uso de vestimentas condutoras de eletricidade, salvo na execução de métodos de trabalho que a exijam?" },
  { id: 36, norma: "NR10.13.3", descricao: "As vestimentas de trabalho, de acordo com as atividades executadas, podem ser dotadas de proteção contra os efeitos térmicos do arco elétrico?" },
  { id: 37, norma: "NR10.14.1", descricao: "Os equipamentos de proteção coletiva - EPC destinados à proteção de trabalhadores durante os serviços em instalações elétricas devem atender ao disposto nas NR-06 e NR-18?" },
  { id: 38, norma: "NR10.14.2", descricao: "Os equipamentos de proteção individual - EPI devem atender às disposições contidas na NR-06?" },
  { id: 39, norma: "NR10.14.3", descricao: "As vestimentas de trabalho devem atender ao disposto no subitem 10.2.8.2 e possuir características de proteção compatíveis com as atividades executadas?" },
  { id: 40, norma: "NR10.14.4", descricao: "É vedado o uso de EPC e EPI danificados ou com defeitos?" },
  { id: 41, norma: "NR10.14.5", descricao: "Os EPC e os EPI devem ser submetidos a inspeções e ensaios periódicos, de acordo com as regulamentações existentes ou recomendações dos fabricantes?" },
  { id: 42, norma: "NR10.14.6", descricao: "O fornecimento de EPC, EPI adequados ao risco e em perfeito estado de conservação e funcionamento é de responsabilidade da empresa?" },
  { id: 43, norma: "NR10.15.1", descricao: "As intervenções em instalações elétricas com tensão igual ou superior a 50 Volts em corrente alternada ou superior a 120 Volts em corrente contínua somente podem ser realizadas por trabalhadores que atendam ao que estabelece o item 10.8 desta Norma?" },
  { id: 44, norma: "NR10.15.2", descricao: "Os trabalhadores de que trata o item anterior devem receber treinamento de segurança para trabalhos com instalações elétricas energizadas, com currículo mínimo, carga horária e demais determinações estabelecidas no Anexo II desta NR?" },
  { id: 45, norma: "NR10.15.3", descricao: "As operações elementares como ligar e desligar circuitos elétricos, realizadas em baixa tensão, com materiais e equipamentos elétricos em perfeito estado de conservação, adequados para operação, podem ser realizadas por qualquer pessoa não advertida?" },
  { id: 46, norma: "NR10.15.4", descricao: "As operações elementares como ligar e desligar circuitos elétricos realizadas em instalações elétricas energizadas com tensão igual ou superior a 50 Volts em corrente alternada ou superior a 120 Volts em corrente contínua, somente podem ser realizadas por trabalhadores capacitados ou qualificados?" },
  { id: 47, norma: "NR10.15.5", descricao: "Os serviços em instalações energizadas, ou em suas proximidades devem ser suspensos de imediato na iminência de ocorrência que possa colocar os trabalhadores em perigo?" },
  { id: 48, norma: "NR10.15.6", descricao: "Quando da realização de trabalhos que envolvam o ingresso na zona controlada, conforme Anexo I, outros trabalhadores não envolvidos diretamente com o serviço devem ser afastados ou isolados da zona de risco?" },
  { id: 49, norma: "NR10.15.7", descricao: "Sempre que inovações tecnológicas forem implementadas ou para a entrada em operações de novas instalações ou equipamentos elétricos devem ser previamente elaboradas análises de risco, desenvolvidas com circuitos desenergizados, e respectivos procedimentos de trabalho?" },
  { id: 50, norma: "NR10.15.8", descricao: "O responsável pela execução do serviço deve suspender as atividades quando verificar situações ou condições de risco não previstas, cuja eliminação ou neutralização imediata não seja possível?" },
  { id: 51, norma: "NR10.16.1", descricao: "Os serviços em instalações elétricas desenergizadas devem seguir essa sequência obrigatória: seccionamento; impedimento de reenergização; constatação da ausência de tensão; instalação de aterramento temporário com equipotencialização dos condutores dos circuitos; proteção dos elementos energizados existentes na zona controlada; instalação da sinalização de impedimento de reenergização?" },
  { id: 52, norma: "NR10.16.2", descricao: "O estado de instalação desenergizada deve ser mantido até a autorização para reenergização, devendo ser reenergizada respeitando a sequência de procedimentos abaixo: retirada das ferramentas, utensílios e equipamentos; retirada da zona controlada de todos os trabalhadores não envolvidos no processo de reenergização; remoção da sinalização de impedimento de reenergização; remoção do aterramento temporário, da equipotencialização e das proteções adicionais; remoção do impedimento de reenergização; energização?" },
  { id: 53, norma: "NR10.16.3", descricao: "As medidas constantes das alíneas apresentadas nos itens 10.5.1 e 10.5.2 podem ser alteradas, substituídas, ampliadas ou eliminadas, em função das peculiaridades de cada situação, por profissional legalmente habilitado, autorizado e mediante justificativa técnica previamente formalizada, desde que seja mantido o mesmo nível de segurança originalmente preconizado?" },
  { id: 54, norma: "NR10.16.4", descricao: "Os serviços a serem executados em instalações elétricas desligadas, mas com possibilidade de energização, por qualquer meio ou razão, devem atender ao que estabelece o item 10.6?" },
  { id: 55, norma: "NR10.17.1", descricao: "Todo trabalho em instalações elétricas energizadas em AT, bem como aqueles executados no Sistema Elétrico de Potência - SEP, devem ser realizados mediante ordem de serviço específica para data e local, assinada por superior responsável pela área?" },
  { id: 56, norma: "NR10.17.2", descricao: "Antes de iniciar trabalhos em circuitos energizados em AT, o superior imediato e a equipe, responsáveis pela execução do serviço, devem realizar uma avaliação prévia, estudar e planejar as atividades e ações a serem desenvolvidas de forma a atender os princípios técnicos básicos e as melhores técnicas de segurança em eletricidade aplicáveis ao serviço?" },
  { id: 57, norma: "NR10.17.3", descricao: "Os serviços em instalações elétricas energizadas em AT somente podem ser realizados quando houver procedimentos específicos, detalhados e assinados por profissional autorizado?" },
  { id: 58, norma: "NR10.17.4", descricao: "A intervenção em instalações elétricas energizadas em AT dentro dos limites estabelecidos como zonas controladas e de risco, conforme Anexo I, somente pode ser realizada mediante a desativação, também conhecida como bloqueio, dos dispositivos automáticos de religamento?" },
  { id: 59, norma: "NR10.17.5", descricao: "Os equipamentos e dispositivos desativados devem ser sinalizados com identificação da condição de desativação, conforme procedimento de trabalho específico padronizado?" },
  { id: 60, norma: "NR10.17.6", descricao: "Os equipamentos, ferramentas e dispositivos isolantes ou equipados com materiais isolantes, destinados ao trabalho em alta tensão, devem ser submetidos a testes elétricos ou ensaios de laboratório periódicos, obedecendo-se as especificações do fabricante, os procedimentos da empresa e na ausência desses, anualmente?" },
  { id: 61, norma: "NR10.17.7", descricao: "Todo trabalhador em instalações elétricas energizadas em AT, bem como aqueles envolvidos em atividades no SEP devem dispor de equipamento que permita a comunicação permanente com os demais membros da equipe ou com o centro de operação durante a realização do serviço?" },
  { id: 62, norma: "NR10.18.1", descricao: "Os trabalhadores que intervenham em instalações elétricas energizadas com alta tensão, que exerçam suas atividades dentro dos limites estabelecidos no Anexo I, zonas de risco e controlada, devem atender ao disposto no item 10.8 desta NR?" },
  { id: 63, norma: "NR10.18.2", descricao: "Os trabalhadores de que trata o item 10.7.1 devem receber treinamento de segurança, específico em segurança no Sistema Elétrico de Potência (SEP) e em suas proximidades, com currículo mínimo, carga horária e demais determinações estabelecidas no Anexo II desta NR?" },
  { id: 64, norma: "NR10.18.3", descricao: "Os serviços em instalações elétricas energizadas em AT, ou em suas proximidades, devem ser suspensos de imediato na iminência de ocorrência que possa colocar os trabalhadores em perigo?" },
  { id: 65, norma: "NR10.18.4", descricao: "Sempre que inovações tecnológicas forem implementadas ou para a entrada em operações de novas instalações ou equipamentos elétricos devem ser previamente elaboradas análises de risco, desenvolvidas com circuitos desenergizados, e respectivos procedimentos de trabalho?" },
  { id: 66, norma: "NR10.18.5", descricao: "O responsável pela execução do serviço deve suspender as atividades quando verificar situações ou condições de risco não previstas, cuja eliminação ou neutralização imediata não seja possível?" },
  { id: 67, norma: "NR10.19.1", descricao: "Os procedimentos de trabalho devem conter, no mínimo, objetivo, campo de aplicação, base técnica, competências e responsabilidades, disposições gerais, medidas de controle e orientações finais?" },
  { id: 68, norma: "NR10.19.2", descricao: "Os serviços em instalações elétricas devem ser precedidos de ordens de serviço especificas, aprovadas por trabalhador autorizado, contendo, no mínimo: tipo, data, local e referências; serviços a serem executados; condições especiais; instruções especiais; definição de área e ponto de trabalho; relação de equipe e respectivas funções; os riscos que poderão advir da execução do serviço e as medidas de proteção aplicáveis; instruções para emergências; responsável(is) pela(s) área(s) onde será(ão) executado(s) o(s) serviço(s)?" },
  { id: 69, norma: "NR10.19.3", descricao: "Os procedimentos de trabalho, o treinamento de trabalhadores e a autorização referida no item 10.8 devem ter a participação em todo processo de desenvolvimento do Serviço Especializado de Engenharia de Segurança e Medicina do Trabalho - SESMT, quando houver?" },
  { id: 70, norma: "NR10.19.4", descricao: "A autorização referida no item 10.8 deve estar em conformidade com o treinamento ministrado, previsto no Anexo II desta NR?" },
  { id: 71, norma: "NR10.19.5", descricao: "Toda equipe deverá ter um de seus trabalhadores indicado e em condições de exercer a supervisão e condução dos trabalhos?" },
  { id: 72, norma: "NR10.19.6", descricao: "Antes de iniciar trabalhos em equipe os trabalhadores, em conjunto com o responsável pela execução do serviço, devem realizar uma avaliação prévia, estudar e planejar as atividades e ações a serem desenvolvidas no local, de forma a atender os princípios técnicos básicos e as melhores técnicas de segurança aplicáveis ao serviço?" },
  { id: 73, norma: "NR10.19.7", descricao: "A alternância de atividades deve considerar a análise de riscos das tarefas e a competência dos trabalhadores envolvidos, de forma a garantir a segurança e a saúde no trabalho?" },
  { id: 74, norma: "NR10.20.1", descricao: "As empresas que operam em instalações ou equipamentos integrantes do sistema elétrico de potência devem constituir prontuário com o conteúdo do item 10.2.3 e acrescentar ao prontuário os documentos a seguir listados: descrição dos procedimentos para emergências; certificações dos equipamentos de proteção coletiva e individual?" },
  { id: 75, norma: "NR10.20.2", descricao: "As empresas que realizam trabalhos em proximidade do Sistema Elétrico de Potência devem constituir prontuário contemplando as alíneas 'a', 'c', 'd' e 'e', do item 10.2.4 desta NR?" }
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
  const [currentView, setCurrentView] = useState<'home' | 'nova-inspecao' | 'inspecao' | 'checklist' | 'dashboard' | 'configuracoes' | 'relatorios' | 'gerenciar-imagens' | 'editor-imagens'>('home');
  const [inspecoes, setInspecoes] = useState<Inspecao[]>([]);
  const [currentInspecao, setCurrentInspecao] = useState<Inspecao | null>(null);
  const [currentArea, setCurrentArea] = useState<Area | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const [cameraOpen, setCameraOpen] = useState<{ itemId: number; type: 'image' | 'video' } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  // Estados para paginação do checklist
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [analisandoImagem, setAnalisandoImagem] = useState(false);

  // Estados para sistema de salvamento automático
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [pendingSyncData, setPendingSyncData] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

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

  // Estados para foto do cliente
  const [fotoClienteMetodo, setFotoClienteMetodo] = useState<'link' | 'upload'>('link');
  const [fotoClienteLink, setFotoClienteLink] = useState('');
  const [fotoClienteFile, setFotoClienteFile] = useState<File | null>(null);
  const [fotoClientePreview, setFotoClientePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Estados para editor de imagens padrão
  const [editingImageId, setEditingImageId] = useState<number | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Função para analisar imagem com IA
  const analisarImagemComIA = async (imagemUrl: string, item: ChecklistItem) => {
    setAnalisandoImagem(true);
    try {
      // Simular análise de IA (em produção, seria uma chamada para API de IA)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Análise simulada baseada no item
      let analise = '';
      let preRecomendacao = '';
      
      if (item.norma.includes('10.3.9')) {
        analise = 'Identificação da subestação detectada. Placa de identificação visível com informações de tensão e responsável.';
        preRecomendacao = 'Verificar se todas as informações obrigatórias estão presentes na placa de identificação conforme NR-10.';
      } else if (item.norma.includes('10.4.1')) {
        analise = 'Equipamentos de proteção contra choque elétrico identificados. Barreiras físicas e isolamentos aparentemente adequados.';
        preRecomendacao = 'Realizar testes de isolamento e verificar integridade das barreiras de proteção.';
      } else if (item.norma.includes('10.4.2')) {
        analise = 'Sistema de prevenção contra incêndios observado. Extintores e detectores de fumaça presentes.';
        preRecomendacao = 'Verificar validade dos extintores e funcionamento dos detectores de fumaça.';
      } else {
        analise = 'Análise visual realizada. Equipamentos e instalações aparentam estar em conformidade básica.';
        preRecomendacao = 'Realizar inspeção detalhada conforme procedimentos técnicos específicos da norma.';
      }

      // Atualizar o item com a análise
      updateItem(currentArea!.id, item.id, 'analiseIA', analise);
      updateItem(currentArea!.id, item.id, 'preRecomendacao', preRecomendacao);
      
    } catch (error) {
      console.error('Erro na análise de IA:', error);
    } finally {
      setAnalisandoImagem(false);
    }
  };

  // Funções do sistema de salvamento automático
  const saveToLocalStorage = (data: any, key: string) => {
    try {
      const timestamp = new Date().toISOString();
      const dataWithTimestamp = { ...data, lastSaved: timestamp };
      localStorage.setItem(key, JSON.stringify(dataWithTimestamp));
      console.log(`Dados salvos localmente: ${key}`);
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
  };

  const loadFromLocalStorage = (key: string) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erro ao carregar do localStorage:', error);
      return null;
    }
  };

  const syncToCloud = async (data: any) => {
    if (!isOnline) {
      // Adicionar à fila de sincronização
      setPendingSyncData(prev => [...prev, { data, timestamp: new Date().toISOString() }]);
      return;
    }

    try {
      setIsSaving(true);
      setSaveStatus('saving');
      
      // Simular chamada para API/nuvem
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Dados sincronizados com a nuvem:', data);
      setSaveStatus('saved');
      setLastSaveTime(new Date());
      
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Erro ao sincronizar com a nuvem:', error);
      setSaveStatus('error');
      // Adicionar à fila para tentar novamente
      setPendingSyncData(prev => [...prev, { data, timestamp: new Date().toISOString() }]);
    } finally {
      setIsSaving(false);
    }
  };

  const startAutoSave = () => {
    if (autoSaveTimer) {
      clearInterval(autoSaveTimer);
    }

    const timer = setInterval(() => {
      if (currentInspecao && currentView === 'checklist') {
        // Salvar dados da inspeção atual
        const dataToSave = {
          inspecao: currentInspecao,
          area: currentArea,
          timestamp: new Date().toISOString()
        };

        // Salvar localmente primeiro
        saveToLocalStorage(dataToSave, `inspecao_${currentInspecao.id}`);
        
        // Tentar sincronizar com a nuvem
        syncToCloud(dataToSave);
      }
    }, 60000); // 1 minuto

    setAutoSaveTimer(timer);
  };

  const stopAutoSave = () => {
    if (autoSaveTimer) {
      clearInterval(autoSaveTimer);
      setAutoSaveTimer(null);
    }
  };

  const processPendingSync = async () => {
    if (!isOnline || pendingSyncData.length === 0) return;

    console.log(`Processando ${pendingSyncData.length} itens pendentes de sincronização...`);
    
    for (const item of pendingSyncData) {
      try {
        await syncToCloud(item.data);
      } catch (error) {
        console.error('Erro ao processar item pendente:', error);
        break; // Para na primeira falha para não sobrecarregar
      }
    }
    
    // Limpar itens processados com sucesso
    setPendingSyncData([]);
  };

  // Monitorar status online/offline
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('Conexão restaurada - processando sincronização pendente');
      processPendingSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('Conexão perdida - salvamento apenas local');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingSyncData]);

  // Iniciar auto-save quando entrar no checklist
  useEffect(() => {
    if (currentView === 'checklist' && currentInspecao) {
      startAutoSave();
      console.log('Auto-save iniciado para inspeção:', currentInspecao.nome);
    } else {
      stopAutoSave();
    }

    return () => stopAutoSave();
  }, [currentView, currentInspecao]);

  // Carregar dados salvos ao inicializar
  useEffect(() => {
    const savedInspecoes = loadFromLocalStorage('inspecoes');
    if (savedInspecoes && savedInspecoes.data) {
      setInspecoes(savedInspecoes.data);
      console.log('Inspeções carregadas do localStorage');
    }
  }, []);

  // Salvar inspeções sempre que houver mudanças
  useEffect(() => {
    if (inspecoes.length > 0) {
      saveToLocalStorage(inspecoes, 'inspecoes');
    }
  }, [inspecoes]);

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

  // Funções para foto do cliente
  const handleFotoClienteFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFotoClienteFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFotoClientePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFotoClienteLinkChange = (link: string) => {
    setFotoClienteLink(link);
    if (link) {
      setFotoClientePreview(link);
    } else {
      setFotoClientePreview(null);
    }
  };

  const removeFotoCliente = () => {
    setFotoClienteFile(null);
    setFotoClienteLink('');
    setFotoClientePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Funções para editor de imagens padrão
  const editarImagemPadrao = (itemId: number) => {
    const item = imagensPadrao.find(img => img.id === itemId);
    if (item) {
      setEditingImageId(itemId);
      setNewImageUrl(item.imagemPadrao);
      setCurrentView('editor-imagens');
    }
  };

  const salvarImagemPadrao = () => {
    if (editingImageId && newImageUrl) {
      setImagensPadrao(prev => prev.map(img => 
        img.id === editingImageId 
          ? { ...img, imagemPadrao: newImageUrl }
          : img
      ));
      
      // Atualizar também nos itens existentes das inspeções
      setInspecoes(prev => prev.map(inspecao => ({
        ...inspecao,
        areas: inspecao.areas.map(area => ({
          ...area,
          items: area.items.map(item => 
            item.id === editingImageId 
              ? { ...item, imagemPadrao: newImageUrl }
              : item
          )
        }))
      })));

      alert('Imagem padrão atualizada com sucesso!');
      setCurrentView('gerenciar-imagens');
      setEditingImageId(null);
      setNewImageUrl('');
    }
  };

  const removerImagemPadrao = (itemId: number) => {
    if (confirm('Tem certeza que deseja remover a imagem padrão deste item?')) {
      setImagensPadrao(prev => prev.map(img => 
        img.id === itemId 
          ? { ...img, imagemPadrao: '' }
          : img
      ));
      
      // Atualizar também nos itens existentes das inspeções
      setInspecoes(prev => prev.map(inspecao => ({
        ...inspecao,
        areas: inspecao.areas.map(area => ({
          ...area,
          items: area.items.map(item => 
            item.id === itemId 
              ? { ...item, imagemPadrao: '' }
              : item
          )
        }))
      })));

      alert('Imagem padrão removida com sucesso!');
    }
  };

  // Funções de mídia corrigidas com melhor tratamento de erros
  const startCamera = async (itemId: number, type: 'image' | 'video') => {
    try {
      // Verificar se o navegador suporta getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Seu navegador não suporta acesso à câmera. Use um navegador mais recente.');
      }

      // Verificar se está em contexto seguro (HTTPS)
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        throw new Error('Acesso à câmera requer conexão segura (HTTPS). Verifique se está acessando via HTTPS.');
      }

      const constraints = {
        video: {
          facingMode: 'environment', // Usar câmera traseira por padrão
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: type === 'video' // Incluir áudio apenas para vídeo
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      setCameraOpen({ itemId, type });
    } catch (error: any) {
      console.error('Erro ao acessar câmera:', error);
      
      let errorMessage = 'Erro ao acessar a câmera.';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Permissão de câmera negada. Clique no ícone da câmera na barra de endereços e permita o acesso à câmera.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'Nenhuma câmera encontrada no dispositivo.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'Seu navegador não suporta acesso à câmera.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Câmera está sendo usada por outro aplicativo. Feche outros aplicativos que possam estar usando a câmera.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraOpen(null);
    setIsRecording(false);
    setRecordedChunks([]);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !cameraOpen) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `foto_${Date.now()}.jpg`, { type: 'image/jpeg' });
          const mediaFile: MediaFile = {
            id: Date.now().toString(),
            file,
            type: 'image',
            url: URL.createObjectURL(blob),
            name: file.name,
            size: file.size
          };
          
          addMediaToItem(cameraOpen.itemId, mediaFile);
          stopCamera();

          // Analisar a imagem capturada com IA
          const currentItem = getCurrentItem();
          if (currentItem) {
            analisarImagemComIA(mediaFile.url, currentItem);
          }
        }
      }, 'image/jpeg', 0.9);
    }
  };

  const startVideoRecording = () => {
    if (!streamRef.current || !cameraOpen) return;

    try {
      const recorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp9'
      });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const file = new File([blob], `video_${Date.now()}.webm`, { type: 'video/webm' });
        const mediaFile: MediaFile = {
          id: Date.now().toString(),
          file,
          type: 'video',
          url: URL.createObjectURL(blob),
          name: file.name,
          size: file.size
        };
        
        addMediaToItem(cameraOpen.itemId, mediaFile);
        stopCamera();
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      alert('Erro ao iniciar gravação de vídeo.');
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = (itemId: number, type: 'image' | 'video' | 'audio') => {
    const input = document.createElement('input');
    input.type = 'file';
    
    // Definir tipos de arquivo aceitos baseado no tipo
    switch (type) {
      case 'image':
        input.accept = 'image/*';
        break;
      case 'video':
        input.accept = 'video/*';
        break;
      case 'audio':
        input.accept = 'audio/*';
        break;
    }
    
    // Permitir acesso à câmera/galeria em dispositivos móveis
    if (type === 'image') {
      input.setAttribute('capture', 'environment');
    }

    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const mediaFile: MediaFile = {
          id: Date.now().toString(),
          file,
          type,
          url: URL.createObjectURL(file),
          name: file.name,
          size: file.size
        };
        
        addMediaToItem(itemId, mediaFile);

        // Se for imagem, analisar com IA
        if (type === 'image') {
          const currentItem = getCurrentItem();
          if (currentItem) {
            analisarImagemComIA(mediaFile.url, currentItem);
          }
        }
      }
    };

    input.click();
  };

  const addMediaToItem = (itemId: number, mediaFile: MediaFile) => {
    if (!currentInspecao || !currentArea) return;

    const updatedInspecao = {
      ...currentInspecao,
      areas: currentInspecao.areas.map(area => 
        area.id === currentArea.id 
          ? {
              ...area,
              items: area.items.map(item => 
                item.id === itemId 
                  ? { ...item, medias: [...item.medias, mediaFile] }
                  : item
              ),
              painelItems: area.painelItems?.map(item => 
                item.id === itemId 
                  ? { ...item, medias: [...item.medias, mediaFile] }
                  : item
              )
            }
          : area
      )
    };

    setCurrentInspecao(updatedInspecao);
    setInspecoes(prev => prev.map(i => i.id === currentInspecao.id ? updatedInspecao : i));
  };

  const removeMediaFromItem = (itemId: number, mediaId: string) => {
    if (!currentInspecao || !currentArea) return;

    const updatedInspecao = {
      ...currentInspecao,
      areas: currentInspecao.areas.map(area => 
        area.id === currentArea.id 
          ? {
              ...area,
              items: area.items.map(item => 
                item.id === itemId 
                  ? { ...item, medias: item.medias.filter(m => m.id !== mediaId) }
                  : item
              ),
              painelItems: area.painelItems?.map(item => 
                item.id === itemId 
                  ? { ...item, medias: item.medias.filter(m => m.id !== mediaId) }
                  : item
              )
            }
          : area
      )
    };

    setCurrentInspecao(updatedInspecao);
    setInspecoes(prev => prev.map(i => i.id === currentInspecao.id ? updatedInspecao : i));
  };

  // CORREÇÃO 1: Função de geolocalização corrigida com melhor tratamento de erros
  const obterLocalizacao = () => {
    setLoadingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocalização não é suportada neste navegador');
      setLoadingLocation(false);
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 15000, // Aumentado para 15 segundos
      maximumAge: 60000 // Cache de 1 minuto
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const novaLocalizacao: Localizacao = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          precisao: position.coords.accuracy,
          timestamp: new Date().toISOString(),
          endereco: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
        };

        setLocalizacao(novaLocalizacao);
        setLoadingLocation(false);
        
        // Salvar a localização na inspeção atual se existir
        if (currentInspecao) {
          const updatedInspecao = {
            ...currentInspecao,
            localizacao: novaLocalizacao
          };
          setCurrentInspecao(updatedInspecao);
          setInspecoes(prev => prev.map(i => i.id === currentInspecao.id ? updatedInspecao : i));
        }
      },
      (error) => {
        let errorMessage = 'Erro ao obter localização';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permissão de localização negada. Clique no ícone de localização na barra de endereços e permita o acesso à localização.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Localização indisponível. Verifique se o GPS está ativado e se há sinal disponível.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Timeout ao obter localização. Tente novamente em alguns segundos.';
            break;
        }
        setLocationError(errorMessage);
        setLoadingLocation(false);
      },
      options
    );
  };

  const createNewInspecao = () => {
    if (!novaInspecao.nome || !novaInspecao.numeroContrato || !novaInspecao.engenheiroResponsavel || !novaInspecao.responsavelCliente) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const numeroSequencial = `PA-${new Date().getFullYear()}-${(inspecoes.length + 1).toString().padStart(4, '0')}`;

    // Determinar a foto do cliente baseada no método selecionado
    let logoClienteFinal = '';
    if (fotoClienteMetodo === 'link' && fotoClienteLink) {
      logoClienteFinal = fotoClienteLink;
    } else if (fotoClienteMetodo === 'upload' && fotoClientePreview) {
      logoClienteFinal = fotoClientePreview;
    }

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
      logoCliente: logoClienteFinal || undefined
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

    // Limpar foto do cliente
    removeFotoCliente();

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
        hrn: 0,
        preRecomendacao: '',
        analiseIA: ''
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

  // CORREÇÃO 2: Função updateItem corrigida para atualização imediata
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
                  
                  // Recalcular HRN se for NC e todos os campos estiverem preenchidos
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

    // Atualizar estados imediatamente
    setCurrentInspecao(updatedInspecao);
    setInspecoes(prev => prev.map(i => i.id === currentInspecao.id ? updatedInspecao : i));
    
    // Atualizar área atual se for a mesma
    if (currentArea && currentArea.id === areaId) {
      const updatedArea = updatedInspecao.areas.find(a => a.id === areaId);
      if (updatedArea) {
        setCurrentArea(updatedArea);
      }
    }
  };

  // CORREÇÃO 3: Função updatePainelItem corrigida para permitir escrita completa
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

    // Atualizar estados imediatamente
    setCurrentInspecao(updatedInspecao);
    setInspecoes(prev => prev.map(i => i.id === currentInspecao.id ? updatedInspecao : i));
    
    // Atualizar área atual se for a mesma
    if (currentArea && currentArea.id === areaId) {
      const updatedArea = updatedInspecao.areas.find(a => a.id === areaId);
      if (updatedArea) {
        setCurrentArea(updatedArea);
      }
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

  const filteredInspecoes = inspecoes.filter(inspecao => {
    const matchesSearch = inspecao.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inspecao.numeroSequencial.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inspecao.engenheiroResponsavel.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || inspecao.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // Função para obter o item atual baseado no índice
  const getCurrentItem = () => {
    if (!currentArea) return null;
    
    if (currentArea.tipoChecklist === 'subestacoes') {
      return currentArea.items[currentItemIndex] || null;
    } else {
      return currentArea.painelItems?.[currentItemIndex] || null;
    }
  };

  // Função para navegar entre itens
  const navigateToItem = (direction: 'prev' | 'next') => {
    if (!currentArea) return;
    
    const totalItems = currentArea.tipoChecklist === 'subestacoes' 
      ? currentArea.items.length 
      : currentArea.painelItems?.length || 0;
    
    if (direction === 'prev' && currentItemIndex > 0) {
      setCurrentItemIndex(currentItemIndex - 1);
    } else if (direction === 'next' && currentItemIndex < totalItems - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
    }
  };

  // Componente de status de salvamento
  const SaveStatus = () => {
    if (currentView !== 'checklist' || !currentInspecao) return null;

    return (
      <div className="fixed top-4 right-4 z-50">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg text-sm font-medium ${
          saveStatus === 'saving' ? 'bg-blue-100 text-blue-800' :
          saveStatus === 'saved' ? 'bg-green-100 text-green-800' :
          saveStatus === 'error' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-600'
        }`}>
          {saveStatus === 'saving' && <Loader className="w-4 h-4 animate-spin" />}
          {saveStatus === 'saved' && <CheckCircle className="w-4 h-4" />}
          {saveStatus === 'error' && <AlertCircle className="w-4 h-4" />}
          {saveStatus === 'idle' && <Save className="w-4 h-4" />}
          
          <span>
            {saveStatus === 'saving' ? 'Salvando...' :
             saveStatus === 'saved' ? 'Salvo' :
             saveStatus === 'error' ? 'Erro ao salvar' :
             'Auto-save ativo'}
          </span>
          
          {!isOnline && <WifiOff className="w-4 h-4 text-orange-500" title="Offline - salvando localmente" />}
          {isOnline && <Wifi className="w-4 h-4 text-green-500" title="Online" />}
        </div>
        
        {lastSaveTime && (
          <div className="text-xs text-gray-500 text-center mt-1">
            Último salvamento: {lastSaveTime.toLocaleTimeString()}
          </div>
        )}
        
        {pendingSyncData.length > 0 && (
          <div className="text-xs text-orange-600 text-center mt-1">
            {pendingSyncData.length} item(s) aguardando sincronização
          </div>
        )}
      </div>
    );
  };

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

  // Modal da câmera com melhor tratamento de erros
  const CameraModal = () => {
    if (!cameraOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {cameraOpen.type === 'image' ? 'Tirar Foto' : 'Gravar Vídeo'}
            </h3>
            <button
              onClick={stopCamera}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="p-4">
            <div className="relative bg-black rounded-lg overflow-hidden mb-4">
              <video
                ref={videoRef}
                className="w-full h-64 object-cover"
                autoPlay
                muted
                playsInline
              />
            </div>
            
            <div className="flex justify-center gap-4">
              {cameraOpen.type === 'image' ? (
                <button
                  onClick={capturePhoto}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                  Capturar Foto
                </button>
              ) : (
                <>
                  {!isRecording ? (
                    <button
                      onClick={startVideoRecording}
                      className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <Video className="w-5 h-5" />
                      Iniciar Gravação
                    </button>
                  ) : (
                    <button
                      onClick={stopVideoRecording}
                      className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      Parar Gravação
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  };

  if (currentView === 'editor-imagens' && editingImageId) {
    const editingItem = imagensPadrao.find(img => img.id === editingImageId);
    
    return (
      <div className="min-h-screen bg-gray-50">
        <ProfessionalHeader 
          title="EDITOR DE FOTO PADRÃO" 
          subtitle="Editar ou Remover Imagem de Referência"
        />

        <div className="max-w-4xl mx-auto p-4 sm:p-6">
          <div className="mb-6">
            <button
              onClick={() => {
                setCurrentView('gerenciar-imagens');
                setEditingImageId(null);
                setNewImageUrl('');
              }}
              className="flex items-center gap-2 text-blue-800 hover:text-blue-900 transition-colors font-medium"
            >
              <Home className="w-5 h-5" />
              Voltar ao Gerenciamento
            </button>
          </div>

          {editingItem && (
            <NumberedSection number="1" title={`EDITAR ITEM: ${editingItem.norma}`}>
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Informações do Item</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Norma:</span>
                      <span className="ml-2 text-blue-600">{editingItem.norma}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Categoria:</span>
                      <span className="ml-2 text-green-600">{editingItem.categoria}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium text-gray-700">Descrição:</span>
                      <p className="mt-1 text-gray-600">{editingItem.descricao}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Imagem Atual</h4>
                    {editingItem.imagemPadrao ? (
                      <div className="bg-gray-100 rounded-lg overflow-hidden">
                        <img 
                          src={editingItem.imagemPadrao} 
                          alt={editingItem.descricao}
                          className="w-full h-64 object-cover"
                        />
                      </div>
                    ) : (
                      <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <Image className="w-12 h-12 mx-auto mb-2" />
                          <p>Nenhuma imagem definida</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Nova Imagem</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          URL da Nova Imagem
                        </label>
                        <input
                          type="url"
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          placeholder="https://exemplo.com/imagem.jpg"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Buscar Imagem no Dispositivo
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                setNewImageUrl(event.target?.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>

                      {newImageUrl && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Preview da Nova Imagem</h5>
                          <div className="bg-gray-100 rounded-lg overflow-hidden">
                            <img 
                              src={newImageUrl} 
                              alt="Preview da nova imagem"
                              className="w-full h-48 object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling!.style.display = 'flex';
                              }}
                            />
                            <div className="hidden h-48 items-center justify-center text-red-500">
                              <div className="text-center">
                                <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                                <p className="text-sm">Erro ao carregar imagem</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={salvarImagemPadrao}
                    disabled={!newImageUrl}
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-5 h-5" />
                    Salvar Nova Imagem
                  </button>

                  <button
                    onClick={() => removerImagemPadrao(editingImageId)}
                    className="flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                    Remover Imagem Padrão
                  </button>

                  <button
                    onClick={() => {
                      setCurrentView('gerenciar-imagens');
                      setEditingImageId(null);
                      setNewImageUrl('');
                    }}
                    className="flex items-center justify-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                    Cancelar
                  </button>
                </div>
              </div>
            </NumberedSection>
          )}
        </div>
      </div>
    );
  }

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
                    {imagem.imagemPadrao ? (
                      <img 
                        src={imagem.imagemPadrao} 
                        alt={imagem.descricao}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <div className="text-center">
                          <Image className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm">Sem imagem</p>
                        </div>
                      </div>
                    )}
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
                        <button 
                          onClick={() => editarImagemPadrao(imagem.id)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Editar imagem padrão"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => removerImagemPadrao(imagem.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Remover imagem padrão"
                        >
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
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
                onClick={() => setCurrentView('gerenciar-imagens')}
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-4 sm:p-6 rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Image className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-3" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">Imagens Padrão</h3>
                <p className="text-xs sm:text-sm opacity-90">Gerenciar fotos de referência</p>
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
            </div>
          </NumberedSection>

          <NumberedSection number="2" title="FOTO DO CLIENTE">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="fotoMetodo"
                      value="link"
                      checked={fotoClienteMetodo === 'link'}
                      onChange={(e) => setFotoClienteMetodo(e.target.value as 'link' | 'upload')}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <Link className="w-4 h-4" />
                    <span className="text-sm font-medium text-gray-700">Link da Imagem</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="fotoMetodo"
                      value="upload"
                      checked={fotoClienteMetodo === 'upload'}
                      onChange={(e) => setFotoClienteMetodo(e.target.value as 'link' | 'upload')}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <Upload className="w-4 h-4" />
                    <span className="text-sm font-medium text-gray-700">Upload de Arquivo</span>
                  </label>
                </div>
              </div>

              {fotoClienteMetodo === 'link' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL da Foto do Cliente
                  </label>
                  <input
                    type="url"
                    value={fotoClienteLink}
                    onChange={(e) => handleFotoClienteLinkChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://exemplo.com/logo-cliente.png"
                  />
                </div>
              )}

              {fotoClienteMetodo === 'upload' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecionar Arquivo
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFotoClienteFileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              )}

              {fotoClientePreview && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Preview da Foto do Cliente</h4>
                    <button
                      onClick={removeFotoCliente}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Remover foto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="w-32 h-32 bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
                    <img
                      src={fotoClientePreview}
                      alt="Preview da foto do cliente"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          </NumberedSection>

          <NumberedSection number="3" title="LOCALIZAÇÃO (OPCIONAL)">
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
                      setCurrentItemIndex(0); // Reset para o primeiro item
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
    const currentItem = getCurrentItem();
    const totalItems = currentArea.tipoChecklist === 'subestacoes' 
      ? currentArea.items.length 
      : currentArea.painelItems?.length || 0;

    if (!currentItem) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Item não encontrado</p>
            <button
              onClick={() => setCurrentView('inspecao')}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Voltar para Inspeção
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <SaveStatus />
        <CameraModal />
        
        <div className="max-w-7xl mx-auto p-4">
          {/* Header */}
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
                    {currentArea.tipoChecklist === 'subestacoes' ? 'Checklist com HRN' : 'Checklist de Painéis'}
                  </p>
                </div>
              </div>
            </div>

            {/* Navegação entre itens */}
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <button
                onClick={() => navigateToItem('prev')}
                disabled={currentItemIndex === 0}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>

              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  Item {currentItemIndex + 1} de {totalItems}
                </div>
                <div className="text-sm text-gray-600">
                  {Math.round(((currentItemIndex + 1) / totalItems) * 100)}% concluído
                </div>
              </div>

              <button
                onClick={() => navigateToItem('next')}
                disabled={currentItemIndex === totalItems - 1}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próximo
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Conteúdo do Item */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            {currentArea.tipoChecklist === 'subestacoes' ? (
              <div className="space-y-6">
                {/* Informações do Item */}
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      {(currentItem as ChecklistItem).id}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{(currentItem as ChecklistItem).norma}</h2>
                      <p className="text-gray-600 mt-2">{(currentItem as ChecklistItem).descricao}</p>
                    </div>
                  </div>
                </div>

                {/* Imagem Padrão */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Imagem de Referência</h3>
                    <div className="bg-gray-100 rounded-lg overflow-hidden">
                      {(currentItem as ChecklistItem).imagemPadrao ? (
                        <img
                          src={(currentItem as ChecklistItem).imagemPadrao}
                          alt="Imagem padrão do item"
                          className="w-full h-64 object-cover"
                        />
                      ) : (
                        <div className="w-full h-64 flex items-center justify-center text-gray-400">
                          <div className="text-center">
                            <Image className="w-12 h-12 mx-auto mb-2" />
                            <p>Sem imagem de referência</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mídia Capturada */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Evidências Capturadas</h3>
                    <div className="space-y-4">
                      {/* Botões de Captura */}
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => startCamera((currentItem as ChecklistItem).id, 'image')}
                          className="flex items-center justify-center gap-2 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Camera className="w-5 h-5" />
                          Tirar Foto
                        </button>
                        <button
                          onClick={() => handleFileUpload((currentItem as ChecklistItem).id, 'image')}
                          className="flex items-center justify-center gap-2 bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Image className="w-5 h-5" />
                          Buscar Imagem
                        </button>
                        <button
                          onClick={() => startCamera((currentItem as ChecklistItem).id, 'video')}
                          className="flex items-center justify-center gap-2 bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <Video className="w-5 h-5" />
                          Gravar Vídeo
                        </button>
                        <button
                          onClick={() => handleFileUpload((currentItem as ChecklistItem).id, 'video')}
                          className="flex items-center justify-center gap-2 bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          <Upload className="w-5 h-5" />
                          Anexar Vídeo
                        </button>
                      </div>

                      {/* Mídia Anexada */}
                      {(currentItem as ChecklistItem).medias.length > 0 && (
                        <div className="grid grid-cols-2 gap-3">
                          {(currentItem as ChecklistItem).medias.map(media => (
                            <div key={media.id} className="relative bg-gray-100 rounded-lg overflow-hidden">
                              {media.type === 'image' ? (
                                <img src={media.url} alt={media.name} className="w-full h-32 object-cover" />
                              ) : (
                                <video src={media.url} className="w-full h-32 object-cover" controls />
                              )}
                              <button
                                onClick={() => removeMediaFromItem((currentItem as ChecklistItem).id, media.id)}
                                className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Análise de IA */}
                {((currentItem as ChecklistItem).analiseIA || analisandoImagem) && (
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        {analisandoImagem ? (
                          <Loader className="w-5 h-5 text-purple-600 animate-spin" />
                        ) : (
                          <Brain className="w-5 h-5 text-purple-600" />
                        )}
                        <h3 className="text-lg font-semibold text-purple-900">
                          {analisandoImagem ? 'Analisando Imagem...' : 'Análise Inteligente'}
                        </h3>
                      </div>
                      <Sparkles className="w-5 h-5 text-purple-600" />
                    </div>
                    
                    {analisandoImagem ? (
                      <div className="text-purple-700">
                        <p>A IA está analisando a imagem capturada para fornecer recomendações técnicas...</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-purple-900 mb-2">Análise Visual:</h4>
                          <p className="text-purple-800">{(currentItem as ChecklistItem).analiseIA}</p>
                        </div>
                        {(currentItem as ChecklistItem).preRecomendacao && (
                          <div>
                            <h4 className="font-medium text-purple-900 mb-2">Pré-recomendação:</h4>
                            <p className="text-purple-800">{(currentItem as ChecklistItem).preRecomendacao}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Avaliação */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Avaliação</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Condição</label>
                      <select
                        value={(currentItem as ChecklistItem).condicao}
                        onChange={(e) => updateItem(currentArea.id, (currentItem as ChecklistItem).id, 'condicao', e.target.value as 'C' | 'NC' | 'NA' | '')}
                        className={`w-full px-4 py-2 text-sm rounded border ${getStatusColor((currentItem as ChecklistItem).condicao)} border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white`}
                      >
                        <option value="">Selecione...</option>
                        <option value="C">C - Conforme</option>
                        <option value="NC">NC - Não Conforme</option>
                        <option value="NA">NA - Não Aplicável</option>
                      </select>
                    </div>

                    {(currentItem as ChecklistItem).condicao === 'NC' && (
                      <div className="space-y-4 p-4 bg-red-50 rounded-lg border border-red-200">
                        <h4 className="font-medium text-red-900">Análise de Risco (HRN)</h4>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-red-700 mb-1">PO - Probabilidade</label>
                            <select
                              value={(currentItem as ChecklistItem).po || ''}
                              onChange={(e) => updateItem(currentArea.id, (currentItem as ChecklistItem).id, 'po', e.target.value)}
                              className="w-full px-3 py-2 text-sm rounded border border-red-300 focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                            >
                              {PO_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-red-700 mb-1">FE - Frequência</label>
                            <select
                              value={(currentItem as ChecklistItem).fe || ''}
                              onChange={(e) => updateItem(currentArea.id, (currentItem as ChecklistItem).id, 'fe', e.target.value)}
                              className="w-full px-3 py-2 text-sm rounded border border-red-300 focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                            >
                              {FE_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-red-700 mb-1">GSD - Gravidade</label>
                            <select
                              value={(currentItem as ChecklistItem).gsd || ''}
                              onChange={(e) => updateItem(currentArea.id, (currentItem as ChecklistItem).id, 'gsd', e.target.value)}
                              className="w-full px-3 py-2 text-sm rounded border border-red-300 focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                            >
                              {GSD_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-red-700 mb-1">NPER - Pessoas</label>
                            <select
                              value={(currentItem as ChecklistItem).nper || ''}
                              onChange={(e) => updateItem(currentArea.id, (currentItem as ChecklistItem).id, 'nper', e.target.value)}
                              className="w-full px-3 py-2 text-sm rounded border border-red-300 focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                            >
                              {NPER_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {(currentItem as ChecklistItem).hrn && (currentItem as ChecklistItem).hrn! > 0 && (
                          <div className="text-center">
                            <div className="text-sm text-red-700 mb-2">Resultado HRN:</div>
                            <div className={`inline-block px-4 py-2 rounded-lg text-lg font-bold ${getHRNColor((currentItem as ChecklistItem).hrn!).bg} ${getHRNColor((currentItem as ChecklistItem).hrn!).text}`}>
                              {(currentItem as ChecklistItem).hrn!.toFixed(2)}
                              <div className="text-sm font-normal mt-1">
                                {getHRNColor((currentItem as ChecklistItem).hrn!).label}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recomendações</h3>
                    <textarea
                      value={(currentItem as ChecklistItem).recomendacoes}
                      onChange={(e) => updateItem(currentArea.id, (currentItem as ChecklistItem).id, 'recomendacoes', e.target.value)}
                      placeholder="Escreva suas recomendações técnicas completas e detalhadas para correção ou melhoria..."
                      className="w-full h-40 px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                    
                    {(currentItem as ChecklistItem).preRecomendacao && (
                      <div className="mt-3">
                        <button
                          onClick={() => {
                            const currentRec = (currentItem as ChecklistItem).recomendacoes;
                            const preRec = (currentItem as ChecklistItem).preRecomendacao!;
                            const newRec = currentRec ? `${currentRec}\n\n${preRec}` : preRec;
                            updateItem(currentArea.id, (currentItem as ChecklistItem).id, 'recomendacoes', newRec);
                          }}
                          className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 transition-colors"
                        >
                          <Sparkles className="w-4 h-4" />
                          Usar pré-recomendação da IA
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // Painel Elétrico Item
              <div className="space-y-6">
                {/* Informações do Item */}
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                      {(currentItem as PainelEletricoItem).id}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{(currentItem as PainelEletricoItem).norma}</h2>
                      <p className="text-gray-600 mt-2">{(currentItem as PainelEletricoItem).descricao}</p>
                    </div>
                  </div>
                </div>

                {/* Mídia e Avaliação */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Evidências</h3>
                    <div className="space-y-4">
                      {/* Botões de Captura */}
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => startCamera((currentItem as PainelEletricoItem).id, 'image')}
                          className="flex items-center justify-center gap-2 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Camera className="w-5 h-5" />
                          Tirar Foto
                        </button>
                        <button
                          onClick={() => handleFileUpload((currentItem as PainelEletricoItem).id, 'image')}
                          className="flex items-center justify-center gap-2 bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Image className="w-5 h-5" />
                          Buscar Imagem
                        </button>
                        <button
                          onClick={() => startCamera((currentItem as PainelEletricoItem).id, 'video')}
                          className="flex items-center justify-center gap-2 bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <Video className="w-5 h-5" />
                          Gravar Vídeo
                        </button>
                        <button
                          onClick={() => handleFileUpload((currentItem as PainelEletricoItem).id, 'video')}
                          className="flex items-center justify-center gap-2 bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          <Upload className="w-5 h-5" />
                          Anexar Vídeo
                        </button>
                      </div>

                      {/* Mídia Anexada */}
                      {(currentItem as PainelEletricoItem).medias.length > 0 && (
                        <div className="grid grid-cols-2 gap-3">
                          {(currentItem as PainelEletricoItem).medias.map(media => (
                            <div key={media.id} className="relative bg-gray-100 rounded-lg overflow-hidden">
                              {media.type === 'image' ? (
                                <img src={media.url} alt={media.name} className="w-full h-32 object-cover" />
                              ) : (
                                <video src={media.url} className="w-full h-32 object-cover" controls />
                              )}
                              <button
                                onClick={() => removeMediaFromItem((currentItem as PainelEletricoItem).id, media.id)}
                                className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Avaliação</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Condição</label>
                      <select
                        value={(currentItem as PainelEletricoItem).condicao}
                        onChange={(e) => updatePainelItem(currentArea.id, (currentItem as PainelEletricoItem).id, 'condicao', e.target.value as 'C' | 'NC' | 'NA' | '')}
                        className={`w-full px-4 py-2 text-sm rounded border ${getStatusColor((currentItem as PainelEletricoItem).condicao)} border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white`}
                      >
                        <option value="">Selecione...</option>
                        <option value="C">C - Conforme</option>
                        <option value="NC">NC - Não Conforme</option>
                        <option value="NA">NA - Não Aplicável</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Observação</label>
                      <textarea
                        value={(currentItem as PainelEletricoItem).observacao}
                        onChange={(e) => updatePainelItem(currentArea.id, (currentItem as PainelEletricoItem).id, 'observacao', e.target.value)}
                        placeholder="Digite suas observações detalhadas sobre o item inspecionado..."
                        className="w-full h-32 px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Recomendação</label>
                      <textarea
                        value={(currentItem as PainelEletricoItem).recomendacao}
                        onChange={(e) => updatePainelItem(currentArea.id, (currentItem as PainelEletricoItem).id, 'recomendacao', e.target.value)}
                        placeholder="Escreva suas recomendações técnicas completas para correção ou melhoria..."
                        className="w-full h-32 px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}