import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Trash2, Plus } from 'lucide-react';
import { api } from '@/services/api';

interface AdminMessage {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}

export default function Messages() {
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newMessage, setNewMessage] = useState({ title: '', body: '' });
  const { toast } = useToast();

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/admin/messages');
      setMessages(response.data.messages);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleCreateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.title.trim() || !newMessage.body.trim()) return;

    try {
      setIsCreating(true);
      await api.post('/admin/messages', newMessage);
      toast({
        title: 'Success',
        description: 'Message created successfully',
      });
      setNewMessage({ title: '', body: '' });
      loadMessages();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create message',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      await api.delete(`/admin/messages/${messageId}`);
      toast({
        title: 'Success',
        description: 'Message deleted successfully',
      });
      loadMessages();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Messages</h1>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>

      {isCreating && (
        <Card className="p-6">
          <form onSubmit={handleCreateMessage} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newMessage.title}
                onChange={(e) =>
                  setNewMessage((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter message title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Message</Label>
              <Input
                id="body"
                value={newMessage.body}
                onChange={(e) =>
                  setNewMessage((prev) => ({ ...prev, body: e.target.value }))
                }
                placeholder="Enter message content"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreating(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Message</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4">
        {isLoading ? (
          <Card className="p-6 text-center">Loading...</Card>
        ) : messages.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            No messages found
          </Card>
        ) : (
          messages.map((message) => (
            <Card key={message.id} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{message.title}</h3>
                  <p className="text-muted-foreground mt-1">{message.body}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Created on {new Date(message.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteMessage(message.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 