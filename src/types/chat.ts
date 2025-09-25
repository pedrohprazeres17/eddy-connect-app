export interface LocalGroupMessage {
  id: string;            // uuid
  grupoId: string;
  userId: string;
  userNome: string;
  conteudo: string;
  createdAt: string;     // ISO
}

export interface GroupChatsStorage {
  [grupoId: string]: LocalGroupMessage[];
}