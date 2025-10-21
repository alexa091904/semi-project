<?php

namespace App\Models;

use Illuminate\Database\Eloquent\{Model, Factories\HasFactory};

class Faculty extends Model
{
    use HasFactory;

    // Table configuration
    protected $table = 'faculty';
    protected $primaryKey = 'faculty_id';
    public $timestamps = true;

    // Mass assignable attributes
    protected $fillable = [
        'full_name',
        'email_address',
        'phone_number',
        'sex',
        'date_of_birth',
        'address',
        'department_id',
        'status',
        'position',
        'hired_date',
        'archived_at',
    ];

    // Attribute casting
    protected $casts = [
        'date_of_birth' => 'date',
        'hired_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'archived_at' => 'datetime',
    ];

    /**
     * Relationship: Faculty belongs to Department
     */
    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id', 'department_id');
    }

    /**
     * Scope: Get only active faculty
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'Active');
    }

    /**
     * Scope: Get non-archived faculty
     */
    public function scopeNotArchived($query)
    {
        return $query->whereNull('archived_at');
    }
}
