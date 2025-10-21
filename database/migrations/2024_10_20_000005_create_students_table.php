<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateStudentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id('student_id');
            $table->string('full_name');
            $table->string('email_address')->unique();
            $table->string('phone_number');
            $table->enum('sex', ['Male', 'Female']);
            $table->date('date_of_birth');
            $table->text('address');
            $table->unsignedBigInteger('course_id');
            $table->unsignedBigInteger('department_id');
            $table->unsignedBigInteger('academic_year_id');
            $table->enum('status', ['Active', 'Inactive', 'Graduated'])->default('Active');
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();
            $table->timestamp('archived_at')->nullable();
            
            $table->foreign('course_id')->references('course_id')->on('courses')->onDelete('cascade');
            $table->foreign('department_id')->references('department_id')->on('departments')->onDelete('cascade');
            $table->foreign('academic_year_id')->references('academic_year_id')->on('academic_years')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('students');
    }
}
