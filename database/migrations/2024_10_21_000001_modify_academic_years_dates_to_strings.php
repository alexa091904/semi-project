<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class ModifyAcademicYearsDatesToStrings extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // First, drop the existing columns
        Schema::table('academic_years', function (Blueprint $table) {
            $table->dropColumn(['start_date', 'end_date']);
        });
        
        // Then, add them back as strings
        Schema::table('academic_years', function (Blueprint $table) {
            $table->string('start_date', 4)->after('academic_year_id');
            $table->string('end_date', 4)->after('start_date');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('academic_years', function (Blueprint $table) {
            $table->dropColumn(['start_date', 'end_date']);
        });
        
        Schema::table('academic_years', function (Blueprint $table) {
            $table->date('start_date')->after('academic_year_id');
            $table->date('end_date')->after('start_date');
        });
    }
}
