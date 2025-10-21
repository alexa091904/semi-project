<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\{Student, Faculty, Course, Department};

class DashboardController extends Controller
{
    private const CHART_COLORS = [
        '#4A90E2', '#7B68A6', '#C44E9C', '#50C8E8', 
        '#F39C12', '#E74C3C', '#9B59B6', '#1ABC9C'
    ];

    /**
     * Retrieve dashboard statistics
     */
    public function getStats(Request $request)
    {
        $stats = [
            'totalStudents' => $this->getTotalStudents(),
            'totalFaculty' => $this->getTotalFaculty(),
            'studentsPerCourse' => $this->getStudentsPerCourse(),
            'facultyPerDepartment' => $this->getFacultyPerDepartment()
        ];

        return response()->json(['success' => true, 'data' => $stats]);
    }

    private function getTotalStudents()
    {
        return Student::notArchived()->count();
    }

    private function getTotalFaculty()
    {
        return Faculty::notArchived()->count();
    }

    private function getStudentsPerCourse()
    {
        return Student::notArchived()
            ->select('course_id', DB::raw('count(*) as count'))
            ->groupBy('course_id')
            ->with('course:course_id,course_name')
            ->get()
            ->map(fn($item) => [
                'course' => $item->course->course_name ?? 'Unknown',
                'students' => $item->count
            ]);
    }

    private function getFacultyPerDepartment()
    {
        return Faculty::notArchived()
            ->select('department_id', DB::raw('count(*) as count'))
            ->groupBy('department_id')
            ->with('department:department_id,department_head')
            ->get()
            ->map(fn($item, $index) => [
                'name' => $item->department->department_head ?? 'Unknown',
                'value' => $item->count,
                'color' => self::CHART_COLORS[$index % count(self::CHART_COLORS)]
            ]);
    }
}
