<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\{Faculty, Department};

class FacultyController extends Controller
{
    private const VALIDATION_RULES = [
        'full_name' => 'required|string|max:255',
        'email_address' => 'required|email',
        'phone_number' => 'required|string|max:20',
        'sex' => 'required|in:Male,Female',
        'date_of_birth' => 'required|date',
        'address' => 'required|string',
        'department_id' => 'required|exists:departments,department_id',
        'position' => 'required|string',
        'status' => 'required|in:Active,Inactive',
        'hired_date' => 'nullable|date',
    ];

    /**
     * Retrieve faculty list with filters
     */
    public function index(Request $request)
    {
        try {
            $query = Faculty::with(['department'])->whereNull('archived_at');

            // Multi-field search
            if ($request->filled('search')) {
                $searchTerm = $request->search;
                $query->where(function($q) use ($searchTerm) {
                    $q->where('full_name', 'like', "%{$searchTerm}%")
                      ->orWhere('email_address', 'like', "%{$searchTerm}%");
                });
            }

            // Department filter
            if ($request->filled('department_id')) {
                $query->where('department_id', $request->department_id);
            }

            return response()->json($query->orderBy('full_name')->get());
        } catch (\Exception $e) {
            Log::error('Faculty index error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to load faculty'], 500);
        }
    }

    /**
     * Create new faculty member
     */
    public function store(Request $request)
    {
        try {
            $rules = array_merge(self::VALIDATION_RULES, [
                'email_address' => 'required|email|unique:faculty,email_address'
            ]);
            
            $validated = $request->validate($rules);
            $validated['hired_date'] = $validated['hired_date'] ?? now()->toDateString();

            $faculty = Faculty::create($validated);
            $faculty->load(['department']);

            return response()->json($faculty, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Faculty creation error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create faculty'], 500);
        }
    }

    /**
     * Get single faculty details
     */
    public function show($id)
    {
        try {
            $faculty = Faculty::with(['department'])->findOrFail($id);
            return response()->json($faculty);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Faculty not found'], 404);
        }
    }

    /**
     * Update existing faculty member
     */
    public function update(Request $request, $id)
    {
        try {
            $faculty = Faculty::findOrFail($id);

            $rules = array_merge(self::VALIDATION_RULES, [
                'email_address' => "required|email|unique:faculty,email_address,{$id},faculty_id"
            ]);

            $validated = $request->validate($rules);
            $faculty->update($validated);
            $faculty->load(['department']);

            return response()->json($faculty);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Faculty update error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update faculty'], 500);
        }
    }

    /**
     * Move faculty to archive
     */
    public function archive($id)
    {
        try {
            $faculty = Faculty::findOrFail($id);
            $faculty->update(['archived_at' => now()]);

            return response()->json(['message' => 'Faculty archived successfully']);
        } catch (\Exception $e) {
            Log::error('Faculty archive error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to archive faculty'], 500);
        }
    }

    /**
     * Restore faculty from archive
     */
    public function restore($id)
    {
        try {
            $faculty = Faculty::findOrFail($id);
            $faculty->update(['archived_at' => null]);

            return response()->json(['message' => 'Faculty restored successfully']);
        } catch (\Exception $e) {
            Log::error('Faculty restore error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to restore faculty'], 500);
        }
    }
}
