import { useState, useEffect } from 'react';
import { Plus, Users, FileText, X } from 'lucide-react';
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
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getDataProvider } from '@/services/dataProvider';
import { CreateGrupoInput } from '@/types/mentor';
import { cn } from '@/lib/utils';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Callback para recarregar a lista
}

interface FormData {
  nome: string;
  descricao: string;
}

const dataProvider = getDataProvider();

export function CreateGroupModal({ isOpen, onClose, onSuccess }: CreateGroupModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<FormData>({
    nome: '',
    descricao: '',
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        nome: '',
        descricao: '',
      });
      setErrors({});
    }
  }, [isOpen]);

  // Autofocus no título quando modal abre
  useEffect(() => {
    if (isOpen) {
      const titleElement = document.querySelector('[data-testid="create-group-title"]');
      if (titleElement) {
        (titleElement as HTMLElement).focus();
      }
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome do grupo é obrigatório';
    } else if (formData.nome.trim().length < 3) {
      newErrors.nome = 'Nome deve ter pelo menos 3 caracteres';
    } else if (formData.nome.trim().length > 50) {
      newErrors.nome = 'Nome deve ter no máximo 50 caracteres';
    }

    if (formData.descricao.trim().length > 500) {
      newErrors.descricao = 'Descrição deve ter no máximo 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user) return;

    try {
      setLoading(true);

      const createInput: CreateGrupoInput = {
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim() || undefined,
      };

      const result = await dataProvider.createGrupo(createInput, user.id);

      if (result.ok) {
        toast({
          title: "Grupo criado com sucesso!",
          description: `O grupo "${formData.nome}" foi criado. Você pode convidar outros membros compartilhando o ID do grupo.`,
        });
        onClose();
        onSuccess(); // Recarregar lista de grupos
      } else {
        throw new Error('Falha ao criar grupo');
      }

    } catch (error) {
      console.error('Erro ao criar grupo:', error);
      toast({
        title: "Erro ao criar grupo",
        description: "Não foi possível criar o grupo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (key: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Limpar erro do campo quando alterado
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
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
            data-testid="create-group-title"
            tabIndex={-1}
          >
            <Plus className="w-5 h-5" />
            Criar Grupo de Estudo
          </DialogTitle>
          <DialogDescription>
            Crie um grupo para estudar e trocar conhecimentos com outros membros da comunidade.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome do grupo */}
          <div className="space-y-2">
            <Label htmlFor="nome-grupo">Nome do grupo</Label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="nome-grupo"
                type="text"
                value={formData.nome}
                onChange={(e) => updateFormData('nome', e.target.value)}
                className={cn("pl-9", errors.nome && "border-destructive")}
                placeholder="Ex: React Avançado, Data Science..."
                maxLength={50}
                aria-describedby={errors.nome ? "nome-error" : undefined}
                autoFocus
              />
            </div>
            <div className="flex justify-between items-center">
              {errors.nome && (
                <p id="nome-error" className="text-sm text-destructive" role="alert" aria-live="polite">
                  {errors.nome}
                </p>
              )}
              <p className="text-xs text-muted-foreground text-right ml-auto">
                {formData.nome.length}/50 caracteres
              </p>
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao-grupo">
              Descrição <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="descricao-grupo"
                value={formData.descricao}
                onChange={(e) => updateFormData('descricao', e.target.value)}
                className={cn("pl-9 resize-none", errors.descricao && "border-destructive")}
                placeholder="Descreva o objetivo do grupo, tópicos que serão abordados..."
                rows={3}
                maxLength={500}
                aria-describedby={errors.descricao ? "descricao-error" : undefined}
              />
            </div>
            <div className="flex justify-between items-center">
              {errors.descricao && (
                <p id="descricao-error" className="text-sm text-destructive" role="alert" aria-live="polite">
                  {errors.descricao}
                </p>
              )}
              <p className="text-xs text-muted-foreground text-right ml-auto">
                {formData.descricao.length}/500 caracteres
              </p>
            </div>
          </div>

          {/* Informação sobre convites */}
          <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
            <p className="text-sm font-medium text-accent mb-1">
              💡 Como convidar membros
            </p>
            <p className="text-xs text-muted-foreground">
              Após criar o grupo, você receberá um ID único que pode ser compartilhado 
              com outros usuários para que eles possam entrar no grupo.
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
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Grupo
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}