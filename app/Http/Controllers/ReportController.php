<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Faculty;
use App\Models\Course;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ReportController extends Controller
{
    /**
     * Get filter options for reports
     */
    public function index()
    {
        try {
            $courses = Course::whereNull('archived_at')
                ->orderBy('course_name', 'asc')
                ->get(['course_id', 'course_name']);

            $departments = Department::whereNull('archived_at')
                ->orderBy('department_name', 'asc')
                ->get(['department_id', 'department_name', 'department_head']);

            return response()->json([
                'courses' => $courses,
                'departments' => $departments
            ]);
        } catch (\Exception $e) {
            Log::error('Error loading report options: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to load options'], 500);
        }
    }

    /**
     * Generate student report
     */
    public function generateStudentReport(Request $request)
    {
        try {
            $query = Student::with(['course', 'department'])
                ->whereNull('archived_at');

            // Filter by course
            if ($request->has('course_id') && $request->course_id) {
                $query->where('course_id', $request->course_id);
            }

            // Filter by department
            if ($request->has('department_id') && $request->department_id) {
                $query->where('department_id', $request->department_id);
            }

            // Filter by status
            if ($request->has('status') && $request->status) {
                $query->where('status', $request->status);
            }

            $students = $query->orderBy('full_name', 'asc')->get();

            return response()->json([
                'report_type' => 'students',
                'total_records' => $students->count(),
                'generated_at' => now()->toDateTimeString(),
                'filters' => [
                    'course_id' => $request->course_id,
                    'department_id' => $request->department_id,
                    'status' => $request->status
                ],
                'data' => $students
            ]);
        } catch (\Exception $e) {
            Log::error('Error generating student report: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to generate report'], 500);
        }
    }

    /**
     * Generate faculty report
     */
    public function generateFacultyReport(Request $request)
    {
        try {
            $query = Faculty::with(['department'])
                ->whereNull('archived_at');

            // Filter by department
            if ($request->has('department_id') && $request->department_id) {
                $query->where('department_id', $request->department_id);
            }

            // Filter by status
            if ($request->has('status') && $request->status) {
                $query->where('status', $request->status);
            }

            $faculty = $query->orderBy('full_name', 'asc')->get();

            return response()->json([
                'report_type' => 'faculty',
                'total_records' => $faculty->count(),
                'generated_at' => now()->toDateTimeString(),
                'filters' => [
                    'department_id' => $request->department_id,
                    'status' => $request->status
                ],
                'data' => $faculty
            ]);
        } catch (\Exception $e) {
            Log::error('Error generating faculty report: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to generate report'], 500);
        }
    }
}
