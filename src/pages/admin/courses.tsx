import { useState } from "react";
import { CirclePlus, X, Trash } from "lucide-react";

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

// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

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
  ComboboxChips,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "@/components/ui/combobox";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useEnrollmentStore } from "@/lib/enrollment-store";

// type Option = { value: string; label: string };

// function OptionSelect({
//   id,
//   options,
//   value,
//   onChange,
//   placeholder,
// }: {
//   id: string;
//   options: Option[];
//   value: string | null;
//   onChange: (value: string) => void;
//   placeholder?: string;
// }) {
//   return (
//     <Select
//       items={options}
//       value={value}
//       onValueChange={(v) => onChange(v as string)}
//     >
//       <SelectTrigger id={id} className="w-full">
//         <SelectValue placeholder={placeholder} />
//       </SelectTrigger>
//       <SelectContent>
//         {options.map((o) => (
//           <SelectItem key={o.value} value={o.value}>
//             {o.label}
//           </SelectItem>
//         ))}
//       </SelectContent>
//     </Select>
//   );
// }

export default function AdminCoursesPage() {
  const { courses, enrollments, enroll } = useEnrollmentStore();

  // state ของฟอร์มใน Dialog
  const [courseCode, setCourseCode] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  // const [setInstructors] = useState<string[]>([]);
  const [formStudent, setFormStudent] = useState<string | null>(null);
  const [formCourse, setFormCourse] = useState<string | null>(null);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [mode] = useState<"course" | "student">("course");
  const [filterCourse] = useState("all");
  const [filterStudent] = useState("all");

  // const courseOptions: Option[] = courses.map((c) => ({
  //   value: c.courseCode,
  //   label: `${c.courseCode} — ${c.courseTitle}`,
  // }));

  // ตรวจสอบว่ารหัสวิชาซ้ำหรือไม่
  const isDuplicateCode = courses.some(
    (c) => c.courseCode.toLowerCase() === courseCode.trim().toLowerCase(),
  );

  const handleEnroll = () => {
    if (!formStudent || !formCourse) return;
    enroll(formStudent, formCourse);
    setEnrollDialogOpen(false);
  };

  // เคลียร์ฟอร์มทุกครั้งที่ Dialog ปิด ไม่ว่าจะปิดเพราะลงทะเบียนสำเร็จ, กด X,
  // หรือคลิกนอก Dialog — เปิดครั้งหน้าจะได้เริ่มจากฟอร์มว่างเสมอ
  const handleEnrollDialogOpenChange = (open: boolean) => {
    setEnrollDialogOpen(open);
    if (!open) {
      setFormStudent(null);
      setFormCourse(null);
      setCourseCode("");
      setCourseTitle("");
      // setInstructors([]);
    }
  };

  const rows = enrollments.filter((e) =>
    mode === "course"
      ? filterCourse === "all" || e.courseId === filterCourse
      : filterStudent === "all" || e.studentId === filterStudent,
  );

  // const titleOf = (courseId: string) =>
  //   courses.find((c) => c.courseCode === courseId)?.courseTitle ?? "-";

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">จัดการวิชาเรียน</h1>
          <p className="text-sm text-muted-foreground">
            5 วิชา — เพิ่มวิชาใหม่ที่นี่แล้วจะไปโผล่เป็นตัวเลือก
            ตอนลงทะเบียนให้นักศึกษาที่หน้า "จัดการการลงทะเบียน" ทันที
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
                  placeholder="เช่น CPE303"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                />
                {isDuplicateCode && courseCode && (
                  <span className="text-xs text-red-500">
                    มีรหัสวิชา {courseCode} นี้แล้ว
                  </span>
                )}
              </div>

              {/* ชื่อวิชา */}
              <div className="grid gap-1.5">
                <Label htmlFor="courseTitle">ชื่อวิชา</Label>
                <Input
                  id="courseTitle"
                  placeholder="เช่น Introduction to Programming"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="formCourse">ผู้สอน</Label>
                {/* <OptionSelect
                  id="formCourse"
                  options={availableCourseOptions}
                  value={formCourse}
                  placeholder={
                    formStudent && availableCourseOptions.length === 0
                      ? "ลงทะเบียนครบทุกวิชาแล้ว"
                      : "เลือกวิชา"
                  }
                  onChange={setFormCourse}
                /> */}
                <Input></Input>
                <Combobox
                  multiple
                  autoHighlight
                  // items={frameworks}
                  // defaultValue={[frameworks[0]]}
                >
                  <ComboboxChips className="w-full max-w-xs">
                    <ComboboxValue></ComboboxValue>
                  </ComboboxChips>
                  <ComboboxContent>
                    <ComboboxEmpty>No items found.</ComboboxEmpty>
                    <ComboboxList>
                      {courses.map((e) => (
                        <ComboboxItem key={e.courseCode} value={e.courseCode}>
                          {e.instructors}
                        </ComboboxItem>
                      ))}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
            </div>
            <DialogFooter>
              <Button
                disabled={!courseCode || !courseTitle}
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
            {courses.map((e) => (
              <TableRow key={`${e.instructors}-${e.courseCode}`}>
                <TableCell>{e.courseCode}</TableCell>
                {/* <TableCell>{titleOf(e.courseId)}</TableCell> */}
                <TableCell>{e.courseTitle}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5">
                    {e.instructors?.map((x) => (
                      <Badge className="text-muted-foreground gap-1 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
                        {x}
                        <Button
                          className="text-bule-700 hover:text-red-600 h-3 w-3"
                          variant="ghost"
                        >
                          <X className="h-3 w-3"></X>
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    className="text-red-600 dark:text-red-600 hover:text-red-600"
                    variant="ghost"
                  >
                    <Trash></Trash>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
