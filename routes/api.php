<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{
    AuthController,
    DashboardController,
    ProfileController,
    StudentController,
    FacultyController,
    CourseController,
    DepartmentController,
    AcademicYearController,
    ReportController,
    ArchiveController
};

/**
 * =============================================================================
 * Authentication & Session Management
 * =============================================================================
 */
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::get('/auth/check', [AuthController::class, 'check']);

/**
 * =============================================================================
 * Dashboard Statistics
 * =============================================================================
 */
Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);

/**
 * =============================================================================
 * User Profile Management
 * =============================================================================
 */
Route::get('/profile', [ProfileController::class, 'getProfile']);
Route::put('/profile', [ProfileController::class, 'updateProfile']);

/**
 * =============================================================================
 * Student Management System
 * =============================================================================
 */
Route::controller(StudentController::class)->prefix('students')->group(function () {
    Route::get('/', 'index');
    Route::post('/', 'store');
    Route::get('/{id}', 'show');
    Route::put('/{id}', 'update');
    Route::post('/{id}/archive', 'archive');
    Route::post('/{id}/restore', 'restore');
});

/**
 * =============================================================================
 * Faculty Management System
 * =============================================================================
 */
Route::controller(FacultyController::class)->prefix('faculty')->group(function () {
    Route::get('/', 'index');
    Route::post('/', 'store');
    Route::get('/{id}', 'show');
    Route::put('/{id}', 'update');
    Route::post('/{id}/archive', 'archive');
    Route::post('/{id}/restore', 'restore');
});

/**
 * =============================================================================
 * Course Management System
 * =============================================================================
 */
Route::controller(CourseController::class)->prefix('courses')->group(function () {
    Route::get('/', 'index');
    Route::post('/', 'store');
    Route::get('/{id}', 'show');
    Route::put('/{id}', 'update');
    Route::post('/{id}/archive', 'archive');
    Route::post('/{id}/restore', 'restore');
});

/**
 * =============================================================================
 * Department Management System
 * =============================================================================
 */
Route::controller(DepartmentController::class)->prefix('departments')->group(function () {
    Route::get('/', 'index');
    Route::post('/', 'store');
    Route::get('/{id}', 'show');
    Route::put('/{id}', 'update');
    Route::post('/{id}/archive', 'archive');
    Route::post('/{id}/restore', 'restore');
});

/**
 * =============================================================================
 * Academic Year Management System
 * =============================================================================
 */
Route::controller(AcademicYearController::class)->prefix('academic-years')->group(function () {
    Route::get('/', 'index');
    Route::post('/', 'store');
    Route::get('/{id}', 'show');
    Route::put('/{id}', 'update');
    Route::post('/{id}/archive', 'archive');
    Route::post('/{id}/restore', 'restore');
});

/**
 * =============================================================================
 * Archive System - View All Archived Items
 * =============================================================================
 */
Route::get('/archived', [ArchiveController::class, 'index']);

/**
 * =============================================================================
 * Reporting System
 * =============================================================================
 */
Route::controller(ReportController::class)->prefix('reports')->group(function () {
    Route::get('/', 'index');
    Route::post('/students', 'generateStudentReport');
    Route::post('/faculty', 'generateFacultyReport');
});
