<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Department;

class DepartmentController extends Controller
{
    private const VALIDATION_RULES = [
        'department_name' => 'required|string|max:255',
        'department_head' => 'required|string|max:255',
    ];

    public function index()
    {
        return response()->json(
            Department::notArchived()
                ->orderBy('department_head')
                ->get()
        );
    }

    /**
     * Store a newly created department
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate(self::VALIDATION_RULES);
            $department = Department::create($validated);
            return response()->json($department, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Department creation error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create department'], 500);
        }
    }

    public function show($id)
    {
        try {
            return response()->json(Department::findOrFail($id));
        } catch (\Exception $e) {
            return response()->json(['error' => 'Department not found'], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $department = Department::findOrFail($id);
            $validated = $request->validate(self::VALIDATION_RULES);
            $department->update($validated);
            return response()->json($department);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Department update error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update department'], 500);
        }
    }

    public function archive($id)
    {
        try {
            $department = Department::findOrFail($id);
            $department->update(['archived_at' => now()]);
            return response()->json(['message' => 'Department archived successfully']);
        } catch (\Exception $e) {
            Log::error('Department archive error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to archive department'], 500);
        }
    }

    public function restore($id)
    {
        try {
            $department = Department::findOrFail($id);
            $department->update(['archived_at' => null]);
            return response()->json(['message' => 'Department restored successfully']);
        } catch (\Exception $e) {
            Log::error('Department restore error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to restore department'], 500);
        }
    }
}
