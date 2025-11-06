
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { api } from '@/lib/apiClient';
import { toast } from '@/hooks/use-toast';
import { MinimalTiptapEditor } from '@/minimal-tiptap'
import { Content } from '@tiptap/react'

const AdminRefund = () => {
  const [value, setValue] = useState<Content>(sessionStorage.getItem('refund'));
  const [isLoading, setIsLoading] = useState(false);

  async function saveRefund() {
    setIsLoading(true);
    const serializedValue = typeof value === 'string' ? value : JSON.stringify(value ?? '');

    try {
      const response = await api.admin.saveSettings({ data: serializedValue, type: 'refund' });
      if (response.data.success) {
        sessionStorage.setItem('refund', serializedValue);
        toast({
          title: "Saved",
          description: "Refund policy saved successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.data.message ?? "Internal Server Error",
        });
      }
    } catch (error) {
      console.error('Failed to save refund policy', error);
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
          <h1 className="text-3xl font-bold tracking-tight">Refund Policy</h1>
          <p className="text-muted-foreground mt-1">Manage your refund policy content</p>
        </div>
        <Button onClick={saveRefund}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? 'Saving...' : ' Save Changes'}
        </Button>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Edit Refund Policy</CardTitle>
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
                placeholder="Start writing Refund Policy."
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

export default AdminRefund;
