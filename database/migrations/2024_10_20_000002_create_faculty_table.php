<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFacultyTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('faculty', function (Blueprint $table) {
            $table->id('faculty_id');
            $table->string('full_name');
            $table->string('email_address')->unique();
            $table->string('phone_number');
            $table->enum('sex', ['Male', 'Female']);
            $table->date('date_of_birth');
            $table->text('address');
            $table->unsignedBigInteger('department_id');
            $table->enum('status', ['Active', 'Inactive'])->default('Active');
            $table->string('position');
            $table->date('hired_date');
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();
            $table->timestamp('archived_at')->nullable();
            
            $table->foreign('department_id')->references('department_id')->on('departments')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('faculty');
    }
}
