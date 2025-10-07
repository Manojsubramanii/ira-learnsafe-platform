import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Upload, Loader2, BookOpen, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  name: string;
  description: string | null;
  duration: string | null;
  timings: string | null;
}

interface CourseManagementProps {
  userId: string;
}

const CourseManagement = ({ userId }: CourseManagementProps) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: "",
    timings: "",
  });

  const [uploadData, setUploadData] = useState({
    title: "",
    file: null as File | null,
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setCourses(data || []);
    }
    setLoading(false);
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase.from("courses").insert({
      ...formData,
      created_by: userId,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Course created successfully" });
      setFormData({ name: "", description: "", duration: "", timings: "" });
      setDialogOpen(false);
      fetchCourses();
    }
  };

  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadData.file || !selectedCourse) return;

    const fileExt = uploadData.file.name.split(".").pop();
    const filePath = `${selectedCourse}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("course-materials")
      .upload(filePath, uploadData.file);

    if (uploadError) {
      toast({ title: "Error", description: uploadError.message, variant: "destructive" });
      return;
    }

    const { error: dbError } = await supabase.from("course_materials").insert({
      course_id: selectedCourse,
      title: uploadData.title,
      file_path: filePath,
      file_type: uploadData.file.type,
      uploaded_by: userId,
    });

    if (dbError) {
      toast({ title: "Error", description: dbError.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Material uploaded successfully" });
      setUploadData({ title: "", file: null });
      setUploadDialogOpen(false);
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
        <h2 className="text-2xl font-bold">Course Management</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Course Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  placeholder="e.g., 3 months"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timings">Timings</Label>
                <Input
                  id="timings"
                  placeholder="e.g., Mon-Fri 9AM-12PM"
                  value={formData.timings}
                  onChange={(e) => setFormData({ ...formData, timings: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full">Create Course</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No courses created yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{course.name}</CardTitle>
                {course.description && (
                  <CardDescription>{course.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                {course.duration && (
                  <p className="text-sm"><span className="font-medium">Duration:</span> {course.duration}</p>
                )}
                {course.timings && (
                  <p className="text-sm"><span className="font-medium">Timings:</span> {course.timings}</p>
                )}
                <Dialog open={uploadDialogOpen && selectedCourse === course.id} onOpenChange={(open) => {
                  setUploadDialogOpen(open);
                  if (open) setSelectedCourse(course.id);
                }}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full mt-2">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Material
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Course Material</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUploadMaterial} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="material-title">Material Title</Label>
                        <Input
                          id="material-title"
                          value={uploadData.title}
                          onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="material-file">File</Label>
                        <Input
                          id="material-file"
                          type="file"
                          onChange={(e) => setUploadData({ ...uploadData, file: e.target.files?.[0] || null })}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">Upload</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
