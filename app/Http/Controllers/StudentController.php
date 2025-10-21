<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Log, Validator};
use App\Models\{Student, Course, Department, AcademicYear};

class StudentController extends Controller
{
    private const VALIDATION_RULES = [
        'full_name' => 'required|string|max:255',
        'email_address' => 'required|email',
        'phone_number' => 'required|string|max:20',
        'sex' => 'required|in:Male,Female',
        'date_of_birth' => 'required|date',
        'address' => 'required|string',
        'department_id' => 'required|exists:departments,department_id',
        'course_id' => 'required|exists:courses,course_id',
        'status' => 'required|in:Active,Inactive,Graduated',
        'academic_year_id' => 'nullable|exists:academic_years,academic_year_id',
    ];
    /**
     * Retrieve students list with optional filters
     */
    public function index(Request $request)
    {
        try {
            $query = Student::with(['department', 'course', 'academicYear'])
                ->whereNull('archived_at');

            // Apply filters dynamically
            $filters = ['search' => 'full_name', 'department_id', 'course_id', 'academic_year_id'];
            
            foreach ($filters as $key => $column) {
                $filterKey = is_numeric($key) ? $column : $key;
                $searchColumn = is_numeric($key) ? $column : $column;
                
                if ($request->filled($filterKey)) {
                    if ($filterKey === 'search') {
                        $query->where($searchColumn, 'like', "%{$request->$filterKey}%");
                    } else {
                        $query->where($searchColumn, $request->$filterKey);
                    }
                }
            }

            $students = $query->orderBy('full_name')->get();

            return response()->json($students);
        } catch (\Exception $e) {
            Log::error('Student index error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to load students'], 500);
        }
    }

    /**
     * Create new student record
     */
    public function store(Request $request)
    {
        try {
            $rules = array_merge(self::VALIDATION_RULES, [
                'email_address' => 'required|email|unique:students,email_address'
            ]);
            
            $validated = $request->validate($rules);

            // Auto-assign academic year if not provided
            if (empty($validated['academic_year_id'])) {
                $academicYear = AcademicYear::whereNull('archived_at')
                    ->orWhereNotNull('academic_year_id')
                    ->first();
                
                if (!$academicYear) {
                    return response()->json([
                        'error' => 'No academic year available. Please create one first.'
                    ], 422);
                }
                
                $validated['academic_year_id'] = $academicYear->academic_year_id;
            }

            $student = Student::create($validated);
            $student->load(['department', 'course', 'academicYear']);

            return response()->json($student, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Student creation error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create student'], 500);
        }
    }

    /**
     * Get single student details
     */
    public function show($id)
    {
        try {
            $student = Student::with(['department', 'course', 'academicYear'])->findOrFail($id);
            return response()->json($student);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Student not found'], 404);
        }
    }

    /**
     * Update existing student
     */
    public function update(Request $request, $id)
    {
        try {
            $student = Student::findOrFail($id);

            $rules = array_merge(self::VALIDATION_RULES, [
                'email_address' => "required|email|unique:students,email_address,{$id},student_id"
            ]);

            $validated = $request->validate($rules);
            $student->update($validated);
            $student->load(['department', 'course', 'academicYear']);

            return response()->json($student);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Student update error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update student'], 500);
        }
    }

    /**
     * Move student to archive
     */
    public function archive($id)
    {
        try {
            $student = Student::findOrFail($id);
            $student->update(['archived_at' => now()]);

            return response()->json(['message' => 'Student archived successfully']);
        } catch (\Exception $e) {
            Log::error('Student archive error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to archive student'], 500);
        }
    }

    /**
     * Restore student from archive
     */
    public function restore($id)
    {
        try {
            $student = Student::findOrFail($id);
            $student->update(['archived_at' => null]);

            return response()->json(['message' => 'Student restored successfully']);
        } catch (\Exception $e) {
            Log::error('Student restore error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to restore student'], 500);
        }
    }
}
