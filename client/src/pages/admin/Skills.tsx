import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, Plus, Trash2 } from 'lucide-react';
import { api } from '@/services/api';

interface Skill {
  id: string;
  name: string;
  createdAt: string;
  _count: {
    userSkills: number;
    swapRequests: number;
  };
}

export default function Skills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [newSkill, setNewSkill] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const loadSkills = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/admin/skills', {
        params: {
          page,
          limit: 10,
          search: searchQuery,
          sort: 'name_asc',
        },
      });
      setSkills(response.data.skills);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load skills',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, [page, searchQuery]);

  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;

    try {
      setIsCreating(true);
      await api.post('/admin/skills', { name: newSkill.trim() });
      toast({
        title: 'Success',
        description: 'Skill created successfully',
      });
      setNewSkill('');
      loadSkills();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create skill',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;

    try {
      await api.delete(`/admin/skills/${skillId}`);
      toast({
        title: 'Success',
        description: 'Skill deleted successfully',
      });
      loadSkills();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete skill',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Skills Management</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <form onSubmit={handleCreateSkill} className="flex items-center gap-2">
            <Input
              placeholder="New skill name"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
            />
            <Button type="submit" disabled={isCreating}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </form>
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <Card className="p-6 text-center">Loading...</Card>
        ) : skills.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            No skills found
          </Card>
        ) : (
          skills.map((skill) => (
            <Card key={skill.id} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{skill.name}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-sm text-muted-foreground">
                      {skill._count.userSkills} users
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {skill._count.swapRequests} swaps
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteSkill(skill.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
} 