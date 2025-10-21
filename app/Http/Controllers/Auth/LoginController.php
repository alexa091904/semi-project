<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class LoginController extends Controller
{
    /**
     * Show the login form
     */
    public function showLoginForm()
    {
        // If already authenticated, redirect to dashboard
        if (Session::get('authenticated')) {
            return redirect('/dashboard');
        }
        
        return view('dashboard', ['page' => 'login', 'title' => 'Login - Edusync']);
    }

    /**
     * Handle login request
     */
    public function login(Request $request)
    {
        // This will be handled by the API route
        return redirect()->route('login');
    }

    /**
     * Handle logout request
     */
    public function logout(Request $request)
    {
        Session::flush();
        return redirect()->route('login');
    }
}
