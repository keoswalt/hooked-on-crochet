
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface DebugPanelProps {
  planId: string;
  userId: string;
}

export const DebugPanel = ({ planId, userId }: DebugPanelProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const { toast } = useToast();

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testAuthentication = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (sessionError || userError) {
        addTestResult(`❌ Auth Error: ${sessionError?.message || userError?.message}`);
        return;
      }
      
      if (!session || !user) {
        addTestResult('❌ No active session or user');
        return;
      }
      
      addTestResult(`✅ Auth OK: User ${user.id} (matches props: ${user.id === userId})`);
    } catch (error: any) {
      addTestResult(`❌ Auth Exception: ${error.message}`);
    }
  };

  const testPlanAccess = async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('id, user_id, name')
        .eq('id', planId)
        .single();
      
      if (error) {
        addTestResult(`❌ Plan Access Error: ${error.message}`);
        return;
      }
      
      if (!data) {
        addTestResult('❌ Plan not found');
        return;
      }
      
      addTestResult(`✅ Plan Access OK: ${data.name} (owner: ${data.user_id})`);
    } catch (error: any) {
      addTestResult(`❌ Plan Access Exception: ${error.message}`);
    }
  };

  const testDirectInsert = async () => {
    try {
      const testElement = {
        plan_id: planId,
        element_type: 'text',
        position_x: 100,
        position_y: 100,
        width: 200,
        height: 60,
        properties: { content: 'Debug Test Element' }
      };
      
      const { data, error } = await supabase
        .from('canvas_elements')
        .insert(testElement)
        .select()
        .single();
      
      if (error) {
        addTestResult(`❌ Insert Error: ${error.message} (Code: ${error.code})`);
        return;
      }
      
      addTestResult(`✅ Insert OK: Element ${data.id} created`);
      
      // Clean up test element
      await supabase.from('canvas_elements').delete().eq('id', data.id);
      addTestResult(`🧹 Test element cleaned up`);
      
    } catch (error: any) {
      addTestResult(`❌ Insert Exception: ${error.message}`);
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    addTestResult('🔄 Starting debug tests...');
    await testAuthentication();
    await testPlanAccess();
    await testDirectInsert();
    addTestResult('✅ All tests completed');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50"
      >
        Debug
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-96 z-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex justify-between items-center">
          Debug Panel
          <Button onClick={() => setIsVisible(false)} variant="ghost" size="sm">
            ×
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex space-x-2">
          <Button onClick={testAuthentication} size="sm" variant="outline">
            Test Auth
          </Button>
          <Button onClick={testPlanAccess} size="sm" variant="outline">
            Test Plan
          </Button>
          <Button onClick={testDirectInsert} size="sm" variant="outline">
            Test Insert
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button onClick={runAllTests} size="sm">
            Run All Tests
          </Button>
          <Button onClick={clearResults} size="sm" variant="outline">
            Clear
          </Button>
        </div>
        <div className="max-h-48 overflow-y-auto bg-gray-50 p-2 rounded text-xs">
          {testResults.length === 0 ? (
            <p className="text-gray-500">No test results yet</p>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="mb-1">
                {result}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
