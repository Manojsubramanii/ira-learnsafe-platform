import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  name: string;
}

interface AttendanceData {
  course_name: string;
  total_students: number;
  duration: string | null;
  timings: string | null;
}

const AttendanceTracking = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("id, name")
      .order("name");

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setCourses(data || []);
    }
    setLoading(false);
  };

  const fetchAttendanceData = async (courseId: string) => {
    const { data: courseData } = await supabase
      .from("courses")
      .select("name, duration, timings")
      .eq("id", courseId)
      .single();

    const { data: attendanceData, error } = await supabase
      .from("attendance")
      .select("student_id")
      .eq("course_id", courseId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    const uniqueStudents = new Set(attendanceData?.map(a => a.student_id) || []);

    setAttendanceData({
      course_name: courseData?.name || "",
      total_students: uniqueStudents.size,
      duration: courseData?.duration || null,
      timings: courseData?.timings || null,
    });
  };

  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId);
    fetchAttendanceData(courseId);
  };

  const exportToExcel = () => {
    if (!attendanceData) return;

    const csvContent = [
      ["Course Name", "Total Students", "Duration", "Timings"],
      [
        attendanceData.course_name,
        attendanceData.total_students,
        attendanceData.duration || "N/A",
        attendanceData.timings || "N/A",
      ],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${attendanceData.course_name}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({ title: "Success", description: "Attendance exported to Excel" });
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
      <h2 className="text-2xl font-bold">Attendance Tracking</h2>

      <Card>
        <CardHeader>
          <CardTitle>Select Course</CardTitle>
          <CardDescription>View attendance statistics for a course</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedCourse} onValueChange={handleCourseChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {attendanceData && (
        <Card>
          <CardHeader>
            <CardTitle>{attendanceData.course_name}</CardTitle>
            <CardDescription>Course Attendance Summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{attendanceData.total_students}</p>
              </div>
            </div>

            {attendanceData.duration && (
              <div className="space-y-1">
                <p className="text-sm font-medium">Duration</p>
                <p className="text-sm text-muted-foreground">{attendanceData.duration}</p>
              </div>
            )}

            {attendanceData.timings && (
              <div className="space-y-1">
                <p className="text-sm font-medium">Timings</p>
                <p className="text-sm text-muted-foreground">{attendanceData.timings}</p>
              </div>
            )}

            <Button onClick={exportToExcel} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Export to Excel
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AttendanceTracking;
