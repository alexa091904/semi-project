<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\{DB, Session};

class ProfileController extends Controller
{
    /**
     * Retrieve authenticated user profile
     */
    public function getProfile(Request $request)
    {
        $userId = Session::get('admin_id');
        
        if (!$userId) {
            return $this->unauthorizedResponse();
        }

        $user = DB::table('admins')->where('user_id', $userId)->first();

        if (!$user) {
            return $this->notFoundResponse('User not found');
        }

        return response()->json([
            'success' => true,
            'data' => [
                'user_id' => $user->user_id,
                'username' => $user->username,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at
            ]
        ]);
    }

    /**
     * Update authenticated user profile
     */
    public function updateProfile(Request $request)
    {
        $userId = Session::get('admin_id');
        
        if (!$userId) {
            return $this->unauthorizedResponse();
        }

        $validated = $request->validate([
            'username' => 'required|string|max:255',
            'firstname' => 'nullable|string|max:255',
            'lastname' => 'nullable|string|max:255',
        ]);

        $user = DB::table('admins')->where('user_id', $userId)->first();

        if (!$user) {
            return $this->notFoundResponse('User not found');
        }

        // Check username uniqueness
        if ($this->isUsernameTaken($validated['username'], $userId)) {
            return response()->json([
                'success' => false,
                'message' => 'Username already taken'
            ], 422);
        }

        DB::table('admins')
            ->where('user_id', $userId)
            ->update([
                'username' => $validated['username'],
                'updated_at' => now()
            ]);

        // Sync session
        if ($validated['username'] !== $user->username) {
            Session::put('admin_username', $validated['username']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => ['username' => $validated['username']]
        ]);
    }

    private function isUsernameTaken($username, $excludeUserId)
    {
        return DB::table('admins')
            ->where('username', $username)
            ->where('user_id', '!=', $excludeUserId)
            ->exists();
    }

    private function unauthorizedResponse()
    {
        return response()->json([
            'success' => false,
            'message' => 'Not authenticated'
        ], 401);
    }

    private function notFoundResponse($message)
    {
        return response()->json([
            'success' => false,
            'message' => $message
        ], 404);
    }
}
