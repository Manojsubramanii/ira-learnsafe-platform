import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Loader2, FileText, ToggleLeft, ToggleRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Test {
  id: string;
  title: string;
  description: string | null;
  type: string;
  question_type: string;
  duration_minutes: number;
  is_active: boolean;
  courses: {
    name: string;
  };
}

interface TestManagementProps {
  userId: string;
}

const TestManagement = ({ userId }: TestManagementProps) => {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    const { data, error } = await supabase
      .from("tests")
      .select("*, courses(name)")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setTests(data || []);
    }
    setLoading(false);
  };

  const toggleTestStatus = async (testId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("tests")
      .update({ is_active: !currentStatus })
      .eq("id", testId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ 
        title: "Success", 
        description: `Test ${!currentStatus ? "activated" : "deactivated"}` 
      });
      fetchTests();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Test & Exam Management</h2>
        <Button onClick={() => navigate("/admin/create-test")}>
          <Plus className="w-4 h-4 mr-2" />
          Create Test
        </Button>
      </div>

      {tests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No tests created yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {tests.map((test) => (
            <Card key={test.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{test.title}</CardTitle>
                    <CardDescription>{test.courses.name}</CardDescription>
                  </div>
                  <Badge variant={test.type === "exam" ? "destructive" : "secondary"}>
                    {test.type.toUpperCase()}
                  </Badge>
                </div>
                {test.description && (
                  <p className="text-sm text-muted-foreground mt-2">{test.description}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Duration:</span>
                  <span>{test.duration_minutes} minutes</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Question Type:</span>
                  <Badge variant="outline">{test.question_type.toUpperCase()}</Badge>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm font-medium">Status:</span>
                  <Button
                    variant={test.is_active ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleTestStatus(test.id, test.is_active)}
                  >
                    {test.is_active ? (
                      <>
                        <ToggleRight className="w-4 h-4 mr-2" />
                        Active
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4 mr-2" />
                        Inactive
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestManagement;
