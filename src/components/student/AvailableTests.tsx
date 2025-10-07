import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Clock, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

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

interface AvailableTestsProps {
  userId: string;
}

const AvailableTests = ({ userId }: AvailableTestsProps) => {
  const [tests, setTests] = useState<Test[]>([]);
  const [attempts, setAttempts] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTests();
  }, [userId]);

  const fetchTests = async () => {
    const { data: testsData } = await supabase
      .from("tests")
      .select("*, courses(name)")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    const { data: attemptsData } = await supabase
      .from("test_attempts")
      .select("test_id")
      .eq("student_id", userId);

    if (testsData) setTests(testsData);
    
    if (attemptsData) {
      const attemptsMap: Record<string, boolean> = {};
      attemptsData.forEach((attempt) => {
        attemptsMap[attempt.test_id] = true;
      });
      setAttempts(attemptsMap);
    }

    setLoading(false);
  };

  const handleStartTest = (testId: string) => {
    navigate(`/test/${testId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (tests.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No active tests available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {tests.map((test) => {
        const hasAttempted = attempts[test.id];
        
        return (
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
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{test.duration_minutes} minutes</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Type:</span>
                <Badge variant="outline">{test.question_type.toUpperCase()}</Badge>
              </div>
              
              {hasAttempted ? (
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>Already attempted</span>
                </div>
              ) : (
                <Button 
                  className="w-full" 
                  onClick={() => handleStartTest(test.id)}
                >
                  Start Test
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AvailableTests;
