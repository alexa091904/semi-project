<?php

/*
 | This migration file was added accidentally and duplicates an
 | existing migration that already adds `department_name`.
 | To avoid class redeclaration and allow `php artisan migrate` to
 | run, we return a no-op anonymous migration object so the migrator
 | will use the returned object instead of instantiating a class
 | with the expected name.
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        // no-op: actual column migration exists in 2025_10_20_212901_add_department_name_to_departments_table.php
    }

    public function down()
    {
        // no-op
    }
};
