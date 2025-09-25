import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Hash, Info } from 'lucide-react';
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
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getDataProvider } from '@/services/dataProvider';
import { EnterGrupoInput } from '@/types/mentor';
import { cn } from '@/lib/utils';

interface JoinGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const dataProvider = getDataProvider();

export function JoinGroupModal({ isOpen, onClose }: JoinGroupModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [grupoId, setGrupoId] = useState('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setGrupoId('');
      setErrors({});
    }
  }, [isOpen]);

  // Autofocus no input quando modal abre
  useEffect(() => {
    if (isOpen) {
      const inputElement = document.querySelector('[data-testid="grupo-id-input"]');
      if (inputElement) {
        (inputElement as HTMLElement).focus();
      }
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!grupoId.trim()) {
      newErrors.grupoId = 'ID do grupo é obrigatório';
    } else if (grupoId.trim().length < 3) {
      newErrors.grupoId = 'ID do grupo deve ter pelo menos 3 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user) return;

    try {
      setLoading(true);

      const enterInput: EnterGrupoInput = {
        grupoId: grupoId.trim(),
      };

      // Primeiro, verificar se o grupo existe
      const grupo = await dataProvider.getGrupoById(enterInput.grupoId);
      if (!grupo) {
        setErrors({ grupoId: 'Grupo não encontrado. Verifique o ID informado.' });
        return;
      }

      // Tentar entrar no grupo
      const result = await dataProvider.entrarNoGrupo(enterInput, user.id);

      if (result.ok) {
        toast({
          title: "Você entrou no grupo!",
          description: `Bem-vindo ao grupo "${grupo.nome}". Você pode participar das discussões agora.`,
        });
        onClose();
        navigate(`/grupo/${enterInput.grupoId}`);
      } else {
        throw new Error('Falha ao entrar no grupo');
      }

    } catch (error) {
      console.error('Erro ao entrar no grupo:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      if (errorMessage.includes('não encontrado')) {
        setErrors({ grupoId: 'Grupo não encontrado. Verifique o ID informado.' });
      } else {
        toast({
          title: "Erro ao entrar no grupo",
          description: "Não foi possível entrar no grupo. Tente novamente.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setGrupoId(value);
    // Limpar erro quando começar a digitar
    if (errors.grupoId) {
      setErrors(prev => ({ ...prev, grupoId: '' }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-md gradient-surface" 
        aria-modal="true"
        onEscapeKeyDown={onClose}
      >
        <DialogHeader>
          <DialogTitle 
            className="text-xl font-semibold text-gradient-brand flex items-center gap-2"
            tabIndex={-1}
          >
            <UserPlus className="w-5 h-5" />
            Entrar em Grupo
          </DialogTitle>
          <DialogDescription>
            Digite o ID do grupo para se juntar às discussões e atividades.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ID do grupo */}
          <div className="space-y-2">
            <Label htmlFor="grupo-id">ID do grupo</Label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="grupo-id"
                type="text"
                value={grupoId}
                onChange={(e) => handleInputChange(e.target.value)}
                className={cn("pl-9", errors.grupoId && "border-destructive")}
                placeholder="Cole o ID do grupo aqui..."
                aria-describedby={errors.grupoId ? "grupo-id-error" : "grupo-id-help"}
                data-testid="grupo-id-input"
                autoFocus
              />
            </div>
            {errors.grupoId ? (
              <p id="grupo-id-error" className="text-sm text-destructive" role="alert" aria-live="polite">
                {errors.grupoId}
              </p>
            ) : (
              <p id="grupo-id-help" className="text-sm text-muted-foreground">
                Use o ID do grupo fornecido pelo criador
              </p>
            )}
          </div>

          {/* Instruções */}
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-primary mb-1">
                  Como obter o ID do grupo?
                </p>
                <p className="text-xs text-muted-foreground">
                  O criador do grupo deve compartilhar o ID único do grupo com você. 
                  Cada grupo tem um identificador exclusivo que permite o acesso.
                </p>
              </div>
            </div>
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
              disabled={loading || !grupoId.trim()}
              className="sm:flex-1"
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Entrando...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Entrar no Grupo
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}