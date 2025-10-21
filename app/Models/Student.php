<?php

namespace App\Models;

use Illuminate\Database\Eloquent\{Model, Factories\HasFactory};

class Student extends Model
{
    use HasFactory;

    // Table configuration
    protected $table = 'students';
    protected $primaryKey = 'student_id';
    public $timestamps = true;

    // Mass assignable attributes
    protected $fillable = [
        'full_name',
        'email_address',
        'phone_number',
        'sex',
        'date_of_birth',
        'address',
        'course_id',
        'department_id',
        'academic_year_id',
        'status',
        'archived_at',
    ];

    // Attribute casting
    protected $casts = [
        'date_of_birth' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'archived_at' => 'datetime',
    ];

    // Hidden attributes
    protected $hidden = [];

    /**
     * Relationship: Student belongs to Course
     */
    public function course()
    {
        return $this->belongsTo(Course::class, 'course_id', 'course_id');
    }

    /**
     * Relationship: Student belongs to Department
     */
    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id', 'department_id');
    }

    /**
     * Relationship: Student belongs to Academic Year
     */
    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class, 'academic_year_id', 'academic_year_id');
    }

    /**
     * Scope: Get only active students
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'Active');
    }

    /**
     * Scope: Get non-archived students
     */
    public function scopeNotArchived($query)
    {
        return $query->whereNull('archived_at');
    }
}
