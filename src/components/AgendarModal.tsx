import { useState, useEffect } from 'react';
import { Calendar, Clock, FileText, X } from 'lucide-react';
import { format, addMinutes, parseISO, formatISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getDataProvider } from '@/services/dataProvider';
import { Mentor, AgendamentoInput } from '@/types/mentor';
import { cn } from '@/lib/utils';

interface AgendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentor: Mentor | null;
}

interface FormData {
  data: Date | undefined;
  hora: string;
  duracao: string;
  observacoes: string;
}

const DURACOES = [
  { value: '30', label: '30 minutos' },
  { value: '60', label: '1 hora' },
  { value: '90', label: '1h 30min' },
];

const dataProvider = getDataProvider();

export function AgendarModal({ isOpen, onClose, mentor }: AgendarModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<FormData>({
    data: undefined,
    hora: '',
    duracao: '60',
    observacoes: '',
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        data: undefined,
        hora: '',
        duracao: '60',
        observacoes: '',
      });
      setErrors({});
    }
  }, [isOpen]);

  // Autofocus no título quando modal abre
  useEffect(() => {
    if (isOpen) {
      const titleElement = document.querySelector('[data-testid="modal-title"]');
      if (titleElement) {
        (titleElement as HTMLElement).focus();
      }
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.data) {
      newErrors.data = 'Selecione uma data';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (formData.data < today) {
        newErrors.data = 'A data deve ser hoje ou no futuro';
      }
    }

    if (!formData.hora) {
      newErrors.hora = 'Selecione um horário';
    } else {
      // Validar formato HH:MM
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(formData.hora)) {
        newErrors.hora = 'Formato de horário inválido (ex: 14:30)';
      }
    }

    if (!formData.duracao) {
      newErrors.duracao = 'Selecione a duração';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user || !mentor) return;

    try {
      setLoading(true);

      // Construir datetime de início
      const [hours, minutes] = formData.hora.split(':').map(Number);
      const inicioDate = new Date(formData.data!);
      inicioDate.setHours(hours, minutes, 0, 0);

      // Calcular fim baseado na duração
      const duracaoMinutos = parseInt(formData.duracao);
      const fimDate = addMinutes(inicioDate, duracaoMinutos);

      // Função para converter data+hora para ISO UTC
      function toIso(date: string, time: string): string {
        const [y, m, d] = date.split('-').map(Number);
        const [hh, mm] = time.split(':').map(Number);
        const dt = new Date(y, m - 1, d, hh, mm, 0);
        return dt.toISOString();
      }

      const agendamentoInput = {
        mentorAirRecId: mentor.id,
        alunoAirRecId: user.airRecId,
        inicioISO: formatISO(inicioDate),
        fimISO: formatISO(fimDate),
        observacoes: formData.observacoes.trim() || undefined,
      };

      const result = await dataProvider.createSessao(agendamentoInput);

      if (result.ok) {
        toast({
          title: "Solicitação enviada!",
          description: `Sua solicitação de mentoria com ${mentor.nome} foi enviada. Ver em Minhas Sessões.`,
        });
        onClose();
      } else {
        throw new Error('Falha ao criar sessão');
      }

    } catch (error) {
      console.error('Erro ao agendar:', error);
      toast({
        title: "Erro ao agendar",
        description: "Não foi possível enviar sua solicitação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (key: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Limpar erro do campo quando alterado
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const formatPrice = (price: number | undefined) => {
    if (!price) return 'A combinar';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  // Calcular preço total estimado
  const calcularPrecoTotal = () => {
    if (!mentor?.preco_hora || !formData.duracao) return null;
    const duracaoHoras = parseInt(formData.duracao) / 60;
    return mentor.preco_hora * duracaoHoras;
  };

  const precoTotal = calcularPrecoTotal();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-md gradient-surface" 
        aria-modal="true"
        onEscapeKeyDown={onClose}
      >
        <DialogHeader>
          <DialogTitle 
            className="text-xl font-semibold text-gradient-brand"
            data-testid="modal-title"
            tabIndex={-1}
          >
            Agendar Mentoria
          </DialogTitle>
          <DialogDescription>
            {mentor && (
              <>
                Solicite uma sessão de mentoria com <strong>{mentor.nome}</strong>
                {mentor.preco_hora && (
                  <span className="block text-accent font-medium mt-1">
                    {formatPrice(mentor.preco_hora)}/hora
                  </span>
                )}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Data */}
          <div className="space-y-2">
            <Label htmlFor="data-agendamento">Data da sessão</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.data && "text-muted-foreground",
                    errors.data && "border-destructive"
                  )}
                  id="data-agendamento"
                  aria-describedby={errors.data ? "data-error" : undefined}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {formData.data ? (
                    format(formData.data, "PPP", { locale: ptBR })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={formData.data}
                  onSelect={(date) => updateFormData('data', date)}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {errors.data && (
              <p id="data-error" className="text-sm text-destructive" role="alert" aria-live="polite">
                {errors.data}
              </p>
            )}
          </div>

          {/* Horário */}
          <div className="space-y-2">
            <Label htmlFor="hora-agendamento">Horário</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="hora-agendamento"
                type="time"
                value={formData.hora}
                onChange={(e) => updateFormData('hora', e.target.value)}
                className={cn("pl-9", errors.hora && "border-destructive")}
                aria-describedby={errors.hora ? "hora-error" : undefined}
              />
            </div>
            {errors.hora && (
              <p id="hora-error" className="text-sm text-destructive" role="alert" aria-live="polite">
                {errors.hora}
              </p>
            )}
          </div>

          {/* Duração */}
          <div className="space-y-2">
            <Label htmlFor="duracao-agendamento">Duração</Label>
            <Select 
              value={formData.duracao} 
              onValueChange={(value) => updateFormData('duracao', value)}
            >
              <SelectTrigger 
                id="duracao-agendamento"
                className={cn(errors.duracao && "border-destructive")}
                aria-describedby={errors.duracao ? "duracao-error" : undefined}
              >
                <SelectValue placeholder="Selecione a duração" />
              </SelectTrigger>
              <SelectContent>
                {DURACOES.map((duracao) => (
                  <SelectItem key={duracao.value} value={duracao.value}>
                    {duracao.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.duracao && (
              <p id="duracao-error" className="text-sm text-destructive" role="alert" aria-live="polite">
                {errors.duracao}
              </p>
            )}
          </div>

          {/* Preço total estimado */}
          {precoTotal && (
            <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
              <p className="text-sm font-medium">
                Valor estimado: <span className="text-accent">{formatPrice(precoTotal)}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                O valor final pode variar conforme acordado com o mentor
              </p>
            </div>
          )}

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes-agendamento">
              Observações <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="observacoes-agendamento"
                placeholder="Descreva seus objetivos, dúvidas ou tópicos que gostaria de abordar..."
                value={formData.observacoes}
                onChange={(e) => updateFormData('observacoes', e.target.value)}
                className="pl-9 resize-none"
                rows={3}
                maxLength={500}
              />
            </div>
            <p className="text-xs text-muted-foreground text-right">
              {formData.observacoes.length}/500 caracteres
            </p>
          </div>

          {/* Botões */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="sm:flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="hero"
              disabled={loading}
              className="sm:flex-1"
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Solicitar Agendamento
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}