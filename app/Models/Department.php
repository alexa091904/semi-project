<?php

namespace App\Models;

use Illuminate\Database\Eloquent\{Model, Factories\HasFactory};

class Department extends Model
{
    use HasFactory;

    protected $table = 'departments';
    protected $primaryKey = 'department_id';
    public $timestamps = true;

    protected $fillable = [
        'department_name',
        'department_head',
        'archived_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'archived_at' => 'datetime',
    ];

    public function faculty()
    {
        return $this->hasMany(Faculty::class, 'department_id', 'department_id');
    }

    public function courses()
    {
        return $this->hasMany(Course::class, 'department_id', 'department_id');
    }

    public function students()
    {
        return $this->hasMany(Student::class, 'department_id', 'department_id');
    }

    public function scopeNotArchived($query)
    {
        return $query->whereNull('archived_at');
    }
}
