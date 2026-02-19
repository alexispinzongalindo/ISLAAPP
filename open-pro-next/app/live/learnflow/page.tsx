"use client";

import { ChangeEvent, useMemo, useState } from "react";

type Role = "instructor" | "student";

type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
};

type Lesson = {
  id: string;
  title: string;
  minutes: number;
  videoUrl: string;
  quiz: QuizQuestion[];
};

type Course = {
  id: string;
  title: string;
  category: string;
  description: string;
  instructorId: string;
  lessons: Lesson[];
  certificateEnabled: boolean;
};

type Student = {
  id: string;
  name: string;
  email: string;
};

type Instructor = {
  id: string;
  name: string;
  email: string;
  specialty: string;
};

type Enrollment = {
  studentId: string;
  courseId: string;
  completedLessonIds: string[];
  quizScores: Record<string, number>;
  certificateIssued: boolean;
};

type MailLog = {
  id: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
};

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function now() {
  return new Date().toLocaleString();
}

const starterCourse: Course = {
  id: "course-1",
  title: "Sales Call Mastery",
  category: "Business",
  description: "Run better discovery calls, present solutions, and close with confidence.",
  instructorId: "ins-1",
  certificateEnabled: true,
  lessons: [
    {
      id: "les-1",
      title: "Discovery Framework",
      minutes: 14,
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      quiz: [
        {
          id: "q-1",
          prompt: "What is the main goal of discovery?",
          options: ["Pitch fast", "Understand pain and goals", "Send pricing only", "Skip qualification"],
          correctIndex: 1,
        },
      ],
    },
    {
      id: "les-2",
      title: "Handling Objections",
      minutes: 18,
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      quiz: [
        {
          id: "q-2",
          prompt: "Best first response to an objection is:",
          options: ["Argue", "Discount immediately", "Clarify and validate", "End call"],
          correctIndex: 2,
        },
      ],
    },
  ],
};

const starterStudents: Student[] = [
  { id: "stu-1", name: "Jordan Lee", email: "jordan@example.com" },
  { id: "stu-2", name: "Maya Chen", email: "maya@example.com" },
];

const starterInstructors: Instructor[] = [
  { id: "ins-1", name: "Ava Ortiz", email: "ava@learnflow.local", specialty: "Sales" },
  { id: "ins-2", name: "Diego Park", email: "diego@learnflow.local", specialty: "Operations" },
];

