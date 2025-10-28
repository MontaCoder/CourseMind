
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/apiClient';
import { toast } from '@/hooks/use-toast';
import { MinimalTiptapEditor } from '../../minimal-tiptap'
import { Content } from '@tiptap/react'
import { Save } from 'lucide-react';

const AdminSubscriptionBilling = () => {
  const [value, setValue] = useState<Content>(sessionStorage.getItem('billing'));
  const [isLoading, setIsLoading] = useState(false);

  async function saveBilling() {
    setIsLoading(true);
    const serializedValue = typeof value === 'string' ? value : JSON.stringify(value ?? '');

    try {
      const response = await api.admin.saveSettings({ data: serializedValue, type: 'billing' });
      if (response.data.success) {
        sessionStorage.setItem('billing', serializedValue);
        toast({
          title: "Saved",
          description: "Subscription & Billing policy saved successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.data.message ?? "Internal Server Error",
        });
      }
    } catch (error) {
      console.error('Failed to save subscription & billing policy', error);
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
          <h1 className="text-3xl font-bold tracking-tight">Subscription & Billing Policy</h1>
          <p className="text-muted-foreground mt-1">Manage subscription and billing policy content</p>
        </div>
        <Button onClick={saveBilling}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? 'Saving...' : ' Save Changes'}
        </Button>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Edit Subscription & Billing Policy</CardTitle>
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
                placeholder="Start writing Subscription & Billing Policy."
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

export default AdminSubscriptionBilling;
