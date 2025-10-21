<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;

class AuthController extends Controller
{
    /**
     * Handle login request
     */
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        // Find admin by username
        $admin = DB::table('admins')
            ->where('username', $request->username)
            ->first();

        // Check if admin exists and password is correct
        if ($admin && Hash::check($request->password, $admin->password)) {
            // Store admin info in session
            Session::put('admin_id', $admin->user_id);
            Session::put('admin_username', $admin->username);
            Session::put('authenticated', true);

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'username' => $admin->username,
                ]
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Invalid username or password'
        ], 401);
    }

    /**
     * Handle logout request
     */
    public function logout(Request $request)
    {
        Session::flush();
        
        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Check if user is authenticated
     */
    public function check(Request $request)
    {
        $authenticated = Session::get('authenticated', false);
        
        return response()->json([
            'authenticated' => $authenticated,
            'username' => Session::get('admin_username')
        ]);
    }
}