export default function LearnFlowPage() {
  const [role, setRole] = useState<Role>("instructor");
  const [courses, setCourses] = useState<Course[]>([starterCourse]);
  const [students, setStudents] = useState<Student[]>(starterStudents);
  const [instructors, setInstructors] = useState<Instructor[]>(starterInstructors);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [mailLogs, setMailLogs] = useState<MailLog[]>([]);

  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseCategory, setNewCourseCategory] = useState("Business");
  const [newCourseDesc, setNewCourseDesc] = useState("");
  const [newCourseInstructorId, setNewCourseInstructorId] = useState(starterInstructors[0].id);

  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");

  const [newInstructorName, setNewInstructorName] = useState("");
  const [newInstructorEmail, setNewInstructorEmail] = useState("");
  const [newInstructorSpecialty, setNewInstructorSpecialty] = useState("");

  const [courseForLesson, setCourseForLesson] = useState(starterCourse.id);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonMinutes, setLessonMinutes] = useState(10);
  const [lessonVideoUrl, setLessonVideoUrl] = useState("");
  const [lessonVideoFileName, setLessonVideoFileName] = useState("");
  const [quizPrompt, setQuizPrompt] = useState("");
  const [quizOptions, setQuizOptions] = useState("Option A|Option B|Option C|Option D");
  const [quizCorrect, setQuizCorrect] = useState(0);

  const [activeStudentId, setActiveStudentId] = useState(starterStudents[0].id);
  const [activeCourseId, setActiveCourseId] = useState(starterCourse.id);
  const [activeLessonId, setActiveLessonId] = useState(starterCourse.lessons[0].id);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<string>("");

  const activeCourse = courses.find((c) => c.id === activeCourseId) ?? courses[0];
  const activeLesson = activeCourse?.lessons.find((l) => l.id === activeLessonId) ?? activeCourse?.lessons[0];
  const activeStudent = students.find((s) => s.id === activeStudentId) ?? students[0];

  const activeEnrollment = enrollments.find((e) => e.courseId === activeCourse?.id && e.studentId === activeStudent?.id);

  const dashboard = useMemo(() => {
    const totalLessons = courses.reduce((sum, c) => sum + c.lessons.length, 0);
    const completed = enrollments.reduce((sum, e) => sum + e.completedLessonIds.length, 0);
    const completionPct = totalLessons > 0 && enrollments.length > 0 ? Math.round((completed / (totalLessons * enrollments.length)) * 100) : 0;
    return {
      courses: courses.length,
      students: students.length,
      instructors: instructors.length,
      enrollments: enrollments.length,
      completionPct,
    };
  }, [courses, students, instructors, enrollments]);

  const addMailLog = (to: string, subject: string, body: string) => {
    setMailLogs((prev) => [{ id: uid("mail"), to, subject, body, sentAt: now() }, ...prev]);
  };

  const createCourse = () => {
    if (!newCourseTitle.trim()) return;
    const newCourse: Course = {
      id: uid("course"),
      title: newCourseTitle.trim(),
      category: newCourseCategory,
      description: newCourseDesc.trim() || "Course description pending.",
      instructorId: newCourseInstructorId,
      certificateEnabled: true,
      lessons: [],
    };
    setCourses((prev) => [newCourse, ...prev]);
    setNewCourseTitle("");
    setNewCourseDesc("");
    setCourseForLesson(newCourse.id);
    addMailLog("admin@learnflow.local", "Course created", `Course "${newCourse.title}" was created and is ready for lessons.`);
  };

  const createStudent = () => {
    if (!newStudentName.trim() || !newStudentEmail.trim()) return;
    if (students.some((s) => s.email.toLowerCase() === newStudentEmail.trim().toLowerCase())) return;
    const student: Student = { id: uid("stu"), name: newStudentName.trim(), email: newStudentEmail.trim() };
    setStudents((prev) => [student, ...prev]);
    setActiveStudentId(student.id);
    setNewStudentName("");
    setNewStudentEmail("");
    addMailLog(student.email, "Student profile created", `Welcome ${student.name}. Your learner profile is ready.`);
  };

  const createInstructor = () => {
    if (!newInstructorName.trim() || !newInstructorEmail.trim()) return;
    if (instructors.some((i) => i.email.toLowerCase() === newInstructorEmail.trim().toLowerCase())) return;
    const instructor: Instructor = {
      id: uid("ins"),
      name: newInstructorName.trim(),
      email: newInstructorEmail.trim(),
      specialty: newInstructorSpecialty.trim() || "General",
    };
    setInstructors((prev) => [instructor, ...prev]);
    setNewCourseInstructorId(instructor.id);
    setNewInstructorName("");
    setNewInstructorEmail("");
    setNewInstructorSpecialty("");
    addMailLog("admin@learnflow.local", "Instructor profile created", `Instructor "${instructor.name}" added to LearnFlow.`);
  };

  const onVideoFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const localBlobUrl = URL.createObjectURL(file);
    setLessonVideoUrl(localBlobUrl);
    setLessonVideoFileName(file.name);
  };

  const addLesson = () => {
    if (!lessonTitle.trim()) return;
    const options = quizOptions.split("|").map((o) => o.trim()).filter(Boolean);
    if (!quizPrompt.trim() || options.length < 2) return;
    const safeCorrect = Math.max(0, Math.min(quizCorrect, options.length - 1));
    const lesson: Lesson = {
      id: uid("les"),
      title: lessonTitle.trim(),
      minutes: lessonMinutes,
      videoUrl: lessonVideoUrl.trim() || "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      quiz: [{ id: uid("q"), prompt: quizPrompt.trim(), options, correctIndex: safeCorrect }],
    };

    setCourses((prev) =>
      prev.map((course) => (course.id === courseForLesson ? { ...course, lessons: [...course.lessons, lesson] } : course)),
    );

    setLessonTitle("");
    setLessonMinutes(10);
    setLessonVideoUrl("");
    setLessonVideoFileName("");
    setQuizPrompt("");
    setQuizOptions("Option A|Option B|Option C|Option D");
    setQuizCorrect(0);
  };

  const enrollStudent = () => {
    if (!activeCourse || !activeStudent) return;
    const exists = enrollments.some((e) => e.courseId === activeCourse.id && e.studentId === activeStudent.id);
    if (exists) return;
    setEnrollments((prev) => [
      ...prev,
      { courseId: activeCourse.id, studentId: activeStudent.id, completedLessonIds: [], quizScores: {}, certificateIssued: false },
    ]);
    addMailLog(activeStudent.email, "Enrollment confirmed", `You are enrolled in "${activeCourse.title}".`);
  };

  const markLessonComplete = () => {
    if (!activeEnrollment || !activeLesson || !activeCourse || !activeStudent) return;
    setEnrollments((prev) =>
      prev.map((e) => {
        if (e.courseId !== activeCourse.id || e.studentId !== activeStudent.id) return e;
        if (e.completedLessonIds.includes(activeLesson.id)) return e;
        return { ...e, completedLessonIds: [...e.completedLessonIds, activeLesson.id] };
      }),
    );
  };

  const submitQuiz = () => {
    if (!activeEnrollment || !activeLesson || !activeCourse || !activeStudent) return;
    if (selectedAnswer === null) return;
    const q = activeLesson.quiz[0];
    const score = selectedAnswer === q.correctIndex ? 100 : 0;
    setEnrollments((prev) =>
      prev.map((e) =>
        e.courseId === activeCourse.id && e.studentId === activeStudent.id
          ? { ...e, quizScores: { ...e.quizScores, [activeLesson.id]: score } }
          : e,
      ),
    );
    setQuizResult(score === 100 ? "Passed (100%)" : "Failed (0%)");
    addMailLog(activeStudent.email, "Quiz submitted", `Quiz result for "${activeLesson.title}": ${score}%.`);
  };

  const issueCertificate = () => {
    if (!activeEnrollment || !activeCourse || !activeStudent) return;
    const totalLessons = activeCourse.lessons.length;
    const doneAll = totalLessons > 0 && activeEnrollment.completedLessonIds.length >= totalLessons;
    const quizScores = Object.values(activeEnrollment.quizScores);
    const avgQuiz = quizScores.length ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length) : 0;
    if (!doneAll || avgQuiz < 70) return;

    setEnrollments((prev) =>
      prev.map((e) =>
        e.courseId === activeCourse.id && e.studentId === activeStudent.id ? { ...e, certificateIssued: true } : e,
      ),
    );
    addMailLog(
      activeStudent.email,
      `Certificate issued: ${activeCourse.title}`,
      `Certificate generated for ${activeStudent.name} with average quiz score ${avgQuiz}%.`,
    );
  };

  const progressPct =
    activeCourse && activeEnrollment && activeCourse.lessons.length > 0
      ? Math.round((activeEnrollment.completedLessonIds.length / activeCourse.lessons.length) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-3xl border border-slate-700 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-200">LearnFlow</p>
          <h1 className="mt-1 text-3xl font-semibold">Online Course Platform with Video, Quizzes, Progress & Certificates</h1>
          <p className="mt-2 text-slate-300">
            Functional LMS flow: create courses, publish lessons, enroll students, complete quizzes, track progress, and issue certificates.
          </p>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Courses" value={dashboard.courses} />
          <StatCard label="Students" value={dashboard.students} />
          <StatCard label="Instructors" value={dashboard.instructors} />
          <StatCard label="Enrollments" value={dashboard.enrollments} />
          <StatCard label="Avg completion" value={`${dashboard.completionPct}%`} />
        </div>

        <div className="mb-6 flex gap-3">
          <button
            type="button"
            onClick={() => setRole("instructor")}
            className={`rounded-xl px-4 py-2 text-sm font-medium ${role === "instructor" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-200"}`}
          >
            Instructor View
          </button>
          <button
            type="button"
            onClick={() => setRole("student")}
            className={`rounded-xl px-4 py-2 text-sm font-medium ${role === "student" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-200"}`}
          >
            Student View
          </button>
        </div>

        {role === "instructor" ? (
          <>
            <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
              <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
              <h2 className="text-xl font-semibold">Create Course</h2>
              <div className="mt-4 space-y-3">
                <input value={newCourseTitle} onChange={(e) => setNewCourseTitle(e.target.value)} placeholder="Course title" className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2" />
                <input value={newCourseCategory} onChange={(e) => setNewCourseCategory(e.target.value)} placeholder="Category" className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2" />
                <select value={newCourseInstructorId} onChange={(e) => setNewCourseInstructorId(e.target.value)} className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2">
                  {instructors.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.specialty})
                    </option>
                  ))}
                </select>
                <textarea value={newCourseDesc} onChange={(e) => setNewCourseDesc(e.target.value)} placeholder="Course description" className="h-24 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2" />
                <button type="button" onClick={createCourse} className="w-full rounded-lg bg-blue-600 px-3 py-2 font-medium hover:bg-blue-500">
                  Save course
                </button>
              </div>
              </section>

              <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
              <h2 className="text-xl font-semibold">Lesson + Quiz Builder</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <select value={courseForLesson} onChange={(e) => setCourseForLesson(e.target.value)} className="rounded-lg border border-slate-600 bg-slate-950 px-3 py-2">
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
                <input type="number" min={1} value={lessonMinutes} onChange={(e) => setLessonMinutes(Number(e.target.value) || 1)} placeholder="Minutes" className="rounded-lg border border-slate-600 bg-slate-950 px-3 py-2" />
                <input value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} placeholder="Lesson title" className="rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 md:col-span-2" />
                <input value={lessonVideoUrl} onChange={(e) => setLessonVideoUrl(e.target.value)} placeholder="Video URL (YouTube/Vimeo)" className="rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 md:col-span-2" />
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-slate-400">Upload lesson video</label>
                  <input type="file" accept="video/*" onChange={onVideoFileSelected} className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2" />
                  {lessonVideoFileName && <p className="mt-1 text-xs text-slate-400">Selected file: {lessonVideoFileName}</p>}
                </div>
                <input value={quizPrompt} onChange={(e) => setQuizPrompt(e.target.value)} placeholder="Quiz question" className="rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 md:col-span-2" />
                <input value={quizOptions} onChange={(e) => setQuizOptions(e.target.value)} placeholder="Options split with |" className="rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 md:col-span-2" />
                <input type="number" min={0} value={quizCorrect} onChange={(e) => setQuizCorrect(Number(e.target.value) || 0)} placeholder="Correct option index" className="rounded-lg border border-slate-600 bg-slate-950 px-3 py-2" />
                <button type="button" onClick={addLesson} className="rounded-lg bg-blue-600 px-3 py-2 font-medium hover:bg-blue-500">
                  Add lesson
                </button>
              </div>
              </section>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
              <h2 className="text-xl font-semibold">Create Student</h2>
              <div className="mt-4 space-y-3">
                <input value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)} placeholder="Student name" className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2" />
                <input value={newStudentEmail} onChange={(e) => setNewStudentEmail(e.target.value)} placeholder="Student email" className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2" />
                <button type="button" onClick={createStudent} className="w-full rounded-lg bg-emerald-600 px-3 py-2 font-medium hover:bg-emerald-500">
                  Save student
                </button>
              </div>
              </section>

              <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
              <h2 className="text-xl font-semibold">Create Instructor</h2>
              <div className="mt-4 space-y-3">
                <input value={newInstructorName} onChange={(e) => setNewInstructorName(e.target.value)} placeholder="Instructor name" className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2" />
                <input value={newInstructorEmail} onChange={(e) => setNewInstructorEmail(e.target.value)} placeholder="Instructor email" className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2" />
                <input value={newInstructorSpecialty} onChange={(e) => setNewInstructorSpecialty(e.target.value)} placeholder="Specialty" className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2" />
                <button type="button" onClick={createInstructor} className="w-full rounded-lg bg-violet-600 px-3 py-2 font-medium hover:bg-violet-500">
                  Save instructor
                </button>
              </div>
              </section>
            </div>
          </>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
            <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
              <h2 className="text-xl font-semibold">Enrollment & Progress</h2>
              <div className="mt-4 space-y-3">
                <select value={activeStudentId} onChange={(e) => setActiveStudentId(e.target.value)} className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2">
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <select value={activeCourseId} onChange={(e) => setActiveCourseId(e.target.value)} className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2">
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={enrollStudent} className="w-full rounded-lg bg-blue-600 px-3 py-2 font-medium hover:bg-blue-500">
                  Enroll student
                </button>

                <div className="rounded-xl border border-slate-700 bg-slate-950 p-3">
                  <p className="text-sm text-slate-300">Progress</p>
                  <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progressPct}%` }} />
                  </div>
                  <p className="mt-2 text-sm text-slate-200">{progressPct}% complete</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
              <h2 className="text-xl font-semibold">Lesson Player + Quiz</h2>
              {activeCourse ? (
                <div className="mt-4 space-y-3">
                  <select value={activeLessonId} onChange={(e) => setActiveLessonId(e.target.value)} className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2">
                    {activeCourse.lessons.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.title} ({l.minutes} min)
                      </option>
                    ))}
                  </select>

                  {activeLesson ? (
                    <>
                      <div className="rounded-xl border border-slate-700 bg-slate-950 p-3">
                        <p className="font-medium">{activeLesson.title}</p>
                        <p className="text-sm text-slate-400">{activeLesson.videoUrl}</p>
                        <video controls className="mt-3 w-full rounded-lg border border-slate-700 bg-black">
                          <source src={activeLesson.videoUrl} />
                        </video>
                      </div>

                      <button type="button" onClick={markLessonComplete} className="rounded-lg bg-emerald-600 px-3 py-2 font-medium hover:bg-emerald-500">
                        Mark lesson complete
                      </button>

                      <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
                        <p className="font-medium">{activeLesson.quiz[0]?.prompt}</p>
                        <div className="mt-2 space-y-2">
                          {activeLesson.quiz[0]?.options.map((opt, idx) => (
                            <label key={opt} className="flex items-center gap-2 text-sm">
                              <input type="radio" checked={selectedAnswer === idx} onChange={() => setSelectedAnswer(idx)} />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                        <button type="button" onClick={submitQuiz} className="mt-3 rounded-lg bg-amber-500 px-3 py-2 font-medium text-slate-950 hover:bg-amber-400">
                          Submit quiz
                        </button>
                        {quizResult && <p className="mt-2 text-sm text-slate-200">{quizResult}</p>}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-slate-400">No lessons in this course yet.</p>
                  )}

                  <button
                    type="button"
                    onClick={issueCertificate}
                    className="rounded-lg bg-violet-600 px-3 py-2 font-medium hover:bg-violet-500"
                  >
                    Generate certificate
                  </button>
                  {activeEnrollment?.certificateIssued && (
                    <p className="text-sm text-emerald-400">
                      Certificate issued for {activeStudent?.name}. Download event logged to Email-to-screen.
                    </p>
                  )}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-400">No course available.</p>
              )}
            </section>
          </div>
        )}

        <section className="mt-6 rounded-2xl border border-slate-700 bg-slate-900 p-5">
          <h2 className="text-xl font-semibold">Email to Screen</h2>
          <p className="text-sm text-slate-400">Enrollment, quiz, and certificate events are printed here as transactional notifications.</p>
          <div className="mt-4 max-h-64 space-y-2 overflow-auto">
            {mailLogs.length === 0 ? (
              <p className="text-sm text-slate-500">No outbound notifications yet.</p>
            ) : (
              mailLogs.map((log) => (
                <div key={log.id} className="rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm">
                  <p className="font-medium text-slate-200">{log.subject}</p>
                  <p className="text-slate-400">To: {log.to}</p>
                  <p className="text-slate-400">{log.body}</p>
                  <p className="mt-1 text-xs text-slate-500">{log.sentAt}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
      <p className="text-xs uppercase tracking-[0.15em] text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-semibold">{value}</p>
    </div>
  );
}
