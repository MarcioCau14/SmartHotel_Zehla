'use client';

import { useState } from 'react';
  LayoutDashboard,
  Users,
  CheckSquare,
  MessageSquare,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KanbanBoard } from './KanbanBoard';
import { ContactList } from './ContactList';
import { ContactDetail } from './ContactDetail';
import { TaskList } from './TaskList';
import { Inbox } from './Inbox';

type CrmTab = 'kanban' | 'contacts' | 'tasks' | 'inbox';

interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  tags: string[];
  source: string;
  lastContact: string;
  owner: string;
}

export function CRMModule() {
  const [activeTab, setActiveTab] = useState<CrmTab>('kanban');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  return (
    <div className="space-y-4">
      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v as CrmTab);
          setSelectedContact(null);
        }}
        className="w-full"
      >
        <TabsList className="bg-slate-800/50 border border-slate-700/50">
          <TabsTrigger value="kanban" className="data-[state=active]:bg-slate-700">
            <LayoutDashboard className="w-4 h-4 mr-1.5" />
            Kanban
          </TabsTrigger>
          <TabsTrigger value="contacts" className="data-[state=active]:bg-slate-700">
            <Users className="w-4 h-4 mr-1.5" />
            Contatos
          </TabsTrigger>
          <TabsTrigger value="tasks" className="data-[state=active]:bg-slate-700">
            <CheckSquare className="w-4 h-4 mr-1.5" />
            Tarefas
          </TabsTrigger>
          <TabsTrigger value="inbox" className="data-[state=active]:bg-slate-700">
            <MessageSquare className="w-4 h-4 mr-1.5" />
            Inbox
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="mt-6">
          <KanbanBoard />
        </TabsContent>

        <TabsContent value="contacts" className="mt-6">
          <div className="flex gap-4">
            <div className={selectedContact ? 'flex-1' : 'w-full'}>
              <ContactList onSelectContact={setSelectedContact} />
            </div>
            {selectedContact && (
              <div className="w-96 flex-shrink-0">
                <ContactDetail
                  contact={selectedContact}
                  onClose={() => setSelectedContact(null)}
                  onUpdate={() => {
                    // refresh will happen on next contact list load
                  }}
                />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          <TaskList />
        </TabsContent>

        <TabsContent value="inbox" className="mt-6">
          <Inbox />
        </TabsContent>
      </Tabs>
    </div>
  );
}
