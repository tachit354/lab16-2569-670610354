import { useState } from "react";
import { PlusCircle, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEnrollmentStore } from "@/lib/enrollment-store";

type Option = { value: string; label: string };

function OptionSelect({
  id,
  options,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <Select
      items={options}
      value={value}
      onValueChange={(v) => onChange(v as string)}
    >
      <SelectTrigger id={id} className="w-full max-w-88">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function AdminEnrollmentsPage() {
  const { students, courses, enroll, drop } = useEnrollmentStore();

  // const [formStudent, setFormStudent] = useState<string | null>(null);
  const [formCourse, setFormCourse] = useState<string | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentInput, setStudentInput] = useState("");
  const anchorRef = useComboboxAnchor();
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [mode, setMode] = useState<"course" | "student">("course");
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterStudent, setFilterStudent] = useState("all");

  const studentOptions: Option[] = students.map((s) => ({
    value: s.studentId,
    label: `${s.studentId} — ${s.firstName} ${s.lastName}`,
  }));

  const courseOptions: Option[] = courses.map((c) => ({
    value: c.courseCode,
    label: `${c.courseCode} — ${c.courseTitle}`,
  }));

  const availableStudents = students.filter((s) => {
    if (!formCourse) return true;
    return !s.enrolledCourses?.includes(formCourse);
  });

  const availableStudentOptions: Option[] = availableStudents.map((s) => ({
    value: s.studentId,
    label: `${s.studentId} — ${s.firstName} ${s.lastName}`,
  }));

  // กรองรายชื่อนักศึกษาตามที่พิมพ์ใน Combobox
  const filteredStudentOptions = availableStudentOptions.filter((student) =>
    student.label.toLowerCase().includes(studentInput.trim().toLowerCase()),
  );

  const handleEnroll = () => {
    if (selectedStudentIds.length === 0 || !formCourse) return;
    // enroll(formStudent, formCourse);
    selectedStudentIds.forEach((studentId) => {
      enroll(studentId, formCourse);
    });
    setFormCourse(null);
    setSelectedStudentIds([]);
    setEnrollDialogOpen(false);
  };

  // เคลียร์ฟอร์มทุกครั้งที่ Dialog ปิด ไม่ว่าจะปิดเพราะลงทะเบียนสำเร็จ, กด X,
  // หรือคลิกนอก Dialog — เปิดครั้งหน้าจะได้เริ่มจากฟอร์มว่างเสมอ
  const handleEnrollDialogOpenChange = (open: boolean) => {
    setEnrollDialogOpen(open);
    if (!open) {
      setSelectedStudentIds([]);
      setFormCourse(null);
    }
  };

  const rows = courses.filter((e) =>
    mode === "course"
      ? filterCourse === "all" || e.courseCode === filterCourse
      : filterStudent === "all" ||
        students
          .find((x) => x.studentId === filterStudent)
          ?.enrolledCourses?.includes(e.courseCode),
  );
  const titleOf = (courseId: string) =>
    courses.find((c) => c.courseCode === courseId)?.courseTitle ?? "-";

  const coursetitleof = (courseCode: string) => {
    const s = students.filter((e) => e.enrolledCourses?.includes(courseCode));
    return s;
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">จัดการการลงทะเบียน</h1>
        <p className="text-sm text-muted-foreground">
          Admin ลงทะเบียนและยกเลิกการลงทะเบียนให้นักศึกษาได้ทุกคน
        </p>
      </div>

      <Dialog
        open={enrollDialogOpen}
        onOpenChange={handleEnrollDialogOpenChange}
      >
        <DialogTrigger render={<Button />}>
          <PlusCircle className="h-4 w-4" />
          ลงทะเบียนให้นักศึกษา
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ลงทะเบียนให้นักศึกษา</DialogTitle>
            <DialogDescription>
              เลือกนักศึกษาก่อน แล้วเลือกวิชาที่ยังไม่ได้ลงทะเบียน
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            {/* <div className="grid gap-1.5">
              <Label htmlFor="formStudent">นักศึกษา</Label>
              <OptionSelect
                id="formStudent"
                options={studentOptions}
                value={formStudent}
                placeholder="เลือกนักศึกษา"
                onChange={(v) => {
                  setFormStudent(v);
                  setFormCourse(null);
                }}
              />
            </div> */}

            <div className="grid gap-1.5">
              <Label htmlFor="formCourse">วิชา</Label>
              <OptionSelect
                id="formCourse"
                options={courseOptions}
                value={formCourse}
                placeholder="เลือกวิชา"
                onChange={(v) => {
                  setFormCourse(v);
                  setSelectedStudentIds([]);
                }}
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="formStudent">นักศึกษา</Label>
              <Combobox
                multiple
                disabled={!formCourse}
                value={selectedStudentIds}
                onValueChange={(values) =>
                  setSelectedStudentIds(values as string[])
                }
              >
                <ComboboxChips ref={anchorRef} className="w-full">
                  <ComboboxValue>
                    {(values: string[]) =>
                      values.map((id) => {
                        const student = students.find(
                          (s) => s.studentId === id,
                        );
                        return (
                          <ComboboxChip key={id}>
                            {student
                              ? `${student.firstName} ${student.lastName}`
                              : id}
                          </ComboboxChip>
                        );
                      })
                    }
                  </ComboboxValue>
                  <ComboboxChipsInput
                    value={studentInput}
                    onChange={(e) => setStudentInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && studentInput.trim()) {
                        e.preventDefault();
                        const matched = filteredStudentOptions[0];
                        if (
                          matched &&
                          !selectedStudentIds.includes(matched.value)
                        ) {
                          setSelectedStudentIds([
                            ...selectedStudentIds,
                            matched.value,
                          ]);
                          setStudentInput("");
                        }
                      }
                    }}
                    placeholder={
                      selectedStudentIds.length > 0
                        ? ""
                        : formCourse
                          ? "ค้นหา/เลือกนักศึกษา"
                          : "เลือกวิชาก่อน"
                    }
                  />
                </ComboboxChips>
                <ComboboxContent anchor={anchorRef}>
                  <ComboboxList>
                    {filteredStudentOptions.length === 0 ? (
                      <ComboboxEmpty>ไม่พบรายชื่อนักศึกษา</ComboboxEmpty>
                    ) : (
                      filteredStudentOptions.map((student) => (
                        <ComboboxItem key={student.value} value={student.value}>
                          {student.label}
                        </ComboboxItem>
                      ))
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={selectedStudentIds.length === 0 || !formCourse}
              onClick={handleEnroll}
            >
              <PlusCircle className="h-4 w-4" />
              {`ลงทะเบียน ${selectedStudentIds.length > 0 ? `(${selectedStudentIds.length} คน)` : ""}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs
        value={mode}
        onValueChange={(v) => setMode(v as "course" | "student")}
      >
        <TabsList>
          <TabsTrigger value="course">ค้นหาตามวิชา</TabsTrigger>
          <TabsTrigger value="student">ค้นหาตามนักศึกษา</TabsTrigger>
        </TabsList>
        <TabsContent value="course" className="pt-2">
          <OptionSelect
            id="filterCourse"
            options={[{ value: "all", label: "ทุกวิชา" }, ...courseOptions]}
            value={filterCourse}
            onChange={setFilterCourse}
          />
        </TabsContent>
        <TabsContent value="student" className="pt-2">
          <OptionSelect
            id="filterStudent"
            options={[{ value: "all", label: "ทุกคน" }, ...studentOptions]}
            value={filterStudent}
            onChange={setFilterStudent}
          />
        </TabsContent>
      </Tabs>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสวิชา</TableHead>
              <TableHead>ชื่อวิชา</TableHead>
              <TableHead>จำนวนนักศึกษา</TableHead>
              <TableHead>นักศึกษาที่ลงทะเบียน</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-20 text-center text-muted-foreground"
                >
                  ไม่พบข้อมูลการลงทะเบียน
                </TableCell>
              </TableRow>
            )}
            {rows.map((e) => (
              <TableRow key={`${e.courseCode}-${e.courseTitle}`}>
                {/* <TableCell>{e.studentId}</TableCell>
                <TableCell>{nameOf(e.studentId)}</TableCell> */}
                <TableCell>{e.courseCode}</TableCell>
                <TableCell>{titleOf(e.courseCode)}</TableCell>
                <TableCell>{coursetitleof(e.courseCode).length}</TableCell>
                <TableCell>
                  {coursetitleof(e.courseCode).length === 0 ? (
                    <span className="text-muted-foreground">
                      ยังไม่มีนักศึกษาลงทะเบียน
                    </span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {coursetitleof(e.courseCode).map((x) => (
                        <Badge className="text-muted-foreground gap-1 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
                          {`${x.firstName} ${x.lastName}`}
                          <Button
                            onClick={() => drop(x.studentId, e.courseCode)}
                            className="text-bule-700 hover:text-red-600 h-3 w-3"
                            variant="ghost"
                          >
                            <X className="h-3 w-3"></X>
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
