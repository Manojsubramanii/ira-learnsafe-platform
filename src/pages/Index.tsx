import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, FileText, Shield } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 mb-16">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center shadow-elevated">
            <GraduationCap className="w-10 h-10 text-primary-foreground" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              IRA
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
              Intelligent Resource Academy
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A secure, intelligent Learning Management System designed for educational institutions
            </p>
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" onClick={() => navigate("/auth")} className="shadow-lg">
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-card p-6 rounded-xl shadow-card hover:shadow-elevated transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Course Materials</h3>
            <p className="text-muted-foreground">
              Access and download course materials uploaded by instructors
            </p>
          </div>

          <div className="bg-card p-6 rounded-xl shadow-card hover:shadow-elevated transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure Testing</h3>
            <p className="text-muted-foreground">
              Take tests and exams with built-in security and screen monitoring
            </p>
          </div>

          <div className="bg-card p-6 rounded-xl shadow-card hover:shadow-elevated transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Built-in Compiler</h3>
            <p className="text-muted-foreground">
              Code and compile directly within tests supporting C, C++, Java, Python
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
