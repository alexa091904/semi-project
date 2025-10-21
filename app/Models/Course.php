<?php

namespace App\Models;

use Illuminate\Database\Eloquent\{Model, Factories\HasFactory};

class Course extends Model
{
    use HasFactory;

    protected $table = 'courses';
    protected $primaryKey = 'course_id';
    public $timestamps = true;

    protected $fillable = [
        'course_name',
        'department_id',
        'archived_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'archived_at' => 'datetime',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id', 'department_id');
    }

    public function students()
    {
        return $this->hasMany(Student::class, 'course_id', 'course_id');
    }

    public function scopeNotArchived($query)
    {
        return $query->whereNull('archived_at');
    }
}
