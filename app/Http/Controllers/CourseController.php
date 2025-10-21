<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\{Course, Department};

class CourseController extends Controller
{
    private const VALIDATION_RULES = [
        'course_name' => 'required|string|max:255',
        'department_id' => 'required|exists:departments,department_id',
    ];

    public function index()
    {
        return response()->json(
            Course::with('department')
                ->notArchived()
                ->orderBy('course_name')
                ->get()
        );
    }

    /**
     * Store a newly created course
     */
    public function store(Request $request)
    {
        try {
            $rules = array_merge(self::VALIDATION_RULES, [
                'course_name' => 'required|string|max:255|unique:courses,course_name'
            ]);
            
            $validated = $request->validate($rules);
            $course = Course::create($validated);
            $course->load('department');

            return response()->json($course, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Course creation error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create course'], 500);
        }
    }

    public function show($id)
    {
        try {
            $course = Course::with('department')->findOrFail($id);
            return response()->json($course);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Course not found'], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $course = Course::findOrFail($id);

            $rules = array_merge(self::VALIDATION_RULES, [
                'course_name' => "required|string|max:255|unique:courses,course_name,{$id},course_id"
            ]);

            $validated = $request->validate($rules);
            $course->update($validated);
            $course->load('department');

            return response()->json($course);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Course update error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update course'], 500);
        }
    }

    public function archive($id)
    {
        try {
            $course = Course::findOrFail($id);
            $course->update(['archived_at' => now()]);

            return response()->json(['message' => 'Course archived successfully']);
        } catch (\Exception $e) {
            Log::error('Course archive error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to archive course'], 500);
        }
    }

    public function restore($id)
    {
        try {
            $course = Course::findOrFail($id);
            $course->update(['archived_at' => null]);

            return response()->json(['message' => 'Course restored successfully']);
        } catch (\Exception $e) {
            Log::error('Course restore error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to restore course'], 500);
        }
    }
}
