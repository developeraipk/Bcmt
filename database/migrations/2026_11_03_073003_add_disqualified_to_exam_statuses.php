<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE examination_results MODIFY COLUMN status ENUM('calculated', 'under_review', 'published', 'disqualified', 'cancelled') NOT NULL DEFAULT 'calculated'");
        DB::statement("ALTER TABLE examination_attempts MODIFY COLUMN status ENUM('in_progress', 'submitted', 'timed_out', 'cancelled', 'disqualified') NOT NULL DEFAULT 'in_progress'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE examination_results MODIFY COLUMN status ENUM('calculated', 'under_review', 'published') NOT NULL DEFAULT 'calculated'");
        DB::statement("ALTER TABLE examination_attempts MODIFY COLUMN status ENUM('in_progress', 'submitted', 'timed_out', 'cancelled') NOT NULL DEFAULT 'in_progress'");
    }
};
