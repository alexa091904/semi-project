<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\{Course, Department, AcademicYear, Student, Faculty};

class ArchiveController extends Controller
{
    /**
     * Get all archived items with filters
     */
    public function index(Request $request)
    {
        try {
            $type = $request->get('type', 'all');
            $search = $request->get('search', '');
            $departmentId = $request->get('department_id', '');
            $courseId = $request->get('course_id', '');
            $academicYearId = $request->get('academic_year_id', '');

            $items = [];

            // Get archived items based on type
            if ($type === 'all' || $type === 'courses') {
                $query = Course::with('department')->whereNotNull('archived_at');
                
                if ($search) {
                    $query->where('course_name', 'like', "%{$search}%");
                }
                if ($departmentId) {
                    $query->where('department_id', $departmentId);
                }

                $courses = $query->get()->map(function($course) {
                    return [
                        '_type' => 'course',
                        '_id' => $course->course_id,
                        '_label' => $course->course_name,
                        '_department' => $course->department->department_head ?? '-',
                        '_course' => null,
                        'archived_at' => $course->archived_at,
                    ];
                });
                $items = array_merge($items, $courses->toArray());
            }

            if ($type === 'all' || $type === 'departments') {
                $query = Department::whereNotNull('archived_at');
                
                if ($search) {
                    $query->where('department_head', 'like', "%{$search}%");
                }

                $departments = $query->get()->map(function($dept) {
                    return [
                        '_type' => 'department',
                        '_id' => $dept->department_id,
                        '_label' => $dept->department_head,
                        '_department' => null,
                        '_course' => null,
                        'archived_at' => $dept->archived_at,
                    ];
                });
                $items = array_merge($items, $departments->toArray());
            }

            if ($type === 'all' || $type === 'academic_years') {
                $query = AcademicYear::whereNotNull('archived_at');
                
                if ($search) {
                    $query->where(function($q) use ($search) {
                        $q->where('start_date', 'like', "%{$search}%")
                          ->orWhere('end_date', 'like', "%{$search}%");
                    });
                }

                $academicYears = $query->get()->map(function($year) {
                    return [
                        '_type' => 'academic_year',
                        '_id' => $year->academic_year_id,
                        '_label' => $year->start_date . ' - ' . $year->end_date,
                        '_department' => null,
                        '_course' => null,
                        'archived_at' => $year->archived_at,
                    ];
                });
                $items = array_merge($items, $academicYears->toArray());
            }

            if ($type === 'all' || $type === 'students') {
                $query = Student::with(['course', 'department'])->whereNotNull('archived_at');
                
                if ($search) {
                    $query->where('full_name', 'like', "%{$search}%");
                }
                if ($departmentId) {
                    $query->where('department_id', $departmentId);
                }
                if ($courseId) {
                    $query->where('course_id', $courseId);
                }
                if ($academicYearId) {
                    $query->where('academic_year_id', $academicYearId);
                }

                $students = $query->get()->map(function($student) {
                    return [
                        '_type' => 'student',
                        '_id' => $student->student_id,
                        '_label' => $student->full_name,
                        '_department' => $student->department->department_head ?? '-',
                        '_course' => $student->course->course_name ?? '-',
                        'archived_at' => $student->archived_at,
                    ];
                });
                $items = array_merge($items, $students->toArray());
            }

            if ($type === 'all' || $type === 'faculty') {
                $query = Faculty::with('department')->whereNotNull('archived_at');
                
                if ($search) {
                    $query->where('full_name', 'like', "%{$search}%");
                }
                if ($departmentId) {
                    $query->where('department_id', $departmentId);
                }

                $faculty = $query->get()->map(function($member) {
                    return [
                        '_type' => 'faculty',
                        '_id' => $member->faculty_id,
                        '_label' => $member->full_name,
                        '_department' => $member->department->department_head ?? '-',
                        '_course' => null,
                        'archived_at' => $member->archived_at,
                    ];
                });
                $items = array_merge($items, $faculty->toArray());
            }

            // Sort by archived_at descending
            usort($items, function($a, $b) {
                return strtotime($b['archived_at']) - strtotime($a['archived_at']);
            });

            return response()->json(['items' => $items]);
        } catch (\Exception $e) {
            Log::error('Error loading archived items: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to load archived items'], 500);
        }
    }
}
