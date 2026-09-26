import { useState } from "react";
import { CirclePlus, X, Trash } from "lucide-react";

import type { Course } from "@/lib/types";
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
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useEnrollmentStore } from "@/lib/enrollment-store";

export default function AdminCoursesPage() {
  const { courses, addCourse, removeInstructor, removeCourse } =
    useEnrollmentStore();

  // state ของฟอร์มใน Dialog
  // const [courseCode, setCourseCode] = useState("");
  // const [courseTitle, setCourseTitle] = useState("");
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const anchorRef = useComboboxAnchor();
  // const [setInstructors] = useState<string[]>([]);
  // const [formStudent, setFormStudent] = useState<string | null>(null);
  const [SelectedInstructor, setSelectedInstructor] = useState<string[]>([]);
  const [CodeCourse, setCodeCourse] = useState<string>("");
  const [NameCourse, setNameCourse] = useState<string>("");
  const [instructorInput, setInstructorInput] = useState("");
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);

  const confirmDeleteCourse = () => {
    if (courseToDelete) {
      removeCourse(courseToDelete.courseCode);
      setCourseToDelete(null);
    }
  };

  // ดึงรายชื่อผู้สอนทั้งหมดจากทุกวิชามาแบบไม่ซ้ำกัน
  const allInstructors = Array.from(
    new Set(courses.flatMap((c) => c.instructors || [])),
  );

  // เช็คว่ามีรหัสวิชานี้อยู่แล้วในระบบหรือไม่ (เทียบแบบ Case-insensitive เพื่อความแม่นยำ)
  const isDuplicateCode = courses.some(
    (c) =>
      c.courseCode.trim().toLowerCase() === CodeCourse.trim().toLowerCase(),
  );

  // เช็คว่าข้อความที่พิมพ์ตรงกับผู้สอนที่มีอยู่แล้วหรือไม่ (Case-insensitive)
  const trimmedInput = instructorInput.trim();
  const isInstructorExists = allInstructors.some(
    (teacher) => teacher.toLowerCase() === trimmedInput.toLowerCase(),
  );

  // กรองรายชื่อผู้สอนให้ตรงกับคำที่พิมพ์ (ไม่สนตัวพิมพ์เล็ก-ใหญ่)
  const filteredInstructors = allInstructors.filter((teacher) =>
    teacher.toLowerCase().includes(instructorInput.trim().toLowerCase()),
  );

  const handleEnroll = () => {
    if (!CodeCourse || !NameCourse || isDuplicateCode) return;
    addCourse({
      courseCode: CodeCourse,
      courseTitle: NameCourse,
      instructors: SelectedInstructor,
    });
    setCodeCourse("");
    setNameCourse("");
    setInstructorInput("");
    setSelectedInstructor([]);
    setEnrollDialogOpen(false);
  };

  // เคลียร์ฟอร์มทุกครั้งที่ Dialog ปิด ไม่ว่าจะปิดเพราะลงทะเบียนสำเร็จ, กด X,
  // หรือคลิกนอก Dialog — เปิดครั้งหน้าจะได้เริ่มจากฟอร์มว่างเสมอ
  const handleEnrollDialogOpenChange = (open: boolean) => {
    setEnrollDialogOpen(open);
    if (!open) {
      setCodeCourse("");
      setNameCourse("");
      setInstructorInput("");
      setSelectedInstructor([]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">จัดการวิชาเรียน</h1>
          <p className="text-sm text-muted-foreground">
            {`${courses.length} วิชา — เพิ่มวิชาใหม่ที่นี่แล้วจะไปโผล่เป็นตัวเลือก
          ตอนลงทะเบียนให้นักศึกษาที่หน้า "จัดการการลงทะเบียน" ทันที`}
          </p>
        </div>
        <Dialog
          open={enrollDialogOpen}
          onOpenChange={handleEnrollDialogOpenChange}
        >
          <DialogTrigger render={<Button />}>
            <CirclePlus /> เพิ่มวิชา
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>เพิ่มวิชาใหม่</DialogTitle>
              <DialogDescription>
                วิชาที่เพิ่มจะไปโผล่เป็นตัวเลือกตอนลงทะเบียนให้นักศึกษาได้ทันที
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              {/* รหัสวิชา */}
              <div className="grid gap-1.5">
                <Label htmlFor="courseCode">รหัสวิชา</Label>
                <Input
                  id="courseCode"
                  placeholder="เช่น 261207"
                  value={CodeCourse}
                  onChange={(e) => setCodeCourse(e.target.value)}
                  className={
                    isDuplicateCode && CodeCourse
                      ? "border-red-500 ring-red-200 focus-visible:ring-red-200 border-red-500"
                      : ""
                  }
                />
                {isDuplicateCode && CodeCourse && (
                  <span className="text-xs text-red-500">
                    มีรหัสวิชา {CodeCourse} นี้แล้ว
                  </span>
                )}
              </div>

              {/* ชื่อวิชา */}
              <div className="grid gap-1.5">
                <Label htmlFor="courseTitle">ชื่อวิชา</Label>
                <Input
                  id="courseTitle"
                  placeholder="เช่น Introduction to Programming"
                  value={NameCourse}
                  onChange={(e) => setNameCourse(e.target.value)}
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="formStudent">นักศึกษา</Label>
                <Combobox
                  multiple
                  value={SelectedInstructor}
                  onValueChange={(values) => {
                    setSelectedInstructor(values as string[]);
                    setInstructorInput("");
                  }}
                >
                  <ComboboxChips ref={anchorRef} className="w-full">
                    <ComboboxValue>
                      {(values: string[]) =>
                        values.map((teacher) => {
                          return (
                            <ComboboxChip key={teacher}>{teacher}</ComboboxChip>
                          );
                        })
                      }
                    </ComboboxValue>
                    <ComboboxChipsInput
                      value={instructorInput}
                      onChange={(e) => setInstructorInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && instructorInput.trim()) {
                          e.preventDefault();
                          const trimmed = instructorInput.trim();

                          // ค้นหาว่ามีชื่อที่ตรงกับที่พิมพ์ไหม (เทียบตัวพิมพ์เล็ก-ใหญ่)
                          const matchedTeacher = allInstructors.find(
                            (t) => t.toLowerCase() === trimmed.toLowerCase(),
                          );

                          // ถ้ารายการที่กรองอยู่มีผลลัพธ์ ให้เอาตัวแรก หรือถ้ามีชื่อตรงกัน ให้เอาชื่อนั้น
                          const targetValue =
                            matchedTeacher || filteredInstructors[0] || trimmed;

                          // ถ้ายังไม่มีใน SelectedInstructor ให้เพิ่มเข้าไป
                          if (!SelectedInstructor.includes(targetValue)) {
                            setSelectedInstructor([
                              ...SelectedInstructor,
                              targetValue,
                            ]);
                          }

                          // เคลียร์ช่องพิมพ์
                          setInstructorInput("");
                        }
                      }}
                      placeholder={
                        SelectedInstructor.length > 0
                          ? ""
                          : "เลือกหรือพิมพ์ชื่อผู้สอน (ได้หลายคน)"
                      }
                    />
                  </ComboboxChips>
                  <ComboboxContent anchor={anchorRef}>
                    <ComboboxList>
                      {filteredInstructors.map((teacher) => (
                        <ComboboxItem key={teacher} value={teacher}>
                          {teacher}
                        </ComboboxItem>
                      ))}
                      {/* แสดงปุ่มเพิ่มผู้สอนใหม่เมื่อพิมพ์ข้อความและยังไม่มีในรายชื่อ */}
                      {trimmedInput && !isInstructorExists && (
                        <ComboboxItem
                          value={trimmedInput}
                          // className="text-blue-600 font-medium"
                        >
                          + เพิ่มผู้สอน "{trimmedInput}"
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
            </div>
            <DialogFooter>
              <Button
                disabled={!CodeCourse || !NameCourse || isDuplicateCode}
                onClick={handleEnroll}
              >
                บันทึก
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสวิชา</TableHead>
              <TableHead>ชื่อวิชา</TableHead>
              <TableHead>ผู้สอน</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-20 text-center text-muted-foreground"
                >
                  ยังไม่มีวิชาที่เปิดสอน
                </TableCell>
              </TableRow>
            )}
            {courses.map((e) => (
              <TableRow key={`${e.instructors}-${e.courseCode}`}>
                <TableCell>{e.courseCode}</TableCell>
                {/* <TableCell>{titleOf(e.courseId)}</TableCell> */}
                <TableCell>{e.courseTitle}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5">
                    {e.instructors?.length === 0 ? (
                      <span className="text-muted-foreground">
                        ยังไม่มีผู้สอน
                      </span>
                    ) : (
                      e.instructors?.map((teacher) => (
                        <Badge className="text-muted-foreground gap-1 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
                          {teacher}
                          <Button
                            className="text-bule-700 hover:text-red-600 h-3 w-3"
                            variant="ghost"
                            onClick={() =>
                              removeInstructor(e.courseCode, teacher)
                            }
                          >
                            <X className="h-3 w-3"></X>
                          </Button>
                        </Badge>
                      ))
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    className="text-red-600 dark:text-red-600 hover:text-red-600"
                    variant="ghost"
                    onClick={() => setCourseToDelete(e)}
                  >
                    <Trash></Trash>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Dialog ยืนยันการลบวิชา */}
      <Dialog
        open={!!courseToDelete}
        onOpenChange={(open) => !open && setCourseToDelete(null)}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>ลบวิชา?</DialogTitle>
            <DialogDescription>
              ลบ {courseToDelete?.courseCode} — {courseToDelete?.courseTitle}{" "}
              ออกจากรายวิชาที่เปิดสอน
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2 flex gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setCourseToDelete(null)}>
              ยกเลิก
            </Button>
            <Button
              variant="destructive"
              className="bg-red-100 text-red-600 hover:bg-red-200 shadow-none"
              onClick={confirmDeleteCourse}
            >
              ยืนยัน
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
