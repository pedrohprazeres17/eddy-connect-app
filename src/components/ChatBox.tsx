import { useState, useEffect, useRef } from 'react';
import { Send, Trash2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LocalGroupMessage, GroupChatsStorage } from '@/types/chat';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChatBoxProps {
  grupoId: string;
  grupoNome: string;
}

const STORAGE_KEY = 'groupChats';
const MAX_MESSAGE_LENGTH = 1000;

export function ChatBox({ grupoId, grupoNome }: ChatBoxProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<LocalGroupMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Carregar mensagens do localStorage
  useEffect(() => {
    const loadMessages = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const allChats: GroupChatsStorage = JSON.parse(stored);
          const groupMessages = allChats[grupoId] || [];
          setMessages(groupMessages);
        }
      } catch (error) {
        console.error('Erro ao carregar mensagens:', error);
      }
    };

    loadMessages();
  }, [grupoId]);

  // Salvar mensagens no localStorage (com debounce)
  useEffect(() => {
    const saveMessages = setTimeout(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const allChats: GroupChatsStorage = stored ? JSON.parse(stored) : {};
        allChats[grupoId] = messages;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allChats));
      } catch (error) {
        console.error('Erro ao salvar mensagens:', error);
      }
    }, 300);

    return () => clearTimeout(saveMessages);
  }, [messages, grupoId]);

  // Scroll automático para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Foco no textarea ao montar o componente
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const sendMessage = async () => {
    if (!user || !newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    if (messageText.length > MAX_MESSAGE_LENGTH) {
      toast({
        title: "Mensagem muito longa",
        description: `A mensagem deve ter no máximo ${MAX_MESSAGE_LENGTH} caracteres.`,
        variant: "destructive",
      });
      return;
    }

    try {
      setSending(true);

      const message: LocalGroupMessage = {
        id: generateId(),
        grupoId,
        userId: user.airRecId,
        userNome: user.nome,
        conteudo: messageText,
        createdAt: new Date().toISOString(),
      };

      setMessages(prev => [...prev, message]);
      setNewMessage('');

      // Simular delay de envio
      await new Promise(resolve => setTimeout(resolve, 200));

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro ao enviar mensagem",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const clearChat = () => {
    if (window.confirm('Tem certeza que deseja limpar todo o histórico de mensagens deste grupo?')) {
      setMessages([]);
      toast({
        title: "Chat limpo",
        description: "Todas as mensagens foram removidas deste dispositivo.",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift + Enter = nova linha (comportamento padrão)
        return;
      } else {
        // Enter = enviar mensagem
        e.preventDefault();
        sendMessage();
      }
    }
    
    if (e.key === 'Escape') {
      setNewMessage('');
      e.preventDefault();
    }
  };

  const formatMessageTime = (isoString: string) => {
    try {
      return format(new Date(isoString), 'HH:mm', { locale: ptBR });
    } catch {
      return '';
    }
  };

  const formatMessageDate = (isoString: string) => {
    try {
      const messageDate = new Date(isoString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (messageDate.toDateString() === today.toDateString()) {
        return 'Hoje';
      } else if (messageDate.toDateString() === yesterday.toDateString()) {
        return 'Ontem';
      } else {
        return format(messageDate, 'dd/MM', { locale: ptBR });
      }
    } catch {
      return '';
    }
  };

  // Agrupar mensagens por data
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatMessageDate(message.createdAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, LocalGroupMessage[]>);

  return (
    <Card className="gradient-surface shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          Chat do Grupo
        </CardTitle>
        <CardDescription>
          💾 Este chat é salvo apenas neste dispositivo (MVP)
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Lista de mensagens */}
        <div 
          className="h-80 overflow-y-auto space-y-4 p-4 rounded-lg bg-muted/20 border border-border/50"
          role="log"
          aria-live="polite"
          aria-label={`Chat do grupo ${grupoNome}`}
        >
          {Object.keys(groupedMessages).length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium mb-1">Nenhuma mensagem ainda</p>
              <p className="text-sm">Dê o primeiro oi 👋</p>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([date, dayMessages]) => (
              <div key={date}>
                {/* Separador de data */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-border"></div>
                  <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded-full">
                    {date}
                  </span>
                  <div className="flex-1 h-px bg-border"></div>
                </div>

                {/* Mensagens do dia */}
                {dayMessages.map((message) => {
                  const isOwnMessage = message.userId === user?.airRecId;
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-3`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          isOwnMessage
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background border border-border'
                        }`}
                      >
                        {!isOwnMessage && (
                          <p className="text-xs font-medium text-accent mb-1">
                            {message.userNome}
                          </p>
                        )}
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.conteudo}
                        </p>
                        <p 
                          className={`text-xs mt-1 ${
                            isOwnMessage 
                              ? 'text-primary-foreground/70' 
                              : 'text-muted-foreground'
                          }`}
                        >
                          {formatMessageTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input de nova mensagem */}
        <div className="space-y-3">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escreva uma mensagem... (Enter para enviar, Shift+Enter para nova linha)"
              className="resize-none pr-16 min-h-[80px]"
              maxLength={MAX_MESSAGE_LENGTH}
              disabled={sending}
              aria-label="Nova mensagem"
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {newMessage.length}/{MAX_MESSAGE_LENGTH}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              disabled={messages.length === 0}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar chat
            </Button>

            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              className="gap-2"
              aria-label="Enviar mensagem"
            >
              <Send className="w-4 h-4" />
              {sending ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        </div>

        {/* Informação sobre implementação futura */}
        <Alert className="border-primary/20 bg-primary/5">
          <AlertDescription className="text-sm">
            <strong>💡 Futuro:</strong> Este chat será substituído por persistência real no servidor, 
            com notificações em tempo real e histórico compartilhado entre dispositivos.
          </AlertDescription>
        </Alert>

        {/* 
        TODO: Airtable futuro - Implementação real do chat
        
        Quando migrar para Airtable:
        1. Criar tabela Mensagens com campos:
           - id: Auto number
           - grupo: Link to Grupos
           - usuario: Link to Users  
           - conteudo: Long text
           - enviado_em: Created time
           - record_id: Formula RECORD_ID()
        
        2. Substituir localStorage por:
           - POST /Mensagens para enviar
           - GET /Mensagens com polling para receber
           - filterByFormula: AND({grupo}='rec...', {enviado_em} > DATETIME_DIFF(NOW(), INTERVAL(1, 'days')))
           - sort[0][field]=enviado_em&sort[0][direction]=asc
        
        3. Implementar WebSocket ou polling para tempo real
        
        4. Adicionar paginação infinita para histórico longo
        */}
      </CardContent>
    </Card>
  );
}