
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { MinimalTiptapEditor } from '@/minimal-tiptap'
import { api } from '@/lib/apiClient';
import { toast } from '@/hooks/use-toast';
import { Content } from '@tiptap/react'

const AdminCancellation = () => {
  const [value, setValue] = useState<Content>(sessionStorage.getItem('cancel'));
  const [isLoading, setIsLoading] = useState(false);

  async function saveCancellation() {
    setIsLoading(true);
    const serializedValue = typeof value === 'string' ? value : JSON.stringify(value ?? '');

    try {
      const response = await api.admin.saveSettings({ data: serializedValue, type: 'cancel' });
      if (response.data.success) {
        sessionStorage.setItem('cancel', serializedValue);
        toast({
          title: "Saved",
          description: "Cancellation policy saved successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.data.message ?? "Internal Server Error",
        });
      }
    } catch (error) {
      console.error('Failed to save cancellation policy', error);
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
          <h1 className="text-3xl font-bold tracking-tight">Cancellation Policy</h1>
          <p className="text-muted-foreground mt-1">Manage your cancellation policy content</p>
        </div>
        <Button onClick={saveCancellation}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? 'Saving...' : ' Save Changes'}
        </Button>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Edit Cancellation Policy</CardTitle>
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
                placeholder="Start writing Cancellation Policy."
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

export default AdminCancellation;
