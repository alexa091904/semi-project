<?php

namespace App\Models;

use Illuminate\Database\Eloquent\{Model, Factories\HasFactory};

class AcademicYear extends Model
{
    use HasFactory;

    protected $table = 'academic_years';
    protected $primaryKey = 'academic_year_id';
    public $timestamps = true;

    protected $fillable = [
        'start_date',
        'end_date',
        'archived_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'archived_at' => 'datetime',
    ];

    public function students()
    {
        return $this->hasMany(Student::class, 'academic_year_id', 'academic_year_id');
    }

    public function scopeNotArchived($query)
    {
        return $query->whereNull('archived_at');
    }
}
