<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\AcademicYear;

class AcademicYearController extends Controller
{
    private const VALIDATION_RULES = [
        'start_date' => 'required|string|digits:4',
        'end_date' => 'required|string|digits:4',
    ];

    public function index()
    {
        return response()->json(
            AcademicYear::notArchived()
                ->orderBy('start_date', 'desc')
                ->get()
        );
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate(self::VALIDATION_RULES);
            $academicYear = AcademicYear::create($validated);
            return response()->json($academicYear, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Academic year creation error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create academic year'], 500);
        }
    }

    /**
     * Display the specified academic year
     */
    public function show($id)
    {
        try {
            $academicYear = AcademicYear::findOrFail($id);
            return response()->json($academicYear);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Academic year not found'], 404);
        }
    }

    /**
     * Update the specified academic year
     */
    public function update(Request $request, $id)
    {
        try {
            $academicYear = AcademicYear::findOrFail($id);

            $validated = $request->validate([
                'start_date' => 'required|string|digits:4',
                'end_date' => 'required|string|digits:4',
            ]);

            $academicYear->update($validated);

            return response()->json($academicYear);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Error updating academic year: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update academic year'], 500);
        }
    }

    /**
     * Archive the specified academic year
     */
    public function archive($id)
    {
        try {
            AcademicYear::findOrFail($id)->update(['archived_at' => now()]);
            return response()->json(['message' => 'Academic year archived successfully']);
        } catch (\Exception $e) {
            Log::error('Academic year archive error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to archive academic year'], 500);
        }
    }

    public function restore($id)
    {
        try {
            AcademicYear::findOrFail($id)->update(['archived_at' => null]);
            return response()->json(['message' => 'Academic year restored successfully']);
        } catch (\Exception $e) {
            Log::error('Academic year restore error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to restore academic year'], 500);
        }
    }
}
