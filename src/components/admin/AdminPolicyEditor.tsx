import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { MinimalTiptapEditor } from '@/minimal-tiptap';
import { Content } from '@tiptap/react';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export interface PolicyConfig {
  title: string;
  subtitle: string;
  cardTitle: string;
  storageKey: string;
  apiType: string;
  placeholder: string;
  successMessage: string;
}

interface AdminPolicyEditorProps {
  config: PolicyConfig;
}

const AdminPolicyEditor: React.FC<AdminPolicyEditorProps> = ({ config }) => {
  const [value, setValue] = useState<Content>(sessionStorage.getItem(config.storageKey));
  const [isLoading, setIsLoading] = useState(false);

  async function savePolicy() {
    setIsLoading(true);
    try {
      const response = await api.post('/api/saveadmin', { data: value, type: config.apiType });
      if (response.data.success) {
        sessionStorage.setItem(config.storageKey, '' + value);
        toast({
          title: "Saved",
          description: config.successMessage,
        });
      } else {
        toast({
          title: "Error",
          description: "Internal Server Error",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Internal Server Error",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{config.title}</h1>
          <p className="text-muted-foreground mt-1">{config.subtitle}</p>
        </div>
        <Button onClick={savePolicy} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>{config.cardTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <MinimalTiptapEditor
                value={value}
                onChange={setValue}
                className="w-full"
                editorContentClassName="p-5"
                output="html"
                placeholder={config.placeholder}
                autofocus={true}
                editable={true}
                editorClassName="focus:outline-none"
              />
              <p className="text-xs text-muted-foreground">
                Use Markdown formatting for headers, lists, and other text formatting.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPolicyEditor;
